import { describe, expect, it } from "vitest";
import { ENERGY, isEnergyLow } from "@game/shared";
import {
  ENERGY_LOW_WORLD_VIGNETTE,
  energyLowWorldVignetteBackground,
  shouldShowEnergyLowWorldVignette,
} from "../../apps/web/lib/hud/energy-food-feedback";

/**
 * PL124.1 — Energy-low soft world vignette.
 * Quiet edge vignette while below ENERGY.lowWarnPct (complements TopBar PL9.1).
 * Threshold SoT unchanged; clears when recovered; mute ok; not a HUD column.
 * Choice: continuous soft edge rim while low (not one-shot) so the world stays
 * glanceably tired until regen/food recovers past the band.
 */
describe("CityLands PL124.1 energy-low soft world vignette", () => {
  it("shows soft edge vignette while energy is in the low band (happy)", () => {
    expect(ENERGY.lowWarnPct).toBe(25);
    expect(shouldShowEnergyLowWorldVignette(25, 100)).toBe(true);
    expect(shouldShowEnergyLowWorldVignette(0, 100)).toBe(true);
    expect(isEnergyLow(25, 100)).toBe(true);
    expect(shouldShowEnergyLowWorldVignette(25, 100)).toBe(
      isEnergyLow(25, 100),
    );

    expect(ENERGY_LOW_WORLD_VIGNETTE.opacity).toBeGreaterThan(0);
    expect(ENERGY_LOW_WORLD_VIGNETTE.clearPct).toBeLessThan(
      ENERGY_LOW_WORLD_VIGNETTE.midPct,
    );
    const bg = energyLowWorldVignetteBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(ENERGY_LOW_WORLD_VIGNETTE.outerRgba);
    expect(bg).toContain("transparent");
  });

  it("clears when recovered above threshold (edge)", () => {
    expect(shouldShowEnergyLowWorldVignette(26, 100)).toBe(false);
    expect(shouldShowEnergyLowWorldVignette(100, 100)).toBe(false);
    expect(shouldShowEnergyLowWorldVignette(50, 200)).toBe(true);
    expect(shouldShowEnergyLowWorldVignette(51, 200)).toBe(false);
    expect(ENERGY_LOW_WORLD_VIGNETTE.midRgba).not.toBe(
      ENERGY_LOW_WORLD_VIGNETTE.outerRgba,
    );
  });

  it("refuses invalid max / non-finite values; keeps threshold SoT (failure)", () => {
    expect(shouldShowEnergyLowWorldVignette(10, 0)).toBe(false);
    expect(shouldShowEnergyLowWorldVignette(10, -50)).toBe(false);
    expect(shouldShowEnergyLowWorldVignette(Number.NaN, 100)).toBe(false);
    expect(shouldShowEnergyLowWorldVignette(20, Number.NaN)).toBe(false);
    expect(ENERGY.lowWarnPct).toBe(25);
    expect(ENERGY_LOW_WORLD_VIGNETTE.opacity).toBeLessThanOrEqual(1);
    expect(energyLowWorldVignetteBackground()).not.toMatch(/\bHUD\b/i);
  });
});
