"use client";

import { avatarGroundShadowMaterials } from "@game/shared";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  Color,
  LoopRepeat,
  MeshStandardMaterial,
  type Group,
  type Material,
  type Mesh,
  type Object3D,
} from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { KayKitAvatarVariant } from "@/lib/avatar-kaykit";
import {
  KAYKIT_AVATAR_CLIPS,
  KAYKIT_AVATAR_SPECS,
  KAYKIT_AVATAR_YAW,
  kaykitAvatarUrl,
  kaykitAvatarPreloadUrls,
} from "@/lib/avatar-kaykit";

interface KayKitAvatarModelProps {
  variant: KayKitAvatarVariant;
  /** Map / vest accent for a subtle local tint. */
  accent?: string;
  /** 0 idle … 1 full walk — updated by PlayerAvatar each frame. */
  moveAmpRef?: RefObject<number>;
}

/**
 * Applies a light palette tint so local vs remote peers read apart.
 */
function applyAvatarTint(
  root: Object3D,
  variant: KayKitAvatarVariant,
  accent: string,
): void {
  const tint = new Color(variant === "remote" ? "#8aa8b8" : accent);
  const amount = variant === "remote" ? 0.24 : 0.1;
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const source = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    const next = source.map((mat: Material) => {
      const cloned = mat.clone();
      if (cloned instanceof MeshStandardMaterial) {
        cloned.color = cloned.color.clone().lerp(tint, amount);
      }
      return cloned;
    });
    mesh.material = next.length === 1 ? next[0] : next;
  });
}

/**
 * KayKit Adventurers avatar — skeletal idle / walk (chessnoth-3d pipeline).
 */
export function KayKitAvatarModel({
  variant,
  accent = "#8b4e28",
  moveAmpRef,
}: KayKitAvatarModelProps) {
  const url = kaykitAvatarUrl(variant);
  const spec = KAYKIT_AVATAR_SPECS[variant];
  const { scene, animations } = useGLTF(url);
  const shadow = avatarGroundShadowMaterials();
  const walkingRef = useRef(false);

  const root = useMemo(() => {
    const cloned = cloneSkinned(scene) as Group;
    applyAvatarTint(cloned, variant, accent);
    cloned.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene, variant, accent]);

  const { actions } = useAnimations(animations, root);

  useFrame(() => {
    const amp = moveAmpRef?.current ?? 0;
    const walking = amp > 0.12;
    if (walkingRef.current === walking) return;
    walkingRef.current = walking;

    const idle = actions[KAYKIT_AVATAR_CLIPS.idle];
    const walk = actions[KAYKIT_AVATAR_CLIPS.walk];
    const next = walking ? walk ?? idle : idle;
    if (!next) return;

    for (const action of Object.values(actions)) {
      if (action && action !== next) action.fadeOut(0.15);
    }
    next.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.15).play();
  });

  useEffect(() => {
    const idle = actions[KAYKIT_AVATAR_CLIPS.idle];
    if (!idle) return;
    idle.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.1).play();
    return () => {
      idle.fadeOut(0.08);
    };
  }, [actions]);

  return (
    <group
      scale={spec.scale}
      position={[0, spec.yOffset, 0]}
      rotation={[0, KAYKIT_AVATAR_YAW, 0]}
    >
      <primitive object={root} />
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

for (const url of kaykitAvatarPreloadUrls()) {
  useGLTF.preload(url);
}
