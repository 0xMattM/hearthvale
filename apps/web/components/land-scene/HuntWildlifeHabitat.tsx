"use client";

import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import {
  LIVE_COMBAT,
  huntDenSeed,
  huntTerritoryPoint,
  huntTrailKitMaterials,
} from "@game/shared";

interface HuntWildlifeHabitatProps {
  kind: "trail" | "thicket";
  buildingId: string;
}

/**
 * Scattered brush that reads as a wildlife patch, not a hunt station plot.
 *
 * @param props - Trail vs thicket kit and den id for seeded placement.
 */
export function HuntWildlifeHabitat({
  kind,
  buildingId,
}: HuntWildlifeHabitatProps) {
  const kit = huntTrailKitMaterials(kind);
  const seed = huntDenSeed(buildingId);
  const count = kind === "thicket" ? 8 : 6;
  const bushes = Array.from({ length: count }, (_, i) => {
    const p = huntTerritoryPoint(seed, i + 1, LIVE_COMBAT.habitatRadius);
    const tuft = huntTerritoryPoint(
      seed,
      i + 21,
      LIVE_COMBAT.habitatRadius * 0.92,
    );
    const scale = 0.72 + ((i * 17 + Math.floor(seed * 40)) % 5) * 0.09;
    const alt = i % 2 === 1;
    return { i, p, tuft, scale, alt };
  });

  return (
    <group>
      {bushes.map(({ i, p, tuft, scale, alt }) => (
        <group key={`brush-${i}`}>
          <mesh
            position={[p.x, 0.16 * scale, p.z]}
            castShadow
            scale={[scale, scale, scale]}
          >
            <cylinderGeometry args={[0.07, 0.1, 0.28, 6]} />
            <TexturedStandardMaterial
              kind="bark"
              color={kit.brushTrunkColor}
              roughness={kit.brushTrunk.roughness}
              metalness={kit.brushTrunk.metalness}
            />
          </mesh>
          <mesh
            position={[p.x, 0.52 * scale, p.z]}
            castShadow
            scale={[scale, scale, scale]}
          >
            <coneGeometry args={[alt ? 0.32 : 0.36, alt ? 0.95 : 1.05, 6]} />
            <TexturedStandardMaterial
              kind="bark"
              color={alt ? kit.brushAltColor : kit.brushColor}
              roughness={kit.brush.roughness}
              metalness={kit.brush.metalness}
            />
          </mesh>
          <mesh position={[tuft.x, 0.12, tuft.z]} castShadow>
            <sphereGeometry args={[0.13 + (i % 3) * 0.02, 6, 5]} />
            <TexturedStandardMaterial
              kind="plaster"
              color={kit.underbrushColor}
              roughness={kit.underbrush.roughness}
              metalness={kit.underbrush.metalness}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
