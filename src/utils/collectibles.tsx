import { Collectible } from "../types/game";
import { WIDTH, HEIGHT } from "../constants/gameConfig";

/**
 * Cria uma moeda (ou diamante, se special = true).
 * `startY` permite escalonar a entrada para não cair tudo junto.
 */
export function randomCoin(
  id: number,
  special = false,
  startY = -60
): Collectible {
  return {
    id,
    x: Math.random() * (WIDTH - 40),
    y: startY,
    special,
    speed: special ? 4 : 6,
  };
}

/**
 * Reaparece depois de coletado / perdido.
 * O diamante (escudo de 8s) demora bem mais para voltar, senão
 * a nave ficava quase sempre invulnerável.
 */
export function respawnCollectible(id: number, special: boolean): Collectible {
  const delay = special
    ? HEIGHT * (1.5 + Math.random() * 2.5) // ~ 20 a 55 s
    : HEIGHT * Math.random() * 0.6;
  return randomCoin(id, special, -60 - delay);
}

export function createInitialCollectibles(): Collectible[] {
  return [
    randomCoin(1, false, -60),
    randomCoin(2, false, -60 - HEIGHT * 0.35),
    randomCoin(3, false, -60 - HEIGHT * 0.7),
    randomCoin(4, true, -60 - HEIGHT * 1.2),
  ];
}

/**
 * Item que CAI de um inimigo/chefão morto: nasce na posição dele,
 * com um pequeno desvio para o lado, e desce. Não reaparece depois.
 */
export function dropCollectible(
  id: number,
  x: number,
  y: number,
  special = false,
  spread = 0
): Collectible {
  return {
    id,
    x: Math.max(0, Math.min(WIDTH - 32, x - 16 + spread)),
    y: y - 16,
    special,
    speed: special ? 4 : 5,
    drop: true,
    vx: spread * 0.04,
  };
}
