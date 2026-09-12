import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  canPlayWithoutWallet,
  stubWalletAddress,
  walletNeverGatesCombat,
} from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-wallet-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;
process.env.GAME_CREDITCOIN_MODE = "local_dev";

const { migrateSqlite } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { connectWalletStub, disconnectWalletStub, isStubWalletMode } = await import(
  "../../apps/server/src/game/wallet.ts"
);
const { getPlayerState } = await import("../../apps/server/src/game/player.ts");

describe("wallet connect stub F15.1", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`wal_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("links a stub wallet without changing combat (happy)", () => {
    const before = getPlayerState(userId)!;
    expect(before.walletAddress).toBeNull();
    expect(canPlayWithoutWallet(before.walletAddress)).toBe(true);

    const linked = connectWalletStub(userId);
    expect(linked.ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.walletAddress).toBe(stubWalletAddress(userId));
    expect(
      walletNeverGatesCombat(
        {
          health: before.health,
          maxHealth: before.maxHealth,
          damage: before.damage,
          defense: before.defense,
          energy: before.energy,
          maxEnergy: before.maxEnergy,
        },
        {
          health: after.health,
          maxHealth: after.maxHealth,
          damage: after.damage,
          defense: after.defense,
          energy: after.energy,
          maxEnergy: after.maxEnergy,
        },
      ),
    ).toBe(true);
  });

  it("allows disconnect and play without wallet (edge)", () => {
    expect(disconnectWalletStub(userId).ok).toBe(true);
    const state = getPlayerState(userId)!;
    expect(state.walletAddress).toBeNull();
    expect(canPlayWithoutWallet(null)).toBe(true);
    expect(state.energy).toBeGreaterThan(0);
  });

  it("rejects double-connect and disconnect when empty (failure)", () => {
    expect(disconnectWalletStub(userId).ok).toBe(false);
    expect(connectWalletStub(userId).ok).toBe(true);
    const again = connectWalletStub(userId);
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.walletAlreadyLinked);
  });

  it("refuses the stub wallet when Creditcoin mode is attestcoin (SEC-3)", () => {
    expect(isStubWalletMode("local_dev")).toBe(true);
    expect(isStubWalletMode("attestcoin")).toBe(false);
  });
});
