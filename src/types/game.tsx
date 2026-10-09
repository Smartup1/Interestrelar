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

export interface EnemyBullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// x e y = CENTRO do item
export interface PowerUp {
  id: number;
  x: number;
  y: number;
  speed: number;
}

// x e y = CENTRO do chefão
export interface Boss {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  emoji: string;
  size: number;
  spawnTick: number;
  wave: number;
  hitFlash: number;
}

export interface Banner {
  id: number;
  text: string;
}
