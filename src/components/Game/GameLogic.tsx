import { useRef, useState, useEffect } from "react";
import { WIDTH, HEIGHT, GAME_CONFIG } from "../../constants/gameConfig";
import { PlayerPosition, Bullet, Explosion, Trail, Obstacle, Collectible } from "../../types/game";
import { randomObstacle, createInitialObstacles } from "../../utils/obstacles";
import { randomCoin, createInitialCollectibles } from "../../utils/collectibles";

// Velocidade começa em 1x e cresce até 3x conforme o score
function getSpeedMultiplier(score: number): number {
  const min = 1.0;
  const max = 30.0;
  // A cada 500 pontos sobe 0.1x, travado no máximo
  const increase = Math.floor(score / 500) * 1;
  return Math.min(min + increase, max);
}

export function useGameLogic() {
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
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [shield, setShield] = useState(false);
  const [player, setPlayer] = useState<PlayerPosition>({
    x: WIDTH * 0.5,
    y: HEIGHT * 0.8,
    angle: 0,
  });

  const bulletId = useRef(0);
  const explosionId = useRef(0);
  const obstacleId = useRef(100);
  const collectibleId = useRef(1000);
  const trailId = useRef(0);
  const playerRef = useRef({ x: WIDTH * 0.5, y: HEIGHT * 0.8 });
  const tickRef = useRef(0);
  const scoreRef = useRef(0); // ref para score acessível dentro do loop sem closure stale
  const shootIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicialização
  useEffect(() => {
    setObstacles(createInitialObstacles(GAME_CONFIG.OBSTACLE_COUNT));
    setCollectibles(createInitialCollectibles());
  }, []);

  // Loop do jogo
  useEffect(() => {
    const loop = setInterval(() => {
      if (gameOver) return;

      tickRef.current++;

      setScore((s) => {
        const next = s + 1;
        scoreRef.current = next;
        return next;
      });

      setExplosions((prev) => prev.slice(-10));

      // Multiplicador de velocidade progressivo
      const speedMult = getSpeedMultiplier(scoreRef.current);

      // Atualizar balas
      setBullets((prevBullets) => {
        const updated: Bullet[] = [];

        prevBullets.forEach((b) => {
          const nx = b.x + b.vx;
          const ny = b.y + b.vy;

          if (nx < -20 || nx > WIDTH + 20 || ny < -20 || ny > HEIGHT + 20) {
            return;
          }

          let hit = false;

          setObstacles((prevObs) =>
            prevObs.map((o) => {
              if (!hit && Math.abs(o.x - nx) < 35 && Math.abs(o.y - ny) < 35) {
                hit = true;
                setScore((s) => {
                  const next = s + 50;
                  scoreRef.current = next;
                  return next;
                });
                setCombo((c) => c + 1);
                setExplosions((e) => [
                  ...e,
                  { id: explosionId.current++, x: o.x, y: o.y },
                ]);
                return randomObstacle(obstacleId.current++);
              }
              return o;
            })
          );

          if (!hit) {
            updated.push({ ...b, x: nx, y: ny });
          }
        });

        return updated;
      });

      // Atualizar obstáculos com speedMult global
      setObstacles((prev) =>
        prev.map((o) => {
          let nx = o.x;
          if (o.drift) {
            nx = o.x + Math.sin(tickRef.current * 0.05 + o.driftPhase) * 1.5;
          }

          const ny = o.y + 3 * o.speedMult * speedMult;

          if (ny > HEIGHT + 60) {
            return randomObstacle(obstacleId.current++);
          }

          if (Math.abs(nx - playerRef.current.x) < 30 && Math.abs(ny - playerRef.current.y) < 30) {
            if (!shield) {
              setLives((v) => {
                const next = v - 1;
                if (next <= 0) setGameOver(true);
                return next;
              });
            }
            return randomObstacle(obstacleId.current++);
          }

          return { ...o, x: nx, y: ny };
        })
      );

      // Atualizar coletáveis com speedMult global
      setCollectibles((prev) =>
        prev.map((c) => {
          const ny = c.y + c.speed * speedMult;

          if (Math.abs(c.x - playerRef.current.x) < 35 && Math.abs(ny - playerRef.current.y) < 35) {
            if (c.special) {
              setGems((g) => g + 1);
              setShield(true);
              setTimeout(() => setShield(false), GAME_CONFIG.SHIELD_DURATION);
            } else {
              setCoins((m) => m + 1);
            }
            return randomCoin(collectibleId.current++, c.special);
          }

          if (ny > HEIGHT + 60) {
            return randomCoin(collectibleId.current++, c.special);
          }

          return { ...c, y: ny };
        })
      );
    }, GAME_CONFIG.GAME_LOOP_INTERVAL);

    return () => clearInterval(loop);
  }, [shield, gameOver]);

  function shoot() {
    if (gameOver) return;

    setBullets((prev) => [
      ...prev,
      {
        id: bulletId.current++,
        x: player.x + 5,
        y: player.y,
        vx: 0,
        vy: -14,
      },
      {
        id: bulletId.current++,
        x: player.x + 25,
        y: player.y,
        vx: 0,
        vy: -14,
      },
    ]);
  }

  function startShooting() {
    if (gameOver) return;
    shoot();
    shootIntervalRef.current = setInterval(() => {
      if (!gameOver) shoot();
    }, GAME_CONFIG.SHOOT_INTERVAL);
  }

  function stopShooting() {
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = null;
    }
  }

  function restartGame() {
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
    setObstacles(createInitialObstacles(GAME_CONFIG.OBSTACLE_COUNT));
    setCollectibles(createInitialCollectibles());

    scoreRef.current = 0;

    const startX = WIDTH * 0.5;
    const startY = HEIGHT * 0.8;
    playerRef.current = { x: startX, y: startY };
    setPlayer({ x: startX, y: startY, angle: 0 });

    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = null;
    }
  }

  function updatePlayerPosition(x: number, y: number, angle: number) {
    if (gameOver) return;

    playerRef.current = { x, y };
    setPlayer({ x, y, angle });

    setTrail((prev) => {
      const newTrail = [
        { id: trailId.current++, x, y },
        ...prev,
      ];
      return newTrail.slice(0, 6);
    });
  }

  return {
    score, coins, gems, combo, lives, gameOver, shield,
    bullets, explosions, trail, obstacles, collectibles, player,
    shoot: startShooting,
    stopShooting,
    restartGame,
    updatePlayerPosition,
    setGameOver,
  };
}