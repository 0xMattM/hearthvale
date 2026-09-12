/**
 * Visual cue configs part 29/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  cssHexRgbDistance,
  isPlayerLandKind
} from "./catalog-buildings.js";
import { ITEMS, ItemDefinition, ItemId } from "./catalog-items.js";
import { EXPAND_FIELD_PAD_FLASH, SLOT_EXPANSIONS, expandFieldPadFlashEnvelope, nextSlotExpansion } from "./catalog-cues-28.js";

/**
 * Pad opacity for expand-field flash (PL137.2).
 *
 * @param envelope - 0..1 from `expandFieldPadFlashEnvelope`.
 * @returns Opacity.
 */
export function expandFieldPadFlashOpacity(envelope: number): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * EXPAND_FIELD_PAD_FLASH.opacityPeak;
}

/**
 * Pad emissive intensity for expand-field flash (PL137.2).
 *
 * @param envelope - 0..1 from `expandFieldPadFlashEnvelope`.
 * @returns Emissive intensity.
 */
export function expandFieldPadFlashEmissiveIntensity(envelope: number): number {
  const e = Math.min(1, Math.max(0, envelope));
  return e * EXPAND_FIELD_PAD_FLASH.intensityPeak;
}

/**
 * True when expand-field flash coords are valid for rendering (PL137.2).
 *
 * @param flashX - Grid x of the unlocked footprint, or null.
 * @param flashZ - Grid z of the unlocked footprint, or null.
 * @returns True when both coords are finite numbers.
 */
export function shouldShowExpandFieldPadFlash(
  flashX: number | null,
  flashZ: number | null,
): boolean {
  return (
    flashX != null &&
    flashZ != null &&
    Number.isFinite(flashX) &&
    Number.isFinite(flashZ)
  );
}

/**
 * Quiet expand-pad world tint when the next unlock is affordable vs short (PL26.1).
 * Costs stay in SLOT_EXPANSIONS — this is visual only (no HUD column).
 */
export const EXPAND_PAD_AFFORD_CUE = {
  /** Soft meadow-green when coins + mats + energy cover the next slot. */
  affordablePad: "#5a7a48",
  /** Warm gold walk-up when affordable (legacy highlight spirit). */
  affordablePadLit: "#c4b060",
  affordableEmissive: "#6a8a40",
  affordableEmissiveIntensity: 0.2,
  affordableEmissiveIntensityLit: 0.38,
  /** Cool muted pad when short funds / mats / energy. */
  shortPad: "#3a3830",
  shortPadLit: "#5a5040",
  shortEmissive: "#000000",
  shortEmissiveIntensity: 0,
} as const;

/** Affordability mode for the next expand pad (PL26.1). */
export type ExpandPadAffordMode = "affordable" | "short";

/** First missing expand resource (PL26.1 / PL26.2). Null when affordable or no slots. */
export type ExpandSlotShortfall =
  | { kind: "coins"; need: number }

  | { kind: "materials"; itemId: ItemId; qty: number; name: string }
  | { kind: "energy"; need: number };

export interface ExpandAffordInput {
  occupiedSlotIndexes: readonly number[];
  softCurrency: number;
  energy: number;
  /** Qty held for an item id (client inventory sum or server count). */
  inventoryQty: (itemId: string) => number;
}

/**
 * First expand shortfall for the next unlockable slot (PL26.1 / PL26.2).
 * Check order matches server expandLandSlot: coins → mats → energy.
 *
 * @param input - Occupancy + wallet / energy / inventory.
 * @returns Shortfall, or null when affordable or no expand slots remain.
 */
export function expandSlotShortfall(
  input: ExpandAffordInput,
): ExpandSlotShortfall | null {
  const next = nextSlotExpansion([...input.occupiedSlotIndexes]);
  if (!next) return null;
  if (input.softCurrency < next.coinCost) {
    return { kind: "coins", need: next.coinCost };
  }
  for (const mat of next.materials) {
    if (input.inventoryQty(mat.itemId) < mat.qty) {
      return {
        kind: "materials",
        itemId: mat.itemId,
        qty: mat.qty,
        name: ITEMS[mat.itemId]?.name ?? mat.itemId,
      };
    }
  }
  if (input.energy < next.energyCost) {
    return { kind: "energy", need: next.energyCost };
  }
  return null;
}

/**
 * Afford mode for the next expand pad, or null when no slots remain (PL26.1).
 *
 * @param input - Same as `expandSlotShortfall`.
 * @returns `affordable` / `short`, or null when expand is exhausted.
 */
export function expandPadAffordMode(
  input: ExpandAffordInput,
): ExpandPadAffordMode | null {
  const next = nextSlotExpansion([...input.occupiedSlotIndexes]);
  if (!next) return null;
  return expandSlotShortfall(input) ? "short" : "affordable";
}

/**
 * Pad mesh colors for expand afford tint (PL26.1).
 *
 * @param mode - From `expandPadAffordMode`.
 * @param highlighted - True when the player is in walk-up range.
 * @returns Pad + soft emissive for ExpandPadMesh.
 */
export function expandPadMeshColors(
  mode: ExpandPadAffordMode,
  highlighted: boolean,
): {
  padColor: string;
  emissive: string;
  emissiveIntensity: number;
} {
  const c = EXPAND_PAD_AFFORD_CUE;
  if (mode === "affordable") {
    return {
      padColor: highlighted ? c.affordablePadLit : c.affordablePad,
      emissive: c.affordableEmissive,
      emissiveIntensity: highlighted
        ? c.affordableEmissiveIntensityLit
        : c.affordableEmissiveIntensity,
    };
  }
  return {
    padColor: highlighted ? c.shortPadLit : c.shortPad,
    emissive: c.shortEmissive,
    emissiveIntensity: c.shortEmissiveIntensity,
  };
}

/**
 * Soft pad pulse when expand is interact-highlighted and short on cost (PL123.1).
 * Complements PL26.1 short tint — glanceable afford without a HUD column.
 * Expand costs / slots unchanged; mute ok (visual only).
 */
export const EXPAND_PAD_SHORT_AFFORD_PULSE = {
  periodMs: 1400,
  /** Warm amber emissive — reads short vs affordable green without a strobe. */
  emissive: "#8a6a38",
  emissiveBase: 0.1,
  emissivePeak: 0.36,
  /** First walk-up tip keeps a soft floor above the pulse trough. */
  emissiveWalkUpFloor: 0.22,
} as const;

/**
 * True when the expand pad should soft-pulse for short afford (PL123.1).
 * Only while interact-highlighted and mode is short; affordable / idle stay quiet.
 *
 * @param mode - From `expandPadAffordMode`.
 * @param highlighted - True when expand is the interact target.
 * @returns True when the short-afford pulse should run.
 */
export function expandPadShortAffordPulseActive(
  mode: ExpandPadAffordMode,
  highlighted: boolean,
): boolean {
  return mode === "short" && highlighted === true;
}

/**
 * Soft sine envelope for expand-pad short afford pulse (PL123.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function expandPadShortAffordPulseEnvelope(nowMs: number): number {
  const period = EXPAND_PAD_SHORT_AFFORD_PULSE.periodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Pad emissive intensity — pulses only while short + highlighted (PL123.1).
 * Affordable / idle short keep PL26.1 static tint intensities.
 *
 * @param mode - From `expandPadAffordMode`.
 * @param highlighted - True when expand is the interact target.
 * @param showFirstWalkUpTip - True during PL72.1 first walk-up tip.
 * @param pulseEnvelope - 0..1 from `expandPadShortAffordPulseEnvelope`.
 * @returns Emissive intensity for ExpandPadMesh.
 */
export function expandPadShortAffordPulseEmissiveIntensity(
  mode: ExpandPadAffordMode,
  highlighted: boolean,
  showFirstWalkUpTip: boolean,
  pulseEnvelope: number,
): number {
  const base = expandPadMeshColors(mode, highlighted).emissiveIntensity;
  if (!expandPadShortAffordPulseActive(mode, highlighted)) {
    return showFirstWalkUpTip ? Math.max(base, 0.28) : base;
  }
  const {
    emissiveBase,
    emissivePeak,
    emissiveWalkUpFloor,
  } = EXPAND_PAD_SHORT_AFFORD_PULSE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  const pulsed = emissiveBase + e * (emissivePeak - emissiveBase);
  if (showFirstWalkUpTip) {
    return Math.max(pulsed, emissiveWalkUpFloor);
  }
  return pulsed;
}

/**
 * Pad emissive color — warm amber while short-afford pulse is active (PL123.1).
 *
 * @param mode - From `expandPadAffordMode`.
 * @param highlighted - True when expand is the interact target.
 * @returns Emissive hex for ExpandPadMesh.
 */
export function expandPadShortAffordPulseEmissive(
  mode: ExpandPadAffordMode,
  highlighted: boolean,
): string {
  if (expandPadShortAffordPulseActive(mode, highlighted)) {
    return EXPAND_PAD_SHORT_AFFORD_PULSE.emissive;
  }
  return expandPadMeshColors(mode, highlighted).emissive;
}

/**
 * Soft expand-pad landmark cue leftover (PL163.1).
 * Quiet warm field-gold haze/emissive on existing expand_pad while visible on
 * homestead — complements short-afford pulse PL123.1 + tip PL72.1.
 * Layouts / costs unchanged; mute ok; pad afford tint stays primary interact cue.
 */
export const EXPAND_PAD_LANDMARK_CUE = {
  /** Warm field-gold kinship — ≠ short amber / flash gold / affordable green. */
  emissive: "#b8a048",
  intensityBase: 0.06,
  intensityPeak: 0.18,
  hazeColor: "#5a4820",
  hazeOpacityBase: 0.045,
  hazeOpacityPeak: 0.12,
  hazeRadius: 1.18,
  /** Slower than short-afford pulse so continuous landmark stays glanceable. */
  pulsePeriodMs: 3200,
} as const;

export interface ExpandPadLandmarkCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
}

/**
 * Soft expand-pad landmark fields (PL163.1).
 * Always-on while the expand pad mesh is mounted — not interact-gated.
 *
 * @param padVisible - True when ExpandPadMesh is shown on homestead.
 * @returns Warm field-gold haze fields; `show` false when pad is hidden.
 */
export function expandPadLandmarkCue(
  padVisible: boolean,
): ExpandPadLandmarkCueVisual {
  const c = EXPAND_PAD_LANDMARK_CUE;
  if (!padVisible) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeRadius: c.hazeRadius,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeRadius: c.hazeRadius,
  };
}

/**
 * Soft sine envelope for expand-pad landmark pulse (PL163.1).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function expandPadLandmarkPulseEnvelope(nowMs: number): number {
  const period = EXPAND_PAD_LANDMARK_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Lip / haze emissive intensity for the expand-pad landmark (PL163.1).
 *
 * @param pulseEnvelope - 0..1 from `expandPadLandmarkPulseEnvelope`.
 * @returns Emissive intensity for lip / haze.
 */
export function expandPadLandmarkEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = EXPAND_PAD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft haze opacity under the expand pad (PL163.1).
 *
 * @param pulseEnvelope - 0..1 from `expandPadLandmarkPulseEnvelope`.
 * @returns Opacity for the landmark haze disc.
 */
export function expandPadLandmarkHazeOpacity(pulseEnvelope: number): number {
  const { hazeOpacityBase, hazeOpacityPeak } = EXPAND_PAD_LANDMARK_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between expand-pad landmark and short-afford amber (PL163.1).
 *
 * @returns Soft distinct field-gold so continuous landmark ≠ short pulse alone.
 */
export function expandPadLandmarkVsShortAffordContrast(): number {
  return cssHexRgbDistance(
    EXPAND_PAD_LANDMARK_CUE.emissive,
    EXPAND_PAD_SHORT_AFFORD_PULSE.emissive,
  );
}

/**
 * RGB distance between expand-pad landmark and expand-field flash gold (PL163.1).
 *
 * @returns Soft distinct field-gold so continuous landmark ≠ one-shot flash.
 */
export function expandPadLandmarkVsFieldFlashContrast(): number {
  return cssHexRgbDistance(
    EXPAND_PAD_LANDMARK_CUE.emissive,
    EXPAND_FIELD_PAD_FLASH.emissiveColor,
  );
}

/**
 * RGB distance between expand-pad landmark and affordable green (PL163.1).
 *
 * @returns Soft distinct field-gold so continuous landmark ≠ afford tint.
 */
export function expandPadLandmarkVsAffordableContrast(): number {
  return cssHexRgbDistance(
    EXPAND_PAD_LANDMARK_CUE.emissive,
    EXPAND_PAD_AFFORD_CUE.affordableEmissive,
  );
}

/**
 * Quiet cool pulsing footing mist over existing expand pads on player land (PL196.2) —
 * complements expand flash PL137.2 + unlock cues + warm field-gold landmark PL163.1.
 * Expand costs SoT unchanged; mute ok. Continuous leftover (not afford-gated).
 * Distinct wider/slower/quieter cool footing mist — warm landmark stays the
 * identity rim; cool mist reads as pad footing atmosphere (not a second gold disc).
 */
export const EXPAND_PAD_ATMOSPHERE_CUE = {
  /** Quiet cool footing slate — ≠ landmark #b8a048 / short amber / flash gold / affordable green. */
  emissive: "#3a5858",
  intensityBase: 0.03,
  intensityPeak: 0.09,
  hazeColor: "#182828",
  hazeOpacityBase: 0.035,
  hazeOpacityPeak: 0.1,
  /** Wider than landmark disc (1.18) so leftover mist reads as footing-zone atmosphere. */
  hazeRadius: 1.52,
  /** Above landmark haze (y≈0.012) so cool footing mist stacks quietly. */
  hazeY: 0.028,
  /** Slower than landmark (3200) / short pulse (1400) so continuous mist stays glanceable. */
  pulsePeriodMs: 4500,
} as const;

export interface ExpandPadAtmosphereCueVisual {
  show: boolean;
  emissive: string;
  intensity: number;
  hazeColor: string;
  hazeOpacity: number;
  hazeRadius: number;
  hazeY: number;
}

/**
 * Soft expand-pad atmosphere leftover fields (PL196.2).
 * Always-on while expand pad is mounted on player_land — not afford-gated.
 *
 * @param landKind - Active map; cue only on player_land.
 * @param padVisible - True when ExpandPadMesh is shown.
 * @returns Cool footing mist fields; `show` false off player land or when hidden.
 */
export function expandPadAtmosphereCue(
  landKind?: string | null,
  padVisible = true,
): ExpandPadAtmosphereCueVisual {
  const c = EXPAND_PAD_ATMOSPHERE_CUE;
  if (!padVisible || !landKind || !isPlayerLandKind(String(landKind))) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeRadius: c.hazeRadius,
      hazeY: c.hazeY,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeRadius: c.hazeRadius,
    hazeY: c.hazeY,
  };
}
