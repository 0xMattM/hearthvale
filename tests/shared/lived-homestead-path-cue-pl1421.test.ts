import { describe, expect, it } from "vitest";

import {

  EMPTY_LAND_BUILD_BEACON_LABEL,

  emptyLandBuildBeaconMode,

  HOMESTEAD_YARD_VISUAL,

  homesteadYardAtmosphereMode,

  LIVED_HOMESTEAD_CHIMNEY_CUE,

  LIVED_HOMESTEAD_PATH_CUE,

  livedHomesteadPathCue,

  livedHomesteadPathEmissiveIntensity,

  livedHomesteadPathPulseEnvelope,

  livedHomesteadPathVsChimneyContrast,

  livedHomesteadPathVsEmptyMeadowContrast,

} from "@game/shared";



/**

 * PL142.1 — Homestead lived-path soft cue.

 * Choice: quiet warmer emissive on the existing yard path/cross when lived

 * (same station gate as PL3.1 / PL22.1 / chimney PL118.1) so lived yards read

 * apart from empty meadow PL114.1; layouts / slots unchanged; empty stays flat.

 */

describe("CityLands PL142.1 homestead lived-path soft cue", () => {

  it("pulses warmer path emissive after first station (happy)", () => {

    const buildings = [

      { type: "build_board" },

      { type: "crop_plot" },

    ];

    expect(homesteadYardAtmosphereMode(buildings)).toBe("lived");

    expect(emptyLandBuildBeaconMode(buildings)).toBe("soft");



    const cue = livedHomesteadPathCue("lived");

    expect(cue.show).toBe(true);

    expect(cue.intensity).toBeGreaterThan(0);

    expect(cue.emissive.toLowerCase()).toBe(

      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),

    );

    expect(cue.emissive.toLowerCase()).not.toBe("#000000");



    const peak = livedHomesteadPathEmissiveIntensity(true, 1);

    const floor = livedHomesteadPathEmissiveIntensity(true, 0);

    expect(peak).toBe(LIVED_HOMESTEAD_PATH_CUE.intensityPeak);

    expect(floor).toBe(LIVED_HOMESTEAD_PATH_CUE.intensityBase);

    expect(peak).toBeGreaterThan(floor);

  });



  it("stays quiet on empty yards; path ≠ meadow / chimney (edge)", () => {

    const emptyBuildings = [{ type: "build_board" }, { type: "portal" }];

    expect(homesteadYardAtmosphereMode(emptyBuildings)).toBe("empty");

    expect(livedHomesteadPathCue("empty").show).toBe(false);

    expect(livedHomesteadPathEmissiveIntensity(false, 1)).toBe(0);



    expect(livedHomesteadPathVsEmptyMeadowContrast()).toBeGreaterThan(40);

    expect(livedHomesteadPathVsChimneyContrast()).toBeGreaterThan(15);

    expect(LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase()).not.toBe(

      HOMESTEAD_YARD_VISUAL.empty.meadowColor.toLowerCase(),

    );

    expect(LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase()).not.toBe(

      LIVED_HOMESTEAD_CHIMNEY_CUE.chimneyEmissive.toLowerCase(),

    );



    expect(LIVED_HOMESTEAD_PATH_CUE.pulsePeriodMs).toBeGreaterThan(0);

    const low = livedHomesteadPathPulseEnvelope(0);

    const mid = livedHomesteadPathPulseEnvelope(

      LIVED_HOMESTEAD_PATH_CUE.pulsePeriodMs / 4,

    );

    expect(low).toBeGreaterThanOrEqual(0);

    expect(low).toBeLessThanOrEqual(1);

    expect(mid).toBeGreaterThan(low);

    expect(EMPTY_LAND_BUILD_BEACON_LABEL.toLowerCase()).toMatch(/empty land/);

  });



  it("does not invent slots; clamps / layout stay intact (failure)", () => {

    expect(

      homesteadYardAtmosphereMode([

        { type: "build_board" },

        { type: "decor_pad" },

      ]),

    ).toBe("empty");

    expect(livedHomesteadPathCue("empty").intensity).toBe(0);

    expect(livedHomesteadPathEmissiveIntensity(true, 2)).toBe(

      LIVED_HOMESTEAD_PATH_CUE.intensityPeak,

    );

    expect(livedHomesteadPathEmissiveIntensity(true, -1)).toBe(

      LIVED_HOMESTEAD_PATH_CUE.intensityBase,

    );

    expect(livedHomesteadPathPulseEnvelope(Number.NaN)).toBe(0);

    expect(HOMESTEAD_YARD_VISUAL.lived.pathColor.length).toBeGreaterThan(0);

    expect(String(LIVED_HOMESTEAD_PATH_CUE.emissive)).not.toMatch(

      /nft|combat/i,

    );

  });

});


