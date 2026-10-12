import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useAudioPlayer } from "expo-audio";
import { stopGameBackgroundMusic } from "../../utils/useSounds";

// Trilha separada para o menu. Requer conexão com a internet.
// A música local music-space.wav continua sendo usada durante a partida.
const MENU_MUSIC_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";

export default function MenuMusic() {
  const player = useAudioPlayer({ uri: MENU_MUSIC_URL });

  useFocusEffect(
    useCallback(() => {
      // O menu assumiu o foco: encerra a música da partida antes de tocar a sua.
      stopGameBackgroundMusic();

      try {
        player.loop = true;
        player.volume = 0.22;
        player.seekTo(0);
        player.play();
      } catch (error) {
        console.log("Erro ao iniciar música do menu:", error);
      }

      return () => {
        try {
          player.pause();
          player.seekTo(0);
        } catch (error) {
          console.log("Erro ao parar música do menu:", error);
        }
      };
    }, [player])
  );

  return null;
}
