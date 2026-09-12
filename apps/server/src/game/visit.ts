import {
  ACTION_ERROR,
  cityTutorialNpcIdForSlot,
  normalizeLandKind,
  type BuildingDto,
  type VisitLandDto,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { buildings, players, users } from "../db/schema.js";
import {
  ensureForestYardBuildings,
  getActiveLand,
  isExploreLandKind,
} from "./land.js";
import { ensureNftBiomeBuildings } from "./creditcoin/nft-biome.js";
import { craftGlancesForBuildings } from "./actions/crafting.js";

function cropState(
  building: typeof buildings.$inferSelect,
  now: number,
): BuildingDto["cropState"] {
  if (building.type !== "crop_plot") return null;
  if (!building.cropId || !building.readyAt) return "empty";
  if (now >= building.readyAt) return "ready";
  return "planted";
}

/**
 * Loads another player's active land for visit (view + trade).
 * Does not seed packed homestead buildings (CL1.1).
 */
export function getVisitLand(
  visitorUserId: string,
  ownerUsername: string,
): { ok: true; land: VisitLandDto } | { ok: false; error: string } {
  const cleaned = ownerUsername.trim().toLowerCase();
  if (!cleaned) return { ok: false, error: ACTION_ERROR.tradePlayerMissing };

  const ownerUser = db.select().from(users).where(eq(users.username, cleaned)).get();
  if (!ownerUser) return { ok: false, error: ACTION_ERROR.tradePlayerMissing };
  if (ownerUser.id === visitorUserId) {
    return { ok: false, error: "You are already on your own land." };
  }

  const ownerPlayer = db
    .select()
    .from(players)
    .where(eq(players.userId, ownerUser.id))
    .get();
  if (!ownerPlayer) return { ok: false, error: ACTION_ERROR.tradePlayerMissing };

  const visitorPlayer = db
    .select()
    .from(players)
    .where(eq(players.userId, visitorUserId))
    .get();
  if (!visitorPlayer) return { ok: false, error: ACTION_ERROR.playerMissing };

  const land = getActiveLand(ownerPlayer.id);
  if (!land) return { ok: false, error: ACTION_ERROR.playerMissing };

  if (isExploreLandKind(land.kind)) ensureForestYardBuildings(land.id);
  if (land.nftTokenId) ensureNftBiomeBuildings(land.id);

  const now = Date.now();
  const buildingRows = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, land.id))
    .all()
    .sort((a, b) => a.slotIndex - b.slotIndex);

  const landKind = normalizeLandKind(land.kind) ?? "player_land";
  const craftByBuilding = craftGlancesForBuildings(
    buildingRows.map((b) => b.id),
    visitorPlayer.id,
    landKind,
    now,
  );

  return {
    ok: true,
    land: {
      ownerUsername: ownerUser.username,
      landId: land.id,
      landKind,
      serverNow: now,
      buildings: buildingRows.map((b) => ({
        id: b.id,
        type: b.type as BuildingDto["type"],
        slotIndex: b.slotIndex,
        x: b.x,
        z: b.z,
        tier: b.tier ?? 1,
        cropState: cropState(b, now),
        cropId: b.cropId,
        plantedAt: b.plantedAt,
        readyAt: b.readyAt,
        craft: craftByBuilding.get(b.id) ?? null,
        claim: null,
        tutorialNpcId:
          b.type === "tutorial_npc"
            ? cityTutorialNpcIdForSlot(b.slotIndex)
            : null,
      })),
    },
  };
}
