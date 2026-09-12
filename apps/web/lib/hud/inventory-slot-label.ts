/**
 * Short names painted on bag slots so items read without a hover tooltip.
 */

/**
 * Visible name for an inventory slot.
 * Falls back to the catalog id with underscores as spaces.
 *
 * @param name - Catalog display name when known.
 * @param itemId - Catalog item id.
 * @returns Trimmed label; `"Item"` when both inputs are blank.
 */
export function inventorySlotLabel(
  name: string | undefined,
  itemId: string,
): string {
  if (typeof name === "string" && name.trim()) return name.trim();
  if (typeof itemId === "string" && itemId.trim()) {
    return itemId.trim().replace(/_/g, " ");
  }
  return "Item";
}

/**
 * Bag pip for an equipped stack — work tools vs combat gear.
 *
 * @param kind - Equipped role.
 * @returns Short pip copy.
 */
export function inventoryEquippedPip(
  kind: "tool" | "gear" | "other",
): string {
  if (kind === "tool") return "Work";
  if (kind === "gear") return "Fight";
  return "E";
}
