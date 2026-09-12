"use client";

import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { useFoliageOcclusionFade } from "@/components/land-scene/useFoliageOcclusionFade";
import {
  FOLIAGE_CANOPY,
  cityDecorBushMaterials,
  cityDecorFenceMaterials,
  cityDecorTreeMaterials,
  type CityAtmosphereDecorBush,
  type CityAtmosphereDecorFence,
  type CityAtmosphereDecorTree,
} from "@game/shared";
import { VillageFenceRun, VillageGltfProp } from "@/components/land-scene/VillageGltfProp";
import { japanVillageProp } from "@/lib/japan-village";
import { useRef } from "react";
import type { Group } from "three";

export { CityMainHall, CityCivicHouse } from "@/components/land-scene/CityMainHall";

/**
 * City deciduous atmosphere tree — cooler canopy than homestead; not a gather stump.
 * Follow camera ghosts the canopy only while the player stands behind it.
 */
export function CityDecorTree({
  x,
  z,
  scale = 1,
}: CityAtmosphereDecorTree) {
  const mat = cityDecorTreeMaterials();
  const groupRef = useRef<Group>(null);
  useFoliageOcclusionFade(groupRef, x, z, scale, FOLIAGE_CANOPY.cityDecor);
  return (
    <group ref={groupRef} position={[x, 0, z]} scale={scale}>
      <VillageGltfProp
        model={japanVillageProp("tree")}
        tagFoliage
        kit={<CityDecorTreeKit mat={mat} />}
      />
    </group>
  );
}

function CityDecorTreeKit({
  mat,
}: {
  mat: ReturnType<typeof cityDecorTreeMaterials>;
}) {
  return (
    <>
      {[
        [0.22, 0.06, 0.18, 0.1],
        [-0.2, 0.05, -0.14, 0.09],
        [0.04, 0.05, -0.22, 0.08],
      ].map(([rx, ry, rz, r], i) => (
        <mesh key={`root-${i}`} position={[rx!, ry!, rz!]} castShadow>
          <cylinderGeometry args={[r! * 0.55, r!, 0.12, 6]} />
          <TexturedStandardMaterial
            kind="bark"
            color={mat.rootColor}
            roughness={mat.trunk.roughness}
            metalness={mat.trunk.metalness}
            repeat={1}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.6, 8]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.trunkColor}
          roughness={mat.trunk.roughness}
          metalness={mat.trunk.metalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 8]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.barkBandColor}
          roughness={mat.barkBand.roughness}
          metalness={mat.barkBand.metalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow userData={{ foliageCanopy: true }}>
        <sphereGeometry args={[0.85, 12, 12]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.canopyColor}
          roughness={mat.canopy.roughness}
          metalness={mat.canopy.metalness}
          repeat={2}
        />
      </mesh>
      <mesh position={[0.35, 2.3, -0.2]} castShadow userData={{ foliageCanopy: true }}>
        <sphereGeometry args={[0.48, 10, 10]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.canopyLitColor}
          roughness={mat.canopyLit.roughness}
          metalness={mat.canopyLit.metalness}
          repeat={2}
        />
      </mesh>
      <mesh position={[-0.32, 2.2, 0.22]} castShadow userData={{ foliageCanopy: true }}>
        <sphereGeometry args={[0.42, 10, 10]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.canopyColor}
          roughness={mat.canopy.roughness}
          metalness={mat.canopy.metalness}
          repeat={2}
        />
      </mesh>
    </>
  );
}

/**
 * Soft round bush cluster — atmosphere foliage, walk-through.
 */
export function CityDecorBush({
  x,
  z,
  scale = 1,
}: CityAtmosphereDecorBush) {
  const mat = cityDecorBushMaterials();
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.35, 5]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.twigColor}
          roughness={0.92}
          metalness={0.02}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.42, 8, 8]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.leafColor}
          roughness={mat.leaf.roughness}
          metalness={mat.leaf.metalness}
          repeat={2}
        />
      </mesh>
      <mesh position={[0.22, 0.38, 0.12]} castShadow>
        <sphereGeometry args={[0.28, 7, 7]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.leafLitColor}
          roughness={mat.leaf.roughness}
          metalness={mat.leaf.metalness}
          repeat={2}
        />
      </mesh>
      <mesh position={[-0.18, 0.36, -0.1]} castShadow>
        <sphereGeometry args={[0.24, 7, 7]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.leafColor}
          roughness={mat.leaf.roughness}
          metalness={mat.leaf.metalness}
          repeat={2}
        />
      </mesh>
    </group>
  );
}

/**
 * Short post+rail fence segment — civic cooler wood; not a station.
 */
export function CityDecorFence({
  x,
  z,
  rotY,
  length,
}: CityAtmosphereDecorFence) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <VillageFenceRun
        length={length}
        kit={<CityDecorFenceKit length={length} />}
      />
    </group>
  );
}

function CityDecorFenceKit({ length }: { length: number }) {
  const mat = cityDecorFenceMaterials();
  const postCount = Math.max(2, Math.round(length / 1.35) + 1);
  const span = length;
  const posts = Array.from({ length: postCount }, (_, i) => {
    const t = postCount === 1 ? 0 : i / (postCount - 1);
    return -span / 2 + t * span;
  });

  return (
    <>
      {posts.map((px, i) => (
        <group key={`post-${i}`} position={[px, 0, 0]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 1.1, 6]} />
            <TexturedStandardMaterial
              kind="wood"
              color={mat.postColor}
              roughness={mat.post.roughness}
              metalness={mat.post.metalness}
              repeat={1}
            />
          </mesh>
          <mesh position={[0, 1.12, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.08, 6]} />
            <TexturedStandardMaterial
              kind="wood"
              color={mat.capColor}
              roughness={mat.cap.roughness}
              metalness={mat.cap.metalness}
              repeat={1}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.42, 0]} castShadow>
        <kitBoxGeometry args={[span - 0.15, 0.08, 0.06]} />
        <TexturedStandardMaterial
          kind="wood"
          color={mat.railColor}
          roughness={mat.rail.roughness}
          metalness={mat.rail.metalness}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <kitBoxGeometry args={[span - 0.15, 0.08, 0.06]} />
        <TexturedStandardMaterial
          kind="wood"
          color={mat.railColor}
          roughness={mat.rail.roughness}
          metalness={mat.rail.metalness}
          repeat={2}
        />
      </mesh>
    </>
  );
}
