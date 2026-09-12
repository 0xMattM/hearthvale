/**
 * Inventory-pickup idle soft glance (PL198.2).
 * Quiet periodic TopBar I · Bag chip breath after recent bag inflow while
 * Inventory closed — complements slot flash PL128.2 + open accent PL9.2; no
 * always-on inventory column. Inventory capacity rules unchanged; mute ok.
 * Clears when Inventory opens or linger window ends.
 */

/**
 * Soft closed-glance chip chrome after recent pickup (PL198.2).
 * Mint-olive kinship with pickup slot flash — not a permanent Inventory column.
 */
export const INVENTORY_PICKUP_IDLE_GLANCE = {
  /** Hotkey letter (KEYBINDS KeyI). */
  hotkey: "I",
  /** Quiet chip word — not an Inventory column. */
  word: "Bag",
  borderColor: "#78a860",
  textColor: "#a8d080",
  className: "topbar-inventory-pickup-glance",
  /**
   * Soft breath period — desynced from map / energy / health / interact idles.
   */
  periodMs: 7200,
  /** How long the closed glance stays after pickup (longer than slot flash). */
  lingerMs: 10_000,
} as const;

/**
 * Whether a successful pickup should arm the closed idle glance (PL198.2).
 * Same gate as slot flash — risen / new stacks only.
 *
 * @param ok - Whether the action succeeded.
 * @param flashStackIds - Ids from inventoryPickupFlashStackIds.
 * @returns True when the quiet I · Bag glance should arm.
 */
export function shouldArmInventoryPickupIdleGlance(
  ok: boolean,
  flashStackIds: readonly string[],
): boolean {
  return ok === true && flashStackIds.length > 0;
}

/**
 * Whether the inventory-pickup idle glance chip should render (PL198.2).
 * True while recent pickup linger is active and Inventory panel is closed.
 *
 * @param recentPickupActive - True while linger window after pickup is armed.
 * @param inventoryPanelOpen - True when Inventory is the open contextual panel.
 * @returns True when the quiet TopBar I · Bag chip should show.
 */
export function shouldShowInventoryPickupIdleGlance(
  recentPickupActive: boolean,
  inventoryPanelOpen: boolean,
): boolean {
  if (inventoryPanelOpen === true) return false;
  return recentPickupActive === true;
}

/**
 * Compact chip label for pickup idle glance (PL198.2).
 * Always `I · Bag` — count stays in the bag, not a column.
 *
 * @returns Chip text.
 */
export function inventoryPickupIdleGlanceLabel(): string {
  const { hotkey, word } = INVENTORY_PICKUP_IDLE_GLANCE;
  return `${hotkey} · ${word}`;
}
