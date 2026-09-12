"use client";

import { GltfErrorBoundary } from "@/components/land-scene/GltfOrKit";
import {
  NIKO_VILLAGE_MATERIAL_COLORS,
  NIKO_VILLAGE_URL,
  nikoVillageFitScale,
  nikoVillageModel,
  type NikoVillageFitBox,
  type NikoVillageKind,
} from "@/lib/niko-village";
import { useLoader } from "@react-three/fiber";
import { Suspense, useMemo, type ReactNode } from "react";
import {
  Box3,
  Color,
  Group,
  MeshStandardMaterial,
  Vector3,
  type Mesh,
  type MeshPhongMaterial,
  type Object3D,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const preparedScenes = new WeakSet<Object3D>();

/**
 * Upgrade Phong → Standard and stamp the village palette by material name.
 *
 * @param root - Loaded FBX scene (mutated once).
 */
function prepareNikoVillageCache(root: Object3D): void {
  if (preparedScenes.has(root)) return;
  preparedScenes.add(root);
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = source.map((mat) => {
      const name = (mat?.name ?? "").toLowerCase();
      const spec =
        NIKO_VILLAGE_MATERIAL_COLORS[mat?.name ?? ""] ??
        NIKO_VILLAGE_MATERIAL_COLORS[name];
      const out =
        mat instanceof MeshStandardMaterial
          ? mat
          : new MeshStandardMaterial({ color: 0xffffff, roughness: 0.86, metalness: 0.04 });
      if (spec) {
        out.color = new Color(spec.color);
        out.roughness = spec.roughness;
        out.metalness = 0.04;
        if (spec.emissive) {
          out.emissive = new Color(spec.emissive);
          out.emissiveIntensity = spec.emissiveIntensity ?? 0.2;
        }
      } else {
        const phong = mat as MeshPhongMaterial;
        if (phong.color) out.color = phong.color.clone();
      }
      if (mat?.name) out.name = mat.name;
      out.needsUpdate = true;
      return out;
    });
    mesh.material = next.length === 1 ? next[0]! : next;
  });
}

/**
 * World AABB from mesh geometry.
 *
 * @param root - House group.
 * @returns World-axis box.
 */
function nikoWorldBox(root: Object3D): Box3 {
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
 * Sit a cloned house on the ground scaled to fit a pad box.
 *
 * @param root - Wrapper holding the cloned mesh.
 * @param fit - Target width / depth / height.
 */
function fitNikoClone(root: Object3D, fit: NikoVillageFitBox): void {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  let box = nikoWorldBox(root);
  if (box.isEmpty()) return;
  const size = box.getSize(new Vector3());
  root.scale.setScalar(nikoVillageFitScale(size, fit));
  box = nikoWorldBox(root);
  if (box.isEmpty()) return;
  root.position.x -= (box.min.x + box.max.x) / 2;
  root.position.z -= (box.min.z + box.max.z) / 2;
  root.position.y -= box.min.y;
}

/**
 * One named house from the bundled FBX. Must render under Suspense.
 */
function NikoVillageScene({
  kind,
  fit,
}: {
  kind: NikoVillageKind;
  fit: NikoVillageFitBox;
}) {
  const spec = nikoVillageModel(kind);
  const scene = useLoader(FBXLoader, NIKO_VILLAGE_URL);
  const { width, depth, height } = fit;
  const house = useMemo(() => {
    prepareNikoVillageCache(scene);
    const hits: Mesh[] = [];
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const n = mesh.name.replace(/\./g, "");
      if (n === spec.mesh.replace(/\./g, "")) hits.push(mesh);
    });
    const wrap = new Group();
    const found = hits[0];
    if (!found) {
      throw new Error(`niko village mesh ${spec.mesh} missing`);
    }
    const clone = found.clone(true);
    clone.position.set(0, 0, 0);
    wrap.add(clone);
    fitNikoClone(wrap, { width, depth, height });
    return wrap;
  }, [scene, spec.mesh, width, depth, height]);

  return (
    <group rotation={[0, spec.yaw, 0]}>
      <primitive object={house} />
    </group>
  );
}

/**
 * Niko village house with kit fallback.
 */
export function NikoVillageProp({
  kind,
  fit,
  kit,
}: {
  kind: NikoVillageKind;
  fit: NikoVillageFitBox;
  kit: ReactNode;
}) {
  return (
    <GltfErrorBoundary fallback={kit}>
      <Suspense fallback={kit}>
        <NikoVillageScene kind={kind} fit={fit} />
      </Suspense>
    </GltfErrorBoundary>
  );
}

try {
  useLoader.preload(FBXLoader, NIKO_VILLAGE_URL);
} catch {
  /* kits still work */
}
