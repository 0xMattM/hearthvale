import { describe, expect, it } from "vitest";
import {
  CHAIN_COMBAT_INVARIANT,
  assertCombatPowerIndependentOfChain,
  canEngageCombatWithoutChain,
  combatUnaffectedByChainOp,
} from "@game/shared";

const base = {
  health: 100,
  maxHealth: 100,
  damage: 10,
  defense: 5,
  energy: 80,
  maxEnergy: 100,
};

describe("chain combat invariant F15.5", () => {
  it("ignores rich chain hints (happy)", () => {
    const out = assertCombatPowerIndependentOfChain({
      combat: base,
      chainHints: {
        walletAddress: "0xstubdeadbeef",
        deedCount: 99,
        listedDeedCount: 50,
        mintTxStub: "0xmint",
        listPriceCoins: 1_000_000,
        chainPriceWei: "999999999999999999",
        realmBalance: "1000000000000000000",
        landNftCount: 4,
      },
    });
    expect(out).toEqual(base);
    expect(canEngageCombatWithoutChain({ walletAddress: null })).toBe(true);
    expect(CHAIN_COMBAT_INVARIANT.forbiddenGates).toContain("walletAddress");
    expect(CHAIN_COMBAT_INVARIANT.forbiddenGates).toContain("realmBalance");
    expect(CHAIN_COMBAT_INVARIANT.forbiddenGates).toContain("landNftCount");
  });

  it("treats empty and full hints the same (edge)", () => {
    const a = assertCombatPowerIndependentOfChain({ combat: base });
    const b = assertCombatPowerIndependentOfChain({
      combat: base,
      chainHints: { walletAddress: "0x", deedCount: 1 },
    });
    expect(combatUnaffectedByChainOp(a, b)).toBe(true);
  });

  it("detects combat drift after a fake boost (failure)", () => {
    expect(
      combatUnaffectedByChainOp(base, { ...base, damage: base.damage + 1 }),
    ).toBe(false);
  });
});
