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
};