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
    description: "Nave inicial.",
  },

  {
    id: "shadow",
    name: "Shadow",
    emoji: "🛸",
    image: require("../../assets/ships/nave-vermelha.png"),
    unlockScore: 4000,
    description: "Nave veloz e ágil.",
  },

  {
    id: "titan",
    name: "Titan",
    emoji: "☄️",
    image: require("../../assets/ships/nave-verde.png"),
    unlockScore: 8000,
    description: "Nave pesada e resistente.",
  },

  {
    id: "phantom",
    name: "Phantom",
    emoji: "👾",
    image: require("../../assets/ships/nave-roxa.png"),
    unlockScore: 12000,
    description: "Nave experimental.",
  },

  {
    id: "nebula",
    name: "Nebula",
    emoji: "🌌",
    image: require("../../assets/ships/nave-rosa.png"),
    unlockScore: 16000,
    description: "Nave rara.",
  },

  {
    id: "aurora",
    name: "Aurora",
    emoji: "✨",
    image: require("../../assets/ships/nave-turquesa.png"),
    unlockScore: 20000,
    description: "Nave lendária.",
  },
];

/**
 * Procura uma nave pelo ID.
 */
export function getShipById(id: string): Ship |