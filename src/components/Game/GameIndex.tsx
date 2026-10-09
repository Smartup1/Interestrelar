import React, { useRef, useEffect, useState } from "react";
import {
  View,
  PanResponder,
  Animated,
} from "react-native";

import { useRouter } from "expo-router";
import { useShips } from "../../hooks/useShips";
import Player from "../Player";
import HUD from "../HUD";
import GameModal from "../GameModal/GameModal";
import GameRenderer, { ShieldEffect } from "./GameRenderer";

import { useGameLogic } from "./GameLogic";
import { useSounds } from "../../utils/useSounds";
import { createPulseAnimation } from "../../utils/animations";

import {
  WIDTH,
  HEIGHT,
  GAME_CONFIG,
} from "../../constants/gameConfig";

import { useDailyCredits } from "../../hooks/useDailyCredits";
import { submitScore } from "../../services/ranking";
import { Text } from "react-native";

import styles from "./styles";

const EMPTY_TRAIL: never[] = [];

export default function Game() {
  // ============================================================
  // ROUTER
  // ============================================================

  const router = useRouter();
  const { selectedShip } = useShips();
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

    weaponLevel,
    banner,

    bullets,
    enemyBullets,
    powerUps,
    boss,
    explosions,
    trail,
    obstacles,
    collectibles,
    player,

    shoot,
    restartGame,
    movePlayer,
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
      resetMotion();

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
  // MOVIMENTO PELO DEDO
  //
  // Arrastar em qualquer ponto da tela move a nave (a nave anda
  // junto com o dedo, sem "pular" para baixo do dedo).
  // Um toque rápido, sem arrastar, dá 1 disparo.
  // ============================================================

  const handleShootRef = useRef(handleShoot);
  handleShootRef.current = handleShoot;

  // ============================================================
  // MOVIMENTO DA NAVE
  //
  // O dedo só define um ALVO. Um loop (~60 fps) faz a nave "voar"
  // até o alvo, com mola + limite de velocidade, e move a nave com
  // Animated, SEM redesenhar o jogo inteiro. Por isso fica leve.
  // Os números de ajuste estão em gameConfig.tsx (SHIP_*).
  // ============================================================

  const BOX = GAME_CONFIG.PLAYER_BOX;
  const HALF_BOX = BOX / 2;
  // Folga para a ponta da asa encostar na borda da tela dos dois lados
  const SIDE_MARGIN = (BOX - GAME_CONFIG.PLAYER_BODY_WIDTH) / 2;

  const startX = WIDTH * 0.5 - HALF_BOX;
  const startY = HEIGHT * 0.8;

  const shipPos = useRef(
    new Animated.ValueXY({ x: startX, y: startY })
  ).current;
  const shipAngle = useRef(new Animated.Value(0)).current;

  const motion = useRef({
    x: startX,
    y: startY,
    tx: startX,
    ty: startY,
    angle: 0,
    dragging: false,
  }).current;

  // Tamanho REAL da área do jogo (medido no layout do container)
  const screenSize = useRef({ w: WIDTH, h: HEIGHT });

  const clampX = (x: number) =>
    Math.max(
      -SIDE_MARGIN,
      Math.min(screenSize.current.w - BOX + SIDE_MARGIN, x)
    );

  const clampY = (y: number) =>
    Math.max(
      GAME_CONFIG.PLAYER_MIN_Y,
      Math.min(screenSize.current.h - BOX, y)
    );

  const resetMotion = () => {
    motion.x = startX;
    motion.y = startY;
    motion.tx = startX;
    motion.ty = startY;
    motion.angle = 0;
    motion.dragging = false;
    shipPos.setValue({ x: startX, y: startY });
    shipAngle.setValue(0);
    movePlayer(startX, startY);
  };

  // Posição-alvo da nave para um dedo em (fx, fy).
  // LATERAL_CURVE > 1 deixa o controle mais fino perto do centro
  // (anda menos de lado), mas a nave ainda chega nas bordas.
  const toTarget = (fx: number, fy: number) => {
    const w = screenSize.current.w;
    const u = Math.max(-1, Math.min(1, (fx - w / 2) / (w / 2)));
    const cu =
      Math.sign(u) * Math.pow(Math.abs(u), GAME_CONFIG.LATERAL_CURVE);
    const cx = w / 2 + cu * (w / 2);

    return {
      x: clampX(cx - HALF_BOX),
      y: clampY(fy - GAME_CONFIG.PLAYER_FINGER_LIFT - HALF_BOX),
    };
  };

  // Loop de movimento (não usa React state)
  useEffect(() => {
    let raf = 0;
    let last = Date.now();

    const {
      SHIP_STIFFNESS,
      SHIP_MAX_SPEED_X,
      SHIP_MAX_SPEED_Y,
      SHIP_TURN_RATE,
      SHIP_MIN_TURN_SPEED,
      SHIP_MAX_TURN,
    } = GAME_CONFIG;

    const frame = () => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!gameOverRef.current && dt > 0) {
        const m = motion;

        // Velocidade proporcional à distância do alvo (mola),
        // com limite de velocidade (lado menor que cima/baixo)
        const vx = Math.max(
          -SHIP_MAX_SPEED_X,
          Math.min(SHIP_MAX_SPEED_X, (m.tx - m.x) * SHIP_STIFFNESS)
        );
        const vy = Math.max(
          -SHIP_MAX_SPEED_Y,
          Math.min(SHIP_MAX_SPEED_Y, (m.ty - m.y) * SHIP_STIFFNESS)
        );

        m.x += vx * dt;
        m.y += vy * dt;

        // A ponta aponta para onde a nave está indo (0° = cima,
        // 90° = direita, 180° = baixo, -90° = esquerda). Parada,
        // ela volta suavemente para cima.
        const speed = Math.hypot(vx, vy);

        if (speed > SHIP_MIN_TURN_SPEED) {
          let target = Math.atan2(vx, -vy) * (180 / Math.PI);
          target = Math.max(-SHIP_MAX_TURN, Math.min(SHIP_MAX_TURN, target));

          // caminho mais curto até o ângulo novo
          const diff = ((target - m.angle + 540) % 360) - 180;
          m.angle += diff * Math.min(1, dt * SHIP_TURN_RATE);
          m.angle = ((m.angle + 540) % 360) - 180;
        } else {
          m.angle -= m.angle * Math.min(1, dt * 6);
        }

        movePlayer(m.x, m.y); // engine (colisões, tiros)
        shipPos.setValue({ x: m.x, y: m.y }); // tela
        shipAngle.setValue(m.angle);
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        !gameOverRef.current,

      onMoveShouldSetPanResponder: () =>
        !gameOverRef.current,

      onPanResponderGrant: () => {
        motion.dragging = false;
      },

      onPanResponderMove: (_, gesture) => {
        if (gameOverRef.current) return;

        // Só vira "arrastar" depois de mexer um pouco;
        // um toque parado é um disparo, não move a nave.
        if (!motion.dragging) {
          if (
            Math.hypot(gesture.dx, gesture.dy) <
            GAME_CONFIG.TAP_MOVE_THRESHOLD
          ) {
            return;
          }
          motion.dragging = true;
        }

        const t = toTarget(gesture.moveX, gesture.moveY);
        motion.tx = t.x;
        motion.ty = t.y;
      },

      onPanResponderRelease: () => {
        if (gameOverRef.current) return;

        // Toque rápido (sem arrastar) = 1 disparo
        if (!motion.dragging) {
          handleShootRef.current();
        }
        motion.dragging = false;
      },

      onPanResponderTerminate: () => {
        motion.dragging = false;
      },
    })
  ).current;

  // ============================================================
  // RANKING: salva o resultado quando a partida termina
  // ============================================================

  const scoreSaved = useRef(false);

  useEffect(() => {
    if (!gameOver) {
      scoreSaved.current = false;
      return;
    }

    if (scoreSaved.current) return;
    scoreSaved.current = true;

    void submitScore({
      score,
      coins,
      gems,
      shipId: selectedShip?.id,
    });
  }, [gameOver]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        screenSize.current = {
          w: e.nativeEvent.layout.width,
          h: e.nativeEvent.layout.height,
        };
      }}
      {...panResponder.panHandlers}
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
          trail={EMPTY_TRAIL}
          collectibles={
            collectibles
          }
          obstacles={
            obstacles
          }
          bullets={bullets}
          enemyBullets={enemyBullets}
          powerUps={powerUps}
          boss={boss}
          explosions={
            explosions
          }
          shield={false}
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

        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 90,
            height: 90,
            zIndex: 10,
            transform: shipPos.getTranslateTransform(),
          }}
        >
          {shield && (
            <ShieldEffect player={{ x: 25, y: 25, angle: 0 }} />
          )}

          {/* A nave (60x60) fica no CENTRO da caixa de 90x90 e gira em torno dele */}
          <Animated.View
            style={{
              position: "absolute",
              left: 15,
              top: 15,
              width: 60,
              height: 60,
              transform: [
                {
                  rotate: shipAngle.interpolate({
                    inputRange: [-180, 180],
                    outputRange: ["-180deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <Player
              x={0}
              y={0}
              angle={0}
              image={selectedShip?.image}
            />
          </Animated.View>
        </Animated.View>

        {/* ====================================================
            NÍVEL DE TIRO
        ==================================================== */}

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 98,
            left: 14,
            zIndex: 15,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 9,
            paddingVertical: 5,
            borderRadius: 12,
            backgroundColor: "rgba(0,0,20,0.55)",
            borderWidth: 1,
            borderColor: "rgba(255,170,0,0.5)",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: "#ffb300",
              fontWeight: "800",
              letterSpacing: 1,
              marginRight: 6,
            }}
          >
            TIRO
          </Text>

          {Array.from({
            length: GAME_CONFIG.MAX_WEAPON_LEVEL,
          }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 10,
                height: 10,
                marginRight: 3,
                borderRadius: 2,
                backgroundColor:
                  i < weaponLevel
                    ? "#ffb300"
                    : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </View>

        {/* ====================================================
            AVISOS (POWER UP / CHEFÃO)
        ==================================================== */}

        {banner && !gameOver && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: HEIGHT * 0.28,
              left: 0,
              right: 0,
              alignItems: "center",
              zIndex: 30,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "#ffffff",
                letterSpacing: 3,
                textAlign: "center",
                textShadowColor: "#ff6a00",
                textShadowRadius: 12,
              }}
            >
              {banner.text}
            </Text>
          </View>
        )}

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
  );
}