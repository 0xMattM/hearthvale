import {
  ACTION_ERROR,
  ITEMS,
  combatGearSlot,
  isCombatGearItemId,
  weaponStyleFor,
  type CombatEquipSlot,
  type ItemId,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { inventory, players } from "../../db/schema.js";
import type { ActionResult } from "./farming.js";

/**
 * Clears any equip column that points at this inventory row.
 *
 * @param playerId - Player row id.
 * @param inventoryId - Inventory stack id.
 */
export function clearEquipIfMatches(
  playerId: string,
  inventoryId: string | null | undefined,
): void {
  if (!inventoryId) return;
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player) return;
  const patch: Partial<{
    equippedToolInventoryId: string | null;
    equippedWeaponInventoryId: string | null;
    equippedArmorInventoryId: string | null;
    equippedShieldInventoryId: string | null;
  }> = {};
  if (player.equippedToolInventoryId === inventoryId) {
    patch.equippedToolInventoryId = null;
  }
  if (player.equippedWeaponInventoryId === inventoryId) {
    patch.equippedWeaponInventoryId = null;
  }
  if (player.equippedArmorInventoryId === inventoryId) {
    patch.equippedArmorInventoryId = null;
  }
  if (player.equippedShieldInventoryId === inventoryId) {
    patch.equippedShieldInventoryId = null;
  }
  if (Object.keys(patch).length === 0) return;
  db.update(players).set(patch).where(eq(players.id, playerId)).run();
}

/**
 * Wears one durability on an equipped stack; clears the slot if broken.
 *
 * @param playerId - Player row id.
 * @param inventoryId - Equipped stack id.
 */
export function wearEquippedStack(
  playerId: string,
  inventoryId: string | null,
): void {
  if (!inventoryId) return;
  const tool = db.select().from(inventory).where(eq(inventory.id, inventoryId)).get();
  if (!tool || tool.durability == null) return;
  const next = tool.durability - 1;
  if (next <= 0) {
    db.delete(inventory).where(eq(inventory.id, tool.id)).run();
    clearEquipIfMatches(playerId, tool.id);
    return;
  }
  db.update(inventory)
    .set({ durability: next })
    .where(eq(inventory.id, tool.id))
    .run();
}

function itemIdForEquip(
  playerId: string,
  inventoryId: string | null | undefined,
): string | null {
  if (!inventoryId) return null;
  const row = db.select().from(inventory).where(eq(inventory.id, inventoryId)).get();
  if (!row || row.playerId !== playerId) return null;
  return row.itemId;
}

/**
 * Loadout item ids currently worn by the player.
 *
 * @param player - Player row with equip columns.
 */
export function equippedLoadoutItemIds(player: {
  id: string;
  equippedToolInventoryId: string | null;
  equippedWeaponInventoryId?: string | null;
  equippedArmorInventoryId?: string | null;
  equippedShieldInventoryId?: string | null;
}): {
  toolItemId: string | null;
  weaponItemId: string | null;
  armorItemId: string | null;
  shieldItemId: string | null;
} {
  return {
    toolItemId: itemIdForEquip(player.id, player.equippedToolInventoryId),
    weaponItemId: itemIdForEquip(
      player.id,
      player.equippedWeaponInventoryId ?? null,
    ),
    armorItemId: itemIdForEquip(
      player.id,
      player.equippedArmorInventoryId ?? null,
    ),
    shieldItemId: itemIdForEquip(
      player.id,
      player.equippedShieldInventoryId ?? null,
    ),
  };
}

function slotColumn(
  slot: CombatEquipSlot,
):
  | "equippedWeaponInventoryId"
  | "equippedArmorInventoryId"
  | "equippedShieldInventoryId" {
  if (slot === "weapon") return "equippedWeaponInventoryId";
  if (slot === "armor") return "equippedArmorInventoryId";
  return "equippedShieldInventoryId";
}

/**
 * Equips or unequips a combat gear stack (weapon / armor / shield).
 * Bows are two-handed: equipping a bow clears the shield, and vice versa.
 *
 * @param userId - Auth user id.
 * @param inventoryId - Stack to equip, or null to unequip `slot`.
 * @param slot - Required when unequipping (inventoryId is null).
 */
export function equipCombatGear(
  userId: string,
  inventoryId: string | null,
  slot?: CombatEquipSlot | string | null,
): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };

  if (!inventoryId) {
    const unequipSlot = slot as CombatEquipSlot | undefined;
    if (
      unequipSlot !== "weapon" &&
      unequipSlot !== "armor" &&
      unequipSlot !== "shield"
    ) {
      return { ok: false, error: ACTION_ERROR.notCombatGear };
    }
    db.update(players)
      .set({ [slotColumn(unequipSlot)]: null })
      .where(eq(players.id, player.id))
      .run();
    return { ok: true };
  }

  const item = db
    .select()
    .from(inventory)
    .where(eq(inventory.id, inventoryId))
    .get();
  if (!item || item.playerId !== player.id) {
    return { ok: false, error: ACTION_ERROR.itemMissing };
  }
  if (!isCombatGearItemId(item.itemId)) {
    return { ok: false, error: ACTION_ERROR.notCombatGear };
  }
  const gearSlot = combatGearSlot(item.itemId);
  if (!gearSlot) return { ok: false, error: ACTION_ERROR.notCombatGear };

  const patch: Partial<{
    equippedWeaponInventoryId: string | null;
    equippedArmorInventoryId: string | null;
    equippedShieldInventoryId: string | null;
  }> = {
    [slotColumn(gearSlot)]: item.id,
  };

  if (gearSlot === "weapon" && weaponStyleFor(item.itemId) === "ranged") {
    patch.equippedShieldInventoryId = null;
  }
  if (gearSlot === "shield") {
    const weaponItemId = itemIdForEquip(
      player.id,
      player.equippedWeaponInventoryId ?? null,
    );
    if (weaponStyleFor(weaponItemId) === "ranged") {
      patch.equippedWeaponInventoryId = null;
    }
  }

  db.update(players).set(patch).where(eq(players.id, player.id)).run();
  return { ok: true };
}

/**
 * True when the item definition is a gather tool (hoe / hammer).
 *
 * @param itemId - Catalog item id.
 */
export function isGatherToolItemId(itemId: string): boolean {
  return ITEMS[itemId as ItemId]?.equipSlot === "tool";
}
