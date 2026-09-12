/**
 * MVP content locked in docs/19_development_plan/MVPContentLock.md
 * Do not invent demo values here — change the Content Lock first.
 *
 * RF6 catalog module map (public API still via `@game/shared` → `catalog`):
 * - `catalog-items.ts` — ItemId / ITEMS / TOOL_HUNT_DAMAGE
 * - `catalog-combat-gear.ts` — weapons / armor / shields / live-fight constants
 * - `catalog-recipes.ts` — ENERGY / CROPS / RECIPES / professions
 * - `catalog-buildings.ts` — barrel for land / stations / layouts / map identity
 * - `catalog-cues.ts` — barrel for visual cue parts (`catalog-cues-01`…`30`)
 * - `visual-cue-math.ts` — shared pulse/flash envelopes (RF5)
 *
 * This file is the stable re-export surface; prefer importing from `@game/shared`.
 */

export {
  ITEMS,
  TOOL_HUNT_DAMAGE,
  type ItemDefinition,
  type ItemId,
} from "./catalog-items.js";

export * from "./catalog-combat-gear.js";

export {
  CRAFT_MS,
  CROPS,
  ENERGY,
  RECIPES,
  recipeCraftMs,
  type CropDefinition,
  type ProfessionId,
  type RecipeDefinition,
  type StationId,
} from "./catalog-recipes.js";

export * from "./catalog-buildings.js";

export const SOFT_CURRENCY = {
  id: "coins",
  name: "Coins",
} as const;

export * from "./catalog-cues.js";
