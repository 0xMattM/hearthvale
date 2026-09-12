"use client";

import { kitBoxRadius, kitBoxSegments } from "@/lib/kit-box-metrics";
import { extend, type ThreeElement } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Box with clamped round-overs so kit buildings do not read as ruler-cut cubes.
 */
export class KitBoxGeometry extends RoundedBoxGeometry {
  /**
   * @param width - X size.
   * @param height - Y size.
   * @param depth - Z size.
   */
  constructor(width = 1, height = 1, depth = 1) {
    const w = Math.max(0.001, width);
    const h = Math.max(0.001, height);
    const d = Math.max(0.001, depth);
    super(w, h, d, kitBoxSegments(w, h, d), kitBoxRadius(w, h, d));
  }
}

extend({ KitBoxGeometry });

declare module "@react-three/fiber" {
  interface ThreeElements {
    kitBoxGeometry: ThreeElement<typeof KitBoxGeometry>;
  }
}
