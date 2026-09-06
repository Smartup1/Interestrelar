export type ShipId = "explorer" | "shadow" | "titan" | "phantom";

export interface Ship {
  id: ShipId;
  name: string;
  emoji: string;
  unlockScore: number;
  description: string;
}

export interface ShipStorage {
  selectedShip: ShipId;
  unlockedShips: ShipId[];
}
