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

  // Controle por inclinação (acelerômetro)
  TILT_UPDATE_INTERVAL: 16,      // ~60fps de leitura do sensor
  TILT_DEADZONE: 0.04,           // ignora tremidas pequenas do sensor
  TILT_MAX_SPEED: 9,             // pixels por frame de movimento na inclinação máxima
  TILT_SENSITIVITY: 4,           // quanto a inclinação (em G) é amplificada antes de virar velocidade
  // Se os controles saírem invertidos no aparelho do jogador, basta trocar
  // estes dois valores entre 1 e -1.
  TILT_INVERT_X: 1,
  TILT_INVERT_Y: -1,
};