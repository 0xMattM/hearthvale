import { describe, expect, it } from "vitest";
import { CITY_HUB_VISUAL } from "../../packages/shared/src/catalog";
import {
  cityPlazaDirtSpurInner,
  cityPlazaDirtSpurOuter,
  cityPlazaDirtSpurSurface,
  cityPlazaDirtSpursReadAsTrails,
  cityPlazaFloorSurface,
  cityPlazaPathSurface,
  cityPlazaReadsAsZoned,
  cityPlazaWearPadClearsWalks,
} from "../../packages/shared/src/city-plaza-floor";

/**
 * Plaza floor is zoned — flagstone court, cobble walks, not one wash.
 */
describe("city plaza path surface", () => {
  it("uses cobble bed and stone lips (happy)", () => {
    const path = cityPlazaPathSurface();
    const floor = cityPlazaFloorSurface();
    expect(path.bedKind).toBe("cobble");
    expect(path.lipKind).toBe("stone");
    expect(floor.fieldKind).toBe("stone");
    expect(floor.inlayKind).toBe("stone");
    expect(cityPlazaReadsAsZoned()).toBe(true);
    expect(CITY_HUB_VISUAL.roadColor.toLowerCase()).not.toBe("#6a5340");
    expect(CITY_HUB_VISUAL.roadColor.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );
    expect(cityPlazaDirtSpursReadAsTrails()).toBe(true);
  });

  it("keeps walks darker and wear patches off the crossing (edge)", () => {
    const floor = cityPlazaFloorSurface();
    expect(CITY_HUB_VISUAL.roadColor.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.plazaColor.toLowerCase(),
    );
    expect(floor.inlayColor.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.plazaColor.toLowerCase(),
    );
    expect(floor.courtRingOuter).toBeLessThanOrEqual(1.7);
    expect(floor.wearPads.every((pad) => cityPlazaWearPadClearsWalks(pad))).toBe(
      true,
    );
  });

  it("refuses a single cobble wash or wood roads (failure)", () => {
    expect(CITY_HUB_VISUAL.roadColor.toLowerCase()).not.toBe("#6a5340");
    expect(cityPlazaPathSurface().bedKind).not.toBe("wood" as never);
    expect(cityPlazaPathSurface().lipKind).not.toBe("dirt" as never);
    expect(
      cityPlazaReadsAsZoned({
        ...cityPlazaFloorSurface(),
        inlayColor: CITY_HUB_VISUAL.plazaColor,
      }),
    ).toBe(false);
    expect(
      cityPlazaReadsAsZoned({
        ...cityPlazaFloorSurface(),
        wearPads: [],
      }),
    ).toBe(false);
    expect(
      cityPlazaWearPadClearsWalks({ x: 0, z: 0, radius: 1 }, 0),
    ).toBe(false);
  });

  it("continues the fountain cobble with packed-earth trails (edge)", () => {
    const path = cityPlazaPathSurface();
    const dirt = cityPlazaDirtSpurSurface();
    const plusX = dirt.spurs.find((s) => s.along === "x" && s.x > 0);
    const plusZ = dirt.spurs.find((s) => s.along === "z" && s.z > 0);
    const minusZ = dirt.spurs.find((s) => s.along === "z" && s.z < 0);
    expect(dirt.bedKind).toBe("dirt");
    expect(dirt.spurs).toHaveLength(4);
    expect(dirt.pathWidth).toBeLessThan(path.cobbleWidth);
    expect(plusX).toBeDefined();
    expect(cityPlazaDirtSpurOuter(plusX!)).toBeGreaterThan(22);
    expect(cityPlazaDirtSpurInner(plusX!)).toBeLessThan(path.cobbleLength / 2);
    expect(cityPlazaDirtSpurOuter(minusZ!)).toBeLessThan(21.5);
    expect(cityPlazaDirtSpurOuter(plusZ!)).toBeLessThan(25.05);
    expect(dirt.color.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.plazaColor.toLowerCase(),
    );
    expect(dirt.color.toLowerCase()).not.toBe("#6a5340");
  });

  it("rejects cobble / wood trails or a missing cardinal (failure)", () => {
    const dirt = cityPlazaDirtSpurSurface();
    expect(
      cityPlazaDirtSpursReadAsTrails({
        ...dirt,
        bedKind: "cobble" as never,
      }),
    ).toBe(false);
    expect(
      cityPlazaDirtSpursReadAsTrails({
        ...dirt,
        spurs: dirt.spurs.slice(0, 3),
      }),
    ).toBe(false);
    expect(cityPlazaDirtSpursReadAsTrails({ ...dirt, pathWidth: 3.2 })).toBe(
      false,
    );
    expect(cityPlazaDirtSpurInner({ ...dirt.spurs[0]!, length: 0 })).toBe(
      Math.abs(dirt.spurs[0]!.x || dirt.spurs[0]!.z),
    );
  });
});
