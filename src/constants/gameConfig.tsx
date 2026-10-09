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
  TILT_UPDATE_INTERVAL: 50,      // intervalo de leitura do sensor (ms, ~30Hz)
  TILT_SMOOTHING_ALPHA: 1.8,    // peso da leitura nova (0-1): menor = mais suave, maior = mais rápido
  TILT_DEADZONE: 0.8,           // ignora tremidas pequenas do sensor (em G)
  TILT_MAX_TILT: 0.9,            // inclinação (em G) que conta como "100%"
  TILT_SENSITIVITY: 8,           // px por tick (33ms) com inclinação máxima
  TILT_MAX_BANK_ANGLE: 50,       // graus máx. de inclinação visual da nave
  // Se a nave for para o lado contrário ao da inclinação, troque TILT_INVERT_X
  // entre 1 e -1. (TILT_INVERT_Y não é usado: só há movimento horizontal.)
  TILT_INVERT_X: 1,
  TILT_INVERT_Y: -1,
};