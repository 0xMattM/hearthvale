import { describe, expect, it } from "vitest";
import {
  CITY_PLAZA_LANDMARK_CUE,
  EXPLORE_BUILDINGS,
  EXPLORE_SECTION_LANDMARK_CUE,
  EXPLORE_SECTIONS,
  exploreSectionFloorContrastMin,
  exploreSectionLandmarkCue,
  exploreSectionLandmarkEmissiveIntensity,
  exploreSectionLandmarkHazeOpacity,
  exploreSectionLandmarkPulseEnvelope,
  exploreSectionLandmarkVsHomesteadContrast,
  exploreSectionLandmarkVsHuntFloorContrast,
  exploreSectionLandmarkVsPlazaContrast,
  HOMESTEAD_YARD_VISUAL,
} from "@game/shared";

/**
 * PL140.1 — Explore section soft landmark cue.
 * Choice: quiet cooler teal-mist emissive + haze on the existing woodland
 * floor so wilds read apart from homestead/city (complements hunt-trail
 * PL116.1 + Explore tip PL45.1); layouts / spawns unchanged; no station invent.
 */
describe("CityLands PL140.1 explore section soft landmark cue", () => {
  it("pulses soft cooler emissive / haze on woodland floor (happy)", () => {
    const cue = exploreSectionLandmarkCue();
    expect(cue.sectionId).toBe("woodland");
    expect(cue.emissive.toLowerCase()).toBe(
      EXPLORE_SECTION_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(EXPLORE_SECTION_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(EXPLORE_SECTION_LANDMARK_CUE.hazeOpacityBase);

    const woodland = EXPLORE_SECTIONS.find((s) => s.id === "woodland")!;
    expect(cue.floorColor.toLowerCase()).toBe(woodland.floorColor.toLowerCase());
    expect(cue.gridX).toBe(woodland.x);
    expect(cue.gridZ).toBe(woodland.z);
    expect(cue.floorWidth).toBe(woodland.floorSize[0]);
    expect(cue.floorDepth).toBe(woodland.floorSize[1]);

    const peak = exploreSectionLandmarkEmissiveIntensity(1);
    const floor = exploreSectionLandmarkEmissiveIntensity(0);
    expect(peak).toBe(EXPLORE_SECTION_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(EXPLORE_SECTION_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = exploreSectionLandmarkHazeOpacity(1);
    const hazeFloor = exploreSectionLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays cool vs homestead / plaza / hunt; pulse oscillates (edge)", () => {
    expect(exploreSectionLandmarkVsHomesteadContrast()).toBeGreaterThan(40);
    expect(exploreSectionLandmarkVsPlazaContrast()).toBeGreaterThan(20);
    expect(exploreSectionLandmarkVsHuntFloorContrast()).toBeGreaterThan(40);
    expect(EXPLORE_SECTION_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      HOMESTEAD_YARD_VISUAL.meadowColor.toLowerCase(),
    );
    expect(EXPLORE_SECTION_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );

    expect(EXPLORE_SECTION_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(0);
    const low = exploreSectionLandmarkPulseEnvelope(0);
    const mid = exploreSectionLandmarkPulseEnvelope(
      EXPLORE_SECTION_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThanOrEqual(1);
    expect(mid).toBeGreaterThan(low);

    expect(exploreSectionFloorContrastMin()).toBeGreaterThan(30);
  });

  it("does not invent stations; clamps / explore layout stay intact (failure)", () => {
    expect(EXPLORE_BUILDINGS.some((b) => b.type === "tree_stump")).toBe(true);
    expect(EXPLORE_BUILDINGS.some((b) => b.type === "civic_hall" as never)).toBe(
      false,
    );
    expect(exploreSectionLandmarkEmissiveIntensity(2)).toBe(
      EXPLORE_SECTION_LANDMARK_CUE.intensityPeak,
    );
    expect(exploreSectionLandmarkEmissiveIntensity(-1)).toBe(
      EXPLORE_SECTION_LANDMARK_CUE.intensityBase,
    );
    expect(exploreSectionLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(EXPLORE_SECTION_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(EXPLORE_SECTION_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat/i,
    );
    expect(EXPLORE_SECTIONS.map((s) => s.id)).toEqual([
      "woodland",
      "mines",
      "hunt",
    ]);
  });
});
