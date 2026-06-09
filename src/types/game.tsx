export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Explosion {
  id: number;
  x: number;
  y: number;
}

export interface Trail {
  id: string;
  x: number;
  y: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  fontSize: number;
  speedMult: number;
  drift: boolean;
  driftPhase: number;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  special: boolean;
  speed: number;
}

export interface PlayerPosition {
  x: number;
  y: number;
  angle: number;
}

export interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
}