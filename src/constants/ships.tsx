export interface Ship {
  id: string;
  name: string;
  emoji: string;
  unlockScore: number;
  description: string;
}

export const SHIPS: Ship[] = [
  {
    id: "explorer",
    name: "Explorer",
    emoji: "🚀",
    unlockScore: 0,
    description: "Nave inicial.",
  },

  {
    id: "shadow",
    name: "Shadow",
    emoji: "🛸",
    unlockScore: 4000,
    description: "Nave veloz e ágil.",
  },

  {
    id: "titan",
    name: "Titan",
    emoji: "☄️",
    unlockScore: 8000,
    description: "Nave pesada e resistente.",
  },

  {
    id: "phantom",
    name: "Phantom",
    emoji: "👾",
    unlockScore: 12000,
    description: "Nave experimental.",
  },
];

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