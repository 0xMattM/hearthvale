"use client";

import {
  defaultSurfaceRepeat,
  getProceduralSurfaceMaps,
  type SurfaceTextureKind,
} from "@/lib/procedural-textures";
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type { MeshStandardMaterial, Side } from "three";

interface TexturedStandardMaterialProps {
  /** Procedural grain family (stone, wood, cloth, …). */
  kind: SurfaceTextureKind;
  color?: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  depthWrite?: boolean;
  side?: Side;
  /** UV tile count, or `[u, v]` so long paths do not stretch grain. */
  repeat?: number | readonly [number, number];
  /** Override bump strength. */
  bumpScale?: number;
  /** Env reflection; defaults 0 on floors, 1 elsewhere. */
  envMapIntensity?: number;
  /**
   * Ground planes — matte Standard (full grain maps, envMapIntensity 0).
   */
  flatFloor?: boolean;
}

/**
 * Textured material. `flatFloor` uses matte Standard (grain maps, no env specular).
 */
export const TexturedStandardMaterial = forwardRef<
  MeshStandardMaterial,
  TexturedStandardMaterialProps
>(function TexturedStandardMaterial(
  {
    kind,
    color = "#ffffff",
    roughness: _catalogRoughness = 1,
    metalness = 0.05,
    emissive,
    emissiveIntensity,
    transparent,
    opacity,
    depthWrite,
    side,
    repeat,
    bumpScale,
    envMapIntensity,
    flatFloor = false,
  },
  ref,
) {
  const localRef = useRef<MeshStandardMaterial>(null);
  useImperativeHandle(ref, () => localRef.current as MeshStandardMaterial);

  const maps = useMemo(() => {
    const rep = repeat ?? defaultSurfaceRepeat(kind);
    return getProceduralSurfaceMaps(kind, rep);
  }, [kind, repeat]);

  useLayoutEffect(() => {
    return () => {
      const mat = localRef.current;
      if (!mat) return;
      mat.map = null;
      mat.roughnessMap = null;
      mat.bumpMap = null;
      mat.normalMap = null;
    };
  }, []);

  if (flatFloor) {
    // Reason: full procedural maps but zero env specular — matte floors without Lambert flatness.
    const nScale = maps.normalScale;
    return (
      <meshStandardMaterial
        ref={localRef}
        map={maps.map}
        roughnessMap={maps.roughnessMap}
        bumpMap={maps.bumpMap}
        bumpScale={bumpScale ?? maps.bumpScale}
        normalMap={maps.normalMap}
        normalScale={[nScale, nScale]}
        color={color}
        roughness={1}
        metalness={0}
        envMapIntensity={envMapIntensity ?? 0}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity ?? 0}
        transparent={transparent}
        opacity={opacity}
        depthWrite={depthWrite}
        side={side}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
    );
  }

  const nScale = maps.normalScale;
  return (
    <meshStandardMaterial
      ref={localRef}
      map={maps.map}
      roughnessMap={maps.roughnessMap}
      bumpMap={maps.bumpMap}
      bumpScale={bumpScale ?? maps.bumpScale}
      normalMap={maps.normalMap}
      normalScale={[nScale, nScale]}
      color={color}
      roughness={1}
      metalness={metalness}
      envMapIntensity={envMapIntensity ?? 1}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      transparent={transparent}
      opacity={opacity}
      depthWrite={depthWrite}
      side={side}
    />
  );
});
