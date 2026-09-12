import { describe, expect, it } from "vitest";
import {
  CITY_ATMOSPHERE_BUSH_PLACEMENTS,
  CITY_ATMOSPHERE_EXTRA_PLACEMENTS,
  CITY_ATMOSPHERE_FENCE_PLACEMENTS,
  CITY_ATMOSPHERE_MAIN_HALL,
  CITY_ATMOSPHERE_TREE_PLACEMENTS,
  CITY_BUILDINGS,
  CITY_SCARCE_STATION_TYPES,
  FOLIAGE_OCCLUSION,
  WORLD,
  cityAtmosphereBushes,
  cityAtmosphereExtras,
  cityAtmosphereExtrasReadAsUnstacked,
  cityAtmosphereFences,
  cityAtmosphereMainHall,
  cityAtmosphereTrees,
  cityDecorBushMaterials,
  cityDecorFenceMaterials,
  cityDecorTreeMaterials,
  foliageOcclusionIsGhost,
  isCityScarceStationType,
  staticMapWalkObstacles,
} from "@game/shared";

/**
 * City atmosphere decor — fences / trees / bushes / main hall / extras.
 * Env-only chrome; not BuildingType stations; contention / layouts unchanged.
 */
describe("City atmosphere decor (fences / trees / bushes / hall)", () => {
  it("places large hub trees, lighter plaza extras, and a main hall (happy)", () => {
    const trees = cityAtmosphereTrees();
    const bushes = cityAtmosphereBushes();
    const fences = cityAtmosphereFences();
    const extras = cityAtmosphereExtras();
    const hall = cityAtmosphereMainHall();

    expect(trees).toEqual(CITY_ATMOSPHERE_TREE_PLACEMENTS);
    expect(bushes).toEqual(CITY_ATMOSPHERE_BUSH_PLACEMENTS);
    expect(fences).toEqual(CITY_ATMOSPHERE_FENCE_PLACEMENTS);
    expect(extras).toEqual(CITY_ATMOSPHERE_EXTRA_PLACEMENTS);
    expect(hall).toEqual(CITY_ATMOSPHERE_MAIN_HALL);

    expect(trees.length).toBeGreaterThanOrEqual(14);
    expect(bushes.length).toBeGreaterThanOrEqual(6);
    expect(fences).toEqual([]);
    expect(extras.length).toBeGreaterThanOrEqual(18);
    expect(extras.length).toBeLessThan(35);
    expect(hall.w).toBeGreaterThan(5);
    expect(hall.h).toBeGreaterThan(3);

    // Large leafy scales — camera ghosts a canopy only while the player is behind it.
    const scales = trees.map((t) => t.scale);
    expect(Math.min(...scales)).toBeGreaterThanOrEqual(1.5);
    expect(Math.max(...scales)).toBeLessThanOrEqual(2.8);
    expect(new Set(scales.map((s) => s.toFixed(2))).size).toBeGreaterThan(3);

    expect(trees.every((t) => Math.hypot(t.x, t.z) > 2)).toBe(true);
    expect(Math.hypot(hall.x, hall.z)).toBeGreaterThan(8);

    const kinds = new Set(extras.map((e) => e.kind));
    expect(kinds.has("lantern")).toBe(true);
    expect(kinds.has("bench")).toBe(true);
    expect(kinds.has("planter")).toBe(true);
    expect(kinds.has("column")).toBe(true);
    expect(kinds.has("arch")).toBe(true);
    expect(kinds.has("wall")).toBe(true);
    expect(kinds.has("rock")).toBe(true);
    expect(kinds.has("flowerpot")).toBe(true);
    expect(extras.filter((e) => e.kind === "column").length).toBe(4);
    expect(extras.filter((e) => e.kind === "arch").length).toBe(1);
    expect(extras.filter((e) => e.kind === "wall").length).toBe(8);
    expect(cityAtmosphereExtrasReadAsUnstacked()).toBe(true);

    // Fountain court props stay off the fountain origin.
    const plazaExtras = extras.filter(
      (e) =>
        e.kind === "column" ||
        e.kind === "arch" ||
        e.kind === "wall" ||
        e.kind === "rock" ||
        e.kind === "flowerpot",
    );
    expect(plazaExtras.every((e) => Math.hypot(e.x, e.z) > 1.5)).toBe(true);

    const treeMat = cityDecorTreeMaterials();
    const bushMat = cityDecorBushMaterials();
    const fenceMat = cityDecorFenceMaterials();
    expect(treeMat.canopyColor).not.toBe(bushMat.leafColor);
    expect(fenceMat.postColor).not.toBe(treeMat.trunkColor);
    expect(foliageOcclusionIsGhost()).toBe(true);
    expect(FOLIAGE_OCCLUSION.hiddenOpacity).toBeGreaterThan(0);
    expect(FOLIAGE_OCCLUSION.hiddenOpacity).toBeLessThan(1);
    expect(trees.length).toBe(CITY_ATMOSPHERE_TREE_PLACEMENTS.length);
  });

  it("keeps trees/fences clear of mill, farmer bay, kitchen, dock (edge)", () => {
    expect(CITY_BUILDINGS.some((b) => b.type === "city_hall")).toBe(false);
    expect(isCityScarceStationType("city_hall" as never)).toBe(false);
    expect(CITY_SCARCE_STATION_TYPES).not.toContain("city_hall");

    const g = WORLD.GRID;
    const hotspots = CITY_BUILDINGS.filter((b) =>
      ["mill", "crop_plot", "kitchen", "fishing_dock"].includes(b.type),
    ).map((b) => ({ x: b.x * g, z: b.z * g }));

    for (const tree of CITY_ATMOSPHERE_TREE_PLACEMENTS) {
      for (const spot of hotspots) {
        expect(Math.hypot(tree.x - spot.x, tree.z - spot.z)).toBeGreaterThan(
          6,
        );
      }
    }
    for (const fence of CITY_ATMOSPHERE_FENCE_PLACEMENTS) {
      for (const spot of hotspots) {
        expect(Math.hypot(fence.x - spot.x, fence.z - spot.z)).toBeGreaterThan(
          5,
        );
      }
    }

    const city = staticMapWalkObstacles("city");
    expect(
      city.some((o) => o.worldX === 0 && o.worldZ === -13.4 && o.radius >= 2.5),
    ).toBe(true);
    expect(city.some((o) => o.worldX === -7.5 && o.worldZ === -6.5)).toBe(true);
    expect(city.some((o) => o.worldX === -8.4 && o.worldZ === -7.8)).toBe(true);
    expect(city.some((o) => o.worldX === -5.4 && o.worldZ === -5.4)).toBe(true);
    expect(city.some((o) => o.worldX === -6.2 && o.worldZ === -5.4)).toBe(true);
    expect(city.some((o) => o.worldX === 6.2 && o.worldZ === 5.4)).toBe(true);
    expect(city.some((o) => o.worldX === -1.7 && o.worldZ === -8.4)).toBe(
      true,
    );
    // Old mill-clipping tree must stay off the mill pad.
    expect(city.some((o) => o.worldX === -22.5 && o.worldZ === -4.5)).toBe(
      false,
    );
    expect(city.length).toBeGreaterThan(40);
  });

  it("does not invent NFT combat or station contention (failure)", () => {
    const hall = cityAtmosphereMainHall();
    expect(String(hall.w)).not.toMatch(/nft|combat|fare/i);
    expect(CITY_ATMOSPHERE_TREE_PLACEMENTS.every((t) => t.scale > 0)).toBe(
      true,
    );
    expect(CITY_ATMOSPHERE_FENCE_PLACEMENTS.every((f) => f.length > 1)).toBe(
      true,
    );
    expect(cityAtmosphereTrees()).not.toBe(cityAtmosphereBushes());
    expect(cityAtmosphereExtras().every((e) => e.kind.length > 0)).toBe(true);
    expect(
      cityAtmosphereExtrasReadAsUnstacked([
        { kind: "column", x: -5.4, z: -5.4, rotY: 0 },
        { kind: "lantern", x: -5.2, z: -5.5, rotY: 0 },
      ]),
    ).toBe(false);
    expect(cityAtmosphereExtrasReadAsUnstacked([], 1.8)).toBe(false);
  });

  it("wraps each inner-court column with an L of muritos (edge)", () => {
    const extras = cityAtmosphereExtras();
    const columns = extras.filter((e) => e.kind === "column");
    const walls = extras.filter((e) => e.kind === "wall");
    expect(columns).toHaveLength(4);
    expect(walls).toHaveLength(8);
    for (const col of columns) {
      const sx = Math.sign(col.x) || 1;
      const sz = Math.sign(col.z) || 1;
      expect(
        walls.some(
          (w) =>
            Math.abs(w.x - col.x) < 0.01 &&
            Math.abs(w.z - (col.z + sz * 0.8)) < 0.01 &&
            w.rotY === 0,
        ),
      ).toBe(true);
      expect(
        walls.some(
          (w) =>
            Math.abs(w.z - col.z) < 0.01 &&
            Math.abs(w.x - (col.x + sx * 0.8)) < 0.01 &&
            Math.abs(w.rotY - Math.PI / 2) < 0.01,
        ),
      ).toBe(true);
    }
  });

  it("rejects a lantern stacked on a column even with eight muritos (failure)", () => {
    const dummyWalls = Array.from({ length: 8 }, (_, i) => ({
      kind: "wall" as const,
      x: 40 + i * 3,
      z: 40,
      rotY: 0,
    }));
    expect(
      cityAtmosphereExtrasReadAsUnstacked([
        { kind: "column", x: 0, z: 0, rotY: 0 },
        { kind: "lantern", x: 0.2, z: 0.1, rotY: 0 },
        ...dummyWalls,
      ]),
    ).toBe(false);
    expect(
      cityAtmosphereExtrasReadAsUnstacked([
        { kind: "wall", x: 0, z: 0, rotY: 0 },
        { kind: "wall", x: 0.1, z: 0, rotY: Math.PI / 2 },
        ...dummyWalls.slice(2),
      ]),
    ).toBe(false);
  });
});
