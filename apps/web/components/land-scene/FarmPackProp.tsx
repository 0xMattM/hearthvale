"use client";

import {
  GltfErrorBoundary,
  preloadHeroGltf,
} from "@/components/land-scene/GltfOrKit";
import {
  farmPackFitScale,
  farmPackModel,
  farmPackPreloadUrls,
  type FarmPackFitBox,
  type FarmPackKind,
} from "@/lib/farm-pack";
import { useGLTF } from "@react-three/drei";
import { Suspense, useMemo, type ReactNode } from "react";
import {
  Box3,
  Group,
  NearestFilter,
  Vector3,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
} from "three";

const preparedScenes = new WeakSet<Object3D>();

/**
 * Snap farm albedo maps and enable shadows.
 *
 * @param root - Cached glTF scene (mutated once).
 */
function prepareFarmPackGltf(root: Object3D): void {
  if (preparedScenes.has(root)) return;
  preparedScenes.add(root);
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const std = mat as MeshStandardMaterial;
      const map = std.map;
      if (!map) continue;
      map.magFilter = NearestFilter;
      map.minFilter = NearestFilter;
      map.generateMipmaps = false;
      map.needsUpdate = true;
    }
  });
}

/**
 * World AABB from mesh geometry.
 *
 * @param root - Building group.
 * @returns World-axis box.
 */
function farmWorldBox(root: Object3D): Box3 {
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
 * Sit a clone on the ground scaled to fit a pad box.
 *
 * @param root - Cloned glTF scene.
 * @param fit - Target width / depth / height.
 */
function fitFarmClone(root: Object3D, fit: FarmPackFitBox): void {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  let box = farmWorldBox(root);
  if (box.isEmpty()) return;
  const size = box.getSize(new Vector3());
  root.scale.setScalar(farmPackFitScale(size, fit));
  box = farmWorldBox(root);
  if (box.isEmpty()) return;
  root.position.x -= (box.min.x + box.max.x) / 2;
  root.position.z -= (box.min.z + box.max.z) / 2;
  root.position.y -= box.min.y;
}

/**
 * One farm building GLB. Must render under Suspense.
 */
function FarmPackScene({
  kind,
  fit,
}: {
  kind: FarmPackKind;
  fit: FarmPackFitBox;
}) {
  const spec = farmPackModel(kind);
  const gltf = useGLTF(spec.url);
  const { width, depth, height } = fit;
  const scene = useMemo(() => {
    prepareFarmPackGltf(gltf.scene);
    const clone = gltf.scene.clone(true) as Group;
    fitFarmClone(clone, { width, depth, height });
    return clone;
  }, [gltf.scene, width, depth, height]);

  return (
    <group rotation={[0, spec.yaw, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Farm-pack building with kit fallback.
 */
export function FarmPackProp({
  kind,
  fit,
  kit,
}: {
  kind: FarmPackKind;
  fit: FarmPackFitBox;
  kit: ReactNode;
}) {
  return (
    <GltfErrorBoundary fallback={kit}>
      <Suspense fallback={kit}>
        <FarmPackScene kind={kind} fit={fit} />
      </Suspense>
    </GltfErrorBoundary>
  );
}

for (const url of farmPackPreloadUrls()) {
  preloadHeroGltf(url);
}
