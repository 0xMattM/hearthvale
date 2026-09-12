import { describe, expect, it } from "vitest";
import {
  TRAVEL_ARRIVE_WORLD_REINFORCE,
  travelArriveWorldReinforceBackground,
  shouldFlashTravelArriveWorldReinforce,
} from "../../apps/web/lib/hud/travel-arrive-feedback";
import {
  ARENA_ENTER_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/arena-enter-feedback";
import {
  ARENA_LEAVE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/arena-leave-feedback";
import {
  VISIT_HOME_RETURN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/visit-home-return-feedback";
import {
  shouldFlashTravelArriveSuccessCue,
  travelArriveSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { PORTAL_FREE_TRAVEL_SOFT_PULSE, MAP_IDENTITY } from "@game/shared";

/**
 * PL164.1 — Travel-arrive soft world reinforce leftover.
 * Brief soft rim after map travel Arrived (complements Arrived dest ephemeral +
 * Free portal pulse; fares stay free). Mute ok; fail silent.
 * Choice: one-shot cool Free cyan rim (not another Arrived toast) so every map
 * hop stays world-readable beside dest whisper + portal Free pulse.
 */
describe("CityLands PL164.1 travel-arrive soft world reinforce leftover", () => {
  it("flashes cool Free cyan rim when travel succeeds (happy)", () => {
    expect(shouldFlashTravelArriveWorldReinforce(true)).toBe(true);
    expect(TRAVEL_ARRIVE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(TRAVEL_ARRIVE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = travelArriveWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(TRAVEL_ARRIVE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Arrived · dest whisper + Free pulse.
    expect(shouldFlashTravelArriveSuccessCue(true)).toBe(true);
    expect(travelArriveSuccessCueText("city")).toMatch(/Arrived/);
    expect(PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive.toLowerCase()).toBe("#6ec8ff");
    expect(MAP_IDENTITY.city.portalVeil.toLowerCase()).toBe("#6ec8ff");
  });

  it("stays quiet on fail; rim ≠ Arena warm / leave dust / meadow (edge)", () => {
    expect(shouldFlashTravelArriveWorldReinforce(false)).toBe(false);

    expect(TRAVEL_ARRIVE_WORLD_REINFORCE.outerRgba).not.toBe(
      ARENA_ENTER_WORLD_REINFORCE.outerRgba,
    );
    expect(TRAVEL_ARRIVE_WORLD_REINFORCE.midRgba).not.toBe(
      ARENA_LEAVE_WORLD_REINFORCE.midRgba,
    );
    expect(TRAVEL_ARRIVE_WORLD_REINFORCE.outerRgba).not.toBe(
      VISIT_HOME_RETURN_WORLD_REINFORCE.outerRgba,
    );
    expect(TRAVEL_ARRIVE_WORLD_REINFORCE.clearPct).toBeLessThan(
      TRAVEL_ARRIVE_WORLD_REINFORCE.midPct,
    );
    expect(TRAVEL_ARRIVE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent fares / caravan / NFT combat; keeps ok gate (failure)", () => {
    expect(travelArriveWorldReinforceBackground()).not.toMatch(
      /fare|caravan|nft|combat/i,
    );
    expect(String(TRAVEL_ARRIVE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /coin|cost|timer/i,
    );
    expect(TRAVEL_ARRIVE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashTravelArriveWorldReinforce(true)).not.toBe(
      shouldFlashTravelArriveWorldReinforce(false),
    );
    expect(shouldFlashTravelArriveWorldReinforce(null as never)).toBe(false);
  });
});
