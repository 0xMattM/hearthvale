"use client";

import { GltfErrorBoundary } from "@/components/land-scene/GltfOrKit";
import { WildAnimalFbxLoader } from "@/lib/fbx-pack-loaders";
import {
  wildAnimalFitScale,
  wildAnimalPreloadUrls,
  type WildAnimalModel,
} from "@/lib/wild-animals";
import {
  applyWildAnimalPose,
  collectWildAnimalBones,
  updateWildAnimalSkeletons,
  wildAnimalBodyPitch,
  wildAnimalGaitAmp,
  wildAnimalHopY,
} from "@/lib/wild-animal-rig";
import { useLoader, useFrame } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import {
  Box3,
  Color,
  Group,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type MeshPhongMaterial,
  type Object3D,
  type SkinnedMesh,
} from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

const LUNGE_EMISSIVE = new Color("#c45a48");
const IDLE_EMISSIVE = new Color("#000000");

/**
 * Clone FBX (skinned or static) so each den has its own materials.
 *
 * @param scene - Cached loader root.
 */
function cloneAnimalScene(scene: Group): Group {
  let hasSkinned = false;
  scene.traverse((obj) => {
    if ((obj as SkinnedMesh).isSkinnedMesh) hasSkinned = true;
  });
  return hasSkinned ? (cloneSkinned(scene) as Group) : scene.clone(true);
}

/**
 * Upgrade Phong → Standard and enable shadows on a clone.
 *
 * @param root - Cloned animal group.
 */
function prepareAnimalClone(root: Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = source.map((mat) => {
      if (mat instanceof MeshStandardMaterial) {
        const std = mat.clone();
        if (std.map) std.map.colorSpace = SRGBColorSpace;
        return std;
      }
      const phong = mat as MeshPhongMaterial;
      const map = phong.map;
      if (map) map.colorSpace = SRGBColorSpace;
      return new MeshStandardMaterial({
        map,
        color: 0xffffff,
        roughness: 0.82,
        metalness: 0.02,
      });
    });
    mesh.material = next.length === 1 ? next[0]! : next;
  });
}

/**
 * World AABB from mesh geometry.
 *
 * @param root - Animal group.
 */
function animalWorldBox(root: Object3D): Box3 {
  root.updateMatrixWorld(true);
  const box = new Box3();
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const local = mesh.geometry.boundingBox;
    if (!local || local.isEmpty()) return;
    box.union(local.clone().applyMatrix4(mesh.matrixWorld));
  });
  return box;
}

/**
 * Sit the clone on the grass and fit standing height.
 *
 * @param root - Cloned FBX.
 * @param targetHeight - Desired world height.
 */
function fitAnimalClone(root: Object3D, targetHeight: number): void {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  let box = animalWorldBox(root);
  if (box.isEmpty()) return;
  const size = box.getSize(new Vector3());
  root.scale.setScalar(wildAnimalFitScale(size.y, targetHeight));
  box = animalWorldBox(root);
  if (box.isEmpty()) return;
  root.position.x -= (box.min.x + box.max.x) / 2;
  root.position.z -= (box.min.z + box.max.z) / 2;
  root.position.y -= box.min.y;
}

/**
 * Telegraph a bite with a red emissive pulse (cloned materials only).
 *
 * @param root - Fitted animal clone.
 * @param lunging - Live combat lunge pose.
 */
function applyLungeTint(root: Object3D, lunging: boolean): void {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const std = mat as MeshStandardMaterial;
      if (!std.emissive) continue;
      std.emissive.copy(lunging ? LUNGE_EMISSIVE : IDLE_EMISSIVE);
      std.emissiveIntensity = lunging ? 0.55 : 0;
    }
  });
}

/**
 * One CraftPix hunt animal. Must render under Suspense.
 */
function WildAnimalScene({
  spec,
  lunging,
}: {
  spec: WildAnimalModel;
  lunging: boolean;
}) {
  const fbxScene = useLoader(WildAnimalFbxLoader, spec.url);
  const scene = useMemo(() => {
    const clone = cloneAnimalScene(fbxScene as Group);
    prepareAnimalClone(clone);
    fitAnimalClone(clone, spec.targetHeight);
    return clone;
  }, [fbxScene, spec.targetHeight]);
  const bones = useMemo(() => collectWildAnimalBones(scene), [scene]);
  const bobRef = useRef<Group>(null);
  const prev = useRef({ x: 0, z: 0, ready: false });
  const phaseRef = useRef(0);
  const ampRef = useRef(0);
  const world = useRef(new Vector3());

  useLayoutEffect(() => {
    applyLungeTint(scene, lunging);
  }, [scene, lunging]);

  useFrame((_, dt) => {
    const wrap = bobRef.current;
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
      wildAnimalGaitAmp(speed, spec.refSpeed),
      lunging ? 0.4 : 0,
    );
    const blend = 1 - Math.exp(-10 * Math.max(0, dt));
    ampRef.current += (target - ampRef.current) * blend;
    phaseRef.current +=
      dt * spec.gaitHz * Math.PI * 2 * (0.18 + ampRef.current * 1.05);
    applyWildAnimalPose(
      bones,
      spec.gait,
      phaseRef.current,
      ampRef.current,
      lunging ? 1 : 0,
    );
    updateWildAnimalSkeletons(scene);
    wrap.position.y = wildAnimalHopY(
      spec.gait,
      phaseRef.current,
      ampRef.current,
    );
    wrap.rotation.x = wildAnimalBodyPitch(
      spec.gait,
      phaseRef.current,
      ampRef.current,
    );
  });

  return (
    <group rotation={[0, spec.yaw, 0]}>
      <group ref={bobRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

/**
 * CraftPix animal with sphere-kit fallback.
 */
export function WildAnimalProp({
  spec,
  kit,
  lunging,
}: {
  spec: WildAnimalModel;
  kit: ReactNode;
  lunging: boolean;
}) {
  return (
    <GltfErrorBoundary fallback={kit}>
      <Suspense fallback={kit}>
        <WildAnimalScene spec={spec} lunging={lunging} />
      </Suspense>
    </GltfErrorBoundary>
  );
}

try {
  for (const url of wildAnimalPreloadUrls()) {
    useLoader.preload(WildAnimalFbxLoader, url);
  }
} catch {
  /* kits still work */
}
