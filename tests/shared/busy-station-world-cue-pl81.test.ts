import { describe, expect, it } from "vitest";
import {
  CITY_SCARCE_STATION_BUSY_CUE,
  CITY_SCARCE_STATION_BUSY_PROMPT_TAG,
  CITY_SCARCE_STATION_FREE_PROMPT_TAG,
  WORLD,
  cityScarceStationMarkers,
  isStationContendedByPresence,
  withCityScarceStationAvailabilityPrompt,
} from "@game/shared";

/**
 * PL8.1 — Busy station world cue SoT (soft presence halo / Busy label).
 * Choice: shared presence geometry with server contention; land unlimited unchanged.
 */
describe("CityLands PL8.1 busy station world cue", () => {
  it("marks scarce station busy when peer stands in interact range (happy)", () => {
    const markers = cityScarceStationMarkers();
    const kitchen = markers.find((m) => m.type === "kitchen");
    expect(kitchen).toBeDefined();

    const atStation = {
      x: kitchen!.x * WORLD.GRID,
      z: kitchen!.z * WORLD.GRID,
    };
    expect(
      isStationContendedByPresence(kitchen!.x, kitchen!.z, [atStation]),
    ).toBe(true);
    expect(CITY_SCARCE_STATION_BUSY_CUE.worldLabel).toBe("Busy");
    expect(CITY_SCARCE_STATION_BUSY_CUE.padColor).not.toBe(
      CITY_SCARCE_STATION_BUSY_CUE.freePadColor,
    );
    expect(CITY_SCARCE_STATION_BUSY_CUE.haloColor.length).toBeGreaterThan(0);
  });

  it("stays free when peers are far; empty presence is free (edge)", () => {
    const markers = cityScarceStationMarkers();
    const forge = markers.find((m) => m.type === "forge");
    expect(forge).toBeDefined();

    expect(isStationContendedByPresence(forge!.x, forge!.z, [])).toBe(false);

    const far = {
      x: forge!.x * WORLD.GRID + WORLD.GRID * 3,
      z: forge!.z * WORLD.GRID + WORLD.GRID * 3,
    };
    expect(isStationContendedByPresence(forge!.x, forge!.z, [far])).toBe(false);
  });

  it("rejects contention at wrong station and keeps prompt tags distinct (failure)", () => {
    const markers = cityScarceStationMarkers();
    const workshop = markers.find((m) => m.type === "workshop");
    const mill = markers.find((m) => m.type === "mill");
    expect(workshop).toBeDefined();
    expect(mill).toBeDefined();
    expect(workshop!.slotIndex).not.toBe(mill!.slotIndex);

    const atMill = {
      x: mill!.x * WORLD.GRID,
      z: mill!.z * WORLD.GRID,
    };
    expect(
      isStationContendedByPresence(workshop!.x, workshop!.z, [atMill]),
    ).toBe(false);
    expect(CITY_SCARCE_STATION_BUSY_PROMPT_TAG).toBe("Busy");
    expect(CITY_SCARCE_STATION_FREE_PROMPT_TAG).toBe("Free");
    expect(CITY_SCARCE_STATION_BUSY_PROMPT_TAG).not.toBe(
      CITY_SCARCE_STATION_FREE_PROMPT_TAG,
    );
    expect(withCityScarceStationAvailabilityPrompt("", true)).toBe("");
  });
});
