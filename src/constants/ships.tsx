
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
