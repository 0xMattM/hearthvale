import { describe, expect, it } from "vitest";

import {
  HUNT_WIN_WORLD_REINFORCE,
  huntWinWorldReinforceBackground,
  shouldFlashHuntWinWorldReinforce,
} from "../../apps/web/lib/hud/hunt-win-feedback";
import {
  SOFT_WAR_DELIVER_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/soft-war-deliver-feedback";
import {
  LEVEL_UP_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/level-up-feedback";
import {
  HUNT_WIN_SUCCESS_CUE,
  HUNT_WIN_SUCCESS_CUE_PREFIX,
  huntWinSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL159.1 — Hunt-win soft world reinforce leftover.
 * Brief soft rim after hunt win ok (complements Won · foe ephemeral +
 * trail ready cues). Hunt rates / XP unchanged; mute ok; fail silent.
 * Choice: one-shot warm trail-gold rim (not another Won toast) so win stays
 * world-readable beside trail wayfinding.
 */
describe("CityLands PL159.1 hunt-win soft world reinforce", () => {
  it("flashes quiet warm trail-gold rim when hunt wins (happy)", () => {
    expect(shouldFlashHuntWinWorldReinforce(true)).toBe(true);
    expect(HUNT_WIN_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(HUNT_WIN_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = huntWinWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(HUNT_WIN_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Won · foe ephemeral.
    expect(huntWinSuccessCueText("Wolf")).toBe(
      `${HUNT_WIN_SUCCESS_CUE_PREFIX}Wolf`,
    );
    expect(huntWinSuccessCueText()).toBe(HUNT_WIN_SUCCESS_CUE);
  });

  it("stays quiet on lose; rim ≠ soft-war ember / level-up sage (edge)", () => {
    expect(shouldFlashHuntWinWorldReinforce(false)).toBe(false);
    expect(shouldFlashHuntWinWorldReinforce(null)).toBe(false);
    expect(shouldFlashHuntWinWorldReinforce(undefined)).toBe(false);

    expect(HUNT_WIN_WORLD_REINFORCE.outerRgba).not.toBe(
      SOFT_WAR_DELIVER_WORLD_REINFORCE.outerRgba,
    );
    expect(HUNT_WIN_WORLD_REINFORCE.midRgba).not.toBe(
      SOFT_WAR_DELIVER_WORLD_REINFORCE.midRgba,
    );
    expect(HUNT_WIN_WORLD_REINFORCE.outerRgba).not.toBe(
      LEVEL_UP_WORLD_REINFORCE.outerRgba,
    );
    expect(HUNT_WIN_WORLD_REINFORCE.clearPct).toBeLessThan(
      HUNT_WIN_WORLD_REINFORCE.midPct,
    );
    expect(HUNT_WIN_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent rates / NFT combat; keeps win gate (failure)", () => {
    expect(huntWinWorldReinforceBackground()).not.toMatch(
      /xp\s*curve|always.?on|nft/i,
    );
    expect(String(HUNT_WIN_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(HUNT_WIN_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashHuntWinWorldReinforce(true)).not.toBe(
      shouldFlashHuntWinWorldReinforce(false),
    );
  });
});
