import { describe, expect, it } from "vitest";

import {

  ARENA_LEAVE_WORLD_REINFORCE,

  arenaLeaveWorldReinforceBackground,

  shouldFlashArenaLeaveWorldReinforce,

} from "../../apps/web/lib/hud/arena-leave-feedback";

import {

  ARENA_ENTER_WORLD_REINFORCE,

} from "../../apps/web/lib/hud/arena-enter-feedback";

import {

  VISIT_HOME_RETURN_WORLD_REINFORCE,

} from "../../apps/web/lib/hud/visit-home-return-feedback";

import {

  isLeavingWarriorMap,

  isEnteringWarriorMap,

  shouldFlashTravelArriveSuccessCue,

  travelArriveSuccessCueText,

} from "../../apps/web/lib/hud/success-cue";

import { MAP_IDENTITY } from "@game/shared";



/**

 * PL147.1 — Arena leave soft world reinforce.

 * Brief soft rim when leaving the Warrior Arena map (complements enter PL145.2 +

 * Arrived dest PL115.2; stub / no balance invent). Warrior optional; mute ok.

 * Choice: one-shot dusty amber exit rim (not another Arrived toast) so leave

 * stays world-readable beside ephemeral + map-chip pulse.

 */

describe("CityLands PL147.1 arena leave soft world reinforce", () => {

  it("flashes dusty arena rim when leaving Warrior (happy)", () => {

    expect(isLeavingWarriorMap("warrior", "city")).toBe(true);

    expect(shouldFlashArenaLeaveWorldReinforce(true)).toBe(true);

    expect(ARENA_LEAVE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);

    expect(ARENA_LEAVE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);



    const bg = arenaLeaveWorldReinforceBackground();

    expect(bg).toMatch(/^radial-gradient/);

    expect(bg).toContain(ARENA_LEAVE_WORLD_REINFORCE.outerRgba);

    expect(bg).toContain("transparent");



    // Complements — does not replace — Arrived · dest whisper.

    expect(shouldFlashTravelArriveSuccessCue(true)).toBe(true);

    expect(travelArriveSuccessCueText("city")).toMatch(/Arrived/);

    expect(MAP_IDENTITY.warrior.word).toBe("Arena");

  });



  it("stays quiet off leave; rim ≠ enter peach / visit meadow (edge)", () => {

    expect(shouldFlashArenaLeaveWorldReinforce(false)).toBe(false);

    expect(isLeavingWarriorMap("warrior", "warrior")).toBe(false);

    expect(isLeavingWarriorMap("city", "city")).toBe(false);

    expect(isLeavingWarriorMap(null, "city")).toBe(false);

    expect(isEnteringWarriorMap("city", "warrior")).toBe(true);

    expect(isLeavingWarriorMap("city", "warrior")).toBe(false);



    expect(ARENA_LEAVE_WORLD_REINFORCE.outerRgba).not.toBe(

      ARENA_ENTER_WORLD_REINFORCE.outerRgba,

    );

    expect(ARENA_LEAVE_WORLD_REINFORCE.outerRgba).not.toBe(

      VISIT_HOME_RETURN_WORLD_REINFORCE.outerRgba,

    );

    expect(ARENA_LEAVE_WORLD_REINFORCE.clearPct).toBeLessThan(

      ARENA_LEAVE_WORLD_REINFORCE.midPct,

    );

    expect(ARENA_LEAVE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);

    expect(ARENA_LEAVE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(

      ARENA_ENTER_WORLD_REINFORCE.opacityPeak,

    );

  });



  it("does not invent combat balance / fares; keeps leave gate (failure)", () => {

    expect(arenaLeaveWorldReinforceBackground()).not.toMatch(

      /combat|nft|fare|caravan/i,

    );

    expect(String(ARENA_LEAVE_WORLD_REINFORCE.durationMs)).not.toMatch(

      /balance|dps|hp/i,

    );

    expect(ARENA_LEAVE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);

    expect(shouldFlashArenaLeaveWorldReinforce(true)).not.toBe(

      shouldFlashArenaLeaveWorldReinforce(false),

    );

    expect(shouldFlashArenaLeaveWorldReinforce(null as never)).toBe(false);

    expect(isLeavingWarriorMap("warrior", "")).toBe(false);

  });

});


