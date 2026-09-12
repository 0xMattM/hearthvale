import { describe, expect, it } from "vitest";
import {
  CITY_ATMOSPHERE_LABELS,
  CITY_ATMOSPHERE_WAYFINDING_LABELS_ENABLED,
  CITY_BUILDINGS,
  cityAtmosphereWayfindingLabelsVisible,
  cityScarceStationMarkers,
  isCityScarceStationType,
} from "@game/shared";

/**
 * PL1.1 — City scarce-yard + wayfinding marker data.
 * Choice: shared SoT from CITY_BUILDINGS so CityEnvironment pads stay aligned.
 * Floating Html plaques stay off (hub clutter).
 */
describe("CityLands PL1.1 city scarce-yard + wayfinding", () => {
  it("lists scarce stations from city template and hides floating plaques (happy)", () => {
    const markers = cityScarceStationMarkers();
    expect(markers.length).toBeGreaterThanOrEqual(8);
    expect(markers.every((m) => isCityScarceStationType(m.type))).toBe(true);
    expect(markers.some((m) => m.type === "workshop")).toBe(true);
    expect(markers.some((m) => m.type === "alchemy_bench")).toBe(true);

    expect(CITY_ATMOSPHERE_WAYFINDING_LABELS_ENABLED).toBe(false);
    expect(cityAtmosphereWayfindingLabelsVisible()).toBe(false);
    const ids = CITY_ATMOSPHERE_LABELS.map((l) => l.id).sort();
    expect(ids).toEqual(["scarce_yard", "tutor_lane"]);
  });

  it("excludes tutors and service boards from scarce pads (edge)", () => {
    const markers = cityScarceStationMarkers();
    expect(markers.some((m) => m.type === ("tutorial_npc" as never))).toBe(
      false,
    );
    expect(markers.some((m) => m.type === ("vendor_stall" as never))).toBe(
      false,
    );
    expect(markers.some((m) => m.type === ("market_board" as never))).toBe(
      false,
    );
    expect(markers.some((m) => m.type === ("realm_market" as never))).toBe(
      false,
    );
    expect(markers.some((m) => m.type === ("notice_board" as never))).toBe(
      false,
    );
    expect(markers.some((m) => m.type === ("portal" as never))).toBe(false);

    const tutorCount = CITY_BUILDINGS.filter(
      (b) => b.type === "tutorial_npc",
    ).length;
    expect(tutorCount).toBeGreaterThanOrEqual(10);
    expect(markers.length + tutorCount).toBeLessThan(CITY_BUILDINGS.length);

    // Reason: catalog copy may remain for SoT, but world Html stays off.
    expect(CITY_ATMOSPHERE_LABELS).toHaveLength(2);
    expect(cityAtmosphereWayfindingLabelsVisible()).toBe(false);
  });

  it("rejects unknown / non-scarce types (failure)", () => {
    expect(isCityScarceStationType("tutorial_npc")).toBe(false);
    expect(isCityScarceStationType("swamp_hut")).toBe(false);
    expect(isCityScarceStationType("")).toBe(false);
    expect(isCityScarceStationType("forge")).toBe(true);
    expect(cityAtmosphereWayfindingLabelsVisible()).toBe(
      CITY_ATMOSPHERE_WAYFINDING_LABELS_ENABLED,
    );
    expect(CITY_ATMOSPHERE_WAYFINDING_LABELS_ENABLED).toBe(false);
  });
});
