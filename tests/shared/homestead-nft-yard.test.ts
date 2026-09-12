import { describe, expect, it } from "vitest";
import {
  HOMESTEAD_YARD,
  homesteadGateWorldZ,
  homesteadYardHalf,
  isPlayerLandPlaceCell,
  playerLandGridHalfExtent,
} from "@game/shared";

/**
 * Creditcoin NFT plots are larger than the free starter homestead.
 */
describe("homestead NFT yard size", () => {
  it("makes NFT small larger than the common land (happy)", () => {
    expect(homesteadYardHalf()).toBe(HOMESTEAD_YARD.starterHalf);
    expect(homesteadYardHalf("small")).toBe(HOMESTEAD_YARD.nftSmallHalf);
    expect(homesteadYardHalf("small")).toBeGreaterThan(homesteadYardHalf());
    expect(homesteadGateWorldZ("small")).toBeGreaterThan(homesteadGateWorldZ());
    expect(playerLandGridHalfExtent("small")).toBeGreaterThan(
      playerLandGridHalfExtent(),
    );
  });

  it("scales medium and large past small (edge)", () => {
    expect(homesteadYardHalf("medium")).toBeGreaterThan(
      homesteadYardHalf("small"),
    );
    expect(homesteadYardHalf("large")).toBeGreaterThan(
      homesteadYardHalf("medium"),
    );
    expect(isPlayerLandPlaceCell(5, 0, "small")).toBe(true);
  });

  it("keeps unknown size on the starter yard (failure)", () => {
    expect(homesteadYardHalf("tiny")).toBe(HOMESTEAD_YARD.starterHalf);
    expect(homesteadYardHalf(null)).toBe(HOMESTEAD_YARD.starterHalf);
    expect(isPlayerLandPlaceCell(5, 0)).toBe(false);
    expect(isPlayerLandPlaceCell(5, 0, "bogus")).toBe(false);
  });
});
