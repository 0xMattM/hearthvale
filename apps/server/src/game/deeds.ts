import {
  ACTION_ERROR,
  LAND_DEED,
  isValidDeedListPrice,
  normalizeLandKind,
  stubMintTx,
  type LandDeedDto,
  type LandDeedStatus,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/client.js";
import { landDeeds, lands, players, users } from "../db/schema.js";
import { ensureForestLand } from "./land.js";
import type { ActionResult } from "./actions/farming.js";

function toDto(
  row: typeof landDeeds.$inferSelect,
  landKind: string,
  sellerUsername?: string,
): LandDeedDto {
  const status: LandDeedStatus =
    row.status === "listed" ? "listed" : "held";
  return {
    id: row.id,
    title: row.title,
    landId: row.landId,
    landKind,
    createdAt: row.createdAt,
    status,
    listPriceCoins: row.listPriceCoins ?? null,
    mintTxStub: row.mintTxStub ?? null,
    sellerUsername,
  };
}

/**
 * Lists off-chain deeds for a player (F15.2).
 */
export function listLandDeeds(playerId: string): LandDeedDto[] {
  const rows = db
    .select()
    .from(landDeeds)
    .where(eq(landDeeds.playerId, playerId))
    .all();
  return rows.map((row) => {
    const land = db.select().from(lands).where(eq(lands.id, row.landId)).get();
    const kind = land?.kind ?? LAND_DEED.landKind;
    return toDto(row, normalizeLandKind(kind) ?? kind);
  });
}

/**
 * Public mock marketplace listings (F15.3 / prep F15.4).
 */
export function listDeedMarket(): LandDeedDto[] {
  const rows = db
    .select()
    .from(landDeeds)
    .where(eq(landDeeds.status, "listed"))
    .all();
  return rows.map((row) => {
    const land = db.select().from(lands).where(eq(lands.id, row.landId)).get();
    const owner = db
      .select()
      .from(players)
      .where(eq(players.id, row.playerId))
      .get();
    const uname = owner
      ? db.select().from(users).where(eq(users.id, owner.userId)).get()
          ?.username
      : undefined;
    return toDto(row, land?.kind ?? LAND_DEED.landKind, uname);
  });
}

/**
 * Purchases an off-chain premium forest deed with soft currency.
 */
export function claimLandDeed(userId: string): ActionResult & { deedId?: string } {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };

  const landId = ensureForestLand(player.id);
  const forest = db.select().from(lands).where(eq(lands.id, landId)).get();
  if (!forest) return { ok: false, error: ACTION_ERROR.deedNeedForest };

  const existing = db
    .select()
    .from(landDeeds)
    .where(
      and(eq(landDeeds.playerId, player.id), eq(landDeeds.landId, forest.id)),
    )
    .get();
  if (existing) return { ok: false, error: ACTION_ERROR.deedAlreadyOwned };

  if (player.softCurrency < LAND_DEED.claimCostCoins) {
    return { ok: false, error: ACTION_ERROR.notEnoughCoins };
  }

  db.update(players)
    .set({ softCurrency: player.softCurrency - LAND_DEED.claimCostCoins })
    .where(eq(players.id, player.id))
    .run();

  const id = nanoid();
  db.insert(landDeeds)
    .values({
      id,
      playerId: player.id,
      landId: forest.id,
      title: LAND_DEED.title,
      createdAt: Date.now(),
      status: "held",
      listPriceCoins: null,
      mintTxStub: null,
    })
    .run();

  return { ok: true, deedId: id };
}

/**
 * Mock-mints a deed on the stub chain (F15.3). No combat effect.
 */
export function mintDeedStub(
  userId: string,
  deedId: string,
): ActionResult & { mintTxStub?: string } {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const deed = db.select().from(landDeeds).where(eq(landDeeds.id, deedId)).get();
  if (!deed) return { ok: false, error: ACTION_ERROR.deedMissing };
  if (deed.playerId !== player.id) {
    return { ok: false, error: ACTION_ERROR.deedNotYours };
  }
  if (deed.mintTxStub) {
    return { ok: false, error: ACTION_ERROR.deedAlreadyMinted };
  }
  const tx = stubMintTx(deed.id);
  db.update(landDeeds)
    .set({ mintTxStub: tx })
    .where(eq(landDeeds.id, deed.id))
    .run();
  return { ok: true, mintTxStub: tx };
}

/**
 * Lists a minted deed on the mock board (F15.3).
 */
export function listDeedForSale(
  userId: string,
  deedId: string,
  priceCoins: number,
): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const deed = db.select().from(landDeeds).where(eq(landDeeds.id, deedId)).get();
  if (!deed) return { ok: false, error: ACTION_ERROR.deedMissing };
  if (deed.playerId !== player.id) {
    return { ok: false, error: ACTION_ERROR.deedNotYours };
  }
  if (!deed.mintTxStub) return { ok: false, error: ACTION_ERROR.deedNeedMint };
  if (deed.status === "listed") {
    return { ok: false, error: ACTION_ERROR.deedAlreadyListed };
  }
  if (!isValidDeedListPrice(priceCoins)) {
    return { ok: false, error: ACTION_ERROR.deedBadPrice };
  }
  db.update(landDeeds)
    .set({
      status: "listed",
      listPriceCoins: Math.floor(priceCoins),
    })
    .where(eq(landDeeds.id, deed.id))
    .run();
  return { ok: true };
}

/**
 * Removes a deed from the mock board.
 */
export function unlistDeed(userId: string, deedId: string): ActionResult {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const deed = db.select().from(landDeeds).where(eq(landDeeds.id, deedId)).get();
  if (!deed) return { ok: false, error: ACTION_ERROR.deedMissing };
  if (deed.playerId !== player.id) {
    return { ok: false, error: ACTION_ERROR.deedNotYours };
  }
  if (deed.status !== "listed") {
    return { ok: false, error: ACTION_ERROR.deedNotListed };
  }
  db.update(landDeeds)
    .set({ status: "held", listPriceCoins: null })
    .where(eq(landDeeds.id, deed.id))
    .run();
  return { ok: true };
}
