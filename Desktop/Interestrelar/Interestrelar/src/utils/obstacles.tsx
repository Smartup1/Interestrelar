import { Obstacle } from "../types/game";
import { OBSTACLE_TYPES, WIDTH, HEIGHT } from "../constants/gameConfig";

export function randomObstacle(id: number): Obstacle {
  const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];

  return {
    id,
    x: Math.random() * (WIDTH - 60),
    y: -Math.random() * HEIGHT,
    emoji: type.emojis[Math.floor(Math.random() * type.emojis.length)],
    fontSize: type.fontSize,
    speedMult: type.speedMult,
    drift: type.drift,
    driftPhase: Math.random() * Math.PI * 2,
  };
}

export function createInitialObstacles(count: number): Obstacle[] {
  return Array.from({ length: count }, (_, i) => randomObstacle(i));
}