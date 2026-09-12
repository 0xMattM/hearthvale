/**
 * Plaza City Hall kit math — civic silhouette at CITY_ATMOSPHERE_MAIN_HALL size,
 * not a scaled residential Collada.
 */

import { ExtrudeGeometry, Shape, ShapeGeometry } from "three";

/** Front timber posts sit at ±width/6 — windows must stay in the side bays. */
export const CITY_HALL_FACADE = {
  width: 6.2,
  beam: 0.26,
  /** Recessed frame — larger than the first kit so shutters read at plaza scale. */
  windowFrameW: 0.78,
  windowFrameH: 0.96,
  windowGlassW: 0.56,
  windowGlassH: 0.72,
  shutterW: 0.24,
  shutterH: 0.92,
  shutterOffset: 0.54,
  /** Ground: outer bays only (inner ±1.2 sat on the posts). */
  groundWindowX: [-2.12, 2.12] as const,
  /** Upper: side bays + center over the door. */
  upperWindowX: [-2.08, 0, 2.08] as const,
} as const;

/**
 * True when a window's frame or open shutter overlaps a vertical façade post.
 *
 * @param windowX - Window center on X.
 * @param postX - Post center on X.
 */
export function cityHallWindowHitsPost(windowX: number, postX: number): boolean {
  const halfWin = CITY_HALL_FACADE.windowFrameW / 2 + CITY_HALL_FACADE.shutterW * 0.35;
  const halfPost = CITY_HALL_FACADE.beam / 2;
  return Math.abs(windowX - postX) < halfWin + halfPost;
}

export interface GableRoofSlope {
  /** Pitch around X, radians. */
  pitch: number;
  /** Hypotenuse of the slope (roof-plane length). */
  length: number;
}

/**
 * Gable roof pitch and slope length for a building of given depth and ridge.
 *
 * @param depth - Building depth (Z).
 * @param ridge - Ridge height above the eave line.
 * @returns Pitch + hypotenuse.
 */
export function gableRoofSlope(depth: number, ridge: number): GableRoofSlope {
  if (!(depth > 0) || !(ridge > 0)) {
    throw new Error("gable roof needs positive depth and ridge");
  }
  const half = depth / 2;
  return {
    pitch: Math.atan2(ridge, half),
    length: Math.hypot(ridge, half),
  };
}

/**
 * Triangular-prism attic so the gable reads as a hall, not a pyramid hut.
 *
 * @param width - X span of the triangle base.
 * @param height - Ridge height of the triangle.
 * @param depth - Extrusion along Z, centered.
 * @returns Extrude geometry with origin at the eave midline.
 */
export function createGablePrismGeometry(
  width: number,
  height: number,
  depth: number,
): ExtrudeGeometry {
  if (!(width > 0) || !(height > 0) || !(depth > 0)) {
    throw new Error("gable prism needs positive width, height, and depth");
  }
  const shape = new Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, height);
  shape.closePath();
  const geom = new ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
  geom.translate(0, 0, -depth / 2);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Front/back gable triangle with 0–1 UVs (Extrude caps sample UV 0,0 → white mortar).
 *
 * @param width - Triangle base.
 * @param height - Ridge height.
 * @returns Shape geometry in XY.
 */
export function createGableFaceGeometry(width: number, height: number): ShapeGeometry {
  if (!(width > 0) || !(height > 0)) {
    throw new Error("gable face needs positive width and height");
  }
  const shape = new Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, height);
  shape.closePath();
  const geom = new ShapeGeometry(shape);
  geom.computeVertexNormals();
  return geom;
}
