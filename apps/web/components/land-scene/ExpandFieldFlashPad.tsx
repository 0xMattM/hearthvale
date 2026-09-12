"use client";

import {
  EXPAND_FIELD_PAD_FLASH,
  cuePadFlashMaterials,
  expandFieldPadFlashEmissiveIntensity,
  expandFieldPadFlashEnvelope,
  expandFieldPadFlashOpacity,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";

/**
 * Brief warm field-gold pad flash after successful land expand (PL137.2).
 * Complements Expanded cue + expand SFX; costs / slots unchanged.
 */
export function ExpandFieldFlashPad({
  active,
  startedAtMs,
  y = 0.028,
  radius = EXPAND_FIELD_PAD_FLASH.radius,
}: {
  active: boolean;
  startedAtMs: number | null;
  /** Local Y above the footprint origin. */
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
    const envelope = expandFieldPadFlashEnvelope(
      performance.now() - startedAtMs,
    );
    mat.opacity = expandFieldPadFlashOpacity(envelope);
    mat.emissiveIntensity = expandFieldPadFlashEmissiveIntensity(envelope);
  });

  if (!active) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <circleGeometry args={[radius, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={EXPAND_FIELD_PAD_FLASH.padColor}
        transparent
        opacity={EXPAND_FIELD_PAD_FLASH.opacityPeak}
        emissive={EXPAND_FIELD_PAD_FLASH.emissiveColor}
        emissiveIntensity={EXPAND_FIELD_PAD_FLASH.intensityPeak}
        roughness={flashMat.disc.roughness}
        metalness={flashMat.disc.metalness}
        depthWrite={false}
      />
    </mesh>
  );
}
