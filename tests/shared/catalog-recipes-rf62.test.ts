import { describe, expect, it } from "vitest";
import { CROPS, ENERGY, RECIPES, type RecipeDefinition } from "@game/shared";

/**
 * RF6.2 — recipes/crops/energy live in catalog-recipes.ts and re-export via catalog.
 */
describe("catalog-recipes RF6.2", () => {
  it("exports mill flour and wheat crop (happy)", () => {
    const flour = RECIPES.find((r) => r.id === "mill_flour");
    expect(flour?.station).toBe("mill");
    expect(flour?.energyCost).toBe(ENERGY.costs.craft);
    expect(CROPS.wheat.growMs).toBe(3 * 60 * 1000);
  });

  it("every recipe has valid station and inputs (edge)", () => {
    const stations = new Set([
      "mill",
      "forge",
      "kitchen",
      "workshop",
      "loom",
      "alchemy_bench",
    ]);
    expect(RECIPES.length).toBeGreaterThanOrEqual(10);
    for (const recipe of RECIPES as RecipeDefinition[]) {
      expect(stations.has(recipe.station)).toBe(true);
      expect(recipe.inputs.length).toBeGreaterThan(0);
      expect(recipe.output.qty).toBeGreaterThan(0);
    }
  });

  it("rejects unknown recipe id (fail)", () => {
    expect(RECIPES.find((r) => r.id === "not_a_recipe")).toBeUndefined();
  });
});
