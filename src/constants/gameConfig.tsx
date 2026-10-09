import { Dimensions } from "react-native";

export const WIDTH = Dimensions.get("window").width;
export const HEIGHT = Dimensions.get("window").height;

export const OBSTACLE_TYPES = [
  {
    emojis: ["☄️", "🪨"],
    fontSize: 36,
    speedMult: 1,
    drift: false,
  },
  {
    emojis: ["👾", "👽", "🛸"],
    fontSize: 34,
    speedMult: 3.4,
    drift: true,
  },
  {
    emojis: ["🪐", "🌍", "🌕"],
    fontSize: 48,
    speedMult: 0.9,
    drift: false,
  },
];

export const GAME_CONFIG = {
  SHOOT_INTERVAL: 200,           // 150 → 200 (mais leve)
  DOUBLE_TAP_DELAY: 300,
  SHIELD_DURATION: 8000,
  OBSTACLE_COUNT: 5,             // 8 → 5 (menos obstáculos)
  STAR_COUNT: 50,                // 150 → 50 (muito mais leve)
  GAME_LOOP_INTERVAL: 60,        // 40 → 60 (loop mais lento = mais performance)

  // Nave / tela
  PLAYER_BOX: 90,                // lado da caixa (View) em volta da nave
  PLAYER_BODY_WIDTH: 46,         // largura visível da nave (para encostar na borda da tela)
  PLAYER_MIN_Y: 70,              // a nave não sobe para baixo da barra do topo (HUD)
  PLAYER_FINGER_LIFT: 70,        // a nave fica acima do dedo para ele não cobrir a nave

  // Nível de tiro (estilo Aero Fighters)
  MAX_WEAPON_LEVEL: 5,           // nível máximo do tiro
  POWERUP_DROP_CHANCE: 0.12,     // chance de um inimigo destruído soltar o "P"
  POWERUP_SPAWN_TICKS: 480,      // sem "P" por esse tempo (~29s) = cai um sozinho
  SHOT_COOLDOWN_TICKS: 2,        // intervalo mínimo entre tiros (2 ticks ≈ 120ms)
  MAX_BULLETS: 48,               // limite de tiros na tela (desempenho)
  PLAYER_INVULN_TICKS: 20,       // invulnerável após tomar dano (~1,2s)

  // Chefão
  BOSS_FIRST_SCORE: 1500,        // pontuação do primeiro chefão
  BOSS_SCORE_GAP: 3000,          // pontos entre um chefão derrotado e o próximo
  BOSS_BASE_HP: 180,             // vida do 1º chefão
  BOSS_HP_PER_LEVEL: 100,        // vida extra a cada chefão seguinte

};