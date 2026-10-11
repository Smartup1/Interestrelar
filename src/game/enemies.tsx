// src/game/enemies.tsx
//
// ============================================================
// INIMIGOS
// ============================================================
//
// Funções puras: recebem o inimigo e o contexto e devolvem o
// inimigo atualizado + os tiros que ele deu. Não mexem em React.

import { Enemy, EnemyKind } from "../types/game";

interface KindDef {
  emoji: string;
  size: number;
  hp: number;
  score: number;
  fireEvery: number; // 0 = não atira
}

export const ENEMY_KINDS: Record<EnemyKind, KindDef> = {
  // Voa reto balançando de lado
  scout: { emoji: "👾", size: 34, hp: 1, score: 100, fireEvery: 0 },
  // Entra pela lateral em curva
  swooper: { emoji: "🛸", size: 36, hp: 2, score: 150, fireEvery: 0 },
  // Para no alto e mergulha em cima do jogador
  diver: { emoji: "👽", size: 36, hp: 2, score: 150, fireEvery: 0 },
  // Fica parado atirando na direção do jogador
  gunner: { emoji: "🛰️", size: 42, hp: 5, score: 250, fireEvery: 34 },
  // Grande, atira em leque
  heavy: { emoji: "🐙", size: 58, hp: 14, score: 600, fireEvery: 42 },
};

export interface SpawnOpts {
  x: number;
  y?: number;
  dir?: number;
  phase?: number;
}

export function createEnemy(
  id: number,
  kind: EnemyKind,
  stage: number,
  opts: SpawnOpts,
  W: number
): Enemy {
  const def = ENEMY_KINDS[kind];
  const scale = 1 + 0.2 * (stage - 1);
  const speedScale = Math.min(1.4, 1 + 0.05 * (stage - 1));
  const hp = Math.max(1, Math.ceil(def.hp * scale));
  const fireEvery =
    def.fireEvery > 0
      ? Math.max(
          def.fireEvery * 0.6,
          def.fireEvery * (1 - 0.06 * (stage - 1))
        )
      : 0;

  const e: Enemy = {
    id,
    kind,
    x: opts.x,
    y: -def.size,
    hp,
    maxHp: hp,
    size: def.size,
    emoji: def.emoji,
    age: 0,
    vx: 0,
    vy: 0,
    baseX: opts.x,
    phase: opts.phase ?? 0,
    state: 0,
    fireEvery,
    score: def.score,
    flash: 0,
    dir: opts.dir ?? 1,
  };

  switch (kind) {
    case "scout":
      e.vy = 4.5 * speedScale;
      break;

    case "swooper":
      e.x = e.dir > 0 ? -def.size : W + def.size;
      e.y = opts.y ?? 80;
      e.vx = e.dir * 6.5 * speedScale;
      e.vy = 2.4 * speedScale;
      break;

    case "diver":
      e.vy = 3.2 * speedScale;
      break;

    case "gunner":
      e.vy = 2.6 * speedScale;
      e.phase = opts.y ?? 130; // altura onde fica parado
      break;

    case "heavy":
      e.vy = 1.8 * speedScale;
      e.phase = opts.y ?? 120;
      break;
  }

  return e;
}

export interface EnemyShot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface EnemyCtx {
  W: number;
  H: number;
  px: number;
  py: number;
  stage: number;
}

const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));

function aimed(
  sx: number,
  sy: number,
  px: number,
  py: number,
  speed: number,
  spread = 0
): EnemyShot {
  const dx = px - sx;
  const dy = py - sy;
  const len = Math.hypot(dx, dy) || 1;
  const ang = Math.atan2(dx, dy) + spread; // 0 = para baixo
  return {
    x: sx,
    y: sy,
    vx: Math.sin(ang) * speed,
    vy: Math.cos(ang) * speed,
  };
}

/**
 * Atualiza 1 tick do inimigo.
 * `enemy` volta null quando ele saiu da tela.
 */
export function updateEnemy(
  e: Enemy,
  ctx: EnemyCtx
): { enemy: Enemy | null; shots: EnemyShot[] } {
  const n: Enemy = { ...e, age: e.age + 1, flash: Math.max(0, e.flash - 1) };
  const shots: EnemyShot[] = [];
  const { W, H, px, py, stage } = ctx;
  const half = n.size / 2;

  switch (n.kind) {
    // ---------------------------------------------------- scout
    case "scout": {
      n.y += n.vy;
      n.x = clamp(
        n.baseX + Math.sin(n.age * 0.12 + n.phase) * 40,
        half,
        W - half
      );
      break;
    }

    // -------------------------------------------------- swooper
    case "swooper": {
      n.x += n.vx;
      n.vx -= n.dir * 0.16; // curva e volta
      n.y += n.vy;
      break;
    }

    // ---------------------------------------------------- diver
    case "diver": {
      if (n.state === 0) {
        n.y += n.vy;
        n.x = clamp(n.baseX + Math.sin(n.age * 0.1) * 12, half, W - half);
        if (n.y > 90 + (n.id % 3) * 30) {
          n.state = 1;
          n.phase = 0; // contador de espera
        }
      } else if (n.state === 1) {
        n.phase += 1;
        n.x += Math.sin(n.phase * 2) * 1.5; // treme antes de mergulhar
        if (n.phase >= 14) {
          const speed = 10 + Math.min(stage, 5) * 0.4;
          const dx = px - n.x;
          const dy = py - n.y;
          const len = Math.hypot(dx, dy) || 1;
          n.vx = (dx / len) * speed;
          n.vy = (dy / len) * speed;
          n.state = 2;
        }
      } else {
        n.x += n.vx;
        n.y += n.vy;
      }
      break;
    }

    // ------------------------------------------- gunner / heavy
    case "gunner":
    case "heavy": {
      const hoverY = n.phase;
      const isHeavy = n.kind === "heavy";
      const stayTicks = isHeavy ? 240 : 190;

      if (n.state === 0) {
        n.y += n.vy;
        if (n.y >= hoverY) {
          n.y = hoverY;
          n.state = 1;
          n.age = 0; // conta o tempo parado
        }
      } else if (n.state === 1) {
        n.x = clamp(
          n.baseX + Math.sin(n.age * 0.05) * (isHeavy ? 30 : 55),
          half,
          W - half
        );

        if (n.fireEvery > 0 && n.age > 8 && n.age % Math.round(n.fireEvery) === 0) {
          const sx = n.x;
          const sy = n.y + n.size * 0.4;

          if (isHeavy) {
            [-3, -1.5, 0, 1.5, 3].forEach((vx) =>
              shots.push({ x: sx, y: sy, vx, vy: 6 })
            );
            if (stage >= 3) shots.push(aimed(sx, sy, px, py, 7.5));
          } else if (stage >= 2) {
            [-0.3, 0, 0.3].forEach((sp) =>
              shots.push(aimed(sx, sy, px, py, 7, sp))
            );
          } else {
            shots.push(aimed(sx, sy, px, py, 7));
          }
        }

        if (n.age > stayTicks) {
          n.state = 2;
          n.vy = 3.2;
        }
      } else {
        n.y += n.vy; // vai embora
      }
      break;
    }
  }

  // Saiu da tela?
  if (
    n.y > H + 70 ||
    n.y < -140 ||
    n.x < -140 ||
    n.x > W + 140
  ) {
    return { enemy: null, shots };
  }

  return { enemy: n, shots };
}
