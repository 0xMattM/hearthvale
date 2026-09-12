import { describe, expect, it } from "vitest";
import {
  DAY_CYCLE_MS,
  dayCycleProgress,
  dayNightPalette,
  dayPhaseFromProgress,
  fillLightPosition,
  isCosmeticNight,
  LIGHTING_READABILITY,
  readableLightIntensities,
} from "../../apps/web/lib/day-night";

describe("day-night cosmetic cycle F14.5", () => {
  it("advances phases across a cycle (happy)", () => {
    expect(dayPhaseFromProgress(0.05)).toBe("dawn");
    expect(dayPhaseFromProgress(0.3)).toBe("day");
    expect(dayPhaseFromProgress(0.6)).toBe("dusk");
    expect(dayPhaseFromProgress(0.9)).toBe("night");
    const noon = dayNightPalette(DAY_CYCLE_MS * 0.3, "player_land", true);
    expect(noon.phase).toBe("day");
    expect(noon.sunIntensity).toBeGreaterThan(1);
    expect(noon.label).toBe("Day");
  });

  it("locks midday when disabled and keeps explore distinct (edge)", () => {
    const locked = dayNightPalette(0, "player_land", false);
    expect(locked.phase).toBe("day");
    expect(dayCycleProgress(DAY_CYCLE_MS / 2)).toBeCloseTo(0.5, 5);
    const forestNight = dayNightPalette(DAY_CYCLE_MS * 0.9, "explore", true);
    const homeNight = dayNightPalette(DAY_CYCLE_MS * 0.9, "player_land", true);
    expect(forestNight.background).not.toBe(homeNight.background);
    expect(isCosmeticNight(forestNight.phase)).toBe(true);
  });

  it("never treats night as a power gate — only darker sun (failure)", () => {
    const day = dayNightPalette(DAY_CYCLE_MS * 0.3, "player_land", true);
    const night = dayNightPalette(DAY_CYCLE_MS * 0.9, "player_land", true);
    expect(night.sunIntensity).toBeLessThan(day.sunIntensity);
    expect(night.sunIntensity).toBeGreaterThan(0);
    const fill = fillLightPosition(day.sunPosition);
    expect(fill[0] * day.sunPosition[0]).toBeLessThan(0);
    expect(fill[1]).toBeGreaterThan(0);
    // Reason: night must stay readable — prior crush-to-black felt broken.
    const readableNight = readableLightIntensities(
      night.hemiIntensity,
      night.sunIntensity,
    );
    expect(readableNight.hemi).toBeGreaterThanOrEqual(
      LIGHTING_READABILITY.minHemi,
    );
    expect(readableNight.sun).toBeGreaterThanOrEqual(
      LIGHTING_READABILITY.minSun,
    );
    // Palette has no combat/energy fields — assert shape stays lighting-only
    expect(Object.keys(night).sort()).toEqual(
      [
        "background",
        "fog",
        "hemiGround",
        "hemiIntensity",
        "hemiSky",
        "label",
        "phase",
        "progress",
        "sunIntensity",
        "sunPosition",
      ].sort(),
    );
  });
});
