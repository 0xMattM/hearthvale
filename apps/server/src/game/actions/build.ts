import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  getBuildingUpgrade,
  HOUSING_DECOR,
  isHomesteadKitItemId,
  isHomesteadPickupBuildingType,
  isHousingDecorId,
  isPlayerLandKind,
  isPlayerLandPlaceCell,
  isPlayerLandStationType,
  isNftLandBiomeSlot,
  isUpgradableBuildingType,
  isWarriorTrainingBuildingType,
  ITEMS,
  kitItemIdForDecorBuilding,
  kitItemIdForStation,
  nextSlotExpansion,
  PLAYER_LAND_STATIONS,
  playerLandGridHalfExtent,
  buildingTypeFromKitItemId,
  WORLD,
  type ItemId,
  type PlayerLandStationType,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import { buildings, inventory, players } from "../../db/schema.js";
import { getActiveLand } from "../land.js";
import { localLandSize } from "../creditcoin/local-lands.js";
import {
  addItem,
  addItemWithDurability,
  grantXp,
  removeItem,
  spendEnergy,
} from "../player.js";
import { requireNearGrid, type Pos } from "../proximity.js";
import type { ActionResult } from "./farming.js";
import { clearEquipIfMatches } from "./equipment.js";

/** Player-placed stations use high slot indexes so legacy expand slots stay free. */
const PLAYER_BUILT_SLOT_BASE = 100;

/**
 * Next empty grid cell in a spiral around the yard origin (compat / tests).
 */
export function nextFreeBuildCell(
  occupied: Array<{ x: number; z: number }>,
  originX: number,
  originZ: number,
  nftSize?: string | null,
): { x: number; z: number } | null {
  const taken = new Set(occupied.map((c) => `${c.x},${c.z}`));
  const lim = playerLandGridHalfExtent(nftSize);
  for (let radius = 0; radius <= lim + 2; radius += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dz = -radius; dz <= radius; dz += 1) {
        if (radius > 0 && Math.max(Math.abs(dx), Math.abs(dz)) !== radius)
          continue;
        const x = originX + dx;
        const z = originZ + dz;
        if (!isPlayerLandPlaceCell(x, z, nftSize)) continue;
        if (!taken.has(`${x},${z}`)) return { x, z };
      }
    }
  }
  return null;
}

function nextPlayerBuiltSlotIndex(occupiedSlotIndexes: number[]): number {
  const used = new Set(occupiedSlotIndexes);
  let slot = PLAYER_BUILT_SLOT_BASE;
  while (used.has(slot) || isNftLandBiomeSlot(slot)) slot += 1;
  return slot;
}

function removeInventoryRow(playerId: string, inventoryId: string): boolean {
  const row = db
    .select()
    .from(inventory)
    .where(and(eq(inventory.id, inventoryId), eq(inventory.playerId, playerId)))
    .get();
  if (!row) return false;
  clearEquipIfMatches(playerId, inventoryId);
  db.delete(inventory).where(eq(inventory.id, inventoryId)).run();
  return true;
}

/**
 * Places a station kit from inventory onto a grid cell (free; no mats/coins).
 *
 * @param userId - Auth user id.
 * @param inventoryId - Kit inventory row id.
 * @param gridX - Integer grid x.
 * @param gridZ - Integer grid z.
 */
export function placeStationKit(
  userId: string,
  inventoryId: string,
  gridX: number,
  gridZ: number,
): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!isPlayerLandKind(land.kind)) {
    return { ok: false, error: ACTION_ERROR.placeKitPlayerLandOnly };
  }

  const nftSize = localLandSize(land.nftTokenId);
  if (!isPlayerLandPlaceCell(gridX, gridZ, nftSize)) {
    return { ok: false, error: ACTION_ERROR.buildCellOutOfBounds };
  }

  const kitRow = db
    .select()
    .from(inventory)
    .where(
      and(eq(inventory.id, inventoryId), eq(inventory.playerId, player.id)),
    )
    .get();
  if (!kitRow || !isHomesteadKitItemId(kitRow.itemId)) {
    return { ok: false, error: ACTION_ERROR.needStationKit };
  }

  const buildingType = buildingTypeFromKitItemId(kitRow.itemId);
  if (!buildingType) return { ok: false, error: ACTION_ERROR.unknownKit };

  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, land.id))
    .all();
  if (existing.some((b) => b.x === gridX && b.z === gridZ)) {
    return { ok: false, error: ACTION_ERROR.buildCellOccupied };
  }

  const tier = Math.max(1, kitRow.durability ?? 1);
  if (!removeInventoryRow(player.id, inventoryId)) {
    return { ok: false, error: ACTION_ERROR.needStationKit };
  }

  const slotIndex = nextPlayerBuiltSlotIndex(existing.map((b) => b.slotIndex));
  db.insert(buildings)
    .values({
      id: nanoid(),
      landId: land.id,
      type: buildingType,
      slotIndex,
      x: gridX,
      z: gridZ,
      tier,
      cropId: null,
      plantedAt: null,
      readyAt: null,
    })
    .run();

  // Reason: Builder XP on productive station place only — decor is cosmetic.
  if (isPlayerLandStationType(buildingType)) {
    grantXp(player.id, "builder", BUILDER_PLACE_XP);
  }
  return { ok: true };
}

/**
 * Picks up a placed station from the land editor → kit in inventory (tier preserved).
 *
 * @param userId - Auth user id.
 * @param buildingId - Building to lift.
 * @param _pos - Unused; pickup is panel-driven, not walk-up.
 */
export function pickupLandStation(
  userId: string,
  buildingId: string,
  _pos?: Pos,
): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!isPlayerLandKind(land.kind)) {
    return { ok: false, error: ACTION_ERROR.buildPlayerLandOnly };
  }

  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, land.id))
    .all();

  const building = existing.find((b) => b.id === buildingId);
  if (!building || !isHomesteadPickupBuildingType(building.type)) {
    return { ok: false, error: ACTION_ERROR.pickupNotStation };
  }
  // Reason: NFT biome trees/ore/plots are plot stock — picking them up
  // respawned the template (infinite kits). Player-placed kits stay movable.
  if (isNftLandBiomeSlot(building.slotIndex)) {
    return { ok: false, error: ACTION_ERROR.pickupLandStock };
  }

  const kitId = isPlayerLandStationType(building.type)
    ? kitItemIdForStation(building.type)
    : kitItemIdForDecorBuilding(building.type);
  if (!kitId) return { ok: false, error: ACTION_ERROR.pickupNotStation };
  const tier = building.tier ?? 1;
  db.delete(buildings).where(eq(buildings.id, building.id)).run();
  addItemWithDurability(player.id, kitId, tier);
  return { ok: true };
}

/**
 * Compat / tests: ensure a kit exists and place on next free cell near the board.
 * Production clients use placeStationKit with an explicit grid cell.
 */
export function placeLandStation(
  userId: string,
  stationTypeRaw: string,
  pos?: Pos,
): ActionResult {
  if (isWarriorTrainingBuildingType(stationTypeRaw)) {
    return { ok: false, error: ACTION_ERROR.warriorTrainingHomesteadForbidden };
  }
  if (!isPlayerLandStationType(stationTypeRaw)) {
    return { ok: false, error: ACTION_ERROR.unknownStation };
  }
  const stationType: PlayerLandStationType = stationTypeRaw;

  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!isPlayerLandKind(land.kind)) {
    return { ok: false, error: ACTION_ERROR.buildPlayerLandOnly };
  }

  const kitItemId = kitItemIdForStation(stationType);
  const minBuilderXp = PLAYER_LAND_STATIONS[stationType].minBuilderXp ?? 0;
  if ((player.builderXp ?? 0) < minBuilderXp) {
    return { ok: false, error: ACTION_ERROR.needsXp("builder", minBuilderXp) };
  }

  let kitRow = db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, player.id))
    .all()
    .find((r) => r.itemId === kitItemId);
  if (!kitRow) {
    addItemWithDurability(player.id, kitItemId, 1);
    kitRow = db
      .select()
      .from(inventory)
      .where(eq(inventory.playerId, player.id))
      .all()
      .find((r) => r.itemId === kitItemId);
  }
  if (!kitRow) return { ok: false, error: ACTION_ERROR.needStationKit };

  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, land.id))
    .all();

  const nftSize = localLandSize(land.nftTokenId);

  // Prefer explicit grid from world pos when provided; else spiral from origin.
  let cell: { x: number; z: number } | null = null;
  if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.z)) {
    const gx = Math.round(pos.x / WORLD.GRID);
    const gz = Math.round(pos.z / WORLD.GRID);
    if (
      isPlayerLandPlaceCell(gx, gz, nftSize) &&
      !existing.some((b) => b.x === gx && b.z === gz)
    ) {
      cell = { x: gx, z: gz };
    }
  }
  if (!cell) {
    cell = nextFreeBuildCell(
      existing.map((b) => ({ x: b.x, z: b.z })),
      0,
      0,
      nftSize,
    );
  }
  if (!cell) return { ok: false, error: ACTION_ERROR.buildCellOccupied };

  return placeStationKit(userId, kitRow.id, cell.x, cell.z);
}

/**
 * Builds the next empty starter slot (6 then 7) for coins + mats + energy.
 */
export function expandLandSlot(userId: string, _pos?: Pos): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!isPlayerLandKind(land.kind)) {
    return { ok: false, error: "Expand fields on your land only." };
  }

  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, land.id))
    .all();
  const occupied = existing.map((b) => b.slotIndex);
  const next = nextSlotExpansion(occupied);
  if (!next) return { ok: false, error: ACTION_ERROR.noExpandSlots };

  if (player.softCurrency < next.coinCost) {
    return { ok: false, error: ACTION_ERROR.needCoinsExpand(next.coinCost) };
  }
  for (const mat of next.materials) {
    const have = db
      .select()
      .from(inventory)
      .where(eq(inventory.playerId, player.id))
      .all()
      .filter((r) => r.itemId === mat.itemId)
      .reduce((sum, r) => sum + r.qty, 0);
    if (have < mat.qty) {
      const name = ITEMS[mat.itemId as ItemId]?.name ?? mat.itemId;
      return { ok: false, error: ACTION_ERROR.needMatsExpand(mat.qty, name) };
    }
  }

  const energy = spendEnergy(player.id, next.energyCost);
  if (!energy.ok) return energy;

  for (const mat of next.materials) {
    if (!removeItem(player.id, mat.itemId as ItemId, mat.qty)) {
      const name = ITEMS[mat.itemId as ItemId]?.name ?? mat.itemId;
      return { ok: false, error: ACTION_ERROR.needMatsExpand(mat.qty, name) };
    }
  }

  const fresh = db.select().from(players).where(eq(players.id, player.id)).get();
  if (!fresh || fresh.softCurrency < next.coinCost) {
    for (const mat of next.materials)
      addItem(player.id, mat.itemId as ItemId, mat.qty);
    return { ok: false, error: ACTION_ERROR.needCoinsExpand(next.coinCost) };
  }

  db.update(players)
    .set({ softCurrency: fresh.softCurrency - next.coinCost })
    .where(eq(players.id, player.id))
    .run();

  db.insert(buildings)
    .values({
      id: nanoid(),
      landId: land.id,
      type: "crop_plot",
      slotIndex: next.slotIndex,
      x: next.x,
      z: next.z,
      tier: 1,
      cropId: null,
      plantedAt: null,
      readyAt: null,
    })
    .run();

  return { ok: true };
}

/**
 * Upgrades mill/forge T1→T2 when near the station with costs paid.
 */
export function upgradeBuilding(
  userId: string,
  buildingId: string,
  pos?: Pos,
): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };

  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!building) return { ok: false, error: ACTION_ERROR.plotMissing };
  if (!isUpgradableBuildingType(building.type)) {
    return { ok: false, error: ACTION_ERROR.unknownStation };
  }

  const near = requireNearGrid(pos, building.x, building.z);
  if (!near.ok) return near;

  const upgrade = getBuildingUpgrade(building.type, building.tier ?? 1);
  if (!upgrade) return { ok: false, error: ACTION_ERROR.unknownStation };

  if (player.softCurrency < upgrade.coinCost) {
    return { ok: false, error: ACTION_ERROR.needCoinsBuild(upgrade.coinCost) };
  }
  for (const mat of upgrade.materials) {
    const have = db
      .select()
      .from(inventory)
      .where(eq(inventory.playerId, player.id))
      .all()
      .filter((r) => r.itemId === mat.itemId)
      .reduce((sum, r) => sum + r.qty, 0);
    if (have < mat.qty) {
      const name = ITEMS[mat.itemId]?.name ?? mat.itemId;
      return { ok: false, error: ACTION_ERROR.needMatsBuild(mat.qty, name) };
    }
  }

  const energy = spendEnergy(player.id, upgrade.energyCost);
  if (!energy.ok) return energy;

  for (const mat of upgrade.materials) {
    if (!removeItem(player.id, mat.itemId, mat.qty)) {
      const name = ITEMS[mat.itemId]?.name ?? mat.itemId;
      return { ok: false, error: ACTION_ERROR.needMatsBuild(mat.qty, name) };
    }
  }

  const fresh = db.select().from(players).where(eq(players.id, player.id)).get();
  if (!fresh || fresh.softCurrency < upgrade.coinCost) {
    for (const mat of upgrade.materials) addItem(player.id, mat.itemId, mat.qty);
    return { ok: false, error: ACTION_ERROR.needCoinsBuild(upgrade.coinCost) };
  }

  db.update(players)
    .set({ softCurrency: fresh.softCurrency - upgrade.coinCost })
    .where(eq(players.id, player.id))
    .run();

  db.update(buildings)
    .set({ tier: upgrade.toTier })
    .where(eq(buildings.id, building.id))
    .run();

  return { ok: true };
}

/**
 * Places cosmetic housing decor on an empty decor pad (starter only; no combat power).
 */
export function placeHousingDecor(
  userId: string,
  buildingId: string,
  decorIdRaw: string,
  pos?: Pos,
): ActionResult {
  if (!isHousingDecorId(decorIdRaw)) {
    return { ok: false, error: ACTION_ERROR.unknownStation };
  }
  const decor = HOUSING_DECOR[decorIdRaw];

  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!isPlayerLandKind(land.kind)) {
    return { ok: false, error: ACTION_ERROR.decorStarterOnly };
  }

  const pad = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!pad || pad.type !== "decor_pad") {
    return { ok: false, error: ACTION_ERROR.decorPadMissing };
  }

  const near = requireNearGrid(pos, pad.x, pad.z);
  if (!near.ok) return near;

  if (player.softCurrency < decor.coinCost) {
    return { ok: false, error: ACTION_ERROR.needCoinsDecor(decor.coinCost) };
  }

  db.update(players)
    .set({ softCurrency: player.softCurrency - decor.coinCost })
    .where(eq(players.id, player.id))
    .run();

  db.update(buildings)
    .set({ type: decor.buildingType })
    .where(eq(buildings.id, pad.id))
    .run();

  return { ok: true };
}
