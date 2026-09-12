import { describe, expect, it } from "vitest";
import {
  CITY_HUB_VISUAL,
  cityHubFloorColors,
  cityScarceStationMarkers,
  cityScarceVsCivicPadContrast,
} from "@game/shared";

/**
 * PL36.1 — City civic soft atmosphere SoT.
 * Choice: cooler streets/plaza + quiet civic pads vs warm scarce yard (PL1.1);
 * scarce stations unchanged; no station invent.
 */
describe("CityLands PL36.1 city civic soft atmosphere", () => {
  it("keeps warm scarce yard apart from cool civic pad (happy)", () => {
    const floors = cityHubFloorColors();
    expect(floors.scarceYardColor.toLowerCase()).toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );
    expect(floors.civicPadColor.toLowerCase()).toBe(
      CITY_HUB_VISUAL.civicPadColor.toLowerCase(),
    );
    expect(floors.scarceYardColor.toLowerCase()).not.toBe(
      floors.civicPadColor.toLowerCase(),
    );
    expect(cityScarceVsCivicPadContrast()).toBeGreaterThan(40);
  });

  it("cools streets/plaza while scarce markers stay present (edge)", () => {
    const floors = cityHubFloorColors();
    expect(floors.streetsColor.toLowerCase()).toBe(
      CITY_HUB_VISUAL.streetsColor.toLowerCase(),
    );
    expect(floors.plazaColor.toLowerCase()).toBe(
      CITY_HUB_VISUAL.plazaColor.toLowerCase(),
    );
    expect(floors.scarceYardColor.toLowerCase()).not.toBe(
      floors.streetsColor.toLowerCase(),
    );
    const markers = cityScarceStationMarkers();
    expect(markers.length).toBeGreaterThan(0);
  });

  it("refuses inventing stations; scarce warm pad stays warm (failure)", () => {
    expect(CITY_HUB_VISUAL.scarceYardColor.toLowerCase()).toBe("#9a7a58");
    expect(cityHubFloorColors().civicPadColor.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );
    // Atmosphere SoT is palette-only — no extra scarce station types.
    const types = cityScarceStationMarkers().map((m) => m.type);
    expect(types.every((t) => typeof t === "string" && t.length > 0)).toBe(
      true,
    );
    expect(new Set(types).has("civic_hall" as never)).toBe(false);
  });
});
