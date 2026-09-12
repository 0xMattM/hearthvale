import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { players, tokenItemListings, users } from "../../db/schema.js";
import { creditcoinConfig } from "./config.js";
import {
  readOnchainListingIdByGameId,
  verifyOnchainItemAttach,
} from "./onchain.js";

/**
 * Binds escrowed in-game rows to an already-mined ItemListed, if the chain matches.
 *
 * Recovers listings whose Creditcoin tx confirmed but MetaMask never returned
 * the listing id (HUD stays ESCROWED and Buy is blocked).
 */
export async function reconcileEscrowedTokenListings(): Promise<void> {
  const cfg = creditcoinConfig();
  if (!cfg.contractsConfigured) return;
  const rows = db
    .select()
    .from(tokenItemListings)
    .all()
    .filter((row) => row.status === "escrowed");
  for (const row of rows) {
    const seller = db
      .select()
      .from(players)
      .where(eq(players.id, row.sellerPlayerId))
      .get();
    if (!seller) continue;
    const sellerUser = db
      .select()
      .from(users)
      .where(eq(users.id, seller.userId))
      .get();
    if (!sellerUser?.walletAddress) continue;
    const onchainListingId = await readOnchainListingIdByGameId(row.id);
    if (!onchainListingId) continue;
    const matches = await verifyOnchainItemAttach(
      onchainListingId,
      row.id,
      sellerUser.walletAddress,
    );
    if (!matches) continue;
    db.update(tokenItemListings)
      .set({ status: "listed", onchainListingId })
      .where(eq(tokenItemListings.id, row.id))
      .run();
  }
}
