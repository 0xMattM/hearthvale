import { describe, expect, it } from "vitest";
import { CITY_BUILDINGS, WORLD } from "@game/shared";

/** Scarce-yard lawn: 52×30 world, centered at (0, 6.6). */
const YARD = { halfW: 26, halfD: 15, z: 6.6 } as const;
/** Plaza flagstone pad sitting on top of the yard. */
const PLAZA = { halfW: 16, halfD: 14 } as const;

/**
 * True when a city grid cell sits on scarce-yard grass, not plaza stone / streets.
 *
 * @param gridX - Catalog grid X.
 * @param gridZ - Catalog grid Z.
 */
function onScarceYardGrass(gridX: number, gridZ: number): boolean {
  const wx = gridX * WORLD.GRID;
  const wz = gridZ * WORLD.GRID;
  const inYard =
    Math.abs(wx) < YARD.halfW && Math.abs(wz - YARD.z) < YARD.halfD;
  const onPlazaStone = Math.abs(wx) <= PLAZA.halfW && Math.abs(wz) <= PLAZA.halfD;
  return inYard && !onPlazaStone;
}

/**
 * City ore rocks belong on the west scarce-yard lawn, not the street stone.
 */
describe("city ore on scarce-yard grass", () => {
  it("keeps both rocks on yard grass west of the plaza (happy)", () => {
    const ores = CITY_BUILDINGS.filter((b) => b.type === "ore_node");
    expect(ores).toHaveLength(2);
    for (const ore of ores) {
      expect(onScarceYardGrass(ore.x, ore.z)).toBe(true);
      expect(ore.x).toBeLessThan(-6);
    }
  });

  it("keeps the miner on the same lawn (edge)", () => {
    const miner = CITY_BUILDINGS.find((b) => b.tutorialNpcId === "miner")!;
    expect(onScarceYardGrass(miner.x, miner.z)).toBe(true);
    const ores = CITY_BUILDINGS.filter((b) => b.type === "ore_node");
    const minDist = Math.min(
      ...ores.map((o) => Math.hypot(miner.x - o.x, miner.z - o.z)),
    );
    expect(minDist).toBeLessThanOrEqual(3);
  });

  it("does not leave a rock on the west street (failure)", () => {
    const ores = CITY_BUILDINGS.filter((b) => b.type === "ore_node");
    for (const ore of ores) {
      expect(ore.x * WORLD.GRID).toBeGreaterThan(-26);
      expect(Math.abs(ore.x * WORLD.GRID)).toBeGreaterThan(16);
      expect(onScarceYardGrass(ore.x, ore.z)).not.toBe(false);
    }
  });
});
