"use client";

import {
  FOLIAGE_OCCLUSION,
  foliageCanopyWorld,
  foliageOcclusionOpacity,
  type FoliageCanopySphere,
} from "@game/shared";
import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject } from "react";
import type { Group, Material, Mesh } from "three";
import { usePlayerViewPos } from "@/components/land-scene/PlayerViewContext";

/**
 * Ghost canopy meshes tagged `userData.foliageCanopy` while they block the player.
 * Leaves the mesh visible — opacity only — so trunks stay readable for collision.
 *
 * @param groupRef - Tree group (world x/z on the group).
 * @param treeX - Trunk world X.
 * @param treeZ - Trunk world Z.
 * @param scale - Uniform kit scale.
 * @param canopy - Local canopy sphere before scale.
 */
export function useFoliageOcclusionFade(
  groupRef: RefObject<Group | null>,
  treeX: number,
  treeZ: number,
  scale: number,
  canopy: FoliageCanopySphere,
) {
  const playerPosRef = usePlayerViewPos();
  const { camera } = useThree();

  useFrame(() => {
    const player = playerPosRef?.current;
    const group = groupRef.current;
    if (!player || !group) return;

    const sphere = foliageCanopyWorld(treeX, treeZ, scale, canopy);
    const target = foliageOcclusionOpacity({
      canopyX: sphere.x,
      canopyY: sphere.y,
      canopyZ: sphere.z,
      canopyRadius: sphere.radius,
      playerX: player.x,
      playerY: 0.5,
      playerZ: player.z,
      camX: camera.position.x,
      camY: camera.position.y,
      camZ: camera.position.z,
    });

    group.traverse((obj) => {
      if (!obj.userData?.foliageCanopy) return;
      applyCanopyGhost(obj as Mesh, target);
    });
  });
}

/**
 * Fade a canopy mesh to ghost opacity without toggling `visible`.
 *
 * @param mesh - Tagged foliage mesh.
 * @param opacity - 1 opaque, or FOLIAGE_OCCLUSION.hiddenOpacity when blocking.
 */
function applyCanopyGhost(mesh: Mesh, opacity: number): void {
  mesh.visible = true;
  const ghost = opacity < FOLIAGE_OCCLUSION.opaqueOpacity - 1e-6;
  const mats: Material[] = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];
  for (const mat of mats) {
    if (!mat) continue;
    mat.transparent = ghost;
    mat.opacity = opacity;
    mat.depthWrite = !ghost;
    mat.needsUpdate = true;
  }
}
