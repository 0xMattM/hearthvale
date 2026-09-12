"use client";

import "@/components/land-scene/kit-box-geometry";
import { HUMANOID_BODY, HUMANOID_LAYOUT } from "@/lib/humanoid-layout";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";

interface ClothMatProps {
  kind?: "cloth" | "leather" | "plaster" | "thatch" | "metal" | "wood";
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  repeat?: number;
}

function ClothMat({
  kind = "cloth",
  color,
  roughness = 0.86,
  metalness = 0.03,
  emissive = "#000000",
  emissiveIntensity = 0,
  repeat = 1,
}: ClothMatProps) {
  return (
    <TexturedStandardMaterial
      kind={kind}
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      repeat={repeat}
    />
  );
}

/**
 * Hooded chibi head — soft hood, plain skin face, dot eyes (traveler reference).
 */
export function HumanoidHead({
  skin,
  hair = "#4a3428",
  eye = "#1a1814",
  capColor,
  hoodColor,
  scale = 1,
}: {
  skin: string;
  hair?: string;
  eye?: string;
  /** Small cap on top of hood (uses palette hat when omitted). */
  capColor?: string;
  /** Tutor / cloak tint for hood fabric. */
  hoodColor?: string;
  scale?: number;
}) {
  const hood = hoodColor ?? hair;
  const cap = capColor ?? "#5a8a48";
  const fw = HUMANOID_LAYOUT.faceWidth;
  const fh = HUMANOID_LAYOUT.faceHeight;
  const er = HUMANOID_LAYOUT.eyeRadius;

  return (
    <group scale={scale * HUMANOID_LAYOUT.headScale}>
      {/* Hood shell — behind the face, warm fabric only */}
      <mesh position={[0, 0.03, -0.07]} castShadow>
        <kitBoxGeometry args={[0.28, 0.28, 0.16]} />
        <ClothMat kind="cloth" color={hood} roughness={0.92} repeat={1} />
      </mesh>

      {/* Face — flat skin tone, no extra color blocks */}
      <mesh position={[0, -0.01, 0.1]} castShadow>
        <kitBoxGeometry args={[fw, fh, 0.06]} />
        <ClothMat kind="plaster" color={skin} roughness={0.82} repeat={1} />
      </mesh>

      <ChibiEye x={-fw * 0.26} y={fh * 0.06} z={0.13} eye={eye} radius={er} />
      <ChibiEye x={fw * 0.26} y={fh * 0.06} z={0.13} eye={eye} radius={er} />

      <mesh position={[0, -fh * 0.28, 0.12]}>
        <boxGeometry args={[0.04, 0.008, 0.01]} />
        <meshStandardMaterial color={darkenHex(skin, 0.12)} roughness={0.85} />
      </mesh>

      {/* Small traveler cap — cone only, no brim ring */}
      <mesh position={[0, fh * 0.52, -0.02]} castShadow>
        <coneGeometry args={[0.085, 0.11, 6]} />
        <ClothMat kind="cloth" color={cap} roughness={0.9} repeat={1} />
      </mesh>
    </group>
  );
}

function ChibiEye({
  x,
  y,
  z,
  eye,
  radius,
}: {
  x: number;
  y: number;
  z: number;
  eye: string;
  radius: number;
}) {
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[radius, 5, 4]} />
      <meshStandardMaterial color={eye} roughness={0.55} />
    </mesh>
  );
}

/** @deprecated Traveler kit uses hood + cap on {@link HumanoidHead}. */
export function HumanoidFarmerHat({
  hat,
  hatBand,
}: {
  hat: string;
  hatBand: string;
  brimRadius?: number;
  hatRoughness?: number;
  hatMetalness?: number;
  bandRoughness?: number;
  bandMetalness?: number;
}) {
  return (
    <group>
      <HumanoidHead skin="#f2d8a8" hair={hatBand} capColor={hat} />
    </group>
  );
}

/** Mitten hand — blocky stub. */
export function HumanoidHand({
  skin,
  side,
}: {
  skin: string;
  side: "left" | "right";
}) {
  const s = side === "left" ? -1 : 1;
  return (
    <mesh position={[s * 0.01, -0.02, 0.02]} castShadow>
      <kitBoxGeometry args={[0.07, 0.08, 0.06]} />
      <ClothMat kind="plaster" color={skin} roughness={0.78} repeat={1} />
    </mesh>
  );
}

/** Traveler boots — rounded stub, no separate toe cue. */
export function HumanoidBootToe({
  color,
  y = 0,
  z = 0.06,
}: {
  color: string;
  y?: number;
  z?: number;
}) {
  return (
    <mesh position={[0, y, z]} castShadow>
      <kitBoxGeometry args={[0.12, 0.08, 0.14]} />
      <ClothMat kind="leather" color={color} roughness={0.82} metalness={0.05} repeat={1} />
    </mesh>
  );
}

export function HumanoidVestFrontCue({
  color,
  emissive = "#000000",
  emissiveIntensity = 0,
}: {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh
      position={[
        0,
        HUMANOID_BODY.beltY + 0.16,
        HUMANOID_BODY.torsoLower[2] * 0.48,
      ]}
      castShadow
    >
      <kitBoxGeometry args={[0.06, 0.06, 0.02]} />
      <ClothMat
        kind="leather"
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity * 0.35}
        roughness={0.78}
        metalness={0.06}
        repeat={1}
      />
    </mesh>
  );
}

/** Cross-body satchel strap + pouch. */
export function HumanoidSatchel({
  leatherColor,
  pouchColor,
  side = "left",
}: {
  leatherColor: string;
  pouchColor: string;
  side?: "left" | "right";
}) {
  const sx = side === "left" ? -0.22 : 0.22;
  return (
    <group>
      <mesh
        position={[0.08, HUMANOID_BODY.shoulderY - 0.04, 0.06]}
        rotation={[0.12, 0, -0.42]}
        castShadow
      >
        <kitBoxGeometry args={[0.02, 0.36, 0.015]} />
        <ClothMat kind="leather" color={leatherColor} roughness={0.85} repeat={1} />
      </mesh>
      <mesh position={[sx, HUMANOID_BODY.beltY - 0.04, 0.1]} castShadow>
        <kitBoxGeometry args={[0.12, 0.1, 0.07]} />
        <ClothMat kind="leather" color={pouchColor} roughness={0.82} repeat={1} />
      </mesh>
    </group>
  );
}

/** @deprecated Use {@link HumanoidHead}. */
export function HumanoidFaceDetail({
  skin,
  hair = "#4a3428",
  eye = "#1a1814",
  y = 1.62,
  scale = 1,
}: {
  skin: string;
  hair?: string;
  eye?: string;
  y?: number;
  scale?: number;
}) {
  return (
    <group position={[0, y, 0]} scale={scale}>
      <HumanoidHead skin={skin} hair={hair} eye={eye} />
    </group>
  );
}

function darkenHex(hex: string, amount: number): string {
  return shiftHex(hex, -amount);
}

function shiftHex(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  if (!Number.isFinite(n)) return hex;
  const r = clampByte(((n >> 16) & 255) + amount * 255);
  const g = clampByte(((n >> 8) & 255) + amount * 255);
  const b = clampByte((n & 255) + amount * 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function clampByte(v: number): number {
  if (v < 0) return 0;
  if (v > 255) return 255;
  return Math.round(v);
}
