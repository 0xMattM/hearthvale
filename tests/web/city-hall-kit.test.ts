import { describe, expect, it } from "vitest";
import {
  CITY_HALL_FACADE,
  cityHallWindowHitsPost,
  createGableFaceGeometry,
  createGablePrismGeometry,
  gableRoofSlope,
} from "../../apps/web/lib/city-hall-kit";

describe("city hall kit gable", () => {
  it("builds a centered prism that matches the pad (happy)", () => {
    const geom = createGablePrismGeometry(6.2, 1.3, 3.4);
    geom.computeBoundingBox();
    const box = geom.boundingBox;
    expect(box).not.toBeNull();
    expect(box!.max.x - box!.min.x).toBeCloseTo(6.2, 5);
    expect(box!.max.y - box!.min.y).toBeCloseTo(1.3, 5);
    expect(box!.max.z - box!.min.z).toBeCloseTo(3.4, 5);
    expect((box!.min.z + box!.max.z) / 2).toBeCloseTo(0, 5);
    const slope = gableRoofSlope(3.4, 1.3);
    expect(slope.pitch).toBeCloseTo(Math.atan2(1.3, 1.7));
    expect(slope.length).toBeCloseTo(Math.hypot(1.3, 1.7));
    const face = createGableFaceGeometry(6.2, 1.3);
    face.computeBoundingBox();
    expect(face.boundingBox!.max.x - face.boundingBox!.min.x).toBeCloseTo(6.2, 5);
    expect(face.boundingBox!.max.y - face.boundingBox!.min.y).toBeCloseTo(1.3, 5);
    geom.dispose();
    face.dispose();
  });

  it("still extrudes a tiny attic (edge)", () => {
    const geom = createGablePrismGeometry(0.2, 0.05, 0.1);
    expect(geom.getAttribute("position").count).toBeGreaterThan(6);
    geom.dispose();
  });

  it("rejects zero or negative spans (failure)", () => {
    expect(() => createGablePrismGeometry(0, 1, 1)).toThrow(/positive/);
    expect(() => createGablePrismGeometry(1, -1, 1)).toThrow(/positive/);
    expect(() => createGableFaceGeometry(0, 1)).toThrow(/positive/);
    expect(() => gableRoofSlope(0, 1)).toThrow(/positive/);
    expect(() => gableRoofSlope(2, 0)).toThrow(/positive/);
  });
});

describe("city hall façade windows", () => {
  const postX = CITY_HALL_FACADE.width / 6;

  it("places a larger center window upstairs and keeps ground bays clear of posts (happy)", () => {
    expect(CITY_HALL_FACADE.upperWindowX).toEqual([-2.08, 0, 2.08]);
    expect(CITY_HALL_FACADE.groundWindowX).toEqual([-2.12, 2.12]);
    expect(CITY_HALL_FACADE.windowFrameW).toBeGreaterThan(0.6);
    for (const wx of [
      ...CITY_HALL_FACADE.groundWindowX,
      ...CITY_HALL_FACADE.upperWindowX,
    ]) {
      expect(cityHallWindowHitsPost(wx, -postX)).toBe(false);
      expect(cityHallWindowHitsPost(wx, postX)).toBe(false);
    }
  });

  it("still fits the center sash between the two front posts (edge)", () => {
    expect(cityHallWindowHitsPost(0, -postX)).toBe(false);
    expect(cityHallWindowHitsPost(0, postX)).toBe(false);
    expect(CITY_HALL_FACADE.windowFrameW).toBeLessThan(postX * 2 - CITY_HALL_FACADE.beam);
  });

  it("rejects the old inner ground windows that sat on the posts (failure)", () => {
    expect(cityHallWindowHitsPost(-1.2, -postX)).toBe(true);
    expect(cityHallWindowHitsPost(1.2, postX)).toBe(true);
    expect(CITY_HALL_FACADE.groundWindowX).not.toContain(-1.2);
    expect(CITY_HALL_FACADE.groundWindowX).not.toContain(1.2);
  });
});
