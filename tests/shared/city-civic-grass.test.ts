import { describe, expect, it } from "vitest";
import { CITY_HUB_VISUAL } from "../../packages/shared/src/catalog";
import {
  cityCivicDirtPatchClearsPlaza,
  cityCivicGrassReadsAsLawn,
  cityCivicGrassSurface,
  cityPlazaFloorSurface,
  cityPlazaQuadrantSlabs,
  cityPlazaSeamInset,
} from "../../packages/shared/src/city-plaza-floor";

/**
 * Civic lawn is green turf with plaza path seams — not the brown yard hex.
 */
describe("city civic grass", () => {
  it("tints the yard as green lawn and opens four plaza seams (happy)", () => {
    const grass = cityCivicGrassSurface();
    const inset = cityPlazaSeamInset(grass);
    const field = cityPlazaQuadrantSlabs(
      grass.plazaWidth,
      grass.plazaDepth,
      inset,
    );
    expect(cityCivicGrassReadsAsLawn()).toBe(true);
    expect(grass.color.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );
    expect(field).toHaveLength(4);
    expect(cityPlazaQuadrantSlabs(grass.inlaySize, grass.inlaySize, inset)).toHaveLength(
      4,
    );
    expect(cityPlazaFloorSurface().fieldY).toBeGreaterThan(grass.underlayY);
    expect(cityPlazaFloorSurface().fieldY).toBeGreaterThan(-0.068);
  });

  it("keeps dirt patches off the plaza and a visible seam beside the walks (edge)", () => {
    const grass = cityCivicGrassSurface();
    const inset = cityPlazaSeamInset(grass);
    expect(inset).toBeGreaterThan(grass.pathHalfWidth);
    expect(grass.dirtPatches.every((pad) => cityCivicDirtPatchClearsPlaza(pad))).toBe(
      true,
    );
    expect(CITY_HUB_VISUAL.scarceYardColor).toBe("#9a7a58");
  });

  it("rejects brown fill, invalid hex, and a swallowed plaza (failure)", () => {
    expect(
      cityCivicGrassReadsAsLawn({
        ...cityCivicGrassSurface(),
        color: CITY_HUB_VISUAL.scarceYardColor,
      }),
    ).toBe(false);
    expect(
      cityCivicGrassReadsAsLawn({
        ...cityCivicGrassSurface(),
        color: "nope",
      }),
    ).toBe(false);
    expect(cityPlazaQuadrantSlabs(32, 28, 20)).toEqual([]);
    expect(cityPlazaQuadrantSlabs(0, 28, 2)).toEqual([]);
    expect(
      cityCivicDirtPatchClearsPlaza({ x: 0, z: 0, radius: 1 }),
    ).toBe(false);
    expect(
      cityCivicDirtPatchClearsPlaza({ x: 18, z: 12, radius: 0 }),
    ).toBe(false);
  });
});
