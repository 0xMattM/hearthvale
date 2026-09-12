import { describe, expect, it } from "vitest";
import {
  CITY_ANIMAL_PEN_LANDMARK_CUE,
  CITY_CROP_PLOT_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  CROP_READY_WORLD_PULSE,
  CROPS,
  cityCropPlotLandmarkCue,
  cityCropPlotLandmarkEmissiveIntensity,
  cityCropPlotLandmarkHazeOpacity,
  cityCropPlotLandmarkPulseEnvelope,
  cityCropPlotLandmarkVsAnimalPenContrast,
  cityCropPlotLandmarkVsFreeStickyContrast,
  cityCropPlotLandmarkVsReadyContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL171.1 — City crop-plot soft landmark cue leftover.
 * Choice: quiet warm soil haze/emissive on existing city scarce crop_plot
 * while on City (complements ready pulse + Free/Busy pads; grow times unchanged).
 * Continuous landmark on City only; ready / growing stay their own cues.
 */
describe("CityLands PL171.1 city crop-plot soft landmark cue leftover", () => {
  it("pulses quiet warm soil haze on City scarce crop plot (happy)", () => {
    const cue = cityCropPlotLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_CROP_PLOT_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_CROP_PLOT_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_CROP_PLOT_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_CROP_PLOT_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("crop_plot");

    const peak = cityCropPlotLandmarkEmissiveIntensity(1);
    const floor = cityCropPlotLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_CROP_PLOT_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_CROP_PLOT_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityCropPlotLandmarkHazeOpacity(1);
    const hazeFloor = cityCropPlotLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; warm soil ≠ ready / Free / pen (edge)", () => {
    expect(cityCropPlotLandmarkCue("player_land").show).toBe(false);
    expect(cityCropPlotLandmarkCue("explore").show).toBe(false);
    expect(cityCropPlotLandmarkCue("warrior").show).toBe(false);
    expect(cityCropPlotLandmarkCue(null).show).toBe(false);
    expect(cityCropPlotLandmarkCue("").show).toBe(false);
    expect(cityCropPlotLandmarkCue("player_land").intensity).toBe(0);
    expect(cityCropPlotLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityCropPlotLandmarkVsReadyContrast()).toBeGreaterThan(0);
    expect(cityCropPlotLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityCropPlotLandmarkVsAnimalPenContrast()).toBeGreaterThan(0);
    expect(CITY_CROP_PLOT_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CROP_READY_WORLD_PULSE.emissiveColor.toLowerCase(),
    );
    expect(CITY_CROP_PLOT_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_CROP_PLOT_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_ANIMAL_PEN_LANDMARK_CUE.emissive.toLowerCase(),
    );

    expect(CITY_CROP_PLOT_LANDMARK_CUE.intensityPeak).toBeLessThan(
      CROP_READY_WORLD_PULSE.intensityMax,
    );
    expect(CITY_CROP_PLOT_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      CROP_READY_WORLD_PULSE.periodMs,
    );

    const low = cityCropPlotLandmarkPulseEnvelope(0);
    const mid = cityCropPlotLandmarkPulseEnvelope(
      CITY_CROP_PLOT_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent grow times or NFT combat (failure)", () => {
    expect(CROPS.wheat.growMs).toBe(3 * 60 * 1000);
    expect(cityCropPlotLandmarkEmissiveIntensity(2)).toBe(
      CITY_CROP_PLOT_LANDMARK_CUE.intensityPeak,
    );
    expect(cityCropPlotLandmarkEmissiveIntensity(-1)).toBe(
      CITY_CROP_PLOT_LANDMARK_CUE.intensityBase,
    );
    expect(cityCropPlotLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_CROP_PLOT_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_CROP_PLOT_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|grow/i,
    );
    expect(CITY_CROP_PLOT_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
