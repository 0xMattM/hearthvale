import { describe, expect, it } from "vitest";
import {
  ARENA_PLAQUE_HIGHLIGHT_PULSE,
  WARRIOR_ARENA_VISUAL,
  WARRIOR_BUILDINGS,
  arenaBoardWorldLabel,
  arenaPlaqueCopy,
  arenaPlaqueHighlightPulseEmissiveIntensity,
  arenaPlaqueHighlightPulseEnvelope,
  isWarriorTrainingBuildingType,
} from "@game/shared";

/**
 * PL129.2 — Arena plaque soft walk-up pulse.
 * Choice: soft plaque emissive sine while interact-highlighted (not one-shot)
 * so optional warrior path stays glanceable beside PL41.2 haze / PL11.1 plaque;
 * arena stub / no balance invent; mute ok.
 */
describe("CityLands PL129.2 arena plaque soft walk-up pulse", () => {
  it("pulses plaque emissive only while highlighted (happy)", () => {
    const peak = 1;
    expect(
      arenaPlaqueHighlightPulseEmissiveIntensity(true, false, peak),
    ).toBeCloseTo(ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityPeak, 5);
    expect(
      arenaPlaqueHighlightPulseEmissiveIntensity(true, false, 0),
    ).toBeCloseTo(ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityBase, 5);
    expect(ARENA_PLAQUE_HIGHLIGHT_PULSE.periodMs).toBeGreaterThan(0);
    expect(ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityBase).toBeCloseTo(
      WARRIOR_ARENA_VISUAL.plaqueEmissiveIntensityLit,
      5,
    );
    expect(ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityIdle).toBeCloseTo(
      WARRIOR_ARENA_VISUAL.plaqueEmissiveIntensity,
      5,
    );
    expect(arenaBoardWorldLabel().toLowerCase()).toMatch(/optional/);
  });

  it("keeps idle steady and walk-up brighter; envelope soft (edge)", () => {
    expect(
      arenaPlaqueHighlightPulseEmissiveIntensity(false, false, 1),
    ).toBeCloseTo(ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityIdle, 5);

    const walkUpFloor = arenaPlaqueHighlightPulseEmissiveIntensity(
      true,
      true,
      0,
    );
    expect(walkUpFloor).toBeCloseTo(
      ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityWalkUp,
      5,
    );
    expect(walkUpFloor).toBeGreaterThan(
      ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityBase,
    );

    const mid = arenaPlaqueHighlightPulseEnvelope(
      ARENA_PLAQUE_HIGHLIGHT_PULSE.periodMs / 4,
    );
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThanOrEqual(1);
    expect(ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityPeak).toBeGreaterThan(
      ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityBase,
    );

    const copy = arenaPlaqueCopy();
    expect(`${copy.lead} ${copy.body}`.toLowerCase()).toMatch(/optional/);
  });

  it("does not invent balance; clamps / warrior-only boards stay intact (failure)", () => {
    expect(arenaPlaqueHighlightPulseEnvelope(-1)).toBeGreaterThanOrEqual(0);
    expect(
      arenaPlaqueHighlightPulseEmissiveIntensity(false, false, 3),
    ).toBeCloseTo(ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityIdle, 5);
    expect(
      arenaPlaqueHighlightPulseEmissiveIntensity(true, false, -2),
    ).toBeCloseTo(ARENA_PLAQUE_HIGHLIGHT_PULSE.intensityBase, 5);

    const keys = Object.keys(ARENA_PLAQUE_HIGHLIGHT_PULSE);
    expect(
      keys.every((k) => !/dmg|hp|ladder|gear|damage|defense/i.test(k)),
    ).toBe(true);
    expect(isWarriorTrainingBuildingType("arena_board")).toBe(true);
    expect(
      WARRIOR_BUILDINGS.filter((b) => b.type === "arena_board").length,
    ).toBeGreaterThan(0);
    expect(arenaPlaqueCopy().noLadderNote.toLowerCase()).toMatch(/no combat/);
  });
});
