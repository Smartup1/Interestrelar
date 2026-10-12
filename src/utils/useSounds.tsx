import { useEffect, useRef, useCallback } from "react";
import { useAudioPlayer } from "expo-audio";

// Verifique se os arquivos existem na pasta assets
const shootSound     = require("../../assets/shoot.wav");
const explosionSound = require("../../assets/explosion.wav");
const collectSound   = require("../../assets/collect.wav");
const bgSound        = require("../../assets/music-space.wav");

// Efeitos novos
const powerupSound    = require("../../assets/sfx-powerup.wav");
const bombSound       = require("../../assets/sfx-bomb.wav");
const hurtSound       = require("../../assets/sfx-hurt.wav");
const warningSound    = require("../../assets/sfx-warning.wav");
const stageClearSound = require("../../assets/sfx-stageclear.wav");

export type SfxName =
  | "powerup"
  | "bombpickup"
  | "bomb"
  | "bossdead"
  | "hurt"
  | "warning"
  | "stageclear";

export function useSounds() {
  const shoot     = useAudioPlayer(shootSound);
  const explosion = useAudioPlayer(explosionSound);
  const collect   = useAudioPlayer(collectSound);
  const bg        = useAudioPlayer(bgSound);

  const powerup    = useAudioPlayer(powerupSound);
  const bomb       = useAudioPlayer(bombSound);
  const hurt       = useAudioPlayer(hurtSound);
  const warning    = useAudioPlayer(warningSound);
  const stageClear = useAudioPlayer(stageClearSound);

  const bgStarted = useRef(false);
  const isMounted = useRef(true);

  // Limpeza ao desmontar
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Para e libera todos os sons ao desmontar
      try {
        bg.pause();
        shoot.pause();
        explosion.pause();
        collect.pause();
        powerup.pause();
        bomb.pause();
        hurt.pause();
        warning.pause();
        stageClear.pause();
      } catch (error) {
        console.log('Erro ao liberar sons:', error);
      }
    };
  }, [bg, shoot, explosion, collect, powerup, bomb, hurt, warning, stageClear]);

  // Inicia música de fundo em loop
  useEffect(() => {
    if (!bgStarted.current && isMounted.current) {
      bgStarted.current = true;
      try {
        bg.loop = true;
        bg.volume = 0.4;
        bg.play();
      } catch (error) {
        console.log('Erro ao iniciar música:', error);
      }
    }
  }, [bg]);

  const playShoot = useCallback(() => {
    try {
      if (isMounted.current) {
        shoot.seekTo(0);
        shoot.volume = 0.6;
        shoot.play();
      }
    } catch (error) {
      console.log('Erro ao tocar tiro:', error);
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
      console.log('Erro ao tocar explosão:', error);
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
      console.log('Erro ao tocar coleta:', error);
    }
  }, [collect]);

  // Efeitos do jogo (power-up, bomba, dano, alerta, fim de fase)
  const playSfx = useCallback(
    (name: SfxName) => {
      try {
        if (!isMounted.current) return;

        const map = {
          powerup:    [powerup, 0.8],
          bombpickup: [powerup, 0.8],
          bomb:       [bomb, 1.0],
          bossdead:   [bomb, 1.0],
          hurt:       [hurt, 0.9],
          warning:    [warning, 0.8],
          stageclear: [stageClear, 0.9],
        } as const;

        const [player, volume] = map[name];
        player.seekTo(0);
        player.volume = volume;
        player.play();
      } catch (error) {
        console.log("Erro ao tocar efeito:", error);
      }
    },
    [powerup, bomb, hurt, warning, stageClear]
  );

  const stopBackground = useCallback(() => {
    try {
      if (isMounted.current && bg) {
        bg.pause();
      }
    } catch (error) {
      console.log('Erro ao parar música:', error);
    }
  }, [bg]);

  const resumeBackground = useCallback(() => {
    try {
      if (isMounted.current && bg) {
        bg.play();
      }
    } catch (error) {
      console.log('Erro ao retomar música:', error);
    }
  }, [bg]);

  return {
    playShoot,
    playExplosion,
    playCollect,
    playSfx,
    stopBackground,
    resumeBackground,
  };
}