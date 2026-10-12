// src/game/theme.tsx
//
// ============================================================
// TEMAS DO CÉU (NOITE → AMANHECER → DIA → ENTARDECER)
// ============================================================
//
// A cada fase o céu muda de tema, com transição suave:
//   Fase 1 = NOITE · Fase 2 = AMANHECER · Fase 3 = DIA · Fase 4 = ENTARDECER
// e o ciclo recomeça na fase 5.
//
// A tela inicial usa o mesmo sistema, escolhendo o tema pela hora
// do aparelho (ver themeForHour).

export type SkyThemeId = "night" | "dawn" | "day" | "dusk";

export interface SkyTheme {
  id: SkyThemeId;
  /** Nome mostrado no aviso de início de fase. */
  label: string;
  /** Degradê do céu, de cima para baixo. */
  colors: [string, string, string];
  /** 0 = sem estrelas, 1 = céu estrelado completo. */
  starAlpha: number;
  /** Cor do sol/lua e do brilho em volta. */
  orb: string;
  orbGlow: string;
  /** Posição do sol/lua (fração da largura/altura da tela). */
  orbX: number;
  orbY: number;
  /** true = mostra a lua em vez do sol. */
  moon: boolean;
}

export const SKY_THEMES: Record<SkyThemeId, SkyTheme> = {
  night: {
    id: "night",
    label: "NOITE",
    colors: ["#000010", "#05051f", "#0b0a2e"],
    starAlpha: 1,
    orb: "#e8f0ff",
    orbGlow: "rgba(150,180,255,0.18)",
    orbX: 0.8,
    orbY: 0.14,
    moon: true,
  },
  dawn: {
    id: "dawn",
    label: "AMANHECER",
    colors: ["#1b1a4b", "#7a3f7e", "#ff9a5a"],
    starAlpha: 0.35,
    orb: "#ffd9a0",
    orbGlow: "rgba(255,170,90,0.35)",
    orbX: 0.22,
    orbY: 0.78,
    moon: false,
  },
  day: {
    id: "day",
    label: "DIA",
    // azul mais profundo de propósito: tiros ciano e HUD continuam legíveis
    colors: ["#0a4f9e", "#1f7fd6", "#6cc3f2"],
    starAlpha: 0,
    orb: "#fff4b0",
    orbGlow: "rgba(255,240,150,0.45)",
    orbX: 0.78,
    orbY: 0.13,
    moon: false,
  },
  dusk: {
    id: "dusk",
    label: "ENTARDECER",
    colors: ["#140f3a", "#6b2f6a", "#e0553a"],
    starAlpha: 0.45,
    orb: "#ffb070",
    orbGlow: "rgba(255,110,60,0.35)",
    orbX: 0.8,
    orbY: 0.74,
    moon: false,
  },
};

export const SKY_ORDER: SkyThemeId[] = ["night", "dawn", "day", "dusk"];

/** Tema da fase (1 = noite, 2 = amanhecer, 3 = dia, 4 = entardecer, 5 = noite...). */
export function themeForStage(stage: number): SkyTheme {
  const i = (Math.max(1, stage) - 1) % SKY_ORDER.length;
  return SKY_THEMES[SKY_ORDER[i]];
}

/** Tema pela hora do dia (usado na tela inicial). */
export function themeForHour(hour: number): SkyTheme {
  if (hour >= 6 && hour < 8) return SKY_THEMES.dawn;
  if (hour >= 8 && hour < 17) return SKY_THEMES.day;
  if (hour >= 17 && hour < 19) return SKY_THEMES.dusk;
  return SKY_THEMES.night;
}
