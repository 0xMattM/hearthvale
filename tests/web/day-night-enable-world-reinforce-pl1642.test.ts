import { describe, expect, it } from "vitest";
import {
  DAY_NIGHT_ENABLE_WORLD_REINFORCE,
  dayNightEnableWorldReinforceBackground,
  shouldFlashDayNightEnableWorldReinforce,
} from "../../apps/web/lib/hud/day-night-enable-feedback";
import {
  DAY_NIGHT_ENABLE_CONFIRM_MS,
  shouldFlashDayNightEnableConfirm,
} from "../../apps/web/lib/hud/day-night-enable-confirm";
import {
  DAY_PHASE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/day-phase-feedback";
import {
  TRAVEL_ARRIVE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/travel-arrive-feedback";
import { DAY_CYCLE_MS } from "../../apps/web/lib/day-night";

/**
 * PL164.2 — Day-night-enable soft world reinforce leftover.
 * Brief soft rim when day/night cycle is enabled from settings (complements
 * soft confirm PL130.1 + phase rim PL160.2; clocks unchanged). Mute ok.
 * Choice: one-shot dawn-slate rim (not another Day/night chip / phase twilight)
 * so enabling cycle stays world-readable beside settings confirm + later edges.
 */
describe("CityLands PL164.2 day-night-enable soft world reinforce leftover", () => {
  it("flashes quiet dawn-slate rim when enabling cycle (happy)", () => {
    expect(shouldFlashDayNightEnableWorldReinforce(false, true)).toBe(true);
    expect(DAY_NIGHT_ENABLE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(DAY_NIGHT_ENABLE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = dayNightEnableWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(DAY_NIGHT_ENABLE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Same gate as settings-row confirm — rim complements, does not replace.
    expect(shouldFlashDayNightEnableWorldReinforce(false, true)).toBe(
      shouldFlashDayNightEnableConfirm(false, true),
    );
    expect(DAY_NIGHT_ENABLE_CONFIRM_MS).toBeGreaterThan(0);
  });

  it("stays quiet on disable / no-op; rim ≠ phase twilight / travel cyan (edge)", () => {
    expect(shouldFlashDayNightEnableWorldReinforce(true, false)).toBe(false);
    expect(shouldFlashDayNightEnableWorldReinforce(false, false)).toBe(false);
    expect(shouldFlashDayNightEnableWorldReinforce(true, true)).toBe(false);

    expect(DAY_NIGHT_ENABLE_WORLD_REINFORCE.outerRgba).not.toBe(
      DAY_PHASE_WORLD_REINFORCE.outerRgba,
    );
    expect(DAY_NIGHT_ENABLE_WORLD_REINFORCE.midRgba).not.toBe(
      DAY_PHASE_WORLD_REINFORCE.midRgba,
    );
    expect(DAY_NIGHT_ENABLE_WORLD_REINFORCE.outerRgba).not.toBe(
      TRAVEL_ARRIVE_WORLD_REINFORCE.outerRgba,
    );
    expect(DAY_NIGHT_ENABLE_WORLD_REINFORCE.clearPct).toBeLessThan(
      DAY_NIGHT_ENABLE_WORLD_REINFORCE.midPct,
    );
    expect(DAY_NIGHT_ENABLE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent clocks / NFT combat; keeps enable gate (failure)", () => {
    expect(DAY_CYCLE_MS).toBe(8 * 60 * 1000);
    expect(dayNightEnableWorldReinforceBackground()).not.toMatch(
      /clock\s*change|always.?on|nft/i,
    );
    expect(String(DAY_NIGHT_ENABLE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(DAY_NIGHT_ENABLE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashDayNightEnableWorldReinforce(false, true)).not.toBe(
      shouldFlashDayNightEnableWorldReinforce(true, false),
    );
  });
});
