import { describe, expect, it } from "vitest";
import {
  BUILDING_COLLISION_RADIUS,
  PLAYER_COLLISION_RADIUS,
  buildingWalkObstacle,
  resolveWalkAgainstObstacles,
  staticMapWalkObstacles,
  walkObstaclesForMap,
  walkObstaclesFromBuildings,
} from "@game/shared";
import { WORLD } from "@game/shared";

/**
 * Walk collision — solids block avatars but leave E-interact budget.
 */
describe("world walk collision", () => {
  it("pushes the player out of a station footprint (happy)", () => {
    const mill = buildingWalkObstacle("mill", 0, 0);
    expect(mill).not.toBeNull();
    const cleared = resolveWalkAgainstObstacles(0, 0, [mill!]);
    const dist = Math.hypot(cleared.x - mill!.worldX, cleared.z - mill!.worldZ);
    expect(dist).toBeGreaterThanOrEqual(
      PLAYER_COLLISION_RADIUS + mill!.radius - 1e-6,
    );
  });

  it("keeps player+building radius under interact range (edge)", () => {
    for (const radius of Object.values(BUILDING_COLLISION_RADIUS)) {
      expect(PLAYER_COLLISION_RADIUS + radius).toBeLessThan(WORLD.INTERACT_RANGE);
    }
    const forge = buildingWalkObstacle("forge", 2, -1)!;
    const contact = resolveWalkAgainstObstacles(
      forge.worldX + forge.radius + PLAYER_COLLISION_RADIUS - 0.01,
      forge.worldZ,
      [forge],
    );
    const dist = Math.hypot(
      contact.x - forge.worldX,
      contact.z - forge.worldZ,
    );
    expect(dist).toBeLessThanOrEqual(WORLD.INTERACT_RANGE);
  });

  it("skips unknown types and still merges map solids (failure)", () => {
    expect(buildingWalkObstacle("not_a_building", 1, 1)).toBeNull();
    expect(
      walkObstaclesFromBuildings([{ type: "ghost_hut", x: 0, z: 0 }]),
    ).toEqual([]);
    const city = staticMapWalkObstacles("city");
    expect(city.length).toBeGreaterThan(0);
    const merged = walkObstaclesForMap(
      [{ type: "vendor_stall", x: 1, z: 0 }],
      "city",
    );
    expect(merged.length).toBe(city.length + 1);
    expect(staticMapWalkObstacles("not_a_map")).toEqual([]);
  });

  it("lets the player walk former civic-house pads (city houses gone)", () => {
    const city = staticMapWalkObstacles("city");
    const leftover = [
      { worldX: -20, worldZ: -14 },
      { worldX: 20, worldZ: -14 },
      { worldX: -20, worldZ: 16 },
      { worldX: 20, worldZ: 16 },
    ];
    for (const pad of leftover) {
      expect(
        city.some(
          (o) => o.worldX === pad.worldX && o.worldZ === pad.worldZ,
        ),
      ).toBe(false);
      const cleared = resolveWalkAgainstObstacles(pad.worldX, pad.worldZ, city);
      expect(
        Math.hypot(cleared.x - pad.worldX, cleared.z - pad.worldZ),
      ).toBeLessThan(0.05);
    }
  });
});
