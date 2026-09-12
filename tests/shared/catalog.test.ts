import { describe, expect, it } from "vitest";
import {
  BUILDING_UPGRADES,
  CITY_LAND,
  CROPS,
  ENERGY,
  FOREST_BUILDINGS,
  FOREST_LAND,
  getCropBySeed,
  getRecipe,
  getVendorPrices,
  HOUSING_DECOR,
  ITEMS,
  LAND_DESTINATIONS,
  MARKET,
  marketListingExpiresAt,
  RECIPES,
  SOFT_CURRENCY,
  STARTER_BUILDINGS,
  STARTER_LAND,
  stationCraftEnergy,
  stationCraftOutputBonus,
  TRAVEL,
  WARRIOR_BUILDINGS,
  WARRIOR_LAND,
} from "@game/shared";

describe("MVP content lock", () => {
  it("keeps craftable SKUs within the CityLands catalog cap", () => {
    // CityLands expanded past original MVP ≤15/≤20 (+ cloth_bandage CL29.2, wood_crate CL36.1).
    expect(Object.keys(ITEMS).filter((id) => !id.endsWith("_kit")).length).toBeLessThanOrEqual(50);
  });

  it("uses coins as soft currency, not an inventory item", () => {
    expect(SOFT_CURRENCY.id).toBe("coins");
    expect(ITEMS).not.toHaveProperty("copper");
    expect(ITEMS).not.toHaveProperty("coins");
  });

  it("locks wheat grow time to three minutes", () => {
    expect(CROPS.wheat.growMs).toBe(3 * 60 * 1000);
  });

  it("defines extra crops and ores with distinct waits", () => {
    expect(CROPS.corn.growMs).toBe(2 * 60 * 1000);
    expect(CROPS.potato.growMs).toBe(4 * 60 * 1000);
    expect(CROPS.cotton.growMs).toBe(5 * 60 * 1000);
    expect(CROPS.herb.growMs).toBe(6 * 60 * 1000);
    expect(getCropBySeed("herb_seed")?.harvestItemId).toBe("herb");
    expect(getRecipe("mill_cornmeal")?.output.itemId).toBe("cornmeal");
    expect(getRecipe("smelt_copper_bar")?.output.itemId).toBe("copper_bar");
    expect(getRecipe("smelt_gold_bar")?.output.itemId).toBe("gold_bar");
    expect(getVendorPrices("player_land").sell.corn).toBe(1);
    expect(getVendorPrices("player_land").sell.herb).toBe(5);
    expect(getVendorPrices("player_land").sell.gold_ore).toBe(8);
    expect(getVendorPrices("explore").sell.copper_ore).toBeGreaterThan(
      getVendorPrices("player_land").sell.copper_ore!,
    );
  });

  it("requires stations on recipes", () => {
    for (const recipe of RECIPES) {
      expect([
        "mill",
        "forge",
        "kitchen",
        "workshop",
        "loom",
        "alchemy_bench",
      ]).toContain(recipe.station);
      const isKit = recipe.output.itemId.endsWith("_kit");
      expect(recipe.energyCost).toBe(
        isKit ? ENERGY.costs.build : ENERGY.costs.craft,
      );
    }
  });

  it("resolves wheat from seed and iron bar smelt recipe", () => {
    expect(getCropBySeed("wheat_seed")?.harvestItemId).toBe("wheat");
    expect(getRecipe("smelt_iron_bar")?.output.itemId).toBe("iron_bar");
  });

  it("defines starter land build capacity", () => {
    expect(STARTER_LAND.buildSlots).toBe(8);
    // CityLands CL3.1 — free land starts with zero production plots.
    expect(STARTER_LAND.cropPlotCount).toBe(0);
  });

  it("defines a shared starter yard layout", () => {
    expect(STARTER_BUILDINGS.filter((b) => b.type === "crop_plot")).toHaveLength(4);
    expect(STARTER_BUILDINGS.some((b) => b.type === "mill")).toBe(true);
    expect(STARTER_BUILDINGS.some((b) => b.type === "forge")).toBe(true);
    expect(STARTER_BUILDINGS.some((b) => b.type === "vendor_stall")).toBe(true);
    expect(STARTER_BUILDINGS.some((b) => b.type === "ore_node")).toBe(true);
    expect(STARTER_BUILDINGS.some((b) => b.type === "kitchen")).toBe(true);
    // Hunt nodes moved to Exploration (CL4.2) — not on homestead seed.
    expect(STARTER_BUILDINGS.some((b) => b.type === "game_trail")).toBe(false);
    expect(STARTER_BUILDINGS.some((b) => b.type === "edge_thicket")).toBe(false);
    expect(STARTER_BUILDINGS.some((b) => b.type === "tree_stump")).toBe(true);
    expect(STARTER_BUILDINGS.some((b) => b.type === "workshop")).toBe(true);
  });

  it("wires boar tusk into a forge recipe (F9.3)", () => {
    const recipe = getRecipe("forge_hoe_tusk_grip");
    expect(recipe?.inputs.some((i) => i.itemId === "boar_tusk")).toBe(true);
    expect(ITEMS.boar_tusk.name).toBe("Boar Tusk");
  });

  it("defines carpenter wood chain (F10.2)", () => {
    expect(ITEMS.wood.name).toBe("Wood");
    expect(ITEMS.plank.name).toBe("Plank");
    expect(ITEMS.wood_crate.name).toBe("Wood Crate");
    expect(getRecipe("saw_planks")?.station).toBe("workshop");
    expect(getRecipe("craft_wooden_hoe")?.profession).toBe("carpenter");
    expect(getRecipe("assemble_wood_crate")?.profession).toBe("carpenter");
    expect(getRecipe("assemble_wood_crate")?.inputs).toEqual([
      { itemId: "plank", qty: 2 },
    ]);
  });

  it("defines longer food chain tiers (F10.3)", () => {
    expect(ITEMS.stew.name).toBe("Hearty Stew");
    expect(ITEMS.travel_ration.name).toBe("Travel Ration");
    expect(ENERGY.stewRestore).toBeGreaterThan(ENERGY.cookedMeatRestore);
    expect(ENERGY.rationRestore).toBeGreaterThan(ENERGY.stewRestore);
    expect(getRecipe("cook_stew")?.inputs.map((i) => i.itemId).sort()).toEqual([
      "flour",
      "raw_meat",
    ]);
    expect(getRecipe("pack_travel_ration")?.station).toBe("kitchen");
  });

  it("defines mill/forge T2 upgrades (F10.4)", () => {
    expect(BUILDING_UPGRADES.mill.toTier).toBe(2);
    expect(BUILDING_UPGRADES.forge.coinCost).toBe(60);
    expect(stationCraftEnergy(10, 2)).toBe(8);
    expect(stationCraftOutputBonus(2, true)).toBe(1);
    expect(stationCraftOutputBonus(1, true)).toBe(0);
  });

  it("defines exploration map template (CL4.1 / legacy F11.1)", () => {
    expect(LAND_DESTINATIONS.some((d) => d.kind === "explore")).toBe(true);
    expect(FOREST_BUILDINGS.some((b) => b.type === "portal")).toBe(false);
    expect(STARTER_BUILDINGS.some((b) => b.type === "portal")).toBe(true);
    expect(FOREST_BUILDINGS.some((b) => b.type === "mill")).toBe(false);
    expect(
      FOREST_BUILDINGS.filter((b) => b.type === "tree_stump").length,
    ).toBeGreaterThanOrEqual(4);
    expect(
      FOREST_BUILDINGS.filter((b) => b.type === "ore_node").length,
    ).toBeGreaterThanOrEqual(4);
    expect(FOREST_BUILDINGS.some((b) => b.type === "game_trail")).toBe(true);
    expect(FOREST_BUILDINGS.some((b) => b.type === "edge_thicket")).toBe(true);
    expect(FOREST_BUILDINGS.some((b) => b.type === "crop_plot")).toBe(false);
  });

  it("keeps legacy caravan constants; CityLands travel is free (CL1.2)", () => {
    expect(TRAVEL.durationMs).toBeGreaterThan(10_000);
    expect(TRAVEL.coinCost).toBe(15);
    expect(TRAVEL.rationItemId).toBe("travel_ration");
    expect(LAND_DESTINATIONS).toHaveLength(4);
  });

  it("varies vendor prices by region (F11.3)", () => {
    expect(getVendorPrices("explore").sell.wood).toBeGreaterThan(
      getVendorPrices("player_land").sell.wood!,
    );
    expect(getVendorPrices("explore").buy.wheat_seed).toBeGreaterThan(
      getVendorPrices("player_land").buy.wheat_seed!,
    );
    expect(FOREST_BUILDINGS.some((b) => b.type === "vendor_stall")).toBe(false);
  });

  it("documents CityLands four map kinds + city/warrior stubs (CL1.1–CL1.2)", () => {
    expect(LAND_DESTINATIONS.map((d) => d.kind)).toEqual([
      "city",
      "player_land",
      "explore",
      "warrior",
    ]);
    expect(STARTER_LAND.kind).toBe("player_land");
    expect(FOREST_LAND.kind).toBe("explore");
    expect(CITY_LAND.kind).toBe("city");
    expect(WARRIOR_LAND.kind).toBe("warrior");
    expect(WARRIOR_BUILDINGS.some((b) => b.type === "arena_board")).toBe(true);
    expect(WARRIOR_BUILDINGS.some((b) => b.type === "arena_dummy")).toBe(true);
    expect(WARRIOR_BUILDINGS.some((b) => b.type === "portal")).toBe(true);
    expect(WARRIOR_BUILDINGS).toHaveLength(WARRIOR_LAND.buildSlots);
  });

  it("defines market fee and TTL (F11.4)", () => {
    expect(MARKET.listFeeCoins).toBe(2);
    expect(MARKET.listingTtlMs).toBe(10 * 60 * 1000);
    expect(marketListingExpiresAt(1000)).toBe(1000 + MARKET.listingTtlMs);
  });

  it("defines cosmetic housing decor (F11.5)", () => {
    expect(HOUSING_DECOR.planter.coinCost).toBe(12);
    expect(HOUSING_DECOR.banner.buildingType).toBe("decor_banner");
    expect(
      STARTER_BUILDINGS.filter((b) => b.type === "decor_pad"),
    ).toHaveLength(2);
  });
});
