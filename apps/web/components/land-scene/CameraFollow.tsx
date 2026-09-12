"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import {
  CAMERA_FOLLOW_OFFSET_X,
  CAMERA_FOLLOW_OFFSET_Y,
  CAMERA_FOLLOW_OFFSET_Z,
} from "@/lib/camera-relative-walk";

interface CameraFollowProps {
  targetRef: RefObject<{ x: number; z: number }>;
  /** Live foe world XZ — camera frames the duel when set. */
  combatFoeRef?: RefObject<{ x: number; z: number } | null>;
}

/**
 * Third-person follow camera — reads a ref so movement never forces React re-renders.
 */
export function CameraFollow({ targetRef, combatFoeRef }: CameraFollowProps) {
  const { camera } = useThree();
  const smooth = useRef({ x: 0.5, z: 3.2, lookX: 0.5, lookZ: 3.2 });

  // Reason: update before foliage fade so canopies read this frame's camera.
  useFrame(() => {
    const target = targetRef.current;
    if (!target) return;
    const foe = combatFoeRef?.current ?? null;
    const lookX = foe ? target.x * 0.55 + foe.x * 0.45 : target.x;
    const lookZ = foe ? target.z * 0.55 + foe.z * 0.45 : target.z;
    const pull = foe ? 1.12 : 1;
    smooth.current.x += (target.x - smooth.current.x) * 0.1;
    smooth.current.z += (target.z - smooth.current.z) * 0.1;
    smooth.current.lookX += (lookX - smooth.current.lookX) * 0.12;
    smooth.current.lookZ += (lookZ - smooth.current.lookZ) * 0.12;
    const tx = smooth.current.x;
    const tz = smooth.current.z;
    camera.position.set(
      tx + CAMERA_FOLLOW_OFFSET_X * pull,
      CAMERA_FOLLOW_OFFSET_Y * (foe ? 1.06 : 1),
      tz + CAMERA_FOLLOW_OFFSET_Z * pull,
    );
    camera.lookAt(smooth.current.lookX, 0.55, smooth.current.lookZ);
  }, -1);

  return null;
}
