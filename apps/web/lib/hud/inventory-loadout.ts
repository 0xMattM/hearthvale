/**
 * Inventory pane tabs + equipped work/combat loadout rows.
 * Equip rules stay server-side; this only reads current stacks.
 */

export const INVENTORY_PANE_TABS = ["bag", "loadout"] as const;

export type InventoryPaneTab = (typeof INVENTORY_PANE_TABS)[number];

/** Chip labels on the inventory desk. */
export const INVENTORY_PANE_LABELS: Record<InventoryPaneTab, string> = {
  bag: "Bag",
  loadout: "Loadout",
};

export type InventoryLoadoutSlotId = "work" | "weapon" | "armor" | "shield";

/** Human labels for loadout paper-doll slots. */
export const INVENTORY_LOADOUT_SLOT_LABELS: Record<
  InventoryLoadoutSlotId,
  string
> = {
  work: "Work tool",
  weapon: "Weapon",
  armor: "Armor",
  shield: "Shield",
};

/** Work stays off the combat doll. */
export const INVENTORY_LOADOUT_GROUPS = {
  work: ["work"],
  combat: ["weapon", "armor", "shield"],
} as const;

export interface InventoryLoadoutStack {
  id: string;
  itemId: string;
  qty: number;
  durability?: number | null;
}

export interface InventoryLoadoutInput {
  inventory: readonly InventoryLoadoutStack[] | null | undefined;
  equippedToolInventoryId?: string | null;
  equippedWeaponInventoryId?: string | null;
  equippedArmorInventoryId?: string | null;
  equippedShieldInventoryId?: string | null;
}

export interface InventoryLoadoutRow {
  slot: InventoryLoadoutSlotId;
  group: "work" | "combat";
  label: string;
  stack: InventoryLoadoutStack | null;
}

/**
 * True when value is a known inventory pane tab.
 *
 * @param value - Raw tab id.
 */
export function isInventoryPaneTab(value: string): value is InventoryPaneTab {
  return (INVENTORY_PANE_TABS as readonly string[]).includes(value);
}

/**
 * Finds the equipped stack for an inventory id.
 *
 * @param inventory - Current bag stacks.
 * @param equippedId - Equipped stack id, or null when empty.
 * @returns Matching stack, or null when missing.
 */
export function inventoryFindEquippedStack(
  inventory: readonly InventoryLoadoutStack[] | null | undefined,
  equippedId: string | null | undefined,
): InventoryLoadoutStack | null {
  if (!Array.isArray(inventory) || typeof equippedId !== "string") return null;
  if (!equippedId) return null;
  return inventory.find((stack) => stack.id === equippedId) ?? null;
}

/**
 * Builds work + combat loadout rows from equipped ids.
 *
 * @param input - Bag stacks and equipped ids.
 * @returns Four rows: work tool, weapon, armor, shield.
 */
export function inventoryLoadoutRows(
  input: InventoryLoadoutInput,
): InventoryLoadoutRow[] {
  const src = input ?? { inventory: [] };
  const inv = src.inventory;
  return [
    {
      slot: "work",
      group: "work",
      label: INVENTORY_LOADOUT_SLOT_LABELS.work,
      stack: inventoryFindEquippedStack(inv, src.equippedToolInventoryId),
    },
    {
      slot: "weapon",
      group: "combat",
      label: INVENTORY_LOADOUT_SLOT_LABELS.weapon,
      stack: inventoryFindEquippedStack(inv, src.equippedWeaponInventoryId),
    },
    {
      slot: "armor",
      group: "combat",
      label: INVENTORY_LOADOUT_SLOT_LABELS.armor,
      stack: inventoryFindEquippedStack(inv, src.equippedArmorInventoryId),
    },
    {
      slot: "shield",
      group: "combat",
      label: INVENTORY_LOADOUT_SLOT_LABELS.shield,
      stack: inventoryFindEquippedStack(inv, src.equippedShieldInventoryId),
    },
  ];
}
