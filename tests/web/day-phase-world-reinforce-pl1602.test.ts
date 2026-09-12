import { describe, expect, it } from "vitest";
import {
  DAY_PHASE_WORLD_REINFORCE,
  dayPhaseWorldReinforceBackground,
  shouldFlashDayPhaseWorldReinforce,
} from "../../apps/web/lib/hud/day-phase-feedback";
import {
  DAY_PHASE_DAWN_CUE,
  DAY_PHASE_DUSK_CUE,
  DAY_PHASE_NIGHT_CUE,
  shouldFlashDayPhaseChangeCue,
} from "../../apps/web/lib/hud/success-cue";
import { DAY_CYCLE_MS, DAY_PHASE_EDGE_HAZE } from "../../apps/web/lib/day-night";
import { HUNT_WIN_WORLD_REINFORCE } from "../../apps/web/lib/hud/hunt-win-feedback";
import { CRAFT_COMPLETE_WORLD_REINFORCE } from "../../apps/web/lib/hud/craft-complete-feedback";

/**
 * PL160.2 — Day-phase soft world reinforce leftover.
 * Brief soft rim when day phase flips (complements TopBar PL2.2 / PL57.2 +
 * edge haze PL122.2). Clocks unchanged; mute ok.
 * Choice: one-shot twilight-sky rim (not another Dawn/Dusk/Night toast /
 * continuous haze) so phase edges stay world-readable beside TopBar + fog.
 */
describe("CityLands PL160.2 day-phase soft world reinforce leftover", () => {
  it("flashes quiet twilight rim on Dawn/Dusk/Night edges (happy)", () => {
    expect(
      shouldFlashDayPhaseWorldReinforce("Day", DAY_PHASE_DAWN_CUE, true),
    ).toBe(true);
    expect(
      shouldFlashDayPhaseWorldReinforce("Day", DAY_PHASE_DUSK_CUE, true),
    ).toBe(true);
    expect(
      shouldFlashDayPhaseWorldReinforce("Dusk", DAY_PHASE_NIGHT_CUE, true),
    ).toBe(true);

    expect(DAY_PHASE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(DAY_PHASE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = dayPhaseWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(DAY_PHASE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Same gate as TopBar phase cue — rim complements, does not replace.
    expect(
      shouldFlashDayPhaseWorldReinforce("Day", "Dawn", true),
    ).toBe(shouldFlashDayPhaseChangeCue("Day", "Dawn", true));
  });

  it("stays quiet on Day / hydrate / cycle-off; rim ≠ hunt / craft (edge)", () => {
    expect(
      shouldFlashDayPhaseWorldReinforce("Dawn", "Day", true),
    ).toBe(false);
    expect(shouldFlashDayPhaseWorldReinforce(null, "Dawn", true)).toBe(false);
    expect(shouldFlashDayPhaseWorldReinforce("", "Dusk", true)).toBe(false);
    expect(
      shouldFlashDayPhaseWorldReinforce("Day", "Dawn", false),
    ).toBe(false);

    expect(DAY_PHASE_WORLD_REINFORCE.outerRgba).not.toBe(
      HUNT_WIN_WORLD_REINFORCE.outerRgba,
    );
    expect(DAY_PHASE_WORLD_REINFORCE.midRgba).not.toBe(
      CRAFT_COMPLETE_WORLD_REINFORCE.midRgba,
    );
    expect(DAY_PHASE_WORLD_REINFORCE.clearPct).toBeLessThan(
      DAY_PHASE_WORLD_REINFORCE.midPct,
    );
    expect(DAY_PHASE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);

    // Edge haze remains a separate continuous lighting cue.
    expect(DAY_PHASE_EDGE_HAZE.halfWidth).toBeGreaterThan(0);
  });

  it("does not invent clocks / NFT combat; keeps cycle length (failure)", () => {
    expect(DAY_CYCLE_MS).toBe(8 * 60 * 1000);
    expect(dayPhaseWorldReinforceBackground()).not.toMatch(
      /clock\s*change|always.?on|nft/i,
    );
    expect(String(DAY_PHASE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(DAY_PHASE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(
      shouldFlashDayPhaseWorldReinforce("Day", "Dawn", true),
    ).not.toBe(shouldFlashDayPhaseWorldReinforce("Day", "Dawn", false));
  });
});
