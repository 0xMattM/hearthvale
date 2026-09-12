import { describe, expect, it } from "vitest";
import {
  VISIT_ARRIVE_WORLD_REINFORCE,
  visitArriveWorldReinforceBackground,
  shouldFlashVisitArriveWorldReinforce,
} from "../../apps/web/lib/hud/visit-arrive-feedback";
import {
  VISIT_HOME_RETURN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/visit-home-return-feedback";
import {
  TRAVEL_ARRIVE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/travel-arrive-feedback";
import {
  INVITE_ACCEPT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/invite-accept-feedback";
import { visitSuccessCueText } from "../../apps/web/lib/hud/success-cue";
import {
  VISIT_HOST_NAMEPLATE,
  shouldReinforceVisitHostNameplateOnArrive,
} from "@game/shared";

/**
 * PL184.1 — Visit-arrive soft world reinforce leftover.
 * Brief soft rim after visit arrive ok (complements Visiting · ephemeral +
 * host nameplate; visit rules unchanged). Mute ok; fail silent.
 * Choice: one-shot cool guest-teal rim (not another Visiting toast / nameplate
 * pad) so every visit arrive stays world-readable beside ephemeral + shed plate.
 * Not kinship — nameplate pad ≠ HUD shell rim; leave rim is the opposite edge.
 */
describe("CityLands PL184.1 visit-arrive soft world reinforce leftover", () => {
  it("flashes cool guest-teal rim when visit succeeds with host (happy)", () => {
    expect(shouldFlashVisitArriveWorldReinforce(true, "Ada")).toBe(true);
    expect(VISIT_ARRIVE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(VISIT_ARRIVE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = visitArriveWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(VISIT_ARRIVE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Visiting · ephemeral + host nameplate.
    expect(visitSuccessCueText("Ada")).toMatch(/Visiting/);
    expect(shouldReinforceVisitHostNameplateOnArrive(true, "Ada")).toBe(true);
    expect(VISIT_HOST_NAMEPLATE.padColor.toLowerCase()).toBe("#5a8a9a");
  });

  it("stays quiet on fail / empty host; rim ≠ travel cyan / meadow / invite (edge)", () => {
    expect(shouldFlashVisitArriveWorldReinforce(false, "Ada")).toBe(false);
    expect(shouldFlashVisitArriveWorldReinforce(true, "")).toBe(false);
    expect(shouldFlashVisitArriveWorldReinforce(true, "   ")).toBe(false);
    expect(shouldFlashVisitArriveWorldReinforce(true, null)).toBe(false);

    expect(VISIT_ARRIVE_WORLD_REINFORCE.outerRgba).not.toBe(
      TRAVEL_ARRIVE_WORLD_REINFORCE.outerRgba,
    );
    expect(VISIT_ARRIVE_WORLD_REINFORCE.midRgba).not.toBe(
      VISIT_HOME_RETURN_WORLD_REINFORCE.midRgba,
    );
    expect(VISIT_ARRIVE_WORLD_REINFORCE.outerRgba).not.toBe(
      INVITE_ACCEPT_WORLD_REINFORCE.outerRgba,
    );
    expect(VISIT_ARRIVE_WORLD_REINFORCE.clearPct).toBeLessThan(
      VISIT_ARRIVE_WORLD_REINFORCE.midPct,
    );
    expect(VISIT_ARRIVE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent visit fares / NFT combat; keeps ok+host gate (failure)", () => {
    expect(visitArriveWorldReinforceBackground()).not.toMatch(
      /fare|caravan|nft|combat/i,
    );
    expect(String(VISIT_ARRIVE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /coin|cost|timer/i,
    );
    expect(VISIT_ARRIVE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashVisitArriveWorldReinforce(true, "Ada")).not.toBe(
      shouldFlashVisitArriveWorldReinforce(false, "Ada"),
    );
    expect(shouldFlashVisitArriveWorldReinforce(null as never, "Ada")).toBe(
      false,
    );
  });
});
