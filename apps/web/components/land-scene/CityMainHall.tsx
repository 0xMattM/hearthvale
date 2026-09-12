"use client";

import { CityClayHouse } from "@/components/land-scene/CityClayHouse";
import { CityStreetHouse } from "@/components/land-scene/CityStreetHouse";
import type { CityAtmosphereDecorHall, CityCivicHouse as CityCivicHousePlacement } from "@game/shared";

export { CityClayHouse } from "@/components/land-scene/CityClayHouse";
export { CityStreetHouse } from "@/components/land-scene/CityStreetHouse";

/**
 * City Hall copied from concept-34: cream clay, fat timber, green shutters,
 * clock in the gable, brown shingles. No extra columns, wings, or packs.
 */
export function CityMainHall({
  x,
  z,
  rotY,
  w,
  d,
  h,
}: CityAtmosphereDecorHall) {
  return (
    <CityClayHouse
      x={x}
      z={z}
      rotY={rotY}
      w={w}
      d={d}
      h={h}
      showClock
      chimney
      label="City Hall"
    />
  );
}

/**
 * Margin civic house — street massing, not a scaled City Hall.
 */
export function CityCivicHouse({
  x,
  z,
  rotY,
  w,
  d,
  h,
  tint,
  look,
}: Omit<CityCivicHousePlacement, "id">) {
  return (
    <CityStreetHouse
      x={x}
      z={z}
      rotY={rotY}
      w={w}
      d={d}
      h={h}
      tint={tint}
      look={look}
    />
  );
}
