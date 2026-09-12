import {
  ACTION_ERROR,
  PLAYER_LAND,
  isPlayerLandKind,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import { lands, localLands, players } from "../../db/schema.js";
import { clearCombatSession } from "../combat-session.js";
import { getActiveLand } from "../land.js";
import { ensureNftBiomeBuildings } from "./nft-biome.js";

/**
 * Creates (or returns) a playable player_land yard bound to a LandNFT token.
 *
 * Args:
 *   playerId: Owner player row.
 *   tokenId: On-chain or local ledger token id.
 *
 * Returns:
 *   The homestead `lands.id`.
 */
export function ensureNftHomestead(
  playerId: string,
  tokenId: string,
): string {
  const existing = db
    .select()
    .from(lands)
    .where(and(eq(lands.playerId, playerId), eq(lands.nftTokenId, tokenId)))
    .get();
  if (existing) {
    ensureNftBiomeBuildings(existing.id);
    return existing.id;
  }

  const landId = nanoid();
  db.insert(lands)
    .values({
      id: landId,
      playerId,
      kind: "player_land",
      buildSlots: PLAYER_LAND.buildSlots,
      nftTokenId: tokenId,
    })
    .run();
  ensureNftBiomeBuildings(landId);
  return landId;
}

/**
 * Instant travel to an owned land row (starter or NFT homestead).
 *
 * Args:
 *   userId: Account id.
 *   landId: Target `lands.id`.
 *
 * Returns:
 *   ok, or a player-facing ACTION_ERROR.
 */
export function travelToOwnedLand(
  userId: string,
  landId: string,
): { ok: true } | { ok: false; error: string } {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };

  let target = db.select().from(lands).where(eq(lands.id, landId)).get() ?? null;
  if (target && target.playerId !== player.id) target = null;
  if (!target) {
    target =
      db
        .select()
        .from(lands)
        .where(and(eq(lands.playerId, player.id), eq(lands.nftTokenId, landId)))
        .get() ?? null;
  }
  if (!target) {
    const ledger = db
      .select()
      .from(localLands)
      .where(and(eq(localLands.playerId, player.id), eq(localLands.id, landId)))
      .get();
    if (ledger) {
      const homesteadId = ensureNftHomestead(player.id, ledger.id);
      target = db.select().from(lands).where(eq(lands.id, homesteadId)).get() ?? null;
    }
  }
  if (!target || target.playerId !== player.id) {
    return { ok: false, error: ACTION_ERROR.landNotOwned };
  }
  if (!isPlayerLandKind(target.kind)) {
    return { ok: false, error: ACTION_ERROR.landNotOwned };
  }
  const active = getActiveLand(player.id);
  if (active?.id === target.id) {
    return { ok: false, error: ACTION_ERROR.travelAlreadyHere };
  }
  db.update(players)
    .set({
      activeLandId: target.id,
      travelDestinationKind: null,
      travelArriveAt: null,
    })
    .where(eq(players.id, player.id))
    .run();
  clearCombatSession(player.id);
  return { ok: true };
}
