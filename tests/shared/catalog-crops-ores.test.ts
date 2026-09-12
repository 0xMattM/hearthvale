import { describe, expect, it } from "vitest";
import {
  CROPS,
  ENERGY,
  FOOD_RESTORE,
  ORE_NODES,
  ORE_NODE,
  getCrop,
  getOreNode,
  getRecipe,
  isSeedItemId,
  oreChipInteractLabel,
  plantableSeedsFromInventory,
} from "@game/shared";

/**
 * Extra crops / ores / crafts — distinct waits, vendor prices, and recipe sinks.
 */
describe("expanded crops and ores catalog", () => {
  it("maps every crop seed and keeps wheat as the 3-minute staple (happy)", () => {
    expect(Object.keys(CROPS).sort()).toEqual([
      "corn",
      "cotton",
      "herb",
      "potato",
      "wheat",
    ]);
    expect(isSeedItemId("wheat_seed")).toBe(true);
    expect(isSeedItemId("corn_seed")).toBe(true);
    expect(isSeedItemId("wheat")).toBe(false);
    expect(getCrop("cotton")?.harvestItemId).toBe("cotton");
    expect(FOOD_RESTORE.cornbread).toBe(ENERGY.cornbreadRestore);
    expect(FOOD_RESTORE.roast_potato).toBe(ENERGY.roastPotatoRestore);
    expect(FOOD_RESTORE.cornbread).toBeGreaterThan(FOOD_RESTORE.bread);
    expect(FOOD_RESTORE.roast_potato).toBeGreaterThan(FOOD_RESTORE.cornbread);
  });

  it("lists plantable seeds from mixed inventory and skips empty qty (edge)", () => {
    const seeds = plantableSeedsFromInventory([
      { itemId: "wheat_seed", qty: 2 },
      { itemId: "corn_seed", qty: 1 },
      { itemId: "herb_seed", qty: 0 },
      { itemId: "wood", qty: 4 },
    ]);
    expect(seeds.map((s) => s.seedItemId)).toEqual(["wheat_seed", "corn_seed"]);
    expect(seeds[0]?.crop.growMs).toBe(CROPS.wheat.growMs);
    expect(plantableSeedsFromInventory([])).toEqual([]);
    expect(plantableSeedsFromInventory(null)).toEqual([]);
  });

  it("rejects unknown crop/ore kinds and unknown recipes (failure)", () => {
    expect(getCrop("golden_wheat")).toBeUndefined();
    expect(isSeedItemId("not_a_seed")).toBe(false);
    expect(getOreNode(null).yieldItemId).toBe(ORE_NODE.yieldItemId);
    expect(getOreNode("mythril").id).toBe("iron");
    expect(ORE_NODES.copper.cooldownMs).toBeLessThan(ORE_NODES.iron.cooldownMs);
    expect(ORE_NODES.gold.cooldownMs).toBeGreaterThan(ORE_NODES.iron.cooldownMs);
    expect(getRecipe("smelt_mythril")).toBeUndefined();
    expect(oreChipInteractLabel(undefined, undefined, "copper")).toBe(
      "Chip copper ore (Iron Hammer)",
    );
    expect(oreChipInteractLabel(undefined, undefined, "gold")).toBe(
      "Chip gold ore (Iron Hammer)",
    );
  });
});
