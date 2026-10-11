// src/game/weapons.tsx
//
// ============================================================
// ARMAS (uma por nave, estilo Aero Fighters)
// ============================================================
//
// Cada nave tem um jeito de atirar. Os "patterns" têm 5 níveis
// (o item "P" sobe o nível). Cada tiro do padrão é:
//   [deslocamento X em px a partir do centro da nave,
//    velocidade lateral,
//    1 = este tiro é teleguiado (opcional)]

export type ShotSpec = [number, number, number?];

export interface WeaponProfile {
  id: string;
  name: string;
  description: string;
  /** intervalo entre tiros, em ticks do jogo (1 tick ≈ 60ms) */
  cooldown: number;
  /** velocidade do tiro (px por tick) */
  speed: number;
  damage: number;
  color: string;
  w: number;
  h: number;
  homing: boolean;
  pierce: boolean;
  patterns: ShotSpec[][];
}

export const WEAPONS: Record<string, WeaponProfile> = {
  // Explorer: equilibrada
  balanced: {
    id: "balanced",
    name: "Equilibrada",
    description: "Tiro duplo que vira leque.",
    cooldown: 3,
    speed: 20,
    damage: 1,
    color: "#00eeff",
    w: 7,
    h: 15,
    homing: false,
    pierce: false,
    patterns: [
      [[-7, 0], [7, 0]],
      [[0, 0], [-10, -1.8], [10, 1.8]],
      [[-7, 0], [7, 0], [-14, -2.5], [14, 2.5]],
      [[0, 0], [-9, -1.5], [9, 1.5], [-16, -3.5], [16, 3.5]],
      [[-6, 0], [6, 0], [-12, -1.8], [12, 1.8], [-18, -3.8], [18, 3.8]],
    ],
  },

  // Shadow: cadência alta
  rapid: {
    id: "rapid",
    name: "Rápida",
    description: "Dispara muito mais rápido.",
    cooldown: 2,
    speed: 28,
    damage: 1,
    color: "#ff5d5d",
    w: 5,
    h: 16,
    homing: false,
    pierce: false,
    patterns: [
      [[-5, 0], [5, 0]],
      [[0, 0], [-8, 0], [8, 0]],
      [[-4, 0], [4, 0], [-12, 0], [12, 0]],
      [[-4, 0], [4, 0], [-12, -0.6], [12, 0.6]],
      [[0, 0], [-6, 0], [6, 0], [-14, -0.8], [14, 0.8]],
    ],
  },

  // Titan: lento, mas cada tiro causa dano dobro
  heavy: {
    id: "heavy",
    name: "Pesada",
    description: "Tiros lentos com dano dobrado.",
    cooldown: 4,
    speed: 17,
    damage: 2,
    color: "#7dff6a",
    w: 10,
    h: 18,
    homing: false,
    pierce: false,
    patterns: [
      [[-9, 0], [9, 0]],
      [[0, 0], [-14, -1.2], [14, 1.2]],
      [[-9, 0], [9, 0], [-20, -2], [20, 2]],
      [[0, 0], [-10, -1.5], [10, 1.5], [-20, -3], [20, 3]],
      [[-8, 0], [8, 0], [-16, -1.5], [16, 1.5], [-26, -3.5], [26, 3.5]],
    ],
  },

  // Phantom: mísseis teleguiados
  homing: {
    id: "homing",
    name: "Teleguiada",
    description: "Mísseis que perseguem os inimigos.",
    cooldown: 4,
    speed: 15,
    damage: 1,
    color: "#c77dff",
    w: 8,
    h: 14,
    homing: true,
    pierce: false,
    patterns: [
      [[-8, -1], [8, 1]],
      [[-8, -2], [8, 2], [0, 0]],
      [[-8, -2], [8, 2], [-16, -4], [16, 4]],
      [[-8, -2], [8, 2], [-16, -4], [16, 4], [0, 0]],
      [[-8, -2], [8, 2], [-16, -4], [16, 4], [-24, -6], [24, 6]],
    ],
  },

  // Nebula: laser que atravessa os inimigos
  pierce: {
    id: "pierce",
    name: "Perfurante",
    description: "Laser que atravessa tudo.",
    cooldown: 4,
    speed: 26,
    damage: 1,
    color: "#ff7ad9",
    w: 6,
    h: 30,
    homing: false,
    pierce: true,
    patterns: [
      [[0, 0]],
      [[-7, 0], [7, 0]],
      [[0, 0], [-10, 0], [10, 0]],
      [[-6, 0], [6, 0], [-16, 0], [16, 0]],
      [[0, 0], [-9, 0], [9, 0], [-18, 0], [18, 0]],
    ],
  },

  // Aurora: leque + tiros laterais teleguiados
  mixed: {
    id: "mixed",
    name: "Mista",
    description: "Tiro reto e laterais teleguiados.",
    cooldown: 3,
    speed: 20,
    damage: 1,
    color: "#5ff5d9",
    w: 7,
    h: 15,
    homing: false,
    pierce: false,
    patterns: [
      [[-6, 0], [6, 0]],
      [[0, 0], [-10, -1.5], [10, 1.5]],
      [[-6, 0], [6, 0], [-14, -2, 1], [14, 2, 1]],
      [[0, 0], [-8, 0], [8, 0], [-16, -3, 1], [16, 3, 1]],
      [[-6, 0], [6, 0], [0, 0], [-16, -3, 1], [16, 3, 1], [-24, -5, 1], [24, 5, 1]],
    ],
  },
};

/** Qual arma cada nave usa. */
export const SHIP_WEAPON: Record<string, string> = {
  explorer: "balanced",
  shadow: "rapid",
  titan: "heavy",
  phantom: "homing",
  nebula: "pierce",
  aurora: "mixed",
};

export function getWeaponForShip(shipId?: string): WeaponProfile {
  const id = (shipId && SHIP_WEAPON[shipId]) || "balanced";
  return WEAPONS[id] || WEAPONS.balanced;
}
