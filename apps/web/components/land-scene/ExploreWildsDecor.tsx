"use client";

import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { useFoliageOcclusionFade } from "@/components/land-scene/useFoliageOcclusionFade";
import {
  FOLIAGE_CANOPY,
  cityDecorBushMaterials,
  exploreWildsProps,
  forestTreeMaterials,
  type ExploreWildsProp,
} from "@game/shared";
import { useRef } from "react";
import type { Group } from "three";

/**
 * Mixed wilds dressing — groves, rocks, bushes, worn dirt.
 * Not gather nodes; not woodland/mines yards.
 */
export function ExploreWildsDecor() {
  const props = exploreWildsProps();
  return (
    <group>
      {props.map((p, i) => (
        <ExploreWildsPropMesh key={`wilds-${p.kind}-${i}`} prop={p} />
      ))}
    </group>
  );
}

/**
 * One atmosphere prop on the canopy.
 *
 * @param props - Placement row.
 * @returns Mesh group.
 */
function ExploreWildsPropMesh({ prop }: { prop: ExploreWildsProp }) {
  if (prop.kind === "tree") {
    return <ForestTree at={[prop.x, prop.z]} scale={prop.scale} />;
  }
  if (prop.kind === "rock") {
    return <ExploreRock x={prop.x} z={prop.z} scale={prop.scale} rotY={prop.rotY} />;
  }
  if (prop.kind === "bush") {
    return <ExploreBush x={prop.x} z={prop.z} scale={prop.scale} />;
  }
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[prop.x, -0.09, prop.z]}
      receiveShadow
    >
      <circleGeometry args={[prop.radius, 14]} />
      <TexturedStandardMaterial
        kind="dirt"
        color="#6a5840"
        flatFloor
        metalness={0}
        repeat={3}
      />
    </mesh>
  );
}

/**
 * Cooler canopy tree (PL36.2 / VA1.3).
 *
 * @param props - World XZ and scale.
 * @returns Tree group.
 */
export function ForestTree({
  at,
  scale = 1,
}: {
  at: [number, number];
  scale?: number;
}) {
  const [x, z] = at;
  const mat = forestTreeMaterials();
  const groupRef = useRef<Group>(null);
  useFoliageOcclusionFade(groupRef, x, z, scale, FOLIAGE_CANOPY.forest);
  return (
    <group ref={groupRef} position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.4, 0.24, 7]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.flareColor}
          roughness={mat.trunk.roughness}
          metalness={mat.trunk.metalness}
        />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 1.8, 6]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.trunkColor}
          roughness={mat.trunk.roughness}
          metalness={mat.trunk.metalness}
        />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.14, 8]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.barkBandColor}
          roughness={mat.barkBand.roughness}
          metalness={mat.barkBand.metalness}
        />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow userData={{ foliageCanopy: true }}>
        <coneGeometry args={[1.35, 2.2, 7]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.canopyColor}
          roughness={mat.canopy.roughness}
          metalness={mat.canopy.metalness}
        />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow userData={{ foliageCanopy: true }}>
        <coneGeometry args={[0.95, 1.5, 7]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.canopyAltColor}
          roughness={mat.canopyAlt.roughness}
          metalness={mat.canopyAlt.metalness}
        />
      </mesh>
    </group>
  );
}

/**
 * Loose stone — not an ore_node.
 *
 * @param props - Placement.
 * @returns Rock mesh.
 */
function ExploreRock({
  x,
  z,
  scale,
  rotY,
}: {
  x: number;
  z: number;
  scale: number;
  rotY: number;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <kitBoxGeometry args={[0.62, 0.38, 0.5]} />
        <TexturedStandardMaterial kind="stone" color="#6a6864" roughness={0.92} />
      </mesh>
      <mesh position={[0.12, 0.32, 0.06]} castShadow>
        <kitBoxGeometry args={[0.28, 0.16, 0.24]} />
        <TexturedStandardMaterial kind="stone" color="#5a5854" roughness={0.94} />
      </mesh>
    </group>
  );
}

/**
 * Low leaf clump — walk-through.
 *
 * @param props - Placement.
 * @returns Bush mesh.
 */
function ExploreBush({
  x,
  z,
  scale,
}: {
  x: number;
  z: number;
  scale: number;
}) {
  const mat = cityDecorBushMaterials();
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.22, 6]} />
        <TexturedStandardMaterial kind="wood" color={mat.twigColor} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.42, 8, 8]} />
        <TexturedStandardMaterial kind="grass" color={mat.leafColor} />
      </mesh>
      <mesh position={[0.2, 0.36, 0.1]} castShadow>
        <sphereGeometry args={[0.26, 7, 7]} />
        <TexturedStandardMaterial kind="grass" color={mat.leafLitColor} />
      </mesh>
    </group>
  );
}
