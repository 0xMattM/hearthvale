import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  LAND_DEED,
  WORLD,
  combatUnaffectedByChainOp,
  canEngageCombatWithoutChain,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-chain-inv-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;
process.env.GAME_CREDITCOIN_MODE = "local_dev";

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { connectWalletStub } = await import(
  "../../apps/server/src/game/wallet.ts"
);
const {
  claimLandDeed,
  listDeedForSale,
  mintDeedStub,
} = await import("../../apps/server/src/game/deeds.ts");
const { getPlayerState, ensureStarterYardBuildings } = await import("../../apps/server/src/game/player.ts");
const { travelToLandKind } = await import("../../apps/server/src/game/land.ts");
const { guardCombatIndependentOfChain } = await import(
  "../../apps/server/src/game/chain-combat-guard.ts"
);
const { getChainMarketplaceView } = await import(
  "../../apps/server/src/game/chainMarket.ts"
);
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function snap(userId: string) {
  const s = getPlayerState(userId)!;
  return {
    health: s.health,
    maxHealth: s.maxHealth,
    damage: s.damage,
    defense: s.defense,
    energy: s.energy,
    maxEnergy: s.maxEnergy,
  };
}

/** Converts building grid cell to world position for proximity checks. */
function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("chain never gates combat F15.5", () => {
  let plainUserId = "";
  let chainUserId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`plain_${stamp}`, "password123");
    const b = registerUser(`chain_${stamp}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    plainUserId = userIdFromToken(a.token)!;
    chainUserId = userIdFromToken(b.token)!;
    ensureStarterYardBuildings(getPlayerState(plainUserId)!.landId);

    const chainPlayer = db
      .select()
      .from(players)
      .where(eq(players.userId, chainUserId))
      .get()!;
    db.update(players)
      .set({ softCurrency: LAND_DEED.claimCostCoins + 100 })
      .where(eq(players.id, chainPlayer.id))
      .run();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("wallet→deed→mint→list→market leave combat unchanged (happy)", () => {
    const before = snap(chainUserId);
    const beforeGuard = guardCombatIndependentOfChain(chainUserId);
    expect(connectWalletStub(chainUserId).ok).toBe(true);
    const claim = claimLandDeed(chainUserId);
    expect(claim.ok).toBe(true);
    const deedId = claim.deedId!;
    expect(mintDeedStub(chainUserId, deedId).ok).toBe(true);
    expect(listDeedForSale(chainUserId, deedId, 25).ok).toBe(true);
    expect(getChainMarketplaceView().listings.length).toBeGreaterThan(0);

    const after = snap(chainUserId);
    expect(combatUnaffectedByChainOp(before, after)).toBe(true);
    expect(guardCombatIndependentOfChain(chainUserId)).toEqual(beforeGuard);
    expect(canEngageCombatWithoutChain({ walletAddress: null })).toBe(true);
  });

  it("wallet-less player matches deeded combat and can hunt (edge)", () => {
    const plain = snap(plainUserId);
    const chained = snap(chainUserId);
    expect(plain.damage).toBe(chained.damage);
    expect(plain.defense).toBe(chained.defense);
    expect(plain.maxHealth).toBe(chained.maxHealth);
    expect(plain.maxEnergy).toBe(chained.maxEnergy);
    expect(getPlayerState(plainUserId)!.walletAddress).toBeNull();

    // Hunt loop lives on Exploration (CL4.2).
    expect(travelToLandKind(plainUserId, "explore").ok).toBe(true);
    const state = getPlayerState(plainUserId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail");
    expect(trail).toBeTruthy();
    const hunt = huntTrail(plainUserId, trail!.id, buildingPos(trail!));
    expect(hunt.ok).toBe(true);
  });

  it("detects if combat were illegally boosted (failure)", () => {
    const base = snap(plainUserId);
    expect(
      combatUnaffectedByChainOp(base, { ...base, maxEnergy: base.maxEnergy + 50 }),
    ).toBe(false);
  });
});
