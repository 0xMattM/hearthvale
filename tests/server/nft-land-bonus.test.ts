import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { NFT_LAND_BONUS } from "@game/shared";

describe("NFT land bonus", () => {
  const fakeAddr = "0x" + "a".repeat(40);

  beforeEach(() => {
    process.env.CREDITCOIN_REALM_TOKEN = fakeAddr;
    process.env.CREDITCOIN_LAND_NFT = fakeAddr;
    process.env.CREDITCOIN_MARKETPLACE = fakeAddr;
  });

  afterEach(() => {
    delete process.env.CREDITCOIN_REALM_TOKEN;
    delete process.env.CREDITCOIN_LAND_NFT;
    delete process.env.CREDITCOIN_MARKETPLACE;
  });

  it("multiplier is between 0.5 and 1.0 (faster, not slower or extreme)", () => {
    expect(NFT_LAND_BONUS.cropGrowSpeedMultiplier).toBeGreaterThan(0.5);
    expect(NFT_LAND_BONUS.cropGrowSpeedMultiplier).toBeLessThan(1.0);
  });

  it("has a human-readable label", () => {
    expect(NFT_LAND_BONUS.label).toContain("NFT Land");
    expect(NFT_LAND_BONUS.label.length).toBeGreaterThan(5);
  });

  it("reduces grow time correctly when applied", () => {
    const baseGrowMs = 60_000;
    const boosted = Math.round(baseGrowMs * NFT_LAND_BONUS.cropGrowSpeedMultiplier);
    expect(boosted).toBeLessThan(baseGrowMs);
    expect(boosted).toBe(51_000);
  });
});
