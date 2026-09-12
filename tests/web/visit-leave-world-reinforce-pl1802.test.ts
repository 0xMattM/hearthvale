import { describe, expect, it } from "vitest";
import {
  VISIT_LAND_ATMOSPHERE_CUE,
  shouldShowVisitHomeReturnWorldTip,
  visitHomeReturnWorldTip,
  visitLandAtmosphereCue,
} from "@game/shared";
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
 * PL180.2 — Visit-leave soft world reinforce leftover.
 * Kinship: acceptance matches PL139.1 `VISIT_HOME_RETURN_WORLD_REINFORCE`
 * (brief soft meadow rim on leave visit). Do **not** stack a second identical rim —
 * assert the existing reinforce still covers leave-home beside Home ephemeral,
 * visit mist leftover (PL175.2), and Your land tip (PL114.2).
 * Visit rules unchanged; mute ok; fail silent; own-land idle quiet.
 */
describe("CityLands PL180.2 visit-leave soft world reinforce leftover", () => {
  it("reuses PL139.1 meadow rim when leaving a visit (happy)", () => {
    expect(shouldFlashVisitHomeReturnWorldReinforce(true)).toBe(true);
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = visitHomeReturnWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(VISIT_HOME_RETURN_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Home ephemeral + Your land tip + visit mist SoT.
    expect(visitLeaveSuccessCueText()).toBe(VISIT_LEAVE_SUCCESS_CUE);
    expect(visitHomeReturnWorldTip()).toBe("Your land");
    expect(shouldShowVisitHomeReturnWorldTip(true)).toBe(true);
    expect(VISIT_LAND_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(0);
    expect(visitLandAtmosphereCue("visit").show).toBe(true);
  });

  it("stays quiet on own-land idle; mist clears on home; rim brief (edge)", () => {
    expect(shouldFlashVisitHomeReturnWorldReinforce(false)).toBe(false);
    expect(shouldShowVisitHomeReturnWorldTip(false)).toBe(false);
    expect(visitLandAtmosphereCue("home").show).toBe(false);

    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.clearPct).toBeLessThan(
      VISIT_HOME_RETURN_WORLD_REINFORCE.midPct,
    );
    // Leave rim ≠ continuous visit mist (one-shot HUD vs world atmosphere).
    expect(VISIT_HOME_RETURN_WORLD_REINFORCE.outerRgba).not.toBe(
      VISIT_LAND_ATMOSPHERE_CUE.hazeColor,
    );
  });

  it("does not invent a second leave rim or visit fares (failure)", () => {
    expect(visitHomeReturnWorldReinforceBackground()).not.toMatch(
      /visit\s*fare|caravan|second.?rim/i,
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
