"use client";

import { avatarGroundShadowMaterials } from "@game/shared";
import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo, type Ref } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { AVATAR_GLTF } from "@/lib/avatar-art";

/** Default hero palette hex — used to tint cloned GLTF materials. */
const HERO_HEX = {
  shirt: 0xe8b848,
  pants: 0x4a5c70,
  vest: 0x8b4e28,
  skin: 0xf2d0a8,
  face: 0xf8e8c8,
  boots: 0x4a3420,
  hat: 0xe8c858,
  hatBand: 0x6a4830,
} as const;

export interface AvatarGltfTint {
  shirt?: string;
  pants?: string;
  vest?: string;
  skin?: string;
  boots?: string;
  hat?: string;
  hatBand?: string;
  hideTool?: boolean;
}

interface AvatarGltfRigProps {
  showTool?: boolean;
  tint?: AvatarGltfTint;
  leftLegRef?: Ref<Group>;
  rightLegRef?: Ref<Group>;
  leftArmRef?: Ref<Group>;
  rightArmRef?: Ref<Group>;
  bodyRef?: Ref<Group>;
  torsoRef?: Ref<Group>;
}

/**
 * Rigged hero GLTF — named groups drive the same walk pose as the kit fallback.
 */
export function AvatarGltfRig({
  showTool = false,
  tint,
  leftLegRef,
  rightLegRef,
  leftArmRef,
  rightArmRef,
  bodyRef,
  torsoRef,
}: AvatarGltfRigProps) {
  const gltf = useGLTF(AVATAR_GLTF.url);
  const shadow = avatarGroundShadowMaterials();

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    applyAvatarGltfTint(clone, tint);
    const toolShaft = clone.getObjectByName("tool_shaft");
    const toolHead = clone.getObjectByName("tool_head");
    const toolVisible = showTool && !tint?.hideTool;
    if (toolShaft) toolShaft.visible = toolVisible;
    if (toolHead) toolHead.visible = toolVisible;
    clone.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf.scene, tint, showTool]);

  useLayoutEffect(() => {
    assignRef(leftLegRef, scene.getObjectByName("leg_l") as Group | null);
    assignRef(rightLegRef, scene.getObjectByName("leg_r") as Group | null);
    assignRef(leftArmRef, scene.getObjectByName("arm_l") as Group | null);
    assignRef(rightArmRef, scene.getObjectByName("arm_r") as Group | null);
    assignRef(bodyRef, scene.getObjectByName("body") as Group | null);
    assignRef(torsoRef, scene.getObjectByName("torso") as Group | null);
  }, [scene, leftLegRef, rightLegRef, leftArmRef, rightArmRef, bodyRef, torsoRef]);

  return (
    <group>
      <primitive object={scene} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, shadow.y, 0]}
        receiveShadow
      >
        <circleGeometry args={[shadow.radius, shadow.segments]} />
        <meshStandardMaterial
          color={shadow.color}
          transparent
          opacity={shadow.opacity}
          roughness={shadow.shadow.roughness}
          metalness={shadow.shadow.metalness}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function assignRef(ref: Ref<Group> | undefined, value: Group | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  (ref as { current: Group | null }).current = value;
}

function applyAvatarGltfTint(root: Group, tint?: AvatarGltfTint) {
  if (!tint) return;
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as MeshStandardMaterial;
    if (!mat?.color) return;

    const name = mesh.name;
    const hex = mat.color.getHex();

    if (tint.vest && (name === "vest" || name === "cape")) {
      mat.color.set(tint.vest);
      return;
    }
    if (tint.hatBand && name === "hair_back") {
      mat.color.set(tint.hatBand);
      return;
    }
    if (tint.skin && (name === "face" || hex === HERO_HEX.skin || hex === HERO_HEX.face)) {
      mat.color.set(tint.skin);
      return;
    }
    if (tint.shirt && hex === HERO_HEX.shirt) {
      mat.color.set(tint.shirt);
      return;
    }
    if (tint.pants && hex === HERO_HEX.pants) {
      mat.color.set(tint.pants);
      return;
    }
    if (tint.boots && hex === HERO_HEX.boots) {
      mat.color.set(tint.boots);
      return;
    }
    if (tint.hat && hex === HERO_HEX.hat) {
      mat.color.set(tint.hat);
      return;
    }
    if (tint.hatBand && hex === HERO_HEX.hatBand) {
      mat.color.set(tint.hatBand);
    }
  });
}

/** Preload hero avatar for GltfOrKit path. */
export function preloadAvatarGltf(): void {
  if (!AVATAR_GLTF.url.trim()) return;
  try {
    useGLTF.preload(AVATAR_GLTF.url);
  } catch {
    /* kit fallback */
  }
}

if (typeof window !== "undefined") {
  preloadAvatarGltf();
}
