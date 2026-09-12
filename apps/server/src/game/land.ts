/**
 * Shared helpers for resolving the player's active land (F11.1 multi-biome)
 * and CityLands free travel (CL1.2). Map kinds: city / player_land / explore / warrior.
 */
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  ACTION_ERROR,
  CITY_BUILDINGS,
  CITY_LAND,
  EXPLORE_BUILDINGS,
  EXPLORE_LAND,
  isCityLandKind,
  isExploreLandKind,
  isLandKind,
  isPlayerLandKind,
  normalizeLandKind,
  WARRIOR_BUILDINGS,
  WARRIOR_LAND,
  type LandKind,
} from "@game/shared";
import { db } from "../db/client.js";
import { buildings, lands, players } from "../db/schema.js";
import { clearCombatSession } from "./combat-session.js";

/**
 * Ore kind (or other layout resource id) stored on `buildings.cropId`.
 *
 * @param def - Layout row that may carry `cropId`.
 * @returns Stored id, or null when the template leaves the node as default iron.
 */
function layoutCropId(def: unknown): string | null {
  if (!def || typeof def !== "object") return null;
  if (!("cropId" in def)) return null;
  const id = (def as { cropId?: unknown }).cropId;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/**
 * Drops buildings whose slot is no longer in the catalog template.
 *
 * @param existing - Rows currently on the land.
 * @param templateSlots - Slot indexes that should remain.
 */
function pruneLayoutOrphans(
  existing: Array<{ id: string; slotIndex: number }>,
  templateSlots: ReadonlySet<number>,
): void {
  for (const row of existing) {
    if (templateSlots.has(row.slotIndex)) continue;
    db.delete(buildings).where(eq(buildings.id, row.id)).run();
  }
}

/**
 * Shared city hub row (CL2.1) — first `city` land in DB; contendable stations.
 */
export function getSharedCityLand() {
  const all = db.select().from(lands).all();
  return all.find((l) => isCityLandKind(l.kind)) ?? null;
}

/**
 * Resolves the player's active land row.
 * City is global: activeLandId may point at the shared hub (any owner).
 */
export function getActiveLand(playerId: string) {
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player) return null;

  if (player.activeLandId) {
    const pointed = db
      .select()
      .from(lands)
      .where(eq(lands.id, player.activeLandId))
      .get();
    if (pointed) {
      // Reason: shared city hub is not owned per-player (CL2.1).
      if (pointed.playerId === playerId || isCityLandKind(pointed.kind)) {
        return pointed;
      }
    }
  }

  const owned = db
    .select()
    .from(lands)
    .where(eq(lands.playerId, playerId))
    .all();
  const home =
    owned.find((l) => isPlayerLandKind(l.kind) && !l.nftTokenId) ??
    owned.find((l) => isPlayerLandKind(l.kind)) ??
    owned[0] ??
    null;
  if (home) {
    db.update(players)
      .set({ activeLandId: home.id })
      .where(eq(players.id, playerId))
      .run();
  }
  return home;
}

/**
 * Finds a land by kind for a player (matches canonical or legacy alias), or null.
 * City resolves to the shared hub for every player.
 */
export function getLandByKind(playerId: string, kind: LandKind) {
  const canonical = normalizeLandKind(kind);
  if (!canonical) return null;
  if (canonical === "city") return getSharedCityLand();
  const owned = db
    .select()
    .from(lands)
    .where(eq(lands.playerId, playerId))
    .all();
  if (canonical === "player_land") {
    return (
      owned.find((l) => isPlayerLandKind(l.kind) && !l.nftTokenId) ??
      owned.find((l) => isPlayerLandKind(l.kind)) ??
      null
    );
  }
  return owned.find((l) => normalizeLandKind(l.kind) === canonical) ?? null;
}

/**
 * Creates the exploration map for a player if missing (CL4.1 template).
 */
export function ensureForestLand(playerId: string): string {
  const existing = getLandByKind(playerId, "explore");
  if (existing) {
    ensureForestYardBuildings(existing.id);
    return existing.id;
  }

  const landId = nanoid();
  db.insert(lands)
    .values({
      id: landId,
      playerId,
      kind: "explore",
      buildSlots: EXPLORE_LAND.buildSlots,
    })
    .run();

  for (const b of EXPLORE_BUILDINGS) {
    db.insert(buildings)
      .values({
        id: nanoid(),
        landId,
        type: b.type,
        slotIndex: b.slotIndex,
        x: b.x,
        z: b.z,
        tier: 1,
        cropId: layoutCropId(b),
        plantedAt: null,
        readyAt: null,
      })
      .run();
  }
  return landId;
}

/** Alias — CityLands explore map. */
export const ensureExploreLand = ensureForestLand;

/**
 * Backfills scarce city stations on the shared hub (CL2.1).
 * Fills missing template slots and re-syncs x/z from catalog so layout spreads apply.
 */
export function ensureCityYardBuildings(landId: string): void {
  const land = db.select().from(lands).where(eq(lands.id, landId)).get();
  if (!land || !isCityLandKind(land.kind)) return;
  if (land.buildSlots !== CITY_LAND.buildSlots) {
    db.update(lands)
      .set({ buildSlots: CITY_LAND.buildSlots })
      .where(eq(lands.id, landId))
      .run();
  }
  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, landId))
    .all();
  pruneLayoutOrphans(
    existing,
    new Set(CITY_BUILDINGS.map((d) => d.slotIndex)),
  );
  for (const def of CITY_BUILDINGS) {
    // Reason: template slotIndex is the stable identity for each scarce station.
    const row = existing.find((b) => b.slotIndex === def.slotIndex);
    if (!row) {
      db.insert(buildings)
        .values({
          id: nanoid(),
          landId,
          type: def.type,
          slotIndex: def.slotIndex,
          x: def.x,
          z: def.z,
          tier: 1,
          cropId: layoutCropId(def),
          plantedAt: null,
          readyAt: null,
        })
        .run();
      continue;
    }
    // Reason: catalog layout spreads must move persisted hub rows (pads stay SoT-aligned).
    if (row.x !== def.x || row.z !== def.z || row.type !== def.type) {
      db.update(buildings)
        .set({ x: def.x, z: def.z, type: def.type })
        .where(eq(buildings.id, row.id))
        .run();
    }
    // Reason: stamp ore kinds onto existing city rocks that were seeded as iron-only.
    if (
      def.type === "ore_node" &&
      def.cropId &&
      row.type === "ore_node" &&
      row.cropId !== def.cropId
    ) {
      db.update(buildings)
        .set({ cropId: def.cropId })
        .where(eq(buildings.id, row.id))
        .run();
    }
  }
}

/**
 * Shared city hub (CL2.1). First visitor creates the global land; others join it.
 */
export function ensureCityLand(playerId: string): string {
  const existing = getSharedCityLand();
  if (existing) {
    ensureCityYardBuildings(existing.id);
    return existing.id;
  }

  const landId = nanoid();
  db.insert(lands)
    .values({
      id: landId,
      playerId,
      kind: "city",
      buildSlots: CITY_LAND.buildSlots,
    })
    .run();

  for (const b of CITY_BUILDINGS) {
    db.insert(buildings)
      .values({
        id: nanoid(),
        landId,
        type: b.type,
        slotIndex: b.slotIndex,
        x: b.x,
        z: b.z,
        tier: 1,
        cropId: layoutCropId(b),
        plantedAt: null,
        readyAt: null,
      })
      .run();
  }
  return landId;
}

/**
 * Backfills warrior arena stub buildings (CL5.1).
 * SlotIndex is the stable identity — upgrades portal-only CL1.2 rows.
 */
export function ensureWarriorYardBuildings(landId: string): void {
  const land = db.select().from(lands).where(eq(lands.id, landId)).get();
  if (!land || normalizeLandKind(land.kind) !== "warrior") return;
  if (land.buildSlots < WARRIOR_LAND.buildSlots) {
    db.update(lands)
      .set({ buildSlots: WARRIOR_LAND.buildSlots })
      .where(eq(lands.id, landId))
      .run();
  }
  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, landId))
    .all();
  for (const def of WARRIOR_BUILDINGS) {
    // Reason: template slotIndex is stable so plaque/dummy markers backfill correctly.
    const row = existing.find((b) => b.slotIndex === def.slotIndex);
    if (!row) {
      db.insert(buildings)
        .values({
          id: nanoid(),
          landId,
          type: def.type,
          slotIndex: def.slotIndex,
          x: def.x,
          z: def.z,
          tier: 1,
          cropId: layoutCropId(def),
          plantedAt: null,
          readyAt: null,
        })
        .run();
      continue;
    }
    if (row.type !== def.type || row.x !== def.x || row.z !== def.z) {
      db.update(buildings)
        .set({ type: def.type, x: def.x, z: def.z })
        .where(eq(buildings.id, row.id))
        .run();
    }
  }
}

/**
 * Warrior arena stub for a player (CL1.2 / CL5.1).
 * Placeholder map only — no combat balance or profession coupling.
 */
export function ensureWarriorLand(playerId: string): string {
  const existing = getLandByKind(playerId, "warrior");
  if (existing) {
    ensureWarriorYardBuildings(existing.id);
    return existing.id;
  }

  const landId = nanoid();
  db.insert(lands)
    .values({
      id: landId,
      playerId,
      kind: "warrior",
      buildSlots: WARRIOR_LAND.buildSlots,
    })
    .run();

  for (const b of WARRIOR_BUILDINGS) {
    db.insert(buildings)
      .values({
        id: nanoid(),
        landId,
        type: b.type,
        slotIndex: b.slotIndex,
        x: b.x,
        z: b.z,
        tier: 1,
        cropId: null,
        plantedAt: null,
        readyAt: null,
      })
      .run();
  }
  return landId;
}

/**
 * Backfills exploration template nodes (CL4.1).
 * SlotIndex is the stable identity — supports multiple trees/ores/trails.
 * Re-syncs x/z from catalog when the wilds layout spreads.
 */
export function ensureForestYardBuildings(landId: string): void {
  const land = db.select().from(lands).where(eq(lands.id, landId)).get();
  if (!land || !isExploreLandKind(land.kind)) return;
  if (land.buildSlots !== EXPLORE_LAND.buildSlots) {
    db.update(lands)
      .set({ buildSlots: EXPLORE_LAND.buildSlots })
      .where(eq(lands.id, landId))
      .run();
  }
  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, landId))
    .all();
  pruneLayoutOrphans(
    existing,
    new Set(EXPLORE_BUILDINGS.map((d) => d.slotIndex)),
  );
  for (const def of EXPLORE_BUILDINGS) {
    // Reason: template slotIndex is stable so multi-of-type nodes backfill correctly.
    const row = existing.find((b) => b.slotIndex === def.slotIndex);
    if (!row) {
      db.insert(buildings)
        .values({
          id: nanoid(),
          landId,
          type: def.type,
          slotIndex: def.slotIndex,
          x: def.x,
          z: def.z,
          tier: 1,
          cropId: layoutCropId(def),
          plantedAt: null,
          readyAt: null,
        })
        .run();
      continue;
    }
    if (row.x !== def.x || row.z !== def.z || row.type !== def.type) {
      db.update(buildings)
        .set({ x: def.x, z: def.z, type: def.type })
        .where(eq(buildings.id, row.id))
        .run();
    }
    // Reason: stamp mixed mine ores onto explore rocks seeded before copper/gold kinds.
    if (
      def.type === "ore_node" &&
      def.cropId &&
      row.type === "ore_node" &&
      row.cropId !== def.cropId
    ) {
      db.update(buildings)
        .set({ cropId: def.cropId })
        .where(eq(buildings.id, row.id))
        .run();
    }
  }
}

/** Alias — CityLands explore yard ensure. */
export const ensureExploreYardBuildings = ensureForestYardBuildings;

/**
 * Resolves (creating if needed) the land id for a destination kind.
 */
function resolveLandIdForKind(playerId: string, kind: LandKind): string | null {
  const canonical = normalizeLandKind(kind);
  if (!canonical) return null;
  if (canonical === "explore") return ensureExploreLand(playerId);
  if (canonical === "city") return ensureCityLand(playerId);
  if (canonical === "warrior") return ensureWarriorLand(playerId);
  if (canonical === "player_land") {
    return getLandByKind(playerId, "player_land")?.id ?? null;
  }
  return null;
}

/**
 * Applies a due legacy caravan arrival (switches active land, clears travel fields).
 * CityLands free travel no longer schedules these; kept for stale DB rows.
 */
export function completePendingTravel(playerId: string, now = Date.now()): void {
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player?.travelArriveAt || !player.travelDestinationKind) return;
  if (now < player.travelArriveAt) return;
  if (!isLandKind(player.travelDestinationKind)) {
    db.update(players)
      .set({ travelDestinationKind: null, travelArriveAt: null })
      .where(eq(players.id, playerId))
      .run();
    return;
  }
  const landId = resolveLandIdForKind(playerId, player.travelDestinationKind);
  if (!landId) return;
  db.update(players)
    .set({
      activeLandId: landId,
      travelDestinationKind: null,
      travelArriveAt: null,
    })
    .where(eq(players.id, playerId))
    .run();
}

/**
 * Free instant travel to a CityLands map kind (CL1.2 / PlayerVision).
 * No caravan timer, coin fare, or Travel Ration spend.
 * Accepts canonical kinds + legacy aliases (`starter` / `forest`).
 */
export function travelToLandKind(
  userId: string,
  kindRaw: string,
  now = Date.now(),
): { ok: true } | { ok: false; error: string } {
  if (!isLandKind(kindRaw)) {
    return { ok: false, error: "That destination is not available." };
  }
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };

  // Reason: clear any stale caravan timer from pre-CL1.2 sessions before switching.
  completePendingTravel(player.id, now);
  const fresh = db.select().from(players).where(eq(players.id, player.id)).get();
  if (!fresh) return { ok: false, error: ACTION_ERROR.playerMissing };

  // Reason: free travel supersedes in-flight caravans — cancel leftover road state.
  if (fresh.travelArriveAt != null || fresh.travelDestinationKind != null) {
    db.update(players)
      .set({ travelDestinationKind: null, travelArriveAt: null })
      .where(eq(players.id, fresh.id))
      .run();
  }

  const landId = resolveLandIdForKind(fresh.id, kindRaw);
  if (!landId) return { ok: false, error: "Could not find that land." };

  const active = getActiveLand(fresh.id);
  if (active && active.id === landId) {
    return { ok: false, error: ACTION_ERROR.travelAlreadyHere };
  }

  db.update(players)
    .set({
      activeLandId: landId,
      travelDestinationKind: null,
      travelArriveAt: null,
    })
    .where(eq(players.id, fresh.id))
    .run();

  clearCombatSession(fresh.id);

  return { ok: true };
}

// Re-export helpers used by visit / player for kind checks.
export { isExploreLandKind, isPlayerLandKind, normalizeLandKind };
