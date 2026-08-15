import React, { memo, useEffect, useRef } from "react";
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
} from "../../types/game";

interface GameRendererProps {
  stars: Star[];
  trail: Trail[];
  collectibles: Collectible[];
  obstacles: Obstacle[];
  bullets: Bullet[];
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
  return (
    <View
      style={{
        position: "absolute",
        left: bullet.x - 2,
        top: bullet.y - 4,
        alignItems: "center",
      }}
    >
      {/* Halo */}
      <View
        style={{
          position: "absolute",
          width: 12,
          height: 18,
          borderRadius: 6,
          backgroundColor:
            "rgba(0,200,255,0.18)",
        }}
      />

      {/* Núcleo */}
      <View
        style={{
          width: 7,
          height: 13,
          borderRadius: 4,
          backgroundColor: "#00eeff",

          /**
           * Shadow menor.
           */
          shadowColor: "#00eeff",
          shadowRadius: 4,
          shadowOpacity: 0.7,
        }}
      />
    </View>
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

const ShieldEffect = memo(
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

          left: c.x,
          top: c.y,

          fontSize: c.special
            ? 34
            : 28,

          transform: [
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

          left: obstacle.x,
          top: obstacle.y,

          fontSize:
            obstacle.fontSize,
        }}
      >
        {obstacle.emoji}
      </Text>
    );
  }
);

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
          SHIELD
      ====================================================== */}

      {shield && (
        <ShieldEffect
          player={player}
        />
      )}

      {/* ======================================================
          INDICADOR DE TIRO
      ====================================================== */}

      {!gameOver && (
        <Animated.View
          style={{
            position: "absolute",

            left:
              player.x + 38,

            top:
              player.y - 8,

            transform: [
              {
                scale: pulseAnim,
              },
            ],

            backgroundColor:
              "rgba(0,200,255,0.25)",

            borderRadius: 50,

            paddingHorizontal: 5,
            paddingVertical: 2,

            borderWidth: 1,

            borderColor:
              "rgba(0,220,255,0.5)",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: "#00eeff",
            }}
          >
            ⚡
          </Text>
        </Animated.View>
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