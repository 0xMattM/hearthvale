import { describe, expect, it } from "vitest";
import {
  EMPTY_LAND_BUILD_BEACON_LABEL,
  emptyLandBuildBeaconMode,
  HOMESTEAD_YARD_VISUAL,
  homesteadYardAtmosphereMode,
  LIVED_HOMESTEAD_CHIMNEY_CUE,
  livedHomesteadChimneyCue,
  livedHomesteadChimneyEmissiveIntensity,
  livedHomesteadChimneyPlumeEnvelope,
  livedHomesteadChimneyPlumeOpacity,
} from "@game/shared";

/**
 * PL118.1 — Lived-homestead quiet chimney cue.
 * Choice: soft chimney emissive + roof plume on the existing shed when the yard
 * is lived (same station gate as PL3.1 / PL22.1); empty stays quiet; no station invent.
 */
describe("CityLands PL118.1 lived-homestead quiet chimney cue", () => {
  it("shows chimney / plume after first station (happy)", () => {
    const buildings = [
      { type: "build_board" },
      { type: "crop_plot" },
    ];
    expect(homesteadYardAtmosphereMode(buildings)).toBe("lived");
    expect(emptyLandBuildBeaconMode(buildings)).toBe("soft");

    const cue = livedHomesteadChimneyCue("lived");
    expect(cue.show).toBe(true);
    expect(cue.chimneyIntensity).toBeGreaterThan(0);
    expect(cue.plumeOpacity).toBeGreaterThan(0);
    expect(cue.chimneyEmissive.toLowerCase()).toBe(
      LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyEmissive.toLowerCase(),
    );
    expect(cue.chimneyEmissive.toLowerCase()).not.toBe("#000000");

    const peak = livedHomesteadChimneyEmissiveIntensity(true, 1);
    const floor = livedHomesteadChimneyEmissiveIntensity(true, 0);
    expect(peak).toBe(LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyIntensityPeak);
    expect(floor).toBe(LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyIntensityBase);
    expect(peak).toBeGreaterThan(floor);

    const plumePeak = livedHomesteadChimneyPlumeOpacity(true, 1);
    const plumeFloor = livedHomesteadChimneyPlumeOpacity(true, 0);
    expect(plumePeak).toBe(LIVED_HOMESTEAD_CHIMNEY_CUE.plumeOpacityPeak);
    expect(plumeFloor).toBe(LIVED_HOMESTEAD_CHIMNEY_CUE.plumeOpacityBase);
  });

  it("stays quiet on empty yards; plume envelope oscillates (edge)", () => {
    const emptyBuildings = [{ type: "build_board" }, { type: "portal" }];
    expect(homesteadYardAtmosphereMode(emptyBuildings)).toBe("empty");
    expect(livedHomesteadChimneyCue("empty").show).toBe(false);
    expect(livedHomesteadChimneyEmissiveIntensity(false, 1)).toBe(0);
    expect(livedHomesteadChimneyPlumeOpacity(false, 0.5)).toBe(0);

    expect(LIVED_HOMESTEAD_CHIMNEY_CUE.plumePeriodMs).toBeGreaterThan(0);
    const low = livedHomesteadChimneyPlumeEnvelope(0);
    const mid = livedHomesteadChimneyPlumeEnvelope(
      LIVED_HOMESTEAD_CHIMNEY_CUE.plumePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThanOrEqual(1);
    expect(mid).toBeGreaterThan(low);
    expect(EMPTY_LAND_BUILD_BEACON_LABEL.toLowerCase()).toMatch(/empty land/);
  });

  it("does not invent stations; beacon / clamp stay intact (failure)", () => {
    expect(
      homesteadYardAtmosphereMode([
        { type: "build_board" },
        { type: "decor_pad" },
      ]),
    ).toBe("empty");
    expect(livedHomesteadChimneyCue("empty").chimneyIntensity).toBe(0);
    expect(livedHomesteadChimneyEmissiveIntensity(true, 2)).toBe(
      LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyIntensityPeak,
    );
    expect(livedHomesteadChimneyEmissiveIntensity(true, -1)).toBe(
      LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyIntensityBase,
    );
    expect(livedHomesteadChimneyPlumeEnvelope(Number.NaN)).toBe(0);
    expect(HOMESTEAD_YARD_VISUAL.lived.padColor.length).toBeGreaterThan(0);
  });
});
