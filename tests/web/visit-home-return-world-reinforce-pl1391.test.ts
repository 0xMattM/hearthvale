import { describe, expect, it } from "vitest";
import {
  shouldShowVisitHomeReturnWorldTip,
  visitHomeReturnWorldTip,
} from "@game/shared";
import {
  MARKET_LIST_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/market-list-feedback";
import {
  QUEST_CLAIM_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/quest-claim-feedback";
import {
  VISIT_HOME_RETURN_WORLD_REINFORCE,
  shouldFlashVisitHomeReturnWorldReinforce,
  visitHomeReturnWorldReinforceBackground,
} from "../../apps/web/lib/hud/visit-home-return-feedback";
import {
  VISIT_LEAVE_SUCCESS_CUE,
  visitLeaveSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL139.1 — Visit home-return soft world reinforce.
 * Brief soft meadow rim on leave visit (complements Your land PL114.2 + Home PL27.1).
 * Visit rules unchanged; mute ok; own-land idle silent.
 * Choice: one-shot warm Land-chip meadow rim (not another Home toast) so return
 * stays world-readable beside tip + chip pulse.
 */
describe("CityLands PL139.1 visit home-return soft world reinforce", () => {
  it("flashes soft meadow rim when leaving a visit (happy)", () => {
    expect(shouldFlashVisitHomeReturnWorldReinforce(true)).toBe(true);
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = visitHomeReturnWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(VISIT_HOME_RETURN_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Home ephemeral + Your land tip.
    expect(visitLeaveSuccessCueText()).toBe(VISIT_LEAVE_SUCCESS_CUE);
    expect(visitHomeReturnWorldTip()).toBe("Your land");
    expect(shouldShowVisitHomeReturnWorldTip(true)).toBe(true);
  });

  it("stays quiet on own-land idle; rim ≠ quest verdant / market teal (edge)", () => {
    expect(shouldFlashVisitHomeReturnWorldReinforce(false)).toBe(false);

    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.outerRgba).not.toBe(
      QUEST_CLAIM_WORLD_REINFORCE.outerRgba,
    );
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.outerRgba).not.toBe(
      MARKET_LIST_WORLD_REINFORCE.outerRgba,
    );
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.clearPct).toBeLessThan(
      VISIT_HOME_RETURN_WORLD_REINFORCE.midPct,
    );
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent visit rules; keeps wasVisiting gate (failure)", () => {
    expect(visitHomeReturnWorldReinforceBackground()).not.toMatch(
      /visit\s*fare|caravan/i,
    );
    expect(String(VISIT_HOME_RETURN_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashVisitHomeReturnWorldReinforce(true)).not.toBe(
      shouldFlashVisitHomeReturnWorldReinforce(false),
    );
  });
});
