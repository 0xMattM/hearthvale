import { describe, expect, it } from "vitest";
import {
  CITY_SCARCE_STATION_BUSY_CUE,
  CITY_SCARCE_STATION_BUSY_PROMPT_TAG,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_FREE_PROMPT_TAG,
  WORLD,
  cityScarceStationMarkers,
  isStationContendedByPresence,
  shouldShowScarceFreeStickyWorldLabel,
} from "@game/shared";

/**
 * PL135.1 — Scarce Free sticky world label.
 * Quiet Free world cue + cooler pad while free (pairs Busy PL8.1 + settle PL119.1).
 * Contention rules unchanged; land unlimited unchanged; mute ok.
 * Choice: continuous Free sticky (not pad-only) so Free↔Busy stay equally glanceable.
 */
describe("CityLands PL135.1 scarce Free sticky world label", () => {
  it("shows Free sticky when station is free; cooler pad ≠ Busy (happy)", () => {
    const markers = cityScarceStationMarkers();
    const kitchen = markers.find((m) => m.type === "kitchen");
    expect(kitchen).toBeDefined();

    expect(
      isStationContendedByPresence(kitchen!.x, kitchen!.z, []),
    ).toBe(false);
    expect(shouldShowScarceFreeStickyWorldLabel(false)).toBe(true);
    expect(CITY_SCARCE_STATION_FREE_CUE.worldLabel).toBe("Free");
    expect(CITY_SCARCE_STATION_FREE_CUE.worldLabel).toBe(
      CITY_SCARCE_STATION_FREE_PROMPT_TAG,
    );
    expect(CITY_SCARCE_STATION_FREE_CUE.padColor).toBe(
      CITY_SCARCE_STATION_BUSY_CUE.freePadColor,
    );
    expect(CITY_SCARCE_STATION_FREE_CUE.padColor).not.toBe(
      CITY_SCARCE_STATION_BUSY_CUE.padColor,
    );
    expect(CITY_SCARCE_STATION_FREE_CUE.haloColor).not.toBe(
      CITY_SCARCE_STATION_BUSY_CUE.haloColor,
    );
    expect(CITY_SCARCE_STATION_FREE_CUE.haloOpacity).toBeGreaterThan(0);
    expect(CITY_SCARCE_STATION_FREE_CUE.haloEmissiveIntensity).toBeGreaterThan(
      0,
    );
  });

  it("hides Free sticky while Busy; far peers stay Free (edge)", () => {
    expect(shouldShowScarceFreeStickyWorldLabel(true)).toBe(false);
    expect(CITY_SCARCE_STATION_BUSY_CUE.worldLabel).toBe("Busy");
    expect(CITY_SCARCE_STATION_BUSY_CUE.worldLabel).toBe(
      CITY_SCARCE_STATION_BUSY_PROMPT_TAG,
    );
    expect(CITY_SCARCE_STATION_FREE_CUE.worldLabel).not.toBe(
      CITY_SCARCE_STATION_BUSY_CUE.worldLabel,
    );

    const markers = cityScarceStationMarkers();
    const forge = markers.find((m) => m.type === "forge");
    expect(forge).toBeDefined();
    const far = {
      x: forge!.x * WORLD.GRID + WORLD.GRID * 3,
      z: forge!.z * WORLD.GRID + WORLD.GRID * 3,
    };
    expect(isStationContendedByPresence(forge!.x, forge!.z, [far])).toBe(false);
    expect(shouldShowScarceFreeStickyWorldLabel(false)).toBe(true);

    const atForge = {
      x: forge!.x * WORLD.GRID,
      z: forge!.z * WORLD.GRID,
    };
    expect(
      isStationContendedByPresence(forge!.x, forge!.z, [atForge]),
    ).toBe(true);
    expect(shouldShowScarceFreeStickyWorldLabel(true)).toBe(false);
  });

  it("rejects inventing contention changes; Free cue stays quiet-cool (failure)", () => {
    expect(CITY_SCARCE_STATION_FREE_CUE.haloOpacity).toBeLessThan(1);
    expect(CITY_SCARCE_STATION_FREE_CUE.haloEmissiveIntensity).toBeLessThan(
      1,
    );
    expect(String(CITY_SCARCE_STATION_FREE_CUE.worldLabel)).not.toMatch(
      /nft|fare|cap/i,
    );
    expect(shouldShowScarceFreeStickyWorldLabel(true)).not.toBe(
      shouldShowScarceFreeStickyWorldLabel(false),
    );
    // Land unlimited unchanged — Free sticky is city scarce chrome only.
    expect(CITY_SCARCE_STATION_FREE_CUE.padColor).toMatch(/^#/);
    expect(CITY_SCARCE_STATION_BUSY_CUE.freePadColor).toBe(
      CITY_SCARCE_STATION_FREE_CUE.padColor,
    );
  });
});
