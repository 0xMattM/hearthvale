import { describe, expect, it } from "vitest";
import {
  EXPLORE_SECTIONS,
  EXPLORE_WILDS_VISUAL,
  exploreVsHomesteadCanopyContrast,
  exploreWildsFloorColors,
  HOMESTEAD_YARD_VISUAL,
} from "@game/shared";

/**
 * PL36.2 — Explore wilds soft atmosphere SoT.
 * Choice: cooler outer canopy + soft haze vs homestead meadow; section floors (PL4.*)
 * stay on EXPLORE_SECTIONS; no spawn invent.
 */
describe("CityLands PL36.2 explore wilds soft atmosphere", () => {
  it("cools outer canopy apart from homestead meadow (happy)", () => {
    const wilds = exploreWildsFloorColors();
    expect(wilds.canopyColor.toLowerCase()).toBe(
      EXPLORE_WILDS_VISUAL.canopyColor.toLowerCase(),
    );
    expect(wilds.canopyColor.toLowerCase()).not.toBe(
      HOMESTEAD_YARD_VISUAL.meadowColor.toLowerCase(),
    );
    expect(exploreVsHomesteadCanopyContrast()).toBeGreaterThan(40);
    expect(wilds.hazeOpacity).toBeGreaterThan(0);
    expect(wilds.hazeOpacity).toBeLessThan(0.5);
  });

  it("keeps section floors distinct and haze softer than solid floor (edge)", () => {
    const floors = EXPLORE_SECTIONS.map((s) => s.floorColor.toLowerCase());
    expect(new Set(floors).size).toBe(EXPLORE_SECTIONS.length);
    const wilds = exploreWildsFloorColors();
    for (const section of EXPLORE_SECTIONS) {
      expect(section.floorColor.toLowerCase()).not.toBe(
        wilds.canopyColor.toLowerCase(),
      );
    }
    expect(wilds.pathColor.toLowerCase()).toBe(
      EXPLORE_WILDS_VISUAL.pathColor.toLowerCase(),
    );
  });

  it("refuses inventing spawns; section count stays locked (failure)", () => {
    expect(EXPLORE_SECTIONS.length).toBe(3);
    expect(EXPLORE_SECTIONS.map((s) => s.id).sort()).toEqual([
      "hunt",
      "mines",
      "woodland",
    ]);
    // Atmosphere palette has no spawn / foe invent fields.
    expect(
      Object.keys(EXPLORE_WILDS_VISUAL).every(
        (k) =>
          k === "canopyColor" ||
          k === "pathColor" ||
          k === "hazeColor" ||
          k === "hazeOpacity" ||
          k === "treeTrunkColor" ||
          k === "treeCanopyColor" ||
          k === "treeCanopyAltColor",
      ),
    ).toBe(true);
    expect(exploreWildsFloorColors().canopyColor).toBe(
      EXPLORE_WILDS_VISUAL.canopyColor,
    );
  });
});
