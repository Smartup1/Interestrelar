import React, { memo, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
} from "react-native";

import {
  Star,
  Bullet,
  Explosion,
  Trail,
  Obstacle,
  Collectible,
  PlayerPosition,
  EnemyBullet,
  PowerUp,
  Boss,
  Enemy,
  Popup,
} from "../../types/game";

import { WIDTH, HEIGHT } from "../../constants/gameConfig";
import { stageTint } from "../../game/stages";

interface GameRendererProps {
  stars: Star[];
  trail: Trail[];
  collectibles: Collectible[];
  obstacles: Obstacle[];
  bullets: Bullet[];
  enemyBullets: EnemyBullet[];
  powerUps: PowerUp[];
  boss: Boss | null;
  enemies: Enemy[];
  popups: Popup[];
  stage: number;
  explosions: Explosion[];
  shield: boolean;
  player: PlayerPosition;
  pulseAnim: Animated.Value;
  gameOver: boolean;
}

/**
 * ============================================================
 * ANIMAÇÃO GLOBAL
 * ============================================================
 *
 * Em vez de criar um Animated.loop para cada estrela,
 * bala e coletável, usamos poucos valores compartilhados.
 *
 * Isso reduz bastante a quantidade de animações simultâneas.
 */

/**
 * ============================================================
 * ESTRELAS
 * ============================================================
 */

const TwinkleStar = memo(function TwinkleStar({
  star,
  twinkle,
}: {
  star: Star;
  twinkle: Animated.Value;
}) {
  /**
   * Pequena variação baseada no tamanho/ID da estrela.
   *
   * Não existe mais um Animated.loop por estrela.
   */

  const opacity = twinkle.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      star.size > 3 ? 0.45 : 0.25,
      star.size > 3 ? 1 : 0.7,
      star.size > 3 ? 0.45 : 0.25,
    ],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        borderRadius: star.size,
        backgroundColor:
          star.size > 3
            ? "#aad4ff"
            : star.size > 2
            ? "#ffffff"
            : "#cce0ff",
        opacity,

        /**
         * Shadow removido das estrelas pequenas.
         *
         * Shadow em dezenas de Views pode ser caro no Android.
         */
        ...(star.size > 3
          ? {
              shadowColor: "#88ccff",
              shadowRadius: 4,
              shadowOpacity: 0.5,
            }
          : {}),
      }}
    />
  );
});

/**
 * ============================================================
 * NEBULOSA
 * ============================================================
 */

const Nebula = memo(function Nebula() {
  const opacity = useRef(
    new Animated.Value(0.07)
  ).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.12,
          duration: 4000,
          useNativeDriver: true,
        }),

        Animated.timing(opacity, {
          toValue: 0.07,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <>
      <Animated.View
        style={{
          position: "absolute",
          left: -80,
          top: 100,
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: "#5500aa",
          opacity,
        }}
      />

      <Animated.View
        style={{
          position: "absolute",
          right: -60,
          top: 300,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: "#003388",
          opacity,
        }}
      />

      <Animated.View
        style={{
          position: "absolute",
          left: 60,
          bottom: 200,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: "#880022",
          opacity,
        }}
      />
    </>
  );
});

/**
 * ============================================================
 * BALA
 * ============================================================
 *
 * Removido Animated.loop individual.
 */

const GlowBullet = memo(function GlowBullet({
  bullet,
}: {
  bullet: Bullet;
}) {
  const w = bullet.w ?? 7;
  const h = bullet.h ?? 15;
  const color = bullet.color ?? "#00eeff";

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: w,
        height: h,
        borderRadius: w / 2,
        backgroundColor: color,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.65)",
        transform: [
          { translateX: bullet.x - w / 2 },
          { translateY: bullet.y - h / 2 },
        ],
      }}
    />
  );
});

/**
 * ============================================================
 * EXPLOSÃO
 * ============================================================
 */

const ExplosionEffect = memo(
  function ExplosionEffect({
    explosion,
  }: {
    explosion: Explosion;
  }) {
    const scale1 = useRef(
      new Animated.Value(0.3)
    ).current;

    const scale2 = useRef(
      new Animated.Value(0.1)
    ).current;

    const opacity1 = useRef(
      new Animated.Value(1)
    ).current;

    const opacity2 = useRef(
      new Animated.Value(0.8)
    ).current;

    useEffect(() => {
      const animation =
        Animated.parallel([
          Animated.timing(scale1, {
            toValue: 2.5,
            duration: 400,
            useNativeDriver: true,
          }),

          Animated.timing(opacity1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),

          Animated.sequence([
            Animated.delay(80),

            Animated.timing(scale2, {
              toValue: 1.8,
              duration: 350,
              useNativeDriver: true,
            }),

            Animated.timing(opacity2, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ]);

      animation.start();

      return () => {
        animation.stop();
      };
    }, [
      scale1,
      scale2,
      opacity1,
      opacity2,
    ]);

    return (
      <View
        style={{
          position: "absolute",
          left: explosion.x - 30,
          top: explosion.y - 30,
        }}
      >
        {/* Anel externo */}
        <Animated.View
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: "#ff8800",
            opacity: opacity1,
            transform: [
              {
                scale: scale1,
              },
            ],
          }}
        />

        {/* Núcleo */}
        <Animated.View
          style={{
            position: "absolute",
            left: 10,
            top: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor:
              "rgba(255,200,0,0.7)",
            opacity: opacity2,
            transform: [
              {
                scale: scale2,
              },
            ],
          }}
        />

        <Text
          style={{
            fontSize: 32,
            position: "absolute",
            left: 8,
            top: 8,
          }}
        >
          💥
        </Text>
      </View>
    );
  }
);

/**
 * ============================================================
 * ESCUDO
 * ============================================================
 *
 * Continua animado porque normalmente existe apenas um shield.
 */

export const ShieldEffect = memo(
  function ShieldEffect({
    player,
  }: {
    player: PlayerPosition;
  }) {
    const rotate = useRef(
      new Animated.Value(0)
    ).current;

    const pulse = useRef(
      new Animated.Value(1)
    ).current;

    useEffect(() => {
      const rotateAnimation =
        Animated.loop(
          Animated.timing(rotate, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.linear,
          })
        );

      const pulseAnimation =
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1.1,
              duration: 600,
              useNativeDriver: true,
            }),

            Animated.timing(pulse, {
              toValue: 0.95,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );

      rotateAnimation.start();
      pulseAnimation.start();

      return () => {
        rotateAnimation.stop();
        pulseAnimation.stop();
      };
    }, [rotate, pulse]);

    const spin =
      rotate.interpolate({
        inputRange: [0, 1],
        outputRange: [
          "0deg",
          "360deg",
        ],
      });

    return (
      <Animated.View
        style={{
          position: "absolute",

          left: player.x - 20,
          top: player.y - 20,

          width: 80,
          height: 80,

          borderRadius: 40,

          borderWidth: 2,
          borderColor: "#00ffff",

          backgroundColor:
            "rgba(0,200,255,0.12)",

          transform: [
            {
              rotate: spin,
            },
            {
              scale: pulse,
            },
          ],

          /**
           * Shadow reduzido.
           */
          shadowColor: "#00ffff",
          shadowRadius: 6,
          shadowOpacity: 0.6,
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 12,
            top: 12,

            width: 56,
            height: 56,

            borderRadius: 28,

            borderWidth: 1,

            borderColor:
              "rgba(0,255,255,0.3)",
          }}
        />
      </Animated.View>
    );
  }
);

/**
 * ============================================================
 * TRAIL
 * ============================================================
 */

const TrailParticle = memo(
  function TrailParticle({
    t,
    index,
  }: {
    t: Trail;
    index: number;
  }) {
    const opacity =
      Math.max(
        0.15,
        0.9 - index * 0.15
      );

    const size =
      Math.max(
        4,
        18 - index * 2
      );

    return (
      <View
        style={{
          position: "absolute",

          left: t.x + 8,
          top: t.y + 34,

          width: size,
          height: size,

          borderRadius: size / 2,

          backgroundColor:
            index === 0
              ? "#ffffff"
              : index === 1
              ? "#ffdd00"
              : index === 2
              ? "#ff8800"
              : "#ff4400",

          opacity,

          /**
           * Transform estático.
           * Não precisa de Animated aqui.
           */

          shadowColor: "#ffaa00",
          shadowRadius: 3,
          shadowOpacity: 0.5,
        }}
      />
    );
  }
);

/**
 * ============================================================
 * COLETÁVEL
 * ============================================================
 *
 * Não possui mais Animated.loop individual.
 */

const PulsingCollectible = memo(
  function PulsingCollectible({
    c,
    pulse,
  }: {
    c: Collectible;
    pulse: Animated.Value;
  }) {
    return (
      <Animated.Text
        style={{
          position: "absolute",

          left: 0,
          top: 0,

          fontSize: c.special
            ? 34
            : 28,

          transform: [
            { translateX: c.x },
            { translateY: c.y },
            {
              scale: pulse,
            },
          ],
        }}
      >
        {c.special ? "💎" : "💰"}
      </Animated.Text>
    );
  }
);

/**
 * ============================================================
 * OBSTÁCULO
 * ============================================================
 */

const ObstacleView = memo(
  function ObstacleView({
    obstacle,
  }: {
    obstacle: Obstacle;
  }) {
    return (
      <Text
        style={{
          position: "absolute",

          left: 0,
          top: 0,

          fontSize:
            obstacle.fontSize,

          transform: [
            { translateX: obstacle.x },
            { translateY: obstacle.y },
          ],
        }}
      >
        {obstacle.emoji}
      </Text>
    );
  }
);

/**
 * ============================================================
 * TIRO INIMIGO
 * ============================================================
 */

const EnemyBulletView = memo(function EnemyBulletView({
  bullet,
}: {
  bullet: EnemyBullet;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#ff3b30",
        borderWidth: 2,
        borderColor: "#ffd2a0",
        transform: [
          { translateX: bullet.x - 8 },
          { translateY: bullet.y - 8 },
        ],
      }}
    />
  );
});

/**
 * ============================================================
 * ITEM "P" (NÍVEL DE TIRO)
 * ============================================================
 */

const PowerUpView = memo(function PowerUpView({
  p,
  pulse,
}: {
  p: PowerUp;
  pulse: Animated.Value;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: p.kind === "B" ? "#1e88e5" : "#ff9500",
        borderWidth: 2,
        borderColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        transform: [
          { translateX: p.x - 17 },
          { translateY: p.y - 17 },
          { scale: pulse },
        ],
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontWeight: "900",
          fontSize: p.kind === "B" ? 16 : 18,
        }}
      >
        {p.kind === "B" ? "💣" : "P"}
      </Text>
    </Animated.View>
  );
});

/**
 * ============================================================
 * CHEFÃO
 * ============================================================
 */

const BossView = memo(function BossView({
  boss,
}: {
  boss: Boss;
}) {
  const pct = Math.max(0, boss.hp / boss.maxHp);

  const barColor =
    pct > 0.5 ? "#33dd55" : pct > 0.25 ? "#ffcc00" : "#ff3322";

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: boss.size,
        height: boss.size,
        alignItems: "center",
        justifyContent: "center",
        transform: [
          { translateX: boss.x - boss.size / 2 },
          { translateY: boss.y - boss.size / 2 },
        ],
      }}
    >
      {/* Barra de vida */}
      <View
        style={{
          position: "absolute",
          top: -14,
          width: boss.size,
          height: 9,
          borderRadius: 5,
          backgroundColor: "rgba(0,0,0,0.65)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.6)",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            backgroundColor: barColor,
          }}
        />
      </View>

      <Text
        style={{
          fontSize: boss.size * 0.85,
          lineHeight: boss.size,
          textAlign: "center",
          opacity: boss.hitFlash > 0 ? 0.45 : 1,
        }}
      >
        {boss.emoji}
      </Text>
    </View>
  );
});

/**
 * ============================================================
 * INIMIGO
 * ============================================================
 */

const EnemyView = memo(function EnemyView({ e }: { e: Enemy }) {
  const showBar = e.maxHp > 3;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: e.size,
        height: e.size,
        alignItems: "center",
        justifyContent: "center",
        transform: [
          { translateX: e.x - e.size / 2 },
          { translateY: e.y - e.size / 2 },
        ],
      }}
    >
      <Text
        style={{
          fontSize: e.size * 0.85,
          lineHeight: e.size,
          textAlign: "center",
          opacity: e.flash > 0 ? 0.4 : 1,
        }}
      >
        {e.emoji}
      </Text>

      {showBar && (
        <View
          style={{
            position: "absolute",
            top: -6,
            width: e.size * 0.8,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(0,0,0,0.55)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.max(0, e.hp / e.maxHp) * 100}%`,
              height: "100%",
              backgroundColor: "#ff5252",
            }}
          />
        </View>
      )}
    </View>
  );
});

/**
 * ============================================================
 * PONTOS FLUTUANTES ("+100 x2")
 * ============================================================
 */

const PopupView = memo(function PopupView({ p }: { p: Popup }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 80,
        alignItems: "center",
        opacity: Math.max(0, 1 - p.age / 24),
        transform: [
          { translateX: p.x - 40 },
          { translateY: p.y - p.age * 1.8 },
        ],
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "900",
          color: p.color,
          textShadowColor: "rgba(0,0,0,0.85)",
          textShadowRadius: 3,
        }}
      >
        {p.text}
      </Text>
    </View>
  );
});

/**
 * ============================================================
 * FUNDO ROLANDO (sensação de velocidade)
 * ============================================================
 *
 * 3 camadas de estrelas descem em velocidades diferentes. É tudo
 * animação nativa: não custa nada para o React.
 */

const STAR_LAYERS = [
  { count: 14, ms: 6500, size: 2, alpha: 0.45 },
  { count: 10, ms: 3800, size: 2.5, alpha: 0.7 },
  { count: 6, ms: 2200, size: 3, alpha: 0.95 },
];

const ScrollingStars = memo(function ScrollingStars() {
  const layers = useMemo(
    () =>
      STAR_LAYERS.map((l) =>
        Array.from({ length: l.count }, () => ({
          x: Math.random() * WIDTH,
          y: Math.random() * HEIGHT,
        }))
      ),
    []
  );

  const anims = useRef(
    STAR_LAYERS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const loops = anims.map((a, i) =>
      Animated.loop(
        Animated.timing(a, {
          toValue: 1,
          duration: STAR_LAYERS[i].ms,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    );

    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <>
      {layers.map((dots, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: WIDTH,
            height: HEIGHT * 2,
            transform: [
              {
                translateY: anims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [-HEIGHT, 0],
                }),
              },
            ],
          }}
        >
          {dots
            .concat(dots.map((d) => ({ x: d.x, y: d.y + HEIGHT })))
            .map((d, k) => (
              <View
                key={k}
                style={{
                  position: "absolute",
                  left: d.x,
                  top: d.y,
                  width: STAR_LAYERS[i].size,
                  height: STAR_LAYERS[i].size,
                  borderRadius: 2,
                  backgroundColor: `rgba(255,255,255,${STAR_LAYERS[i].alpha})`,
                }}
              />
            ))}
        </Animated.View>
      ))}
    </>
  );
});

/** Cor de cada fase (camada translúcida sobre o fundo). */
const StageTint = memo(function StageTint({ stage }: { stage: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: stageTint(stage),
      }}
    />
  );
});

/**
 * ============================================================
 * GAME RENDERER
 * ============================================================
 */

function GameRenderer({
  stars,
  trail,
  collectibles,
  obstacles,
  bullets,
  enemyBullets,
  powerUps,
  boss,
  enemies,
  popups,
  stage,
  explosions,
  shield,
  player,
  pulseAnim,
  gameOver,
}: GameRendererProps) {
  /**
   * ============================================================
   * ANIMAÇÃO GLOBAL DAS ESTRELAS
   * ============================================================
   */

  const starTwinkle = useRef(
    new Animated.Value(0)
  ).current;

  /**
   * ============================================================
   * ANIMAÇÃO GLOBAL DOS COLETÁVEIS
   * ============================================================
   */

  const collectiblePulse =
    useRef(
      new Animated.Value(1)
    ).current;

  useEffect(() => {
    /**
     * Uma única animação para todas
     * as estrelas.
     */

    const starAnimation =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            starTwinkle,
            {
              toValue: 1,
              duration: 1800,
              useNativeDriver: true,
              easing:
                Easing.inOut(
                  Easing.sin
                ),
            }
          ),

          Animated.timing(
            starTwinkle,
            {
              toValue: 0,
              duration: 1800,
              useNativeDriver: true,
              easing:
                Easing.inOut(
                  Easing.sin
                ),
            }
          ),
        ])
      );

    /**
     * Uma única animação para
     * todos os coletáveis.
     */

    const collectibleAnimation =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            collectiblePulse,
            {
              toValue: 1.12,
              duration: 500,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            collectiblePulse,
            {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }
          ),
        ])
      );

    starAnimation.start();
    collectibleAnimation.start();

    return () => {
      starAnimation.stop();
      collectibleAnimation.stop();
    };
  }, [
    starTwinkle,
    collectiblePulse,
  ]);

  return (
    <>
      {/* ======================================================
          FUNDO
      ====================================================== */}

      <Nebula />

      <StageTint stage={stage} />

      <ScrollingStars />

      {/* ======================================================
          ESTRELAS
      ====================================================== */}

      {stars.map((star) => (
        <TwinkleStar
          key={star.id}
          star={star}
          twinkle={starTwinkle}
        />
      ))}

      {/* ======================================================
          TRAIL
      ====================================================== */}

      {trail.map(
        (particle, index) => (
          <TrailParticle
            key={particle.id}
            t={particle}
            index={index}
          />
        )
      )}

      {/* ======================================================
          COLETÁVEIS
      ====================================================== */}

      {collectibles.map(
        (collectible) => (
          <PulsingCollectible
            key={collectible.id}
            c={collectible}
            pulse={
              collectiblePulse
            }
          />
        )
      )}

      {/* ======================================================
          ITENS "P"
      ====================================================== */}

      {powerUps.map((p) => (
        <PowerUpView
          key={p.id}
          p={p}
          pulse={collectiblePulse}
        />
      ))}

      {/* ======================================================
          OBSTÁCULOS
      ====================================================== */}

      {obstacles.map(
        (obstacle) => (
          <ObstacleView
            key={obstacle.id}
            obstacle={obstacle}
          />
        )
      )}

      {/* ======================================================
          INIMIGOS
      ====================================================== */}

      {enemies.map((e) => (
        <EnemyView key={e.id} e={e} />
      ))}

      {/* ======================================================
          CHEFÃO
      ====================================================== */}

      {boss && <BossView boss={boss} />}

      {/* ======================================================
          TIROS INIMIGOS
      ====================================================== */}

      {enemyBullets.map((b) => (
        <EnemyBulletView key={b.id} bullet={b} />
      ))}

      {/* ======================================================
          BALAS
      ====================================================== */}

      {bullets.map((bullet) => (
        <GlowBullet
          key={bullet.id}
          bullet={bullet}
        />
      ))}

      {/* ======================================================
          EXPLOSÕES
      ====================================================== */}

      {explosions.map(
        (explosion) => (
          <ExplosionEffect
            key={explosion.id}
            explosion={explosion}
          />
        )
      )}

      {/* ======================================================
          PONTOS FLUTUANTES
      ====================================================== */}

      {popups.map((p) => (
        <PopupView key={p.id} p={p} />
      ))}

      {/* ======================================================
          SHIELD
      ====================================================== */}

      {shield && (
        <ShieldEffect
          player={player}
        />
      )}

    </>
  );
}

/**
 * ============================================================
 * MEMO
 * ============================================================
 *
 * Evita renderizações quando as props não mudaram.
 */

export default memo(GameRenderer);