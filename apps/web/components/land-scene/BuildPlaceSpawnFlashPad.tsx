"use client";

import {
  BUILD_PLACE_SPAWN_FLASH,
  cuePadFlashMaterials,
  buildPlaceSpawnFlashEmissiveIntensity,
  buildPlaceSpawnFlashEnvelope,
  buildPlaceSpawnFlashOpacity,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";

/**
 * Brief warm timber-amber pad flash after successful homestead station place (PL134.1).
 * Complements Homestead / Built cues; place costs unchanged.
 */
export function BuildPlaceSpawnFlashPad({
  active,
  startedAtMs,
  y = 0.026,
  radius = BUILD_PLACE_SPAWN_FLASH.radius,
}: {
  active: boolean;
  startedAtMs: number | null;
  /** Local Y above the station group origin. */
  y?: number;
  radius?: number;
}) {
  const matRef = useRef<MeshStandardMaterial>(null);
  // Reason: VA5.4 — PBR under flash envelope; pad RGB stays on catalog.
  const flashMat = cuePadFlashMaterials();

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    if (!active || startedAtMs == null) {
      mat.opacity = 0;
      mat.emissiveIntensity = 0;
      return;
    }
    const envelope = buildPlaceSpawnFlashEnvelope(
      performance.now() - startedAtMs,
    );
    mat.opacity = buildPlaceSpawnFlashOpacity(envelope);
    mat.emissiveIntensity = buildPlaceSpawnFlashEmissiveIntensity(envelope);
  });

  if (!active) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <circleGeometry args={[radius, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={BUILD_PLACE_SPAWN_FLASH.padColor}
        transparent
        opacity={BUILD_PLACE_SPAWN_FLASH.opacityPeak}
        emissive={BUILD_PLACE_SPAWN_FLASH.emissiveColor}
        emissiveIntensity={BUILD_PLACE_SPAWN_FLASH.intensityPeak}
        roughness={flashMat.disc.roughness}
        metalness={flashMat.disc.metalness}
        depthWrite={false}
      />    </mesh>
  );
}
