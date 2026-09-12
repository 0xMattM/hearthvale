"use client";

import { useGLTF } from "@react-three/drei";
import { Component, Suspense, useMemo, type ReactNode } from "react";
import type { HeroBuildingModel } from "@/lib/hero-buildings";

/** Minimal GLTF placement spec (buildings + avatar). */
export type GltfModelSpec = Pick<HeroBuildingModel, "url" | "scale" | "yOffset">;

interface GltfErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface GltfErrorBoundaryState {
  failed: boolean;
}

/**
 * Catches GLTF load/parse failures so kits remain the fallback (F14.1).
 */
export class GltfErrorBoundary extends Component<
  GltfErrorBoundaryProps,
  GltfErrorBoundaryState
> {
  state: GltfErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): GltfErrorBoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function GltfScene({ model }: { model: GltfModelSpec }) {
  const gltf = useGLTF(model.url);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  return (
    <primitive
      object={scene}
      scale={model.scale}
      position={[0, model.yOffset, 0]}
    />
  );
}

interface GltfOrKitProps {
  model: GltfModelSpec | null;
  kit: ReactNode;
  /** Optional custom GLTF scene (e.g. rigged avatar). Default: clone loaded scene. */
  gltfChild?: ReactNode;
}

/**
 * Loads a hero GLTF when configured; otherwise (or on error/loading) shows kit.
 */
export function GltfOrKit({ model, kit, gltfChild }: GltfOrKitProps) {
  if (!model) return <>{kit}</>;
  return (
    <GltfErrorBoundary fallback={kit}>
      <Suspense fallback={kit}>
        {gltfChild ?? <GltfScene model={model} />}
      </Suspense>
    </GltfErrorBoundary>
  );
}

/** Preload mill hero when the module is first imported client-side. */
export function preloadHeroGltf(url: string): void {
  if (!url.trim()) return;
  try {
    useGLTF.preload(url);
  } catch {
    /* ignore — kits still work */
  }
}
