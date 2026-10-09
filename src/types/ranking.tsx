// src/types/ranking.tsx

export type AuthProviderId = "guest" | "google" | "apple" | "facebook";

export interface UserProfile {
  /** ID único. Convidado: "guest_xxx". Login social: ID devolvido pelo servidor. */
  id: string;
  name: string;
  provider: AuthProviderId;
  email?: string;
  avatarUrl?: string;
  /** Token de sessão devolvido pelo servidor (vazio enquanto não há servidor). */
  token?: string;
  createdAt: number;
}

export interface ScoreEntry {
  /** ID gerado no aparelho (evita duplicar o mesmo resultado no servidor). */
  id: string;
  userId: string;
  name: string;
  score: number;
  coins: number;
  gems: number;
  shipId?: string;
  createdAt: number;
  /** true = o servidor já recebeu este resultado. */
  synced: boolean;
}

export interface SubmitScoreInput {
  score: number;
  coins: number;
  gems: number;
  shipId?: string;
}

export interface SubmitScoreResult {
  entry: ScoreEntry;
  /** Posição no ranking local (1 = melhor). */
  localRank: number;
  /** true se bateu o melhor resultado do aparelho. */
  isRecord: boolean;
  /** true se o servidor confirmou o envio. */
  synced: boolean;
}
