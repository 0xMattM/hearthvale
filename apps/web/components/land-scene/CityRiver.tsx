"use client";

import {
  cityRiverBankUvRepeat,
  cityRiverFlowUvOffset,
  cityRiverFlowUvOffsetV,
  cityRiverFoamOpacity,
  cityRiverFoamUvOffset,
  cityRiverLayout,
  cityRiverWaveHeight,
  cityRiverWaveTaper,
} from "@game/shared";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { MeshStandardMaterial, PlaneGeometry } from "three";
import {
  CanvasTexture,
  LinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";

const BANK_ROCKS: ReadonlyArray<{
  x: number;
  z: number;
  r: number;
  h: number;
}> = [
  { x: -22, z: 24.15, r: 0.42, h: 0.38 },
  { x: -8.5, z: 24.35, r: 0.35, h: 0.3 },
  { x: 3.2, z: 24.1, r: 0.48, h: 0.4 },
  { x: 14.5, z: 24.3, r: 0.32, h: 0.28 },
  { x: 24.8, z: 24.05, r: 0.4, h: 0.34 },
];

/**
 * Soft caustic / meander map — not parallel boards (those read as wood).
 *
 * @returns Repeat-wrapped canvas texture, or null without a DOM.
 */
function createCityRiverFlowMap(): CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#16384c";
  ctx.fillRect(0, 0, size, size);

  const wrapBlob = (cx: number, cy: number, r: number, inner: string) => {
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const x = cx + ox;
        const y = cy + oy;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, inner);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  for (let i = 0; i < 36; i++) {
    const cx = ((i * 73) % size) + 8;
    const cy = ((i * 41 + 19) % size) + 6;
    const r = 10 + (i % 7) * 4;
    const lite = i % 2 === 0 ? "rgba(186, 226, 236, 0.3)" : "rgba(8, 36, 52, 0.28)";
    wrapBlob(cx, cy, r, lite);
  }

  for (let i = 0; i < 7; i++) {
    const y0 = ((i + 0.4) / 7) * size;
    ctx.strokeStyle =
      i % 2 === 0 ? "rgba(198, 232, 242, 0.2)" : "rgba(10, 38, 54, 0.24)";
    ctx.lineWidth = 2.2 + (i % 3);
    ctx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const t = (x / size) * Math.PI * 2;
      const y =
        y0 +
        Math.sin(t + i * 0.9) * 11 +
        Math.sin(t * 2 + i * 1.4) * 4.5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(236, 248, 252, 0.22)";
  for (let i = 0; i < 48; i++) {
    const x = (i * 47) % size;
    const y = (i * 29 + 11) % size;
    ctx.fillRect(x, y, 5 + (i % 5), 1.4);
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(2.6, 2.2);
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Shore-foam dashes that scroll along the current.
 *
 * @returns Alpha canvas texture, or null without a DOM.
 */
function createCityRiverFoamMap(): CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, size, size);
  for (let i = 0; i < 28; i++) {
    const x = (i * 43) % size;
    const y = 70 + ((i * 17) % 90);
    ctx.fillStyle = `rgba(255,255,255,${0.16 + (i % 5) * 0.07})`;
    ctx.fillRect(x, y, 10 + (i % 8), 1.6 + (i % 3) * 0.4);
  }
  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(6, 1);
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/**
 * City camera-near river — water + dirt bank along the +Z hub edge.
 * Walk clamp lives on `clampWalkOutOfCityRiver`; this mesh is visual only.
 * Current is a caustic map + vertex waves (no overlay cards).
 */
export function CityRiver() {
  const river = cityRiverLayout();
  const bankUv = cityRiverBankUvRepeat();
  const flowMap = useMemo(() => createCityRiverFlowMap(), []);
  const foamMap = useMemo(() => createCityRiverFoamMap(), []);
  const waterGeomRef = useRef<PlaneGeometry>(null);
  const foamMatRef = useRef<MeshStandardMaterial>(null);

  useEffect(() => {
    return () => {
      flowMap?.dispose();
      foamMap?.dispose();
    };
  }, [flowMap, foamMap]);

  useFrame(() => {
    const now = performance.now();
    if (flowMap) {
      flowMap.offset.x = cityRiverFlowUvOffset(now);
      flowMap.offset.y = cityRiverFlowUvOffsetV(now);
    }
    if (foamMap) {
      foamMap.offset.x = cityRiverFoamUvOffset(now);
    }
    if (foamMatRef.current) {
      foamMatRef.current.opacity = cityRiverFoamOpacity(now);
    }
    const geo = waterGeomRef.current;
    const pos = geo?.attributes.position;
    if (!geo || !pos || pos.count < 8) return;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, cityRiverWaveHeight(x, y, now) * cityRiverWaveTaper(y));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  const bankMaxZ = river.bankCenterZ + river.bankDepth / 2;
  const waterMinZ = river.centerZ - river.depth / 2;
  const foamZ = (bankMaxZ + waterMinZ) / 2;

  return (
    <group userData={{ cityRiver: true }}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[river.centerX, river.bankY, river.bankCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[river.bankWidth, river.bankDepth]} />
        <TexturedStandardMaterial
          kind="dirt"
          color={river.bankColor}
          flatFloor
          metalness={0}
          bumpScale={0.07}
          repeat={bankUv}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[river.centerX, river.bedY, river.centerZ]}
        receiveShadow
      >
        <planeGeometry args={[river.width, river.depth]} />
        <meshStandardMaterial color={river.bedColor} roughness={0.96} metalness={0} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[river.centerX, river.waterY, river.centerZ]}
        receiveShadow
      >
        <planeGeometry
          ref={waterGeomRef}
          args={[river.width, river.depth, river.waveSegsX, river.waveSegsZ]}
        />
        <meshStandardMaterial
          map={flowMap ?? undefined}
          color={river.waterColor}
          emissive={river.waterEmissive}
          emissiveIntensity={0.16}
          roughness={0.34}
          metalness={0.12}
          envMapIntensity={0.35}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[river.centerX, river.waterY + 0.012, foamZ]}
      >
        <planeGeometry args={[river.width - 2, 0.7]} />
        <meshStandardMaterial
          ref={foamMatRef}
          map={foamMap ?? undefined}
          color={river.foamColor}
          transparent
          opacity={river.foamOpacityMin}
          roughness={1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>
      {BANK_ROCKS.map((rock) => (
        <mesh
          key={`river-rock-${rock.x}-${rock.z}`}
          position={[rock.x, rock.h * 0.35, rock.z]}
          castShadow
        >
          <sphereGeometry args={[rock.r, 7, 6]} />
          <TexturedStandardMaterial
            kind="stone"
            color={river.rockColor}
            roughness={0.9}
            metalness={0.06}
            repeat={1}
          />
        </mesh>
      ))}
    </group>
  );
}
