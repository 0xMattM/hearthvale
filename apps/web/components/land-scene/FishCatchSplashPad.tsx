"use client";

import {
  FISH_CATCH_SPLASH_FLASH,
  cuePadFlashMaterials,
  fishCatchSplashFlashEmissiveIntensity,
  fishCatchSplashFlashEnvelope,
  fishCatchSplashFlashOpacity,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";

/**
 * Brief cool water splash pad after successful dock catch (PL132.1).
 * Complements Caught + ready shimmer; distinct from mint-lime gather PL131.2.
 */
export function FishCatchSplashPad({
  active,
  startedAtMs,
  y = -0.005,
  radius = FISH_CATCH_SPLASH_FLASH.radius,
}: {
  active: boolean;
  startedAtMs: number | null;
  /** Local Y above the dock group origin (slightly under water). */
  y?: number;
  radius?: number;
}) {
  const matRef = useRef<MeshStandardMaterial>(null);
  // Reason: VA5.4 — cooler water disc PBR; splash RGB stays on catalog.
  const flashMat = cuePadFlashMaterials();

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    if (!active || startedAtMs == null) {
      mat.opacity = 0;
      mat.emissiveIntensity = 0;
      return;
    }
    const envelope = fishCatchSplashFlashEnvelope(
      performance.now() - startedAtMs,
    );
    mat.opacity = fishCatchSplashFlashOpacity(envelope);
    mat.emissiveIntensity = fishCatchSplashFlashEmissiveIntensity(envelope);
  });

  if (!active) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, -0.15]} receiveShadow>
      <circleGeometry args={[radius, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={FISH_CATCH_SPLASH_FLASH.padColor}
        transparent
        opacity={FISH_CATCH_SPLASH_FLASH.opacityPeak}
        emissive={FISH_CATCH_SPLASH_FLASH.emissiveColor}
        emissiveIntensity={FISH_CATCH_SPLASH_FLASH.intensityPeak}
        roughness={flashMat.waterDisc.roughness}
        metalness={flashMat.waterDisc.metalness}
        depthWrite={false}
      />
    </mesh>
  );
}
