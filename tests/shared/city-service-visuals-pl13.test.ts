import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_SERVICE_BUILDING_TYPES,
  CITY_SERVICE_VISUAL_KITS,
  cityServiceVisualKit,
  isCityScarceStationType,
  isCityServiceBuildingType,
} from "@game/shared";

/**
 * PL1.3 — Market / vendor / notice read as services (awning / board / post).
 * Choice: shared kit SoT; meshes consume CITY_SERVICE_VISUAL_KITS; prompts unchanged.
 */
describe("CityLands PL1.3 city service visual kits", () => {
  it("assigns distinct kits to vendor / market / notice (happy)", () => {
    const kits = CITY_SERVICE_BUILDING_TYPES.map((t) => {
      const row = cityServiceVisualKit(t);
      expect(row).not.toBeNull();
      return row!.kit;
    });
    expect(kits).toEqual(["awning", "board", "post"]);
    expect(new Set(kits).size).toBe(3);

    expect(CITY_SERVICE_VISUAL_KITS.vendor_stall.kit).toBe("awning");
    expect(CITY_SERVICE_VISUAL_KITS.market_board.kit).toBe("board");
    expect(CITY_SERVICE_VISUAL_KITS.notice_board.kit).toBe("post");

    for (const type of CITY_SERVICE_BUILDING_TYPES) {
      expect(CITY_BUILDINGS.some((b) => b.type === type)).toBe(true);
      expect(isCityScarceStationType(type)).toBe(false);
      expect(isCityServiceBuildingType(type)).toBe(true);
    }
  });

  it("keeps walk-up prompt meaning labels for services (edge)", () => {
    // World labels are short wayfinding; interact prompts stay action-first elsewhere.
    expect(CITY_SERVICE_VISUAL_KITS.vendor_stall.worldLabel).toMatch(/vendor/i);
    expect(CITY_SERVICE_VISUAL_KITS.market_board.worldLabel).toMatch(/market/i);
    expect(CITY_SERVICE_VISUAL_KITS.notice_board.worldLabel).toMatch(/notice/i);

    const serviceCount = CITY_BUILDINGS.filter((b) =>
      isCityServiceBuildingType(b.type),
    ).length;
    expect(serviceCount).toBeGreaterThanOrEqual(3);
  });

  it("rejects scarce / unknown types as service kits (failure)", () => {
    expect(cityServiceVisualKit("workshop")).toBeNull();
    expect(cityServiceVisualKit("kitchen")).toBeNull();
    expect(cityServiceVisualKit("tutorial_npc")).toBeNull();
    expect(cityServiceVisualKit("")).toBeNull();
    expect(isCityServiceBuildingType("forge")).toBe(false);
    expect(isCityServiceBuildingType("vendor_stall")).toBe(true);
  });
});
