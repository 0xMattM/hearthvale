import {
  ACTION_ERROR,
  LAND_NFT,
  LAND_NFT_BIOMES,
  LAND_NFT_SIZES,
  realmToWei,
  sameEthAddress,
  type LandNftBiome,
  type LandNftDto,
  type LandNftSize,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import { lands, localLands, players, users } from "../../db/schema.js";
import type { ActionResult } from "../actions/farming.js";
import { creditcoinConfig } from "./config.js";
import { debitRealmWei } from "./coin-swap.js";
import { ensureNftHomestead } from "./nft-homestead.js";
import { readOnchainLand } from "./onchain.js";

/**
 * Ledger size for an owned LandNFT token (drives yard half-extent).
 *
 * Args:
 *   tokenId: `lands.nft_token_id` / `local_lands.id`.
 *
 * Returns:
 *   Size string, `"small"` if the token exists without a ledger row, or null when not an NFT plot.
 */
export function localLandSize(tokenId: string | null | undefined): string | null {
  if (!tokenId) return null;
  return (
    db.select().from(localLands).where(eq(localLands.id, tokenId)).get()?.size ??
    "small"
  );
}

function homesteadIdForToken(playerId: string, tokenId: string): string | null {
  return (
    db
      .select()
      .from(lands)
      .where(eq(lands.playerId, playerId))
      .all()
      .find((row) => row.nftTokenId === tokenId)?.id ?? null
  );
}

/**
 * Local-dev / cached land NFTs, including the playable homestead id.
 */
export function listLocalLands(playerId: string): LandNftDto[] {
  return db
    .select()
    .from(localLands)
    .where(eq(localLands.playerId, playerId))
    .all()
    .map((row) => ({
      tokenId: row.id,
      biome: row.biome,
      size: row.size,
      landId: homesteadIdForToken(playerId, row.id),
    }));
}

/**
 * Upserts a ledger NFT and provisions a player_land yard to work on.
 *
 * Args:
 *   playerId: Owner player row.
 *   land: Token id + biome/size from mint or chain scan.
 *
 * Returns:
 *   The stored DTO including `landId`.
 */
export function recordOwnedLand(
  playerId: string,
  land: { tokenId: string; biome: string; size: string },
): LandNftDto {
  const existing = db
    .select()
    .from(localLands)
    .where(eq(localLands.id, land.tokenId))
    .get();
  if (!existing) {
    db.insert(localLands)
      .values({
        id: land.tokenId,
        playerId,
        biome: land.biome,
        size: land.size,
        createdAt: Date.now(),
      })
      .run();
  } else if (existing.playerId !== playerId) {
    db.update(localLands)
      .set({ playerId, biome: land.biome, size: land.size })
      .where(eq(localLands.id, land.tokenId))
      .run();
  }
  const landId = ensureNftHomestead(playerId, land.tokenId);
  return {
    tokenId: land.tokenId,
    biome: land.biome,
    size: land.size,
    landId,
  };
}

/**
 * Records an on-chain mint after ownerOf + getLand succeed.
 *
 * Client biome/size/txHash are ignored when contracts are configured.
 * Without contracts, use mintLocalLand instead — this endpoint refuses.
 */
export async function confirmOnchainLand(
  userId: string,
  input: {
    tokenId?: string | null;
    biome: string;
    size: string;
    txHash?: string | null;
  },
): Promise<ActionResult & { land?: LandNftDto }> {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user?.walletAddress) {
    return { ok: false, error: ACTION_ERROR.walletNeedLink };
  }
  const cfg = creditcoinConfig();
  if (!cfg.contractsConfigured) {
    return { ok: false, error: ACTION_ERROR.landMintOnchain };
  }
  const tokenId = input.tokenId && /^\d+$/.test(input.tokenId) ? input.tokenId : null;
  if (!tokenId) return { ok: false, error: ACTION_ERROR.landMintOnchain };
  const onchain = await readOnchainLand(tokenId);
  if (!onchain || !sameEthAddress(onchain.owner, user.walletAddress)) {
    return { ok: false, error: ACTION_ERROR.landMintOnchain };
  }
  const land = recordOwnedLand(player.id, {
    tokenId,
    biome: onchain.biome,
    size: onchain.size,
  });
  return { ok: true, land };
}

/**
 * Buys a land parcel with REALM from the local ledger.
 */
export function mintLocalLand(
  userId: string,
  biome: LandNftBiome,
  size: LandNftSize,
): ActionResult & { land?: LandNftDto } {
  if (!LAND_NFT_BIOMES.includes(biome) || !LAND_NFT_SIZES.includes(size)) {
    return { ok: false, error: ACTION_ERROR.tokenListBadPrice };
  }
  const cfg = creditcoinConfig();
  if (cfg.mode !== "local_dev" || cfg.contractsConfigured) {
    return { ok: false, error: ACTION_ERROR.landMintOnchain };
  }
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user?.walletAddress) {
    return { ok: false, error: ACTION_ERROR.walletNeedLink };
  }
  const price = realmToWei(LAND_NFT.priceRealm[size]);
  if (!debitRealmWei(player.id, price)) {
    return { ok: false, error: ACTION_ERROR.notEnoughRealm };
  }
  const id = nanoid();
  db.insert(localLands)
    .values({
      id,
      playerId: player.id,
      biome,
      size,
      createdAt: Date.now(),
    })
    .run();
  const landId = ensureNftHomestead(player.id, id);
  return { ok: true, land: { tokenId: id, biome, size, landId } };
}
