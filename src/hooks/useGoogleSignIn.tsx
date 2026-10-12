// src/hooks/useGoogleSignIn.tsx
//
// Fluxo "Entrar com Google" (expo-auth-session).
// Só funciona em build de verdade (EAS/APK) com os IDs preenchidos em
// AUTH_CONFIG.GOOGLE (src/config/server.tsx). No Expo Go não funciona.

import { useCallback, useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

import { AUTH_CONFIG } from "../config/server";
import { signInWithProviderToken } from "../services/auth";

WebBrowser.maybeCompleteAuthSession();

// O hook do Google LANÇA ERRO se algum ID estiver vazio. Sem IDs, usamos um
// valor "fantasma" só para o hook não quebrar — o botão fica escondido
// enquanto isProviderConfigured("google") for falso.
const PLACEHOLDER = "nao-configurado";

export function useGoogleSignIn(onDone?: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: AUTH_CONFIG.GOOGLE.webClientId || PLACEHOLDER,
    androidClientId: AUTH_CONFIG.GOOGLE.androidClientId || PLACEHOLDER,
    iosClientId: AUTH_CONFIG.GOOGLE.iosClientId || PLACEHOLDER,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const idToken =
        response.params?.id_token ?? response.authentication?.idToken;

      if (!idToken) {
        setError("O Google não devolveu o token de login.");
        setBusy(false);
        return;
      }

      signInWithProviderToken("google", idToken)
        .then(() => onDone?.())
        .catch((e) => {
          console.warn("Login Google falhou:", e);
          setError("Não foi possível entrar. Tente de novo em instantes.");
        })
        .finally(() => setBusy(false));
    } else {
      // cancelou ou falhou
      if (response.type === "error") {
        setError("Não foi possível abrir o login do Google.");
      }
      setBusy(false);
    }
  }, [response]);

  const signIn = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      await promptAsync();
    } catch {
      setError("Não foi possível abrir o login do Google.");
      setBusy(false);
    }
  }, [promptAsync]);

  return { signIn, busy, error, ready: !!request };
}
