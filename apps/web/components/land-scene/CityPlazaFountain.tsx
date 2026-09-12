"use client";

import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import {
  plazaFountainKitMaterials,
  plazaFountainRipplePhase,
  plazaFountainRippleRadii,
  plazaFountainStreamAngles,
  plazaFountainVisualLayout,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  DoubleSide,
  LinearFilter,
  SRGBColorSpace,
} from "three";

interface FountainRippleAtlas {
  tex: CanvasTexture;
  ctx: CanvasRenderingContext2D;
  size: number;
}

/**
 * Paint expanding rings from the texture center. Never UV-offset — that
 * slides rings sideways on the pool.
 *
 * @param ctx - 2D canvas of the ripple atlas.
 * @param size - Atlas width/height in px.
 * @param phase - 0..1 ring growth phase.
 */
function paintFountainRipples(
  ctx: CanvasRenderingContext2D,
  size: number,
  phase: number,
): void {
  ctx.fillStyle = "#1e5870";
  ctx.fillRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.46;
  for (const u of plazaFountainRippleRadii(phase)) {
    const r = Math.max(2, u * maxR);
    const fade = 1 - u;
    ctx.strokeStyle = `rgba(186, 226, 236, ${0.12 + fade * 0.32})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Private centered ripple atlas — ClampToEdge, no river flow scroll.
 *
 * @returns Atlas + 2D context, or null without a DOM.
 */
function createFountainRippleAtlas(): FountainRippleAtlas | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  paintFountainRipples(ctx, size, 0);
  const tex = new CanvasTexture(canvas);
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  tex.repeat.set(1, 1);
  tex.offset.set(0, 0);
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return { tex, ctx, size };
}

/**
 * City plaza fountain — hollow stone basin, centered expanding ripples, stone nozzle.
 */
export function CityPlazaFountain() {
  const kit = plazaFountainKitMaterials();
  const layout = plazaFountainVisualLayout();
  const ripples = useMemo(() => createFountainRippleAtlas(), []);

  useEffect(() => {
    return () => {
      ripples?.tex.dispose();
    };
  }, [ripples]);

  useFrame(() => {
    if (!ripples) return;
    const phase = plazaFountainRipplePhase(
      performance.now(),
      layout.ripplePeriodMs,
    );
    paintFountainRipples(ripples.ctx, ripples.size, phase);
    ripples.tex.needsUpdate = true;
  });

  const streams = plazaFountainStreamAngles(layout.streamCount);
  const fall = layout.upperWaterY - layout.waterY;
  const nozzleY = layout.upperWaterY + layout.nozzleHeight * 0.5;
  const jetY = layout.upperWaterY + layout.nozzleHeight + layout.jetHeight * 0.45;

  return (
    <group userData={{ plazaFountain: true }}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, 0]}
        receiveShadow
      >
        <circleGeometry args={[layout.footingRadius, 20]} />
        <TexturedStandardMaterial
          kind="cobble"
          color={kit.footingColor}
          roughness={kit.footing.roughness}
          metalness={kit.footing.metalness}
          envMapIntensity={0}
          repeat={2}
        />
      </mesh>

      <mesh position={[0, layout.wallY, 0]} castShadow>
        <cylinderGeometry
          args={[
            layout.outerRadius,
            layout.outerRadius + 0.04,
            layout.wallHeight,
            14,
            1,
            true,
          ]}
        />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.basinColor}
          roughness={kit.basin.roughness}
          metalness={kit.basin.metalness}
          envMapIntensity={0}
          side={DoubleSide}
          repeat={2}
        />
      </mesh>

      <mesh position={[0, layout.wallY - 0.02, 0]}>
        <cylinderGeometry
          args={[
            layout.innerRadius,
            layout.innerRadius - 0.02,
            layout.wallHeight - 0.06,
            14,
            1,
            true,
          ]}
        />
        <TexturedStandardMaterial
          kind="stone"
          color="#6e6860"
          roughness={kit.basin.roughness}
          metalness={kit.basin.metalness}
          envMapIntensity={0}
          side={DoubleSide}
          repeat={2}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, layout.basinFloorY, 0]}
        receiveShadow
      >
        <circleGeometry args={[layout.innerRadius - 0.01, 16]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#5a5852"
          roughness={kit.basin.roughness}
          metalness={kit.basin.metalness}
          envMapIntensity={0}
          repeat={1.4}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, layout.rimY, 0]}
        receiveShadow
      >
        <ringGeometry
          args={[layout.innerRadius, layout.outerRadius + 0.02, 16]}
        />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.lipColor}
          roughness={kit.lip.roughness}
          metalness={kit.lip.metalness}
          envMapIntensity={0}
          repeat={1.6}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, layout.waterY, 0]}
      >
        <circleGeometry args={[layout.innerRadius - 0.04, 24]} />
        <meshStandardMaterial
          map={ripples?.tex}
          color={kit.waterColor}
          emissive={kit.waterEmissive}
          emissiveIntensity={layout.waterEmissiveIntensity}
          roughness={kit.water.roughness}
          metalness={0}
          transparent
          opacity={0.86}
          envMapIntensity={0.1}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, layout.pedestalY, 0]} castShadow>
        <cylinderGeometry
          args={[
            layout.pedestalRadius,
            layout.pedestalRadius + 0.05,
            layout.pedestalHeight,
            8,
          ]}
        />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.spoutColor}
          roughness={kit.spout.roughness}
          metalness={kit.spout.metalness}
          envMapIntensity={0}
          repeat={1.2}
        />
      </mesh>

      <mesh position={[0, layout.upperBowlY, 0]} castShadow>
        <cylinderGeometry
          args={[
            layout.upperBowlOuter,
            layout.upperBowlOuter + 0.02,
            0.14,
            10,
            1,
            true,
          ]}
        />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.lipColor}
          roughness={kit.lip.roughness}
          metalness={kit.lip.metalness}
          envMapIntensity={0}
          side={DoubleSide}
          repeat={1.2}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, layout.upperBowlY - 0.06, 0]}
      >
        <circleGeometry args={[layout.upperBowlInner + 0.02, 10]} />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.spoutColor}
          roughness={kit.spout.roughness}
          metalness={kit.spout.metalness}
          envMapIntensity={0}
          repeat={1}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, layout.upperBowlY + 0.07, 0]}
      >
        <ringGeometry
          args={[layout.upperBowlInner, layout.upperBowlOuter + 0.01, 12]}
        />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.lipColor}
          roughness={kit.lip.roughness}
          metalness={kit.lip.metalness}
          envMapIntensity={0}
          repeat={1}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, layout.upperWaterY, 0]}
      >
        <circleGeometry args={[layout.upperBowlInner - 0.02, 12]} />
        <meshStandardMaterial
          color={kit.waterColor}
          emissive={kit.waterEmissive}
          emissiveIntensity={layout.waterEmissiveIntensity}
          roughness={kit.water.roughness}
          metalness={0}
          transparent
          opacity={0.8}
          envMapIntensity={0.1}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, nozzleY, 0]} castShadow>
        <cylinderGeometry
          args={[
            layout.nozzleRadius * 0.7,
            layout.nozzleRadius,
            layout.nozzleHeight,
            8,
          ]}
        />
        <TexturedStandardMaterial
          kind="stone"
          color={kit.spoutColor}
          roughness={kit.spout.roughness}
          metalness={kit.spout.metalness}
          envMapIntensity={0}
          repeat={1}
        />
      </mesh>

      <mesh position={[0, jetY, 0]}>
        <cylinderGeometry
          args={[0.026, 0.012, layout.jetHeight, 7]}
        />
        <meshStandardMaterial
          color="#b7dce8"
          emissive={kit.waterEmissive}
          emissiveIntensity={0.08}
          roughness={kit.water.roughness}
          metalness={0}
          transparent
          opacity={0.38}
          depthWrite={false}
        />
      </mesh>

      {streams.map((yaw) => {
        const rim = layout.upperBowlOuter * 0.9;
        const x = Math.cos(yaw) * rim;
        const z = Math.sin(yaw) * rim;
        return (
          <mesh
            key={`fountain-stream-${yaw}`}
            position={[x, layout.waterY + fall * 0.48, z]}
          >
            <cylinderGeometry args={[0.01, 0.016, fall * 0.92, 5]} />
            <meshStandardMaterial
              color="#9fd0de"
              emissive={kit.waterEmissive}
              emissiveIntensity={0.04}
              roughness={kit.water.roughness}
              metalness={0}
              transparent
              opacity={0.32}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
