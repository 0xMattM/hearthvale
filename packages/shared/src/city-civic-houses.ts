/**
 * Margin civic houses — same clay kit family as City Hall.
 * Env-only silhouettes; not BuildingType / scarce stations.
 */

import { cityPerimeterWalkInner } from "./catalog-city-perimeter.js";
import { CITY_BUILDINGS } from "./catalog-layouts.js";
import { WORLD } from "./world.js";

/** Clay wash on a margin house (hall stays the cream landmark). */
export type CityCivicHouseTint = "peach" | "sage" | "rose" | "ochre" | "linen";

/** Street massing — not a scaled City Hall clone. */
export type CityCivicHouseLook = "cottage" | "shop" | "loft" | "shed";

/** One gabled house along the inner wall. */
export interface CityCivicHouse {
  id: string;
  x: number;
  z: number;
  rotY: number;
  w: number;
  d: number;
  h: number;
  tint: CityCivicHouseTint;
  look: CityCivicHouseLook;
}

/** City Hall pad — houses must sit off this civic landmark. */
const HALL = { x: 0, z: -13.4, radius: 6.2 } as const;

/**
 * Footprint half-extents in world XZ after yaw.
 *
 * @param house - Placement row.
 * @returns Half-width on X and Z.
 */
export function cityCivicHouseWorldHalf(house: CityCivicHouse): {
  hx: number;
  hz: number;
} {
  const c = Math.abs(Math.cos(house.rotY));
  const s = Math.abs(Math.sin(house.rotY));
  return {
    hx: (house.w / 2) * c + (house.d / 2) * s,
    hz: (house.w / 2) * s + (house.d / 2) * c,
  };
}

/**
 * Walk-solid radius for a gabled house footprint.
 *
 * @param house - Placement row.
 * @returns Circle that covers the clay body.
 */
export function cityCivicHouseRadius(house: CityCivicHouse): number {
  return Math.hypot(house.w, house.d) * 0.38;
}

/**
 * Houses sit on the inner-wall streets, not on the plaza or riverbank.
 * Façade is local +Z: west yaw +π/2 faces the plaza, east yaw −π/2 faces the plaza.
 */
export const CITY_CIVIC_HOUSE_PLACEMENTS: ReadonlyArray<CityCivicHouse> = [
  {
    id: "s-peach",
    x: -18.5,
    z: -17.9,
    rotY: 0,
    w: 3.85,
    d: 3.0,
    h: 2.8,
    tint: "peach",
    look: "cottage",
  },
  {
    id: "s-sage",
    x: 18.8,
    z: -17.9,
    rotY: 0,
    w: 5.4,
    d: 2.7,
    h: 2.65,
    tint: "sage",
    look: "shop",
  },
  {
    id: "w-ochre",
    x: -27.5,
    z: -12.2,
    rotY: Math.PI / 2,
    w: 3.55,
    d: 3.25,
    h: 3.7,
    tint: "ochre",
    look: "loft",
  },
  {
    id: "w-rose",
    x: -27.7,
    z: -1.2,
    rotY: Math.PI / 2,
    w: 4.25,
    d: 2.95,
    h: 2.9,
    tint: "rose",
    look: "cottage",
  },
  {
    id: "w-linen",
    x: -27.9,
    z: 10.8,
    rotY: Math.PI / 2,
    w: 3.25,
    d: 2.6,
    h: 2.6,
    tint: "linen",
    look: "shed",
  },
  {
    id: "e-peach",
    x: 27.5,
    z: -11.5,
    rotY: -Math.PI / 2,
    w: 5.3,
    d: 2.8,
    h: 2.7,
    tint: "peach",
    look: "shop",
  },
  {
    id: "e-sage",
    x: 27.7,
    z: -2.0,
    rotY: -Math.PI / 2,
    w: 3.45,
    d: 3.05,
    h: 3.65,
    tint: "sage",
    look: "loft",
  },
  {
    id: "e-ochre",
    x: 27.9,
    z: 6.2,
    rotY: -Math.PI / 2,
    w: 4.1,
    d: 2.9,
    h: 3.0,
    tint: "ochre",
    look: "cottage",
  },
];

/**
 * World XZ of the house façade (local +Z after yaw).
 *
 * @param house - Placement row.
 * @returns Unit facing vector.
 */
export function cityCivicHouseFacadeDir(house: CityCivicHouse): {
  x: number;
  z: number;
} {
  return { x: Math.sin(house.rotY), z: Math.cos(house.rotY) };
}

/**
 * True when the door faces the plaza, not the perimeter wall.
 *
 * @param house - Placement row.
 * @returns True when façade dots toward the hub origin.
 */
export function cityCivicHouseFacesInward(house: CityCivicHouse): boolean {
  const { x: fx, z: fz } = cityCivicHouseFacadeDir(house);
  const tx = -house.x;
  const tz = -house.z;
  const mag = Math.hypot(tx, tz);
  if (!(mag > 0.5)) return false;
  return (fx * tx + fz * tz) / mag > 0.35;
}

/**
 * Env-only civic houses for CityEnvironment.
 *
 * @returns Margin house rows.
 */
export function cityCivicHouses(): ReadonlyArray<CityCivicHouse> {
  return CITY_CIVIC_HOUSE_PLACEMENTS;
}

/**
 * Walk solids matching `CITY_CIVIC_HOUSE_PLACEMENTS`.
 *
 * @returns Obstacle circles for the city map.
 */
export function cityCivicHouseWalkObstacles(): ReadonlyArray<{
  worldX: number;
  worldZ: number;
  radius: number;
}> {
  return CITY_CIVIC_HOUSE_PLACEMENTS.map((h) => ({
    worldX: h.x,
    worldZ: h.z,
    radius: cityCivicHouseRadius(h),
  }));
}

/**
 * Whether a house footprint stays inside the wall walk box.
 *
 * @param house - Placement row.
 * @returns True when the body is inland of the wall / river.
 */
export function cityCivicHouseInsideWall(house: CityCivicHouse): boolean {
  const box = cityPerimeterWalkInner();
  const { hx, hz } = cityCivicHouseWorldHalf(house);
  const pad = 0.35;
  return (
    house.x - hx > box.minX + pad &&
    house.x + hx < box.maxX - pad &&
    house.z - hz > box.minZ + pad &&
    house.z + hz < box.maxZ - pad
  );
}

/**
 * Whether a house sits off stations, City Hall, and the fountain.
 *
 * @param house - Placement row.
 * @returns True when the clay body is not a station stack.
 */
export function cityCivicHouseClearsStations(house: CityCivicHouse): boolean {
  const r = cityCivicHouseRadius(house);
  if (Math.hypot(house.x, house.z) < 10) return false;
  if (Math.hypot(house.x - HALL.x, house.z - HALL.z) < HALL.radius + r) {
    return false;
  }
  const need = r + 2.6;
  for (const b of CITY_BUILDINGS) {
    const bx = b.x * WORLD.GRID;
    const bz = b.z * WORLD.GRID;
    if (Math.hypot(house.x - bx, house.z - bz) < need) return false;
  }
  return true;
}

/**
 * Margin houses read as a varied street, not a second City Hall row.
 *
 * @param houses - Placement list.
 * @returns True when sizes, looks, facing, and wall siting are a town edge.
 */
export function cityCivicHousesReadAsMarginTown(
  houses: ReadonlyArray<CityCivicHouse> = CITY_CIVIC_HOUSE_PLACEMENTS,
): boolean {
  if (houses.length < 6 || houses.length > 12) return false;
  const tints = new Set(houses.map((h) => h.tint));
  const looks = new Set(houses.map((h) => h.look));
  const ids = new Set(houses.map((h) => h.id));
  return (
    tints.size >= 3 &&
    looks.size >= 3 &&
    ids.size === houses.length &&
    houses.every(
      (h) =>
        h.w < 6.2 &&
        h.h < 3.9 &&
        h.d > 1.8 &&
        h.h > 2.05 &&
        cityCivicHouseFacesInward(h) &&
        cityCivicHouseInsideWall(h) &&
        cityCivicHouseClearsStations(h),
    )
  );
}
