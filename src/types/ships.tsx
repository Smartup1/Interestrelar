import { ImageSourcePropType } from "react-native";

export type ShipId = string;

export interface Ship {
  id: ShipId;
  name: string;
  emoji: string;
  image?: ImageSourcePropType;
  unlockScore: number;
  description: string;
}

export interface ShipStorage {
  selectedShip: ShipId;
  unlockedShips: ShipId[];
}