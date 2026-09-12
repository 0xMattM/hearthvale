/**
 * Tool-low soft world leftover (PL132.2).
 * Quiet edge tint while equipped tool stays in the low-durability band
 * (complements TopBar PL61.1 + inventory accent PL21.1; not a HUD column).
 * Durability / break rules unchanged; clears when repaired/replaced; mute ok.
 */

import { ITEMS, isToolDurabilityLow, type PlayerStateDto } from "@game/shared";

/**
 * Quiet cool steel edge vignette while equipped tool is low (PL132.2).
 * Cool slate kinship with tool chrome — distinct from energy amber / HP crimson.
 */
export const TOOL_LOW_WORLD_VIGNETTE = {
  /** Peak CSS opacity while low (clears when repaired/replaced). */
  opacity: 0.82,
  /** Clear center so gameplay stays readable. */
  clearPct: 54,
  midPct: 78,
  midRgba: "rgba(36, 44, 58, 0.2)",
  outerRgba: "rgba(28, 36, 52, 0.46)",
} as const;

/**
 * Whether the tool-low world vignette should render (PL132.2).
 * Uses TOOL.lowWarnPct via `isToolDurabilityLow` on the equipped stack.
 * Quiet with no tool / non-tool / recovered durability.
 *
 * @param state - Player state (equipped tool id + inventory).
 * @returns True when the soft edge tint should show.
 */
export function shouldShowToolLowWorldVignette(
  state: Pick<PlayerStateDto, "equippedToolInventoryId" | "inventory">,
): boolean {
  const id = state.equippedToolInventoryId;
  if (!id) return false;
  const tool = state.inventory.find((i) => i.id === id);
  if (!tool) return false;
  const def = ITEMS[tool.itemId as keyof typeof ITEMS];
  return isToolDurabilityLow(tool.durability, def?.maxDurability);
}

/**
 * CSS `background` radial gradient for the tool-low edge vignette (PL132.2).
 *
 * @returns Radial-gradient string for the overlay.
 */
export function toolLowWorldVignetteBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = TOOL_LOW_WORLD_VIGNETTE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
