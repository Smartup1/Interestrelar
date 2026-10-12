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
  OBSTACLE_COUNT: 3,             // só asteroides e planetas (os inimigos vêm em ondas)
  STAR_COUNT: 50,                // 150 → 50 (muito mais leve)
  GAME_LOOP_INTERVAL: 60,        // 40 → 60 (loop mais lento = mais performance)

  // Nave / tela
  PLAYER_BOX: 90,                // lado da caixa (View) em volta da nave
  PLAYER_BODY_WIDTH: 46,         // largura visível da nave (para encostar na borda da tela)
  PLAYER_MIN_Y: 70,              // a nave não sobe para baixo da barra do topo (HUD)
  PLAYER_FINGER_LIFT: 70,        // a nave fica acima do dedo para ele não cobrir a nave

  // Manobrabilidade da nave (ela "voa" até o dedo, não teletransporta)
  SHIP_STIFFNESS: 12,            // maior = alcança o dedo mais rápido (6 = lenta, 20 = quase colada)
  SHIP_MAX_SPEED_X: 600,         // velocidade máxima de LADO, em px/s  (menor = anda menos de lado)
  SHIP_MAX_SPEED_Y: 800,         // velocidade máxima para CIMA/BAIXO, em px/s
  LATERAL_CURVE: 1.4,            // 1 = dedo e nave andam iguais; maior = controle mais fino perto do centro
                                 // (a nave ainda chega nas bordas da tela)
  TAP_MOVE_THRESHOLD: 8,         // movimento mínimo do dedo (px) para contar como arrastar e não como toque

  // Rotação da ponta
  SHIP_TURN_RATE: 16,            // maior = a ponta vira mais rápido (era 9)
  SHIP_MIN_TURN_SPEED: 140,      // (não usado mais; a ponta usa SHIP_STOP_DIST)
  SHIP_STOP_DIST: 14,            // perto do alvo (px) a ponta volta para cima
  SHIP_ALIGN_MIN: 0.3,           // velocidade mínima (fração) enquanto a ponta ainda não aponta pro dedo
                                 // (menor = a nave "freia" mais até apontar; 1 = anda de lado como antes)
  SHIP_MAX_TURN: 180,            // 180 = vira para todos os lados; 60 = no máximo 60° para cada lado

  // Nível de tiro (estilo Aero Fighters)
  MAX_WEAPON_LEVEL: 5,           // nível máximo do tiro
  POWERUP_DROP_CHANCE: 0.12,     // chance de um inimigo destruído soltar o "P"
  POWERUP_SPAWN_TICKS: 480,      // sem "P" por esse tempo (~29s) = cai um sozinho
  MAX_BULLETS: 64,               // limite de tiros na tela (desempenho)
  PLAYER_INVULN_TICKS: 20,       // invulnerável após tomar dano (~1,2s)

  // Colisão da nave (metade da largura/altura da área que pode ser atingida)
  PLAYER_HIT_W: 9,
  PLAYER_HIT_H: 13,

  // Fases
  STAGE_INTRO_TICKS: 36,         // pausa com "FASE N" antes das ondas
  STAGE_CLEAR_TICKS: 60,         // pausa depois do chefão antes da próxima fase
  BOSS_WARNING_TICKS: 36,        // "WARNING" antes do chefão entrar
  MAX_ENEMY_BULLETS: 60,         // limite de tiros inimigos na tela (desempenho)
  MAX_ENEMIES: 14,               // inimigos na tela ao mesmo tempo (desempenho)

  // Chefão e mini-chefe
  BOSS_BASE_HP: 220,             // vida do chefão da fase 1
  BOSS_HP_PER_LEVEL: 120,        // vida extra a cada fase
  MID_BOSS_HP_FACTOR: 0.4,       // vida do mini-chefe = chefão x este valor

  // Bombas
  START_BOMBS: 2,
  MAX_BOMBS: 5,
  BOMB_ENEMY_DAMAGE: 15,         // dano da bomba em cada inimigo
  BOMB_BOSS_DAMAGE_PCT: 0.1,     // dano da bomba no chefão (fração da vida máxima)
  BOMB_INVULN_TICKS: 36,         // invulnerável depois da bomba (~2s)
  BOMB_COOLDOWN_TICKS: 10,
  BOMB_DROP_CHANCE: 0.05,        // chance de um inimigo soltar bomba "B"

  // Combo: abater inimigos em sequência multiplica os pontos
  COMBO_WINDOW_TICKS: 50,        // tempo (~3s) para manter a sequência
};