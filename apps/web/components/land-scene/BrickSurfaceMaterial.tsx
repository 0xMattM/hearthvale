"use client";

import {
  getBrickHallMaps,
  type BrickHallSurfaceKind,
} from "@/lib/brick-hall-textures";
import { useMemo } from "react";

interface BrickSurfaceMaterialProps {
  kind: BrickHallSurfaceKind;
  /** U / V tile counts on the mesh. */
  repeat?: [number, number];
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

/**
 * Nearest-filter hall surface stamped from the brick-pack palette.
 *
 * @param props - Kind + UV repeat.
 * @returns Standard material with brick/plaster/roof maps.
 */
export function BrickSurfaceMaterial({
  kind,
  repeat = [2, 2],
  roughness = 0.88,
  metalness = 0.04,
  emissive,
  emissiveIntensity,
}: BrickSurfaceMaterialProps) {
  const [repeatX, repeatY] = repeat;
  const maps = useMemo(
    () => getBrickHallMaps(kind, repeatX, repeatY),
    [kind, repeatX, repeatY],
  );

  return (
    <meshStandardMaterial
      map={maps.map}
      bumpMap={maps.bumpMap}
      bumpScale={maps.bumpScale}
      color="#ffffff"
      roughness={roughness}
      metalness={metalness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity ?? 0}
    />
  );
}
