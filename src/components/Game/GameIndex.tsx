import React, { useRef, useEffect, useState } from "react";
import { View, Pressable, Animated } from "react-native";
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
import { useTiltControl } from "../../hooks/useTiltControl";
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

  // Controle por inclinação do celular (substitui o arrastar com o dedo)
  const tiltRef = useTiltControl({
    enabled: !gameOver,
    updateIntervalMs: GAME_CONFIG.TILT_UPDATE_INTERVAL,
  });

  useEffect(() => {
    let raf: number;

    const moveLoop = () => {
      if (!gameOverRef.current) {
        const { x: rawX, y: rawY } = tiltRef.current;

        const dz = GAME_CONFIG.TILT_DEADZONE;
        const tx = Math.abs(rawX) > dz ? rawX : 0;
        const ty = Math.abs(rawY) > dz ? rawY : 0;

        // Converte inclinação (em G) em velocidade, limitada à velocidade máxima
        const vx = Math.max(
          -GAME_CONFIG.TILT_MAX_SPEED,
          Math.min(GAME_CONFIG.TILT_MAX_SPEED, tx * GAME_CONFIG.TILT_SENSITIVITY * GAME_CONFIG.TILT_MAX_SPEED)
        ) * GAME_CONFIG.TILT_INVERT_X;

        const vy = Math.max(
          -GAME_CONFIG.TILT_MAX_SPEED,
          Math.min(GAME_CONFIG.TILT_MAX_SPEED, ty * GAME_CONFIG.TILT_SENSITIVITY * GAME_CONFIG.TILT_MAX_SPEED)
        ) * GAME_CONFIG.TILT_INVERT_Y;

        if (vx !== 0 || vy !== 0) {
          const nx = Math.max(0, Math.min(WIDTH - 40, playerRef2.current.x + vx));
          const ny = Math.max(0, Math.min(HEIGHT - 40, playerRef2.current.y + vy));

          const dx = nx - playerRef2.current.x;
          const dy = ny - playerRef2.current.y;
          let angle = playerRef2.current.angle;

          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            angle = Math.atan2(dx, -dy) * (180 / Math.PI);
          }

          updatePlayerPosition(nx, ny, angle);
        }
      }

      raf = requestAnimationFrame(moveLoop);
    };

    raf = requestAnimationFrame(moveLoop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Pressable
      style={styles.container}
      onPressIn={handleShoot}
      onPressOut={stopShooting}
      disabled={gameOver}
    >
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

      {/* Nave: posição controlada pela inclinação do celular, não mais pelo toque */}
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
    </Pressable>
  );
}
