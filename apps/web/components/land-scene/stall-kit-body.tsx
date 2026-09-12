"use client";

import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { getCityHallMaps } from "@/lib/city-hall-style";
import { VENDOR_STALL_KIT_SCALE } from "@/lib/vendor-kit-scale";
import { interactHighlightRingMaterials } from "@game/shared";
import { useMemo, type Ref } from "react";
import { DoubleSide, type MeshStandardMaterial } from "three";

const COUNTER_LEGS: Array<[number, number]> = [
  [-0.82, -0.38],
  [0.82, -0.38],
  [-0.82, 0.38],
  [0.82, 0.38],
];

const AWNING_POSTS: Array<[number, number]> = [
  [-0.9, -0.52],
  [0.9, -0.52],
  [-0.9, 0.52],
  [0.9, 0.52],
];

export interface StallKitBodyProps {
  highlighted: boolean;
  goods: "produce" | "listings";
  awningColor: string;
  stripeColor: string;
  goodsFreshColor: string;
  awning: { roughness: number; metalness: number };
  stripe: { roughness: number; metalness: number };
  post: { roughness: number; metalness: number };
  counter: { roughness: number; metalness: number };
  goodsCrate: { roughness: number; metalness: number };
  goodsFresh: { roughness: number; metalness: number };
  lanternColor: string;
  lanternEmissive: string;
  lanternIntensity: number;
  lanternMatRef: Ref<MeshStandardMaterial | null>;
  walkUpEmissive?: string;
  walkUpIntensity?: number;
}

/** Gold interact ring — same SoT as BuildingMesh HighlightRing. */
export function StallHighlightRing({ show }: { show: boolean }) {
  if (!show) return null;
  const ring = interactHighlightRingMaterials();
  return (
    <mesh position={[0, ring.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry
        args={[ring.innerRadius, ring.outerRadius, ring.segments]}
      />
      <meshBasicMaterial
        color={ring.color}
        transparent
        opacity={ring.opacity}
      />
    </mesh>
  );
}

/**
 * Shared peaked-canvas stall: oak table + cloth awning. Goods swap produce vs listings.
 */
export function StallKitBody({
  highlighted,
  goods,
  awningColor,
  stripeColor,
  goodsFreshColor,
  awning,
  stripe,
  post,
  counter,
  goodsCrate,
  goodsFresh,
  lanternColor,
  lanternEmissive,
  lanternIntensity,
  lanternMatRef,
  walkUpEmissive = "#000000",
  walkUpIntensity = 0,
}: StallKitBodyProps) {
  const wood = useMemo(() => getCityHallMaps("wood", 1, 2), []);
  const timberTint = highlighted ? "#fff4e4" : "#ffffff";

  return (
    <group scale={VENDOR_STALL_KIT_SCALE}>
      {AWNING_POSTS.map(([x, z]) => (
        <mesh key={`post-${x}-${z}`} position={[x, 1.12, z]} castShadow>
          <cylinderGeometry args={[0.055, 0.065, 2.05, 6]} />
          <meshStandardMaterial
            map={wood.map}
            bumpMap={wood.bumpMap}
            bumpScale={wood.bumpScale}
            color={timberTint}
            roughness={post.roughness}
            metalness={post.metalness}
          />
        </mesh>
      ))}
      {COUNTER_LEGS.map(([x, z]) => (
        <mesh key={`leg-${x}-${z}`} position={[x, 0.4, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.058, 0.8, 6]} />
          <meshStandardMaterial
            map={wood.map}
            bumpMap={wood.bumpMap}
            bumpScale={wood.bumpScale}
            color={timberTint}
            roughness={counter.roughness}
            metalness={counter.metalness}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.82, 0.04]} castShadow>
        <kitBoxGeometry args={[1.92, 0.07, 0.95]} />
        <meshStandardMaterial
          map={wood.map}
          bumpMap={wood.bumpMap}
          bumpScale={wood.bumpScale}
          color={timberTint}
          roughness={counter.roughness}
          metalness={counter.metalness}
        />
      </mesh>
      <mesh position={[0, 0.42, 0.04]} castShadow>
        <kitBoxGeometry args={[1.55, 0.04, 0.72]} />
        <meshStandardMaterial
          map={wood.map}
          bumpMap={wood.bumpMap}
          bumpScale={wood.bumpScale}
          color={timberTint}
          roughness={counter.roughness}
          metalness={counter.metalness}
        />
      </mesh>
      <mesh position={[0, 0.22, 0.48]} castShadow>
        <kitBoxGeometry args={[1.88, 0.1, 0.08]} />
        <meshStandardMaterial
          map={wood.map}
          bumpMap={wood.bumpMap}
          bumpScale={wood.bumpScale}
          color={timberTint}
          roughness={post.roughness}
          metalness={post.metalness}
        />
      </mesh>
      <mesh position={[-0.54, 1.98, 0]} rotation={[0.1, 0, 0.34]} castShadow>
        <kitBoxGeometry args={[1.22, 0.035, 1.52]} />
        <TexturedStandardMaterial
          kind="cloth"
          color={awningColor}
          roughness={awning.roughness}
          metalness={awning.metalness}
          side={DoubleSide}
          emissive={walkUpEmissive}
          emissiveIntensity={walkUpIntensity}
        />
      </mesh>
      <mesh position={[0.54, 1.98, 0]} rotation={[0.1, 0, -0.34]} castShadow>
        <kitBoxGeometry args={[1.22, 0.035, 1.52]} />
        <TexturedStandardMaterial
          kind="cloth"
          color={awningColor}
          roughness={awning.roughness}
          metalness={awning.metalness}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[-0.54, 2.0, 0]} rotation={[0.1, 0, 0.34]}>
        <kitBoxGeometry args={[0.22, 0.02, 1.48]} />
        <TexturedStandardMaterial
          kind="cloth"
          color={stripeColor}
          roughness={stripe.roughness}
          metalness={stripe.metalness}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0.54, 2.0, 0]} rotation={[0.1, 0, -0.34]}>
        <kitBoxGeometry args={[0.22, 0.02, 1.48]} />
        <TexturedStandardMaterial
          kind="cloth"
          color={stripeColor}
          roughness={stripe.roughness}
          metalness={stripe.metalness}
          side={DoubleSide}
        />
      </mesh>
      {([-0.55, 0, 0.55] as const).map((x) => (
        <mesh key={`valance-${x}`} position={[x, 1.62, 0.68]} castShadow>
          <kitBoxGeometry args={[0.42, 0.28, 0.04]} />
          <TexturedStandardMaterial
            kind="cloth"
            color={x === 0 ? stripeColor : awningColor}
            roughness={awning.roughness}
            metalness={awning.metalness}
            side={DoubleSide}
          />
        </mesh>
      ))}
      <mesh position={[0.92, 1.08, -0.52]} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 0.35, 6]} />
        <meshStandardMaterial
          map={wood.map}
          bumpMap={wood.bumpMap}
          bumpScale={wood.bumpScale}
          color={timberTint}
          roughness={post.roughness}
          metalness={post.metalness}
        />
      </mesh>
      <mesh position={[0.92, 1.32, -0.52]} castShadow>
        <sphereGeometry args={[0.11, 10, 10]} />
        <TexturedStandardMaterial
          kind="metal"
          ref={lanternMatRef}
          color={lanternColor}
          roughness={0.45}
          metalness={0.35}
          emissive={lanternEmissive}
          emissiveIntensity={lanternIntensity}
        />
      </mesh>
      <mesh position={[-0.48, 1.02, 0.06]} castShadow>
        <kitBoxGeometry args={[0.42, 0.32, 0.36]} />
        <meshStandardMaterial
          map={wood.map}
          bumpMap={wood.bumpMap}
          bumpScale={wood.bumpScale}
          color="#f2d8a8"
          roughness={goodsCrate.roughness}
          metalness={goodsCrate.metalness}
        />
      </mesh>
      {goods === "produce" ? (
        <>
          <mesh position={[-0.58, 1.3, 0.0]} castShadow>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#c44a32" roughness={0.55} metalness={0.04} />
          </mesh>
          <mesh position={[-0.4, 1.29, 0.1]} castShadow>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshStandardMaterial color="#d45a28" roughness={0.55} metalness={0.04} />
          </mesh>
          <mesh position={[-0.5, 1.28, 0.16]} castShadow>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#6a9a3a" roughness={0.62} metalness={0.03} />
          </mesh>
          <mesh position={[0.42, 0.98, 0.08]} castShadow>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshStandardMaterial
              color={goodsFreshColor}
              roughness={goodsFresh.roughness}
              metalness={goodsFresh.metalness}
            />
          </mesh>
          <mesh position={[0.58, 0.94, -0.08]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#c44a32" roughness={0.55} metalness={0.04} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-0.48, 1.24, 0.04]} castShadow>
            <kitBoxGeometry args={[0.28, 0.04, 0.22]} />
            <meshStandardMaterial
              color="#efe4c8"
              roughness={goodsFresh.roughness}
              metalness={goodsFresh.metalness}
            />
          </mesh>
          <mesh position={[-0.42, 1.29, 0.08]} castShadow>
            <kitBoxGeometry args={[0.24, 0.03, 0.18]} />
            <meshStandardMaterial
              color="#e4d4a8"
              roughness={goodsFresh.roughness}
              metalness={goodsFresh.metalness}
            />
          </mesh>
          <mesh position={[0.42, 1.0, 0.06]} castShadow>
            <kitBoxGeometry args={[0.38, 0.22, 0.08]} />
            <meshStandardMaterial
              color={goodsFreshColor}
              roughness={0.72}
              metalness={0.04}
            />
          </mesh>
          <mesh position={[0.42, 1.0, 0.1]} castShadow>
            <kitBoxGeometry args={[0.3, 0.14, 0.02]} />
            <meshStandardMaterial color="#efe8d4" roughness={0.85} metalness={0.02} />
          </mesh>
        </>
      )}
    </group>
  );
}
