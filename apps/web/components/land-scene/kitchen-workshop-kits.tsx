"use client";

import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import {
  processKitBodyEmissive,
  processKitWorkGlow,
  type ProcessKitBaseProps,
} from "@/lib/process-kit-shared";
import { processStationKitMaterials } from "@game/shared";
import type { Ref } from "react";
import type { MeshStandardMaterial } from "three";

const WORKBENCH_LEGS: Array<[number, number]> = [
  [-0.72, -0.32],
  [0.72, -0.32],
  [-0.72, 0.32],
  [0.72, 0.32],
];

const CAULDRON_LEGS: Array<[number, number]> = [
  [0.12, 0.14],
  [-0.14, 0.08],
  [0.02, -0.14],
];
const COUNTER_LEGS: Array<[number, number]> = [
  [-0.78, -0.28],
  [-0.78, 0.28],
  [-0.38, -0.28],
  [-0.38, 0.28],
];

/** Brick stove + iron cauldron over embers, wood prep board on the side. */
export function KitchenKitMeshes({
  highlighted,
  showFirstWalkUpTip = false,
  craftWorking = false,
  nowMs = 0,
  lipMatRef,
  cityLandmarkShow,
  cityLandmarkEmissive,
  cityLandmarkIntensity,
}: ProcessKitBaseProps & {
  lipMatRef: Ref<MeshStandardMaterial | null>;
  cityLandmarkShow: boolean;
  cityLandmarkEmissive: string;
  cityLandmarkIntensity: number;
}) {
  const kit = processStationKitMaterials("kitchen");
  const body = processKitBodyEmissive(
    showFirstWalkUpTip,
    craftWorking,
    nowMs,
    kit.potColor,
  );
  const workGlow = processKitWorkGlow(
    showFirstWalkUpTip,
    craftWorking,
    nowMs,
  );
  const fireGlow = showFirstWalkUpTip
    ? 1.05
    : craftWorking
      ? 0.9 + workGlow * 0.4
      : highlighted
        ? 0.9
        : 0.45;

  return (
    <group>
      <mesh position={[0.3, 0.38, 0]} castShadow>
        <kitBoxGeometry args={[0.92, 0.76, 0.82]} />
        <TexturedStandardMaterial
          kind="stone"
          color={highlighted ? kit.bodyLitColor : kit.bodyColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
          emissive={body.emissive}
          emissiveIntensity={body.intensity}
          repeat={2}
        />
      </mesh>
      <mesh position={[0.3, 0.3, 0.42]} castShadow>
        <kitBoxGeometry args={[0.36, 0.28, 0.06]} />
        <TexturedStandardMaterial
          kind="metal"
          color="#2a2420"
          roughness={0.55}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[0.3, 0.78, 0]} castShadow>
        <kitBoxGeometry args={[0.98, 0.08, 0.86]} />
        <TexturedStandardMaterial
          kind="metal"
          color="#4a4e54"
          roughness={0.45}
          metalness={0.55}
        />
      </mesh>
      <mesh position={[0.3, 0.84, 0.04]}>
        <cylinderGeometry args={[0.26, 0.28, 0.08, 12]} />
        <TexturedStandardMaterial
          kind="metal"
          ref={lipMatRef}
          color="#3a3e44"
          roughness={0.5}
          metalness={0.5}
          emissive={cityLandmarkShow ? cityLandmarkEmissive : "#000000"}
          emissiveIntensity={cityLandmarkShow ? cityLandmarkIntensity : 0}
        />
      </mesh>
      <mesh position={[0.3, 0.86, 0.04]}>
        <cylinderGeometry args={[0.16, 0.18, 0.07, 8]} />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.potColor}
          roughness={kit.pot.roughness}
          metalness={kit.pot.metalness}
          emissive="#ff4a00"
          emissiveIntensity={fireGlow}
        />
      </mesh>
      <mesh position={[0.3, 1.12, 0.04]} scale={[1, 0.82, 1]} castShadow>
        <sphereGeometry args={[0.26, 14, 12]} />
        <TexturedStandardMaterial
          kind="metal"
          color="#3e4248"
          roughness={0.4}
          metalness={0.65}
        />
      </mesh>
      <mesh position={[0.3, 1.3, 0.04]}>
        <torusGeometry args={[0.18, 0.028, 6, 14]} />
        <TexturedStandardMaterial
          kind="metal"
          color="#5a5e64"
          roughness={0.35}
          metalness={0.7}
        />
      </mesh>
      <mesh position={[0.3, 1.42, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.02, 6, 12, Math.PI]} />
        <TexturedStandardMaterial
          kind="metal"
          color="#5a5e64"
          roughness={0.35}
          metalness={0.7}
        />
      </mesh>
      {CAULDRON_LEGS.map(([lx, lz]) => (
        <mesh
          key={`cauldron-leg-${lx}-${lz}`}
          position={[0.3 + lx, 0.92, 0.04 + lz]}
          castShadow
        >
          <cylinderGeometry args={[0.025, 0.035, 0.16, 6]} />
          <TexturedStandardMaterial
            kind="metal"
            color="#3e4248"
            roughness={0.45}
            metalness={0.6}
          />
        </mesh>
      ))}
      <mesh position={[0.3, 1.28, -0.34]} castShadow>
        <kitBoxGeometry args={[0.26, 0.85, 0.26]} />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.shelfColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
        />
      </mesh>
      {COUNTER_LEGS.map(([x, z]) => (
        <mesh key={`counter-leg-${x}-${z}`} position={[x, 0.28, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.56, 6]} />
          <TexturedStandardMaterial
            kind="wood"
            color={kit.shelfColor}
            roughness={kit.body.roughness}
            metalness={kit.body.metalness}
          />
        </mesh>
      ))}
      <mesh position={[-0.58, 0.58, 0]} castShadow>
        <kitBoxGeometry args={[0.78, 0.1, 0.72]} />
        <TexturedStandardMaterial
          kind="wood"
          color={kit.bodyColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
        />
      </mesh>
      <mesh position={[-0.55, 0.66, 0.12]} castShadow>
        <kitBoxGeometry args={[0.42, 0.05, 0.28]} />
        <TexturedStandardMaterial
          kind="wood"
          color={kit.boardColor}
          roughness={kit.board.roughness}
          metalness={kit.board.metalness}
        />
      </mesh>
      <mesh position={[-0.42, 0.7, 0.12]} rotation={[0, 0.35, 0.12]} castShadow>
        <kitBoxGeometry args={[0.26, 0.03, 0.05]} />
        <TexturedStandardMaterial
          kind="metal"
          color="#8a9098"
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>
    </group>
  );
}

/** Carpenter workbench with saw + plank stack (not a shed). */
export function WorkshopKitMeshes({
  highlighted,
  showFirstWalkUpTip = false,
  craftWorking = false,
  nowMs = 0,
  plankMatRef,
  cityLandmarkShow,
  cityLandmarkEmissive,
  cityLandmarkIntensity,
}: ProcessKitBaseProps & {
  plankMatRef: Ref<MeshStandardMaterial | null>;
  cityLandmarkShow: boolean;
  cityLandmarkEmissive: string;
  cityLandmarkIntensity: number;
}) {
  const kit = processStationKitMaterials("workshop");
  const body = processKitBodyEmissive(
    showFirstWalkUpTip,
    craftWorking,
    nowMs,
    kit.benchColor,
  );

  return (
    <group>
      {WORKBENCH_LEGS.map(([lx, lz]) => (
        <mesh key={`leg-${lx}-${lz}`} position={[lx, 0.36, lz]} castShadow>
          <cylinderGeometry args={[0.055, 0.07, 0.72, 6]} />
          <TexturedStandardMaterial
            kind="wood"
            color={kit.bodyColor}
            roughness={kit.body.roughness}
            metalness={kit.body.metalness}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.76, 0]} castShadow>
        <kitBoxGeometry args={[1.7, 0.1, 0.85]} />
        <TexturedStandardMaterial
          kind="wood"
          color={highlighted ? kit.bodyLitColor : kit.benchColor}
          roughness={kit.bench.roughness}
          metalness={kit.bench.metalness}
          emissive={body.emissive}
          emissiveIntensity={body.intensity}
        />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <kitBoxGeometry args={[1.62, 0.08, 0.12]} />
        <TexturedStandardMaterial
          kind="wood"
          color={kit.bodyColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
        />
      </mesh>
      <mesh position={[-0.55, 0.9, 0.08]} rotation={[0.15, 0.35, 0.9]} castShadow>
        <kitBoxGeometry args={[0.72, 0.04, 0.14]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={kit.toolColor}
          roughness={kit.tool.roughness}
          metalness={kit.tool.metalness}
        />
      </mesh>
      <mesh position={[-0.22, 0.92, 0.18]} rotation={[0.1, 0.35, 0.4]} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 0.28, 6]} />
        <TexturedStandardMaterial
          kind="wood"
          color={kit.bodyColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
        />
      </mesh>
      <mesh position={[0.55, 0.84, -0.12]} castShadow>
        <kitBoxGeometry args={[0.55, 0.08, 0.22]} />
        <TexturedStandardMaterial
          kind="thatch"
          ref={plankMatRef}
          color={kit.plankColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
          emissive={cityLandmarkShow ? cityLandmarkEmissive : "#000000"}
          emissiveIntensity={cityLandmarkShow ? cityLandmarkIntensity : 0}
        />
      </mesh>
      <mesh position={[0.52, 0.92, -0.1]} castShadow>
        <kitBoxGeometry args={[0.5, 0.07, 0.2]} />
        <TexturedStandardMaterial
          kind="wood"
          color={kit.plankColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
        />
      </mesh>
      <mesh position={[0.78, 0.55, 0.38]} castShadow>
        <kitBoxGeometry args={[0.18, 0.35, 0.18]} />
        <TexturedStandardMaterial
          kind="metal"
          color={kit.toolColor}
          roughness={kit.tool.roughness}
          metalness={kit.tool.metalness}
        />
      </mesh>
      <mesh position={[0, 1.15, -0.38]} castShadow>
        <kitBoxGeometry args={[1.2, 0.55, 0.06]} />
        <TexturedStandardMaterial
          kind="wood"
          color={kit.bodyColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
        />
      </mesh>
      <mesh position={[-0.28, 1.05, -0.32]} rotation={[0.4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.35, 6]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={kit.toolColor}
          roughness={kit.tool.roughness}
          metalness={kit.tool.metalness}
        />
      </mesh>
    </group>
  );
}
