import { useEffect, useRef, useCallback } from "react";
import { useAudioPlayer } from "expo-audio";

import { music, MusicTrack } from "../services/MusicManager";

// Efeitos sonoros do jogo.
// A MÚSICA (menu, fase e chefão) fica no MusicManager: lá só toca uma
// faixa por vez, não importa quantas telas existam ao mesmo tempo.
const shootSound = require("../../assets/shoot.wav");
const explosionSound = require("../../assets/explosion.wav");
const collectSound = require("../../assets/collect.wav");

const powerupSound = require("../../assets/sfx-powerup.wav");
const bombSound = require("../../assets/sfx-bomb.wav");
const hurtSound = require("../../assets/sfx-hurt.wav");
const warningSound = require("../../assets/sfx-warning.wav");
const stageClearSound = require("../../assets/sfx-stageclear.wav");
const laserSound = require("../../assets/sfx-laser.wav");

/** Para a música do jogo (se for ela que estiver tocando). */
export function stopGameBackgroundMusic() {
  if (music.current === "game" || music.current === "boss") {
    music.stop();
  }
}

export type SfxName =
  | "powerup"
  | "bombpickup"
  | "bomb"
  | "bossdead"
  | "hurt"
  | "warning"
  | "stageclear"
  | "laser";

export function useSounds() {
  const shoot = useAudioPlayer(shootSound);
  const explosion = useAudioPlayer(explosionSound);
  const collect = useAudioPlayer(collectSound);

  const powerup = useAudioPlayer(powerupSound);
  const bomb = useAudioPlayer(bombSound);
  const hurt = useAudioPlayer(hurtSound);
  const warning = useAudioPlayer(warningSound);
  const stageClear = useAudioPlayer(stageClearSound);
  const laser = useAudioPlayer(laserSound);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;

      try {
        shoot.pause();
        explosion.pause();
        collect.pause();
        powerup.pause();
        bomb.pause();
        hurt.pause();
        warning.pause();
        stageClear.pause();
        laser.pause();
      } catch (error) {
        console.log("Erro ao liberar sons:", error);
      }

      // Ao sair do jogo, para a música dele. Se o menu já assumiu a
      // música, não mexe (isso só vale se ainda for a do jogo).
      stopGameBackgroundMusic();
    };
  }, [shoot, explosion, collect, powerup, bomb, hurt, warning, stageClear, laser]);

  const playShoot = useCallback(() => {
    try {
      if (isMounted.current) {
        shoot.seekTo(0);
        shoot.volume = 0.6;
        shoot.play();
      }
    } catch (error) {
      console.log("Erro ao tocar tiro:", error);
    }
  }, [shoot]);

  const playExplosion = useCallback(() => {
    try {
      if (isMounted.current) {
        explosion.seekTo(0);
        explosion.volume = 0.8;
        explosion.play();
      }
    } catch (error) {
      console.log("Erro ao tocar explosão:", error);
    }
  }, [explosion]);

  const playCollect = useCallback(() => {
    try {
      if (isMounted.current) {
        collect.seekTo(0);
        collect.volume = 0.7;
        collect.play();
      }
    } catch (error) {
      console.log("Erro ao tocar coleta:", error);
    }
  }, [collect]);

  const playSfx = useCallback(
    (name: SfxName) => {
      try {
        if (!isMounted.current) return;

        const map = {
          powerup: [powerup, 0.8],
          bombpickup: [powerup, 0.8],
          bomb: [bomb, 1.0],
          bossdead: [bomb, 1.0],
          hurt: [hurt, 0.9],
          warning: [warning, 0.8],
          stageclear: [stageClear, 0.9],
          laser: [laser, 0.9],
        } as const;

        const [player, volume] = map[name];
        player.seekTo(0);
        player.volume = volume;
        player.play();
      } catch (error) {
        console.log("Erro ao tocar efeito:", error);
      }
    },
    [powerup, bomb, hurt, warning, stageClear, laser]
  );

  // Música do jogo: "game" (a antiga) ou "boss" (a nova, do chefão).
  // Tocar uma faixa pausa a outra, então nunca tocam duas juntas.
  const setMusic = useCallback((track: MusicTrack) => {
    music.play(track, track === "boss");
  }, []);

  const stopBackground = useCallback(() => {
    music.pause();
  }, []);

  const resumeBackground = useCallback(() => {
    music.resume();
  }, []);

  return {
    playShoot,
    playExplosion,
    playCollect,
    playSfx,
    setMusic,
    stopBackground,
    resumeBackground,
  };
}
