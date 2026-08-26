// src/hooks/useTiltSteering.tsx

import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Accelerometer } from "expo-sensors";

/**
 * Controle da nave exclusivamente pelo acelerômetro.
 *
 * tiltX.current:
 *   negativo = inclinação para um lado
 *   positivo = inclinação para o outro lado
 *
 * O valor é calibrado automaticamente quando o jogo começa.
 *
 * O TOUCH NÃO controla a nave.
 * O toque deve ser utilizado somente para disparar.
 */
export function useTiltSteering() {
  const tiltX = useRef(0);

  // Posição neutra do celular no momento em que o sensor é iniciado
  const baselineX = useRef<number | null>(null);

  // Valor suavizado
  const smoothedX = useRef(0);

  useEffect(() => {
    // Sensor não funciona no navegador
    if (Platform.OS === "web") {
      tiltX.current = 0;
      return;
    }

    let subscription: { remove: () => void } | null = null;
    let mounted = true;

    const startSensor = async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();

        if (!available || !mounted) {
          return;
        }

        // Aproximadamente 20 leituras por segundo
        Accelerometer.setUpdateInterval(50);

        subscription = Accelerometer.addListener(({ x }) => {
          if (!mounted) return;

          /*
           * Primeira leitura:
           * considera a posição atual do celular como posição neutra.
           */
          if (baselineX.current === null) {
            baselineX.current = x;
            smoothedX.current = 0;
            tiltX.current = 0;
            return;
          }

          /*
           * Diferença em relação à posição neutra.
           */
          let rawX = x - baselineX.current;

          /*
           * Zona morta.
           *
           * Evita que pequenas vibrações façam a nave se movimentar.
           */
          const DEAD_ZONE = 0.04;

          if (Math.abs(rawX) < DEAD_ZONE) {
            rawX = 0;
          }

          /*
           * Suavização.
           *
           * Quanto maior o segundo valor,
           * mais rápido o controle responde.
           */
          smoothedX.current =
            smoothedX.current * 0.75 +
            rawX * 0.25;

          /*
           * Limita o valor para evitar velocidades exageradas.
           */
          const MAX_TILT = 0.7;

          const normalized = Math.max(
            -1,
            Math.min(
              1,
              smoothedX.current / MAX_TILT
            )
          );

          tiltX.current = normalized;
        });
      } catch (error) {
        console.warn(
          "Erro ao iniciar acelerômetro:",
          error
        );
      }
    };

    startSensor();

    return () => {
      mounted = false;

      subscription?.remove();
      subscription = null;

      baselineX.current = null;
      smoothedX.current = 0;
      tiltX.current = 0;
    };
  }, []);

  return tiltX;
}