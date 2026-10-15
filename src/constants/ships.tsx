import { Ship } from "../types/ships";

// Mantém compatibilidade com arquivos que importam Ship daqui
export type { Ship };

export const SHIPS: Ship[] = [
  {
    id: "explorer",
    name: "Explorer",
    emoji: "🚀",
    image: require("../../assets/ships/nave-azul.png"),
    unlockScore: 0,
    description: "Equilibrada: tiro duplo que vira leque.",
  },

  {
    id: "shadow",
    name: "Shadow",
    emoji: "🛸",
    image: require("../../assets/ships/nave-vermelha.png"),
    unlockScore: 4000,
    description: "Rápida: dispara muito mais rápido.",
  },

  {
    id: "titan",
    name: "Titan",
    emoji: "☄️",
    image: require("../../assets/ships/nave-verde.png"),
    unlockScore: 8000,
    description: "Pesada: tiros lentos com dano dobrado.",
  },

  {
    id: "phantom",
    name: "Phantom",
    emoji: "👾",
    image: require("../../assets/ships/nave-roxa.png"),
    unlockScore: 12000,
    description: "Teleguiada: mísseis que perseguem os inimigos.",
  },

  {
    id: "nebula",
    name: "Nebula",
    emoji: "🌌",
    image: require("../../assets/ships/nave-rosa.png"),
    unlockScore: 16000,
    description: "Perfurante: laser que atravessa tudo.",
  },

  {
    id: "aurora",
    name: "Aurora",
    emoji: "✨",
    image: require("../../assets/ships/nave-turquesa.png"),
    unlockScore: 20000,
    description: "Mista: tiro reto e laterais teleguiados.",
  },

  {
    id: "special",
    name: "Special",
    emoji: "🟣",
    image: require("../../assets/ships/Nave-Special.png"),
    unlockScore: 24000,
    description: "Nave especial: laser roxo.",
  },

  {
    id: "special-ouro",
    name: "Special Ouro",
    emoji: "🌟",
    image: require("../../assets/ships/Nave-Special-Ouro.png"),
    unlockScore: 28000,
    description: "Nave especial dourada: laser dourado.",
  },
];

/**
 * Procura uma nave pelo ID.
 */
/**
 * Procura uma nave pelo ID.
 */
export function getShipById(id: string): Ship | undefined {
  return SHIPS.find((ship) => ship.id === id);
}

/**
 * Verifica se o jogador já desbloqueou uma nave.
 */
export function isShipUnlocked(
  ship: Ship,
  score: number
): boolean {
  return score >= ship.unlockScore;
}

/**
 * Retorna todas as naves que o jogador já desbloqueou.
 */
export function getUnlockedShips(score: number): Ship[] {
  return SHIPS.filter((ship) => score >= ship.unlockScore);
}

/**
 * Retorna todas as naves que ainda estão bloqueadas.
 */
export function getLockedShips(score: number): Ship[] {
  return SHIPS.filter((ship) => score < ship.unlockScore);
}

/**
 * Retorna a próxima nave que será desbloqueada.
 */
export function getNextShipToUnlock(score: number): Ship | undefined {
  return SHIPS
    .filter((ship) => ship.unlockScore > score)
    .sort((a, b) => a.unlockScore - b.unlockScore)[0];
}
