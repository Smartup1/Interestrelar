// src/components/Game/SkyBackground.tsx
//
// Céu do jogo com transição suave entre NOITE → AMANHECER → DIA → ENTARDECER.
// Cada tema é uma camada (degradê + sol/lua) e a mudança de fase só anima a
// opacidade das camadas (animação nativa: não pesa no jogo).

import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { WIDTH, HEIGHT } from "../../constants/gameConfig";
import {
  SKY_ORDER,
  SKY_THEMES,
  SkyTheme,
  themeForStage,
} from "../../game/theme";

const TRANSITION_MS = 2800;

/** Disco do sol/lua com brilho em volta. */
export const Orb = memo(function Orb({
  theme,
  w = WIDTH,
  h = HEIGHT,
}: {
  theme: SkyTheme;
  w?: number;
  h?: number;
}) {
  const size = theme.moon ? 46 : 64;
  const glow = size * 3.2;
  const cx = theme.orbX * w;
  const cy = theme.orbY * h;

  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: cx - glow / 2,
          top: cy - glow / 2,
          width: glow,
          height: glow,
          borderRadius: glow / 2,
          backgroundColor: theme.orbGlow,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.orb,
          opacity: theme.moon ? 0.9 : 1,
        }}
      />
      {theme.moon && (
        // "mordida" da lua (cor do céu da noite)
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: cx - size / 2 + 12,
            top: cy - size / 2 - 6,
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: size,
            backgroundColor: theme.colors[0],
          }}
        />
      )}
    </>
  );
});

/**
 * Controla as camadas do céu.
 * Devolve a opacidade de cada tema e a "quantidade de estrelas" (0..1)
 * para o jogo esconder estrelas/nebulosas durante o dia.
 */
export function useSkyTransition(stage: number) {
  const opacities = useRef(
    SKY_ORDER.map((id) => new Animated.Value(id === themeForStage(stage).id ? 1 : 0))
  ).current;

  useEffect(() => {
    const target = themeForStage(stage).id;
    const anim = Animated.parallel(
      SKY_ORDER.map((id, i) =>
        Animated.timing(opacities[i], {
          toValue: id === target ? 1 : 0,
          duration: TRANSITION_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      )
    );
    anim.start();
    return () => anim.stop();
  }, [stage, opacities]);

  const starAlpha = useMemo(() => {
    const parts = SKY_ORDER.map((id, i) =>
      Animated.multiply(opacities[i], SKY_THEMES[id].starAlpha)
    );
    return Animated.add(Animated.add(parts[0], parts[1]), Animated.add(parts[2], parts[3]));
  }, [opacities]);

  return { opacities, starAlpha };
}

const SkyBackground = memo(function SkyBackground({
  opacities,
}: {
  opacities: Animated.Value[];
}) {
  return (
    <>
      {SKY_ORDER.map((id, i) => {
        const theme = SKY_THEMES[id];
        return (
          <Animated.View
            key={id}
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { opacity: opacities[i] }]}
          >
            <LinearGradient colors={theme.colors} style={StyleSheet.absoluteFill} />
            <Orb theme={theme} />
          </Animated.View>
        );
      })}
    </>
  );
});

export default SkyBackground;
