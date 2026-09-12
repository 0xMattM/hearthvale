import { describe, expect, it } from "vitest";
import {
  focusedEnergyCost,
  focusedHarvestBonus,
  getRecipe,
  meetsRecipeXpGate,
} from "@game/shared";

describe("specialization pressure P0.2", () => {
  it("taxes dabbling when the other profession is far ahead", () => {
    expect(focusedEnergyCost(10, "farmer", 0, 30)).toBe(15);
  });

  it("discounts specialists", () => {
    expect(focusedEnergyCost(10, "farmer", 40, 10)).toBe(8);
  });

  it("gates fine hoe behind blacksmith XP 50", () => {
    const recipe = getRecipe("forge_iron_hoe_fine");
    expect(recipe).toBeDefined();
    expect(meetsRecipeXpGate(recipe!, 100, 40)).toBe(false);
    expect(meetsRecipeXpGate(recipe!, 0, 50)).toBe(true);
  });

  it("adds harvest bonus only for focused farmers", () => {
    expect(focusedHarvestBonus(30, 10)).toBe(1);
    expect(focusedHarvestBonus(30, 20)).toBe(0);
    expect(focusedHarvestBonus(20, 5)).toBe(0);
  });
});
