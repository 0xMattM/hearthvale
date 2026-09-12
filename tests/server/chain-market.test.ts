import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LAND_DEED, mirrorCoinsToChainWei } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-chain-mkt-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const {
  claimLandDeed,
  listDeedForSale,
  mintDeedStub,
} = await import("../../apps/server/src/game/deeds.ts");
const { getChainMarketplaceView } = await import(
  "../../apps/server/src/game/chainMarket.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

describe("chain marketplace view F15.4", () => {
  beforeAll(() => {
    migrateSqlite();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("shows catalog floor when no live listings (edge)", () => {
    const view = getChainMarketplaceView();
    expect(view.readOnly).toBe(true);
    expect(view.network).toBe("stub-testnet");
    expect(view.listings[0]!.source).toBe("catalog_floor");
    expect(view.listings[0]!.chainPriceWei).toBe(
      mirrorCoinsToChainWei(LAND_DEED.defaultListPrice),
    );
  });

  it("mirrors a live listed deed price (happy)", () => {
    const stamp = Date.now().toString(36);
    const reg = registerUser(`ch_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    const userId = userIdFromToken(reg.token)!;
    const playerId = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!.id;
    db.update(players)
      .set({ softCurrency: LAND_DEED.claimCostCoins + 20 })
      .where(eq(players.id, playerId))
      .run();
    const claim = claimLandDeed(userId);
    expect(claim.ok).toBe(true);
    const deedId = claim.deedId!;
    expect(mintDeedStub(userId, deedId).ok).toBe(true);
    expect(listDeedForSale(userId, deedId, 55).ok).toBe(true);

    const view = getChainMarketplaceView();
    const live = view.listings.find((l) => l.id === deedId);
    expect(live).toBeTruthy();
    expect(live!.source).toBe("live_listing");
    expect(live!.softPriceCoins).toBe(55);
    expect(live!.chainPriceWei).toBe(mirrorCoinsToChainWei(55));
  });

  it("never exposes a buy/action field (failure if gated)", () => {
    const view = getChainMarketplaceView();
    expect(view.readOnly).toBe(true);
    const keys = Object.keys(view.listings[0]!).sort();
    expect(keys).not.toContain("buyUrl");
    expect(keys).not.toContain("purchase");
    expect(view.disclaimer.toLowerCase()).toContain("not required");
  });
});
