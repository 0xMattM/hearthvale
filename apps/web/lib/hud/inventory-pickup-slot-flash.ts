/**
 * Inventory pickup soft slot flash (PL128.2).
 * Brief slot/border flash when a stack qty rises or a new stack appears
 * after gather/craft/buy (and other bag-inflow paths) — complements success SFX.
 * Inventory capacity rules unchanged; mute ok; min HUD.
 */

/** Minimal stack shape for qty / identity compare (PL128.2). */
export interface InventoryPickupStackSnap {
  id: string;
  qty: number;
}

/**
 * Soft pickup-slot chrome for inventory rows that just gained qty (PL128.2).
 * Cool mint-olive kinship with bag accent — not a second Got toast.
 */
export const INVENTORY_PICKUP_SLOT_FLASH = {
  /** How long the pickup slot flash stays on. */
  durationMs: 500,
  /** CSS class applied to rising / new inventory rows. */
  slotClassName: "inventory-panel__slot--pickup-flash",
  borderRgba: "rgba(120, 168, 96, 0.55)",
  backgroundRgba: "rgba(48, 72, 40, 0.55)",
} as const;

/**
 * Stack ids whose qty rose or that newly appeared (PL128.2).
 * Decreases / flat / durability-only stay quiet.
 *
 * @param previous - Inventory before the action (null skips — e.g. first hydrate).
 * @param next - Inventory after the action.
 * @returns Stack ids that should briefly flash.
 */
export function inventoryPickupFlashStackIds(
  previous: InventoryPickupStackSnap[] | null | undefined,
  next: InventoryPickupStackSnap[] | null | undefined,
): string[] {
  if (!next?.length || previous == null) return [];
  const prevById = new Map(previous.map((stack) => [stack.id, stack.qty]));
  const risen: string[] = [];
  for (const stack of next) {
    if (!Number.isFinite(stack.qty) || stack.qty < 0) continue;
    const prevQty = prevById.get(stack.id);
    if (prevQty === undefined) {
      risen.push(stack.id);
      continue;
    }
    if (!Number.isFinite(prevQty)) continue;
    if (stack.qty > prevQty) risen.push(stack.id);
  }
  return risen;
}

/**
 * Whether pickup slot flash should run (PL128.2).
 * True only on ok with at least one risen / new stack.
 *
 * @param ok - Whether the action succeeded.
 * @param flashStackIds - Ids from {@link inventoryPickupFlashStackIds}.
 * @returns True when slots should briefly flash.
 */
export function shouldFlashInventoryPickupSlots(
  ok: boolean,
  flashStackIds: readonly string[],
): boolean {
  return ok === true && flashStackIds.length > 0;
}

/**
 * CSS class for an inventory slot given active pickup flash ids (PL128.2).
 *
 * @param stackId - Inventory stack id for the row.
 * @param flashStackIds - Active pickup-flash stack ids.
 * @returns Pickup flash class, or empty string when not flashing.
 */
export function inventoryPickupSlotFlashClassName(
  stackId: string,
  flashStackIds: ReadonlySet<string> | readonly string[],
): string {
  const ids = Array.from(flashStackIds);
  const active = ids.includes(stackId);
  return active ? INVENTORY_PICKUP_SLOT_FLASH.slotClassName : "";
}
