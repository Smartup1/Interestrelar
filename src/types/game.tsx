export interface Bullet {
  id: number;
  /** CENTRO do tiro */
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage?: number;
  pierce?: boolean;
  homing?: boolean;
  color?: string;
  w?: number;
  h?: number;
  /** ids já atingidos (tiro perfurante não acerta o mesmo alvo duas vezes) */
  hit?: number[];
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

// x e y = CENTRO do item. "P" = nível de tiro, "B" = bomba
export interface PowerUp {
  id: number;
  x: number;
  y: number;
  speed: number;
  kind: "P" | "B";
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
  /** true = mini-chefe (meio da fase) */
  isMid: boolean;
}

export interface Banner {
  id: number;
  text: string;
}

export type EnemyKind =
  | "scout"
  | "swooper"
  | "diver"
  | "gunner"
  | "heavy";

// x e y = CENTRO do inimigo
export interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  size: number;
  emoji: string;
  age: number;
  vx: number;
  vy: number;
  baseX: number;
  phase: number;
  state: number;
  fireEvery: number;
  score: number;
  flash: number;
  dir: number;
}

export interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  age: number;
}

export type FxName =
  | "explosion"
  | "collect"
  | "powerup"
  | "bombpickup"
  | "bomb"
  | "hurt"
  | "warning"
  | "stageclear"
  | "bossdead";

export interface FxEvent {
  id: number;
  name: FxName;
}
