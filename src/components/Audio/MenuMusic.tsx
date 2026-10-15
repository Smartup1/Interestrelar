import { useCallback } from "react";
import { useFocusEffect } from "expo-router";

import { music } from "../../services/MusicManager";

// Música do menu (arquivo local: assets/music-menu.mp3, não precisa de internet).
// O MusicManager toca uma faixa por vez, então ao abrir o menu a música do
// jogo é pausada sozinha. Ao abrir o jogo, ele assume a música dele.
export default function MenuMusic() {
  useFocusEffect(
    useCallback(() => {
      music.play("menu");
    }, [])
  );

  return null;
}
