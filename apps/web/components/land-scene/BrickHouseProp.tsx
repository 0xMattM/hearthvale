"use client";

import { GltfErrorBoundary } from "@/components/land-scene/GltfOrKit";
import {
  BRICK_HOUSE_COLORSCHEME_URL,
  brickHouseFitScale,
  brickHouseModel,
  brickHousePreloadUrls,
  type BrickHouseFitBox,
  type BrickHouseKind,
} from "@/lib/brick-houses";
import { useLoader } from "@react-three/fiber";
import { Suspense, useMemo, type ReactNode } from "react";
import {
  Box3,
  Color,
  MeshStandardMaterial,
  NearestFilter,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type Group,
  type Mesh,
  type MeshPhongMaterial,
  type Object3D,
  type Texture,
} from "three";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";

const preparedTextures = new WeakSet<Texture>();
const preparedScenes = new WeakSet<Object3D>();

/**
 * Snap the tiny colorscheme atlas so palette cells stay crisp.
 *
 * @param map - Shared house colorscheme.
 */
function prepareBrickColorscheme(map: Texture): void {
  if (preparedTextures.has(map)) return;
  preparedTextures.add(map);
  map.colorSpace = SRGBColorSpace;
  map.magFilter = NearestFilter;
  map.minFilter = NearestFilter;
  map.generateMipmaps = false;
  map.needsUpdate = true;
}

/**
 * Upgrade Phong (Collada default) and stamp the colorscheme onto walls.
 *
 * @param mesh - House mesh.
 * @param map - Houses colorscheme texture.
 */
function applyBrickHouseMaterial(mesh: Mesh, map: Texture): void {
  const source = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];
  const next = source.map((mat) => {
    const name = `${mat.name ?? ""} ${mesh.name ?? ""}`.toLowerCase();
    const isWindow = name.includes("window");
    const out =
      mat instanceof MeshStandardMaterial
        ? mat
        : new MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.86,
            metalness: 0.04,
          });
    if (isWindow) {
      out.map = null;
      out.color = new Color("#d8c890");
      out.emissive = new Color("#e8d080");
      out.emissiveIntensity = 0.22;
      out.roughness = 0.35;
    } else {
      out.map = map;
      out.color = new Color("#ffffff");
      out.roughness = 0.86;
      out.metalness = 0.04;
      const phong = mat as MeshPhongMaterial;
      if (phong.name) out.name = phong.name;
    }
    out.needsUpdate = true;
    return out;
  });
  mesh.material = next.length === 1 ? next[0]! : next;
}

/**
 * Stamp colorscheme + shadows on the cached Collada scene once.
 *
 * @param root - Loader scene (mutated once).
 * @param map - Houses colorscheme texture.
 */
function prepareBrickHouseCache(root: Object3D, map: Texture): void {
  if (preparedScenes.has(root)) return;
  preparedScenes.add(root);
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    applyBrickHouseMaterial(mesh, map);
  });
}

/**
 * World AABB from mesh geometry (skips empty Collada locator nodes).
 *
 * @param root - House group.
 * @returns World-axis box.
 */
function brickHouseWorldBox(root: Object3D): Box3 {
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
 * Sit a clone on the ground scaled to fit a pad box (uniform, min axis).
 *
 * @param root - Cloned Collada scene.
 * @param fit - Target width / depth / height in world units.
 */
function fitBrickHouseClone(root: Object3D, fit: BrickHouseFitBox): void {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  let box = brickHouseWorldBox(root);
  if (box.isEmpty()) {
    root.scale.setScalar(0.28);
    box = brickHouseWorldBox(root);
    if (box.isEmpty()) return;
  } else {
    const size = box.getSize(new Vector3());
    root.scale.setScalar(brickHouseFitScale(size, fit));
    box = brickHouseWorldBox(root);
  }
  if (!box.isEmpty() && box.max.y - box.min.y > fit.height) {
    root.scale.multiplyScalar(fit.height / Math.max(box.max.y - box.min.y, 0.001));
    box = brickHouseWorldBox(root);
  }
  if (box.isEmpty()) return;
  root.position.x -= (box.min.x + box.max.x) / 2;
  root.position.z -= (box.min.z + box.max.z) / 2;
  root.position.y -= box.min.y;
}

/**
 * Cloned brick house. Must render under Suspense.
 */
function BrickHouseScene({
  kind,
  fit,
}: {
  kind: BrickHouseKind;
  fit: BrickHouseFitBox;
}) {
  const spec = brickHouseModel(kind);
  const collada = useLoader(ColladaLoader, spec.url);
  const map = useLoader(TextureLoader, BRICK_HOUSE_COLORSCHEME_URL);
  const { width, depth, height } = fit;
  const scene = useMemo(() => {
    prepareBrickColorscheme(map);
    prepareBrickHouseCache(collada.scene, map);
    const clone = collada.scene.clone(true) as Group;
    fitBrickHouseClone(clone, { width, depth, height });
    return clone;
  }, [collada.scene, map, width, depth, height]);

  return (
    <group rotation={[0, spec.yaw, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Brick house DAE with kit fallback.
 */
export function BrickHouseProp({
  kind,
  fit,
  kit,
}: {
  kind: BrickHouseKind;
  /** Uniform fit box so the house stays on the civic pad. */
  fit: BrickHouseFitBox;
  kit: ReactNode;
}) {
  return (
    <GltfErrorBoundary fallback={kit}>
      <Suspense fallback={kit}>
        <BrickHouseScene kind={kind} fit={fit} />
      </Suspense>
    </GltfErrorBoundary>
  );
}

for (const url of brickHousePreloadUrls()) {
  try {
    if (url.endsWith(".dae")) useLoader.preload(ColladaLoader, url);
    else useLoader.preload(TextureLoader, url);
  } catch {
    /* kits still work */
  }
}
