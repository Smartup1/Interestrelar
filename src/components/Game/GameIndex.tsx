import React, { useRef, useEffect, useState } from "react";
import { View, PanResponder, Animated } from "react-native";
import { useRouter } from "expo-router";
import Player from "../Player";
import HUD from "../HUD";
import GameModal from "../GameModal/GameModal";
import GameRenderer from "./GameRenderer";
import { useGameLogic } from "./GameLogic";
import { useSounds } from "../../utils/useSounds";
import { createPulseAnimation } from "../../utils/animations";
import { WIDTH, HEIGHT, GAME_CONFIG } from "../../constants/gameConfig";
import { useDailyCredits } from "../../hooks/useDailyCredits";
import { useTiltSteering } from "../../hooks/useTiltSteering";
import styles from "./styles";

export default function Game() {
  const router = useRouter();
  const { creditsLeft, totalCredits, useCredit, addCredit } = useDailyCredits();

  // Ref sempre atualizada com créditos reais
  const creditsLeftRef = useRef(creditsLeft);
  useEffect(() => {
    creditsLeftRef.current = creditsLeft;
  }, [creditsLeft]);

  const {
    score, coins, gems, combo, lives, gameOver, shield,
    bullets, explosions, trail, obstacles, collectibles, player,
    shoot, stopShooting, restartGame, updatePlayerPosition,
  } = useGameLogic();

  const {
    playShoot,
    playExplosion,
    playCollect,
    stopBackground,
    resumeBackground,
  } = useSounds();

  const [stars] = useState(
    Array.from({ length: GAME_CONFIG.STAR_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      size: Math.random() * 3 + 1,
    }))
  );

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimation = createPulseAnimation(pulseAnim);

  const gameOverRef = useRef(gameOver);
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  const playerRef2 = useRef(player);
  useEffect(() => {
    playerRef2.current = player;
  }, [player]);

  // Controle por inclinação do celular
  const tiltX = useTiltSteering();
  const isDraggingRef = useRef(false);

  const prevExplosionsLen = useRef(0);
  const prevCollectiblesLen = useRef(0);

  useEffect(() => {
    if (!gameOver && explosions.length > prevExplosionsLen.current) {
      playExplosion();
    }
    prevExplosionsLen.current = explosions.length;
  }, [explosions, gameOver]);

  useEffect(() => {
    if (!gameOver && collectibles.length < prevCollectiblesLen.current) {
      playCollect();
    }
    prevCollectiblesLen.current = collectibles.length;
  }, [collectibles, gameOver]);

  const prevGameOver = useRef(false);
  useEffect(() => {
    if (gameOver && !prevGameOver.current) {
      stopBackground();
      stopShooting();
    }
    prevGameOver.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  // Aplica a inclinação do celular como movimento lateral contínuo da nave.
  // Enquanto o jogador está arrastando o dedo, o ângulo continua sendo
  // controlado pelo toque; quando solta, a nave "curva" na direção do tilt.
  useEffect(() => {
    const TILT_SENSITIVITY = 6;  // px por tick, por unidade de inclinação
    const MAX_BANK_ANGLE = 35;   // graus máx. de inclinação visual
    const DEAD_ZONE = 0.05;      // ignora tremores pequenos do sensor

    const interval = setInterval(() => {
      if (gameOverRef.current) return;

      const tilt = tiltX.current;
      if (Math.abs(tilt) < DEAD_ZONE) return;

      const current = playerRef2.current;
      const newX = Math.max(0, Math.min(WIDTH - 90, current.x - tilt * TILT_SENSITIVITY));

      const newAngle = isDraggingRef.current
        ? current.angle
        : -tilt * MAX_BANK_ANGLE;

      updatePlayerPosition(newX, current.y, newAngle);
    }, 33); // ~30x por segundo

    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    const ok = await useCredit(); // desconta ao reiniciar
    if (!ok) return;
    restartGame();
    resumeBackground();
    prevExplosionsLen.current = 0;
    prevCollectiblesLen.current = 0;
  };

  const handleShoot = () => {
    if (!gameOverRef.current) {
      playShoot();
      shoot();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !gameOverRef.current,
      onMoveShouldSetPanResponder: () => !gameOverRef.current,
      onPanResponderGrant: () => {
        if (gameOverRef.current) return;
        isDraggingRef.current = true;
        // Ao tocar em qualquer ponto da tela (inclusive na própria nave),
        // já começa a atirar continuamente, sem bloquear o arrasto.
        handleShoot();
      },
      onPanResponderMove: (_, gesture) => {
        if (gameOverRef.current) return;
        isDraggingRef.current = true;

        const x = Math.max(0, Math.min(WIDTH - 90, gesture.moveX));
        const y = Math.max(0, Math.min(HEIGHT - 90, gesture.moveY));

        const dx = x - playerRef2.current.x;
        const dy = y - playerRef2.current.y;
        let angle = playerRef2.current.angle;

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          angle = Math.atan2(dx, -dy) * (180 / Math.PI);
        }

        updatePlayerPosition(x, y, angle);
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
        stopShooting();
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        stopShooting();
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <HUD score={score} coins={coins} gems={gems} combo={combo} lives={lives} />

      <GameRenderer
        stars={stars}
        trail={trail}
        collectibles={collectibles}
        obstacles={obstacles}
        bullets={bullets}
        explosions={explosions}
        shield={shield}
        player={player}
        pulseAnim={pulseAnim}
        gameOver={gameOver}
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: player.x,
          top: player.y,
          width: 90,
          height: 90,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <Player x={0} y={0} angle={player.angle} />
      </View>

      <GameModal
        visible={gameOver}
        score={score}
        coins={coins}
        gems={gems}
        creditsLeft={creditsLeft}
        totalCredits={totalCredits}
        onRestart={handleRestart}
        onEarnCredit={addCredit}
        onHome={() => router.push('/')}
      />
    </View>
  );
}
