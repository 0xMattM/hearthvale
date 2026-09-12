/**
 * City plaza floor zoning — flagstone field/court, cobble walks and wear.
 * Visual only; hub layout / collision unchanged.
 */

/** Procedural grain kinds used on the plaza stack. */
export type CityPlazaFloorKind = "stone" | "cobble";

/** Worn cobble inset on the inner court slabs. */
export interface CityPlazaWearPad {
  x: number;
  z: number;
  radius: number;
}

/** One quadrant slab of the split plaza field / inner court. */
export interface CityPlazaSlab {
  x: number;
  z: number;
  width: number;
  depth: number;
}

/** Civic lawn under the plaza seams and scarce yard (not the locked brown yard hex). */
export interface CityCivicGrassSurface {
  kind: "grass";
  color: string;
  dirtKind: "dirt";
  dirtColor: string;
  repeat: number;
  underlayY: number;
  pathHalfWidth: number;
  seamGap: number;
  plazaWidth: number;
  plazaDepth: number;
  inlaySize: number;
  dirtY: number;
  dirtPatches: readonly CityPlazaWearPad[];
}

/** Shared visual recipe for the city plaza floor stack. */
export interface CityPlazaFloorSurface {
  fieldKind: "stone";
  fieldRepeat: number;
  fieldY: number;
  inlayKind: "stone";
  inlayRepeat: number;
  inlayColor: string;
  walkKind: "cobble";
  walkLipKind: "stone";
  courtKind: "stone";
  courtColor: string;
  courtRadius: number;
  courtY: number;
  courtRepeat: number;
  courtRingKind: "cobble";
  courtRingColor: string;
  courtRingInner: number;
  courtRingOuter: number;
  wearKind: "cobble";
  wearColor: string;
  wearY: number;
  wearPads: readonly CityPlazaWearPad[];
}

/** Path-cross hole from CityEnvironment RaisedPathBed `crossClear`. */
const PLAZA_PATH_CROSS_CLEAR = 3.4;

/**
 * Plaza floor zones so the hub does not read as one cobble sheet.
 *
 * @returns Field / inlay / walk / fountain-court surface recipe.
 */
export function cityPlazaFloorSurface(): CityPlazaFloorSurface {
  return {
    fieldKind: "stone",
    fieldRepeat: 5.2,
    fieldY: -0.055,
    inlayKind: "stone",
    inlayRepeat: 3.4,
    inlayColor: "#80786c",
    walkKind: "cobble",
    walkLipKind: "stone",
    courtKind: "stone",
    courtColor: "#5e6662",
    courtRadius: 1.5,
    courtY: -0.04,
    courtRepeat: 2.8,
    courtRingKind: "cobble",
    courtRingColor: "#6a6058",
    courtRingInner: 1.5,
    courtRingOuter: 1.68,
    wearKind: "cobble",
    wearColor: "#6e6a62",
    wearY: -0.043,
    wearPads: [
      { x: 3.55, z: 3.6, radius: 1.12 },
      { x: -3.4, z: 3.75, radius: 0.98 },
      { x: 3.7, z: -3.45, radius: 1.2 },
      { x: -3.55, z: -3.5, radius: 1.05 },
    ],
  };
}

/**
 * City plaza crossing paths — cobble paving, not wood grain.
 *
 * @returns Bed / lip surface kinds for the plaza walks.
 */
export function cityPlazaPathSurface(): {
  bedKind: "cobble";
  lipKind: "stone";
  cobbleLength: number;
  cobbleWidth: number;
} {
  const floor = cityPlazaFloorSurface();
  return {
    bedKind: floor.walkKind,
    lipKind: floor.walkLipKind,
    cobbleLength: 36,
    cobbleWidth: 3.2,
  };
}

/**
 * Whether the plaza recipe keeps distinct field / court / walk grains.
 *
 * @param floor - Plaza floor recipe.
 * @param plazaFieldColor - Hub plaza slab hex (must stay distinct from inlay).
 * @returns True when zones are not one cobble wash.
 */
export function cityPlazaReadsAsZoned(
  floor: CityPlazaFloorSurface = cityPlazaFloorSurface(),
  plazaFieldColor = "#8a9098",
): boolean {
  const field = plazaFieldColor.toLowerCase();
  const inlay = floor.inlayColor.toLowerCase();
  const court = floor.courtColor.toLowerCase();
  const ring = floor.courtRingColor.toLowerCase();
  return (
    floor.fieldKind === "stone" &&
    floor.inlayKind === "stone" &&
    floor.walkKind === "cobble" &&
    floor.wearKind === "cobble" &&
    floor.courtKind === "stone" &&
    inlay !== field &&
    court !== inlay &&
    ring !== court &&
    floor.wearPads.length >= 4 &&
    floor.courtRingOuter <= PLAZA_PATH_CROSS_CLEAR / 2 &&
    floor.courtRadius > 1.28
  );
}

/**
 * Wear patches sit in the inner-court quadrants, not under the walks.
 *
 * @param pad - Wear circle.
 * @param pathHalfWidth - Half of the crossing path width.
 * @returns True when the circle stays off the path bed.
 */
export function cityPlazaWearPadClearsWalks(
  pad: CityPlazaWearPad,
  pathHalfWidth = 1.6,
): boolean {
  if (!(pathHalfWidth > 0) || !(pad.radius > 0)) return false;
  return (
    Math.abs(pad.x) - pad.radius > pathHalfWidth &&
    Math.abs(pad.z) - pad.radius > pathHalfWidth
  );
}

/**
 * Civic lawn used on the scarce yard and in plaza path seams.
 *
 * @returns Green turf recipe — does not mutate `CITY_HUB_VISUAL.scarceYardColor`.
 */
export function cityCivicGrassSurface(): CityCivicGrassSurface {
  return {
    kind: "grass",
    color: "#4e6a40",
    dirtKind: "dirt",
    dirtColor: "#6e5a40",
    repeat: 9,
    underlayY: -0.115,
    pathHalfWidth: 1.6,
    seamGap: 0.48,
    plazaWidth: 32,
    plazaDepth: 28,
    inlaySize: 12,
    dirtY: -0.066,
    dirtPatches: [
      { x: 18.2, z: 12.4, radius: 1.55 },
      { x: -17.4, z: 14.1, radius: 1.35 },
      { x: 14.8, z: 17.6, radius: 1.7 },
      { x: -12.6, z: 18.2, radius: 1.2 },
    ],
  };
}

/**
 * Gap from the plaza origin to the inner edge of a quadrant slab.
 *
 * @param grass - Civic grass recipe.
 * @returns Path half-width plus the visible grass seam.
 */
export function cityPlazaSeamInset(
  grass: CityCivicGrassSurface = cityCivicGrassSurface(),
): number {
  return grass.pathHalfWidth + grass.seamGap;
}

/**
 * Split a centered plaza rectangle into four slabs with a cross-shaped gap.
 *
 * @param width - Full slab width on X.
 * @param depth - Full slab depth on Z.
 * @param inset - Distance from the origin axes to the inner slab edge.
 * @returns Four quadrant slabs, or empty when the inset swallows the pad.
 */
export function cityPlazaQuadrantSlabs(
  width: number,
  depth: number,
  inset: number,
): CityPlazaSlab[] {
  if (!(width > 0) || !(depth > 0) || !(inset > 0)) return [];
  const spanX = width / 2 - inset;
  const spanZ = depth / 2 - inset;
  if (!(spanX > 0) || !(spanZ > 0)) return [];
  const cx = inset + spanX / 2;
  const cz = inset + spanZ / 2;
  const slabs: CityPlazaSlab[] = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      slabs.push({
        x: sx * cx,
        z: sz * cz,
        width: spanX,
        depth: spanZ,
      });
    }
  }
  return slabs;
}

/**
 * Parse a 7-char hex into 0–255 channels.
 *
 * @param hex - `#rrggbb`.
 * @returns RGB or null when the hex is not a color.
 */
function hexRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

/**
 * Whether civic turf reads as green lawn, not the locked brown yard fill.
 *
 * @param grass - Civic grass recipe.
 * @param brownYardHex - Locked `CITY_HUB_VISUAL.scarceYardColor`.
 * @returns True when the lawn is green and seams stay open.
 */
export function cityCivicGrassReadsAsLawn(
  grass: CityCivicGrassSurface = cityCivicGrassSurface(),
  brownYardHex = "#9a7a58",
): boolean {
  const rgb = hexRgb(grass.color);
  if (!rgb) return false;
  const inset = cityPlazaSeamInset(grass);
  return (
    grass.kind === "grass" &&
    grass.color.toLowerCase() !== brownYardHex.toLowerCase() &&
    rgb.g > rgb.r + 8 &&
    rgb.g > rgb.b &&
    grass.seamGap > 0.2 &&
    inset < grass.plazaWidth / 2 &&
    cityPlazaQuadrantSlabs(
      grass.plazaWidth,
      grass.plazaDepth,
      inset,
    ).length === 4
  );
}

/**
 * Dirt wear sits on the scarce yard, not on the plaza slab.
 *
 * @param pad - Dirt circle.
 * @param plazaWidth - Plaza plane width.
 * @param plazaDepth - Plaza plane depth.
 * @returns True when the circle is outside the plaza rectangle.
 */
export function cityCivicDirtPatchClearsPlaza(
  pad: CityPlazaWearPad,
  plazaWidth = 32,
  plazaDepth = 28,
): boolean {
  if (!(pad.radius > 0) || !(plazaWidth > 0) || !(plazaDepth > 0)) return false;
  const halfW = plazaWidth / 2;
  const halfD = plazaDepth / 2;
  return (
    Math.abs(pad.x) - pad.radius > halfW ||
    Math.abs(pad.z) - pad.radius > halfD
  );
}

/** Packed-earth spur past the cobble cross, out onto the civic lawn. */
export interface CityPlazaDirtSpur {
  along: "x" | "z";
  x: number;
  z: number;
  length: number;
  pathWidth: number;
  y: number;
}

/** Dirt trail recipe that continues the fountain walks off the plaza. */
export interface CityPlazaDirtSpurSurface {
  bedKind: "dirt";
  lipKind: "dirt";
  color: string;
  pathWidth: number;
  overlap: number;
  lipW: number;
  spurs: readonly CityPlazaDirtSpur[];
}

/**
 * Inner |along| of a dirt spur (the cobble-facing end).
 *
 * @param spur - One cardinal dirt trail.
 * @returns Distance from the fountain origin to the cobble join.
 */
export function cityPlazaDirtSpurInner(spur: CityPlazaDirtSpur): number {
  const along = spur.along === "x" ? Math.abs(spur.x) : Math.abs(spur.z);
  return along - spur.length / 2;
}

/**
 * Outer |along| of a dirt spur (the lawn / station end).
 *
 * @param spur - One cardinal dirt trail.
 * @returns Distance from the fountain origin to the far tip.
 */
export function cityPlazaDirtSpurOuter(spur: CityPlazaDirtSpur): number {
  const along = spur.along === "x" ? Math.abs(spur.x) : Math.abs(spur.z);
  return along + spur.length / 2;
}

/**
 * Packed-earth caminitos that pick up where the cobble cross ends.
 * East reaches the market board; south stops before the town wall;
 * north meets the river bank. Visual only — layouts unchanged.
 *
 * @returns Four dirt spurs + trail grain.
 */
export function cityPlazaDirtSpurSurface(): CityPlazaDirtSpurSurface {
  const grass = cityCivicGrassSurface();
  const path = cityPlazaPathSurface();
  const cobbleHalf = path.cobbleLength / 2;
  const overlap = 0.45;
  const pathWidth = 2.2;
  const y = -0.05;
  const inner = cobbleHalf - overlap;
  // Reason: east/west run to market/mill; +Z meets the river bank; -Z stops at the wall.

  function spur(
    along: "x" | "z",
    sign: 1 | -1,
    length: number,
  ): CityPlazaDirtSpur {
    const center = inner + length / 2;
    return {
      along,
      x: along === "x" ? sign * center : 0,
      z: along === "z" ? sign * center : 0,
      length,
      pathWidth,
      y,
    };
  }

  return {
    bedKind: "dirt",
    lipKind: "dirt",
    color: grass.dirtColor,
    pathWidth,
    overlap,
    lipW: 0.1,
    spurs: [
      spur("x", 1, 8),
      spur("x", -1, 8),
      spur("z", 1, 5.4),
      spur("z", -1, 3.4),
    ],
  };
}

/**
 * Whether the fountain cobble is followed by four packed-earth trails.
 *
 * @param surface - Dirt spur recipe.
 * @param cobbleWidth - Plaza walk width (trails must read narrower).
 * @returns True when trails continue the cross without becoming more cobble.
 */
export function cityPlazaDirtSpursReadAsTrails(
  surface: CityPlazaDirtSpurSurface = cityPlazaDirtSpurSurface(),
  cobbleWidth = cityPlazaPathSurface().cobbleWidth,
): boolean {
  if (surface.bedKind !== "dirt" || surface.lipKind !== "dirt") return false;
  if (surface.spurs.length !== 4) return false;
  if (!(surface.pathWidth > 0) || !(surface.pathWidth < cobbleWidth)) {
    return false;
  }
  const cobbleHalf = cityPlazaPathSurface().cobbleLength / 2;
  const plusX = surface.spurs.find((s) => s.along === "x" && s.x > 0);
  const minusX = surface.spurs.find((s) => s.along === "x" && s.x < 0);
  const plusZ = surface.spurs.find((s) => s.along === "z" && s.z > 0);
  const minusZ = surface.spurs.find((s) => s.along === "z" && s.z < 0);
  if (!plusX || !minusX || !plusZ || !minusZ) return false;
  const joinsCobble = surface.spurs.every((s) => {
    const inner = cityPlazaDirtSpurInner(s);
    return inner < cobbleHalf && inner > cobbleHalf - surface.overlap - 0.2;
  });
  return (
    joinsCobble &&
    cityPlazaDirtSpurOuter(plusX) > 22 &&
    cityPlazaDirtSpurOuter(minusZ) < 21.5 &&
    cityPlazaDirtSpurOuter(plusZ) < 25.05
  );
}
