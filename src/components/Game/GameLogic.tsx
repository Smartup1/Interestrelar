import { useRef, useState, useEffect } from "react";

import {
  WIDTH,
  HEIGHT,
  GAME_CONFIG,
} from "../../constants/gameConfig";

import {
  PlayerPosition,
  Bullet,
  Explosion,
  Trail,
  Obstacle,
  Collectible,
} from "../../types/game";

import {
  randomObstacle,
  createInitialObstacles,
} from "../../utils/obstacles";

import {
  randomCoin,
  createInitialCollectibles,
} from "../../utils/collectibles";

/**
 * ============================================================
 * MULTIPLICADOR DE DIFICULDADE
 * ============================================================
 *
 * 0       -> 1.0x
 * 500     -> 1.1x
 * 1000    -> 1.2x
 * 1500    -> 1.3x
 * 2000    -> 1.4x
 * 2500    -> 1.5x
 * 3000    -> 1.6x
 * 3500+   -> 1.7x
 */

function getSpeedMultiplier(score: number): number {
  return Math.min(
    1.0 + Math.floor(score / 500) * 0.1,
    1.7
  );
}

/**
 * ============================================================
 * GAME LOGIC
 * ============================================================
 */

export function useGameLogic() {

  // ==========================================================
  // ESTADOS PRINCIPAIS
  // ==========================================================

  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [shield, setShield] = useState(false);

  // ==========================================================
  // ENTIDADES DO JOGO
  // ==========================================================

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [trail, setTrail] = useState<Trail[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] =
    useState<Collectible[]>([]);

  // ==========================================================
  // PLAYER
  // ==========================================================

  const [player, setPlayer] =
    useState<PlayerPosition>({
      x: WIDTH * 0.5,
      y: HEIGHT * 0.8,
      angle: 0,
    });

  // ==========================================================
  // IDS
  // ==========================================================

  const bulletId = useRef(0);
  const explosionId = useRef(0);
  const obstacleId = useRef(100);
  const collectibleId = useRef(1000);
  const trailId = useRef(0);

  // ==========================================================
  // REFS DA GAME ENGINE
  // ==========================================================

  const playerRef = useRef({
    x: WIDTH * 0.5,
    y: HEIGHT * 0.8,
  });

  const tickRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const livesRef = useRef(3);

  const shieldRef = useRef(false);
  const gameOverRef = useRef(false);

  const bulletsRef = useRef<Bullet[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef =
    useRef<Collectible[]>([]);

  // ==========================================================
  // SINCRONIZAÇÕES
  // ==========================================================

  useEffect(() => {
    shieldRef.current = shield;
  }, [shield]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // ==========================================================
  // INICIALIZAÇÃO DO CENÁRIO
  // ==========================================================

  useEffect(() => {

    const initialObstacles =
      createInitialObstacles(
        GAME_CONFIG.OBSTACLE_COUNT
      );

    const initialCollectibles =
      createInitialCollectibles();

    obstaclesRef.current =
      initialObstacles;

    collectiblesRef.current =
      initialCollectibles;

    setObstacles(initialObstacles);
    setCollectibles(initialCollectibles);

  }, []);

  // ==========================================================
  // GAME LOOP
  // ==========================================================

  useEffect(() => {

    const loop = setInterval(() => {

      // ------------------------------------------------------
      // GAME OVER
      // ------------------------------------------------------

      if (gameOverRef.current) {
        return;
      }

      tickRef.current++;

      // ------------------------------------------------------
      // SCORE AUTOMÁTICO
      // ------------------------------------------------------

      const nextScore =
        scoreRef.current + 1;

      scoreRef.current =
        nextScore;

      setScore(nextScore);

      // ------------------------------------------------------
      // DIFICULDADE
      // ------------------------------------------------------

      const speedMult =
        getSpeedMultiplier(nextScore);

      // ------------------------------------------------------
      // VARIÁVEIS DO FRAME
      // ------------------------------------------------------

      let nextBullets: Bullet[] = [];

      let nextObstacles =
        obstaclesRef.current;

      let scoreBonus = 0;
      let comboIncrease = 0;

      const newExplosions: Explosion[] =
        [];

      // ======================================================
      // 1. BALAS
      // ======================================================

      for (
        const bullet of bulletsRef.current
      ) {

        const nx =
          bullet.x + bullet.vx;

        const ny =
          bullet.y + bullet.vy;

        // ----------------------------------------------------
        // BALA FORA DA TELA
        // ----------------------------------------------------

        if (
          nx < -20 ||
          nx > WIDTH + 20 ||
          ny < -20 ||
          ny > HEIGHT + 20
        ) {
          continue;
        }

        let hit = false;

        // ----------------------------------------------------
        // COLISÃO COM OBSTÁCULOS
        // ----------------------------------------------------

        nextObstacles =
          nextObstacles.map(
            (obstacle) => {

              const hitObstacle =
                !hit &&
                Math.abs(
                  obstacle.x - nx
                ) < 35 &&
                Math.abs(
                  obstacle.y - ny
                ) < 35;

              if (hitObstacle) {

                hit = true;

                // Pontuação
                scoreBonus += 50;

                // Combo
                comboIncrease += 1;

                // Explosão
                newExplosions.push({
                  id:
                    explosionId.current++,
                  x: obstacle.x,
                  y: obstacle.y,
                });

                // Recria obstáculo
                return randomObstacle(
                  obstacleId.current++
                );
              }

              return obstacle;
            }
          );

        // ----------------------------------------------------
        // MANTÉM BALA SE NÃO ACERTOU
        // ----------------------------------------------------

        if (!hit) {

          nextBullets.push({
            ...bullet,
            x: nx,
            y: ny,
          });

        }
      }

      // Atualiza balas
      bulletsRef.current =
        nextBullets;

      // ======================================================
      // SCORE EXTRA
      // ======================================================

      if (scoreBonus > 0) {

        scoreRef.current +=
          scoreBonus;

        setScore(
          scoreRef.current
        );
      }

      // ======================================================
      // COMBO
      // ======================================================

      if (comboIncrease > 0) {

        comboRef.current +=
          comboIncrease;

        setCombo(
          comboRef.current
        );
      }

      // ======================================================
      // EXPLOSÕES
      // ======================================================

      if (
        newExplosions.length > 0
      ) {

        const updatedExplosions =
          [
            ...explosionsRef.current,
            ...newExplosions,
          ].slice(-10);

        explosionsRef.current =
          updatedExplosions;

        setExplosions(
          updatedExplosions
        );
      }

      // ======================================================
      // 2. OBSTÁCULOS
      // ======================================================

      nextObstacles =
        nextObstacles.map(
          (obstacle) => {

            // ------------------------------------------------
            // MOVIMENTO HORIZONTAL
            // ------------------------------------------------

            const nx =
              obstacle.drift
                ? obstacle.x +
                  Math.sin(
                    tickRef.current *
                      0.05 +
                      obstacle.driftPhase
                  ) *
                    1.5
                : obstacle.x;

            // ------------------------------------------------
            // MOVIMENTO VERTICAL
            // ------------------------------------------------

            const ny =
              obstacle.y +
              3 *
                obstacle.speedMult *
                speedMult;

            // ------------------------------------------------
            // SAIU DA TELA
            // ------------------------------------------------

            if (
              ny >
              HEIGHT + 60
            ) {

              return randomObstacle(
                obstacleId.current++
              );
            }

            // ------------------------------------------------
            // COLISÃO COM PLAYER
            // ------------------------------------------------

            const hitPlayer =
              Math.abs(
                nx -
                  playerRef.current.x
              ) < 30 &&
              Math.abs(
                ny -
                  playerRef.current.y
              ) < 30;

            if (hitPlayer) {

              // ----------------------------------------------
              // SEM SHIELD
              // ----------------------------------------------

              if (
                !shieldRef.current
              ) {

                livesRef.current -= 1;

                setLives(
                  livesRef.current
                );

                // --------------------------------------------
                // GAME OVER
                // --------------------------------------------

                if (
                  livesRef.current <= 0
                ) {

                  gameOverRef.current =
                    true;

                  setGameOver(true);
                }
              }

              // Reposiciona obstáculo
              return randomObstacle(
                obstacleId.current++
              );
            }

            // ------------------------------------------------
            // OBSTÁCULO ATUALIZADO
            // ------------------------------------------------

            return {
              ...obstacle,
              x: nx,
              y: ny,
            };
          }
        );

      obstaclesRef.current =
        nextObstacles;

      // ======================================================
      // 3. COLETÁVEIS
      // ======================================================

      const nextCollectibles =
        collectiblesRef.current.map(
          (collectible) => {

            // ------------------------------------------------
            // MOVIMENTO
            // ------------------------------------------------

            const ny =
              collectible.y +
              collectible.speed *
                speedMult;

            // ------------------------------------------------
            // COLISÃO
            // ------------------------------------------------

            const hitPlayer =
              Math.abs(
                collectible.x -
                  playerRef.current.x
              ) < 35 &&
              Math.abs(
                ny -
                  playerRef.current.y
              ) < 35;

            if (hitPlayer) {

              // ----------------------------------------------
              // ITEM ESPECIAL / GEM
              // ----------------------------------------------

              if (
                collectible.special
              ) {

                setGems(
                  (g) => g + 1
                );

                shieldRef.current =
                  true;

                setShield(true);

                setTimeout(() => {

                  shieldRef.current =
                    false;

                  setShield(false);

                }, GAME_CONFIG.SHIELD_DURATION);

              }

              // ----------------------------------------------
              // MOEDA
              // ----------------------------------------------

              else {

                setCoins(
                  (c) => c + 1
                );
              }

              return randomCoin(
                collectibleId.current++,
                collectible.special
              );
            }

            // ------------------------------------------------
            // SAIU DA TELA
            // ------------------------------------------------

            if (
              ny >
              HEIGHT + 60
            ) {

              return randomCoin(
                collectibleId.current++,
                collectible.special
              );
            }

            // ------------------------------------------------
            // ATUALIZA
            // ------------------------------------------------

            return {
              ...collectible,
              y: ny,
            };
          }
        );

      collectiblesRef.current =
        nextCollectibles;

      // ======================================================
      // SINCRONIZA COM REACT
      // ======================================================

      setBullets(
        nextBullets
      );

      setObstacles(
        nextObstacles
      );

      setCollectibles(
        nextCollectibles
      );

    }, GAME_CONFIG.GAME_LOOP_INTERVAL);

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      clearInterval(loop);
    };

  }, []);

  // ==========================================================
  // SHOOT
  // ==========================================================
  //
  // UM TOQUE = UM DISPARO
  //
  // Não existe mais disparo automático.
  // Não existe intervalo de tiro.
  // ==========================================================

  function shoot() {

    if (
      gameOverRef.current
    ) {
      return;
    }

    const {
      x,
      y,
    } = playerRef.current;

    const newBullets: Bullet[] = [

      ...bulletsRef.current,

      {
        id:
          bulletId.current++,

        x:
          x + 5,

        y,

        vx: 0,

        vy: -14,
      },

      {
        id:
          bulletId.current++,

        x:
          x + 25,

        y,

        vx: 0,

        vy: -14,
      },
    ];

    // Atualiza engine
    bulletsRef.current =
      newBullets;

    // Atualiza UI
    setBullets(
      newBullets
    );
  }

  // ==========================================================
  // RESTART GAME
  // ==========================================================

  function restartGame() {

    // --------------------------------------------------------
    // NOVOS OBJETOS
    // --------------------------------------------------------

    const initialObstacles =
      createInitialObstacles(
        GAME_CONFIG.OBSTACLE_COUNT
      );

    const initialCollectibles =
      createInitialCollectibles();

    // --------------------------------------------------------
    // POSIÇÃO INICIAL
    // --------------------------------------------------------

    const startX =
      WIDTH * 0.5;

    const startY =
      HEIGHT * 0.8;

    // ========================================================
    // RESET REFS
    // ========================================================

    scoreRef.current = 0;

    comboRef.current = 0;

    livesRef.current = 3;

    shieldRef.current = false;

    gameOverRef.current = false;

    tickRef.current = 0;

    bulletsRef.current = [];

    explosionsRef.current = [];

    obstaclesRef.current =
      initialObstacles;

    collectiblesRef.current =
      initialCollectibles;

    playerRef.current = {
      x: startX,
      y: startY,
    };

    // ========================================================
    // RESET STATES
    // ========================================================

    setScore(0);

    setCoins(0);

    setGems(0);

    setCombo(0);

    setLives(3);

    setShield(false);

    setGameOver(false);

    setBullets([]);

    setExplosions([]);

    setTrail([]);

    setObstacles(
      initialObstacles
    );

    setCollectibles(
      initialCollectibles
    );

    setPlayer({
      x: startX,
      y: startY,
      angle: 0,
    });
  }

  // ==========================================================
  // UPDATE PLAYER
  // ==========================================================

  function updatePlayerPosition(
    x: number,
    y: number,
    angle: number
  ) {

    if (
      gameOverRef.current
    ) {
      return;
    }

    // --------------------------------------------------------
    // ENGINE
    // --------------------------------------------------------

    playerRef.current = {
      x,
      y,
    };

    // --------------------------------------------------------
    // UI
    // --------------------------------------------------------

    setPlayer({
      x,
      y,
      angle,
    });

    // --------------------------------------------------------
    // TRAIL
    // --------------------------------------------------------

    setTrail(
      (prev) => {

        const newTrail = [
          {
            id:
              trailId.current++,
            x,
            y,
          },
          ...prev,
        ];

        return newTrail.slice(
          0,
          6
        );
      }
    );
  }

  // ==========================================================
  // RETORNO
  // ==========================================================

  return {

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

    // UM TOQUE = UM TIRO
    shoot,

    restartGame,

    updatePlayerPosition,

    setGameOver,
  };
}