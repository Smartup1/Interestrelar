// src/components/Game/LaserBeam.tsx
//
// Feixe de laser que sai do bico da nave e sobe até o topo da tela.
// Vai dentro de uma View que acompanha a nave (caixa 90x90), então
// o feixe segue a nave sem custar renderização do React.

import React, { memo, useEffect, useRef } from "react";
import { Animated, View } from "react-native";

import { HEIGHT } from "../../constants/gameConfig";

interface Props {
  color: string;
  coreColor: string;
  halfWidth: number;
}

const LaserBeam = memo(function LaserBeam({
  color,
  coreColor,
  halfWidth,
}: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  // O feixe "vibra" (largura oscila) enquanto está ligado
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  const w = halfWidth * 2;
  const length = HEIGHT;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 45 - halfWidth,
        // sai do bico da nave (~38px acima do centro da caixa)
        top: 45 - 38 - length,
        width: w,
        height: length,
        transform: [
          {
            scaleX: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.86, 1.1],
            }),
          },
        ],
      }}
    >
      {/* brilho externo */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderTopLeftRadius: w / 2,
          borderTopRightRadius: w / 2,
          backgroundColor: color,
          opacity: 0.28,
        }}
      />

      {/* corpo */}
      <View
        style={{
          position: "absolute",
          left: w * 0.18,
          right: w * 0.18,
          top: 0,
          bottom: 0,
          borderTopLeftRadius: w,
          borderTopRightRadius: w,
          backgroundColor: color,
          opacity: 0.65,
        }}
      />

      {/* núcleo branco */}
      <View
        style={{
          position: "absolute",
          left: w * 0.38,
          right: w * 0.38,
          top: 0,
          bottom: 0,
          backgroundColor: coreColor,
          opacity: 0.95,
        }}
      />
    </Animated.View>
  );
});

export default LaserBeam;
