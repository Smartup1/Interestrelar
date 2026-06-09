import { Animated, Easing } from "react-native";

export function createPulseAnimation(pulseAnim: Animated.Value) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.4,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.sin),
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.sin),
      }),
    ])
  );
}

// Fade in/out genérico
export function createFadeAnimation(anim: Animated.Value, toValue: number, duration = 300) {
  return Animated.timing(anim, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.inOut(Easing.quad),
  });
}

// Shake (para dano)
export function createShakeAnimation(anim: Animated.Value) {
  return Animated.sequence([
    Animated.timing(anim, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(anim, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(anim, { toValue: 6, duration: 50, useNativeDriver: true }),
    Animated.timing(anim, { toValue: -6, duration: 50, useNativeDriver: true }),
    Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
}
