/**
 * World Html vs HUD stacking (Drei default zIndexRange is ~16M and covers panels).
 * Keep world nameplates below `.hud-panel-slot` / `.hud-panel-dim`.
 */

/** HUD panels + TopBar overlay (see `.hud-panel-slot`). */
export const HUD_OVERLAY_Z_INDEX = 5;

/** Soft dim while a contextual panel is open (see `.hud-panel-dim`). */
export const HUD_PANEL_DIM_Z_INDEX = 4;

/**
 * Drei `<Html>` distance mapping `[near, far]`.
 * Must stay strictly below the HUD overlay so Vendor / Tutor tags cannot cover menus.
 */
export const WORLD_LABEL_Z_INDEX_RANGE = [2, 0] as const;

/** Land-scene wrapper class — traps Drei Html inside a z-index 0 stacking context. */
export const LAND_SCENE_STACK_CLASS = "land-scene";

/**
 * Whether a Drei Html zIndexRange stays under the HUD overlay.
 *
 * @param range - `[near, far]` like Drei `zIndexRange`.
 * @param hudZ - Overlay z-index (panels).
 * @returns True when both ends of the range are below `hudZ`.
 */
export function worldLabelsStayBelowHud(
  range: readonly [number, number] = WORLD_LABEL_Z_INDEX_RANGE,
  hudZ: number = HUD_OVERLAY_Z_INDEX,
): boolean {
  return Math.max(range[0], range[1]) < hudZ;
}
