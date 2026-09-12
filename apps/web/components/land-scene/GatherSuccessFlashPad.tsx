"use client";

import {
  GATHER_SUCCESS_PAD_FLASH,
  cuePadFlashMaterials,
  gatherSuccessPadFlashEmissiveIntensity,
  gatherSuccessPadFlashEnvelope,
  gatherSuccessPadFlashOpacity,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";

/**
 * Brief mint-lime pad flash after successful stump / ore / pen gather (PL131.2).
 * Complements Chopped/Mined/Collected + inventory flash; yields unchanged.
 */
export function GatherSuccessFlashPad({
  active,
  startedAtMs,
  y = 0.028,
  radius = GATHER_SUCCESS_PAD_FLASH.radius,
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
    const envelope = gatherSuccessPadFlashEnvelope(
      performance.now() - startedAtMs,
    );
    mat.opacity = gatherSuccessPadFlashOpacity(envelope);
    mat.emissiveIntensity = gatherSuccessPadFlashEmissiveIntensity(envelope);
  });

  if (!active) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <circleGeometry args={[radius, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={GATHER_SUCCESS_PAD_FLASH.padColor}
        transparent
        opacity={GATHER_SUCCESS_PAD_FLASH.opacityPeak}
        emissive={GATHER_SUCCESS_PAD_FLASH.emissiveColor}
        emissiveIntensity={GATHER_SUCCESS_PAD_FLASH.intensityPeak}
        roughness={flashMat.disc.roughness}
        metalness={flashMat.disc.metalness}
        depthWrite={false}
      />
    </mesh>
  );
}
