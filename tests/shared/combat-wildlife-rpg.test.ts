import { describe, expect, it } from "vitest";
import {
  EXPLORE_BUILDINGS,
  LIVE_COMBAT,
  WORLD,
  combatEngageRange,
  stepHuntFoeVisual,
} from "../../packages/shared/src/index.ts";

/**
 * Demo RPG wildlife: slow roam, walk-up aggro, dens off the old hunt plot.
 */
describe("DEMO-COMBAT wildlife RPG", () => {
  it("keeps hunt dens on the explore road, not a north hunt lot (happy)", () => {
    const hunts = EXPLORE_BUILDINGS.filter(
      (b) => b.type === "game_trail" || b.type === "edge_thicket",
    );
    expect(hunts).toHaveLength(4);
    expect(hunts.some((b) => b.type === "game_trail" && b.z < 0)).toBe(true);
    expect(hunts.some((b) => b.x <= -8)).toBe(true);
    expect(hunts.some((b) => b.x >= 8)).toBe(true);
    const reach = combatEngageRange("game_trail");
    expect(reach).toBeLessThan(8);
    expect(LIVE_COMBAT.hareSpeed).toBeLessThan(WORLD.GRID);
  });

  it("does not chase a distant player until walk-up (edge)", () => {
    const step = stepHuntFoeVisual({
      kind: "hare",
      dt: 0.05,
      x: 0,
      z: 0,
      yaw: 0,
      playerLocalX: 8,
      playerLocalZ: 0,
      timeSec: 1,
      seed: 0.2,
      ready: true,
      combatActive: false,
    });
    expect(step.chasing).toBe(false);
    const close = stepHuntFoeVisual({
      kind: "hare",
      dt: 0.05,
      x: 0,
      z: 0,
      yaw: 0,
      playerLocalX: LIVE_COMBAT.aggroRange - 0.2,
      playerLocalZ: 0,
      timeSec: 1,
      seed: 0.2,
      ready: true,
      combatActive: false,
    });
    expect(close.chasing).toBe(true);
  });

  it("refuses rocket aggro numbers (failure)", () => {
    expect(LIVE_COMBAT.hareSpeed).toBeLessThan(2);
    expect(LIVE_COMBAT.aggroRange).toBeLessThan(4);
    expect(combatEngageRange("game_trail")).toBeLessThan(
      LIVE_COMBAT.wanderRadius + LIVE_COMBAT.aggroRange,
    );
  });
});
