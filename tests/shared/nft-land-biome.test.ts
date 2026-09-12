import { describe, expect, it } from "vitest";
import {
  isNftLandBiomeSlot,
  nftLandBiomeBuildings,
  playerLandGridHalfExtent,
  canPickupHomesteadBuilding,
} from "@game/shared";

/**
 * Creditcoin NFT plots spawn biome gather nodes; unknown biomes stay empty.
 */
describe("NFT land biome nodes", () => {
  it("gives forest trees, mountain ore, and fertile plots (happy)", () => {
    const forest = nftLandBiomeBuildings("forest", "small");
    const mountain = nftLandBiomeBuildings("mountain", "small");
    const fertile = nftLandBiomeBuildings("fertile", "small");
    expect(forest.length).toBeGreaterThanOrEqual(4);
    expect(forest.every((n) => n.type === "tree_stump")).toBe(true);
    expect(mountain.length).toBeGreaterThanOrEqual(4);
    expect(mountain.every((n) => n.type === "ore_node")).toBe(true);
    expect(mountain.some((n) => n.cropId === "iron")).toBe(true);
    expect(fertile.length).toBeGreaterThanOrEqual(4);
    expect(fertile.every((n) => n.type === "crop_plot")).toBe(true);
    expect(forest.some((n) => n.type === "ore_node")).toBe(false);
  });

  it("adds extra nodes on medium and large plots (edge)", () => {
    const smallForest = nftLandBiomeBuildings("forest", "small");
    const mediumForest = nftLandBiomeBuildings("forest", "medium");
    const largeForest = nftLandBiomeBuildings("forest", "large");
    expect(mediumForest.length).toBeGreaterThan(smallForest.length);
    expect(largeForest.length).toBeGreaterThan(mediumForest.length);
    const lim = playerLandGridHalfExtent("small");
    expect(
      smallForest.every((n) => Math.abs(n.x) <= lim && Math.abs(n.z) <= lim),
    ).toBe(true);
    expect(isNftLandBiomeSlot(800)).toBe(true);
    expect(isNftLandBiomeSlot(13)).toBe(false);
    expect(canPickupHomesteadBuilding("tree_stump", 100)).toBe(true);
    expect(canPickupHomesteadBuilding("tree_stump", 800)).toBe(false);
    expect(canPickupHomesteadBuilding("kitchen", 101)).toBe(true);
  });

  it("returns nothing for unknown biome (failure)", () => {
    expect(nftLandBiomeBuildings("bog", "small")).toEqual([]);
    expect(nftLandBiomeBuildings(null, "small")).toEqual([]);
    expect(nftLandBiomeBuildings("forest", "tiny").every((n) => n.minSize === "small")).toBe(
      true,
    );
    expect(canPickupHomesteadBuilding("tree_stump", 800)).toBe(false);
    expect(canPickupHomesteadBuilding("build_board", 0)).toBe(false);
    expect(canPickupHomesteadBuilding("ore_node", 801)).toBe(false);
    expect(isNftLandBiomeSlot(Number.NaN)).toBe(false);
  });
});
