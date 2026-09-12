import {
  ACTION_ERROR,
  isExploreLandKind,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { buildings, players } from "../../db/schema.js";
import { getActiveLand } from "../land.js";
import { guardCombatIndependentOfChain } from "../chain-combat-guard.js";
import type { Pos } from "../proximity.js";
import {
  autoResolveOpenCombat,
  startLiveCombat,
  type CombatActionResult,
} from "./combat-live.js";

export type { CombatActionResult as HuntActionResult };

function landOwnedByPlayer(userId: string) {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return null;
  const land = getActiveLand(player.id);
  if (!land) return null;
  return { player, land };
}

/**
 * Hunts a trail or edge thicket on the Exploration map (CL4.2).
 * Starts a live fight then auto-resolves remaining chase/strikes (test + legacy path).
 * The client uses startLiveCombat + tick + attack for realtime combat.
 *
 * @param userId - Auth user id.
 * @param buildingId - game_trail or edge_thicket id.
 * @param pos - Client world position.
 */
export function huntTrail(
  userId: string,
  buildingId: string,
  pos?: Pos,
): CombatActionResult {
  guardCombatIndependentOfChain(userId);

  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const { land } = owned;

  if (!isExploreLandKind(land.kind)) {
    return { ok: false, error: ACTION_ERROR.huntExploreOnly };
  }

  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (
    !building ||
    (building.type !== "game_trail" && building.type !== "edge_thicket")
  ) {
    return { ok: false, error: ACTION_ERROR.huntMissing };
  }

  const started = startLiveCombat(userId, buildingId, pos);
  if (!started.ok) return started;
  return autoResolveOpenCombat(userId, pos);
}
