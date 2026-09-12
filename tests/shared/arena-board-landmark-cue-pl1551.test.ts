import { describe, expect, it } from "vitest";

import {

  ARENA_BOARD_LANDMARK_CUE,

  ARENA_PLAQUE_HIGHLIGHT_PULSE,

  WARRIOR_ARENA_VISUAL,

  WARRIOR_BUILDINGS,

  arenaBoardLandmarkCue,

  arenaBoardLandmarkEmissiveIntensity,

  arenaBoardLandmarkHazeOpacity,

  arenaBoardLandmarkPulseEnvelope,

  arenaBoardLandmarkVsArenaHazeContrast,

  arenaBoardLandmarkVsPlaqueEmissiveContrast,

  arenaBoardLandmarkVsRingContrast,

  arenaPlaqueCopy,

} from "@game/shared";



/**

 * PL155.1 — Arena board soft landmark cue leftover.

 * Choice: quiet warm clay-amber haze/emissive on existing arena_board so

 * Warrior stub reads at glance (complements walk-up pulse PL129.2 + tip);

 * layouts unchanged; warrior optional; stub / no balance invent.

 */

describe("CityLands PL155.1 arena board soft landmark cue leftover", () => {

  it("pulses warm plaque haze on Warrior arena board (happy)", () => {

    const cue = arenaBoardLandmarkCue("warrior");

    expect(cue.show).toBe(true);

    expect(cue.emissive.toLowerCase()).toBe(

      ARENA_BOARD_LANDMARK_CUE.emissive.toLowerCase(),

    );

    expect(cue.intensity).toBe(ARENA_BOARD_LANDMARK_CUE.intensityBase);

    expect(cue.hazeOpacity).toBe(ARENA_BOARD_LANDMARK_CUE.hazeOpacityBase);

    expect(cue.hazeRadius).toBe(ARENA_BOARD_LANDMARK_CUE.hazeRadius);



    const peak = arenaBoardLandmarkEmissiveIntensity(1);

    const floor = arenaBoardLandmarkEmissiveIntensity(0);

    expect(peak).toBe(ARENA_BOARD_LANDMARK_CUE.intensityPeak);

    expect(floor).toBe(ARENA_BOARD_LANDMARK_CUE.intensityBase);

    expect(peak).toBeGreaterThan(floor);



    const hazePeak = arenaBoardLandmarkHazeOpacity(1);

    const hazeFloor = arenaBoardLandmarkHazeOpacity(0);

    expect(hazePeak).toBeGreaterThan(hazeFloor);

  });



  it("stays quiet off Warrior; clay-amber ≠ face red / ring / haze alone (edge)", () => {

    expect(arenaBoardLandmarkCue("city").show).toBe(false);

    expect(arenaBoardLandmarkCue("explore").show).toBe(false);

    expect(arenaBoardLandmarkCue("player_land").show).toBe(false);

    expect(arenaBoardLandmarkCue("city").intensity).toBe(0);

    expect(arenaBoardLandmarkCue("city").hazeOpacity).toBe(0);



    expect(arenaBoardLandmarkVsPlaqueEmissiveContrast()).toBeGreaterThan(0);

    expect(arenaBoardLandmarkVsRingContrast()).toBeGreaterThan(0);

    expect(arenaBoardLandmarkVsArenaHazeContrast()).toBeGreaterThan(0);

    expect(ARENA_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(

      WARRIOR_ARENA_VISUAL.plaqueEmissive.toLowerCase(),

    );

    expect(ARENA_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(

      WARRIOR_ARENA_VISUAL.ringFillColor.toLowerCase(),

    );

    expect(ARENA_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(

      WARRIOR_ARENA_VISUAL.hazeColor.toLowerCase(),

    );

    // Continuous landmark stays quieter / slower than interact highlight pulse.

    expect(ARENA_BOARD_LANDMARK_CUE.intensityPeak).toBeLessThan(

      ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityPeak,

    );

    expect(ARENA_BOARD_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(

      ARENA_PLAQUE_HIGHLIGHT_PULSE.periodMs,

    );



    const low = arenaBoardLandmarkPulseEnvelope(0);

    const mid = arenaBoardLandmarkPulseEnvelope(

      ARENA_BOARD_LANDMARK_CUE.pulsePeriodMs / 4,

    );

    expect(low).toBeGreaterThanOrEqual(0);

    expect(mid).toBeGreaterThan(low);

  });



  it("does not invent boards or combat balance (failure)", () => {

    expect(WARRIOR_BUILDINGS.some((b) => b.type === "arena_board")).toBe(true);

    expect(

      WARRIOR_BUILDINGS.filter((b) => b.type === "arena_board"),

    ).toHaveLength(3);



    const copy = arenaPlaqueCopy();

    expect(copy.title).toMatch(/warrior|arena/i);

    expect(String(copy.body)).not.toMatch(/ladder balance|matchmaking/i);



    expect(arenaBoardLandmarkEmissiveIntensity(2)).toBe(

      ARENA_BOARD_LANDMARK_CUE.intensityPeak,

    );

    expect(arenaBoardLandmarkEmissiveIntensity(-1)).toBe(

      ARENA_BOARD_LANDMARK_CUE.intensityBase,

    );

    expect(arenaBoardLandmarkPulseEnvelope(Number.NaN)).toBe(0);

    expect(ARENA_BOARD_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);

    expect(String(ARENA_BOARD_LANDMARK_CUE.emissive)).not.toMatch(

      /nft|combat.?gear/i,

    );

  });

});


