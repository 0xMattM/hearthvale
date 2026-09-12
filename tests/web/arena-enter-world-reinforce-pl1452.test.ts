import { describe, expect, it } from "vitest";
import {
  ARENA_ENTER_WORLD_REINFORCE,
  arenaEnterWorldReinforceBackground,
  shouldFlashArenaEnterWorldReinforce,
} from "../../apps/web/lib/hud/arena-enter-feedback";
import {
  VISIT_HOME_RETURN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/visit-home-return-feedback";
import {
  QUEST_CLAIM_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/quest-claim-feedback";
import {
  isEnteringWarriorMap,
  shouldFlashTravelArriveSuccessCue,
  travelArriveSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { MAP_IDENTITY, WARRIOR_ARENA_VISUAL } from "@game/shared";

/**
 * PL145.2 — Arena enter soft world reinforce.
 * Brief soft rim when arriving on Arena map (complements Arrived PL115.2 +
 * first Warrior tip PL53.2 + warm haze PL41.2; stub / no balance invent).
 * Warrior optional; mute ok.
 * Choice: one-shot warm arena rim (not another Arrived toast) so Arena stay
 * world-readable beside ephemeral + map-chip pulse.
 */
describe("CityLands PL145.2 arena enter soft world reinforce", () => {
  it("flashes warm arena rim when entering Warrior (happy)", () => {
    expect(isEnteringWarriorMap("city", "warrior")).toBe(true);
    expect(shouldFlashArenaEnterWorldReinforce(true)).toBe(true);
    expect(ARENA_ENTER_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(ARENA_ENTER_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = arenaEnterWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(ARENA_ENTER_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Arrived · Arena whisper.
    expect(shouldFlashTravelArriveSuccessCue(true)).toBe(true);
    expect(travelArriveSuccessCueText("warrior")).toMatch(/Arrived/);
    expect(MAP_IDENTITY.warrior.word).toBe("Arena");
  });

  it("stays quiet off Arena; rim ≠ visit meadow / quest verdant (edge)", () => {
    expect(shouldFlashArenaEnterWorldReinforce(false)).toBe(false);
    expect(isEnteringWarriorMap("warrior", "warrior")).toBe(false);
    expect(isEnteringWarriorMap("city", "city")).toBe(false);

    expect(ARENA_ENTER_WORLD_REINFORCE.outerRgba).not.toBe(
      VISIT_HOME_RETURN_WORLD_REINFORCE.outerRgba,
    );
    expect(ARENA_ENTER_WORLD_REINFORCE.outerRgba).not.toBe(
      QUEST_CLAIM_WORLD_REINFORCE.outerRgba,
    );
    expect(ARENA_ENTER_WORLD_REINFORCE.clearPct).toBeLessThan(
      ARENA_ENTER_WORLD_REINFORCE.midPct,
    );
    expect(ARENA_ENTER_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
    // Warm kinship with arena plaque / map accent — not cool explore.
    expect(WARRIOR_ARENA_VISUAL.plaqueAccent.toLowerCase()).toMatch(/^#/);
    expect(MAP_IDENTITY.warrior.accent.toLowerCase()).toMatch(/^#d/);
  });

  it("does not invent combat balance / fares; keeps enter gate (failure)", () => {
    expect(arenaEnterWorldReinforceBackground()).not.toMatch(
      /combat|nft|fare|caravan/i,
    );
    expect(String(ARENA_ENTER_WORLD_REINFORCE.durationMs)).not.toMatch(
      /balance|dps|hp/i,
    );
    expect(ARENA_ENTER_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashArenaEnterWorldReinforce(true)).not.toBe(
      shouldFlashArenaEnterWorldReinforce(false),
    );
    expect(shouldFlashArenaEnterWorldReinforce(null as never)).toBe(false);
  });
});
