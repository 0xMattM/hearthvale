import { describe, expect, it } from "vitest";
import { ENERGY, isEnergyLow } from "../../packages/shared/src";
import {
  ENERGY_METER_IDLE_GLANCE,
  ENERGY_OK_BAR_GRADIENT,
  MAP_CHIP_IDLE_GLANCE,
  shouldShowEnergyMeterIdleGlance,
} from "../../apps/web/lib/hud/topbar-chrome";

/**
 * PL188.2 — Energy-meter idle soft glance leftover.
 * Choice: quiet periodic TopBar energy-bar breath while walking healthy with
 * no panel open (complements low-energy warn + vignette; regen unchanged; min HUD).
 */
describe("CityLands PL188.2 energy-meter idle soft glance leftover", () => {
  it("breathes quietly on the energy meter while healthy walking (happy)", () => {
    expect(shouldShowEnergyMeterIdleGlance(false, false)).toBe(true);
    expect(ENERGY_METER_IDLE_GLANCE.className).toBe(
      "topbar-energy-meter--idle-glance",
    );
    expect(ENERGY_METER_IDLE_GLANCE.periodMs).toBeGreaterThanOrEqual(3000);
    expect(ENERGY_METER_IDLE_GLANCE.periodMs).toBeLessThanOrEqual(8000);
    expect(ENERGY_METER_IDLE_GLANCE.periodMs).not.toBe(MAP_CHIP_IDLE_GLANCE.periodMs);
    expect(ENERGY_OK_BAR_GRADIENT).toMatch(/#6fbf73/);
    expect(isEnergyLow(100, 100)).toBe(false);
  });

  it("clears while panel open or energy low warn wins (edge)", () => {
    expect(shouldShowEnergyMeterIdleGlance(true, false)).toBe(false);
    expect(shouldShowEnergyMeterIdleGlance(false, true)).toBe(false);
    expect(shouldShowEnergyMeterIdleGlance(true, true)).toBe(false);
    const max = 100;
    const lowBand = Math.floor((ENERGY.lowWarnPct / 100) * max);
    expect(isEnergyLow(lowBand, max)).toBe(true);
    expect(shouldShowEnergyMeterIdleGlance(false, isEnergyLow(lowBand, max))).toBe(
      false,
    );
    expect(ENERGY.regenAmount).toBeGreaterThan(0);
    expect(ENERGY.regenIntervalMs).toBeGreaterThan(0);
  });

  it("does not invent regen rules, HUD columns, or fares (failure)", () => {
    expect(shouldShowEnergyMeterIdleGlance(true, false)).toBe(false);
    expect(String(ENERGY_METER_IDLE_GLANCE.className)).not.toMatch(
      /column|toast|stack|fare|nft|combat/i,
    );
    expect(ENERGY_METER_IDLE_GLANCE.periodMs).toBe(5600);
    expect(ENERGY.lowWarnPct).toBe(25);
    expect(ENERGY.regenAmount).toBe(1);
  });
});
