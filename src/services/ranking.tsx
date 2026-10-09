// src/services/ranking.tsx
//
// ============================================================
// RANKING
// ============================================================
//
// LOCAL  : os melhores resultados ficam salvos no aparelho.
// GLOBAL : quando SERVER_CONFIG.API_URL estiver preenchido, cada
//          resultado também é enviado ao servidor. Se estiver sem
//          internet, o resultado fica "pendente" e é reenviado
//          depois por syncPendingScores().
//
// ------------------------------------------------------------
// CONTRATO ESPERADO DO SERVIDOR
// ------------------------------------------------------------
//
// POST {API_URL}/scores
//   Header: Authorization: Bearer <token>   (se o jogador tiver login)
//   Body:   { gameId, clientScoreId, userId, name, score, coins,
//             gems, shipId, createdAt }
//   Resp:   201 (ou 200 se clientScoreId já existir - idempotente)
//
// GET {API_URL}/scores?gameId=interestrelar&limit=50
//   Resp:   200 [{ id, userId, name, score, coins, gems, shipId, createdAt }]
//           (já ordenado do maior para o menor)
//
// ATENÇÃO: o score vem do aparelho e pode ser falsificado. Para um
// ranking confiável, o servidor deve validar (limites razoáveis,
// taxa de envio, token do usuário, etc.).
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";

import { SERVER_CONFIG, isServerConfigured } from "../config/server";
import { loadUser } from "./auth";

import {
  ScoreEntry,
  SubmitScoreInput,
  SubmitScoreResult,
} from "../types/ranking";

const LOCAL_KEY = "@interestrelar/ranking/v1";
const MAX_LOCAL_ENTRIES = 100;

// ------------------------------------------------------------
// ARMAZENAMENTO LOCAL
// ------------------------------------------------------------

function sortEntries(list: ScoreEntry[]): ScoreEntry[] {
  return [...list].sort(
    (a, b) => b.score - a.score || a.createdAt - b.createdAt
  );
}

async function readLocal(): Promise<ScoreEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeLocal(list: ScoreEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      LOCAL_KEY,
      JSON.stringify(sortEntries(list).slice(0, MAX_LOCAL_ENTRIES))
    );
  } catch (e) {
    console.warn("Erro ao salvar ranking:", e);
  }
}

export async function getLocalRanking(limit = 50): Promise<ScoreEntry[]> {
  return sortEntries(await readLocal()).slice(0, limit);
}

export async function getBestLocalScore(): Promise<number> {
  const list = await getLocalRanking(1);
  return list[0]?.score ?? 0;
}

// ------------------------------------------------------------
// SERVIDOR
// ------------------------------------------------------------

async function request(
  path: string,
  init: RequestInit,
  token?: string
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_CONFIG.TIMEOUT_MS);

  try {
    return await fetch(`${SERVER_CONFIG.API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function sendToServer(
  entry: ScoreEntry,
  token?: string
): Promise<boolean> {
  if (!isServerConfigured()) return false;

  try {
    const res = await request(
      "/scores",
      {
        method: "POST",
        body: JSON.stringify({
          gameId: SERVER_CONFIG.GAME_ID,
          clientScoreId: entry.id,
          userId: entry.userId,
          name: entry.name,
          score: entry.score,
          coins: entry.coins,
          gems: entry.gems,
          shipId: entry.shipId,
          createdAt: entry.createdAt,
        }),
      },
      token
    );
    return res.ok;
  } catch {
    return false; // sem internet / servidor fora do ar
  }
}

/**
 * Ranking mundial.
 * Devolve `null` se ainda não há servidor configurado.
 * Lança erro se o servidor estiver configurado mas não responder.
 */
export async function getGlobalRanking(
  limit = SERVER_CONFIG.RANKING_LIMIT
): Promise<ScoreEntry[] | null> {
  if (!isServerConfigured()) return null;

  const user = await loadUser();

  const res = await request(
    `/scores?gameId=${encodeURIComponent(
      SERVER_CONFIG.GAME_ID
    )}&limit=${limit}`,
    { method: "GET" },
    user.token
  );

  if (!res.ok) {
    throw new Error(`Servidor respondeu ${res.status}`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : [];

  return list.map(
    (item: any): ScoreEntry => ({
      id: String(item.id),
      userId: String(item.userId ?? ""),
      name: String(item.name ?? "Piloto"),
      score: Number(item.score) || 0,
      coins: Number(item.coins) || 0,
      gems: Number(item.gems) || 0,
      shipId: item.shipId,
      createdAt: Number(item.createdAt) || 0,
      synced: true,
    })
  );
}

// ------------------------------------------------------------
// ENVIAR RESULTADO (chamado no fim de cada partida)
// ------------------------------------------------------------

export async function submitScore(
  input: SubmitScoreInput
): Promise<SubmitScoreResult | null> {
  if (!Number.isFinite(input.score) || input.score <= 0) return null;

  const user = await loadUser();
  const before = await readLocal();
  const previousBest = sortEntries(before)[0]?.score ?? 0;

  const entry: ScoreEntry = {
    id: `${user.id}_${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    userId: user.id,
    name: user.name,
    score: Math.floor(input.score),
    coins: Math.floor(input.coins),
    gems: Math.floor(input.gems),
    shipId: input.shipId,
    createdAt: Date.now(),
    synced: false,
  };

  // 1) Salva no aparelho primeiro (sempre, mesmo sem internet)
  const all = [...before, entry];
  await writeLocal(all);

  // 2) Tenta enviar ao servidor; se conseguir, marca como enviado
  const synced = await sendToServer(entry, user.token);
  if (synced) {
    entry.synced = true;
    await writeLocal(all);
  }

  const sorted = sortEntries(all);
  const localRank = sorted.findIndex((e) => e.id === entry.id) + 1;

  return {
    entry,
    localRank,
    isRecord: entry.score > previousBest,
    synced,
  };
}

/** Reenvia ao servidor os resultados que ficaram pendentes. */
export async function syncPendingScores(): Promise<number> {
  if (!isServerConfigured()) return 0;

  const user = await loadUser();
  const list = await readLocal();
  let sent = 0;

  for (const entry of list) {
    if (entry.synced) continue;
    // só reenvia resultados deste jogador
    if (entry.userId !== user.id) continue;

    if (await sendToServer(entry, user.token)) {
      entry.synced = true;
      sent++;
    }
  }

  if (sent > 0) await writeLocal(list);
  return sent;
}

export async function clearLocalRanking(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCAL_KEY);
  } catch {}
}
