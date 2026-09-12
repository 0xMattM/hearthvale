import { describe, expect, it } from "vitest";
import { COMBAT, isHealthLow } from "../../packages/shared/src";
import {
  ENERGY_METER_IDLE_GLANCE,
  HEALTH_METER_IDLE_GLANCE,
  MAP_CHIP_IDLE_GLANCE,
  shouldShowHealthMeterIdleGlance,
} from "../../apps/web/lib/hud/topbar-chrome";

/**
 * PL198.1 — Health-meter idle soft glance leftover.
 * Choice: quiet periodic TopBar HP breath while walking healthy with no panel
 * open (complements low-health warn + vignette; heal/combat unchanged; min HUD).
 */
describe("CityLands PL198.1 health-meter idle soft glance leftover", () => {
  it("breathes quietly on the HP readout while healthy walking (happy)", () => {
    expect(shouldShowHealthMeterIdleGlance(false, false)).toBe(true);
    expect(HEALTH_METER_IDLE_GLANCE.className).toBe(
      "topbar-health-meter--idle-glance",
    );
    expect(HEALTH_METER_IDLE_GLANCE.periodMs).toBeGreaterThanOrEqual(3000);
    expect(HEALTH_METER_IDLE_GLANCE.periodMs).toBeLessThanOrEqual(8000);
    expect(HEALTH_METER_IDLE_GLANCE.periodMs).not.toBe(
      ENERGY_METER_IDLE_GLANCE.periodMs,
    );
    expect(HEALTH_METER_IDLE_GLANCE.periodMs).not.toBe(
      MAP_CHIP_IDLE_GLANCE.periodMs,
    );
    expect(isHealthLow(100, 100)).toBe(false);
    expect(COMBAT.maxHealthStart).toBe(100);
  });

  it("clears while panel open or health low warn wins (edge)", () => {
    expect(shouldShowHealthMeterIdleGlance(true, false)).toBe(false);
    expect(shouldShowHealthMeterIdleGlance(false, true)).toBe(false);
    expect(shouldShowHealthMeterIdleGlance(true, true)).toBe(false);
    const max = COMBAT.maxHealthStart;
    const lowBand = Math.floor((COMBAT.lowWarnPct / 100) * max);
    expect(isHealthLow(lowBand, max)).toBe(true);
    expect(
      shouldShowHealthMeterIdleGlance(false, isHealthLow(lowBand, max)),
    ).toBe(false);
    expect(COMBAT.lowWarnPct).toBe(25);
  });

  it("does not invent combat power, HUD columns, or regen rules (failure)", () => {
    expect(shouldShowHealthMeterIdleGlance(true, false)).toBe(false);
    expect(String(HEALTH_METER_IDLE_GLANCE.className)).not.toMatch(
      /column|toast|stack|fare|nft|combat/i,
    );
    expect(HEALTH_METER_IDLE_GLANCE.periodMs).toBe(6400);
    expect(COMBAT.lowWarnPct).toBe(25);
    expect(COMBAT.damageStart).toBe(10);
    expect(COMBAT.defenseStart).toBe(5);
  });
});
