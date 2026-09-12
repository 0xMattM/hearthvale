import { describe, expect, it } from "vitest";
import { ENERGY, isEnergyLow } from "@game/shared";
import {
  ENERGY_LOW_BAR_GRADIENT,
  ENERGY_OK_BAR_GRADIENT,
} from "../../apps/web/lib/hud/topbar-chrome";

/**
 * PL9.1 — Low-energy TopBar cue (soft warn; clears when recovered).
 */
describe("CityLands PL9.1 low-energy TopBar cue", () => {
  it("warns at or below ENERGY.lowWarnPct of max (happy)", () => {
    expect(ENERGY.lowWarnPct).toBe(25);
    expect(isEnergyLow(25, 100)).toBe(true);
    expect(isEnergyLow(0, 100)).toBe(true);
    expect(isEnergyLow(10, 100)).toBe(true);
    expect(ENERGY_LOW_BAR_GRADIENT).not.toBe(ENERGY_OK_BAR_GRADIENT);
  });

  it("clears when recovered above threshold (edge)", () => {
    expect(isEnergyLow(26, 100)).toBe(false);
    expect(isEnergyLow(100, 100)).toBe(false);
    expect(isEnergyLow(50, 200)).toBe(true);
    expect(isEnergyLow(51, 200)).toBe(false);
  });

  it("refuses invalid max / non-finite values (failure)", () => {
    expect(isEnergyLow(10, 0)).toBe(false);
    expect(isEnergyLow(10, -50)).toBe(false);
    expect(isEnergyLow(Number.NaN, 100)).toBe(false);
    expect(isEnergyLow(20, Number.NaN)).toBe(false);
  });
});
