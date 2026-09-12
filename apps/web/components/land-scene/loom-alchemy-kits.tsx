"use client";

import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import {
  processKitBodyEmissive,
  type ProcessKitBaseProps,
} from "@/lib/process-kit-shared";
import {
  PROCESS_STATION_WORKING_EMISSIVE,
  processStationKitMaterials,
} from "@game/shared";
import type { Ref } from "react";
import type { MeshStandardMaterial } from "three";

const LOOM_WARPS = [-0.4, -0.2, 0, 0.2, 0.4];
const ALCHEMY_LEGS: Array<[number, number]> = [
  [-0.52, -0.28],
  [0.52, -0.28],
  [-0.52, 0.28],
  [0.52, 0.28],
];

/** Open loom frame with warp threads. */
export function LoomKitMeshes({
  highlighted,
  showFirstWalkUpTip = false,
  craftWorking = false,
  nowMs = 0,
  treadleMatRef,
  cityLandmarkShow,
  cityLandmarkEmissive,
  cityLandmarkIntensity,
}: ProcessKitBaseProps & {
  treadleMatRef: Ref<MeshStandardMaterial | null>;
  cityLandmarkShow: boolean;
  cityLandmarkEmissive: string;
  cityLandmarkIntensity: number;
}) {
  const kit = processStationKitMaterials("loom");
  const body = processKitBodyEmissive(
    showFirstWalkUpTip,
    craftWorking,
    nowMs,
    kit.warpLitColor,
  );

  return (
    <group>
      {(
        [
          [-0.55, -0.28],
          [0.55, -0.28],
          [-0.55, 0.32],
          [0.55, 0.32],
        ] as const
      ).map(([x, z]) => (
        <mesh key={`post-${x}-${z}`} position={[x, 0.85, z]} castShadow>
          <kitBoxGeometry args={[0.1, 1.7, 0.1]} />
          <TexturedStandardMaterial
            kind="cloth"
            color={kit.beamColor}
            roughness={kit.beam.roughness}
            metalness={kit.beam.metalness}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.62, 0]} castShadow>
        <kitBoxGeometry args={[1.28, 0.1, 0.72]} />
        <TexturedStandardMaterial
          kind="cloth"
          color={kit.crossColor}
          roughness={kit.beam.roughness}
          metalness={kit.beam.metalness}
        />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <kitBoxGeometry args={[1.2, 0.12, 0.7]} />
        <TexturedStandardMaterial
          kind="cloth"
          color={highlighted ? kit.bodyLitColor : kit.bodyColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
          emissive={body.emissive}
          emissiveIntensity={body.intensity * 0.5}
        />
      </mesh>
      {LOOM_WARPS.map((x) => (
        <mesh key={`warp-${x}`} position={[x, 1.05, 0.02]}>
          <kitBoxGeometry args={[0.035, 1.15, 0.55]} />
          <TexturedStandardMaterial
            kind="cloth"
            color={highlighted ? kit.warpLitColor : kit.warpColor}
            roughness={kit.warp.roughness}
            metalness={kit.warp.metalness}
            emissive={body.emissive}
            emissiveIntensity={body.intensity}
          />
        </mesh>
      ))}
      <mesh position={[0.12, 1.05, 0.22]} castShadow>
        <kitBoxGeometry args={[0.42, 0.08, 0.14]} />
        <TexturedStandardMaterial
          kind="cloth"
          color={kit.shuttleColor}
          roughness={kit.shuttle.roughness}
          metalness={kit.shuttle.metalness}
        />
      </mesh>
      <mesh position={[0, 0.16, 0.38]} castShadow>
        <kitBoxGeometry args={[0.7, 0.08, 0.18]} />
        <TexturedStandardMaterial
          kind="cloth"
          ref={treadleMatRef}
          color={kit.treadleColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
          emissive={cityLandmarkShow ? cityLandmarkEmissive : "#000000"}
          emissiveIntensity={cityLandmarkShow ? cityLandmarkIntensity : 0}
        />
      </mesh>
    </group>
  );
}

/** Wooden alchemy table with flask + burner. */
export function AlchemyKitMeshes({
  highlighted,
  showFirstWalkUpTip = false,
  craftWorking = false,
  nowMs = 0,
  burnerLipMatRef,
  cityLandmarkShow,
  cityLandmarkEmissive,
  cityLandmarkIntensity,
}: ProcessKitBaseProps & {
  burnerLipMatRef: Ref<MeshStandardMaterial | null>;
  cityLandmarkShow: boolean;
  cityLandmarkEmissive: string;
  cityLandmarkIntensity: number;
}) {
  const kit = processStationKitMaterials("alchemy_bench");
  const body = processKitBodyEmissive(
    showFirstWalkUpTip,
    craftWorking,
    nowMs,
    kit.vesselLitColor,
    0.2,
  );
  const flaskEmissive = showFirstWalkUpTip
    ? kit.flaskLitColor
    : craftWorking
      ? PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive
      : "#000000";
  const flaskIntensity = showFirstWalkUpTip
    ? 0.12
    : craftWorking
      ? body.intensity * 0.55
      : 0;

  return (
    <group>
      {ALCHEMY_LEGS.map(([lx, lz]) => (
        <mesh key={`al-leg-${lx}-${lz}`} position={[lx, 0.32, lz]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 0.64, 6]} />
          <TexturedStandardMaterial
            kind="wood"
            color="#5a4a38"
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.66, 0]} castShadow>
        <kitBoxGeometry args={[1.35, 0.1, 0.75]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={highlighted ? kit.bodyLitColor : kit.bodyColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
          emissive={body.emissive}
          emissiveIntensity={body.intensity}
        />
      </mesh>
      <mesh position={[-0.22, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.55, 10]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={highlighted ? kit.vesselLitColor : kit.vesselColor}
          roughness={kit.vessel.roughness}
          metalness={kit.vessel.metalness}
          emissive={body.emissive}
          emissiveIntensity={body.intensity}
        />
      </mesh>
      <mesh position={[-0.22, 1.38, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 0.16, 8]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={kit.vesselColor}
          roughness={kit.vessel.roughness}
          metalness={kit.vessel.metalness}
        />
      </mesh>
      <mesh position={[0.32, 0.9, 0.12]} castShadow>
        <sphereGeometry args={[0.13, 16, 14]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={highlighted ? kit.flaskLitColor : kit.flaskColor}
          roughness={kit.flask.roughness}
          metalness={kit.flask.metalness}
          transparent
          opacity={0.82}
          emissive={flaskEmissive}
          emissiveIntensity={flaskIntensity}
          repeat={1}
        />
      </mesh>
      <mesh position={[0.32, 1.08, 0.12]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 0.16, 8]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={kit.flaskColor}
          roughness={kit.flask.roughness}
          metalness={kit.flask.metalness}
        />
      </mesh>
      <mesh position={[0.48, 0.78, -0.18]} castShadow>
        <kitBoxGeometry args={[0.16, 0.22, 0.16]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={kit.burnerColor}
          roughness={kit.burner.roughness}
          metalness={kit.burner.metalness}
        />
      </mesh>
      <mesh position={[0.48, 0.9, -0.18]}>
        <kitBoxGeometry args={[0.2, 0.05, 0.2]} />
        <TexturedStandardMaterial
          kind="plaster"
          ref={burnerLipMatRef}
          color={kit.burnerLipColor}
          roughness={kit.burner.roughness}
          metalness={kit.burner.metalness}
          emissive={cityLandmarkShow ? cityLandmarkEmissive : "#000000"}
          emissiveIntensity={cityLandmarkShow ? cityLandmarkIntensity : 0}
        />
      </mesh>
    </group>
  );
}
