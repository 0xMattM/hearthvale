/**
 * Travel destinations and per-map visual identity (RF6.3).
 */

import {
  CANONICAL_LAND_KINDS,
  type CanonicalLandKind,
  normalizeLandKind,
} from "./catalog-land.js";
import { cssHexRgbDistance, parseCssHexRgb } from "./catalog-layouts.js";

export const LAND_DESTINATIONS: Array<{
  kind: CanonicalLandKind;
  name: string;
  /** One-line map blurb for TravelPanel (PL5.2). */
  blurb: string;
}> = [
  {
    kind: "city",
    name: "City",
    blurb: "Shared hub — tutorials, market, scarce stations.",
  },
  {
    kind: "player_land",
    name: "Your Land",
    blurb: "Private plot — starts empty; build your own stations.",
  },
  {
    kind: "explore",
    name: "Exploration",
    blurb: "Wilds — woodland, mines, and hunt trails (not on your land).",
  },
  {
    kind: "warrior",
    name: "Warrior Arena",
    blurb:
      "Optional parallel combat path — free enter/exit · not required · no combat gear ladder · not on the profession ladder.",
  },
];

/**
 * Quiet map identity for min-HUD chip + portal mesh tint (PL14.1 / PL14.2).
 * Short words (City / Land / Explore / Arena); warrior stays optional wording.
 * Portal veil encodes circuit role of the map this gateway serves.
 */
export interface MapIdentityVisual {
  /** Compact TopBar chip word. */
  word: string;
  /** Quiet geometric glyph beside the word (not emoji chrome). */
  glyph: string;
  /** Chip border / text accent. */
  accent: string;
  /** Portal frame posts. */
  portalFrame: string;
  /** Portal frame when interact-highlighted. */
  portalFrameLit: string;
  /** Portal lintel bar. */
  portalLintel: string;
  /** Portal veil fill. */
  portalVeil: string;
  /** Portal veil emissive. */
  portalEmissive: string;
}

/** Per-map identity palette (TopBar chip + portal silhouette). */
export const MAP_IDENTITY: Record<CanonicalLandKind, MapIdentityVisual> = {
  city: {
    word: "City",
    glyph: "◆",
    accent: "#8a9eb0",
    portalFrame: "#5a6a78",
    portalFrameLit: "#8a9aaa",
    portalLintel: "#4a5560",
    portalVeil: "#6ec8ff",
    portalEmissive: "#3aa0ff",
  },
  player_land: {
    word: "Land",
    glyph: "▣",
    accent: "#8aab6a",
    portalFrame: "#4a6a40",
    portalFrameLit: "#6a8a58",
    portalLintel: "#3a5534",
    portalVeil: "#7ec86a",
    portalEmissive: "#4aaa38",
  },
  explore: {
    word: "Explore",
    glyph: "▲",
    accent: "#6a9a7a",
    portalFrame: "#3a5548",
    portalFrameLit: "#5a7a68",
    portalLintel: "#2a4038",
    portalVeil: "#4aba8a",
    portalEmissive: "#2a8860",
  },
  warrior: {
    word: "Arena",
    glyph: "◇",
    accent: "#d4886a",
    portalFrame: "#6a4030",
    portalFrameLit: "#8a5840",
    portalLintel: "#4a3020",
    portalVeil: "#e09060",
    portalEmissive: "#c06030",
  },
};

/**
 * Resolves quiet map identity for HUD chip / portal tint (PL14.1 / PL14.2).
 * Legacy aliases normalize; unknown falls back to Land.
 *
 * @param kind - Active or destination land kind (may be legacy alias).
 * @returns Identity visual for that circuit role.
 */
export function mapIdentityForLandKind(
  kind: string | null | undefined,
): MapIdentityVisual {
  const n = kind ? normalizeLandKind(String(kind)) : null;
  return MAP_IDENTITY[n ?? "player_land"];
}

/**
 * Compact current-map chip word for min HUD (PL14.1).
 * Warrior uses optional “Arena” wording (not full TravelPanel name).
 *
 * @param kind - Active land kind.
 * @returns City / Land / Explore / Arena.
 */
export function currentMapChipLabel(
  kind: string | null | undefined,
): string {
  return mapIdentityForLandKind(kind).word;
}

/**
 * Portal mesh colors for the map this gateway serves (PL14.2 circuit role).
 *
 * @param kind - Active land kind where the portal stands.
 * @returns Frame / veil / emissive colors.
 */
export function portalMeshTintForLandKind(
  kind: string | null | undefined,
): Pick<
  MapIdentityVisual,
  | "portalFrame"
  | "portalFrameLit"
  | "portalLintel"
  | "portalVeil"
  | "portalEmissive"
> {
  const id = mapIdentityForLandKind(kind);
  return {
    portalFrame: id.portalFrame,
    portalFrameLit: id.portalFrameLit,
    portalLintel: id.portalLintel,
    portalVeil: id.portalVeil,
    portalEmissive: id.portalEmissive,
  };
}

/**
 * Minimum pairwise portal-veil RGB distance across the four maps (PL14.2).
 *
 * @returns Smallest distance among distinct map veils.
 */
export function portalMeshTintContrastMin(): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < CANONICAL_LAND_KINDS.length; i++) {
    for (let j = i + 1; j < CANONICAL_LAND_KINDS.length; j++) {
      const a = MAP_IDENTITY[CANONICAL_LAND_KINDS[i]!].portalVeil;
      const b = MAP_IDENTITY[CANONICAL_LAND_KINDS[j]!].portalVeil;
      const d = cssHexRgbDistance(a, b);
      if (d < min) min = d;
    }
  }
  return Number.isFinite(min) ? min : 0;
}

/**
 * Linear blend of two CSS hex colors (PL122.1 cloak/kit map tint).
 *
 * @param a - Start hex.
 * @param b - End hex.
 * @param t - Mix weight toward `b` (clamped 0–1).
 * @returns Blended hex, or `a` when either input is invalid.
 */
export function mixCssHex(a: string, b: string, t: number): string {
  const ra = parseCssHexRgb(a);
  const rb = parseCssHexRgb(b);
  if (!ra || !rb) return a;
  const u = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
  const r = Math.round(ra[0]! + (rb[0]! - ra[0]!) * u);
  const g = Math.round(ra[1]! + (rb[1]! - ra[1]!) * u);
  const bl = Math.round(ra[2]! + (rb[2]! - ra[2]!) * u);
  return `#${[r, g, bl]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Quiet local-avatar cloak/kit tint by current map (PL122.1).
 * Complements portal mesh tint (PL14.2) + map chip (PL14.1).
 * Movement / combat unchanged; remotes stay untinted; min HUD.
 */
export const LOCAL_AVATAR_MAP_TINT = {
  /** Farmer kit vest base (matches AVATAR_PALETTES.local.vest). */
  baseVest: "#6b4423",
  /** Farmer kit hat-band base (matches AVATAR_PALETTES.local.hatBand). */
  baseHatBand: "#5c4030",
  /** How far vest leans toward map portal veil. */
  vestMix: 0.58,
  /** How far hat band leans toward map chip accent. */
  hatBandMix: 0.5,
  /** Soft vest emissive intensity (map portal emissive hue). */
  vestEmissiveIntensity: 0.14,
} as const;

/** Cloak/kit colors for the local avatar on a given map (PL122.1). */
export interface LocalAvatarMapTintColors {
  vest: string;
  hatBand: string;
  vestEmissive: string;
  vestEmissiveIntensity: number;
}

/**
 * Resolves quiet local cloak/kit tint for the active map (PL122.1).
 * Legacy aliases normalize; unknown falls back to Land.
 *
 * @param kind - Active land kind (may be legacy alias).
 * @returns Vest / hat-band / emissive colors for the local kit.
 */
export function localAvatarMapTintForLandKind(
  kind: string | null | undefined,
): LocalAvatarMapTintColors {
  const id = mapIdentityForLandKind(kind);
  const { baseVest, baseHatBand, vestMix, hatBandMix, vestEmissiveIntensity } =
    LOCAL_AVATAR_MAP_TINT;
  return {
    vest: mixCssHex(baseVest, id.portalVeil, vestMix),
    hatBand: mixCssHex(baseHatBand, id.accent, hatBandMix),
    vestEmissive: id.portalEmissive,
    vestEmissiveIntensity,
  };
}

/**
 * Minimum pairwise local-avatar vest RGB distance across the four maps (PL122.1).
 *
 * @returns Smallest distance among distinct map vest tints.
 */
export function localAvatarMapTintContrastMin(): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < CANONICAL_LAND_KINDS.length; i++) {
    for (let j = i + 1; j < CANONICAL_LAND_KINDS.length; j++) {
      const a = localAvatarMapTintForLandKind(CANONICAL_LAND_KINDS[i]!).vest;
      const b = localAvatarMapTintForLandKind(CANONICAL_LAND_KINDS[j]!).vest;
      const d = cssHexRgbDistance(a, b);
      if (d < min) min = d;
    }
  }
  return Number.isFinite(min) ? min : 0;
}

/** Soft secondary on portal world Html (PL37.1) — fare-free circuit role. */

