/**
 * TopBar declutter helpers (PL2.2) — keep identity / energy / coins loud;
 * demote day-phase + nearby until non-default; visiting stays obvious.
 * PL9.1 — soft low-energy meter style (min HUD, not a toast).
 * PL14.1 — quiet current-map chip (single status; not a dashboard column).
 * PL21.1 — equipped tool low-durability accent reuses ENERGY_LOW_TEXT_COLOR.
 * PL40.2 — brief map-chip pulse on successful free travel arrive.
 * PL67.1 — low-health HP readout accent (warm; clears when recovered).
 * PL114.2 — brief map-chip pulse when leaving a visit back home.
 * PL185.2 — quiet periodic map-chip breath while walking with no panel open.
 * PL188.2 — quiet periodic energy-meter breath while walking healthy (no panel).
 * PL198.1 — quiet periodic HP readout breath while walking healthy (no panel).
 */

import {
  currentMapChipLabel,
  mapIdentityForLandKind,
} from "@game/shared";

/**
 * Quiet map-chip presentation for TopBar (PL14.1).
 *
 * @param landKind - Active map kind (updates on travel).
 * @returns Glyph, short word, and accent for a single status chip.
 */
export function formatCurrentMapChip(landKind: string | null | undefined): {
  glyph: string;
  word: string;
  accent: string;
  label: string;
} {
  const id = mapIdentityForLandKind(landKind);
  return {
    glyph: id.glyph,
    word: id.word,
    accent: id.accent,
    label: currentMapChipLabel(landKind),
  };
}

/** How long the TopBar map-chip arrive pulse stays on (PL40.2). */
export const MAP_CHIP_ARRIVE_PULSE_MS = 450;

/**
 * Quiet periodic TopBar map-chip breath while walking (PL185.2).
 * Complements arrive pulse PL40.2 + travel open accent PL144.2; destinations /
 * fares unchanged; min HUD; mute ok. Clears while any contextual panel is open.
 */
export const MAP_CHIP_IDLE_GLANCE = {
  /** CSS class for the soft periodic breath (not arrive one-shot). */
  className: "topbar-map-chip--idle-glance",
  /** Soft breath period — slower than arrive 450ms flash. */
  periodMs: 4800,
} as const;

/**
 * Whether successful free travel should pulse the current-map chip (PL40.2).
 * True only on ok arrive; refuse / already-here / failed travel stay quiet.
 * Destinations and fare-free rules unchanged — visual confirm only.
 *
 * @param ok - Whether the travel API / apply succeeded.
 * @returns True when the map chip should briefly pulse.
 */
export function shouldPulseMapChipOnTravelArrive(ok: boolean): boolean {
  return ok === true;
}

/**
 * Whether the TopBar map-chip idle breath should play (PL185.2).
 * True while walking with no contextual panel open; arrive pulse may still
 * override visually. Destinations / fares / min HUD unchanged.
 *
 * @param panelOpen - True when any contextual panel is open.
 * @returns True when the quiet idle glance breath should apply.
 */
export function shouldShowMapChipIdleGlance(panelOpen: boolean): boolean {
  return panelOpen !== true;
}

/**
 * Quiet periodic TopBar energy-meter breath while walking healthy (PL188.2).
 * Complements low-energy warn PL9.1 + vignette; regen rules unchanged; min HUD;
 * mute ok. Clears while any contextual panel is open or while energy is in the
 * low band (warn wins).
 */
export const ENERGY_METER_IDLE_GLANCE = {
  /** CSS class for the soft periodic breath (not low-energy warn). */
  className: "topbar-energy-meter--idle-glance",
  /** Soft breath period — slower than map-chip idle so meters don't sync. */
  periodMs: 5600,
} as const;

/**
 * Whether the TopBar energy-meter idle breath should play (PL188.2).
 * True while walking healthy with no contextual panel open; low-energy warn
 * stays louder. Regen / min HUD unchanged.
 *
 * @param panelOpen - True when any contextual panel is open.
 * @param energyLow - True when energy is in the soft low-warn band.
 * @returns True when the quiet idle glance breath should apply.
 */
export function shouldShowEnergyMeterIdleGlance(
  panelOpen: boolean,
  energyLow: boolean,
): boolean {
  if (panelOpen === true) return false;
  if (energyLow === true) return false;
  return true;
}

/**
 * Quiet periodic TopBar HP readout breath while walking healthy (PL198.1).
 * Complements low-health warn PL67.1 + vignette PL126.1; combat / heal rules
 * unchanged; min HUD; mute ok. Clears while any contextual panel is open or
 * while health is in the low band (warn wins). Kinship with energy-meter idle
 * PL188.2 — periods desynced so meters don't sync.
 */
export const HEALTH_METER_IDLE_GLANCE = {
  /** CSS class for the soft periodic breath (not low-health warn). */
  className: "topbar-health-meter--idle-glance",
  /** Soft breath period — slower than energy idle so meters don't sync. */
  periodMs: 6400,
} as const;

/**
 * Whether the TopBar HP idle breath should play (PL198.1).
 * True while walking healthy with no contextual panel open; low-health warn
 * stays louder. Heal / combat / min HUD unchanged.
 *
 * @param panelOpen - True when any contextual panel is open.
 * @param healthLow - True when health is in the soft low-warn band.
 * @returns True when the quiet idle glance breath should apply.
 */
export function shouldShowHealthMeterIdleGlance(
  panelOpen: boolean,
  healthLow: boolean,
): boolean {
  if (panelOpen === true) return false;
  if (healthLow === true) return false;
  return true;
}

/**
 * Whether leaving a visit should pulse the Land map chip (PL114.2).
 * Complements PL27.1 `Home` ephemeral + soft `Your land` tip; visit rules unchanged.
 *
 * @param wasVisiting - True when actually leaving a visit (not own-land idle).
 * @returns True when the map chip should briefly pulse on return home.
 */
export function shouldPulseMapChipOnVisitHomeReturn(wasVisiting: boolean): boolean {
  return wasVisiting === true;
}


/** Default cosmetic phase label — quiet while walking under midday. */
export const DEFAULT_DAY_PHASE_LABEL = "Day";

/** Healthy energy fill (default TopBar meter). */
export const ENERGY_OK_BAR_GRADIENT = "linear-gradient(90deg,#6fbf73,#c4a35a)";

/** Healthy HP fill (walking vitals). */
export const HEALTH_OK_BAR_GRADIENT = "linear-gradient(90deg,#c45a62,#d9776f)";

/** Soft low-energy fill — warm warning, not a harsh toast stack. */
export const ENERGY_LOW_BAR_GRADIENT = "linear-gradient(90deg,#d9a05a,#d9776f)";

/**
 * CSS color for the energy readout when low (PL9.1).
 * Soft amber-danger mix; recovered state uses muted default.
 */
export const ENERGY_LOW_TEXT_COLOR = "color-mix(in srgb, var(--danger) 70%, var(--accent))";

/**
 * CSS color for the HP readout when low (PL67.1).
 * Same warm family as energy/tool low; clears when recovered above COMBAT.lowWarnPct.
 */
export const HEALTH_LOW_TEXT_COLOR = ENERGY_LOW_TEXT_COLOR;

/**
 * Whether day-phase belongs in walking chrome.
 * Hidden for the default "Day" label; shown for Dawn / Dusk / Night.
 *
 * @param label - Cosmetic phase label from dayNightPalette (or "Day" when cycle off).
 * @returns True when the phase should appear in the quiet secondary line.
 */
export function shouldShowDayPhaseInHud(
  label: string | null | undefined,
): boolean {
  if (!label) return false;
  const trimmed = label.trim();
  if (!trimmed) return false;
  return trimmed.toLowerCase() !== DEFAULT_DAY_PHASE_LABEL.toLowerCase();
}

/**
 * Whether nearby presence belongs in walking chrome.
 * Default (0) stays hidden; any peers demote to the quiet secondary line.
 *
 * @param nearbyCount - Other players on the same map.
 * @returns True when a nearby count should be shown (demoted, not primary).
 */
export function shouldShowNearbyInHud(nearbyCount: number): boolean {
  return Number.isFinite(nearbyCount) && nearbyCount > 0;
}

/**
 * Builds the quiet secondary chrome line (day phase / nearby only).
 * Empty when both are at defaults — primary energy line stays clean.
 *
 * @param nearbyCount - Other players nearby.
 * @param dayPhaseLabel - Cosmetic sky phase label.
 * @returns Secondary line text or null when nothing to demote-show.
 */
export function formatQuietHudExtras(
  nearbyCount: number,
  dayPhaseLabel: string | null | undefined,
): string | null {
  const bits: string[] = [];
  if (shouldShowNearbyInHud(nearbyCount)) {
    bits.push(`nearby ${nearbyCount}`);
  }
  if (shouldShowDayPhaseInHud(dayPhaseLabel)) {
    bits.push(String(dayPhaseLabel).trim());
  }
  if (bits.length === 0) return null;
  return bits.join(" · ");
}
