import { describe, expect, it } from "vitest";
import {
  MAP_WALK_BOUNDS,
  clampWalkPosition,
  walkBoundsForLandKind,
} from "@game/shared";

/**
 * Per-map walk clamp — City/Explore must exceed homestead ±7.2.
 */
describe("map walk bounds", () => {
  it("city and explore allow walking past homestead yard (happy)", () => {
    const land = walkBoundsForLandKind("player_land");
    const city = walkBoundsForLandKind("city");
    const explore = walkBoundsForLandKind("explore");
    expect(land.halfX).toBe(7.2);
    expect(city.halfX).toBeGreaterThan(land.halfX);
    expect(explore.halfX).toBeGreaterThan(land.halfX);
    expect(clampWalkPosition(20, 0, "city").x).toBe(20);
    expect(clampWalkPosition(20, 0, "player_land").x).toBe(7.2);
  });

  it("normalizes legacy aliases and warrior (edge)", () => {
    expect(walkBoundsForLandKind("starter")).toEqual(MAP_WALK_BOUNDS.player_land);
    expect(walkBoundsForLandKind("forest")).toEqual(MAP_WALK_BOUNDS.explore);
    expect(walkBoundsForLandKind("warrior").halfX).toBeGreaterThan(
      MAP_WALK_BOUNDS.player_land.halfX,
    );
  });

  it("unknown kind falls back to homestead clamp (failure)", () => {
    expect(walkBoundsForLandKind("not_a_map")).toEqual(
      MAP_WALK_BOUNDS.player_land,
    );
    expect(clampWalkPosition(99, -99, null)).toEqual({ x: 7.2, z: -7.2 });
  });

  it("NFT small yard is larger than the free starter land (happy)", () => {
    const starter = walkBoundsForLandKind("player_land");
    const small = walkBoundsForLandKind("player_land", "small");
    expect(starter.halfX).toBe(7.2);
    expect(small.halfX).toBeGreaterThan(starter.halfX);
    expect(clampWalkPosition(20, 0, "player_land", "small").x).toBe(small.halfX);
  });
});
