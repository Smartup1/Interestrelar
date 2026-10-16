import { getBombProfile, bossSpecial, bossAttack, BOSS_COLORS } from "../../game/bombs";
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
  Enemy,
  Popup,
  FxEvent,
  FxName,
  LaserState,
  BombFxState,
} from "../../types/game";

import {
  randomObstacle,
  createInitialObstacles,
} from "../../utils/obstacles";

import {
  randomCoin,
  respawnCollectible,
  dropCollectible,
  createInitialCollectibles,
} from "../../utils/collectibles";

import {
  WeaponProfile,
  getWeaponForShip,
} from "../../game/weapons";

import { createEnemy, updateEnemy } from "../../game/enemies";

import { ScriptStep, buildStageScript } from "../../game/stages";
import { themeForStage } from "../../game/theme";

/**
 * ============================================================
 * MULTIPLICADOR DE DIFICULDADE
 * ============================================================
 */
function getSpeedMultiplier(score: number): number {
  return Math.min(1.0 + Math.floor(score / 500) * 0.1, 1.7);
}

const BOSS_EMOJIS = ["🛸", "👾", "🐙", "👹", "💀"];
const MID_BOSS_EMOJIS = ["🛰️", "🤖", "🦂", "👺", "🧟"];

const HALF = GAME_CONFIG.PLAYER_BOX / 2;
const HIT_W = GAME_CONFIG.PLAYER_HIT_W;
const HIT_H = GAME_CONFIG.PLAYER_HIT_H;

/**
 * ============================================================
 * GAME LOGIC
 * ============================================================
 */
export function useGameLogic(shipId?: string) {
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
  const [bombs, setBombs] = useState(GAME_CONFIG.START_BOMBS);
  const [stage, setStage] = useState(1);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [fx, setFx] = useState<FxEvent[]>([]);

  // ==========================================================
  // ENTIDADES DO JOGO
  // ==========================================================

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemyBullets, setEnemyBullets] = useState<EnemyBullet[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [laser, setLaser] = useState<LaserState | null>(null);

  // Efeito visual da bomba (nova / relâmpago / fantasma / aurora)
  const [bombFx, setBombFx] = useState<BombFxState | null>(null);
  const bombFxSeq = useRef(0);
  const bombFxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
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
  const enemyId = useRef(0);
  const powerUpId = useRef(0);
  const popupId = useRef(0);
  const bossId = useRef(0);
  const bannerId = useRef(0);
  const fxSeq = useRef(0);
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

  // Arma
  const weaponRef = useRef<WeaponProfile>(getWeaponForShip(shipId));
  const shipIdRef = useRef<string | undefined>(shipId);
  const weaponLevelRef = useRef(1);
  const lastShotTick = useRef(-10);

  // Bombas
  const bombsRef = useRef(GAME_CONFIG.START_BOMBS);
  const bombPending = useRef(false);

  // Laser ativo (bomba de feixe): até quando dura e o dano por tick
  const laserRef = useRef<{
    until: number;
    duration: number;
    halfWidth: number;
    enemyDmg: number;
    bossPct: number;
  } | null>(null);
  const lastBombTick = useRef(-100);

  // Combate
  const invulnUntil = useRef(0);
  const lastKillTick = useRef(0);
  const lastPowerTick = useRef(0);
  const lastBombItemTick = useRef(0);

  // Fases
  const stageRef = useRef(1);
  const stageTickRef = useRef(-GAME_CONFIG.STAGE_INTRO_TICKS);
  const scriptRef = useRef<ScriptStep[]>(buildStageScript(1, WIDTH));
  const scriptIdx = useRef(0);
  const stagePhase = useRef<"play" | "clear">("play");
  const clearTimer = useRef(0);
  const bossPending = useRef<{ ticks: number; mid: boolean } | null>(null);
  const bossRef = useRef<Boss | null>(null);

  const fxQueue = useRef<FxName[]>([]);

  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<EnemyBullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const popupsRef = useRef<Popup[]>([]);
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

  // A arma depende da nave escolhida
  useEffect(() => {
    weaponRef.current = getWeaponForShip(shipId);
    shipIdRef.current = shipId;
  }, [shipId]);

  // ==========================================================
  // AVISO NA TELA ("FASE 1", "WARNING!"...)
  // ==========================================================

  function showBanner(text: string, ms = 1600) {
    const id = ++bannerId.current;
    setBanner({ id, text });
    setTimeout(() => {
      if (bannerId.current === id) setBanner(null);
    }, ms);
  }

  // ==========================================================
  // CHEFÃO / MINI-CHEFE
  // ==========================================================

  function makeBoss(isMid: boolean, tick: number): Boss {
    const level = stageRef.current;

    const baseHp =
      GAME_CONFIG.BOSS_BASE_HP +
      GAME_CONFIG.BOSS_HP_PER_LEVEL * (level - 1);

    const hp = Math.round(
      isMid ? baseHp * GAME_CONFIG.MID_BOSS_HP_FACTOR : baseHp
    );

    const size = isMid ? 84 : Math.min(150, 110 + (level - 1) * 8);
    const list = isMid ? MID_BOSS_EMOJIS : BOSS_EMOJIS;

    return {
      id: bossId.current++,
      x: WIDTH / 2,
      y: -size,
      hp,
      maxHp: hp,
      level,
      emoji: list[(level - 1) % list.length],
      size,
      spawnTick: tick,
      wave: 0,
      hitFlash: 0,
      isMid,
    };
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

    showBanner(`FASE 1 · ${themeForStage(1).label}`, 2000);
  }, []);

  // ==========================================================
  // GAME LOOP
  // ==========================================================

  useEffect(() => {
    /** Tira uma vida (com escudo e invulnerabilidade). */
    const hurtPlayer = () => {
      if (shieldRef.current) return;
      if (tickRef.current < invulnUntil.current) return;

      invulnUntil.current =
        tickRef.current + GAME_CONFIG.PLAYER_INVULN_TICKS;

      livesRef.current -= 1;
      setLives(livesRef.current);

      fxQueue.current.push("hurt");

      // Perde a sequência de combo
      if (comboRef.current > 0) {
        comboRef.current = 0;
        setCombo(0);
      }

      // Perde 1 nível de tiro
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
      const stage = stageRef.current;

      scoreRef.current += 1;
      const speedMult = getSpeedMultiplier(scoreRef.current);

      // Sequência de combo expira
      if (
        comboRef.current > 0 &&
        tick - lastKillTick.current > GAME_CONFIG.COMBO_WINDOW_TICKS
      ) {
        comboRef.current = 0;
        setCombo(0);
      }

      const mult = Math.min(
        4,
        1 + Math.floor(comboRef.current / 6) * 0.5
      );

      // Centro da nave
      const pcx = playerRef.current.x + HALF;
      const pcy = playerRef.current.y + HALF;

      const weapon = weaponRef.current;

      const newExplosions: Explosion[] = [];
      const newPowerUps: PowerUp[] = [];
      const newDrops: Collectible[] = [];
      const newPopups: Popup[] = [];

      let nextObstacles = obstaclesRef.current.slice();
      let nextEnemies: (Enemy | null)[] = enemiesRef.current.slice();
      const nextBullets: Bullet[] = [];

      let boss = bossRef.current;
      let bossDefeated = false;

      // ------------------------------------------------------
      // Ajudantes
      // ------------------------------------------------------

      const explode = (x: number, y: number) => {
        newExplosions.push({ id: explosionId.current++, x, y });
      };

      const popup = (
        x: number,
        y: number,
        text: string,
        color = "#ffd700"
      ) => {
        newPopups.push({
          id: popupId.current++,
          x,
          y,
          text,
          color,
          age: 0,
        });
      };

      const addScore = (base: number, x: number, y: number) => {
        const v = Math.round(base * mult);
        scoreRef.current += v;
        popup(
          x,
          y - 10,
          mult > 1 ? `+${v} x${mult}` : `+${v}`,
          mult > 1 ? "#ff9f1a" : "#ffd700"
        );
      };

      const registerKill = () => {
        comboRef.current += 1;
        lastKillTick.current = tick;
      };

      const addPowerUp = (x: number, y: number, kind: "P" | "B") => {
        newPowerUps.push({
          id: powerUpId.current++,
          x,
          y,
          speed: 4,
          kind,
        });
        if (kind === "P") lastPowerTick.current = tick;
        else lastBombItemTick.current = tick;
      };

      const dropFor = (e: Enemy) => {
        const needP =
          weaponLevelRef.current < GAME_CONFIG.MAX_WEAPON_LEVEL;
        const needB = bombsRef.current < GAME_CONFIG.MAX_BOMBS;

        // O grandalhão sempre solta um item
        if (e.kind === "heavy") {
          if (needP) addPowerUp(e.x, e.y, "P");
          else if (needB) addPowerUp(e.x, e.y, "B");
          return;
        }

        if (needP && Math.random() < GAME_CONFIG.POWERUP_DROP_CHANCE) {
          addPowerUp(e.x, e.y, "P");
        } else if (
          needB &&
          Math.random() < GAME_CONFIG.BOMB_DROP_CHANCE
        ) {
          addPowerUp(e.x, e.y, "B");
        }
      };

      // Moedas (💰) e gemas (💎) que caem do inimigo destruído
      const dropLoot = (e: Enemy) => {
        const chance =
          e.kind === "heavy" ? 1 : e.kind === "gunner" ? 0.5 : 0.3;
        if (Math.random() >= chance) return;
        newDrops.push(
          dropCollectible(collectibleId.current++, e.x, e.y, false, 0)
        );
        // grandalhão ainda solta uma gema de vez em quando
        if (e.kind === "heavy" && Math.random() < 0.35) {
          newDrops.push(
            dropCollectible(collectibleId.current++, e.x, e.y, true, 18)
          );
        }
      };

      const killEnemy = (idx: number) => {
        const e = nextEnemies[idx];
        if (!e) return;
        addScore(e.score, e.x, e.y);
        registerKill();
        explode(e.x, e.y);
        dropFor(e);
        dropLoot(e);
        nextEnemies[idx] = null;
      };

      // Filhotes do chefão: versões pequenas do emoji dele
      const spawnKids = (b: Boss, count: number) => {
        for (let k = 0; k < count; k++) {
          const t = count === 1 ? 0 : k / (count - 1) - 0.5; // -0.5..0.5

          const kid = createEnemy(
            enemyId.current++,
            "scout",
            stage,
            { x: b.x + t * b.size * 0.9, phase: k * 1.3 },
            WIDTH
          );

          nextEnemies.push({
            ...kid,
            emoji: b.emoji,
            y: b.y + (k % 2 ? 10 : -10),
            vy: kid.vy * (0.8 + (k % 3) * 0.25),
          });
        }
      };

      const hitEnemy = (idx: number, dmg: number) => {
        const e = nextEnemies[idx];
        if (!e) return;
        const hp = e.hp - dmg;
        if (hp <= 0) killEnemy(idx);
        else nextEnemies[idx] = { ...e, hp, flash: 3 };
      };

      const killObstacle = (i: number) => {
        const o = nextObstacles[i];
        const ocx = o.x + o.fontSize / 2;
        const ocy = o.y + o.fontSize / 2;

        addScore(50, ocx, ocy);
        registerKill();
        explode(ocx, ocy);

        if (
          weaponLevelRef.current < GAME_CONFIG.MAX_WEAPON_LEVEL &&
          Math.random() < GAME_CONFIG.POWERUP_DROP_CHANCE * 0.5
        ) {
          addPowerUp(ocx, ocy, "P");
        }

        nextObstacles[i] = randomObstacle(obstacleId.current++);
      };

      // ======================================================
      // 0. BOMBA
      // ======================================================

      if (bombPending.current) {
        bombPending.current = false;

        const bp = getBombProfile(shipIdRef.current);
        const lane = bp.laneHalfWidth;
        const inLane = (x: number) => lane <= 0 || Math.abs(x - pcx) <= lane;

        if (bp.laser) {
          // LASER: o feixe fica ligado na frente da nave; o dano é
          // aplicado a cada tick, logo abaixo ("LASER ativo").
          laserRef.current = {
            until: tick + bp.laser.durationTicks,
            duration: bp.laser.durationTicks,
            halfWidth: bp.laser.halfWidth,
            enemyDmg: bp.laser.enemyDmgPerTick,
            bossPct: bp.bossPct,
          };
          setLaser({
            color: bp.color,
            coreColor: bp.laser.coreColor,
            halfWidth: bp.laser.halfWidth,
          });
        }

        if (!bp.laser && bp.clearBullets) {
          const kept = enemyBulletsRef.current.filter(
            (b) => lane > 0 && !inLane(b.x)
          );
          scoreRef.current +=
            (enemyBulletsRef.current.length - kept.length) * bp.pointsPerClear;
          enemyBulletsRef.current = kept;
        }

        if (!bp.laser && bp.clearObstacles) {
          for (let i = 0; i < nextObstacles.length; i++) {
            if (nextObstacles[i].y > -10 && inLane(nextObstacles[i].x)) {
              scoreRef.current += bp.pointsPerClear;
              killObstacle(i);
            }
          }
        }

        // Alvos atingidos (o relâmpago desce até cada um)
        const bombTargets: { x: number; y: number }[] = [];
        if (!bp.laser && bp.fx) {
          for (const en of nextEnemies) {
            if (en && en.y > -10 && inLane(en.x) && bombTargets.length < 8) {
              bombTargets.push({ x: en.x, y: en.y });
            }
          }
          if (boss && boss.y > -boss.size * 0.3 && inLane(boss.x)) {
            bombTargets.push({ x: boss.x, y: boss.y });
          }
        }

        for (let i = 0; i < nextEnemies.length; i++) {
          const en = nextEnemies[i];
          if (!bp.laser && en && inLane(en.x)) hitEnemy(i, bp.enemyDamage);
        }

        if (!bp.laser && boss && boss.y > -boss.size * 0.3 && inLane(boss.x)) {
          const dmg = Math.max(25, Math.round(boss.maxHp * bp.bossPct));
          boss = { ...boss, hp: boss.hp - dmg, hitFlash: 3 };
          if (boss.hp <= 0) bossDefeated = true;
        }

        invulnUntil.current = Math.max(
          invulnUntil.current,
          tick + (bp.laser ? bp.laser.durationTicks + 8 : bp.invulnTicks)
        );

        popup(pcx, pcy - 50, bp.name, bp.color);
        fxQueue.current.push(bp.laser ? "laser" : "bomb");

        if (!bp.laser && bp.fx) {
          if (bombFxTimer.current) clearTimeout(bombFxTimer.current);
          setBombFx({
            id: ++bombFxSeq.current,
            kind: bp.fx,
            x: pcx,
            y: pcy,
            color: bp.color,
            targets: bombTargets,
          });
          bombFxTimer.current = setTimeout(() => setBombFx(null), 1800);
        }
      }

      // ------------------------------------------------------
      // LASER ativo: dano contínuo na faixa à frente da nave
      // ------------------------------------------------------

      const L = laserRef.current;

      if (L) {
        if (tick > L.until) {
          laserRef.current = null;
          setLaser(null);
        } else {
          // dentro do feixe? (extra = folga pelo tamanho do alvo)
          const inBeam = (x: number, extra = 0) =>
            Math.abs(x - pcx) <= L.halfWidth + extra;

          // tiros inimigos que entram no feixe somem
          enemyBulletsRef.current = enemyBulletsRef.current.filter(
            (b) => !(b.y < pcy && inBeam(b.x, 6))
          );

          for (let i = 0; i < nextObstacles.length; i++) {
            const o = nextObstacles[i];
            if (
              o.y > -10 &&
              o.y < pcy &&
              inBeam(o.x + o.fontSize / 2, o.fontSize * 0.4)
            ) {
              killObstacle(i);
            }
          }

          for (let i = 0; i < nextEnemies.length; i++) {
            const en = nextEnemies[i];
            if (en && en.y < pcy && inBeam(en.x, en.size * 0.4)) {
              hitEnemy(i, L.enemyDmg);
            }
          }

          if (
            boss &&
            boss.y > -boss.size * 0.3 &&
            boss.y < pcy &&
            inBeam(boss.x, boss.size * 0.4)
          ) {
            const total = Math.max(25, boss.maxHp * L.bossPct);
            boss = {
              ...boss,
              hp: boss.hp - total / L.duration,
              hitFlash: 2,
            };
            if (boss.hp <= 0) bossDefeated = true;
          }
        }
      }

      // ======================================================
      // 1. ROTEIRO DA FASE
      // ======================================================

      if (bossPending.current && !boss) {
        bossPending.current.ticks -= 1;
        if (bossPending.current.ticks <= 0) {
          boss = makeBoss(bossPending.current.mid, tick);
          bossPending.current = null;
        }
      }

      if (stagePhase.current === "clear") {
        clearTimer.current -= 1;

        if (clearTimer.current <= 0) {
          const ns = stageRef.current + 1;
          stageRef.current = ns;
          setStage(ns);

          scriptRef.current = buildStageScript(ns, WIDTH);
          scriptIdx.current = 0;
          stageTickRef.current = -GAME_CONFIG.STAGE_INTRO_TICKS;
          stagePhase.current = "play";

          showBanner(`FASE ${ns} · ${themeForStage(ns).label}`, 2600);
        }
      } else {
        // O relógio da fase para enquanto há chefão
        const blocked = !!boss || !!bossPending.current;

        if (!blocked) stageTickRef.current += 1;

        const script = scriptRef.current;

        while (
          !blocked &&
          scriptIdx.current < script.length &&
          script[scriptIdx.current].at <= stageTickRef.current
        ) {
          const step = script[scriptIdx.current];

          if (step.type === "spawn") {
            const alive = nextEnemies.filter(Boolean).length;
            if (alive >= GAME_CONFIG.MAX_ENEMIES) break;

            nextEnemies.push(
              createEnemy(
                enemyId.current++,
                step.kind!,
                stage,
                {
                  x: step.x ?? WIDTH / 2,
                  y: step.y,
                  dir: step.dir,
                  phase: step.phase,
                },
                WIDTH
              )
            );
            scriptIdx.current++;
          } else {
            const mid = step.type === "midboss";

            bossPending.current = {
              ticks: GAME_CONFIG.BOSS_WARNING_TICKS,
              mid,
            };

            showBanner(mid ? "⚠️ ATENÇÃO!" : "⚠️ WARNING!", 2000);
            fxQueue.current.push("warning");

            scriptIdx.current++;
            break;
          }
        }
      }

      // ======================================================
      // 2. TIROS DO JOGADOR
      // ======================================================

      for (const bullet of bulletsRef.current) {
        let vx = bullet.vx;
        let vy = bullet.vy;

        // Tiro teleguiado: curva em direção ao alvo mais próximo
        if (bullet.homing) {
          let tx = 0;
          let ty = 0;
          let best = 1e9;
          let found = false;

          for (const e of nextEnemies) {
            if (!e || e.y < -10 || e.y > bullet.y + 30) continue;
            const d = Math.hypot(e.x - bullet.x, e.y - bullet.y);
            if (d < best) {
              best = d;
              tx = e.x;
              ty = e.y;
              found = true;
            }
          }

          if (boss && boss.y > 0 && boss.y < bullet.y + 30) {
            const d = Math.hypot(boss.x - bullet.x, boss.y - bullet.y);
            if (d < best) {
              best = d;
              tx = boss.x;
              ty = boss.y;
              found = true;
            }
          }

          if (found) {
            const sp = weapon.speed;
            const dx = tx - bullet.x;
            const dy = ty - bullet.y;
            const d = Math.hypot(dx, dy) || 1;

            vx += ((dx / d) * sp - vx) * 0.22;
            vy += ((dy / d) * sp - vy) * 0.22;

            const m = Math.hypot(vx, vy) || 1;
            vx = (vx / m) * sp;
            vy = (vy / m) * sp;
          }
        }

        const nx = bullet.x + vx;
        const ny = bullet.y + vy;

        if (nx < -30 || nx > WIDTH + 30 || ny < -40 || ny > HEIGHT + 20) {
          continue;
        }

        const bw = (bullet.w ?? 7) / 2;
        const dmg = bullet.damage ?? 1;
        const hitList = bullet.hit ? bullet.hit.slice() : [];
        let consumed = false;

        // Asteroides e planetas
        for (let i = 0; i < nextObstacles.length && !consumed; i++) {
          const o = nextObstacles[i];
          const key = 100000 + o.id;
          if (hitList.includes(key)) continue;

          const ocx = o.x + o.fontSize / 2;
          const ocy = o.y + o.fontSize / 2;

          if (
            Math.abs(ocx - nx) < o.fontSize / 2 + bw + 4 &&
            Math.abs(ocy - ny) < o.fontSize / 2 + 10
          ) {
            hitList.push(key);
            killObstacle(i);
            if (!bullet.pierce) consumed = true;
          }
        }

        // Inimigos
        for (let i = 0; i < nextEnemies.length && !consumed; i++) {
          const e = nextEnemies[i];
          if (!e) continue;

          const key = 200000 + e.id;
          if (hitList.includes(key)) continue;

          if (
            Math.abs(e.x - nx) < e.size * 0.45 + bw &&
            Math.abs(e.y - ny) < e.size * 0.45 + 8
          ) {
            hitList.push(key);
            hitEnemy(i, dmg);
            if (!bullet.pierce) consumed = true;
          }
        }

        // Chefão / mini-chefe
        if (!consumed && boss && !bossDefeated && boss.y > -boss.size * 0.2) {
          const key = 300000 + boss.id;

          if (
            !hitList.includes(key) &&
            Math.abs(nx - boss.x) < boss.size * 0.45 + bw &&
            Math.abs(ny - boss.y) < boss.size * 0.45
          ) {
            hitList.push(key);
            boss = { ...boss, hp: boss.hp - dmg, hitFlash: 3 };
            scoreRef.current += 2;

            if (Math.random() < 0.15) explode(nx, ny);
            if (boss.hp <= 0) bossDefeated = true;
            if (!bullet.pierce) consumed = true;
          }
        }

        if (!consumed) {
          nextBullets.push({
            ...bullet,
            x: nx,
            y: ny,
            vx,
            vy,
            hit: bullet.pierce ? hitList : undefined,
          });
        }
      }

      bulletsRef.current = nextBullets;

      // ======================================================
      // 3. CHEFÃO DERROTADO
      // ======================================================

      if (boss && bossDefeated) {
        const wasMid = boss.isMid;
        const bonus = (wasMid ? 500 : 1000) * stage;

        scoreRef.current += bonus;
        popup(boss.x, boss.y, `+${bonus}`, "#ffffff");

        comboRef.current += 5;
        lastKillTick.current = tick;

        for (let k = 0; k < 5; k++) {
          explode(
            boss.x + (k - 2) * boss.size * 0.22,
            boss.y + (k % 2 ? 1 : -1) * boss.size * 0.2
          );
        }

        // (antes aqui caía o item "P"/"B"; agora o chefão solta filhotes, veja abaixo)

        // Chuva de moedas e gemas saindo do chefão
        {
          const coinsN = wasMid ? 5 : 9;
          for (let k = 0; k < coinsN; k++) {
            const t = k / (coinsN - 1) - 0.5;
            newDrops.push(
              dropCollectible(
                collectibleId.current++,
                boss.x,
                boss.y + (k % 3) * 14,
                false,
                t * boss.size * 1.4
              )
            );
          }
          const gemsN = wasMid ? 1 : 3;
          for (let k = 0; k < gemsN; k++) {
            newDrops.push(
              dropCollectible(
                collectibleId.current++,
                boss.x,
                boss.y - 10,
                true,
                (k - (gemsN - 1) / 2) * 40
              )
            );
          }
        }

        enemyBulletsRef.current = [];
        fxQueue.current.push("bossdead");

        if (wasMid) {
          showBanner("MINI-CHEFE DERROTADO!", 2200);
        } else {
          // Fim da fase: o que sobrou explode
          nextEnemies.forEach((e, i) => {
            if (e && i < 4) explode(e.x, e.y);
          });
          nextEnemies = [];

          bombsRef.current = Math.min(
            GAME_CONFIG.MAX_BOMBS,
            bombsRef.current + 1
          );
          setBombs(bombsRef.current);

          stagePhase.current = "clear";
          clearTimer.current = GAME_CONFIG.STAGE_CLEAR_TICKS;

          showBanner(`FASE ${stage} COMPLETA!  +${bonus}`, 2600);
          fxQueue.current.push("stageclear");
        }

        // Filhotes: pequenos emojis iguais ao chefão saem dele
        spawnKids(boss, wasMid ? 3 : Math.min(7, 4 + stage));

        boss = null;
      }

      // Combo (HUD)
      setCombo(comboRef.current);

      // ======================================================
      // 4. INIMIGOS
      // ======================================================

      const enemyNew: EnemyBullet[] = [];
      const ctx = { W: WIDTH, H: HEIGHT, px: pcx, py: pcy, stage };
      const survivors: Enemy[] = [];

      for (const e of nextEnemies) {
        if (!e) continue;

        const r = updateEnemy(e, ctx);

        for (const s of r.shots) {
          enemyNew.push({
            id: enemyBulletId.current++,
            x: s.x,
            y: s.y,
            vx: s.vx,
            vy: s.vy,
          });
        }

        if (!r.enemy) continue;
        const ne = r.enemy;

        // Encostar no inimigo machuca
        if (
          Math.abs(ne.x - pcx) < ne.size * 0.4 + HIT_W &&
          Math.abs(ne.y - pcy) < ne.size * 0.4 + HIT_H
        ) {
          hurtPlayer();
        }

        survivors.push(ne);
      }

      enemiesRef.current = survivors;

      // ======================================================
      // 5. OBSTÁCULOS (asteroides e planetas)
      // ======================================================

      nextObstacles = nextObstacles.map((o) => {
        // Com chefão na tela, os que ainda não entraram esperam
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
          Math.abs(ocx - pcx) < o.fontSize * 0.4 + HIT_W &&
          Math.abs(ocy - pcy) < o.fontSize * 0.4 + HIT_H
        ) {
          hurtPlayer();
          return randomObstacle(obstacleId.current++);
        }

        return { ...o, x: nx, y: ny };
      });

      obstaclesRef.current = nextObstacles;

      // ======================================================
      // 6. CHEFÃO: MOVIMENTO E ATAQUES
      // ======================================================

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

        // Energia galáctica: aura, carga antes do especial e onda de choque depois
        const fxBt = tick - boss.spawnTick;
        const fxEvery = phase2 ? 130 : 200;
        const fxPos = fxBt > 0 ? fxBt % fxEvery : 0;
        let fxCharge = 0;
        let fxBurst: number | undefined = undefined;
        if (entered && !boss.isMid) {
          if (fxPos >= fxEvery - 30) fxCharge = (fxPos - (fxEvery - 30)) / 30;
          else if (fxPos < 16 && fxBt > 0) fxBurst = fxPos / 16;
        }

        boss = {
          ...boss,
          x: bx,
          y: by,
          wave,
          hitFlash: Math.max(0, boss.hitFlash - 1),
          aura: BOSS_COLORS[(boss.level - 1) % 5],
          charge: fxCharge,
          burst: fxBurst,
        };

        if (entered) {
          const bt = tick - boss.spawnTick;

          // O chefão solta filhotes durante a luta
          const kidEvery = boss.isMid ? 130 : phase2 ? 70 : 100;
          if (
            bt > 0 &&
            bt % kidEvery === 0 &&
            nextEnemies.filter(Boolean).length < GAME_CONFIG.MAX_ENEMIES - 4
          ) {
            spawnKids(boss, 2);
          }
          // "Bomba" do chefão: ataque especial diferente para cada um
          const specialEvery = phase2 ? 130 : 200;
          if (!boss.isMid && bt > 0 && bt % specialEvery === 0) {
            const sp = bossSpecial(
              boss.level,
              boss.x,
              boss.y + boss.size * 0.4,
              WIDTH,
              pcx,
              pcy,
              Math.floor(bt / specialEvery)
            );
            popup(boss.x, boss.y + boss.size * 0.6, sp.name, "#ff5252");
            fxQueue.current.push("warning");
            for (const s of sp.shots) {
              enemyNew.push({ id: enemyBulletId.current++, ...s });
            }
          }

          const every =
            Math.max(14, (phase2 ? 24 : 36) - boss.level * 2) +
            (boss.isMid ? 6 : 0);

          if (bt % every === 0) {
            const n = Math.floor(bt / every);
            const speed = 6.5 + Math.min(boss.level, 4) * 0.5;

            // Cada chefão atira do seu jeito (cor, tamanho e padrão próprios)
            const volley = bossAttack(
              boss.level,
              boss.isMid,
              phase2,
              boss.x,
              boss.y + boss.size * 0.4,
              pcx,
              pcy,
              n,
              speed
            );

            for (const s of volley) {
              enemyNew.push({ id: enemyBulletId.current++, ...s });
            }
          }
        }

        // Encostar no chefão machuca
        if (
          Math.abs(pcx - boss.x) < boss.size * 0.4 + HIT_W &&
          Math.abs(pcy - boss.y) < boss.size * 0.4 + HIT_H
        ) {
          hurtPlayer();
        }
      }

      bossRef.current = boss;

      // ======================================================
      // 7. TIROS INIMIGOS
      // ======================================================

      const nextEnemyBullets: EnemyBullet[] = [];

      for (const e of [...enemyBulletsRef.current, ...enemyNew]) {
        const nx = e.x + e.vx;
        const ny = e.y + e.vy;

        if (nx < -20 || nx > WIDTH + 20 || ny > HEIGHT + 20 || ny < -60) {
          continue;
        }

        if (
          Math.abs(nx - pcx) < HIT_W + 6 &&
          Math.abs(ny - pcy) < HIT_H + 6
        ) {
          hurtPlayer();
          continue;
        }

        nextEnemyBullets.push({ ...e, x: nx, y: ny });
      }

      enemyBulletsRef.current =
        nextEnemyBullets.length > GAME_CONFIG.MAX_ENEMY_BULLETS
          ? nextEnemyBullets.slice(-GAME_CONFIG.MAX_ENEMY_BULLETS)
          : nextEnemyBullets;

      // ======================================================
      // 8. ITENS "P" (tiro) E "B" (bomba)
      // ======================================================

      if (!boss && !bossPending.current) {
        if (
          weaponLevelRef.current < GAME_CONFIG.MAX_WEAPON_LEVEL &&
          tick - lastPowerTick.current > GAME_CONFIG.POWERUP_SPAWN_TICKS
        ) {
          addPowerUp(30 + Math.random() * (WIDTH - 60), -30, "P");
        }

        if (
          bombsRef.current < 2 &&
          tick - lastBombItemTick.current >
            GAME_CONFIG.POWERUP_SPAWN_TICKS * 2
        ) {
          addPowerUp(30 + Math.random() * (WIDTH - 60), -30, "B");
        }
      }

      const nextPowerUps: PowerUp[] = [];

      for (const p of [...powerUpsRef.current, ...newPowerUps]) {
        const ny = p.y + p.speed * speedMult;

        if (ny > HEIGHT + 40) continue;

        if (Math.abs(p.x - pcx) < 34 && Math.abs(ny - pcy) < 44) {
          if (p.kind === "B") {
            if (bombsRef.current < GAME_CONFIG.MAX_BOMBS) {
              bombsRef.current += 1;
              setBombs(bombsRef.current);
              popup(p.x, ny, "💣 +1", "#9ad7ff");
              fxQueue.current.push("bombpickup");
            } else {
              scoreRef.current += 300;
              popup(p.x, ny, "+300", "#ffd700");
              fxQueue.current.push("bombpickup");
            }
          } else if (
            weaponLevelRef.current < GAME_CONFIG.MAX_WEAPON_LEVEL
          ) {
            weaponLevelRef.current += 1;
            setWeaponLevel(weaponLevelRef.current);
            showBanner(`⚡ TIRO NÍVEL ${weaponLevelRef.current}`, 1500);
            fxQueue.current.push("powerup");
          } else {
            scoreRef.current += 500;
            showBanner("TIRO MÁXIMO! +500", 1300);
            fxQueue.current.push("powerup");
          }
          continue;
        }

        nextPowerUps.push({ ...p, y: ny });
      }

      powerUpsRef.current = nextPowerUps;

      // ======================================================
      // 9. MOEDAS E GEMAS
      // ======================================================

      const nextCollectibles: Collectible[] = [];

      for (const c of [...collectiblesRef.current, ...newDrops]) {
        const ny = c.y + c.speed * speedMult;
        const nx = c.vx
          ? Math.max(0, Math.min(WIDTH - 32, c.x + c.vx * c.speed))
          : c.x;

        if (
          Math.abs(nx + 16 - pcx) < 40 &&
          Math.abs(ny + 16 - pcy) < 46
        ) {
          fxQueue.current.push("collect");

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

          // Item "fixo" do cenário volta depois; o que caiu de inimigo some
          if (!c.drop) {
            nextCollectibles.push(
              respawnCollectible(collectibleId.current++, c.special)
            );
          }
          continue;
        }

        if (ny > HEIGHT + 60) {
          if (!c.drop) {
            nextCollectibles.push(
              respawnCollectible(collectibleId.current++, c.special)
            );
          }
          continue;
        }

        nextCollectibles.push({ ...c, x: nx, y: ny });
      }

      collectiblesRef.current = nextCollectibles;

      // ======================================================
      // 10. EXPLOSÕES E PONTOS FLUTUANTES
      // ======================================================

      if (newExplosions.length > 0) {
        const updated = [
          ...explosionsRef.current,
          ...newExplosions,
        ].slice(-6);

        explosionsRef.current = updated;
        setExplosions(updated);
        fxQueue.current.push("explosion");
      }

      const nextPopups = [...popupsRef.current, ...newPopups]
        .map((p) => ({ ...p, age: p.age + 1 }))
        .filter((p) => p.age <= 24)
        .slice(-8);

      popupsRef.current = nextPopups;

      // ======================================================
      // 11. EFEITOS (sons / tremor / flash)
      // ======================================================

      if (fxQueue.current.length > 0) {
        const names = Array.from(new Set(fxQueue.current));
        fxQueue.current = [];
        setFx(names.map((name) => ({ id: fxSeq.current++, name })));
      }

      // ======================================================
      // 12. SINCRONIZA COM O REACT
      // ======================================================

      setScore(scoreRef.current);
      setBullets(nextBullets);
      setEnemyBullets(nextEnemyBullets);
      setPowerUps(nextPowerUps);
      setEnemies(survivors);
      setBoss(boss);
      setPopups(nextPopups);
      setObstacles(nextObstacles);
      setCollectibles(nextCollectibles);
    }, GAME_CONFIG.GAME_LOOP_INTERVAL);

    return () => clearInterval(loop);
  }, []);

  // ==========================================================
  // SHOOT
  //
  // Devolve true se realmente atirou (respeita o intervalo da
  // arma). Assim o tiro automático pode chamar à vontade.
  // ==========================================================

  function shoot(): boolean {
    if (gameOverRef.current) return false;

    const weapon = weaponRef.current;

    if (tickRef.current - lastShotTick.current < weapon.cooldown) {
      return false;
    }
    lastShotTick.current = tickRef.current;

    const level = Math.min(
      weaponLevelRef.current,
      weapon.patterns.length
    );
    const pattern = weapon.patterns[level - 1];

    // Sai do bico da nave
    const cx = playerRef.current.x + HALF;
    const y = playerRef.current.y + 8;

    const created: Bullet[] = pattern.map(([ox, vx, h]) => ({
      id: bulletId.current++,
      x: cx + ox,
      y,
      vx,
      vy: -weapon.speed,
      damage: weapon.damage,
      pierce: weapon.pierce,
      homing: weapon.homing || h === 1,
      color: weapon.color,
      w: weapon.w,
      h: weapon.h,
    }));

    const all = [...bulletsRef.current, ...created].slice(
      -GAME_CONFIG.MAX_BULLETS
    );

    // Só atualiza o ref: o loop do jogo já redesenha os tiros no próximo
    // tick. (Antes cada tiro forçava um redesenho extra da tela inteira.)
    bulletsRef.current = all;

    return true;
  }

  // ==========================================================
  // BOMBA
  // ==========================================================

  function fireBomb() {
    if (gameOverRef.current) return;
    if (bombsRef.current <= 0) return;
    if (bombPending.current) return;
    if (laserRef.current) return;
    if (
      tickRef.current - lastBombTick.current <
      GAME_CONFIG.BOMB_COOLDOWN_TICKS
    ) {
      return;
    }

    lastBombTick.current = tickRef.current;
    bombsRef.current -= 1;
    setBombs(bombsRef.current);

    // A bomba é aplicada no próximo passo do loop
    bombPending.current = true;
  }

  function isInvulnerable(): boolean {
    return tickRef.current < invulnUntil.current;
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

    bombsRef.current = GAME_CONFIG.START_BOMBS;
    bombPending.current = false;
    laserRef.current = null;
    setLaser(null);
    if (bombFxTimer.current) clearTimeout(bombFxTimer.current);
    setBombFx(null);
    lastBombTick.current = -100;

    invulnUntil.current = 0;
    lastKillTick.current = 0;
    lastPowerTick.current = 0;
    lastBombItemTick.current = 0;

    stageRef.current = 1;
    stageTickRef.current = -GAME_CONFIG.STAGE_INTRO_TICKS;
    scriptRef.current = buildStageScript(1, WIDTH);
    scriptIdx.current = 0;
    stagePhase.current = "play";
    clearTimer.current = 0;
    bossPending.current = null;
    bossRef.current = null;
    fxQueue.current = [];

    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    enemiesRef.current = [];
    powerUpsRef.current = [];
    popupsRef.current = [];
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
    setBombs(GAME_CONFIG.START_BOMBS);
    setStage(1);
    setFx([]);

    setBullets([]);
    setEnemyBullets([]);
    setEnemies([]);
    setPowerUps([]);
    setPopups([]);
    setBoss(null);
    setExplosions([]);
    setTrail([]);
    setObstacles(initialObstacles);
    setCollectibles(initialCollectibles);

    setPlayer({ x: startX, y: startY, angle: 0 });

    showBanner(`FASE 1 · ${themeForStage(1).label}`, 2000);
  }

  // ==========================================================
  // MOVE PLAYER (só a engine: NÃO redesenha a tela)
  //
  // A nave é desenhada fora do React (Animated), então mover a
  // nave não custa nenhuma renderização.
  // ==========================================================

  function movePlayer(x: number, y: number) {
    if (gameOverRef.current) return;
    playerRef.current = { x, y };
  }

  // ==========================================================
  // UPDATE PLAYER (antigo: redesenha a tela; mantido por compatibilidade)
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
    bombs,
    stage,
    banner,
    fx,

    bullets,
    enemyBullets,
    enemies,
    powerUps,
    popups,
    boss,
    explosions,
    trail,
    obstacles,
    collectibles,

    player,

    shoot,
    fireBomb,
    laser,
    bombFx,
    isInvulnerable,
    restartGame,
    movePlayer,
    updatePlayerPosition,

    setGameOver,
  };
}
