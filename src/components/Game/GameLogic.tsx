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
 * A dificuldade aumenta progressivamente conforme o score.
 *
 * 0       -> 1.0x
 * 500     -> 1.1x
 * 1000    -> 1.2x
 * 1500    -> 1.3x
 * 2000    -> 1.4x
 * 2500    -> 1.5x
 * 3000    -> 1.6x
 * 3500+   -> 1.7x
 *
 * Antes:
 * 1x -> 2x -> 3x -> 4x ... -> 30x
 *
 * Isso poderia tornar o jogo impossível em scores altos.
 */

function getSpeedMultiplier(score: number): number {
  const min = 1.0;
  const max = 1.7;

  const increase = Math.floor(score / 500) * 0.1;

  return Math.min(min + increase, max);
}

export function useGameLogic() {
  /**
   * ============================================================
   * ESTADOS DO REACT
   * ============================================================
   */

  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [trail, setTrail] = useState<Trail[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] =
    useState<Collectible[]>([]);

  const [shield, setShield] = useState(false);

  const [player, setPlayer] =
    useState<PlayerPosition>({
      x: WIDTH * 0.5,
      y: HEIGHT * 0.8,
      angle: 0,
    });

  /**
   * ============================================================
   * IDS
   * ============================================================
   */

  const bulletId = useRef(0);
  const explosionId = useRef(0);
  const obstacleId = useRef(100);
  const collectibleId = useRef(1000);
  const trailId = useRef(0);

  /**
   * ============================================================
   * REFS DO PLAYER / GAME
   * ============================================================
   *
   * Esses refs são utilizados pelo Game Loop.
   *
   * O objetivo é evitar que o loop precise depender dos estados
   * do React e seja recriado toda vez que shield/gameOver mudar.
   */

  const playerRef = useRef({
    x: WIDTH * 0.5,
    y: HEIGHT * 0.8,
  });

  const tickRef = useRef(0);

  const scoreRef = useRef(0);

  /**
   * ============================================================
   * REFS DO ENGINE
   * ============================================================
   *
   * O Game Loop trabalha principalmente com esses refs.
   *
   * Depois do cálculo, sincronizamos com o React.
   */

  const bulletsRef = useRef<Bullet[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef =
    useRef<Collectible[]>([]);

  const comboRef = useRef(0);
  const livesRef = useRef(3);
  const shieldRef = useRef(false);
  const gameOverRef = useRef(false);

  /**
   * ============================================================
   * SHOOTING
   * ============================================================
   */

  const shootIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  /**
   * ============================================================
   * SINCRONIZAÇÃO DOS REFS
   * ============================================================
   */

  useEffect(() => {
    shieldRef.current = shield;
  }, [shield]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  /**
   * ============================================================
   * INICIALIZAÇÃO
   * ============================================================
   */

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

    return () => {
      if (shootIntervalRef.current) {
        clearInterval(
          shootIntervalRef.current
        );

        shootIntervalRef.current = null;
      }
    };
  }, []);

  /**
   * ============================================================
   * GAME LOOP
   * ============================================================
   *
   * IMPORTANTE:
   *
   * O loop agora possui dependências [].
   *
   * Portanto ele não é destruído/recriado quando:
   *
   * - shield muda
   * - gameOver muda
   * - score muda
   * - player muda
   *
   * O estado interno é lido através dos refs.
   */

  useEffect(() => {
    const loop = setInterval(() => {
      /**
       * Se o jogo acabou, não processa o frame.
       */

      if (gameOverRef.current) {
        return;
      }

      tickRef.current++;

      /**
       * ========================================================
       * SCORE
       * ========================================================
       */

      const nextScore =
        scoreRef.current + 1;

      scoreRef.current = nextScore;

      setScore(nextScore);

      /**
       * Calcula a dificuldade usando o score atual.
       */

      const speedMult =
        getSpeedMultiplier(nextScore);

      /**
       * ========================================================
       * BALAS
       * ========================================================
       */

      let nextBullets: Bullet[] = [];

      let nextObstacles =
        obstaclesRef.current;

      let scoreBonus = 0;
      let comboIncrease = 0;

      const newExplosions: Explosion[] =
        [];

      /**
       * Processa cada bala.
       */

      for (const bullet of bulletsRef.current) {
        const nx =
          bullet.x + bullet.vx;

        const ny =
          bullet.y + bullet.vy;

        /**
         * Bala saiu da tela.
         */

        if (
          nx < -20 ||
          nx > WIDTH + 20 ||
          ny < -20 ||
          ny > HEIGHT + 20
        ) {
          continue;
        }

        let hit = false;

        /**
         * Verifica colisão da bala
         * com os obstáculos.
         */

        nextObstacles =
          nextObstacles.map(
            (obstacle) => {
              if (
                !hit &&
                Math.abs(
                  obstacle.x - nx
                ) < 35 &&
                Math.abs(
                  obstacle.y - ny
                ) < 35
              ) {
                hit = true;

                /**
                 * Pontuação por destruir obstáculo.
                 */

                scoreBonus += 50;

                comboIncrease += 1;

                /**
                 * Cria explosão.
                 */

                newExplosions.push({
                  id:
                    explosionId.current++,
                  x: obstacle.x,
                  y: obstacle.y,
                });

                /**
                 * Reposiciona obstáculo.
                 */

                return randomObstacle(
                  obstacleId.current++
                );
              }

              return obstacle;
            }
          );

        /**
         * Se não acertou nada,
         * mantém a bala.
         */

        if (!hit) {
          nextBullets.push({
            ...bullet,
            x: nx,
            y: ny,
          });
        }
      }

      /**
       * Atualiza ref das balas.
       */

      bulletsRef.current =
        nextBullets;

      /**
       * ========================================================
       * SCORE EXTRA
       * ========================================================
       */

      if (scoreBonus > 0) {
        scoreRef.current +=
          scoreBonus;

        setScore(
          scoreRef.current
        );
      }

      /**
       * ========================================================
       * COMBO
       * ========================================================
       */

      if (comboIncrease > 0) {
        comboRef.current +=
          comboIncrease;

        setCombo(
          comboRef.current
        );
      }

      /**
       * ========================================================
       * EXPLOSÕES
       * ========================================================
       */

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

      /**
       * ========================================================
       * MOVIMENTO DOS OBSTÁCULOS
       * ========================================================
       */

      nextObstacles =
        nextObstacles.map(
          (obstacle) => {
            let nx = obstacle.x;

            /**
             * Movimento lateral.
             */

            if (obstacle.drift) {
              nx =
                obstacle.x +
                Math.sin(
                  tickRef.current *
                    0.05 +
                    obstacle.driftPhase
                ) *
                  1.5;
            }

            /**
             * Movimento vertical.
             *
             * speedMult é o multiplicador
             * global da dificuldade.
             */

            const ny =
              obstacle.y +
              3 *
                obstacle.speedMult *
                speedMult;

            /**
             * ==================================================
             * SAIU DA TELA
             * ==================================================
             */

            if (
              ny >
              HEIGHT + 60
            ) {
              return randomObstacle(
                obstacleId.current++
              );
            }

            /**
             * ==================================================
             * COLISÃO COM PLAYER
             * ==================================================
             */

            if (
              Math.abs(
                nx -
                  playerRef.current.x
              ) < 30 &&
              Math.abs(
                ny -
                  playerRef.current.y
              ) < 30
            ) {
              /**
               * Só perde vida se não tiver shield.
               */

              if (
                !shieldRef.current
              ) {
                livesRef.current -=
                  1;

                setLives(
                  livesRef.current
                );

                /**
                 * Game Over.
                 */

                if (
                  livesRef.current <=
                  0
                ) {
                  gameOverRef.current =
                    true;

                  setGameOver(true);
                }
              }

              /**
               * Remove/reposiciona obstáculo.
               */

              return randomObstacle(
                obstacleId.current++
              );
            }

            /**
             * Retorna obstáculo atualizado.
             */

            return {
              ...obstacle,
              x: nx,
              y: ny,
            };
          }
        );

      /**
       * Atualiza ref dos obstáculos.
       */

      obstaclesRef.current =
        nextObstacles;

      /**
       * ========================================================
       * COLETÁVEIS
       * ========================================================
       */

      const nextCollectibles =
        collectiblesRef.current.map(
          (collectible) => {
            /**
             * Movimento do coletável.
             */

            const ny =
              collectible.y +
              collectible.speed *
                speedMult;

            /**
             * ==================================================
             * COLISÃO COM PLAYER
             * ==================================================
             */

            if (
              Math.abs(
                collectible.x -
                  playerRef.current.x
              ) < 35 &&
              Math.abs(
                ny -
                  playerRef.current.y
              ) < 35
            ) {
              /**
               * GEM / SHIELD
               */

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

              /**
               * MOEDA
               */

              else {
                setCoins(
                  (m) => m + 1
                );
              }

              /**
               * Reposiciona coletável.
               */

              return randomCoin(
                collectibleId.current++,
                collectible.special
              );
            }

            /**
             * ==================================================
             * COLETÁVEL SAIU DA TELA
             * ==================================================
             */

            if (
              ny >
              HEIGHT + 60
            ) {
              return randomCoin(
                collectibleId.current++,
                collectible.special
              );
            }

            /**
             * Atualiza posição.
             */

            return {
              ...collectible,
              y: ny,
            };
          }
        );

      /**
       * Atualiza ref.
       */

      collectiblesRef.current =
        nextCollectibles;

      /**
       * ========================================================
       * SINCRONIZA COM REACT
       * ========================================================
       *
       * Aqui enviamos os resultados calculados
       * pelo engine para os componentes visuais.
       */

      setBullets(nextBullets);

      setObstacles(
        nextObstacles
      );

      setCollectibles(
        nextCollectibles
      );
    }, GAME_CONFIG.GAME_LOOP_INTERVAL);

    /**
     * Cleanup do loop.
     */

    return () => {
      clearInterval(loop);
    };
  }, []);

  /**
   * ============================================================
   * SHOOT
   * ============================================================
   */

  function shoot() {
    if (gameOverRef.current) {
      return;
    }

    /**
     * Usa playerRef em vez do estado player.
     *
     * Isso evita problema de closure stale.
     */

    const playerX =
      playerRef.current.x;

    const playerY =
      playerRef.current.y;

    const newBullets: Bullet[] = [
      ...bulletsRef.current,

      {
        id: bulletId.current++,
        x: playerX + 5,
        y: playerY,
        vx: 0,
        vy: -14,
      },

      {
        id: bulletId.current++,
        x: playerX + 25,
        y: playerY,
        vx: 0,
        vy: -14,
      },
    ];

    /**
     * Atualiza primeiro o engine.
     */

    bulletsRef.current =
      newBullets;

    /**
     * Depois o React.
     */

    setBullets(newBullets);
  }

  /**
   * ============================================================
   * START SHOOTING
   * ============================================================
   */

  function startShooting() {
    if (gameOverRef.current) {
      return;
    }

    /**
     * Evita múltiplos intervals.
     */

    if (shootIntervalRef.current) {
      clearInterval(
        shootIntervalRef.current
      );

      shootIntervalRef.current =
        null;
    }

    /**
     * Primeiro tiro imediato.
     */

    shoot();

    /**
     * Depois tiros automáticos.
     */

    shootIntervalRef.current =
      setInterval(() => {
        if (
          !gameOverRef.current
        ) {
          shoot();
        }
      }, GAME_CONFIG.SHOOT_INTERVAL);
  }

  /**
   * ============================================================
   * STOP SHOOTING
   * ============================================================
   */

  function stopShooting() {
    if (
      shootIntervalRef.current
    ) {
      clearInterval(
        shootIntervalRef.current
      );

      shootIntervalRef.current =
        null;
    }
  }

  /**
   * ============================================================
   * RESTART GAME
   * ============================================================
   */

  function restartGame() {
    /**
     * Cria objetos iniciais.
     */

    const initialObstacles =
      createInitialObstacles(
        GAME_CONFIG.OBSTACLE_COUNT
      );

    const initialCollectibles =
      createInitialCollectibles();

    /**
     * ========================================================
     * RESET DOS REFS
     * ========================================================
     */

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

    /**
     * ========================================================
     * RESET DO REACT
     * ========================================================
     */

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

    /**
     * ========================================================
     * RESET PLAYER
     * ========================================================
     */

    const startX =
      WIDTH * 0.5;

    const startY =
      HEIGHT * 0.8;

    playerRef.current = {
      x: startX,
      y: startY,
    };

    setPlayer({
      x: startX,
      y: startY,
      angle: 0,
    });

    /**
     * ========================================================
     * PARA DISPARO ANTERIOR
     * ========================================================
     */

    if (
      shootIntervalRef.current
    ) {
      clearInterval(
        shootIntervalRef.current
      );

      shootIntervalRef.current =
        null;
    }
  }

  /**
   * ============================================================
   * UPDATE PLAYER
   * ============================================================
   */

  function updatePlayerPosition(
    x: number,
    y: number,
    angle: number
  ) {
    if (gameOverRef.current) {
      return;
    }

    /**
     * Atualiza posição interna.
     */

    playerRef.current = {
      x,
      y,
    };

    /**
     * Atualiza visual.
     */

    setPlayer({
      x,
      y,
      angle,
    });

    /**
     * Atualiza rastro.
     */

    setTrail((prev) => {
      const newTrail = [
        {
          id: trailId.current++,
          x,
          y,
        },
        ...prev,
      ];

      return newTrail.slice(0, 6);
    });
  }

  /**
   * ============================================================
   * RETORNO
   * ============================================================
   */

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

    shoot: startShooting,
    stopShooting,
    restartGame,
    updatePlayerPosition,

    setGameOver,
  };
}