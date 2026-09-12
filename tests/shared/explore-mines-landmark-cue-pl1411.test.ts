import { describe, expect, it } from "vitest";
import {
  EXPLORE_BUILDINGS,
  EXPLORE_MINES_LANDMARK_CUE,
  EXPLORE_SECTION_LANDMARK_CUE,
  EXPLORE_SECTIONS,
  exploreMinesLandmarkCue,
  exploreMinesLandmarkEmissiveIntensity,
  exploreMinesLandmarkHazeOpacity,
  exploreMinesLandmarkPulseEnvelope,
  exploreMinesLandmarkVsHomesteadContrast,
  exploreMinesLandmarkVsHuntFloorContrast,
  exploreMinesLandmarkVsWoodlandContrast,
  exploreSectionFloorContrastMin,
  HOMESTEAD_YARD_VISUAL,
} from "@game/shared";

/**
 * PL141.1 — Explore mines soft landmark cue.
 * Choice: quiet cooler stone emissive + haze on the existing mines floor so
 * ore grounds read apart from woodland teal PL140.1 + hunt warmth (complements
 * section floors PL4.2); layouts / spawns unchanged; no station invent.
 */
describe("CityLands PL141.1 explore mines soft landmark cue", () => {
  it("pulses soft cooler stone emissive / haze on mines floor (happy)", () => {
    const cue = exploreMinesLandmarkCue();
    expect(cue.sectionId).toBe("mines");
    expect(cue.emissive.toLowerCase()).toBe(
      EXPLORE_MINES_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(EXPLORE_MINES_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(EXPLORE_MINES_LANDMARK_CUE.hazeOpacityBase);

    const mines = EXPLORE_SECTIONS.find((s) => s.id === "mines")!;
    expect(cue.floorColor.toLowerCase()).toBe(mines.floorColor.toLowerCase());
    expect(cue.gridX).toBe(mines.x);
    expect(cue.gridZ).toBe(mines.z);
    expect(cue.floorWidth).toBe(mines.floorSize[0]);
    expect(cue.floorDepth).toBe(mines.floorSize[1]);

    const peak = exploreMinesLandmarkEmissiveIntensity(1);
    const floor = exploreMinesLandmarkEmissiveIntensity(0);
    expect(peak).toBe(EXPLORE_MINES_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(EXPLORE_MINES_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = exploreMinesLandmarkHazeOpacity(1);
    const hazeFloor = exploreMinesLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays stone-cool vs woodland / hunt / homestead; pulse oscillates (edge)", () => {
    expect(exploreMinesLandmarkVsWoodlandContrast()).toBeGreaterThan(20);
    expect(exploreMinesLandmarkVsHuntFloorContrast()).toBeGreaterThan(40);
    expect(exploreMinesLandmarkVsHomesteadContrast()).toBeGreaterThan(40);
    expect(EXPLORE_MINES_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_SECTION_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(EXPLORE_MINES_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      HOMESTEAD_YARD_VISUAL.meadowColor.toLowerCase(),
    );

    expect(EXPLORE_MINES_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(0);
    const low = exploreMinesLandmarkPulseEnvelope(0);
    const mid = exploreMinesLandmarkPulseEnvelope(
      EXPLORE_MINES_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThanOrEqual(1);
    expect(mid).toBeGreaterThan(low);

    expect(exploreSectionFloorContrastMin()).toBeGreaterThan(30);
  });

  it("does not invent stations; clamps / explore layout stay intact (failure)", () => {
    expect(EXPLORE_BUILDINGS.some((b) => b.type === "ore_node")).toBe(true);
    expect(EXPLORE_BUILDINGS.some((b) => b.type === "civic_hall" as never)).toBe(
      false,
    );
    expect(exploreMinesLandmarkEmissiveIntensity(2)).toBe(
      EXPLORE_MINES_LANDMARK_CUE.intensityPeak,
    );
    expect(exploreMinesLandmarkEmissiveIntensity(-1)).toBe(
      EXPLORE_MINES_LANDMARK_CUE.intensityBase,
    );
    expect(exploreMinesLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(EXPLORE_MINES_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(EXPLORE_MINES_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat/i,
    );
    expect(EXPLORE_SECTIONS.map((s) => s.id)).toEqual([
      "woodland",
      "mines",
      "hunt",
    ]);
  });
});
