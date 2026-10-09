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
import { submitScore } from "../../services/ranking";
import { Text } from "react-native";

import styles from "./styles";

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
  // MOVIMENTO PELO DEDO
  //
  // Arrastar em qualquer ponto da tela move a nave (a nave anda
  // junto com o dedo, sem "pular" para baixo do dedo).
  // Um toque rápido, sem arrastar, dá 1 disparo.
  // ============================================================

  const handleShootRef = useRef(handleShoot);
  handleShootRef.current = handleShoot;

  const lastApply = useRef({ t: 0, x: 0, y: 0 });
  const followOffset = useRef({ x: 0, y: 0 });
  const angleRef = useRef(0);
  const easeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tamanho REAL da área do jogo (medido na tela). Começa com o
  // valor de gameConfig e é corrigido no onLayout do container.
  const screenSize = useRef({ w: WIDTH, h: HEIGHT });

  const BOX = GAME_CONFIG.PLAYER_BOX;
  const HALF_BOX = BOX / 2;
  // A caixa da nave é maior que a nave: esta folga deixa a ponta da
  // asa encostar na borda da tela dos dois lados.
  const SIDE_MARGIN = (BOX - GAME_CONFIG.PLAYER_BODY_WIDTH) / 2;

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

  const stopEase = () => {
    if (easeTimer.current) {
      clearInterval(easeTimer.current);
      easeTimer.current = null;
    }
  };

  // Ao soltar o dedo, a ponta volta suavemente para cima
  const easeToUpright = () => {
    stopEase();
    easeTimer.current = setInterval(() => {
      if (gameOverRef.current) {
        stopEase();
        return;
      }
      angleRef.current *= 0.55;
      if (Math.abs(angleRef.current) < 2) {
        angleRef.current = 0;
        stopEase();
      }
      const c = playerRef.current;
      updatePlayerPosition(c.x, c.y, angleRef.current);
    }, 40);
  };

  useEffect(() => () => stopEase(), []);

  // Posição da nave para um dedo em (fx, fy): a nave fica CENTRADA
  // no dedo (e um pouco acima, para o dedo não cobrir a nave).
  // Como segue o dedo na tela inteira, ela alcança qualquer ponto,
  // inclusive as bordas direita e esquerda.
  const targetFor = (fx: number, fy: number) => ({
    x: clampX(fx - HALF_BOX + followOffset.current.x),
    y: clampY(
      fy - GAME_CONFIG.PLAYER_FINGER_LIFT - HALF_BOX +
        followOffset.current.y
    ),
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        !gameOverRef.current,

      onMoveShouldSetPanResponder: () =>
        !gameOverRef.current,

      onPanResponderGrant: (_, gesture) => {
        stopEase();

        const c = playerRef.current;

        // Diferença entre onde a nave está e onde ficaria sob o dedo.
        // Ela vai sumindo aos poucos, então a nave "alcança" o dedo
        // sem dar um pulo.
        followOffset.current = {
          x: c.x - (gesture.x0 - HALF_BOX),
          y:
            c.y -
            (gesture.y0 - GAME_CONFIG.PLAYER_FINGER_LIFT - HALF_BOX),
        };

        lastApply.current = { t: 0, x: c.x, y: c.y };
      },

      onPanResponderMove: (_, gesture) => {
        if (gameOverRef.current) return;

        // Limita a ~30 atualizações por segundo (cada uma redesenha
        // o jogo; sem isso o toque deixava o jogo travado).
        const now = Date.now();
        if (now - lastApply.current.t < 33) return;

        followOffset.current.x *= 0.8;
        followOffset.current.y *= 0.8;

        const { x, y } = targetFor(gesture.moveX, gesture.moveY);

        // A ponta aponta para ONDE a nave está indo, para qualquer
        // lado: 0° = cima, 90° = direita, 180° = baixo, -90° = esquerda.
        const mx = x - lastApply.current.x;
        const my = y - lastApply.current.y;

        if (Math.hypot(mx, my) > 3) {
          const target = Math.atan2(mx, -my) * (180 / Math.PI);
          // caminho mais curto até o ângulo novo (passa pelo 180° sem girar ao contrário)
          const diff =
            ((target - angleRef.current + 540) % 360) - 180;
          angleRef.current += diff * 0.4;
          angleRef.current =
            ((angleRef.current + 540) % 360) - 180;
        }

        lastApply.current = { t: now, x, y };
        updatePlayerPosition(x, y, angleRef.current);
      },

      onPanResponderRelease: (_, gesture) => {
        if (gameOverRef.current) return;

        const tap =
          Math.abs(gesture.dx) < 10 && Math.abs(gesture.dy) < 10;

        if (!tap) {
          // posição final (a última pode ter sido ignorada pelo limite)
          const { x, y } = targetFor(gesture.moveX, gesture.moveY);
          updatePlayerPosition(x, y, angleRef.current);
        }

        easeToUpright();

        // Toque rápido (quase sem mover) = 1 disparo
        if (tap) {
          handleShootRef.current();
        }
      },

      onPanResponderTerminate: () => {
        easeToUpright();
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
          trail={trail}
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
			  angle={player.angle}
			  image={selectedShip?.image}
		   />
        </View>

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