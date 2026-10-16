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
  /** true = caiu de um inimigo/chefão (some ao sair da tela, não reaparece) */
  drop?: boolean;
  /** deslocamento lateral por tick (drops espalham para os lados) */
  vx?: number;
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
  /** cor do tiro (padrão: vermelho). Cada chefão usa a sua. */
  color?: string;
  /** raio visual do tiro em px (padrão: 8) */
  r?: number;
}

/** Tipos de efeito visual da bomba (as naves de laser não usam). */
export type BombFxKind = "nova" | "lightning" | "ghost" | "aurora";

/** Efeito da bomba em andamento (desenhado por BombEffect). */
export interface BombFxState {
  id: number;
  kind: BombFxKind;
  x: number;
  y: number;
  color: string;
  /** alvos atingidos (inimigos/chefão) — o relâmpago desce até eles */
  targets: { x: number; y: number }[];
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
  /** cor da energia do chefão (aura e ataques) */
  aura?: string;
  /** 0..1 = carregando o ataque especial (aura cresce) */
  charge?: number;
  /** 0..1 = progresso da onda de choque logo após o especial (undefined = sem onda) */
  burst?: number;
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
  | "bossdead"
  | "laser";

export interface FxEvent {
  id: number;
  name: FxName;
}

/** Laser ativo (bomba de feixe de algumas naves) */
export interface LaserState {
  color: string;
  coreColor: string;
  halfWidth: number;
}
