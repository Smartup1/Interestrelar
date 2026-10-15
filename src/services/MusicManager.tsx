// src/services/MusicManager.tsx
//
// ============================================================
// MÚSICA DO JOGO (uma faixa por vez)
// ============================================================
//
//   menu : música calma do menu
//   game : música da fase (a antiga)
//   boss : música do chefão
//
// É UM ÚNICO objeto para o app inteiro. Antes, cada tela criava
// os próprios players e, se duas telas ficassem abertas ao mesmo
// tempo, duas músicas tocavam juntas. Aqui, tocar uma faixa
// sempre PAUSA as outras.

import { createAudioPlayer, AudioPlayer } from "expo-audio";

export type MusicTrack = "menu" | "game" | "boss";

const SOURCES: Record<MusicTrack, number> = {
  menu: require("../../assets/music-menu.mp3"),
  game: require("../../assets/background.mp3"),
  boss: require("../../assets/music-space.wav"),
};

const VOLUMES: Record<MusicTrack, number> = {
  menu: 0.45,
  game: 0.4,
  boss: 0.5,
};

class MusicManager {
  private players: Partial<Record<MusicTrack, AudioPlayer>> = {};
  current: MusicTrack | null = null;
  private paused = false;

  private get(track: MusicTrack): AudioPlayer {
    let p = this.players[track];

    if (!p) {
      p = createAudioPlayer(SOURCES[track]);
      p.loop = true;
      p.volume = VOLUMES[track];
      this.players[track] = p;
    }

    return p;
  }

  /**
   * Toca uma faixa e pausa todas as outras.
   * `restart`: recomeça do início (o chefão sempre recomeça;
   * a música da fase continua de onde parou).
   */
  play(track: MusicTrack, restart = false) {
    try {
      if (this.current === track && !this.paused) return;

      (Object.keys(this.players) as MusicTrack[]).forEach((k) => {
        if (k !== track) this.players[k]?.pause();
      });

      const p = this.get(track);

      if (restart) p.seekTo(0);

      p.volume = VOLUMES[track];
      p.play();

      this.current = track;
      this.paused = false;
    } catch (error) {
      console.log("Erro ao tocar música:", error);
    }
  }

  /** Pausa a faixa atual (ex.: game over). */
  pause() {
    try {
      if (this.current) this.players[this.current]?.pause();
      this.paused = true;
    } catch (error) {
      console.log("Erro ao pausar música:", error);
    }
  }

  /** Continua a faixa que estava pausada. */
  resume() {
    try {
      if (this.current && this.paused) {
        this.players[this.current]?.play();
        this.paused = false;
      }
    } catch (error) {
      console.log("Erro ao retomar música:", error);
    }
  }

  /** Para tudo. */
  stop() {
    try {
      (Object.keys(this.players) as MusicTrack[]).forEach((k) =>
        this.players[k]?.pause()
      );
    } catch (error) {
      console.log("Erro ao parar música:", error);
    }
    this.current = null;
    this.paused = false;
  }
}

export const music = new MusicManager();
