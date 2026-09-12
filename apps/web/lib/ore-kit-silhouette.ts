/**
 * Ore rock kit silhouette — boulder in the grass, not a podium disc.
 */

export const ORE_KIT_SILHOUETTE = {
  hasCircularUnderstone: false,
  groundContact: "rubble",
} as const;

/**
 * True when the ore kit still draws the circular understone cylinder.
 */
export function oreKitHasCircularUnderstone(): boolean {
  return ORE_KIT_SILHOUETTE.hasCircularUnderstone;
}
