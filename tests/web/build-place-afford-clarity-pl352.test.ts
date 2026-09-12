import { describe, expect, it } from "vitest";
import {
  BUILDER_PLACE_XP,
  ENERGY,
  PLAYER_LAND_STATIONS,
} from "@game/shared";
import {
  buildPlaceAffordMode,
  buildPlaceShortFundsHint,
  buildPlaceShortfall,
} from "../../apps/web/lib/hud/build-afford";

/**
 * PL35.2 — kit craft afford clarity (place is free; mats/XP are craft gates).
 * Homestead editor: place spends kit only; this helper still validates craft costs.
 */
describe("CityLands PL35.2 build place afford clarity", () => {
  const crop = PLAYER_LAND_STATIONS.crop_plot;
  const forge = PLAYER_LAND_STATIONS.forge;

  function qty(map: Record<string, number>) {
    return (itemId: string) => map[itemId] ?? 0;
  }

  it("hides short hint when mats + energy cover kit craft (happy)", () => {
    const input = {
      stationType: "crop_plot" as const,
      softCurrency: 0,
      energy: crop.energyCost,
      builderXp: 0,
      inventoryQty: qty({ wood: 2 }),
    };
    expect(buildPlaceAffordMode(input)).toBe("affordable");
    expect(buildPlaceShortFundsHint(input)).toBeNull();
    expect(buildPlaceShortfall(input)).toBeNull();
  });

  it("shows Need … for mats, energy, or builder XP (edge)", () => {
    expect(
      buildPlaceShortFundsHint({
        stationType: "crop_plot",
        softCurrency: 0,
        energy: 99,
        builderXp: 0,
        inventoryQty: qty({ wood: 0 }),
      }),
    ).toBe("Need 2× Wood");

    expect(
      buildPlaceShortFundsHint({
        stationType: "crop_plot",
        softCurrency: 0,
        energy: crop.energyCost - 1,
        builderXp: 0,
        inventoryQty: qty({ wood: 2 }),
      }),
    ).toBe(`Need ${crop.energyCost} energy`);

    expect(
      buildPlaceShortfall({
        stationType: "forge",
        softCurrency: 999,
        energy: 99,
        builderXp: 0,
        inventoryQty: qty({ iron_bar: 9, wood: 9 }),
      }),
    ).toEqual({ kind: "xp", need: BUILDER_PLACE_XP });
    expect(
      buildPlaceShortFundsHint({
        stationType: "forge",
        softCurrency: 999,
        energy: 99,
        builderXp: 0,
        inventoryQty: qty({ iron_bar: 9, wood: 9 }),
      }),
    ).toBe(`Need ${BUILDER_PLACE_XP} builder XP`);
    expect(
      buildPlaceAffordMode({
        stationType: "forge",
        softCurrency: 0,
        energy: forge.energyCost,
        builderXp: BUILDER_PLACE_XP,
        inventoryQty: qty({ iron_bar: 2, wood: 2 }),
      }),
    ).toBe("affordable");
  });

  it("place is free; kits carry former mat costs (failure)", () => {
    expect(crop.coinCost).toBe(0);
    expect(crop.kitItemId).toBe("crop_plot_kit");
    expect(crop.energyCost).toBe(ENERGY.costs.build);
    expect(crop.materials).toEqual([{ itemId: "wood", qty: 2 }]);
    expect(forge.coinCost).toBe(0);
    expect(forge.kitItemId).toBe("forge_kit");
    expect(forge.minBuilderXp).toBe(BUILDER_PLACE_XP);
    expect(
      buildPlaceAffordMode({
        stationType: "crop_plot",
        softCurrency: 0,
        energy: 0,
        builderXp: 0,
        inventoryQty: qty({}),
      }),
    ).toBe("short");
    expect(
      buildPlaceShortFundsHint({
        stationType: "crop_plot",
        softCurrency: 0,
        energy: 0,
        builderXp: 0,
        inventoryQty: qty({}),
      }),
    ).toBe("Need 2× Wood");
    expect(PLAYER_LAND_STATIONS.crop_plot).toBeDefined();
    expect(Object.keys(PLAYER_LAND_STATIONS).length).toBeGreaterThan(3);
  });
});
