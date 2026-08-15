import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Accelerometer } from "expo-sensors";

/**
 * Lê o acelerômetro do celular e devolve uma ref com a inclinação lateral
 * suavizada, de aproximadamente -1 (inclinado pra esquerda) a 1 (pra direita).
 *
 * Não funciona no navegador (web) — nesse caso a ref fica sempre em 0,
 * o que não afeta o controle por toque.
 */
export function useTiltSteering() {
  const tiltX = useRef(0);

  useEffect(() => {
    if (Platform.OS === "web") return;

    let subscription: { remove: () => void } | null = null;

    Accelerometer.isAvailableAsync().then((available) => {
      if (!available) return;

      Accelerometer.setUpdateInterval(50); // ~20 leituras por segundo

      subscription = Accelerometer.addListener(({ x }) => {
        // Suaviza com média móvel simples para não tremer (jitter do sensor)
        tiltX.current = tiltX.current * 0.8 + x * 0.2;
      });
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return tiltX;
}