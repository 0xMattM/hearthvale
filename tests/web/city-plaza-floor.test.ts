import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { pathBedUvRepeat } from "../../apps/web/lib/floor-seam-metrics";
import { surfaceRepeatXY } from "../../apps/web/lib/procedural-textures";

const CITY_ENV = path.join(
  process.cwd(),
  "apps/web/components/land-scene/CityEnvironment.tsx",
);

/**
 * Plaza floor — zoned grains with unstretched path UVs.
 */
describe("city plaza cobble floor", () => {
  it("tiles a long path more on the long axis (happy)", () => {
    const [u, v] = pathBedUvRepeat(3.2, 36);
    expect(v).toBeGreaterThan(u * 4);
    expect(u).toBeCloseTo(3.2 / 1.15, 5);
    expect(v).toBeCloseTo(36 / 1.15, 5);
    const xy = surfaceRepeatXY([u, v], 3);
    expect(xy.u).toBe(u);
    expect(xy.v).toBe(v);
  });

  it("wires the hub to zoned plaza paving, not wood (edge)", () => {
    const src = fs.readFileSync(CITY_ENV, "utf8");
    expect(src).toContain("cityPlazaFloorSurface");
    expect(src).toContain("cityPlazaPathSurface");
    expect(src).toContain("cityPlazaDirtSpurSurface");
    expect(src).toContain("bedKind={plazaPath.bedKind}");
    expect(src).toContain("bedKind={dirtSpurs.bedKind}");
    expect(src).toContain("plazaFloor.wearPads");
    expect(src).toContain("cityCivicGrassSurface");
    expect(src).toContain("plazaFieldSlabs");
    expect(src).toContain("color={civicGrass.color}");
    expect(src).toContain("plazaInlaySlabs");
    expect(src).toContain("circleGeometry");
    expect(src).not.toContain('bedKind="wood"');
    expect(src).not.toContain("Wood road crosses");
  });

  it("rejects empty / invalid path sizes (failure)", () => {
    const [u, v] = pathBedUvRepeat(0, -4, 0);
    expect(u).toBeGreaterThan(0);
    expect(v).toBeGreaterThan(0);
    expect(surfaceRepeatXY(undefined, 3)).toEqual({ u: 3, v: 3 });
    expect(surfaceRepeatXY(-2, 4)).toEqual({ u: 4, v: 4 });
    expect(surfaceRepeatXY([0, 2], 5)).toEqual({ u: 5, v: 2 });
  });
});
