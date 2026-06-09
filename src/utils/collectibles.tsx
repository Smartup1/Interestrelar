import { Collectible } from "../types/game";
import { WIDTH } from "../constants/gameConfig";

export function randomCoin(id: number, special = false): Collectible {
  return {
    id,
    x: Math.random() * (WIDTH - 40),
    y: -60,
    special,
    speed: special ? 4 : 6,
  };
}

export function createInitialCollectibles(): Collectible[] {
  return [randomCoin(1, false), randomCoin(2, true)];
}