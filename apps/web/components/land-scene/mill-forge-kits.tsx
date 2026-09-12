"use client";

import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { getMillMaps } from "@/lib/mill-kit-surfaces";
import {
  processKitBodyEmissive,
  processKitWorkGlow,
  type ProcessKitBaseProps,
} from "@/lib/process-kit-shared";
import {
  cityMillLandmarkCue,
  cityMillLandmarkEmissiveIntensity,
  cityMillLandmarkPulseEnvelope,
  processStationKitMaterials,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import type { Ref } from "react";
import { useMemo, useRef } from "react";
import type { MeshStandardMaterial } from "three";

const SAIL_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

/** Clay tower + wooden vanes (not an all-timber mill). */
export function MillKitMeshes({
  highlighted,
  tier,
  landKind = "player_land",
  showFirstWalkUpTip = false,
  craftWorking = false,
  nowMs = 0,
}: ProcessKitBaseProps & { tier: number }) {
  const kit = processStationKitMaterials("mill");
  const body = processKitBodyEmissive(
    showFirstWalkUpTip,
    craftWorking,
    nowMs,
    kit.towerLitColor,
    0.2,
  );
  const cityLandmark = cityMillLandmarkCue(landKind);
  const bandMatRef = useRef<MeshStandardMaterial>(null);
  const plaster = useMemo(() => getMillMaps("tower"), []);
  const stone = useMemo(() => getMillMaps("base"), []);
  const roof = useMemo(() => getMillMaps("roof"), []);
  const wood = useMemo(() => getMillMaps("timber"), []);
  const sailWood = useMemo(() => getMillMaps("sails"), []);

  useFrame(() => {
    if (!cityLandmark.show || !bandMatRef.current) return;
    const envelope = cityMillLandmarkPulseEnvelope(performance.now());
    bandMatRef.current.emissiveIntensity =
      cityMillLandmarkEmissiveIntensity(envelope);
  });

  return (
    <group scale={1.75}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.72, 0.8, 0.2, 8]} />
        <meshStandardMaterial
          ref={bandMatRef}
          map={stone.map}
          bumpMap={stone.bumpMap}
          bumpScale={stone.bumpScale}
          color="#ffffff"
          roughness={0.9}
          metalness={0.04}
          emissive={cityLandmark.show ? cityLandmark.emissive : "#000000"}
          emissiveIntensity={cityLandmark.show ? cityLandmark.intensity : 0}
        />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.66, 1.75, 8]} />
        <meshStandardMaterial
          map={plaster.map}
          bumpMap={plaster.bumpMap}
          bumpScale={plaster.bumpScale}
          color={highlighted ? "#fff8ee" : "#ffffff"}
          roughness={0.88}
          metalness={0.03}
          emissive={body.emissive}
          emissiveIntensity={body.intensity}
        />
      </mesh>
      <mesh position={[0, 0.48, 0.63]} castShadow>
        <kitBoxGeometry args={[0.22, 0.52, 0.04]} />
        <meshStandardMaterial
          map={wood.map}
          bumpMap={wood.bumpMap}
          bumpScale={wood.bumpScale}
          color="#ffffff"
          roughness={0.86}
          metalness={0.04}
        />
      </mesh>
      <mesh position={[0, 2.18, 0]} castShadow>
        <coneGeometry args={[0.68, 0.62, 8]} />
        <meshStandardMaterial
          map={roof.map}
          bumpMap={roof.bumpMap}
          bumpScale={roof.bumpScale}
          color="#ffffff"
          roughness={0.9}
          metalness={0.03}
        />
      </mesh>
      <group position={[0, 1.92, 0.62]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.18, 8]} />
          <meshStandardMaterial
            map={wood.map}
            bumpMap={wood.bumpMap}
            bumpScale={0.08}
            color="#ffffff"
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
        {SAIL_ANGLES.map((angle) => (
          <group key={`sail-${angle}`} rotation={[0, 0, angle]}>
            <mesh position={[0, 0.92, 0]} castShadow>
              <kitBoxGeometry args={[0.06, 1.7, 0.06]} />
              <meshStandardMaterial
                map={wood.map}
                bumpMap={wood.bumpMap}
                bumpScale={wood.bumpScale}
                color="#ffffff"
                roughness={0.86}
                metalness={0.04}
              />
            </mesh>
            <mesh position={[0.16, 0.9, 0.02]} castShadow>
              <kitBoxGeometry args={[0.3, 1.48, 0.03]} />
              <meshStandardMaterial
                map={sailWood.map}
                bumpMap={sailWood.bumpMap}
                bumpScale={sailWood.bumpScale}
                color="#ffffff"
                roughness={0.88}
                metalness={0.03}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** Closed brick furnace with a front fire-mouth + side anvil (not an armchair). */
export function ForgeKitMeshes({
  highlighted,
  tier,
  showFirstWalkUpTip = false,
  craftWorking = false,
  nowMs = 0,
  lipMatRef,
  cityLandmarkShow,
  cityLandmarkEmissive,
  cityLandmarkIntensity,
}: ProcessKitBaseProps & {
  tier: number;
  lipMatRef: Ref<MeshStandardMaterial | null>;
  cityLandmarkShow: boolean;
  cityLandmarkEmissive: string;
  cityLandmarkIntensity: number;
}) {
  const kit = processStationKitMaterials("forge");
  const brick = highlighted ? kit.bodyLitColor : kit.bodyColor;
  const body = processKitBodyEmissive(
    showFirstWalkUpTip,
    craftWorking,
    nowMs,
    "#ff6a2a",
    0.18,
  );
  const workGlow = processKitWorkGlow(
    showFirstWalkUpTip,
    craftWorking,
    nowMs,
  );
  const emberBase = showFirstWalkUpTip
    ? tier >= 2
      ? 1.7
      : 1.45
    : highlighted
      ? tier >= 2
        ? 1.5
        : 1.2
      : tier >= 2
        ? 0.9
        : 0.65;
  const chimneyH = tier >= 2 ? 1.15 : 0.88;

  return (
    <group>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <kitBoxGeometry args={[1.15, 0.24, 0.95]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#5a5048"
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
        />
      </mesh>
      <mesh position={[0, 0.72, -0.04]} castShadow>
        <kitBoxGeometry args={[1.08, 1.05, 0.88]} />
        <TexturedStandardMaterial
          kind="stone"
          color={brick}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
          emissive={body.emissive}
          emissiveIntensity={body.intensity}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 0.52, 0.4]}>
        <kitBoxGeometry args={[0.5, 0.44, 0.2]} />
        <TexturedStandardMaterial
          kind="metal"
          color="#1a1410"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.8, 0.42]} castShadow>
        <kitBoxGeometry args={[0.62, 0.14, 0.16]} />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.fireboxLipColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
        />
      </mesh>
      <mesh position={[0, 0.32, 0.44]}>
        <kitBoxGeometry args={[0.54, 0.08, 0.14]} />
        <TexturedStandardMaterial
          kind="metal"
          ref={lipMatRef}
          color={kit.fireboxLipColor}
          roughness={kit.body.roughness}
          metalness={kit.body.metalness}
          emissive={cityLandmarkShow ? cityLandmarkEmissive : "#000000"}
          emissiveIntensity={cityLandmarkShow ? cityLandmarkIntensity : 0}
        />
      </mesh>
      <mesh position={[0, 0.42, 0.34]}>
        <kitBoxGeometry args={[0.34, 0.16, 0.18]} />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.emberColor}
          roughness={kit.ember.roughness}
          metalness={kit.ember.metalness}
          emissive="#ff3a00"
          emissiveIntensity={
            craftWorking && !showFirstWalkUpTip
              ? emberBase + workGlow * 0.35
              : emberBase
          }
        />
      </mesh>
      <mesh position={[0, 1.55, -0.12]} castShadow>
        <kitBoxGeometry args={[0.3, chimneyH, 0.3]} />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.chimneyColor}
          roughness={kit.chimney.roughness}
          metalness={kit.chimney.metalness}
        />
      </mesh>
      <mesh position={[0, 1.55 + chimneyH / 2 + 0.04, -0.12]}>
        <kitBoxGeometry args={[0.4, 0.08, 0.4]} />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.chimneyColor}
          roughness={kit.chimney.roughness}
          metalness={kit.chimney.metalness}
        />
      </mesh>
      {tier >= 2 ? (
        <mesh position={[0.28, 1.42, -0.12]} castShadow>
          <kitBoxGeometry args={[0.18, 0.55, 0.18]} />
          <TexturedStandardMaterial
            kind="stone"
            color={kit.chimneyUpgradedColor}
            roughness={kit.chimney.roughness}
            metalness={kit.chimney.metalness}
          />
        </mesh>
      ) : null}
      <mesh position={[1.02, 0.16, 0.08]} castShadow>
        <kitBoxGeometry args={[0.22, 0.32, 0.22]} />
        <TexturedStandardMaterial
          kind="metal"
          color={kit.anvilColor}
          roughness={kit.anvil.roughness}
          metalness={kit.anvil.metalness}
        />
      </mesh>
      <mesh position={[1.02, 0.36, 0.08]} castShadow>
        <kitBoxGeometry args={[0.14, 0.12, 0.14]} />
        <TexturedStandardMaterial
          kind="metal"
          color={kit.anvilColor}
          roughness={kit.anvil.roughness}
          metalness={kit.anvil.metalness}
        />
      </mesh>
      <mesh position={[1.02, 0.5, 0.08]} castShadow>
        <kitBoxGeometry args={[0.52, 0.16, 0.2]} />
        <TexturedStandardMaterial
          kind="metal"
          color={kit.anvilColor}
          roughness={kit.anvil.roughness}
          metalness={kit.anvil.metalness}
        />
      </mesh>
      <mesh
        position={[1.34, 0.5, 0.08]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.03, 0.07, 0.26, 8]} />
        <TexturedStandardMaterial
          kind="metal"
          color={kit.anvilColor}
          roughness={kit.anvil.roughness}
          metalness={kit.anvil.metalness}
        />
      </mesh>
      <mesh position={[0.88, 0.66, 0.02]} rotation={[0, 0.2, -0.55]} castShadow>
        <cylinderGeometry args={[0.022, 0.028, 0.38, 6]} />
        <TexturedStandardMaterial
          kind="wood"
          color="#6a4a28"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[1.02, 0.78, -0.04]} castShadow>
        <kitBoxGeometry args={[0.14, 0.07, 0.09]} />
        <TexturedStandardMaterial
          kind="metal"
          color={kit.anvilColor}
          roughness={kit.anvil.roughness}
          metalness={kit.anvil.metalness}
        />
      </mesh>
    </group>
  );
}
