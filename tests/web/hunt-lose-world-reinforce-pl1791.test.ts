import { describe, expect, it } from "vitest";

import {
  HUNT_LOSE_WORLD_REINFORCE,
  huntLoseWorldReinforceBackground,
  shouldFlashHuntLoseWorldReinforce,
} from "../../apps/web/lib/hud/hunt-lose-feedback";
import {
  HUNT_WIN_WORLD_REINFORCE,
  shouldFlashHuntWinWorldReinforce,
} from "../../apps/web/lib/hud/hunt-win-feedback";
import {
  GUILD_LEAVE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/guild-leave-feedback";
import {
  HUNT_LOSE_SUCCESS_CUE,
  HUNT_LOSE_SUCCESS_CUE_PREFIX,
  huntLoseSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL179.1 — Hunt-lose soft world reinforce leftover.
 * Brief soft rim after hunt lose ok (complements Lost · foe ephemeral +
 * hunt-win rim). Hunt rates / XP unchanged; mute ok; fail silent.
 * Choice: one-shot cool trail-ash rim (not another Lost toast) so lose stays
 * world-readable beside warm win rim.
 */
describe("CityLands PL179.1 hunt-lose soft world reinforce", () => {
  it("flashes quiet cool trail-ash rim when hunt loses (happy)", () => {
    expect(shouldFlashHuntLoseWorldReinforce(false)).toBe(true);
    expect(HUNT_LOSE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(HUNT_LOSE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = huntLoseWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(HUNT_LOSE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Lost · foe ephemeral.
    expect(huntLoseSuccessCueText("Wolf")).toBe(
      `${HUNT_LOSE_SUCCESS_CUE_PREFIX}Wolf`,
    );
    expect(huntLoseSuccessCueText()).toBe(HUNT_LOSE_SUCCESS_CUE);
  });

  it("stays quiet on win / missing; rim ≠ win gold / guild-leave mist (edge)", () => {
    expect(shouldFlashHuntLoseWorldReinforce(true)).toBe(false);
    expect(shouldFlashHuntLoseWorldReinforce(null)).toBe(false);
    expect(shouldFlashHuntLoseWorldReinforce(undefined)).toBe(false);

    expect(HUNT_LOSE_WORLD_REINFORCE.outerRgba).not.toBe(
      HUNT_WIN_WORLD_REINFORCE.outerRgba,
    );
    expect(HUNT_LOSE_WORLD_REINFORCE.midRgba).not.toBe(
      HUNT_WIN_WORLD_REINFORCE.midRgba,
    );
    expect(HUNT_LOSE_WORLD_REINFORCE.outerRgba).not.toBe(
      GUILD_LEAVE_WORLD_REINFORCE.outerRgba,
    );
    expect(HUNT_LOSE_WORLD_REINFORCE.clearPct).toBeLessThan(
      HUNT_LOSE_WORLD_REINFORCE.midPct,
    );
    expect(HUNT_LOSE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);

    // Win and lose gates stay mutually exclusive.
    expect(shouldFlashHuntLoseWorldReinforce(false)).not.toBe(
      shouldFlashHuntWinWorldReinforce(false),
    );
    expect(shouldFlashHuntLoseWorldReinforce(true)).not.toBe(
      shouldFlashHuntWinWorldReinforce(true),
    );
  });

  it("does not invent rates / NFT combat; keeps lose gate (failure)", () => {
    expect(huntLoseWorldReinforceBackground()).not.toMatch(
      /xp\s*curve|always.?on|nft/i,
    );
    expect(String(HUNT_LOSE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(HUNT_LOSE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashHuntLoseWorldReinforce(false)).not.toBe(
      shouldFlashHuntLoseWorldReinforce(true),
    );
  });
});
