import {
  CITY_HALL_STYLE,
  getCityHallMaps,
  getClayMaps,
  type CityHallMaps,
  type ClayAtlasPalette,
} from "./city-hall-style";

export interface MillKitSurfaceRepeat {
  kind: "plaster" | "stone" | "roof" | "wood";
  repeatX: number;
  repeatY: number;
}

/**
 * Oak boards for the mill vanes only — tower stays City Hall clay.
 */
export const MILL_SAIL_STYLE = {
  plaster: CITY_HALL_STYLE.plaster,
  timber: [168, 118, 72],
  roof: CITY_HALL_STYLE.roof,
  roofGrout: CITY_HALL_STYLE.roofGrout,
  stone: CITY_HALL_STYLE.stone,
  stoneGrout: CITY_HALL_STYLE.stoneGrout,
  shutter: CITY_HALL_STYLE.shutter,
  plasterGrain: CITY_HALL_STYLE.plasterGrain,
} as const satisfies ClayAtlasPalette;

/**
 * Clay body + wooden vanes.
 */
export const MILL_KIT_SURFACES = {
  tower: { kind: "plaster", repeatX: 1, repeatY: 2 },
  base: { kind: "stone", repeatX: 2, repeatY: 1 },
  roof: { kind: "roof", repeatX: 2, repeatY: 2 },
  timber: { kind: "wood", repeatX: 1, repeatY: 2 },
  sails: { kind: "wood", repeatX: 1, repeatY: 2 },
} as const satisfies Record<string, MillKitSurfaceRepeat>;

export type MillKitSurfacePart = keyof typeof MILL_KIT_SURFACES;

/**
 * True when only the vanes (not the tower) are timber boards.
 *
 * @param part - Tower, base, roof, timber, or sails.
 */
export function millKitSailIsWood(part: MillKitSurfacePart): boolean {
  return part === "sails" && MILL_KIT_SURFACES.sails.kind === "wood";
}

/**
 * True when the mill body uses City Hall clay, not oak staves.
 *
 * @param part - Tower, base, or roof.
 */
export function millKitBodyIsClay(
  part: Extract<MillKitSurfacePart, "tower" | "base" | "roof">,
): boolean {
  return MILL_KIT_SURFACES[part].kind !== "wood";
}

/**
 * Clay maps for the mill body; oak boards for the vanes.
 *
 * @param part - Tower, base, roof, timber, or sails.
 * @returns Albedo + bump.
 */
export function getMillMaps(part: MillKitSurfacePart): CityHallMaps {
  const spec = MILL_KIT_SURFACES[part];
  if (part === "sails") {
    return getClayMaps(
      spec.kind,
      spec.repeatX,
      spec.repeatY,
      MILL_SAIL_STYLE,
      "mill-sails-wood",
    );
  }
  return getCityHallMaps(spec.kind, spec.repeatX, spec.repeatY);
}
