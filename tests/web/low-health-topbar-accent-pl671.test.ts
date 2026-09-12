import { describe, expect, it } from "vitest";
import { COMBAT, isHealthLow } from "@game/shared";
import {
  ENERGY_LOW_TEXT_COLOR,
  HEALTH_LOW_TEXT_COLOR,
} from "../../apps/web/lib/hud/topbar-chrome";

/**
 * PL67.1 — Low health TopBar accent (soft warm HP readout; clears when recovered).
 * Complements PL64.1 edge cue; health numbers unchanged; no toast stack.
 */
describe("CityLands PL67.1 low health TopBar accent", () => {
  it("warns at or below COMBAT.lowWarnPct of max (happy)", () => {
    expect(COMBAT.lowWarnPct).toBe(25);
    expect(isHealthLow(25, 100)).toBe(true);
    expect(isHealthLow(0, 100)).toBe(true);
    expect(isHealthLow(10, 100)).toBe(true);
    expect(HEALTH_LOW_TEXT_COLOR).toBe(ENERGY_LOW_TEXT_COLOR);
    expect(HEALTH_LOW_TEXT_COLOR.toLowerCase()).toMatch(/danger|accent|color-mix/);
  });

  it("clears when recovered above threshold (edge)", () => {
    expect(isHealthLow(26, 100)).toBe(false);
    expect(isHealthLow(100, 100)).toBe(false);
    expect(isHealthLow(50, 200)).toBe(true);
    expect(isHealthLow(51, 200)).toBe(false);
  });

  it("keeps combat numbers and refuses invalid max (failure)", () => {
    expect(COMBAT.maxHealthStart).toBeGreaterThan(COMBAT.lowWarnPct);
    expect(isHealthLow(10, 0)).toBe(false);
    expect(isHealthLow(10, -50)).toBe(false);
    expect(isHealthLow(Number.NaN, 100)).toBe(false);
    expect(isHealthLow(20, Number.NaN)).toBe(false);
    expect(HEALTH_LOW_TEXT_COLOR.toLowerCase()).not.toContain("toast");
  });
});
