"use client";

import {
  GltfErrorBoundary,
  preloadHeroGltf,
} from "@/components/land-scene/GltfOrKit";
import {
  japanVillageFenceTiles,
  japanVillagePreloadUrls,
  japanVillageProp,
  type JapanVillageModel,
} from "@/lib/japan-village";
import { useGLTF } from "@react-three/drei";
import { Suspense, useMemo, type ReactNode } from "react";
import {
  NearestFilter,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
} from "three";

const preparedScenes = new WeakSet<Object3D>();

/**
 * Snap the shared ColorAtlas to nearest-neighbor so palette cells do not bleed.
 *
 * @param root - Cached glTF scene (mutated once).
 */
function prepareJapanVillageGltf(root: Object3D): void {
  if (preparedScenes.has(root)) return;
  preparedScenes.add(root);
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
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
 * Tag canopy meshes and clone their materials so ghost opacity stays per tree.
 *
 * @param root - Cloned glTF subtree.
 */
function uniquifyFoliageMaterials(root: Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.userData.foliageCanopy = true;
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => m.clone());
    } else if (mesh.material) {
      mesh.material = mesh.material.clone();
    }
  });
}

/**
 * Cloned village mesh. Must render under Suspense.
 */
function VillageGltfScene({
  model,
  tagFoliage = false,
}: {
  model: JapanVillageModel;
  tagFoliage?: boolean;
}) {
  const gltf = useGLTF(model.url);
  const scene = useMemo(() => {
    prepareJapanVillageGltf(gltf.scene);
    const clone = gltf.scene.clone(true);
    if (tagFoliage) {
      uniquifyFoliageMaterials(clone);
    }
    return clone;
  }, [gltf.scene, tagFoliage]);

  return (
    <primitive
      object={scene}
      scale={model.scale}
      position={[0, model.yOffset, 0]}
      rotation={[0, model.yaw, 0]}
    />
  );
}

/**
 * Village GLTF with kit fallback (load error / missing file).
 */
export function VillageGltfProp({
  model,
  kit,
  tagFoliage = false,
}: {
  model: JapanVillageModel | null;
  kit: ReactNode;
  /** Tag cloned meshes so follow-cam foliage fade can ghost them. */
  tagFoliage?: boolean;
}) {
  if (!model?.url.trim()) return <>{kit}</>;
  return (
    <GltfErrorBoundary fallback={kit}>
      <Suspense fallback={kit}>
        <VillageGltfScene model={model} tagFoliage={tagFoliage} />
      </Suspense>
    </GltfErrorBoundary>
  );
}

/**
 * Tile Fence_Wood along local X to fill a kit rail length.
 */
export function VillageFenceRun({
  length,
  kit,
}: {
  length: number;
  kit: ReactNode;
}) {
  const model = japanVillageProp("fence");
  const tiles = japanVillageFenceTiles(length);
  if (!model.url.trim() || tiles.count === 0) return <>{kit}</>;
  return (
    <GltfErrorBoundary fallback={kit}>
      <Suspense fallback={kit}>
        {Array.from({ length: tiles.count }, (_, i) => {
          const x = -length / 2 + tiles.spacing / 2 + i * tiles.spacing;
          return (
            <group
              key={`jv-fence-${i}`}
              position={[x, 0, 0]}
              scale={[tiles.scaleX, 1, 1]}
            >
              <VillageGltfScene model={model} />
            </group>
          );
        })}
      </Suspense>
    </GltfErrorBoundary>
  );
}

for (const url of japanVillagePreloadUrls()) {
  preloadHeroGltf(url);
}
