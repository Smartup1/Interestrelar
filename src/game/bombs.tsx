import { GAME_CONFIG } from "../constants/gameConfig";

// ============================================================
// BOMBA DE CADA NAVE
//
// Cada nave tem uma bomba com efeito próprio. Os valores base vêm
// de GAME_CONFIG (BOMB_*); aqui só multiplicamos.
// ============================================================

export interface BombProfile {
  name: string;
  /** cor do clarão da tela */
  color: string;
  /** dano em cada inimigo */
  enemyDamage: number;
  /** dano no chefão (fração da vida máxima) */
  bossPct: number;
  /** apaga os tiros inimigos */
  clearBullets: boolean;
  /** destrói os obstáculos (asteroides) */
  clearObstacles: boolean;
  /** invulnerabilidade depois da bomba (ticks) */
  invulnTicks: number;
  /** pontos por tiro/obstáculo apagado */
  pointsPerClear: number;
  /** se > 0, só atinge o que estiver numa faixa vertical desse tamanho
   *  (metade da largura, px) em volta da nave */
  laneHalfWidth: number;
  /** se existir, a bomba é um LASER: um feixe que fica ligado na frente da
   *  nave por alguns segundos, causando dano a cada instante */
  laser?: LaserSpec;
}

export interface LaserSpec {
  /** metade da largura do feixe (px) */
  halfWidth: number;
  /** quanto tempo fica ligado (ticks do jogo, 1 tick ≈ 60ms) */
  durationTicks: number;
  /** dano por tick em cada inimigo atingido */
  enemyDmgPerTick: number;
  /** cor do núcleo do feixe */
  coreColor: string;
}

const base = {
  enemyDamage: GAME_CONFIG.BOMB_ENEMY_DAMAGE,
  bossPct: GAME_CONFIG.BOMB_BOSS_DAMAGE_PCT,
  invulnTicks: GAME_CONFIG.BOMB_INVULN_TICKS,
};

export const BOMB_PROFILES: Record<string, BombProfile> = {
  // 🚀 Explorer: a bomba "padrão" equilibrada
  explorer: {
    name: "NOVA",
    color: "#ffffff",
    ...base,
    clearBullets: true,
    clearObstacles: true,
    pointsPerClear: 0,
    laneHalfWidth: 0,
  },

  // 🛸 Shadow: relâmpago que mata tudo que é pequeno, fraco no chefão
  shadow: {
    name: "RELÂMPAGO",
    color: "#ffee58",
    enemyDamage: 99,
    bossPct: base.bossPct * 0.5,
    invulnTicks: Math.round(base.invulnTicks * 0.7),
    clearBullets: true,
    clearObstacles: true,
    pointsPerClear: 0,
    laneHalfWidth: 0,
  },

  // ☄️ Titan: MEGA LASER - feixe largo que arrasa o chefão
  titan: {
    name: "MEGA LASER",
    color: "#ff7043",
    enemyDamage: base.enemyDamage,
    bossPct: base.bossPct * 2.5,
    invulnTicks: Math.round(base.invulnTicks * 0.5),
    clearBullets: false,
    clearObstacles: true,
    pointsPerClear: 0,
    laneHalfWidth: 0,
    laser: {
      halfWidth: 46,
      durationTicks: 44,
      enemyDmgPerTick: 4,
      coreColor: "#fff3e0",
    },
  },

  // 👾 Phantom: pulso que te deixa invulnerável por muito mais tempo
  phantom: {
    name: "PULSO FANTASMA",
    color: "#b388ff",
    enemyDamage: Math.round(base.enemyDamage * 0.6),
    bossPct: base.bossPct * 0.6,
    invulnTicks: base.invulnTicks * 3,
    clearBullets: true,
    clearObstacles: true,
    pointsPerClear: 0,
    laneHalfWidth: 0,
  },

  // 🌌 Nebula: LASER - feixe fino e longo, estilo Aero Fighters
  nebula: {
    name: "LASER",
    color: "#f48fb1",
    enemyDamage: 99,
    bossPct: base.bossPct * 1.8,
    invulnTicks: base.invulnTicks,
    clearBullets: true,
    clearObstacles: true,
    pointsPerClear: 0,
    laneHalfWidth: 80,
    laser: {
      halfWidth: 26,
      durationTicks: 36,
      enemyDmgPerTick: 3,
      coreColor: "#ffffff",
    },
  },

  // ✨ Aurora: transforma tiros e asteroides apagados em pontos
  aurora: {
    name: "AURORA",
    color: "#4dd0e1",
    ...base,
    clearBullets: true,
    clearObstacles: true,
    pointsPerClear: 10,
    laneHalfWidth: 0,
  },

  // 🟣 Special: laser roxo exclusivo desta nave
  special: {
    name: "LASER ROXO",
    color: "#9c27b0",
    enemyDamage: base.enemyDamage,
    bossPct: base.bossPct * 1.8,
    invulnTicks: base.invulnTicks,
    clearBullets: true,
    clearObstacles: true,
    pointsPerClear: 0,
    laneHalfWidth: 80,
    laser: {
      halfWidth: 30,
      durationTicks: 40,
      enemyDmgPerTick: 4,
      coreColor: "#f3e5f5",
    },
  },

  // 🌟 Special Ouro: laser dourado exclusivo desta nave
  "special-ouro": {
    name: "LASER DOURADO",
    color: "#ffb300",
    enemyDamage: base.enemyDamage,
    bossPct: base.bossPct * 2,
    invulnTicks: base.invulnTicks,
    clearBullets: true,
    clearObstacles: true,
    pointsPerClear: 0,
    laneHalfWidth: 90,
    laser: {
      halfWidth: 36,
      durationTicks: 44,
      enemyDmgPerTick: 5,
      coreColor: "#fff8e1",
    },
  },
};

export function getBombProfile(shipId?: string): BombProfile {
  return (shipId && BOMB_PROFILES[shipId]) || BOMB_PROFILES.explorer;
}

// ============================================================
// ATAQUE ESPECIAL DE CADA CHEFÃO ("bomba do chefão")
//
// Cada chefão (pelo nível/emoji) solta um padrão diferente de tiros.
// ============================================================

export interface BossShot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const BOSS_SPECIAL_NAMES = [
  "CHUVA",      // 🛸
  "ESPIRAL",    // 👾
  "TENTÁCULOS", // 🐙
  "METEOROS",   // 👹
  "CRUZ",       // 💀
];

export function bossSpecial(
  level: number,
  sx: number,
  sy: number,
  W: number,
  px: number,
  py: number,
  n: number
): { name: string; shots: BossShot[] } {
  const kind = (level - 1) % 5;
  const shots: BossShot[] = [];

  if (kind === 0) {
    // Chuva: linha de tiros por toda a largura, com um buraco onde está o jogador
    const cols = 9;
    const gap = Math.round((px / W) * (cols - 1));
    for (let i = 0; i < cols; i++) {
      if (Math.abs(i - gap) <= 1) continue;
      shots.push({ x: ((i + 0.5) / cols) * W, y: sy, vx: 0, vy: 4.2 });
    }
  } else if (kind === 1) {
    // Espiral: anel girando
    for (let k = 0; k < 14; k++) {
      const ang = (k / 14) * Math.PI * 2 + n * 0.5;
      shots.push({ x: sx, y: sy, vx: Math.sin(ang) * 4.6, vy: Math.cos(ang) * 4.6 });
    }
  } else if (kind === 2) {
    // Tentáculos: dois anéis de velocidades diferentes
    for (let k = 0; k < 8; k++) {
      const a1 = (k / 8) * Math.PI * 2;
      const a2 = a1 + Math.PI / 8;
      shots.push({ x: sx, y: sy, vx: Math.sin(a1) * 3.6, vy: Math.cos(a1) * 3.6 });
      shots.push({ x: sx, y: sy, vx: Math.sin(a2) * 6, vy: Math.cos(a2) * 6 });
    }
  } else if (kind === 3) {
    // Meteoros: 5 tiros rápidos mirados no jogador
    const dx = px - sx;
    const dy = py - sy;
    const len = Math.hypot(dx, dy) || 1;
    for (let i = -2; i <= 2; i++) {
      shots.push({
        x: sx,
        y: sy,
        vx: (dx / len) * 8.5 + i * 1.3,
        vy: (dy / len) * 8.5,
      });
    }
  } else {
    // Cruz: 8 direções, em 2 camadas
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * Math.PI * 2 + (n % 2 ? Math.PI / 8 : 0);
      shots.push({ x: sx, y: sy, vx: Math.sin(ang) * 4.2, vy: Math.cos(ang) * 4.2 });
      shots.push({ x: sx, y: sy, vx: Math.sin(ang) * 6.4, vy: Math.cos(ang) * 6.4 });
    }
  }

  // Só os que descem (vy > 0) ou saem de lado importam; o resto sai da tela sozinho
  return { name: BOSS_SPECIAL_NAMES[kind], shots };
}
