import {
  ACTION_ERROR,
  NFT_LAND_BONUS,
  focusedEnergyCost,
  focusedHarvestBonus,
  getCrop,
  getCropBySeed,
  isCityLandKind,
  type ItemId,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { buildings, inventory, lands, players } from "../../db/schema.js";
import { getActiveLand } from "../land.js";
import {
  addItem,
  grantXp,
  removeItem,
  spendEnergy,
} from "../player.js";
import { bumpAchievement } from "../achievements.js";
import { getCreditcoinSnapshotSync } from "../creditcoin/holdings.js";
import { requireNearGrid, type Pos } from "../proximity.js";
import { isCityStationContendedByOther } from "../stationContention.js";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function landOwnedByPlayer(userId: string) {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return null;
  const land = getActiveLand(player.id);
  if (!land) return null;
  return { player, land };
}

/**
 * Plants a seed on an owned crop plot.
 */
export function plantCrop(
  userId: string,
  buildingId: string,
  seedItemId: ItemId,
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
  if (!building || building.type !== "crop_plot") {
    return { ok: false, error: ACTION_ERROR.plotMissing };
  }

  const near = requireNearGrid(pos, building.x, building.z);
  if (!near.ok) return near;
  if (building.cropId) return { ok: false, error: ACTION_ERROR.plotNotEmpty };

  // Reason: CL65.2 — scarce city crop plots contend via presence; land unlimited.
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

  const crop = getCropBySeed(seedItemId);
  if (!crop) return { ok: false, error: ACTION_ERROR.unknownSeed };

  let energyCost = focusedEnergyCost(
    crop.plantEnergy,
    "farmer",
    player.farmerXp,
    player.blacksmithXp,
  );
  const toolId = player.equippedToolInventoryId;
  if (toolId) {
    const tool = db.select().from(inventory).where(eq(inventory.id, toolId)).get();
    if (tool && tool.itemId.includes("hoe")) {
      energyCost = Math.max(1, energyCost - 1);
    }
  }

  if (!removeItem(player.id, seedItemId, 1)) {
    return { ok: false, error: ACTION_ERROR.missingSeed };
  }

  const energy = spendEnergy(player.id, energyCost);
  if (!energy.ok) {
    addItem(player.id, seedItemId, 1);
    return energy;
  }

  const now = Date.now();
  // Reason: NFT land bonus — 15% faster crops, cosmetic only (never combat).
  const snap = getCreditcoinSnapshotSync(userId);
  const nftBonus = snap.contractsConfigured && snap.lands.length > 0;
  const growMs = nftBonus
    ? Math.round(crop.growMs * NFT_LAND_BONUS.cropGrowSpeedMultiplier)
    : crop.growMs;
  db.update(buildings)
    .set({
      cropId: crop.id,
      plantedAt: now,
      readyAt: now + growMs,
    })
    .where(eq(buildings.id, building.id))
    .run();

  // Reason: Content Lock — only hoes discount plant energy and consume durability.
  if (toolId) {
    const tool = db.select().from(inventory).where(eq(inventory.id, toolId)).get();
    if (tool?.itemId.includes("hoe") && tool.durability != null) {
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
  }

  grantXp(player.id, "farmer", 5);
  bumpAchievement(player.id, "plant_crops");
  return { ok: true };
}

/**
 * Harvests a ready crop plot.
 */
export function harvestCrop(
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
  if (!building || building.type !== "crop_plot") {
    return { ok: false, error: ACTION_ERROR.plotMissing };
  }

  const near = requireNearGrid(pos, building.x, building.z);
  if (!near.ok) return near;

  const now = Date.now();
  if (!building.cropId || !building.readyAt || now < building.readyAt) {
    return { ok: false, error: ACTION_ERROR.cropNotReady };
  }

  const crop = getCrop(building.cropId);
  if (!crop) {
    return { ok: false, error: ACTION_ERROR.cropMissing };
  }

  const energyCost = focusedEnergyCost(
    crop.harvestEnergy,
    "farmer",
    player.farmerXp,
    player.blacksmithXp,
  );
  const energy = spendEnergy(player.id, energyCost);
  if (!energy.ok) return energy;

  const qty =
    crop.harvestQty + focusedHarvestBonus(player.farmerXp, player.blacksmithXp);
  addItem(player.id, crop.harvestItemId, qty);

  db.update(buildings)
    .set({ cropId: null, plantedAt: null, readyAt: null })
    .where(eq(buildings.id, building.id))
    .run();

  grantXp(player.id, "farmer", 10);
  bumpAchievement(player.id, "harvest_crops");
  return { ok: true };
}
