import { describe, expect, it } from "vitest";
import {
  PLAYER_COLLISION_RADIUS,
  PLAYER_LAND_GATE,
  landGateInteractPrompt,
  playerLandFrontFenceRailSegments,
  playerLandGateWalkObstacles,
  resolveWalkAgainstObstacles,
  staticMapWalkObstacles,
} from "@game/shared";
import { formatFreeTravelCircuit } from "@game/shared";

/**
 * Player-land yard exit gate (tranquera) — collision gap + short Travel prompt.
 */
describe("player-land yard gate", () => {
  it("leaves the +Z fence center walkable with posts on either side (happy)", () => {
    const posts = playerLandGateWalkObstacles();
    expect(posts).toHaveLength(2);
    expect(posts.map((p) => p.worldX).sort((a, b) => a - b)).toEqual([
      -PLAYER_LAND_GATE.postOffsetX,
      PLAYER_LAND_GATE.postOffsetX,
    ]);
    expect(posts.every((p) => p.worldZ === PLAYER_LAND_GATE.worldZ)).toBe(true);

    const solids = staticMapWalkObstacles("player_land");
    expect(
      solids.some(
        (o) => o.worldX === 0 && o.worldZ === PLAYER_LAND_GATE.worldZ,
      ),
    ).toBe(false);

    const opening = resolveWalkAgainstObstacles(
      PLAYER_LAND_GATE.worldX,
      PLAYER_LAND_GATE.worldZ,
      solids,
    );
    expect(opening.x).toBeCloseTo(PLAYER_LAND_GATE.worldX, 5);
    expect(opening.z).toBeCloseTo(PLAYER_LAND_GATE.worldZ, 5);
  });

  it("blocks walking through a gate post and splits the front rails (edge)", () => {
    const solids = staticMapWalkObstacles("player_land");
    const postX = -PLAYER_LAND_GATE.postOffsetX;
    const pushed = resolveWalkAgainstObstacles(
      postX,
      PLAYER_LAND_GATE.worldZ,
      solids,
    );
    const dist = Math.hypot(
      pushed.x - postX,
      pushed.z - PLAYER_LAND_GATE.worldZ,
    );
    expect(dist).toBeGreaterThanOrEqual(
      PLAYER_COLLISION_RADIUS + PLAYER_LAND_GATE.postRadius - 1e-6,
    );

    const rails = playerLandFrontFenceRailSegments();
    expect(rails).toHaveLength(2);
    const [left, right] = rails;
    expect(left.width).toBeGreaterThan(4);
    expect(right.width).toBe(left.width);
    expect(left.centerX + left.width / 2).toBeCloseTo(
      -PLAYER_LAND_GATE.postOffsetX,
      5,
    );
    expect(right.centerX - right.width / 2).toBeCloseTo(
      PLAYER_LAND_GATE.postOffsetX,
      5,
    );
  });

  it("keeps the gate prompt short and does not add a city gate (failure)", () => {
    const prompt = landGateInteractPrompt();
    expect(prompt).toBe("Travel");
    expect(prompt).not.toContain(formatFreeTravelCircuit());
    expect(prompt.toLowerCase()).not.toMatch(/caravan|fare|instant|circuit/);

    const city = staticMapWalkObstacles("city");
    expect(
      city.some(
        (o) =>
          Math.abs(o.worldX - PLAYER_LAND_GATE.postOffsetX) < 0.01 &&
          o.worldZ === PLAYER_LAND_GATE.worldZ,
      ),
    ).toBe(false);

    const explore = staticMapWalkObstacles("explore");
    expect(
      explore.some(
        (o) =>
          Math.abs(o.worldX - PLAYER_LAND_GATE.postOffsetX) < 0.01 &&
          o.worldZ === PLAYER_LAND_GATE.worldZ,
      ),
    ).toBe(false);
  });
});
