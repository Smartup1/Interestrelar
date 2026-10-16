// src/components/Game/sprites/index.tsx
//
// ============================================================
// SPRITES SVG DO INTERESTRELAR
// ============================================================
//
// Cada inimigo / chefão tem um desenho próprio em SVG programado.
// Vantagens: mesmo visual em iOS/Android, escala perfeita, sem PNG.

import React from "react";
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
} from "react-native-svg";

interface SpriteProps {
  size: number;
}

// ============================================================
// INIMIGOS
// ============================================================

/** 👾 Scout — invasor roxo */
export const ScoutSprite = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Line x1="32" y1="30" x2="22" y2="12" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
    <Line x1="68" y1="30" x2="78" y2="12" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
    <Circle cx="22" cy="12" r="4" fill="#fbbf24" />
    <Circle cx="78" cy="12" r="4" fill="#fbbf24" />
    <Ellipse cx="50" cy="58" rx="34" ry="36" fill="#a855f7" stroke="#6a0dad" strokeWidth="3" />
    <Ellipse cx="38" cy="52" rx="9" ry="11" fill="#fff" />
    <Ellipse cx="62" cy="52" rx="9" ry="11" fill="#fff" />
    <Circle cx="38" cy="52" r="4" fill="#1a0033" />
    <Circle cx="62" cy="52" r="4" fill="#1a0033" />
    <Path d="M 40 76 Q 50 84 60 76" stroke="#1a0033" strokeWidth="3" fill="none" strokeLinecap="round" />
  </Svg>
);

/** 🛸 Swooper — disco voador pequeno */
export const SwooperSprite = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="68" rx="44" ry="14" fill="#94a3b8" stroke="#334155" strokeWidth="3" />
    <Ellipse cx="50" cy="58" rx="28" ry="20" fill="#67e8f9" stroke="#0e7490" strokeWidth="3" />
    <Ellipse cx="50" cy="54" rx="18" ry="10" fill="#cffafe" opacity="0.85" />
    <Circle cx="22" cy="70" r="4" fill="#fde047" />
    <Circle cx="38" cy="73" r="4" fill="#fde047" />
    <Circle cx="62" cy="73" r="4" fill="#fde047" />
    <Circle cx="78" cy="70" r="4" fill="#fde047" />
  </Svg>
);

/** 👽 Diver — alien clássico */
export const DiverSprite = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="55" rx="36" ry="42" fill="#7CFC00" stroke="#3a7a00" strokeWidth="3" />
    <Path d="M 50 15 Q 55 3 66 6 Q 60 14 50 15" fill="#3a7a00" />
    <Ellipse cx="36" cy="52" rx="12" ry="16" fill="#000" />
    <Ellipse cx="64" cy="52" rx="12" ry="16" fill="#000" />
    <Ellipse cx="38" cy="48" rx="4" ry="6" fill="#fff" />
    <Ellipse cx="66" cy="48" rx="4" ry="6" fill="#fff" />
    <Path d="M 40 78 Q 50 86 60 78" stroke="#3a7a00" strokeWidth="3" fill="none" strokeLinecap="round" />
  </Svg>
);

/** 🛰️ Gunner — satélite armado */
export const GunnerSprite = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Rect x="4" y="36" width="30" height="28" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
    <Line x1="12" y1="36" x2="12" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Line x1="22" y1="36" x2="22" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Rect x="66" y="36" width="30" height="28" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
    <Line x1="74" y1="36" x2="74" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Line x1="84" y1="36" x2="84" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Circle cx="50" cy="50" r="17" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
    <Circle cx="50" cy="50" r="9" fill="#e2e8f0" />
    <Circle cx="50" cy="50" r="4" fill="#0ea5e9" />
    <Line x1="50" y1="33" x2="50" y2="16" stroke="#475569" strokeWidth="3" />
    <Circle cx="50" cy="14" r="4" fill="#ef4444" />
  </Svg>
);

/** 🐙 Heavy — polvo rosa */
export const HeavySprite = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M 20 60 Q 12 76 18 92 Q 26 95 30 88 Q 24 76 32 64" fill="#c026d3" stroke="#701a75" strokeWidth="2" />
    <Path d="M 40 68 Q 32 82 40 94 Q 48 96 52 88 Q 44 78 48 70" fill="#c026d3" stroke="#701a75" strokeWidth="2" />
    <Path d="M 60 68 Q 52 82 60 94 Q 68 96 72 88 Q 64 78 68 70" fill="#c026d3" stroke="#701a75" strokeWidth="2" />
    <Path d="M 80 60 Q 88 76 82 92 Q 74 95 70 88 Q 76 76 68 64" fill="#c026d3" stroke="#701a75" strokeWidth="2" />
    <Ellipse cx="50" cy="42" rx="36" ry="34" fill="#c026d3" stroke="#701a75" strokeWidth="3" />
    <Ellipse cx="38" cy="40" rx="9" ry="11" fill="#fff" />
    <Ellipse cx="62" cy="40" rx="9" ry="11" fill="#fff" />
    <Circle cx="38" cy="42" r="4" fill="#000" />
    <Circle cx="62" cy="42" r="4" fill="#000" />
    <Path d="M 42 58 Q 50 64 58 58" stroke="#701a75" strokeWidth="2" fill="none" />
  </Svg>
);

// ============================================================
// CHEFÕES (final da fase)
// ============================================================

/** 🛸 boss-0 — nave-mãe */
export const BossMothership = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Line x1="50" y1="26" x2="50" y2="8" stroke="#334155" strokeWidth="3" />
    <Circle cx="50" cy="6" r="5" fill="#ef4444" />
    <Ellipse cx="50" cy="74" rx="46" ry="14" fill="#64748b" stroke="#1e293b" strokeWidth="3" />
    <Ellipse cx="50" cy="62" rx="44" ry="18" fill="#94a3b8" stroke="#334155" strokeWidth="3" />
    <Ellipse cx="50" cy="46" rx="30" ry="22" fill="#67e8f9" stroke="#0e7490" strokeWidth="3" />
    <Ellipse cx="50" cy="42" rx="18" ry="10" fill="#cffafe" opacity="0.85" />
    <Circle cx="18" cy="76" r="5" fill="#fde047" />
    <Circle cx="36" cy="80" r="5" fill="#fde047" />
    <Circle cx="64" cy="80" r="5" fill="#fde047" />
    <Circle cx="82" cy="76" r="5" fill="#fde047" />
  </Svg>
);

/** 👾 boss-1 — invasor gigante */
export const BossInvader = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Line x1="20" y1="22" x2="10" y2="4" stroke="#6a0dad" strokeWidth="5" strokeLinecap="round" />
    <Line x1="80" y1="22" x2="90" y2="4" stroke="#6a0dad" strokeWidth="5" strokeLinecap="round" />
    <Circle cx="10" cy="4" r="5" fill="#fbbf24" />
    <Circle cx="90" cy="4" r="5" fill="#fbbf24" />
    <Ellipse cx="50" cy="56" rx="44" ry="44" fill="#a855f7" stroke="#6a0dad" strokeWidth="3" />
    <Ellipse cx="34" cy="48" rx="13" ry="15" fill="#fff" />
    <Ellipse cx="66" cy="48" rx="13" ry="15" fill="#fff" />
    <Circle cx="34" cy="48" r="6" fill="#1a0033" />
    <Circle cx="66" cy="48" r="6" fill="#1a0033" />
    <Path d="M 34 78 Q 50 92 66 78" stroke="#1a0033" strokeWidth="3" fill="none" strokeLinecap="round" />
    <Circle cx="18" cy="78" r="4" fill="#fbbf24" />
    <Circle cx="82" cy="78" r="4" fill="#fbbf24" />
  </Svg>
);

/** 🐙 boss-2 — kraken */
export const BossKraken = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M 12 55 Q 2 76 12 94 Q 22 97 28 88 Q 18 74 26 58" fill="#c026d3" stroke="#701a75" strokeWidth="2" />
    <Path d="M 32 60 Q 22 80 32 96 Q 42 98 46 90 Q 36 78 42 62" fill="#c026d3" stroke="#701a75" strokeWidth="2" />
    <Path d="M 58 62 Q 50 80 58 96 Q 68 98 72 90 Q 62 78 66 62" fill="#c026d3" stroke="#701a75" strokeWidth="2" />
    <Path d="M 78 58 Q 88 76 78 92 Q 68 95 62 88 Q 72 74 66 60" fill="#c026d3" stroke="#701a75" strokeWidth="2" />
    <Ellipse cx="50" cy="34" rx="40" ry="32" fill="#c026d3" stroke="#701a75" strokeWidth="3" />
    <Ellipse cx="32" cy="32" rx="11" ry="13" fill="#fef08a" />
    <Ellipse cx="68" cy="32" rx="11" ry="13" fill="#fef08a" />
    <Circle cx="32" cy="34" r="5" fill="#000" />
    <Circle cx="68" cy="34" r="5" fill="#000" />
    <Path d="M 36 52 Q 50 60 64 52" stroke="#3b0764" strokeWidth="3" fill="none" />
  </Svg>
);

/** 👹 boss-3 — oni */
export const BossOni = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M 26 22 Q 14 4 8 22 L 20 30 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="2" />
    <Path d="M 74 22 Q 86 4 92 22 L 80 30 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="2" />
    <Ellipse cx="50" cy="52" rx="42" ry="44" fill="#dc2626" stroke="#7f1d1d" strokeWidth="3" />
    <Ellipse cx="34" cy="46" rx="9" ry="8" fill="#fde047" />
    <Ellipse cx="66" cy="46" rx="9" ry="8" fill="#fde047" />
    <Circle cx="34" cy="46" r="3" fill="#000" />
    <Circle cx="66" cy="46" r="3" fill="#000" />
    <Ellipse cx="50" cy="62" rx="6" ry="4" fill="#7f1d1d" />
    <Path d="M 30 78 Q 50 92 70 78" stroke="#7f1d1d" strokeWidth="3" fill="#1a0000" />
    <Path d="M 38 78 L 40 86 M 50 82 L 50 90 M 62 78 L 60 86" stroke="#fff" strokeWidth="2" />
  </Svg>
);

/** 💀 boss-4 — caveira */
export const BossSkull = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path
      d="M 50 8 Q 18 8 12 40 Q 10 62 18 72 L 24 82 L 30 80 L 32 92 L 42 90 L 45 96 L 55 96 L 58 90 L 68 92 L 70 80 L 76 82 L 82 72 Q 90 62 88 40 Q 82 8 50 8 Z"
      fill="#f1f5f9"
      stroke="#475569"
      strokeWidth="3"
    />
    <Ellipse cx="34" cy="42" rx="11" ry="13" fill="#000" />
    <Ellipse cx="66" cy="42" rx="11" ry="13" fill="#000" />
    <Circle cx="34" cy="42" r="5" fill="#ef4444" />
    <Circle cx="66" cy="42" r="5" fill="#ef4444" />
    <Path d="M 50 56 L 44 68 L 56 68 Z" fill="#000" />
    <Line x1="42" y1="80" x2="42" y2="92" stroke="#475569" strokeWidth="2" />
    <Line x1="50" y1="78" x2="50" y2="94" stroke="#475569" strokeWidth="2" />
    <Line x1="58" y1="80" x2="58" y2="92" stroke="#475569" strokeWidth="2" />
  </Svg>
);

// ============================================================
// MINI-CHEFES (meio da fase)
// ============================================================

/** 🛰️ mid-0 — satélite pesado */
export const MidSatellite = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Rect x="2" y="36" width="32" height="28" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
    <Line x1="10" y1="36" x2="10" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Line x1="20" y1="36" x2="20" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Line x1="30" y1="36" x2="30" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Rect x="66" y="36" width="32" height="28" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
    <Line x1="74" y1="36" x2="74" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Line x1="84" y1="36" x2="84" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Line x1="94" y1="36" x2="94" y2="64" stroke="#1e3a8a" strokeWidth="1" />
    <Circle cx="50" cy="50" r="20" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
    <Circle cx="50" cy="50" r="10" fill="#94a3b8" />
    <Circle cx="50" cy="50" r="5" fill="#0ea5e9" />
    <Line x1="50" y1="30" x2="50" y2="12" stroke="#64748b" strokeWidth="3" />
    <Circle cx="50" cy="10" r="5" fill="#facc15" />
    <Circle cx="50" cy="86" r="4" fill="#ef4444" />
  </Svg>
);

/** 🤖 mid-1 — robô */
export const MidRobot = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Line x1="50" y1="22" x2="50" y2="10" stroke="#334155" strokeWidth="3" />
    <Circle cx="50" cy="8" r="4" fill="#ef4444" />
    <Rect x="26" y="30" width="48" height="46" rx="6" fill="#94a3b8" stroke="#334155" strokeWidth="3" />
    <Rect x="30" y="20" width="40" height="12" rx="3" fill="#64748b" stroke="#334155" strokeWidth="2" />
    <Circle cx="38" cy="48" r="7" fill="#0ea5e9" />
    <Circle cx="62" cy="48" r="7" fill="#0ea5e9" />
    <Circle cx="38" cy="48" r="3" fill="#fff" />
    <Circle cx="62" cy="48" r="3" fill="#fff" />
    <Rect x="38" y="62" width="24" height="4" fill="#334155" />
    <Rect x="14" y="44" width="12" height="22" fill="#64748b" stroke="#334155" strokeWidth="2" />
    <Rect x="74" y="44" width="12" height="22" fill="#64748b" stroke="#334155" strokeWidth="2" />
    <Rect x="34" y="80" width="8" height="14" fill="#334155" />
    <Rect x="58" y="80" width="8" height="14" fill="#334155" />
  </Svg>
);

/** 🦂 mid-2 — escorpião */
export const MidScorpion = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M 70 55 Q 92 40 86 20 Q 82 8 74 12" stroke="#a16207" strokeWidth="7" fill="none" strokeLinecap="round" />
    <Path d="M 74 12 L 68 4 L 82 4 Z" fill="#fbbf24" />
    <Path d="M 20 55 L 4 42 L 12 38" stroke="#a16207" strokeWidth="5" fill="none" strokeLinecap="round" />
    <Path d="M 20 66 L 4 78 L 12 82" stroke="#a16207" strokeWidth="5" fill="none" strokeLinecap="round" />
    <Ellipse cx="46" cy="60" rx="32" ry="20" fill="#a16207" stroke="#713f12" strokeWidth="3" />
    <Circle cx="30" cy="54" r="3" fill="#000" />
    <Circle cx="42" cy="54" r="3" fill="#000" />
    <Line x1="40" y1="78" x2="34" y2="94" stroke="#713f12" strokeWidth="3" />
    <Line x1="50" y1="80" x2="50" y2="94" stroke="#713f12" strokeWidth="3" />
    <Line x1="60" y1="78" x2="66" y2="94" stroke="#713f12" strokeWidth="3" />
  </Svg>
);

/** 👺 mid-3 — tengu */
export const MidTengu = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M 28 30 Q 50 4 72 30" fill="#1e293b" />
    <Ellipse cx="50" cy="55" rx="38" ry="40" fill="#ef4444" stroke="#7f1d1d" strokeWidth="3" />
    <Path d="M 24 40 Q 34 34 44 40" stroke="#1e293b" strokeWidth="4" fill="none" />
    <Path d="M 56 40 Q 66 34 76 40" stroke="#1e293b" strokeWidth="4" fill="none" />
    <Ellipse cx="34" cy="48" rx="8" ry="7" fill="#fff" />
    <Ellipse cx="66" cy="48" rx="8" ry="7" fill="#fff" />
    <Circle cx="34" cy="48" r="3" fill="#000" />
    <Circle cx="66" cy="48" r="3" fill="#000" />
    <Path d="M 50 58 L 50 82 L 44 82 L 50 58 Z" fill="#dc2626" />
    <Path d="M 34 74 Q 50 86 66 74" stroke="#7f1d1d" strokeWidth="3" fill="none" />
  </Svg>
);

/** 🧟 mid-4 — zumbi */
export const MidZombie = ({ size }: SpriteProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="55" rx="38" ry="42" fill="#84cc16" stroke="#3f6212" strokeWidth="3" />
    <Path d="M 14 34 Q 50 4 86 34 L 80 22 Q 50 8 20 22 Z" fill="#3f6212" />
    <Ellipse cx="32" cy="50" rx="9" ry="7" fill="#fff" />
    <Ellipse cx="68" cy="52" rx="9" ry="9" fill="#fff" />
    <Circle cx="32" cy="50" r="3" fill="#000" />
    <Circle cx="68" cy="52" r="3" fill="#000" />
    <Path d="M 34 74 L 40 82 L 46 74 L 52 82 L 58 74 L 64 82" stroke="#3f6212" strokeWidth="2" fill="none" />
    <Line x1="40" y1="20" x2="34" y2="32" stroke="#3f6212" strokeWidth="2" />
    <Line x1="60" y1="20" x2="66" y2="32" stroke="#3f6212" strokeWidth="2" />
  </Svg>
);

// ============================================================
// MAPA DE SPRITES + COMPONENTE GENÉRICO
// ============================================================

export const SPRITES: Record<string, React.FC<SpriteProps>> = {
  // inimigos
  scout: ScoutSprite,
  swooper: SwooperSprite,
  diver: DiverSprite,
  gunner: GunnerSprite,
  heavy: HeavySprite,

  // chefões (final da fase)
  "boss-0": BossMothership,
  "boss-1": BossInvader,
  "boss-2": BossKraken,
  "boss-3": BossOni,
  "boss-4": BossSkull,

  // mini-chefes (meio da fase)
  "mid-0": MidSatellite,
  "mid-1": MidRobot,
  "mid-2": MidScorpion,
  "mid-3": MidTengu,
  "mid-4": MidZombie,
};

/** Renderiza um sprite pelo seu `spriteKey` (ou `null` se não existir). */
export function Sprite({
  spriteKey,
  size,
}: {
  spriteKey: string;
  size: number;
}) {
  const Cmp = SPRITES[spriteKey];
  if (!Cmp) return null;
  return <Cmp size={size} />;
}