import {
  ACTION_ERROR,
  ANIMAL_PEN,
  type AnimalPenCare,
  FISHING_DOCK,
  ITEMS,
  focusedEnergyCost,
  getOreNode,
  isCityLandKind,
  WOOD_STUMP,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { buildings, inventory, players } from "../../db/schema.js";
import { getActiveLand } from "../land.js";
import { addItem, grantXp, removeItem, spendEnergy } from "../player.js";
import { requireNearGrid, type Pos } from "../proximity.js";
import { isCityStationContendedByOther } from "../stationContention.js";
import type { ActionResult } from "./farming.js";

function landOwnedByPlayer(userId: string) {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return null;
  const land = getActiveLand(player.id);
  if (!land) return null;
  return { player, land };
}

/**
 * Chips ore from a land rock (requires equipped iron hammer).
 * Yield and cooldown follow the node's ore kind (iron / copper / gold).
 */
export function gatherOre(
  userId: string,
  buildingId: string,
  pos?: Pos,
): ActionResult {
  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const { player, land } = owned;

  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!building || building.type !== "ore_node") {
    return { ok: false, error: ACTION_ERROR.oreNodeMissing };
  }

  const near = requireNearGrid(pos, building.x, building.z);
  if (!near.ok) return near;

  // Reason: CL60.2 — scarce city ore contends via presence; land/Explore unlimited.
  if (
    isCityLandKind(land.kind) &&
    isCityStationContendedByOther(
      land.kind,
      land.id,
      building.x,
      building.z,
      userId,
    )
  ) {
    return { ok: false, error: ACTION_ERROR.stationBusy };
  }

  const ore = getOreNode(building.cropId);
  const now = Date.now();
  if (building.readyAt != null && now < building.readyAt) {
    return { ok: false, error: ACTION_ERROR.oreNodeCooldown };
  }

  const toolId = player.equippedToolInventoryId;
  const tool = toolId
    ? db.select().from(inventory).where(eq(inventory.id, toolId)).get()
    : null;
  if (!tool || tool.itemId !== ore.requiredTool) {
    // Reason: PL21.2 — name Iron Hammer clearly; broken/missing vs unequipped.
    const hasHammer = db
      .select()
      .from(inventory)
      .where(
        and(eq(inventory.playerId, player.id), eq(inventory.itemId, ore.requiredTool)),
      )
      .get();
    return {
      ok: false,
      error: hasHammer
        ? ACTION_ERROR.needHammer
        : ACTION_ERROR.needHammerBroken,
    };
  }

  const energyCost = focusedEnergyCost(
    ore.energyCost,
    "miner",
    player.farmerXp,
    player.blacksmithXp,
  );
  const energy = spendEnergy(player.id, energyCost);
  if (!energy.ok) return energy;

  addItem(player.id, ore.yieldItemId, ore.yieldQty);

  db.update(buildings)
    .set({ readyAt: now + ore.cooldownMs })
    .where(eq(buildings.id, building.id))
    .run();

  if (tool.durability != null) {
    const next = tool.durability - 1;
    if (next <= 0) {
      db.delete(inventory).where(eq(inventory.id, tool.id)).run();
      db.update(players)
        .set({ equippedToolInventoryId: null })
        .where(eq(players.id, player.id))
        .run();
    } else {
      db.update(inventory)
        .set({ durability: next })
        .where(eq(inventory.id, tool.id))
        .run();
    }
  }

  // Reason: CL18.2 — ore chip is Miner ladder; blacksmith XP stays on forge craft.
  grantXp(player.id, "miner", ore.xp);
  return { ok: true };
}

/**
 * Chops wood from the starter-land stump (F10.2 carpenter chain).
 */
export function gatherWood(
  userId: string,
  buildingId: string,
  pos?: Pos,
): ActionResult {
  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const { player, land } = owned;

  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!building || building.type !== "tree_stump") {
    return { ok: false, error: ACTION_ERROR.woodStumpMissing };
  }

  const near = requireNearGrid(pos, building.x, building.z);
  if (!near.ok) return near;

  // Reason: CL60.1 — scarce city tree contends via presence; land/Explore unlimited.
  if (
    isCityLandKind(land.kind) &&
    isCityStationContendedByOther(
      land.kind,
      land.id,
      building.x,
      building.z,
      userId,
    )
  ) {
    return { ok: false, error: ACTION_ERROR.stationBusy };
  }

  const now = Date.now();
  if (building.readyAt != null && now < building.readyAt) {
    return { ok: false, error: ACTION_ERROR.woodStumpCooldown };
  }

  const energyCost = focusedEnergyCost(
    WOOD_STUMP.energyCost,
    "forester",
    player.farmerXp,
    player.blacksmithXp,
  );
  const energy = spendEnergy(player.id, energyCost);
  if (!energy.ok) return energy;

  addItem(player.id, WOOD_STUMP.yieldItemId, WOOD_STUMP.yieldQty);

  db.update(buildings)
    .set({ readyAt: now + WOOD_STUMP.cooldownMs })
    .where(eq(buildings.id, building.id))
    .run();

  // Reason: CL18.1 — tree chop is Forester ladder; carpenter XP stays on saw/craft.
  grantXp(player.id, "forester", WOOD_STUMP.xp);
  return { ok: true };
}

/**
 * Catches fish at a fishing dock (CL19.1) — no rod; light cooldown gather.
 */
export function gatherFish(
  userId: string,
  buildingId: string,
  pos?: Pos,
): ActionResult {
  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const { player, land } = owned;

  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!building || building.type !== "fishing_dock") {
    return { ok: false, error: ACTION_ERROR.fishingDockMissing };
  }

  const near = requireNearGrid(pos, building.x, building.z);
  if (!near.ok) return near;

  // Reason: CL63.2 — scarce city fishing dock contends via presence; land unlimited.
  if (
    isCityLandKind(land.kind) &&
    isCityStationContendedByOther(
      land.kind,
      land.id,
      building.x,
      building.z,
      userId,
    )
  ) {
    return { ok: false, error: ACTION_ERROR.stationBusy };
  }

  const now = Date.now();
  if (building.readyAt != null && now < building.readyAt) {
    return { ok: false, error: ACTION_ERROR.fishingDockCooldown };
  }

  const energyCost = focusedEnergyCost(
    FISHING_DOCK.energyCost,
    "fisher",
    player.farmerXp,
    player.blacksmithXp,
  );
  const energy = spendEnergy(player.id, energyCost);
  if (!energy.ok) return energy;

  addItem(player.id, FISHING_DOCK.yieldItemId, FISHING_DOCK.yieldQty);

  db.update(buildings)
    .set({ readyAt: now + FISHING_DOCK.cooldownMs })
    .where(eq(buildings.id, building.id))
    .run();

  // Reason: CL23.1 — dock catch is Fisher ladder (XP was deferred in CL19).
  grantXp(player.id, "fisher", FISHING_DOCK.xp);
  return { ok: true };
}

/**
 * Counts how many of an item the player holds.
 *
 * @param playerId - Player row id.
 * @param itemId - Catalog item id.
 * @returns Total qty across stacks.
 */
function heldQty(playerId: string, itemId: string): number {
  return db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, playerId))
    .all()
    .filter((row) => row.itemId === itemId)
    .reduce((sum, row) => sum + row.qty, 0);
}

/**
 * Shared pen care gate (proximity + cooldown) before spending mats.
 *
 * @param userId - Auth user id.
 * @param buildingId - Animal pen building id.
 * @param pos - World position for proximity.
 * @returns Owned context + building, or an action error.
 */
function requireAnimalPenReady(
  userId: string,
  buildingId: string,
  pos?: Pos,
):
  | { ok: true; player: typeof players.$inferSelect; building: typeof buildings.$inferSelect }
  | { ok: false; error?: string } {
  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const { player, land } = owned;

  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!building || building.type !== "animal_pen") {
    return { ok: false, error: ACTION_ERROR.animalPenMissing };
  }

  const near = requireNearGrid(pos, building.x, building.z);
  if (!near.ok) return { ok: false, error: near.error };

  // Reason: PL170.2 — scarce city animal pen contends via presence; land unlimited.
  if (
    isCityLandKind(land.kind) &&
    isCityStationContendedByOther(
      land.kind,
      land.id,
      building.x,
      building.z,
      userId,
    )
  ) {
    return { ok: false, error: ACTION_ERROR.stationBusy };
  }

  const now = Date.now();
  if (building.readyAt != null && now < building.readyAt) {
    return { ok: false, error: ACTION_ERROR.animalPenCooldown };
  }

  return { ok: true, player, building };
}

/**
 * Spends a care mat, applies shared pen cooldown, grants Animal Breeder XP.
 *
 * @param player - Player row.
 * @param building - Animal pen row.
 * @param itemId - Mat to spend.
 * @param qty - Mat qty.
 * @returns Action result.
 */
function finishAnimalPenCare(
  player: typeof players.$inferSelect,
  building: typeof buildings.$inferSelect,
  itemId: (typeof ANIMAL_PEN)["feedItemId"] | (typeof ANIMAL_PEN)["cleanItemId"],
  qty: number,
): ActionResult {
  if (heldQty(player.id, itemId) < qty) {
    return {
      ok: false,
      error: ACTION_ERROR.missingItem(ITEMS[itemId].name),
    };
  }

  const energyCost = focusedEnergyCost(
    ANIMAL_PEN.energyCost,
    "animal_breeder",
    player.farmerXp,
    player.blacksmithXp,
  );
  const energy = spendEnergy(player.id, energyCost);
  if (!energy.ok) return energy;

  if (!removeItem(player.id, itemId, qty)) {
    return {
      ok: false,
      error: ACTION_ERROR.missingItem(ITEMS[itemId].name),
    };
  }

  const now = Date.now();
  db.update(buildings)
    .set({ readyAt: now + ANIMAL_PEN.cooldownMs })
    .where(eq(buildings.id, building.id))
    .run();

  // Reason: CL27.2 / CL34.2 — pen care is Animal Breeder ladder (not builder-adjacent).
  grantXp(player.id, "animal_breeder", ANIMAL_PEN.xp);
  return { ok: true };
}

/**
 * Feeds wheat at an animal pen for Animal Breeder XP (CL27.1 / CL27.2 / PL170.2).
 * No livestock combat or animal loot — city scarce ×1 + land unlimited.
 */
export function feedAnimalPen(
  userId: string,
  buildingId: string,
  pos?: Pos,
): ActionResult {
  const ready = requireAnimalPenReady(userId, buildingId, pos);
  if (!ready.ok) return ready;
  return finishAnimalPenCare(
    ready.player,
    ready.building,
    ANIMAL_PEN.feedItemId,
    ANIMAL_PEN.feedQty,
  );
}

/**
 * Refreshes pen bedding with wood for Animal Breeder XP (CL34.2).
 * Second light care beat — no livestock combat or animal loot.
 */
export function cleanAnimalPen(
  userId: string,
  buildingId: string,
  pos?: Pos,
): ActionResult {
  const ready = requireAnimalPenReady(userId, buildingId, pos);
  if (!ready.ok) return ready;
  return finishAnimalPenCare(
    ready.player,
    ready.building,
    ANIMAL_PEN.cleanItemId,
    ANIMAL_PEN.cleanQty,
  );
}

/**
 * Resolves pen care when gather omits an explicit mode (CL34.2).
 * Prefers wheat feed, then wood bedding — feed remains the primary beat.
 *
 * @param userId - Auth user id.
 * @param buildingId - Animal pen id.
 * @param pos - World position.
 * @returns Feed, clean, or missing-wheat failure.
 */
export function careAnimalPen(
  userId: string,
  buildingId: string,
  pos?: Pos,
  care?: AnimalPenCare,
): ActionResult {
  if (care === "clean") return cleanAnimalPen(userId, buildingId, pos);
  if (care === "feed") return feedAnimalPen(userId, buildingId, pos);

  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const wheat = heldQty(owned.player.id, ANIMAL_PEN.feedItemId);
  if (wheat >= ANIMAL_PEN.feedQty) {
    return feedAnimalPen(userId, buildingId, pos);
  }
  const wood = heldQty(owned.player.id, ANIMAL_PEN.cleanItemId);
  if (wood >= ANIMAL_PEN.cleanQty) {
    return cleanAnimalPen(userId, buildingId, pos);
  }
  return {
    ok: false,
    error: ACTION_ERROR.missingItem(ITEMS[ANIMAL_PEN.feedItemId].name),
  };
}

/**
 * Dispatches ore rock, tree stump, fishing dock gather, or animal pen care.
 */
export function gatherBuilding(
  userId: string,
  buildingId: string,
  pos?: Pos,
  care?: AnimalPenCare,
): ActionResult {
  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const building = db
    .select()
    .from(buildings)
    .where(
      and(eq(buildings.id, buildingId), eq(buildings.landId, owned.land.id)),
    )
    .get();
  if (!building) return { ok: false, error: ACTION_ERROR.oreNodeMissing };
  if (building.type === "ore_node") return gatherOre(userId, buildingId, pos);
  if (building.type === "tree_stump") return gatherWood(userId, buildingId, pos);
  if (building.type === "fishing_dock")
    return gatherFish(userId, buildingId, pos);
  if (building.type === "animal_pen")
    return careAnimalPen(userId, buildingId, pos, care);
  return { ok: false, error: ACTION_ERROR.oreNodeMissing };
}
