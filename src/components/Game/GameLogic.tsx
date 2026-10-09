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
  EnemyBullet,
  PowerUp,
  Boss,
  Banner,
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
 * 0 -> 1.0x ... 3500+ -> 1.7x (a cada 500 pontos +0.1)
 */
function getSpeedMultiplier(score: number): number {
  return Math.min(1.0 + Math.floor(score / 500) * 0.1, 1.7);
}

/**
 * ============================================================
 * PADRÕES DE TIRO (estilo Aero Fighters)
 * ============================================================
 * Cada item: [deslocamento X em px a partir do centro da nave,
 *             velocidade lateral].
 * Índice 0 = nível 1 ... índice 4 = nível 5.
 */
const SHOT_PATTERNS: [number, number][][] = [
  // Nível 1: tiro duplo paralelo
  [[-7, 0], [7, 0]],

  // Nível 2: leque de 3
  [[0, 0], [-10, -1.8], [10, 1.8]],

  // Nível 3: duplo + 2 diagonais
  [[-7, 0], [7, 0], [-14, -2.5], [14, 2.5]],

  // Nível 4: leque de 5
  [[0, 0], [-9, -1.5], [9, 1.5], [-16, -3.5], [16, 3.5]],

  // Nível 5: 6 tiros (2 retos + 4 em leque)
  [[-6, 0], [6, 0], [-12, -1.8], [12, 1.8], [-18, -3.8], [18, 3.8]],
];

const BOSS_EMOJIS = ["🛸", "👾", "🐙", "👹", "💀"];

const HALF = GAME_CONFIG.PLAYER_BOX / 2;

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
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [banner, setBanner] = useState<Banner | null>(null);

  // ==========================================================
  // ENTIDADES DO JOGO
  // ==========================================================

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemyBullets, setEnemyBullets] = useState<EnemyBullet[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [trail, setTrail] = useState<Trail[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);

  // ==========================================================
  // PLAYER
  // ==========================================================

  const [player, setPlayer] = useState<PlayerPosition>({
    x: WIDTH * 0.5 - HALF,
    y: HEIGHT * 0.8,
    angle: 0,
  });

  // ==========================================================
  // IDS
  // ==========================================================

  const bulletId = useRef(0);
  const enemyBulletId = useRef(0);
  const powerUpId = useRef(0);
  const bossId = useRef(0);
  const bannerId = useRef(0);
  const explosionId = useRef(0);
  const obstacleId = useRef(100);
  const collectibleId = useRef(1000);
  const trailId = useRef(0);

  // ==========================================================
  // REFS DA GAME ENGINE
  // ==========================================================

  // x,y = canto superior esquerdo da caixa da nave (PLAYER_BOX)
  const playerRef = useRef({
    x: WIDTH * 0.5 - HALF,
    y: HEIGHT * 0.8,
  });

  const tickRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const livesRef = useRef(3);

  const shieldRef = useRef(false);
  const gameOverRef = useRef(false);

  const weaponLevelRef = useRef(1);
  const lastShotTick = useRef(-10);
  const invulnUntil = useRef(0);
  const lastPowerTick = useRef(0);

  const bossRef = useRef<Boss | null>(null);
  const bossCountRef = useRef(0);
  const nextBossScore = useRef(GAME_CONFIG.BOSS_FIRST_SCORE);

  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<EnemyBullet[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);

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
  // AVISO NA TELA ("POWER UP!", "CHEFÃO!"...)
  // ==========================================================

  function showBanner(text: string, ms = 1600) {
    const id = ++bannerId.current;
    setBanner({ id, text });
    setTimeout(() => {
      if (bannerId.current === id) setBanner(null);
    }, ms);
  }

  // ==========================================================
  // INICIALIZAÇÃO DO CENÁRIO
  // ==========================================================

  useEffect(() => {
    const initialObstacles = createInitialObstacles(
      GAME_CONFIG.OBSTACLE_COUNT
    );
    const initialCollectibles = createInitialCollectibles();

    obstaclesRef.current = initialObstacles;
    collectiblesRef.current = initialCollectibles;

    setObstacles(initialObstacles);
    setCollectibles(initialCollectibles);
  }, []);

  // ==========================================================
  // GAME LOOP
  // ==========================================================

  useEffect(() => {
    /** Tira uma vida (com proteção de escudo e invulnerabilidade). */
    const hurtPlayer = () => {
      if (shieldRef.current) return;
      if (tickRef.current < invulnUntil.current) return;

      invulnUntil.current =
        tickRef.current + GAME_CONFIG.PLAYER_INVULN_TICKS;

      livesRef.current -= 1;
      setLives(livesRef.current);

      // Perde 1 nível de tiro ao ser atingido
      if (weaponLevelRef.current > 1) {
        weaponLevelRef.current -= 1;
        setWeaponLevel(weaponLevelRef.current);
      }

      if (livesRef.current <= 0) {
        gameOverRef.current = true;
        setGameOver(true);
      }
    };

    const loop = setInterval(() => {
      if (gameOverRef.current) return;

      tickRef.current++;
      const tick = tickRef.current;

      // Score automático
      scoreRef.current += 1;
      const speedMult = getSpeedMultiplier(scoreRef.current);

      // Centro da nave
      const pcx = playerRef.current.x + HALF;
      const pcy = playerRef.current.y + HALF;

      let comboIncrease = 0;
      const newExplosions: Explosion[] = [];
      const newPowerUps: PowerUp[] = [];
      let nextObstacles = obstaclesRef.current.slice();
      const nextBullets: Bullet[] = [];

      const addPowerUp = (x: number, y: number) => {
        newPowerUps.push({
          id: powerUpId.current++,
          x,
          y,
          speed: 4,
        });
        lastPowerTick.current = tick;
      };

      // ======================================================
      // 0. NASCIMENTO DO CHEFÃO
      // ======================================================

      let boss = bossRef.current;

      if (!boss && scoreRef.current >= nextBossScore.current) {
        const level = bossCountRef.current + 1;
        const size = Math.min(150, 110 + (level - 1) * 8);
        const hp =
          GAME_CONFIG.BOSS_BASE_HP +
          GAME_CONFIG.BOSS_HP_PER_LEVEL * (level - 1);

        boss = {
          id: bossId.current++,
          x: WIDTH / 2,
          y: -size,
          hp,
          maxHp: hp,
          level,
          emoji: BOSS_EMOJIS[(level - 1) % BOSS_EMOJIS.length],
          size,
          spawnTick: tick,
          wave: 0,
          hitFlash: 0,
        };

        showBanner("⚠️ CHEFÃO!", 2200);
      }

      // ======================================================
      // 1. TIROS DO JOGADOR
      // ======================================================

      let bossDefeated = false;

      for (const bullet of bulletsRef.current) {
        const nx = bullet.x + bullet.vx;
        const ny = bullet.y + bullet.vy;

        if (nx < -20 || nx > WIDTH + 20 || ny < -20 || ny > HEIGHT + 20) {
          continue;
        }

        const bcx = nx + 1.5;
        let hit = false;

        // Obstáculos
        for (let i = 0; i < nextObstacles.length && !hit; i++) {
          const o = nextObstacles[i];
          const ocx = o.x + o.fontSize / 2;
          const ocy = o.y + o.fontSize / 2;

          if (
            Math.abs(ocx - bcx) < o.fontSize / 2 + 8 &&
            Math.abs(ocy - ny) < o.fontSize / 2 + 10
          ) {
            hit = true;
            scoreRef.current += 50;
            comboIncrease += 1;

            newExplosions.push({
              id: explosionId.current++,
              x: ocx,
              y: ocy,
            });

            if (
              weaponLevelRef.current < GAME_CONFIG.MAX_WEAPON_LEVEL &&
              Math.random() < GAME_CONFIG.POWERUP_DROP_CHANCE
            ) {
              addPowerUp(ocx, ocy);
            }

            nextObstacles[i] = randomObstacle(obstacleId.current++);
          }
        }

        // Chefão
        if (!hit && boss && !bossDefeated && boss.y > -boss.size * 0.2) {
          if (
            Math.abs(bcx - boss.x) < boss.size * 0.45 &&
            Math.abs(ny - boss.y) < boss.size * 0.45
          ) {
            hit = true;
            boss = { ...boss, hp: boss.hp - 1, hitFlash: 3 };
            scoreRef.current += 2;

            if (boss.hp % 6 === 0) {
              newExplosions.push({
                id: explosionId.current++,
                x: bcx,
                y: ny,
              });
            }

            if (boss.hp <= 0) bossDefeated = true;
          }
        }

        if (!hit) {
          nextBullets.push({ ...bullet, x: nx, y: ny });
        }
      }

      bulletsRef.current = nextBullets;

      // ------------------------------------------------------
      // Chefão derrotado
      // ------------------------------------------------------

      if (boss && bossDefeated) {
        const bonus = 1000 * boss.level;
        scoreRef.current += bonus;
        comboIncrease += 5;

        for (let k = 0; k < 5; k++) {
          newExplosions.push({
            id: explosionId.current++,
            x: boss.x + (k - 2) * boss.size * 0.22,
            y: boss.y + (k % 2 ? 1 : -1) * boss.size * 0.2,
          });
        }

        addPowerUp(boss.x, boss.y);

        bossCountRef.current += 1;
        nextBossScore.current =
          scoreRef.current + GAME_CONFIG.BOSS_SCORE_GAP;

        enemyBulletsRef.current = [];
        showBanner(`CHEFÃO DERROTADO! +${bonus}`, 2600);

        boss = null;
      }

      // ------------------------------------------------------
      // Combo
      // ------------------------------------------------------

      if (comboIncrease > 0) {
        comboRef.current += comboIncrease;
        setCombo(comboRef.current);
      }

      // ======================================================
      // 2. OBSTÁCULOS
      // ======================================================

      nextObstacles = nextObstacles.map((o) => {
        // Enquanto há chefão, os obstáculos que ainda não entraram
        // na tela ficam parados lá em cima.
        if (boss && o.y < 0) return o;

        const nx = o.drift
          ? o.x + Math.sin(tick * 0.05 + o.driftPhase) * 1.5
          : o.x;

        const ny = o.y + 3 * o.speedMult * speedMult;

        if (ny > HEIGHT + 60) {
          return randomObstacle(obstacleId.current++);
        }

        const ocx = nx + o.fontSize / 2;
        const ocy = ny + o.fontSize / 2;

        if (
          Math.abs(ocx - pcx) < o.fontSize / 2 + 16 &&
          Math.abs(ocy - pcy) < o.fontSize / 2 + 28
        ) {
          hurtPlayer();
          return randomObstacle(obstacleId.current++);
        }

        return { ...o, x: nx, y: ny };
      });

      obstaclesRef.current = nextObstacles;

      // ======================================================
      // 3. CHEFÃO: MOVIMENTO E ATAQUES
      // ======================================================

      const enemyNew: EnemyBullet[] = [];

      if (boss) {
        const targetY = 100 + boss.size / 2;
        const entered = boss.y >= targetY;
        const phase2 = boss.hp < boss.maxHp * 0.5;

        let bx = boss.x;
        let by = boss.y;
        let wave = boss.wave;

        if (!entered) {
          by = Math.min(targetY, by + 3);
        } else {
          wave += phase2 ? 0.045 : 0.03;
          const amp = WIDTH / 2 - boss.size / 2 - 8;
          bx = WIDTH / 2 + Math.sin(wave) * amp;
          by = targetY + Math.sin(wave * 0.7) * 14;
        }

        boss = {
          ...boss,
          x: bx,
          y: by,
          wave,
          hitFlash: Math.max(0, boss.hitFlash - 1),
        };

        // Ataques
        if (entered) {
          const bt = tick - boss.spawnTick;
          const every = Math.max(
            14,
            (phase2 ? 24 : 36) - boss.level * 2
          );

          if (bt % every === 0) {
            const n = Math.floor(bt / every);
            const sx = boss.x;
            const sy = boss.y + boss.size * 0.4;
            const speed = 6.5 + Math.min(boss.level, 4) * 0.5;

            if (phase2 && n % 2 === 1) {
              // Mirado no jogador + 2 laterais
              const dx = pcx - sx;
              const dy = pcy - sy;
              const len = Math.hypot(dx, dy) || 1;
              const ux = (dx / len) * (speed + 1.5);
              const uy = (dy / len) * (speed + 1.5);

              [-1.5, 0, 1.5].forEach((off) => {
                enemyNew.push({
                  id: enemyBulletId.current++,
                  x: sx,
                  y: sy,
                  vx: ux + off,
                  vy: uy,
                });
              });
            } else {
              // Leque (3 tiros; 5 a partir do chefão nível 2)
              const spread =
                boss.level >= 2
                  ? [-3, -1.5, 0, 1.5, 3]
                  : [-2, 0, 2];

              spread.forEach((vx) => {
                enemyNew.push({
                  id: enemyBulletId.current++,
                  x: sx,
                  y: sy,
                  vx,
                  vy: speed,
                });
              });
            }
          }
        }

        // Encostar no chefão machuca
        if (
          Math.abs(pcx - boss.x) < boss.size * 0.4 + 14 &&
          Math.abs(pcy - boss.y) < boss.size * 0.4 + 24
        ) {
          hurtPlayer();
        }
      }

      bossRef.current = boss;

      // ======================================================
      // 4. TIROS INIMIGOS
      // ======================================================

      const nextEnemy: EnemyBullet[] = [];

      for (const e of [...enemyBulletsRef.current, ...enemyNew]) {
        const nx = e.x + e.vx;
        const ny = e.y + e.vy;

        if (nx < -20 || nx > WIDTH + 20 || ny > HEIGHT + 20 || ny < -60) {
          continue;
        }

        if (Math.abs(nx - pcx) < 18 && Math.abs(ny - pcy) < 30) {
          hurtPlayer();
          continue;
        }

        nextEnemy.push({ ...e, x: nx, y: ny });
      }

      enemyBulletsRef.current = nextEnemy;

      // ======================================================
      // 5. ITENS "P" (NÍVEL DE TIRO)
      // ======================================================

      // Cai um "P" sozinho se ficou muito tempo sem aparecer
      if (
        !boss &&
        weaponLevelRef.current < GAME_CONFIG.MAX_WEAPON_LEVEL &&
        tick - lastPowerTick.current > GAME_CONFIG.POWERUP_SPAWN_TICKS
      ) {
        addPowerUp(30 + Math.random() * (WIDTH - 60), -30);
      }

      const nextPowerUps: PowerUp[] = [];

      for (const p of [...powerUpsRef.current, ...newPowerUps]) {
        const ny = p.y + p.speed * speedMult;

        if (ny > HEIGHT + 40) continue;

        if (Math.abs(p.x - pcx) < 34 && Math.abs(ny - pcy) < 44) {
          if (weaponLevelRef.current < GAME_CONFIG.MAX_WEAPON_LEVEL) {
            weaponLevelRef.current += 1;
            setWeaponLevel(weaponLevelRef.current);
            showBanner(`⚡ TIRO NÍVEL ${weaponLevelRef.current}`, 1500);
          } else {
            scoreRef.current += 500;
            showBanner("TIRO MÁXIMO! +500", 1300);
          }
          continue;
        }

        nextPowerUps.push({ ...p, y: ny });
      }

      powerUpsRef.current = nextPowerUps;

      // ======================================================
      // 6. MOEDAS E GEMAS
      // ======================================================

      const nextCollectibles = collectiblesRef.current.map((c) => {
        const ny = c.y + c.speed * speedMult;

        if (
          Math.abs(c.x + 16 - pcx) < 40 &&
          Math.abs(ny + 16 - pcy) < 46
        ) {
          if (c.special) {
            setGems((g) => g + 1);
            shieldRef.current = true;
            setShield(true);

            setTimeout(() => {
              shieldRef.current = false;
              setShield(false);
            }, GAME_CONFIG.SHIELD_DURATION);
          } else {
            setCoins((v) => v + 1);
          }

          return randomCoin(collectibleId.current++, c.special);
        }

        if (ny > HEIGHT + 60) {
          return randomCoin(collectibleId.current++, c.special);
        }

        return { ...c, y: ny };
      });

      collectiblesRef.current = nextCollectibles;

      // ======================================================
      // 7. EXPLOSÕES
      // ======================================================

      if (newExplosions.length > 0) {
        const updated = [
          ...explosionsRef.current,
          ...newExplosions,
        ].slice(-10);

        explosionsRef.current = updated;
        setExplosions(updated);
      }

      // ======================================================
      // 8. SINCRONIZA COM O REACT
      // ======================================================

      setScore(scoreRef.current);
      setBullets(nextBullets);
      setEnemyBullets(nextEnemy);
      setPowerUps(nextPowerUps);
      setBoss(boss);
      setObstacles(nextObstacles);
      setCollectibles(nextCollectibles);
    }, GAME_CONFIG.GAME_LOOP_INTERVAL);

    return () => clearInterval(loop);
  }, []);

  // ==========================================================
  // SHOOT (um toque = um disparo, conforme o nível de tiro)
  // ==========================================================

  function shoot() {
    if (gameOverRef.current) return;

    // Evita "metralhadora" de toques
    if (
      tickRef.current - lastShotTick.current <
      GAME_CONFIG.SHOT_COOLDOWN_TICKS
    ) {
      return;
    }
    lastShotTick.current = tickRef.current;

    const level = Math.min(
      weaponLevelRef.current,
      SHOT_PATTERNS.length
    );
    const pattern = SHOT_PATTERNS[level - 1];

    // Sai do bico da nave
    const cx = playerRef.current.x + HALF - 1.5;
    const y = playerRef.current.y + 6;

    const created: Bullet[] = pattern.map(([ox, vx]) => ({
      id: bulletId.current++,
      x: cx + ox,
      y,
      vx,
      vy: -14,
    }));

    const all = [...bulletsRef.current, ...created].slice(
      -GAME_CONFIG.MAX_BULLETS
    );

    bulletsRef.current = all;
    setBullets(all);
  }

  // ==========================================================
  // RESTART GAME
  // ==========================================================

  function restartGame() {
    const initialObstacles = createInitialObstacles(
      GAME_CONFIG.OBSTACLE_COUNT
    );
    const initialCollectibles = createInitialCollectibles();

    const startX = WIDTH * 0.5 - HALF;
    const startY = HEIGHT * 0.8;

    scoreRef.current = 0;
    comboRef.current = 0;
    livesRef.current = 3;
    shieldRef.current = false;
    gameOverRef.current = false;
    tickRef.current = 0;

    weaponLevelRef.current = 1;
    lastShotTick.current = -10;
    invulnUntil.current = 0;
    lastPowerTick.current = 0;

    bossRef.current = null;
    bossCountRef.current = 0;
    nextBossScore.current = GAME_CONFIG.BOSS_FIRST_SCORE;

    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    powerUpsRef.current = [];
    explosionsRef.current = [];
    obstaclesRef.current = initialObstacles;
    collectiblesRef.current = initialCollectibles;

    playerRef.current = { x: startX, y: startY };

    setScore(0);
    setCoins(0);
    setGems(0);
    setCombo(0);
    setLives(3);
    setShield(false);
    setGameOver(false);
    setWeaponLevel(1);
    setBanner(null);

    setBullets([]);
    setEnemyBullets([]);
    setPowerUps([]);
    setBoss(null);
    setExplosions([]);
    setTrail([]);
    setObstacles(initialObstacles);
    setCollectibles(initialCollectibles);

    setPlayer({ x: startX, y: startY, angle: 0 });
  }

  // ==========================================================
  // UPDATE PLAYER
  // ==========================================================

  function updatePlayerPosition(
    x: number,
    y: number,
    angle: number
  ) {
    if (gameOverRef.current) return;

    playerRef.current = { x, y };

    setPlayer({ x, y, angle });

    setTrail((prev) => {
      const next = [
        { id: String(trailId.current++), x, y },
        ...prev,
      ];
      return next.slice(0, 6);
    });
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

    setGameOver,
  };
}
