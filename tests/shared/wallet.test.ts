import { describe, expect, it } from "vitest";
import {
  canPlayWithoutWallet,
  shortenWalletAddress,
  stubWalletAddress,
  walletNeverGatesCombat,
  WALLET,
} from "../../packages/shared/src/wallet";

describe("wallet shared helpers F15.1", () => {
  it("builds a stable stub address (happy)", () => {
    const a = stubWalletAddress("user-1");
    const b = stubWalletAddress("user-1");
    expect(a).toBe(b);
    expect(a.startsWith(WALLET.stubPrefix)).toBe(true);
    expect(a.length).toBe(42);
    expect(shortenWalletAddress(a)).toMatch(/^0xstub/);
    expect(shortenWalletAddress(a)).toContain("…");
  });

  it("always allows play without a wallet (edge)", () => {
    expect(canPlayWithoutWallet(null)).toBe(true);
    expect(canPlayWithoutWallet(undefined)).toBe(true);
    expect(canPlayWithoutWallet(stubWalletAddress("x"))).toBe(true);
  });

  it("detects combat drift if wallet ever gated power (failure)", () => {
    const base = {
      health: 100,
      maxHealth: 100,
      damage: 10,
      defense: 5,
      energy: 80,
      maxEnergy: 100,
    };
    expect(walletNeverGatesCombat(base, { ...base })).toBe(true);
    expect(walletNeverGatesCombat(base, { ...base, damage: 99 })).toBe(false);
    expect(shortenWalletAddress("0xab")).toBeNull();
  });
});
