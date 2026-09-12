/**
 * Walking HUD chrome — icon-first vitals, compact glance chips, quiet hotkeys.
 * Panel copy and claim rules stay elsewhere; this only shapes always-on chrome.
 */

/** Everyday walking keys — full list lives in Settings (H). */
export const MINIMAL_WALKING_HOTKEYS: ReadonlyArray<{
  key: string;
  title: string;
}> = [
  { key: "E", title: "Interact" },
  { key: "I", title: "Inventory" },
  { key: "N", title: "Travel" },
  { key: "Q", title: "Quests" },
  { key: "H", title: "Help" },
];

/** Compact glance chip parsed from `Q · Quest · 2` labels. */
export interface CompactHudGlanceParts {
  /** Hotkey letter, or a short mark when the label has no key. */
  mark: string;
  /** Optional count when more than one pending item. */
  count: string | null;
}

/**
 * Strips glance labels down to a key mark + optional count.
 *
 * @param label - Closed-glance string such as `Q · Quest` or `Q · Quest · 2`.
 * @returns Mark and count for a compact chip.
 */
export function compactHudGlanceParts(label: string): CompactHudGlanceParts {
  const bits = label
    .split(" · ")
    .map((part) => part.trim())
    .filter(Boolean);
  if (bits.length === 0) return { mark: "", count: null };
  const last = bits[bits.length - 1] ?? "";
  const count = bits.length >= 2 && /^\d+$/.test(last) ? last : null;
  const head = bits[0] ?? "";
  const mark = head.length <= 2 ? head : "•";
  return { mark, count };
}

/**
 * Fill percent for a vitals meter, clamped 0–100.
 *
 * @param current - Current value.
 * @param max - Maximum value.
 * @returns Percent width for the meter fill.
 */
export function hudMeterPercent(current: number, max: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / max) * 100)));
}
