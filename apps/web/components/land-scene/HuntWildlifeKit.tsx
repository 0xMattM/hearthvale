"use client";

import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import {
  huntKitPose,
  wildAnimalGaitAmp,
  type WildAnimalGait,
} from "@/lib/wild-animal-rig";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { Vector3 } from "three";

interface HuntWildlifeKitProps {
  isBoar: boolean;
  fur: string;
  hornColor: string;
  eye: string;
  lunging: boolean;
}

/**
 * Plaster fur fill matching farmer kits.
 *
 * @param props - Hide color and roughness.
 */
function Fur({
  color,
  roughness = 0.78,
}: {
  color: string;
  roughness?: number;
}) {
  return (
    <TexturedStandardMaterial
      kind="plaster"
      color={color}
      roughness={roughness}
      metalness={0}
    />
  );
}

/**
 * Stylized hare / boar — farmer-kit language with hopping / trotting parts.
 *
 * @param props - Palette, boar flag, and lunge telegraph.
 */
export function HuntWildlifeKit({
  isBoar,
  fur,
  hornColor,
  eye,
  lunging,
}: HuntWildlifeKitProps) {
  const gait: WildAnimalGait = isBoar ? "trot" : "hop";
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const frontL = useRef<Group>(null);
  const frontR = useRef<Group>(null);
  const hindL = useRef<Group>(null);
  const hindR = useRef<Group>(null);
  const earL = useRef<Group>(null);
  const earR = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const prev = useRef({ x: 0, z: 0, ready: false });
  const phaseRef = useRef(0);
  const ampRef = useRef(0);
  const world = useRef(new Vector3());
  const belly = isBoar ? "#6a4038" : "#ead8b4";
  const refSpeed = isBoar ? 1.1 : 1.35;
  const gaitHz = isBoar ? 1.9 : 2.45;

  useFrame((_, dt) => {
    const wrap = root.current;
    if (!wrap) return;
    wrap.getWorldPosition(world.current);
    const x = world.current.x;
    const z = world.current.z;
    let speed = 0;
    if (prev.current.ready) {
      speed =
        Math.hypot(x - prev.current.x, z - prev.current.z) /
        Math.max(dt, 1e-4);
    }
    prev.current = { x, z, ready: true };
    const target = Math.max(
      wildAnimalGaitAmp(speed, refSpeed),
      lunging ? 0.55 : 0,
    );
    const blend = 1 - Math.exp(-12 * Math.max(0, dt));
    ampRef.current += (target - ampRef.current) * blend;
    phaseRef.current +=
      dt * gaitHz * Math.PI * 2 * (0.22 + ampRef.current * 1.15);
    const pose = huntKitPose(
      gait,
      phaseRef.current,
      ampRef.current,
      lunging ? 1 : 0,
    );
    wrap.position.y = pose.hopY;
    wrap.rotation.x = pose.pitch;
    if (body.current) {
      body.current.scale.set(pose.bodyScaleXZ, pose.bodyScaleY, pose.bodyScaleXZ);
    }
    if (frontL.current) frontL.current.rotation.x = pose.frontL;
    if (frontR.current) frontR.current.rotation.x = pose.frontR;
    if (hindL.current) hindL.current.rotation.x = pose.hindL;
    if (hindR.current) hindR.current.rotation.x = pose.hindR;
    if (earL.current) earL.current.rotation.z = 0.22 + pose.earFlop;
    if (earR.current) earR.current.rotation.z = -0.22 - pose.earFlop;
    if (tail.current) tail.current.rotation.z = pose.tail;
  });

  const hipY = isBoar ? 0.2 : 0.16;
  const legLen = isBoar ? 0.22 : 0.17;
  const legR = isBoar ? 0.05 : 0.038;

  return (
    <group ref={root} position={[0, hipY + 0.02, 0]}>
      <group ref={body}>
        <mesh
          scale={isBoar ? [1.55, 1.02, 1.05] : [1.15, 0.92, 0.82]}
          position={[isBoar ? -0.02 : 0.02, 0.08, 0]}
          castShadow
        >
          <sphereGeometry args={[0.26, 12, 12]} />
          <Fur color={fur} />
        </mesh>
        <mesh
          scale={isBoar ? [0.7, 0.45, 0.7] : [0.62, 0.42, 0.58]}
          position={[isBoar ? 0.06 : 0.04, 0.02, 0]}
          castShadow
        >
          <sphereGeometry args={[0.22, 10, 10]} />
          <Fur color={belly} roughness={0.82} />
        </mesh>
        <mesh
          position={isBoar ? [0.32, 0.1, 0] : [0.24, 0.16, 0]}
          scale={isBoar ? [1.05, 0.78, 0.78] : [0.92, 0.88, 0.88]}
          castShadow
        >
          <sphereGeometry args={[0.15, 11, 11]} />
          <Fur color={fur} roughness={0.74} />
        </mesh>
        {isBoar ? (
          <>
            <mesh position={[0.48, 0.06, 0]} scale={[0.85, 0.5, 0.55]} castShadow>
              <sphereGeometry args={[0.11, 8, 8]} />
              <Fur color={fur} roughness={0.7} />
            </mesh>
            <mesh position={[0.58, 0.07, 0.08]} rotation={[0, 0.18, -0.9]} castShadow>
              <coneGeometry args={[0.028, 0.14, 5]} />
              <Fur color={hornColor} roughness={0.32} />
            </mesh>
            <mesh position={[0.58, 0.07, -0.08]} rotation={[0, -0.18, -0.9]} castShadow>
              <coneGeometry args={[0.028, 0.14, 5]} />
              <Fur color={hornColor} roughness={0.32} />
            </mesh>
            <mesh position={[-0.06, 0.28, 0]} scale={[1.2, 0.32, 0.22]}>
              <boxGeometry args={[0.26, 0.1, 0.08]} />
              <Fur color="#3a2820" roughness={0.88} />
            </mesh>
          </>
        ) : (
          <>
            <group ref={earL} position={[0.16, 0.3, 0.06]}>
              <mesh rotation={[0.08, 0.12, 0]} castShadow>
                <coneGeometry args={[0.045, 0.32, 6]} />
                <Fur color={fur} roughness={0.76} />
              </mesh>
              <mesh position={[0, 0.02, 0]} rotation={[0.08, 0.12, 0]} scale={[0.55, 0.72, 0.4]}>
                <coneGeometry args={[0.04, 0.28, 5]} />
                <Fur color="#f0c8c0" roughness={0.7} />
              </mesh>
            </group>
            <group ref={earR} position={[0.16, 0.3, -0.06]}>
              <mesh rotation={[0.08, -0.12, 0]} castShadow>
                <coneGeometry args={[0.045, 0.32, 6]} />
                <Fur color={fur} roughness={0.76} />
              </mesh>
              <mesh position={[0, 0.02, 0]} rotation={[0.08, -0.12, 0]} scale={[0.55, 0.72, 0.4]}>
                <coneGeometry args={[0.04, 0.28, 5]} />
                <Fur color="#f0c8c0" roughness={0.7} />
              </mesh>
            </group>
            <group ref={tail} position={[-0.28, 0.08, 0]}>
              <mesh scale={[1, 1, 1]} castShadow>
                <sphereGeometry args={[0.075, 8, 8]} />
                <Fur color="#f2e6d0" roughness={0.86} />
              </mesh>
            </group>
            <mesh position={[0.36, 0.14, 0]}>
              <sphereGeometry args={[0.028, 6, 6]} />
              <Fur color="#c47870" roughness={0.55} />
            </mesh>
          </>
        )}
        <mesh position={[isBoar ? 0.4 : 0.3, isBoar ? 0.14 : 0.2, 0.07]}>
          <sphereGeometry args={[0.038, 7, 7]} />
          <meshBasicMaterial color="#f4eee4" />
        </mesh>
        <mesh position={[isBoar ? 0.4 : 0.3, isBoar ? 0.14 : 0.2, -0.07]}>
          <sphereGeometry args={[0.038, 7, 7]} />
          <meshBasicMaterial color="#f4eee4" />
        </mesh>
        <mesh position={[isBoar ? 0.43 : 0.33, isBoar ? 0.145 : 0.205, 0.072]}>
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshBasicMaterial color={eye} />
        </mesh>
        <mesh position={[isBoar ? 0.43 : 0.33, isBoar ? 0.145 : 0.205, -0.072]}>
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshBasicMaterial color={eye} />
        </mesh>
      </group>
      {(
        [
          [frontL, 0.14, 0.1],
          [frontR, 0.14, -0.1],
          [hindL, -0.14, 0.1],
          [hindR, -0.14, -0.1],
        ] as const
      ).map(([ref, x, z]) => (
        <group key={`${x}:${z}`} ref={ref} position={[x, 0, z]}>
          <mesh position={[0, -legLen / 2, 0]} castShadow>
            <cylinderGeometry args={[legR, legR * 0.82, legLen, 6]} />
            <Fur color={fur} roughness={0.82} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
