import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_LAND,
  EXPLORE_BUILDINGS,
  EXPLORE_LAND,
  STARTER_BUILDINGS,
  WARRIOR_BUILDINGS,
} from "@game/shared";

/**
 * City and Explore travel with N / Travel panel — no world portal mesh.
 */
describe("city and explore drop world portals", () => {
  it("keeps city and explore templates portal-free (happy)", () => {
    expect(CITY_BUILDINGS.some((b) => b.type === "portal")).toBe(false);
    expect(EXPLORE_BUILDINGS.some((b) => b.type === "portal")).toBe(false);
    expect(CITY_BUILDINGS.length).toBe(CITY_LAND.buildSlots);
    expect(EXPLORE_BUILDINGS.length).toBe(EXPLORE_LAND.buildSlots);
  });

  it("keeps land and arena gates (edge)", () => {
    expect(STARTER_BUILDINGS.some((b) => b.type === "portal")).toBe(true);
    expect(WARRIOR_BUILDINGS.some((b) => b.type === "portal")).toBe(true);
  });

  it("does not leave a city hall-approach portal slot (failure)", () => {
    expect(
      CITY_BUILDINGS.some((b) => b.type === "portal" && b.x === 0 && b.z === -8),
    ).toBe(false);
    expect(
      EXPLORE_BUILDINGS.some(
        (b) => b.type === "portal" && b.x === 0 && b.z === -10,
      ),
    ).toBe(false);
  });
});
