import {
  ACTION_ERROR,
  ENERGY,
  FOOD_HEAL,
  FOOD_RESTORE,
  focusedEnergyCost,
  getRecipe,
  isEdibleItemId,
  ITEMS,
  meetsRecipeXpGate,
  recipeCraftMs,
  stationCraftEnergy,
  stationCraftOutputBonus,
  type BuildingCraftDto,
  type EdibleItemId,
  type ItemId,
} from "@game/shared";
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import {
  buildings,
  craftJobs,
  inventory,
  players,
} from "../../db/schema.js";
import {
  craftGlanceFromJobs,
  craftGlancesFromJobRows,
  landKindExclusiveCraft,
} from "../craft-glance.js";
import { getActiveLand } from "../land.js";
import { addItem, applyEnergyRegen, applyHealthRegen, grantXp, removeItem, spendEnergy } from "../player.js";
import { bumpAchievement } from "../achievements.js";
import { requireNearGrid, type Pos } from "../proximity.js";
import type { ActionResult } from "./farming.js";

function hasInputs(playerId: string, recipeId: string): boolean {
  const recipe = getRecipe(recipeId);
  if (!recipe) return false;
  const rows = db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, playerId))
    .all();

  for (const input of recipe.inputs) {
    const def = ITEMS[input.itemId];
    if (!def.stackable) {
      const count = rows.filter((r) => r.itemId === input.itemId).length;
      if (count < input.qty) return false;
    } else {
      const stack = rows.find((r) => r.itemId === input.itemId);
      if (!stack || stack.qty < input.qty) return false;
    }
  }
  return true;
}

/**
 * Builds craft glance for a building from the viewer's perspective.
 *
 * @param buildingId - Station building id.
 * @param viewerPlayerId - Current player id.
 * @param landKind - Active land kind.
 * @param now - Server now ms.
 * @returns Craft DTO or null.
 */
export function craftGlanceForBuilding(
  buildingId: string,
  viewerPlayerId: string,
  landKind: string,
  now: number,
): BuildingCraftDto | null {
  const jobs = db
    .select()
    .from(craftJobs)
    .where(eq(craftJobs.buildingId, buildingId))
    .all();
  return craftGlanceFromJobs(jobs, viewerPlayerId, landKind, now);
}

/**
 * One query for every station glance on a land (gather/craft interact path).
 *
 * @param buildingIds - Station ids on the current land.
 * @param viewerPlayerId - Current player id.
 * @param landKind - Active land kind.
 * @param now - Server now ms.
 * @returns Map of building id → glance (missing = idle / hidden).
 */
export function craftGlancesForBuildings(
  buildingIds: readonly string[],
  viewerPlayerId: string,
  landKind: string,
  now: number,
): Map<string, BuildingCraftDto> {
  if (buildingIds.length === 0) return new Map();
  const jobs = db
    .select()
    .from(craftJobs)
    .where(inArray(craftJobs.buildingId, [...buildingIds]))
    .all();
  return craftGlancesFromJobRows(
    buildingIds,
    jobs,
    viewerPlayerId,
    landKind,
    now,
  );
}

/**
 * Starts a craft at the recipe station — spends energy/mats; wait then collect.
 */
export function craftRecipe(
  userId: string,
  recipeId: string,
  pos?: Pos,
): ActionResult {
  return startCraft(userId, recipeId, pos);
}

/**
 * Starts a process-station craft job (wait/collect loop).
 */
export function startCraft(
  userId: string,
  recipeId: string,
  pos?: Pos,
): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };

  const recipe = getRecipe(recipeId);
  if (!recipe) return { ok: false, error: ACTION_ERROR.unknownRecipe };

  const station = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.landId, land.id), eq(buildings.type, recipe.station)))
    .get();
  if (!station) {
    return { ok: false, error: ACTION_ERROR.needsStation(recipe.station) };
  }

  const near = requireNearGrid(pos, station.x, station.z);
  if (!near.ok) return near;

  const existingMine = db
    .select()
    .from(craftJobs)
    .where(
      and(
        eq(craftJobs.buildingId, station.id),
        eq(craftJobs.playerId, player.id),
      ),
    )
    .get();
  if (existingMine) {
    return { ok: false, error: ACTION_ERROR.craftAlreadyStarted };
  }

  // Reason: land/explore exclusive — any job on the building blocks new starts.
  if (landKindExclusiveCraft(land.kind)) {
    const anyJob = db
      .select()
      .from(craftJobs)
      .where(eq(craftJobs.buildingId, station.id))
      .get();
    if (anyJob) {
      return { ok: false, error: ACTION_ERROR.stationBusy };
    }
  }

  if (
    !meetsRecipeXpGate(
      recipe,
      player.farmerXp,
      player.blacksmithXp,
      player.cookXp ?? 0,
      player.hunterXp ?? 0,
      player.carpenterXp ?? 0,
      player.weaverXp ?? 0,
      player.foresterXp ?? 0,
      player.minerXp ?? 0,
      player.builderXp ?? 0,
      player.fisherXp ?? 0,
      player.animalBreederXp ?? 0,
      player.animalHunterXp ?? 0,
      player.monsterHunterXp ?? 0,
      player.alchemistXp ?? 0,
    )
  ) {
    const need = recipe.minProfessionXp;
    const label =
      recipe.profession === "farmer"
        ? "Farmer"
        : recipe.profession === "blacksmith"
          ? "Blacksmith"
          : recipe.profession === "animal_hunter"
            ? "Animal Hunter"
            : recipe.profession === "monster_hunter"
              ? "Monster Hunter"
              : recipe.profession === "hunter"
                ? "Hunter"
                : recipe.profession === "carpenter"
                  ? "Carpenter"
                  : recipe.profession === "weaver"
                    ? "Weaver"
                    : recipe.profession === "forester"
                      ? "Forester"
                      : recipe.profession === "miner"
                        ? "Miner"
                        : recipe.profession === "builder"
                          ? "Builder"
                          : recipe.profession === "fisher"
                            ? "Fisher"
                            : recipe.profession === "animal_breeder"
                              ? "Animal Breeder"
                              : recipe.profession === "alchemist"
                                ? "Alchemist"
                                : "Cook";
    return {
      ok: false,
      error: ACTION_ERROR.needsXp(label, need),
    };
  }

  if (!hasInputs(player.id, recipeId)) {
    return { ok: false, error: ACTION_ERROR.missingMaterials };
  }

  const stationTier = station.tier ?? 1;
  const focused = focusedEnergyCost(
    recipe.energyCost,
    recipe.profession,
    player.farmerXp,
    player.blacksmithXp,
  );
  const energyCost = stationCraftEnergy(focused, stationTier);
  const energy = spendEnergy(player.id, energyCost);
  if (!energy.ok) return energy;

  for (const input of recipe.inputs) {
    if (!removeItem(player.id, input.itemId, input.qty)) {
      return { ok: false, error: ACTION_ERROR.missingItem(ITEMS[input.itemId].name) };
    }
  }

  const now = Date.now();
  const craftMs = recipeCraftMs(recipe);
  db.insert(craftJobs)
    .values({
      id: nanoid(),
      playerId: player.id,
      buildingId: station.id,
      landId: land.id,
      recipeId: recipe.id,
      startedAt: now,
      readyAt: now + craftMs,
    })
    .run();

  return { ok: true };
}

/**
 * Collects a finished craft job at a process station (starter only).
 */
export function collectCraft(
  userId: string,
  buildingId: string,
  pos?: Pos,
): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };

  const station = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!station) return { ok: false, error: ACTION_ERROR.craftNone };

  const near = requireNearGrid(pos, station.x, station.z);
  if (!near.ok) return near;

  const job = db
    .select()
    .from(craftJobs)
    .where(
      and(
        eq(craftJobs.buildingId, buildingId),
        eq(craftJobs.playerId, player.id),
      ),
    )
    .get();
  if (!job) {
    const other = db
      .select()
      .from(craftJobs)
      .where(eq(craftJobs.buildingId, buildingId))
      .get();
    if (other) return { ok: false, error: ACTION_ERROR.craftNotYours };
    return { ok: false, error: ACTION_ERROR.craftNone };
  }

  const now = Date.now();
  if (now < job.readyAt) {
    return { ok: false, error: ACTION_ERROR.craftNotReady };
  }

  const recipe = getRecipe(job.recipeId);
  if (!recipe) {
    db.delete(craftJobs).where(eq(craftJobs.id, job.id)).run();
    return { ok: false, error: ACTION_ERROR.unknownRecipe };
  }

  const stationTier = station.tier ?? 1;
  const outDef = ITEMS[recipe.output.itemId as ItemId];
  const bonus = stationCraftOutputBonus(stationTier, Boolean(outDef?.stackable));
  addItem(
    player.id,
    recipe.output.itemId as ItemId,
    recipe.output.qty + bonus,
  );
  grantXp(player.id, recipe.profession, 8);
  bumpAchievement(player.id, "crafts");
  db.delete(craftJobs).where(eq(craftJobs.id, job.id)).run();
  return { ok: true };
}

/**
 * Starts a craft, forces readyAt past, then collects — for tests that expect
 * the former instant craft loop (output + XP in one call).
 *
 * @param userId - Auth user id.
 * @param recipeId - Catalog recipe id.
 * @param pos - Optional world position near the station.
 * @returns Action result from collect (or start failure).
 */
export function craftRecipeComplete(
  userId: string,
  recipeId: string,
  pos?: Pos,
): ActionResult {
  const started = startCraft(userId, recipeId, pos);
  if (!started.ok) return started;

  const player = db
    .select()
    .from(players)
    .where(eq(players.userId, userId))
    .get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const land = getActiveLand(player.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };
  const recipe = getRecipe(recipeId);
  if (!recipe) return { ok: false, error: ACTION_ERROR.unknownRecipe };
  const station = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.landId, land.id), eq(buildings.type, recipe.station)))
    .get();
  if (!station) {
    return { ok: false, error: ACTION_ERROR.needsStation(recipe.station) };
  }

  const job = db
    .select()
    .from(craftJobs)
    .where(
      and(
        eq(craftJobs.buildingId, station.id),
        eq(craftJobs.playerId, player.id),
      ),
    )
    .get();
  if (!job) return { ok: false, error: ACTION_ERROR.craftNone };

  db.update(craftJobs)
    .set({ readyAt: Date.now() - 1 })
    .where(eq(craftJobs.id, job.id))
    .run();

  return collectCraft(userId, station.id, pos);
}

/**
 * Consumes bread to restore energy and health.
 */
export function eatBread(userId: string): ActionResult {
  return eatFood(userId, "bread");
}

/**
 * Consumes an edible stackable and restores tiered energy plus matching HP.
 *
 * @param userId - Authenticated user id.
 * @param itemId - Edible catalog id (defaults to bread).
 * @returns Ok when the stack was consumed; error when missing or not edible.
 */
export function eatFood(
  userId: string,
  itemId: EdibleItemId = "bread",
): ActionResult {
  const raw = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!raw) return { ok: false, error: ACTION_ERROR.playerMissing };
  if (!isEdibleItemId(itemId)) {
    return { ok: false, error: ACTION_ERROR.noFood };
  }
  const player = applyHealthRegen(applyEnergyRegen(raw));
  if (!removeItem(player.id, itemId, 1)) {
    return {
      ok: false,
      error: itemId === "bread" ? ACTION_ERROR.noBread : ACTION_ERROR.noFood,
    };
  }
  const restore = FOOD_RESTORE[itemId] ?? ENERGY.breadRestore;
  const heal = FOOD_HEAL[itemId] ?? 0;
  const now = Date.now();
  const nextEnergy = Math.min(player.maxEnergy, player.energy + restore);
  const nextHealth = Math.min(player.maxHealth, player.health + heal);
  db.update(players)
    .set({
      energy: nextEnergy,
      energyUpdatedAt: now,
      health: nextHealth,
      healthUpdatedAt: now,
    })
    .where(eq(players.id, player.id))
    .run();
  return { ok: true };
}
