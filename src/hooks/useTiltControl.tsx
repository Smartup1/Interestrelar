// src/hooks/useTiltControl.tsx
import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

export interface TiltValue {
  x: number; // inclinação esquerda/direita (-1 a 1, aprox.)
  y: number; // inclinação frente/trás (-1 a 1, aprox.)
}

interface UseTiltControlOptions {
  enabled: boolean;
  updateIntervalMs?: number;
  // Suavização do sinal (0 = sem suavização, mais perto de 1 = mais suave/lento)
  smoothing?: number;
}

/**
 * Lê o acelerômetro do aparelho e devolve uma ref com a inclinação atual,
 * já calibrada (zerada) a partir da posição em que o jogador está segurando
 * o celular no momento em que o controle é ativado.
 *
 * Usar via ref (não via state) para evitar re-renders a 60fps — quem consome
 * este hook deve ler tiltRef.current dentro do próprio loop do jogo.
 */
export function useTiltControl({
  enabled,
  updateIntervalMs = 16,
  smoothing = 0.15,
}: UseTiltControlOptions) {
  const tiltRef = useRef<TiltValue>({ x: 0, y: 0 });
  const baselineRef = useRef<{ x: number; y: number } | null>(null);
  const smoothedRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      baselineRef.current = null;
      tiltRef.current = { x: 0, y: 0 };
      smoothedRef.current = { x: 0, y: 0 };
      return;
    }

    Accelerometer.setUpdateInterval(updateIntervalMs);

    const subscription = Accelerometer.addListener(({ x, y }) => {
      // Calibra na primeira leitura: essa posição vira o "neutro",
      // assim o jogador não precisa segurar o celular perfeitamente na vertical.
      if (!baselineRef.current) {
        baselineRef.current = { x, y };
      }

      const rawX = x - baselineRef.current.x;
      const rawY = y - baselineRef.current.y;

      // Suavização (low-pass filter) para tirar tremida/ruído do sensor
      smoothedRef.current = {
        x: smoothedRef.current.x + (rawX - smoothedRef.current.x) * (1 - smoothing),
        y: smoothedRef.current.y + (rawY - smoothedRef.current.y) * (1 - smoothing),
      };

      tiltRef.current = {
        x: smoothedRef.current.x,
        y: smoothedRef.current.y,
      };
    });

    return () => {
      subscription.remove();
      baselineRef.current = null;
    };
  }, [enabled, updateIntervalMs, smoothing]);

  return tiltRef;
}
