// src/services/auth.tsx
//
// ============================================================
// LOGIN / PERFIL DO JOGADOR
// ============================================================
//
// Funciona sem Provider: é um "store" simples que qualquer tela
// pode ler com o hook useAuth() (src/hooks/useAuth.tsx).
//
// HOJE:  existe o perfil "convidado" (criado automaticamente, salvo
//        no aparelho). O ranking já usa esse perfil.
//
// DEPOIS: ao ligar o login social, o perfil passa a vir do servidor
//        e o ranking global passa a identificar o jogador de verdade.
//
// ------------------------------------------------------------
// COMO LIGAR O LOGIN COM GOOGLE (passo a passo)
// ------------------------------------------------------------
// 1. Google Cloud Console -> crie um projeto -> "Credenciais" ->
//    crie IDs de cliente OAuth: Web, Android e iOS.
//    (Android precisa do SHA-1 do app; iOS do bundle identifier.)
// 2. Cole os IDs em AUTH_CONFIG.GOOGLE (src/config/server.tsx).
// 3. npx expo install expo-auth-session expo-web-browser expo-crypto
// 4. Na tela app/perfil.tsx, use o hook do Google para obter o idToken:
//
//      import * as Google from "expo-auth-session/providers/google";
//      const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
//        webClientId: AUTH_CONFIG.GOOGLE.webClientId,
//        androidClientId: AUTH_CONFIG.GOOGLE.androidClientId,
//        iosClientId: AUTH_CONFIG.GOOGLE.iosClientId,
//      });
//      // quando response?.type === "success":
//      //   await signInWithProviderToken("google", response.params.id_token);
//
// 5. No servidor, a rota POST /auth/google recebe o idToken, VALIDA com
//    a Google e devolve { id, name, email, avatarUrl, token }.
//    (Nunca confie no idToken sem validar no servidor.)
//
// Apple e Facebook seguem o mesmo desenho: o app obtém um token do
// provedor e chama signInWithProviderToken(provider, token).
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  SERVER_CONFIG,
  AUTH_CONFIG,
  isServerConfigured,
} from "../config/server";

import { AuthProviderId, UserProfile } from "../types/ranking";

const USER_KEY = "@interestrelar/user/v1";
const GUEST_KEY = "@interestrelar/guest/v1";

// ------------------------------------------------------------
// STORE (estado global simples)
// ------------------------------------------------------------

let current: UserProfile | null = null;
let loadPromise: Promise<UserProfile> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeUser(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getUser(): UserProfile | null {
  return current;
}

async function persist(user: UserProfile | null) {
  try {
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.warn("Erro ao salvar perfil:", e);
  }
}

function setUser(user: UserProfile) {
  current = user;
  emit();
  void persist(user);
}

// ------------------------------------------------------------
// CONVIDADO
// ------------------------------------------------------------

function randomId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/** O mesmo aparelho mantém o mesmo ID de convidado. */
async function getOrCreateGuest(): Promise<UserProfile> {
  try {
    const stored = await AsyncStorage.getItem(GUEST_KEY);
    if (stored) return JSON.parse(stored) as UserProfile;
  } catch {}

  const guest: UserProfile = {
    id: randomId("guest"),
    name: "Piloto",
    provider: "guest",
    createdAt: Date.now(),
  };

  try {
    await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  } catch {}

  return guest;
}

// ------------------------------------------------------------
// CARREGAR (chamado automaticamente pelo useAuth)
// ------------------------------------------------------------

export function loadUser(): Promise<UserProfile> {
  if (current) return Promise.resolve(current);

  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_KEY);
        if (stored) {
          current = JSON.parse(stored) as UserProfile;
          emit();
          return current;
        }
      } catch {}

      const guest = await getOrCreateGuest();
      setUser(guest);
      return guest;
    })();
  }

  return loadPromise;
}

// ------------------------------------------------------------
// AÇÕES
// ------------------------------------------------------------

/** Troca o nome mostrado no ranking. */
export async function updateName(name: string): Promise<void> {
  const clean = name.trim().slice(0, 16);
  if (!clean) return;

  const user = await loadUser();
  setUser({ ...user, name: clean });

  // Se for convidado, guarda também para sobreviver a "sair da conta"
  if (user.provider === "guest") {
    try {
      await AsyncStorage.setItem(
        GUEST_KEY,
        JSON.stringify({ ...user, name: clean })
      );
    } catch {}
  }
}

/** Disponibilidade de cada método de login (para a tela mostrar). */
export function isProviderConfigured(provider: AuthProviderId): boolean {
  switch (provider) {
    case "guest":
      return true;
    case "google":
      return (
        !!AUTH_CONFIG.GOOGLE.webClientId ||
        !!AUTH_CONFIG.GOOGLE.androidClientId ||
        !!AUTH_CONFIG.GOOGLE.iosClientId
      );
    case "apple":
      return AUTH_CONFIG.APPLE.enabled;
    case "facebook":
      return !!AUTH_CONFIG.FACEBOOK.appId;
    default:
      return false;
  }
}

/**
 * Conclui o login com Google/Apple/Facebook.
 * `token` = idToken que o app obteve do provedor.
 *
 * Com servidor: troca o token por um perfil validado.
 * Sem servidor: lança erro (não dá para validar o token sozinho).
 */
export async function signInWithProviderToken(
  provider: Exclude<AuthProviderId, "guest">,
  token: string
): Promise<UserProfile> {
  if (!isServerConfigured()) {
    throw new Error(
      "SERVER_NOT_CONFIGURED: configure SERVER_CONFIG.API_URL para entrar com " +
        provider
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_CONFIG.TIMEOUT_MS);

  try {
    const res = await fetch(`${SERVER_CONFIG.API_URL}/auth/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: SERVER_CONFIG.GAME_ID, token }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`AUTH_FAILED: servidor respondeu ${res.status}`);
    }

    const data = await res.json();

    const user: UserProfile = {
      id: String(data.id),
      name: String(data.name || "Piloto"),
      provider,
      email: data.email,
      avatarUrl: data.avatarUrl,
      token: data.token,
      createdAt: Date.now(),
    };

    setUser(user);
    return user;
  } finally {
    clearTimeout(timer);
  }
}

/** Sai da conta e volta para o perfil de convidado deste aparelho. */
export async function signOut(): Promise<void> {
  await persist(null);
  current = null;
  loadPromise = null;
  const guest = await getOrCreateGuest();
  setUser(guest);
}
