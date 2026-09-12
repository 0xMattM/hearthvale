import {
  ACTION_ERROR,
  ITEMS,
  canRepairTool,
  toolRepairMatCost,
  type ItemId,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { inventory, players } from "../../db/schema.js";
import { removeItem } from "../player.js";
import type { ActionResult } from "./farming.js";

/**
 * Restores a worn tool to max durability, consuming TOOL.repairMats (PL25.1).
 * Fail paths stay silent / refuse — no durability retune.
 *
 * @param userId - Auth user id.
 * @param inventoryId - Tool stack id in the player's inventory.
 * @returns Action result; ok when durability restored.
 */
export function repairTool(
  userId: string,
  inventoryId: string,
): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };

  const row = db
    .select()
    .from(inventory)
    .where(eq(inventory.id, inventoryId))
    .get();
  if (!row || row.playerId !== player.id) {
    return { ok: false, error: ACTION_ERROR.itemMissing };
  }

  const def = ITEMS[row.itemId as ItemId];
  if (!def?.equipSlot || def.maxDurability == null) {
    return { ok: false, error: ACTION_ERROR.notATool };
  }

  if (!canRepairTool(row.durability, def.maxDurability)) {
    return { ok: false, error: ACTION_ERROR.toolAlreadyRepaired };
  }

  const mat = toolRepairMatCost(row.itemId);
  if (!mat) {
    return { ok: false, error: ACTION_ERROR.notATool };
  }

  const matDef = ITEMS[mat.itemId];
  if (!removeItem(player.id, mat.itemId, mat.qty)) {
    return {
      ok: false,
      error: ACTION_ERROR.needMatsRepair(mat.qty, matDef?.name ?? mat.itemId),
    };
  }

  db.update(inventory)
    .set({ durability: def.maxDurability })
    .where(eq(inventory.id, row.id))
    .run();

  return { ok: true };
}
