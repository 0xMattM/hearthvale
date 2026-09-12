import { describe, expect, it } from "vitest";
import {
  HOUSING_DECOR,
  HOUSING_DECOR_WORLD_SOFT,
  housingDecorIdFromBuildingType,
  housingDecorWorldLabelParts,
} from "@game/shared";

/**
 * PL22.2 — Housing decor world label polish.
 * Choice: catalog name first + soft "Decor" secondary (PL2.1 hierarchy spirit);
 * coin costs unchanged; no HUD column.
 */
describe("CityLands PL22.2 housing decor world label polish", () => {
  it("leads with catalog name and soft Decor secondary (happy)", () => {
    const planter = housingDecorWorldLabelParts("planter");
    expect(planter.name).toBe(HOUSING_DECOR.planter.name);
    expect(planter.name).toBe("Flower Planter");
    expect(planter.soft).toBe(HOUSING_DECOR_WORLD_SOFT);
    expect(planter.soft).toBe("Decor");

    const banner = housingDecorWorldLabelParts("banner");
    expect(banner.name).toBe(HOUSING_DECOR.banner.name);
    expect(banner.name).toBe("Yard Banner");
    expect(banner.soft).toBe("Decor");
  });

  it("maps building types and keeps coin costs unchanged (edge)", () => {
    expect(housingDecorIdFromBuildingType("decor_planter")).toBe("planter");
    expect(housingDecorIdFromBuildingType("decor_banner")).toBe("banner");
    expect(HOUSING_DECOR.planter.coinCost).toBe(12);
    expect(HOUSING_DECOR.banner.coinCost).toBe(18);
    expect(HOUSING_DECOR.banner.coinCost).toBeGreaterThan(
      HOUSING_DECOR.planter.coinCost,
    );
    expect("damage" in HOUSING_DECOR.planter).toBe(false);
    expect("defense" in HOUSING_DECOR.banner).toBe(false);
  });

  it("rejects non-decor types and keeps name ahead of soft (failure)", () => {
    expect(housingDecorIdFromBuildingType("decor_pad")).toBeNull();
    expect(housingDecorIdFromBuildingType("crop_plot")).toBeNull();
    const parts = housingDecorWorldLabelParts("planter");
    expect(parts.name.toLowerCase()).not.toBe(parts.soft.toLowerCase());
    expect(parts.name.length).toBeGreaterThan(parts.soft.length);
  });
});
