import { describe, expect, it } from "vitest";
import {
  craftProfessionLabel,
  craftRecipeActionLabel,
  craftRecipeTileClassName,
  craftStationTitle,
  defaultSelectedCraftRecipeId,
} from "../../apps/web/lib/hud/craft-panel-chrome";

/**
 * Craft recipe-book chrome (icon tiles + workbench). Recipes/costs unchanged.
 */
describe("craft panel recipe-book chrome", () => {
  it("titles stations from the catalog and labels a ready Start (happy)", () => {
    expect(craftStationTitle("mill")).toBe("Mill");
    expect(craftStationTitle("workshop")).toBe("Carpenter Table");
    expect(craftStationTitle("alchemy_bench")).toBe("Alchemy Bench");
    expect(
      craftRecipeActionLabel({
        canCraft: true,
        yoursWorking: false,
        yoursReady: false,
        peerBusy: false,
      }),
    ).toBe("Start");
    expect(defaultSelectedCraftRecipeId(["mill_flour", "forge_hoe"], null)).toBe(
      "mill_flour",
    );
    expect(craftRecipeTileClassName("affordable", true)).toContain(
      "craft-panel__recipe--affordable",
    );
    expect(craftRecipeTileClassName("affordable", true)).toContain(
      "craft-panel__tile--selected",
    );
  });

  it("keeps selection, maps profession chips, and labels occupancy (edge)", () => {
    expect(
      defaultSelectedCraftRecipeId(["a", "b"], "b"),
    ).toBe("b");
    expect(craftProfessionLabel("animal_breeder")).toBe("animal breeder");
    expect(craftProfessionLabel("cook")).toBe("cook");
    expect(
      craftRecipeActionLabel({
        canCraft: true,
        yoursWorking: true,
        yoursReady: false,
        peerBusy: false,
      }),
    ).toBe("In progress");
    expect(
      craftRecipeActionLabel({
        canCraft: true,
        yoursWorking: false,
        yoursReady: true,
        peerBusy: false,
      }),
    ).toBe("In progress");
    expect(
      craftRecipeActionLabel({
        canCraft: true,
        yoursWorking: false,
        yoursReady: false,
        peerBusy: true,
      }),
    ).toBe("Busy");
    expect(craftRecipeTileClassName("short", false)).toContain(
      "craft-panel__recipe--short",
    );
    expect(craftRecipeTileClassName("xp_locked", false)).toContain(
      "craft-panel__recipe--xp_locked",
    );
  });

  it("refuses Start when gated and does not invent a free station title (failure)", () => {
    expect(
      craftRecipeActionLabel({
        canCraft: false,
        yoursWorking: false,
        yoursReady: false,
        peerBusy: false,
      }),
    ).toBe("Locked");
    expect(defaultSelectedCraftRecipeId([], "ghost")).toBeNull();
    expect(defaultSelectedCraftRecipeId([], null)).toBeNull();
    expect(craftStationTitle("forge")).not.toBe("forge");
    expect(craftRecipeTileClassName("xp_locked", true)).not.toContain(
      "craft-panel__recipe--affordable",
    );
  });
});
