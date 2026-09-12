import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ENERGY,
  EXPLORE_BUILDINGS,
  HUNT_TRAIL_WAYFINDING,
  animalVsMonsterHuntTrailPadContrast,
  animalVsMonsterHuntTrailPathContrast,
  huntTrailWayfindingVisual,
} from "@game/shared";
import { trailVisual } from "../../apps/web/lib/resource-visuals";

/**
 * PL116.1 — Explore hunt-trail wayfinding contrast.
 * Choice: warm sand pad (Animal / game_trail) vs cool dusk mauve (Monster / thicket)
 * so trail≠thicket reads at a glance; hunt rules / spawns unchanged.
 */
describe("CityLands PL116.1 explore hunt-trail wayfinding contrast", () => {
  it("keeps Animal vs Monster pads and paths glanceably distinct (happy)", () => {
    const trail = huntTrailWayfindingVisual("trail", true, false);
    const thicket = huntTrailWayfindingVisual("thicket", true, false);

    expect(trail.showWayfindingPad).toBe(true);
    expect(thicket.showWayfindingPad).toBe(true);
    expect(trail.padColor.toLowerCase()).toBe(
      HUNT_TRAIL_WAYFINDING.trail.padColor.toLowerCase(),
    );
    expect(thicket.padColor.toLowerCase()).toBe(
      HUNT_TRAIL_WAYFINDING.thicket.padColor.toLowerCase(),
    );
    expect(trail.padColor.toLowerCase()).not.toBe(
      thicket.padColor.toLowerCase(),
    );
    expect(trail.pathColor.toLowerCase()).not.toBe(
      thicket.pathColor.toLowerCase(),
    );
    expect(animalVsMonsterHuntTrailPadContrast()).toBeGreaterThan(70);
    expect(animalVsMonsterHuntTrailPathContrast()).toBeGreaterThan(55);

    const meshTrail = trailVisual(true, false, "trail");
    const meshThicket = trailVisual(true, false, "thicket");
    expect(meshTrail.padColor).toBe(trail.padColor);
    expect(meshThicket.padColor).toBe(thicket.padColor);
    expect(meshTrail.showWayfindingPad).toBe(true);
  });

  it("softens cooling pads but keeps trail≠thicket contrast (edge)", () => {
    const trailReady = huntTrailWayfindingVisual("trail", true, false);
    const trailCool = huntTrailWayfindingVisual("trail", false, false);
    const thicketCool = huntTrailWayfindingVisual("thicket", false, false);

    expect(trailCool.showWayfindingPad).toBe(true);
    expect(trailCool.padOpacity).toBeLessThan(trailReady.padOpacity);
    expect(trailCool.padEmissiveIntensity).toBeLessThan(
      trailReady.padEmissiveIntensity,
    );
    expect(trailCool.padColor.toLowerCase()).not.toBe(
      thicketCool.padColor.toLowerCase(),
    );
    expect(trailCool.creatureColor.toLowerCase()).not.toBe(
      thicketCool.creatureColor.toLowerCase(),
    );

    const exploreHunt = EXPLORE_BUILDINGS.filter(
      (b) => b.type === "game_trail" || b.type === "edge_thicket",
    );
    expect(exploreHunt.some((b) => b.type === "game_trail")).toBe(true);
    expect(exploreHunt.some((b) => b.type === "edge_thicket")).toBe(true);
  });

  it("does not invent stations or change hunt energy / explore-only gate (failure)", () => {
    expect(ENERGY.costs.hunt).toBe(12);
    expect(ACTION_ERROR.huntExploreOnly).toMatch(/Exploration/i);
    expect(
      Object.keys(HUNT_TRAIL_WAYFINDING.trail).every(
        (k) =>
          k.startsWith("path") ||
          k.startsWith("creature") ||
          k.startsWith("pad"),
      ),
    ).toBe(true);
    expect(HUNT_TRAIL_WAYFINDING.trail.padColor).not.toBe(
      HUNT_TRAIL_WAYFINDING.thicket.padColor,
    );
    expect(animalVsMonsterHuntTrailPadContrast()).not.toBe(0);
    expect(trailVisual(false, false, "trail").showReadyBadge).toBe(false);
    expect(trailVisual(true, false, "thicket").showReadyBadge).toBe(true);
  });
});
