// src/game/stages.tsx
//
// ============================================================
// ROTEIRO DAS FASES
// ============================================================
//
// Cada fase é uma lista de passos no tempo (em ticks):
//   - "spawn":   um inimigo entra
//   - "midboss": mini-chefe no meio da fase
//   - "boss":    chefão no final
//
// O roteiro é sempre o MESMO para a mesma fase (aleatoriedade
// com semente), então dá para aprender as ondas.

import { EnemyKind } from "../types/game";

export type StepType = "spawn" | "midboss" | "boss";

export interface ScriptStep {
  at: number;
  type: StepType;
  kind?: EnemyKind;
  x?: number;
  y?: number;
  dir?: number;
  phase?: number;
}

/** Cores de cada fase (sobre o fundo do espaço). */
export const STAGE_TINTS = [
  "rgba(0,70,170,0.10)",
  "rgba(120,0,170,0.14)",
  "rgba(170,20,20,0.14)",
  "rgba(0,150,100,0.12)",
  "rgba(200,120,0,0.12)",
];

export function stageTint(stage: number): string {
  return STAGE_TINTS[(stage - 1) % STAGE_TINTS.length];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildStageScript(stage: number, W: number): ScriptStep[] {
  const rng = mulberry32(stage * 7919 + 13);
  const steps: ScriptStep[] = [];

  const d = Math.min(stage - 1, 6);
  const gap = Math.max(28, 48 - d * 3);
  const margin = 36;
  const xs = (f: number) => margin + f * (W - margin * 2);

  let t = 10;

  type Wave =
    | "line"
    | "vee"
    | "column"
    | "sweep"
    | "gunner"
    | "dive"
    | "heavy";

  const pickWave = (i: number): Wave => {
    const pool: Wave[] = ["line", "vee", "column", "sweep"];
    if (i >= 2 || stage >= 2) pool.push("gunner");
    if (i >= 4 || stage >= 2) pool.push("dive");
    if (i >= 7 || stage >= 2) pool.push("heavy");
    if (stage >= 3) pool.push("dive", "sweep", "gunner");
    return pool[Math.floor(rng() * pool.length)];
  };

  const addWave = (kind: Wave, at: number) => {
    const n = 3 + (stage > 1 ? 1 : 0) + Math.floor(rng() * 2);

    switch (kind) {
      case "line": {
        for (let i = 0; i < n; i++) {
          steps.push({
            at,
            type: "spawn",
            kind: "scout",
            x: xs((i + 1) / (n + 1)),
            phase: i,
          });
        }
        break;
      }
      case "vee": {
        const k = Math.floor(n / 2);
        for (let i = -k; i <= k; i++) {
          steps.push({
            at: at + Math.abs(i) * 7,
            type: "spawn",
            kind: "scout",
            x: xs(0.5) + i * 48,
            phase: i,
          });
        }
        break;
      }
      case "column": {
        const fx = 0.2 + rng() * 0.6;
        for (let i = 0; i < n + 1; i++) {
          steps.push({
            at: at + i * 8,
            type: "spawn",
            kind: "scout",
            x: xs(fx),
            phase: 0,
          });
        }
        break;
      }
      case "sweep": {
        const dir = rng() < 0.5 ? 1 : -1;
        for (let i = 0; i < n; i++) {
          steps.push({
            at: at + i * 10,
            type: "spawn",
            kind: "swooper",
            x: 0,
            y: 70 + i * 6,
            dir,
          });
        }
        break;
      }
      case "gunner": {
        const pair = stage >= 2 || rng() < 0.4;
        steps.push({
          at,
          type: "spawn",
          kind: "gunner",
          x: xs(pair ? 0.28 : 0.2 + rng() * 0.6),
          y: 120 + Math.floor(rng() * 3) * 30,
        });
        if (pair) {
          steps.push({
            at: at + 6,
            type: "spawn",
            kind: "gunner",
            x: xs(0.72),
            y: 150,
          });
        }
        break;
      }
      case "dive": {
        const m = 2 + (stage > 1 ? 1 : 0);
        for (let i = 0; i < m; i++) {
          steps.push({
            at: at + i * 12,
            type: "spawn",
            kind: "diver",
            x: xs(0.15 + rng() * 0.7),
          });
        }
        break;
      }
      case "heavy": {
        steps.push({
          at,
          type: "spawn",
          kind: "heavy",
          x: xs(0.3 + rng() * 0.4),
          y: 120,
        });
        break;
      }
    }
  };

  const wavesA = 7 + Math.min(stage, 4);
  const wavesB = 6 + Math.min(stage, 4);

  for (let i = 0; i < wavesA; i++) {
    addWave(pickWave(i), t);
    t += gap;
  }

  // Mini-chefe no meio da fase
  t += 20;
  steps.push({ at: t, type: "midboss" });
  t += 30;

  for (let i = 0; i < wavesB; i++) {
    addWave(pickWave(i + wavesA), t);
    t += gap;
  }

  // Chefão no fim
  t += 30;
  steps.push({ at: t, type: "boss" });

  return steps.sort((a, b) => a.at - b.at);
}
