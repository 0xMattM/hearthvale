import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FOREST = path.join(
  process.cwd(),
  "apps/web/components/land-scene/ForestEnvironment.tsx",
);

/**
 * Explore env is one mixed canopy — no Woodland / Mines / Hunt grounds pads.
 */
describe("explore mixed wilds environment", () => {
  it("mounts mixed groves and keeps the walk-up tip (happy)", () => {
    const src = fs.readFileSync(FOREST, "utf8");
    expect(src).toContain("ExploreWildsDecor");
    expect(src).toContain("exploreCanopyAtmosphereCue");
    expect(src).toContain("explore-walkup-tip");
    expect(src).toContain("RaisedPathBed");
  });

  it("does not paint woodland / mines / hunt yards (edge)", () => {
    const src = fs.readFileSync(FOREST, "utf8");
    expect(src).not.toContain("ExploreSectionLabel");
    expect(src).not.toContain("ExploreWoodlandLandmark");
    expect(src).not.toContain("ExploreMinesLandmark");
    expect(src).not.toContain("EXPLORE_SECTIONS.filter");
  });

  it("rejects the old zoned floor stack (failure)", () => {
    const src = fs.readFileSync(FOREST, "utf8");
    expect(src).not.toContain('section.id === "mines"');
    expect(src).not.toContain("Hunt grounds");
    expect(src).not.toContain("trees this side");
    expect(() => {
      if (!fs.existsSync(FOREST)) throw new Error("missing forest env");
    }).not.toThrow();
  });
});
