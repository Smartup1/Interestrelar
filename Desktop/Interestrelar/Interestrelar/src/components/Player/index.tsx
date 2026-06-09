import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

interface PlayerProps {
  x: number;
  y: number;
  angle: number;
  shield?: boolean;
  pulsating?: Animated.Value;
}

export default function Player({ x, y, angle, shield = false, pulsating }: PlayerProps) {
  // Motor de propulsão — brilho pulsante atrás da nave
  const engineGlow = useRef(new Animated.Value(0.6)).current;
  const engineScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(engineGlow, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(engineScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(engineGlow, { toValue: 0.5, duration: 150, useNativeDriver: true }),
          Animated.timing(engineScale, { toValue: 0.7, duration: 150, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ rotate: `${angle - 45}deg` }],
      overflow: 'visible',
    }}>
      {/* Motor — brilho atrás */}
      <Animated.View style={{
        position: 'absolute',
        bottom: -8,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#ff8800',
        shadowColor: '#ffaa00',
        shadowRadius: 12,
        shadowOpacity: 1,
        opacity: engineGlow,
        transform: [{ scale: engineScale }],
      }} />
      <Animated.View style={{
        position: 'absolute',
        bottom: -4,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowRadius: 6,
        shadowOpacity: 1,
        opacity: engineGlow,
        transform: [{ scale: engineScale }],
      }} />

      {/* Nave */}
      <Text style={{ fontSize: 44, lineHeight: 52, textAlign: 'center' }}>🚀</Text>

      {/* Escudo */}
      {shield && (
        <View style={{
          position: 'absolute',
          width: 72, height: 72, borderRadius: 36,
          borderWidth: 2, borderColor: '#00ffff',
          backgroundColor: 'rgba(0,255,255,0.15)',
          shadowColor: '#00ffff',
          shadowRadius: 10,
          shadowOpacity: 0.9,
        }} />
      )}

      {/* Pulsante ao atirar */}
      {pulsating && (
        <Animated.View style={{
          position: 'absolute',
          width: 70, height: 70, borderRadius: 35,
          backgroundColor: 'rgba(0,200,255,0.2)',
          transform: [{ scale: pulsating }],
        }} />
      )}
    </View>
  );
}
