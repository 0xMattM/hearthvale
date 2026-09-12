"use client";

import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { useFoliageOcclusionFade } from "@/components/land-scene/useFoliageOcclusionFade";
import {
  FOLIAGE_CANOPY,
  GATHER_READY_TREE,
  gatherReadyTreeMaterials,
} from "@game/shared";
import { useRef, type Ref } from "react";
import type { Group, MeshStandardMaterial } from "three";

const GATHER_TREE_ROOTS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.28, 0.07, 0.2, 0.11],
  [-0.24, 0.06, -0.16, 0.1],
  [0.04, 0.06, -0.28, 0.09],
];

/**
 * Shared ground flare + roots for the living tree and the cooling stump.
 */
function GatherTreeBase({
  rootColor,
  roughness,
  metalness,
}: {
  rootColor: string;
  roughness: number;
  metalness: number;
}) {
  const t = GATHER_READY_TREE;
  return (
    <>
      {GATHER_TREE_ROOTS.map(([rx, ry, rz, r], i) => (
        <mesh key={`gather-tree-root-${i}`} position={[rx, ry, rz]} castShadow>
          <cylinderGeometry args={[r * 0.55, r, 0.14, 6]} />
          <TexturedStandardMaterial
            kind="bark"
            color={rootColor}
            roughness={roughness}
            metalness={metalness}
            repeat={1}
          />
        </mesh>
      ))}
      <mesh position={[0, t.flareY, 0]} castShadow>
        <cylinderGeometry
          args={[t.flareRadiusTop, t.flareRadiusBase, t.flareHeight, 7]}
        />
        <TexturedStandardMaterial
          kind="bark"
          color={rootColor}
          roughness={roughness}
          metalness={metalness}
          repeat={1}
        />
      </mesh>
    </>
  );
}

/**
 * Chop-ready wood node — leafy deciduous tree. Cooling nodes stay stumps.
 * Follow camera ghosts the canopy only while the player stands behind it.
 */
export function GatherReadyTreeMesh({
  worldX,
  worldZ,
  trunkColor,
  trunkMatRef,
  canopyMatRef,
  emissive,
  trunkEmissiveIntensity,
  canopyEmissive,
  canopyEmissiveIntensity,
}: {
  worldX: number;
  worldZ: number;
  trunkColor: string;
  trunkMatRef?: Ref<MeshStandardMaterial | null>;
  canopyMatRef?: Ref<MeshStandardMaterial | null>;
  emissive: string;
  trunkEmissiveIntensity: number;
  canopyEmissive: string;
  canopyEmissiveIntensity: number;
}) {
  const mat = gatherReadyTreeMaterials();
  const t = GATHER_READY_TREE;
  const groupRef = useRef<Group>(null);
  useFoliageOcclusionFade(
    groupRef,
    worldX,
    worldZ,
    1,
    FOLIAGE_CANOPY.gatherTree,
  );

  return (
    <group ref={groupRef}>
      <GatherTreeBase
        rootColor={mat.rootColor}
        roughness={mat.trunk.roughness}
        metalness={mat.trunk.metalness}
      />
      <mesh position={[0, t.trunkY, 0]} castShadow>
        <cylinderGeometry
          args={[t.trunkRadiusTop, t.trunkRadiusBase, t.trunkHeight, 8]}
        />
        <TexturedStandardMaterial
          kind="bark"
          ref={trunkMatRef}
          color={trunkColor}
          roughness={mat.trunk.roughness}
          metalness={mat.trunk.metalness}
          emissive={emissive}
          emissiveIntensity={trunkEmissiveIntensity}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, t.barkBandY, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.1, 8]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.barkBandColor}
          roughness={mat.barkBand.roughness}
          metalness={mat.barkBand.metalness}
          repeat={1}
        />
      </mesh>
      <mesh
        position={[0, t.canopyY, 0]}
        castShadow
        userData={{ foliageCanopy: true }}
      >
        <sphereGeometry args={[t.canopyRadius, 12, 12]} />
        <TexturedStandardMaterial
          kind="grass"
          ref={canopyMatRef}
          color={mat.canopyColor}
          roughness={mat.canopy.roughness}
          metalness={mat.canopy.metalness}
          emissive={canopyEmissive}
          emissiveIntensity={canopyEmissiveIntensity}
          repeat={2}
        />
      </mesh>
      <mesh
        position={[t.canopyLitX, t.canopyLitY, t.canopyLitZ]}
        castShadow
        userData={{ foliageCanopy: true }}
      >
        <sphereGeometry args={[t.canopyLitRadius, 10, 10]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.canopyLitColor}
          roughness={mat.canopyLit.roughness}
          metalness={mat.canopyLit.metalness}
          repeat={2}
        />
      </mesh>
      <mesh
        position={[t.canopySideX, t.canopySideY, t.canopySideZ]}
        castShadow
        userData={{ foliageCanopy: true }}
      >
        <sphereGeometry args={[t.canopySideRadius, 10, 10]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.canopyColor}
          roughness={mat.canopy.roughness}
          metalness={mat.canopy.metalness}
          repeat={2}
        />
      </mesh>
    </group>
  );
}

/**
 * Cooling wood node — short leftover of the same trunk, not a fat barrel.
 */
export function GatherDepletedStumpMesh({
  bodyColor,
  topColor,
  barkBandColor,
  rootColor,
  bodyRoughness,
  bodyMetalness,
  topRoughness,
  topMetalness,
  bodyMatRef,
  topMatRef,
  emissive,
  bodyEmissiveIntensity,
  topEmissive,
  topEmissiveIntensity,
}: {
  bodyColor: string;
  topColor: string;
  barkBandColor: string;
  rootColor: string;
  bodyRoughness: number;
  bodyMetalness: number;
  topRoughness: number;
  topMetalness: number;
  bodyMatRef?: Ref<MeshStandardMaterial | null>;
  topMatRef?: Ref<MeshStandardMaterial | null>;
  emissive: string;
  bodyEmissiveIntensity: number;
  topEmissive: string;
  topEmissiveIntensity: number;
}) {
  const t = GATHER_READY_TREE;
  return (
    <group>
      <GatherTreeBase
        rootColor={rootColor}
        roughness={bodyRoughness}
        metalness={bodyMetalness}
      />
      <mesh position={[0, t.stumpBodyY, 0]} castShadow>
        <cylinderGeometry
          args={[t.stumpRadiusTop, t.stumpRadiusBase, t.stumpBodyHeight, 8]}
        />
        <TexturedStandardMaterial
          kind="bark"
          ref={bodyMatRef}
          color={bodyColor}
          roughness={bodyRoughness}
          metalness={bodyMetalness}
          emissive={emissive}
          emissiveIntensity={bodyEmissiveIntensity}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, t.stumpBarkBandY, 0]}>
        <cylinderGeometry
          args={[t.stumpBarkBandRadius, t.stumpBarkBandRadius, 0.06, 8]}
        />
        <TexturedStandardMaterial
          kind="bark"
          color={barkBandColor}
          roughness={bodyRoughness}
          metalness={bodyMetalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, t.stumpTopY, 0]} castShadow>
        <cylinderGeometry
          args={[t.stumpTopRadius, t.stumpTopRadius, t.stumpTopHeight, 8]}
        />
        <TexturedStandardMaterial
          kind="bark"
          ref={topMatRef}
          color={topColor}
          roughness={topRoughness}
          metalness={topMetalness}
          emissive={topEmissive}
          emissiveIntensity={topEmissiveIntensity}
          repeat={1}
        />
      </mesh>
    </group>
  );
}
