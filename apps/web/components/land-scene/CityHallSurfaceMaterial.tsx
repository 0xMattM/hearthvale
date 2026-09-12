"use client";

import {
  CITY_HALL_STYLE,
  getClayMaps,
  type CityHallSurfaceKind,
  type ClayAtlasPalette,
} from "@/lib/city-hall-style";
import { useMemo } from "react";

interface CityHallSurfaceMaterialProps {
  kind: CityHallSurfaceKind;
  repeat?: [number, number];
  roughness?: number;
  metalness?: number;
  palette?: ClayAtlasPalette;
  cachePrefix?: string;
}

/**
 * Clay-style hall surface from the locked farmer concept palette.
 *
 * @param props - Kind + UV repeat + optional house wash.
 * @returns Standard material.
 */
export function CityHallSurfaceMaterial({
  kind,
  repeat = [1, 1],
  roughness = 0.86,
  metalness = 0.04,
  palette = CITY_HALL_STYLE,
  cachePrefix = "hall-v2",
}: CityHallSurfaceMaterialProps) {
  const [repeatX, repeatY] = repeat;
  const maps = useMemo(
    () => getClayMaps(kind, repeatX, repeatY, palette, cachePrefix),
    [kind, repeatX, repeatY, palette, cachePrefix],
  );

  return (
    <meshStandardMaterial
      map={maps.map}
      bumpMap={maps.bumpMap}
      bumpScale={maps.bumpScale}
      color="#ffffff"
      roughness={roughness}
      metalness={metalness}
    />
  );
}
