import { describe, expect, it } from "vitest";
import { COMBAT, isHealthLow } from "@game/shared";
import {
  ENERGY_LOW_WORLD_VIGNETTE,
  HEALTH_LOW_WORLD_VIGNETTE,
  healthLowWorldVignetteBackground,
  shouldShowHealthLowWorldVignette,
} from "../../apps/web/lib/hud/energy-food-feedback";

/**
 * PL126.1 — Health-low soft world vignette.
 * Quiet cool/danger edge vignette while below COMBAT.lowWarnPct
 * (complements TopBar PL67.1 / energy vignette PL124.1).
 * Threshold SoT unchanged; clears when recovered; mute ok; not a HUD column.
 * Choice: continuous cool crimson rim while low (not one-shot) so HP stays
 * glanceably fragile until heal; distinct from warm energy amber.
 */
describe("CityLands PL126.1 health-low soft world vignette", () => {
  it("shows soft cool/danger vignette while health is in the low band (happy)", () => {
    expect(COMBAT.lowWarnPct).toBe(25);
    expect(shouldShowHealthLowWorldVignette(25, 100)).toBe(true);
    expect(shouldShowHealthLowWorldVignette(0, 100)).toBe(true);
    expect(isHealthLow(25, 100)).toBe(true);
    expect(shouldShowHealthLowWorldVignette(25, 100)).toBe(
      isHealthLow(25, 100),
    );

    expect(HEALTH_LOW_WORLD_VIGNETTE.opacity).toBeGreaterThan(0);
    expect(HEALTH_LOW_WORLD_VIGNETTE.clearPct).toBeLessThan(
      HEALTH_LOW_WORLD_VIGNETTE.midPct,
    );
    const bg = healthLowWorldVignetteBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(HEALTH_LOW_WORLD_VIGNETTE.outerRgba);
    expect(bg).toContain("transparent");
  });

  it("clears when recovered; stays distinct from energy amber (edge)", () => {
    expect(shouldShowHealthLowWorldVignette(26, 100)).toBe(false);
    expect(shouldShowHealthLowWorldVignette(100, 100)).toBe(false);
    expect(shouldShowHealthLowWorldVignette(50, 200)).toBe(true);
    expect(shouldShowHealthLowWorldVignette(51, 200)).toBe(false);
    expect(HEALTH_LOW_WORLD_VIGNETTE.outerRgba).not.toBe(
      ENERGY_LOW_WORLD_VIGNETTE.outerRgba,
    );
    expect(HEALTH_LOW_WORLD_VIGNETTE.midRgba).not.toBe(
      ENERGY_LOW_WORLD_VIGNETTE.midRgba,
    );
  });

  it("refuses invalid max / non-finite values; keeps threshold SoT (failure)", () => {
    expect(shouldShowHealthLowWorldVignette(10, 0)).toBe(false);
    expect(shouldShowHealthLowWorldVignette(10, -50)).toBe(false);
    expect(shouldShowHealthLowWorldVignette(Number.NaN, 100)).toBe(false);
    expect(shouldShowHealthLowWorldVignette(20, Number.NaN)).toBe(false);
    expect(COMBAT.lowWarnPct).toBe(25);
    expect(HEALTH_LOW_WORLD_VIGNETTE.opacity).toBeLessThanOrEqual(1);
    expect(healthLowWorldVignetteBackground()).not.toMatch(/\bHUD\b/i);
  });
});
