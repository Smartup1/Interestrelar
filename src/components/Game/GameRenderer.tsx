import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import {
  Star, Bullet, Explosion, Trail,
  Obstacle, Collectible, PlayerPosition,
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

// ─── Estrela individual com twinkle ───────────────────────────────────────────
function TwinkleStar({ star }: { star: Star }) {
  const opacity = useRef(new Animated.Value(Math.random())).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: Math.random() * 0.5 + 0.5,
          duration: 800 + Math.random() * 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(opacity, {
          toValue: Math.random() * 0.2 + 0.1,
          duration: 800 + Math.random() * 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
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
          star.size > 3 ? "#aad4ff" : star.size > 2 ? "#ffffff" : "#cce0ff",
        opacity,
        shadowColor: "#88ccff",
        shadowRadius: star.size * 2,
        shadowOpacity: 0.8,
      }}
    />
  );
}

// ─── Nebulosa estática de fundo ───────────────────────────────────────────────
function Nebula() {
  const opacity = useRef(new Animated.Value(0.06)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.13, duration: 4000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.06, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <>
      <Animated.View style={{
        position: "absolute", left: -80, top: 100,
        width: 320, height: 320, borderRadius: 160,
        backgroundColor: "#5500aa", opacity,
      }} />
      <Animated.View style={{
        position: "absolute", right: -60, top: 300,
        width: 260, height: 260, borderRadius: 130,
        backgroundColor: "#003388", opacity,
      }} />
      <Animated.View style={{
        position: "absolute", left: 60, bottom: 200,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: "#880022", opacity,
      }} />
    </>
  );
}

// ─── Bala com glow ────────────────────────────────────────────────────────────
function GlowBullet({ bullet }: { bullet: Bullet }) {
  const glow = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.6, duration: 120, useNativeDriver: true }),
      ])
    ).start();
    return () => glow.stopAnimation();
  }, []);
  return (
    <Animated.View style={{
      position: "absolute",
      left: bullet.x - 2,
      top: bullet.y - 4,
      alignItems: "center",
      opacity: glow,
    }}>
      {/* halo externo */}
      <View style={{
        position: "absolute",
        width: 14, height: 20,
        borderRadius: 7,
        backgroundColor: "rgba(0,200,255,0.18)",
      }} />
      {/* núcleo */}
      <View style={{
        width: 8, height: 14,
        borderRadius: 4,
        backgroundColor: "#00eeff",
        shadowColor: "#00eeff",
        shadowRadius: 8,
        shadowOpacity: 1,
      }} />
    </Animated.View>
  );
}

// ─── Explosão em camadas ───────────────────────────────────────────────────────
function ExplosionEffect({ explosion }: { explosion: Explosion }) {
  const scale1 = useRef(new Animated.Value(0.3)).current;
  const scale2 = useRef(new Animated.Value(0.1)).current;
  const opacity1 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale1, { toValue: 2.5, duration: 400, useNativeDriver: true }),
      Animated.timing(opacity1, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(80),
        Animated.timing(scale2, { toValue: 1.8, duration: 350, useNativeDriver: true }),
        Animated.timing(opacity2, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={{ position: "absolute", left: explosion.x - 30, top: explosion.y - 30 }}>
      {/* anel externo */}
      <Animated.View style={{
        position: "absolute",
        width: 60, height: 60, borderRadius: 30,
        borderWidth: 2, borderColor: "#ff8800",
        opacity: opacity1,
        transform: [{ scale: scale1 }],
      }} />
      {/* núcleo */}
      <Animated.View style={{
        position: "absolute",
        left: 10, top: 10,
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "rgba(255,200,0,0.7)",
        opacity: opacity2,
        transform: [{ scale: scale2 }],
      }} />
      {/* emoji */}
      <Text style={{ fontSize: 32, position: "absolute", left: 8, top: 8 }}>💥</Text>
    </View>
  );
}

// ─── Escudo animado ───────────────────────────────────────────────────────────
function ShieldEffect({ player }: { player: PlayerPosition }) {
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.linear })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.95, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.View style={{
      position: "absolute",
      left: player.x - 20,
      top: player.y - 20,
      width: 80, height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: "#00ffff",
      backgroundColor: "rgba(0,200,255,0.12)",
      transform: [{ rotate: spin }, { scale: pulse }],
      shadowColor: "#00ffff",
      shadowRadius: 12,
      shadowOpacity: 0.9,
    }}>
      {/* hexágono interno decorativo */}
      <View style={{
        position: "absolute", left: 12, top: 12,
        width: 56, height: 56, borderRadius: 28,
        borderWidth: 1, borderColor: "rgba(0,255,255,0.3)",
      }} />
    </Animated.View>
  );
}

// ─── Rastro de propulsão ───────────────────────────────────────────────────────
function TrailParticle({ t, index }: { t: Trail; index: number }) {
  const opacity = useRef(new Animated.Value(0.9 - index * 0.15)).current;
  const scale = useRef(new Animated.Value(1 - index * 0.1)).current;
  return (
    <Animated.View style={{
      position: "absolute",
      left: t.x + 8,
      top: t.y + 34,
      width: 18 - index * 2,
      height: 18 - index * 2,
      borderRadius: 9,
      backgroundColor:
        index === 0 ? "#ffffff" :
        index === 1 ? "#ffdd00" :
        index === 2 ? "#ff8800" : "#ff4400",
      opacity,
      transform: [{ scale }],
      shadowColor: "#ffaa00",
      shadowRadius: 6,
      shadowOpacity: 0.9,
    }} />
  );
}

// ─── Coletável pulsante ───────────────────────────────────────────────────────
function PulsingCollectible({ c }: { c: Collectible }) {
  const glow = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1.25, duration: 500, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
    return () => glow.stopAnimation();
  }, []);
  return (
    <Animated.Text style={{
      position: "absolute",
      left: c.x,
      top: c.y,
      fontSize: c.special ? 34 : 28,
      transform: [{ scale: glow }],
    }}>
      {c.special ? "💎" : "💰"}
    </Animated.Text>
  );
}

// ─── GameRenderer principal ───────────────────────────────────────────────────
export default function GameRenderer({
  stars, trail, collectibles, obstacles,
  bullets, explosions, shield, player, pulseAnim, gameOver,
}: GameRendererProps) {
  return (
    <>
      {/* Nebulosas de fundo */}
      <Nebula />

      {/* Estrelas com twinkle */}
      {stars.map((star) => (
        <TwinkleStar key={star.id} star={star} />
      ))}

      {/* Rastro de propulsão */}
      {trail.map((t, index) => (
        <TrailParticle key={t.id} t={t} index={index} />
      ))}

      {/* Coletáveis pulsantes */}
      {collectibles.map((c) => (
        <PulsingCollectible key={c.id} c={c} />
      ))}

      {/* Obstáculos */}
      {obstacles.map((o) => (
        <Text key={o.id} style={{
          position: "absolute", left: o.x, top: o.y, fontSize: o.fontSize,
        }}>
          {o.emoji}
        </Text>
      ))}

      {/* Balas com glow */}
      {bullets.map((b) => (
        <GlowBullet key={b.id} bullet={b} />
      ))}

      {/* Explosões em camadas */}
      {explosions.map((e) => (
        <ExplosionEffect key={e.id} explosion={e} />
      ))}

      {/* Escudo animado */}
      {shield && <ShieldEffect player={player} />}

      {/* Indicador de tiro pulsante */}
      {!gameOver && (
        <Animated.View style={{
          position: "absolute",
          left: player.x + 38,
          top: player.y - 8,
          transform: [{ scale: pulseAnim }],
          backgroundColor: "rgba(0,200,255,0.25)",
          borderRadius: 50,
          paddingHorizontal: 5,
          paddingVertical: 2,
          borderWidth: 1,
          borderColor: "rgba(0,220,255,0.5)",
        }}>
          <Text style={{ fontSize: 10, color: "#00eeff" }}>⚡</Text>
        </Animated.View>
      )}
    </>
  );
}
