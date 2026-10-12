// src/config/server.tsx
//
// ============================================================
// CONFIGURAÇÃO DO SERVIDOR E DO LOGIN
// ============================================================
//
// Enquanto API_URL estiver vazio o jogo funciona 100% offline:
//  - o ranking fica só no aparelho ("LOCAL");
//  - o perfil é "convidado".
//
// Quando o servidor existir, basta preencher aqui.

export const SERVER_CONFIG = {
  /** Endereço base da API. Ex.: "https://api.seujogo.com". Vazio = sem servidor. */
  API_URL: "",

  /** Identifica este jogo no servidor (útil se houver mais de um jogo). */
  GAME_ID: "interestrelar",

  /** Tempo máximo de espera por uma resposta do servidor. */
  TIMEOUT_MS: 8000,

  /** Quantos resultados mostrar no ranking. */
  RANKING_LIMIT: 50,
};

// ============================================================
// LOGIN SOCIAL
// ============================================================
//
// Preencha os IDs quando criar os apps nos painéis de cada serviço.
// (O passo a passo do Google está em src/services/auth.tsx.)

export const AUTH_CONFIG = {
  GOOGLE: {
    webClientId: "",
    androidClientId: "",
    iosClientId: "",
  },
  APPLE: {
    enabled: false,
  },
  FACEBOOK: {
    appId: "",
  },
};

export const isServerConfigured = (): boolean =>
  SERVER_CONFIG.API_URL.trim().length > 0;

// ============================================================
// LINKS PÚBLICOS (exigidos pela Play Store)
// ============================================================
//
// A Play Store exige uma URL pública da Política de Privacidade.
// O arquivo docs/politica-de-privacidade.html já está pronto: ative o
// GitHub Pages (Settings -> Pages -> branch main, pasta /docs) e confira
// se o endereço abaixo abre. Troque aqui se usar outro endereço.

export const PRIVACY_URL =
  "https://smartup1.github.io/Interestrelar/politica-de-privacidade.html";
