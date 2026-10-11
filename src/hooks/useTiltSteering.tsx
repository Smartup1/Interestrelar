// src/hooks/useTiltSteering.tsx

import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Accelerometer } from "expo-sensors";
import { GAME_CONFIG } from "../constants/gameConfig";

/**
 * Controle da nave exclusivamente pelo acelerômetro.
 *
 * Devolve uma ref (tiltX.current) com valor de -1 a 1:
 *   negativo = inclinação para um lado
 *   positivo = inclinação para o outro lado
 *
 * Calibração: a primeira leitura depois que o sensor é ligado vira a
 * posição neutra. Como o sensor liga/desliga conforme `enabled`, o jogo
 * é recalibrado a cada nova partida (passe `!gameOver`).
 *
 * O TOUCH NÃO controla a nave; serve somente para disparar.
 */
export function useTiltSteering(enabled: boolean = true) {
  const tiltX = useRef(0);

  // Posição neutra do celular no momento em que o sensor é iniciado
  const baselineX = useRef<number | null>(null);

  // Valor suavizado
  const smoothedX = useRef(0);

  useEffect(() => {
    baselineX.current = null;
    smoothedX.current = 0;
    tiltX.current = 0;

    // Sensor não funciona no navegador
    if (Platform.OS === "web" || !enabled) return;

    const {
      TILT_UPDATE_INTERVAL,
      TILT_SMOOTHING_ALPHA,
      TILT_DEADZONE,
      TILT_MAX_TILT,
      TILT_INVERT_X,
    } = GAME_CONFIG;

    let subscription: { remove: () => void } | null = null;
    let mounted = true;
// Calibra com a média das primeiras leituras (mais estável que uma só)
    const CALIBRATION_SAMPLES = 10;
    let calibSum = 0;
    let calibCount = 0;
    const startSensor = async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();
        if (!available || !mounted) return;

        Accelerometer.setUpdateInterval(TILT_UPDATE_INTERVAL);

        subscription = Accelerometer.addListener(({ x }) => {
          if (!mounted) return;

          // Primeiras leituras: a média delas vira a posição neutra.
          if (baselineX.current === null) {
            calibSum += x;
            calibCount += 1;
            if (calibCount >= CALIBRATION_SAMPLES) {
              baselineX.current = calibSum / calibCount;
            }
            return;
          }
          const diff = x - baselineX.current;

          // Zona morta contínua: abaixo do limite vale 0 e, acima, o valor
          // cresce a partir de 0 (sem "pulo" ao sair da zona morta).
          const rawX =
            Math.abs(diff) < TILT_DEADZONE
              ? 0
              : diff - Math.sign(diff) * TILT_DEADZONE;

          // Suavização: quanto maior o alpha, mais rápido responde.
          smoothedX.current =
            smoothedX.current * (1 - TILT_SMOOTHING_ALPHA) +
            rawX * TILT_SMOOTHING_ALPHA;

          // Normaliza para -1..1
          const normalized = Math.max(
            -1,
            Math.min(1, smoothedX.current / (TILT_MAX_TILT - TILT_DEADZONE))
          );

          tiltX.current = normalized * TILT_INVERT_X;
        });
      } catch (error) {
        console.warn("Erro ao iniciar acelerômetro:", error);
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
  }, [enabled]);

  return tiltX;
}
