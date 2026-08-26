import React, { useRef, useEffect, useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";

import { useRouter } from "expo-router";

import Player from "../Player";
import HUD from "../HUD";
import GameModal from "../GameModal/GameModal";
import GameRenderer from "./GameRenderer";

import { useGameLogic } from "./GameLogic";
import { useSounds } from "../../utils/useSounds";
import { createPulseAnimation } from "../../utils/animations";

import {
  WIDTH,
  HEIGHT,
  GAME_CONFIG,
} from "../../constants/gameConfig";

import { useDailyCredits } from "../../hooks/useDailyCredits";
import { useTiltSteering } from "../../hooks/useTiltSteering";

import styles from "./styles";

export default function Game() {
  // ============================================================
  // ROUTER
  // ============================================================

  const router = useRouter();

  // ============================================================
  // CRÉDITOS
  // ============================================================

  const {
    creditsLeft,
    totalCredits,
    useCredit,
    addCredit,
  } = useDailyCredits();

  // ============================================================
  // GAME LOGIC
  // ============================================================

  const {
    score,
    coins,
    gems,
    combo,
    lives,
    gameOver,
    shield,

    bullets,
    explosions,
    trail,
    obstacles,
    collectibles,
    player,

    shoot,
    restartGame,
    updatePlayerPosition,
  } = useGameLogic();

  // ============================================================
  // SONS
  // ============================================================

  const {
    playShoot,
    playExplosion,
    playCollect,
    stopBackground,
    resumeBackground,
  } = useSounds();

  // ============================================================
  // ESTRELAS
  // ============================================================

  const [stars] = useState(
    Array.from(
      {
        length: GAME_CONFIG.STAR_COUNT,
      },
      (_, i) => ({
        id: i,
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: Math.random() * 3 + 1,
      })
    )
  );

  // ============================================================
  // ANIMAÇÃO
  // ============================================================

  const pulseAnim = useRef(
    new Animated.Value(1)
  ).current;

  const pulseAnimation =
    createPulseAnimation(pulseAnim);

  // ============================================================
  // GAME OVER REF
  // ============================================================

  const gameOverRef =
    useRef(gameOver);

  useEffect(() => {
    gameOverRef.current =
      gameOver;
  }, [gameOver]);

  // ============================================================
  // PLAYER REF
  //
  // Mantém a posição atual da nave disponível
  // para o loop do sensor.
  // ============================================================

  const playerRef =
    useRef(player);

  useEffect(() => {
    playerRef.current =
      player;
  }, [player]);

  // ============================================================
  // SENSOR DE INCLINAÇÃO
  // ============================================================

  const tiltX =
    useTiltSteering();

  // ============================================================
  // MOVIMENTO PELO SENSOR
  //
  // A nave NÃO responde ao toque.
  //
  // Somente a inclinação do celular movimenta a nave.
  // ============================================================

  useEffect(() => {
    const TILT_SENSITIVITY = 7;
    const MAX_BANK_ANGLE = 35;

    const interval =
      setInterval(() => {
        // Game Over
        if (gameOverRef.current) {
          return;
        }

        // Valor atual do sensor
        const tilt =
          tiltX.current;

        // Posição atual da nave
        const current =
          playerRef.current;

        // ======================================================
        // MOVIMENTO HORIZONTAL
        // ======================================================

        const newX =
          Math.max(
            0,
            Math.min(
              WIDTH - 90,
              current.x -
                tilt *
                  TILT_SENSITIVITY
            )
          );

        // ======================================================
        // INCLINAÇÃO VISUAL
        // ======================================================

        const newAngle =
          -tilt *
          MAX_BANK_ANGLE;

        // ======================================================
        // ATUALIZA PLAYER
        // ======================================================

        updatePlayerPosition(
          newX,
          current.y,
          newAngle
        );
      }, 33);

    return () => {
      clearInterval(
        interval
      );
    };
  }, []);

  // ============================================================
  // EXPLOSÕES
  // ============================================================

  const prevExplosionsLen =
    useRef(0);

  useEffect(() => {
    if (
      !gameOver &&
      explosions.length >
        prevExplosionsLen.current
    ) {
      playExplosion();
    }

    prevExplosionsLen.current =
      explosions.length;
  }, [
    explosions,
    gameOver,
  ]);

  // ============================================================
  // COLETÁVEIS
  // ============================================================

  const prevCollectiblesLen =
    useRef(0);

  useEffect(() => {
    if (
      !gameOver &&
      collectibles.length <
        prevCollectiblesLen.current
    ) {
      playCollect();
    }

    prevCollectiblesLen.current =
      collectibles.length;
  }, [
    collectibles,
    gameOver,
  ]);

  // ============================================================
  // GAME OVER
  // ============================================================

  const prevGameOver =
    useRef(false);

  useEffect(() => {
    if (
      gameOver &&
      !prevGameOver.current
    ) {
      stopBackground();
    }

    prevGameOver.current =
      gameOver;
  }, [gameOver]);

  // ============================================================
  // PULSE ANIMATION
  // ============================================================

  useEffect(() => {
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  // ============================================================
  // DISPARO
  //
  // CADA TOQUE = 1 DISPARO
  //
  // Não existe disparo contínuo.
  // ============================================================

  const handleShoot = () => {
    // Game Over bloqueia o tiro
    if (gameOverRef.current) {
      return;
    }

    // Som
    playShoot();

    // Um toque = um disparo
    shoot();
  };

  // ============================================================
  // REINICIAR
  // ============================================================

  const handleRestart =
    async () => {
      // Verifica crédito
      const ok =
        await useCredit();

      if (!ok) {
        return;
      }

      // Reinicia o jogo
      restartGame();

      // Retoma música
      resumeBackground();

      // Reseta contadores de efeitos
      prevExplosionsLen.current =
        0;

      prevCollectiblesLen.current =
        0;

      prevGameOver.current =
        false;
    };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <TouchableWithoutFeedback
      onPress={handleShoot}
      disabled={gameOver}
    >
      <View
        style={
          styles.container
        }
      >

        {/* ====================================================
            HUD
        ==================================================== */}

        <HUD
          score={score}
          coins={coins}
          gems={gems}
          combo={combo}
          lives={lives}
        />

        {/* ====================================================
            GAME RENDERER
        ==================================================== */}

        <GameRenderer
          stars={stars}
          trail={trail}
          collectibles={
            collectibles
          }
          obstacles={
            obstacles
          }
          bullets={bullets}
          explosions={
            explosions
          }
          shield={shield}
          player={player}
          pulseAnim={
            pulseAnim
          }
          gameOver={
            gameOver
          }
        />

        {/* ====================================================
            PLAYER
        ==================================================== */}

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: player.x,
            top: player.y,
            width: 90,
            height: 90,
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 10,
          }}
        >
          <Player
            x={0}
            y={0}
            angle={
              player.angle
            }
          />
        </View>

        {/* ====================================================
            GAME MODAL
        ==================================================== */}

        <GameModal
          visible={gameOver}

          score={score}
          coins={coins}
          gems={gems}

          creditsLeft={
            creditsLeft
          }

          totalCredits={
            totalCredits
          }

          onRestart={
            handleRestart
          }

          onEarnCredit={
            addCredit
          }

          onHome={() =>
            router.push("/")
          }
        />

      </View>
    </TouchableWithoutFeedback>
  );
}