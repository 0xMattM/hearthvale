"use client";

import { avatarGroundShadowMaterials, type HeldCombatWeaponKind } from "@game/shared";
import { useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { HeldCombatWeapon } from "@/components/land-scene/HeldCombatWeapon";
import {
  Box3,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type MeshPhongMaterial,
  type SkinnedMesh,
} from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { tintVillagerClothingMap } from "@/lib/tutor-clothing-map";
import { VillagerFbxLoader } from "@/lib/fbx-pack-loaders";
import type { VillagerAvatarVariant } from "@/lib/avatar-villager";
import {
  VILLAGER_AVATAR_SPECS,
  VILLAGER_AVATAR_YAW,
  villagerAvatarPreloadUrls,
  villagerAvatarUrl,
} from "@/lib/avatar-villager";
import {
  applyVillagerCombatOverlay,
  applyVillagerIdlePose,
  applyVillagerRestPose,
  applyVillagerWalkPose,
  collectVillagerBones,
  updateVillagerSkeletons,
  villagerHeldWeaponBone,
} from "@/lib/villager-rig";

interface GltfAvatarModelProps {
  variant: VillagerAvatarVariant;
  /** 0 idle … 1 full walk — drives procedural limb swing. */
  moveAmpRef?: RefObject<number>;
  combatSwingAtRef?: RefObject<number | null>;
  combatGuardRef?: RefObject<boolean>;
  /** Equipped combat weapon while a live fight is on. */
  combatWeaponKind?: HeldCombatWeaponKind | null;
  /** Profession cloak wash on cloned materials (tutors). */
  tintHex?: string;
}

function cloneAvatarScene(scene: Group): Group {
  let hasSkinned = false;
  scene.traverse((obj) => {
    if ((obj as SkinnedMesh).isSkinnedMesh) hasSkinned = true;
  });
  return hasSkinned ? (cloneSkinned(scene) as Group) : scene.clone(true);
}

/**
 * Keeps FBX texture map + flipY; only upgrades Phong → Standard for PBR lighting.
 * Tutors clone materials and recolor clothing texels (skin stays peach).
 */
function upgradeMeshMaterial(mesh: Mesh, tintHex?: string): void {
  const source = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];
  const next = source.map((mat) => {
    if (mat instanceof MeshStandardMaterial) {
      const std = tintHex ? mat.clone() : mat;
      if (std.map) {
        std.map.colorSpace = SRGBColorSpace;
        if (tintHex) std.map = tintVillagerClothingMap(std.map, tintHex);
      }
      if (tintHex) std.color.set(0xffffff);
      return std;
    }
    const phong = mat as MeshPhongMaterial;
    const map = phong.map;
    if (map) map.colorSpace = SRGBColorSpace;
    const std = new MeshStandardMaterial({
      map: tintHex && map ? tintVillagerClothingMap(map, tintHex) : map,
      color: 0xffffff,
      roughness: 0.86,
      metalness: 0.02,
    });
    return std;
  });
  mesh.material = next.length === 1 ? next[0] : next;
}

function prepareVillagerRoot(
  scene: Group,
  scale: number,
  yOffset: number,
  tintHex?: string,
): Group {
  const cloned = cloneAvatarScene(scene);
  cloned.scale.setScalar(scale);
  cloned.traverse((obj) => {
    if ((obj as Mesh).isMesh) {
      upgradeMeshMaterial(obj as Mesh, tintHex);
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  cloned.updateMatrixWorld(true);
  applyVillagerRestPose(cloned);
  const box = new Box3().setFromObject(cloned);
  cloned.position.y = yOffset - box.min.y;
  cloned.updateMatrixWorld(true);
  updateVillagerSkeletons(cloned);
  return cloned;
}

/**
 * Villager NPC FBX — original atlas + bind pose from the pack; procedural leg walk.
 */
export function GltfAvatarModel({
  variant,
  moveAmpRef,
  combatSwingAtRef,
  combatGuardRef,
  combatWeaponKind = null,
  tintHex,
}: GltfAvatarModelProps) {
  const url = villagerAvatarUrl(variant);
  const spec = VILLAGER_AVATAR_SPECS[variant];
  const fbxScene = useLoader(VillagerFbxLoader, url);
  const shadow = avatarGroundShadowMaterials();
  const bobRef = useRef<Group>(null);
  const phaseRef = useRef(0);

  const { root, bones } = useMemo(() => {
    const prepared = prepareVillagerRoot(
      fbxScene as Group,
      spec.scale,
      spec.yOffset,
      tintHex,
    );
    return { root: prepared, bones: collectVillagerBones(prepared) };
  }, [fbxScene, spec.scale, spec.yOffset, tintHex]);

  useFrame((state, dt) => {
    const amp = moveAmpRef?.current ?? 0;
    const bob = bobRef.current;
    if (bob) {
      const t = state.clock.elapsedTime;
      bob.position.y =
        Math.sin(t * 9) * 0.03 * amp + Math.sin(t * 2.4) * 0.01;
    }

    phaseRef.current += dt * (6 + amp * 4);
    if (amp > 0.08) {
      applyVillagerWalkPose(bones, phaseRef.current, amp);
    } else {
      applyVillagerIdlePose(bones);
    }
    const swingAt = combatSwingAtRef?.current;
    const swingT =
      swingAt != null ? Math.max(0, 1 - (performance.now() - swingAt) / 420) : 0;
    applyVillagerCombatOverlay(
      bones,
      swingT,
      Boolean(combatGuardRef?.current),
      Boolean(combatWeaponKind),
    );
    updateVillagerSkeletons(root);
  });

  return (
    <group rotation={[0, VILLAGER_AVATAR_YAW, 0]}>
      <group ref={bobRef}>
        <primitive object={root} />
        <HeldCombatWeapon
          kind={combatWeaponKind}
          parentBone={villagerHeldWeaponBone(bones)}
        />
      </group>
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

for (const preloadUrl of villagerAvatarPreloadUrls()) {
  useLoader.preload(VillagerFbxLoader, preloadUrl);
}
