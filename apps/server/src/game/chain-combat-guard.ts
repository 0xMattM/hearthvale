/**
 * Runtime guard for F15.5 — chain state is loaded for HUD only, never for combat.
 */

import {
  assertCombatPowerIndependentOfChain,
  canEngageCombatWithoutChain,
  type CombatSnapshot,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { landDeeds, players, users } from "../db/schema.js";

/**
 * Snapshots combat/energy for invariant checks (regen applied by caller if needed).
 */
export function combatSnapshotFromPlayerRow(
  row: typeof players.$inferSelect,
): CombatSnapshot {
  return {
    health: row.health,
    maxHealth: row.maxHealth,
    damage: row.damage,
    defense: row.defense,
    energy: row.energy,
    maxEnergy: row.maxEnergy,
  };
}

/**
 * Loads wallet/deed hints and asserts they do not alter the combat snapshot.
 * Call after chain ops or when serving player state used for hunts.
 */
export function guardCombatIndependentOfChain(userId: string): CombatSnapshot {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) {
    throw new Error("playerMissing");
  }
  const player = db
    .select()
    .from(players)
    .where(eq(players.userId, userId))
    .get();
  if (!player) {
    throw new Error("playerMissing");
  }
  const deeds = db
    .select()
    .from(landDeeds)
    .where(eq(landDeeds.playerId, player.id))
    .all();
  const listed = deeds.filter((d) => d.status === "listed").length;
  const combat = combatSnapshotFromPlayerRow(player);
  const guarded = assertCombatPowerIndependentOfChain({
    combat,
    chainHints: {
      walletAddress: user.walletAddress ?? null,
      deedCount: deeds.length,
      listedDeedCount: listed,
      mintTxStub: deeds[0]?.mintTxStub ?? null,
      listPriceCoins: deeds[0]?.listPriceCoins ?? null,
    },
  });
  if (!canEngageCombatWithoutChain({ walletAddress: user.walletAddress })) {
    throw new Error("chainMustNotGateCombat");
  }
  return guarded;
}
