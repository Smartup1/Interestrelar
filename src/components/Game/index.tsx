import React, { useRef, useEffect, useState } from "react";
import { View, PanResponder, TouchableOpacity, Animated } from "react-native";
import Player from "../Player";
import HUD from "../HUD";
import GameModal from "../GameModal";
import GameRenderer from "./GameRenderer";
import { useGameLogic } from "./GameLogic";
import { useSounds } from "../../utils/useSounds";
import { createPulseAnimation } from "../../utils/animations";
import { WIDTH, HEIGHT, GAME_CONFIG } from "../../constants/gameConfig";
import styles from "./styles";

export default function Game() {
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

  // ✅ Ref para gameOver acessível dentro do PanResponder sem closure stale
  const gameOverRef = useRef(gameOver);
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // Ref para player acessível dentro do PanResponder
  const playerRef2 = useRef(player);
  useEffect(() => {
    playerRef2.current = player;
  }, [player]);

  // Controles para sons
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

  const handleRestart = () => {
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
      // ✅ Usa ref para decisão sempre atualizada
      onStartShouldSetPanResponder: () => !gameOverRef.current,
      onMoveShouldSetPanResponder: () => !gameOverRef.current,
      onPanResponderMove: (_, gesture) => {
        if (gameOverRef.current) return; // ✅ trava com ref, não closure

        const x = Math.max(0, Math.min(WIDTH - 40, gesture.moveX));
        const y = Math.max(0, Math.min(HEIGHT - 40, gesture.moveY));

        const dx = x - playerRef2.current.x;
        const dy = y - playerRef2.current.y;
        let angle = playerRef2.current.angle;

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          angle = Math.atan2(dx, -dy) * (180 / Math.PI);
        }

        updatePlayerPosition(x, y, angle);
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

      <TouchableOpacity
        activeOpacity={gameOver ? 1 : 0.7}
        onPressIn={handleShoot}
        onPressOut={stopShooting}
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
        disabled={gameOver}
      >
        <Player x={0} y={0} angle={player.angle} />
      </TouchableOpacity>

      <GameModal
        visible={gameOver}
        score={score}
        coins={coins}
        gems={gems}
        onRestart={handleRestart}
      />
    </View>
  );
}
