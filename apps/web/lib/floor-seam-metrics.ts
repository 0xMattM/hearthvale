/**
 * Floor edge metrics — raised curbs / path beds (geometry, not transparent overlays).
 */

/**
 * Outer size of a curb frame around an inner floor rectangle.
 *
 * @param width - Inner floor width.
 * @param depth - Inner floor depth.
 * @param curbW - Curb thickness on each side.
 * @returns Outer width / depth including curbs.
 */
export function raisedCurbOuterSize(
  width: number,
  depth: number,
  curbW: number,
): { outerW: number; outerD: number } {
  const c = Math.max(0, curbW);
  return {
    outerW: Math.max(0.001, width) + c * 2,
    outerD: Math.max(0.001, depth) + c * 2,
  };
}

/** @deprecated Use raisedCurbOuterSize — kept for older call sites during migration. */
export function softFloorOuterSize(
  width: number,
  depth: number,
  band: number,
): { outerW: number; outerD: number } {
  return raisedCurbOuterSize(width, depth, band);
}

/**
 * UV tiles for a path bed so cobble/stone is not stretched along the long axis.
 *
 * @param bedW - Plane width (X after rotation).
 * @param bedD - Plane depth (Y of the unrotated plane / world Z span).
 * @param tileWorld - World units per texture tile; non-positive → 1.
 * @returns `[repeatU, repeatV]`.
 */
export function pathBedUvRepeat(
  bedW: number,
  bedD: number,
  tileWorld = 1.15,
): [number, number] {
  const t = Number.isFinite(tileWorld) && tileWorld > 0 ? tileWorld : 1;
  const w = Number.isFinite(bedW) && bedW > 0 ? bedW : 0.001;
  const d = Number.isFinite(bedD) && bedD > 0 ? bedD : 0.001;
  return [w / t, d / t];
}
