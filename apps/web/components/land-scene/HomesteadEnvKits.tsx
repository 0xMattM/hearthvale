"use client";

import {
  FOLIAGE_CANOPY,
  HOMESTEAD_YARD,
  PLAYER_LAND_GATE,
  homesteadFenceMaterials,
  homesteadShedMaterials,
  homesteadTreeMaterials,
  homesteadYardFloorColors,
  homesteadYardLayout,
  playerLandFrontFenceRailSegments,
  type HomesteadYardAtmosphereMode,
  type HomesteadYardPresence,
} from "@game/shared";
import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { useFoliageOcclusionFade } from "@/components/land-scene/useFoliageOcclusionFade";
import { VillageFenceRun, VillageGltfProp } from "@/components/land-scene/VillageGltfProp";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { japanVillageProp } from "@/lib/japan-village";
import { useRef, type ReactNode, type Ref } from "react";
import type { Group, MeshStandardMaterial } from "three";

/**
 * Homestead corner tree kit (VA1.3) — atmosphere only, not gather stumps.
 */
export function HomesteadYardTree({ at }: { at: [number, number] }) {
  const [x, z] = at;
  const mat = homesteadTreeMaterials();
  const groupRef = useRef<Group>(null);
  useFoliageOcclusionFade(groupRef, x, z, 1, FOLIAGE_CANOPY.homestead);
  return (
    <group ref={groupRef} position={[x, 0, z]}>
      <VillageGltfProp
        model={japanVillageProp("tree")}
        tagFoliage
        kit={<HomesteadYardTreeKit mat={mat} />}
      />
    </group>
  );
}

function HomesteadYardTreeKit({
  mat,
}: {
  mat: ReturnType<typeof homesteadTreeMaterials>;
}) {
  return (
    <>
      {[
        [0.28, 0.06, 0.22, 0.12],
        [-0.26, 0.05, -0.18, 0.11],
        [0.04, 0.05, -0.3, 0.1],
      ].map(([rx, ry, rz, r], i) => (
        <mesh key={`root-${i}`} position={[rx!, ry!, rz!]} castShadow>
          <cylinderGeometry args={[r! * 0.55, r!, 0.12, 6]} />
          <TexturedStandardMaterial
            kind="bark"
            color={mat.rootColor}
            roughness={mat.trunk.roughness}
            metalness={mat.trunk.metalness}
            repeat={1}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 1.4, 6]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.trunkColor}
          roughness={mat.trunk.roughness}
          metalness={mat.trunk.metalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.12, 8]} />
        <TexturedStandardMaterial
          kind="bark"
          color={mat.barkBandColor}
          roughness={mat.barkBand.roughness}
          metalness={mat.barkBand.metalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow userData={{ foliageCanopy: true }}>
        <sphereGeometry args={[0.95, 10, 10]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.canopyColor}
          roughness={mat.canopy.roughness}
          metalness={mat.canopy.metalness}
          repeat={2}
        />
      </mesh>
      <mesh position={[0.35, 2.1, -0.2]} castShadow userData={{ foliageCanopy: true }}>
        <sphereGeometry args={[0.55, 8, 8]} />
        <TexturedStandardMaterial
          kind="grass"
          color={mat.canopyLitColor}
          roughness={mat.canopyLit.roughness}
          metalness={mat.canopyLit.metalness}
          repeat={2}
        />
      </mesh>
    </>
  );
}

/**
 * Tiled village fence along a homestead rail run; kit rails are the fallback.
 */
export function HomesteadFenceRun({
  x,
  z,
  rotY,
  length,
  railColor,
  midRailColor,
}: {
  x: number;
  z: number;
  rotY: number;
  length: number;
  railColor: string;
  midRailColor: string;
}) {
  const fenceMat = homesteadFenceMaterials();
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <VillageFenceRun
        length={length}
        kit={
          <>
            <mesh position={[0, 0.7, 0]} castShadow>
              <kitBoxGeometry args={[length, 0.1, 0.08]} />
              <TexturedStandardMaterial
                kind="wood"
                color={railColor}
                roughness={fenceMat.rail.roughness}
                metalness={fenceMat.rail.metalness}
              />
            </mesh>
            <mesh position={[0, 0.42, 0]} castShadow>
              <kitBoxGeometry args={[length, 0.06, 0.06]} />
              <TexturedStandardMaterial
                kind="wood"
                color={midRailColor}
                roughness={fenceMat.rail.roughness}
                metalness={fenceMat.rail.metalness}
              />
            </mesh>
          </>
        }
      />
    </group>
  );
}

/**
 * Homestead storage shed shell (VA1.3) — sill / planks / eaves / door.
 * Chimney + visit nameplate remain callers' children.
 * PL181.2: optional quiet warm sill footing emissive while lived at home.
 */
export function HomesteadYardShed({
  children,
  footingEmissive = "#000000",
  footingEmissiveIntensity = 0,
  footingMatRef,
}: {
  children?: ReactNode;
  /** PL181.2 — warm shed landmark emissive hex (or black when quiet). */
  footingEmissive?: string;
  /** PL181.2 — sill footing emissive intensity. */
  footingEmissiveIntensity?: number;
  /** PL181.2 — sill material ref for pulse updates. */
  footingMatRef?: Ref<MeshStandardMaterial | null>;
}) {
  const shedMat = homesteadShedMaterials();
  return (
    <group position={[-4.5, 0, 3.5]}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <kitBoxGeometry args={[2.35, 0.12, 1.95]} />
        <TexturedStandardMaterial
          ref={footingMatRef}
          kind="stone"
          color={shedMat.sillColor}
          roughness={shedMat.sill.roughness}
          metalness={shedMat.sill.metalness}
          emissive={footingEmissive}
          emissiveIntensity={footingEmissiveIntensity}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <kitBoxGeometry args={[2.2, 1.4, 1.8]} />
        <TexturedStandardMaterial
          kind="wood"
          color={shedMat.bodyColor}
          roughness={shedMat.body.roughness}
          metalness={shedMat.body.metalness}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 0.45, 0.92]}>
        <kitBoxGeometry args={[2.15, 0.06, 0.04]} />
        <TexturedStandardMaterial
          kind="wood"
          color={shedMat.plankColor}
          roughness={shedMat.body.roughness}
          metalness={shedMat.body.metalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 0.95, 0.92]}>
        <kitBoxGeometry args={[2.15, 0.06, 0.04]} />
        <TexturedStandardMaterial
          kind="wood"
          color={shedMat.plankColor}
          roughness={shedMat.body.roughness}
          metalness={shedMat.body.metalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.7, 0.9, 4]} />
        <TexturedStandardMaterial
          kind="thatch"
          color={shedMat.roofColor}
          roughness={shedMat.roof.roughness}
          metalness={shedMat.roof.metalness}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 1.38, 0.55]}>
        <kitBoxGeometry args={[1.9, 0.08, 0.12]} />
        <TexturedStandardMaterial
          kind="wood"
          color={shedMat.eaveColor}
          roughness={shedMat.roof.roughness}
          metalness={shedMat.roof.metalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 0.55, 0.95]}>
        <kitBoxGeometry args={[0.55, 0.9, 0.08]} />
        <TexturedStandardMaterial
          kind="wood"
          color={shedMat.doorColor}
          roughness={shedMat.door.roughness}
          metalness={shedMat.door.metalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0.18, 0.55, 1.0]}>
        <kitBoxGeometry args={[0.06, 0.08, 0.04]} />
        <TexturedStandardMaterial
          kind="metal"
          color={shedMat.sillColor}
          roughness={shedMat.sill.roughness}
          metalness={0.35}
          repeat={1}
        />
      </mesh>
      {children}
    </group>
  );
}

/**
 * Camera-near fence gap + rustic swinging gate (tranquera).
 * Walk-up E opens Travel. Rails split so the opening reads as the yard exit.
 */
export function HomesteadYardGate({
  atmosphereMode = "empty",
  presence = "home",
  highlighted = false,
  yardHalf = HOMESTEAD_YARD.starterHalf,
}: {
  atmosphereMode?: HomesteadYardAtmosphereMode;
  presence?: HomesteadYardPresence;
  highlighted?: boolean;
  yardHalf?: number;
}) {
  const floors = homesteadYardFloorColors(atmosphereMode, presence);
  const fenceMat = homesteadFenceMaterials();
  const { worldX, postOffsetX } = PLAYER_LAND_GATE;
  const gateZ = homesteadYardLayout(yardHalf).gateZ;
  const postEmissive = highlighted ? "#c4a35a" : "#3a2818";
  const postEmissiveIntensity = highlighted ? 0.35 : 0.04;
  const leafWidth = postOffsetX * 2 - 0.38;
  const gateColor = "#3d2a1c";
  const plankColor = "#4a3222";

  return (
    <group position={[worldX, 0, gateZ]}>
      {playerLandFrontFenceRailSegments(yardHalf).map((seg) => (
        <group key={`rail-${seg.centerX}`}>
          <mesh position={[seg.centerX, 0.7, 0]} castShadow>
            <kitBoxGeometry args={[seg.width, 0.1, 0.08]} />
            <TexturedStandardMaterial
              kind="wood"
              color={floors.fenceRailColor}
              roughness={fenceMat.rail.roughness}
              metalness={fenceMat.rail.metalness}
            />
          </mesh>
          <mesh position={[seg.centerX, 0.42, 0]} castShadow>
            <kitBoxGeometry args={[seg.width, 0.06, 0.06]} />
            <TexturedStandardMaterial
              kind="wood"
              color={fenceMat.midRailColor}
              roughness={fenceMat.rail.roughness}
              metalness={fenceMat.rail.metalness}
            />
          </mesh>
        </group>
      ))}

      {([-postOffsetX, postOffsetX] as const).map((x) => (
        <group key={`gp-${x}`} position={[x, 0, 0]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <kitBoxGeometry args={[0.32, 1.9, 0.32]} />
            <TexturedStandardMaterial
              kind="wood"
              color={gateColor}
              roughness={fenceMat.post.roughness}
              metalness={fenceMat.post.metalness}
              emissive={postEmissive}
              emissiveIntensity={postEmissiveIntensity}
            />
          </mesh>
          <mesh position={[0, 1.94, 0]} castShadow>
            <kitBoxGeometry args={[0.4, 0.14, 0.4]} />
            <TexturedStandardMaterial
              kind="wood"
              color={fenceMat.capColor}
              roughness={fenceMat.cap.roughness}
              metalness={fenceMat.cap.metalness}
              emissive={postEmissive}
              emissiveIntensity={postEmissiveIntensity}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 1.72, 0]} castShadow>
        <kitBoxGeometry args={[postOffsetX * 2 + 0.2, 0.12, 0.16]} />
        <TexturedStandardMaterial
          kind="wood"
          color={gateColor}
          roughness={fenceMat.post.roughness}
          metalness={fenceMat.post.metalness}
        />
      </mesh>

      {/* Single swinging leaf, slightly ajar into the yard. */}
      <group position={[-postOffsetX + 0.06, 0, 0]} rotation={[0, 0.35, 0]}>
        {[0.28, 0.56, 0.84, 1.12, 1.4].map((y) => (
          <mesh key={`bar-${y}`} position={[leafWidth / 2, y, 0]} castShadow>
            <kitBoxGeometry args={[leafWidth, 0.2, 0.1]} />
            <TexturedStandardMaterial
              kind="wood"
              color={plankColor}
              roughness={fenceMat.rail.roughness}
              metalness={fenceMat.rail.metalness}
            />
          </mesh>
        ))}
        <mesh position={[0.08, 0.84, 0]} castShadow>
          <kitBoxGeometry args={[0.12, 1.32, 0.12]} />
          <TexturedStandardMaterial
            kind="wood"
            color={gateColor}
            roughness={fenceMat.post.roughness}
            metalness={fenceMat.post.metalness}
          />
        </mesh>
        <mesh position={[leafWidth - 0.08, 0.84, 0]} castShadow>
          <kitBoxGeometry args={[0.12, 1.32, 0.12]} />
          <TexturedStandardMaterial
            kind="wood"
            color={gateColor}
            roughness={fenceMat.post.roughness}
            metalness={fenceMat.post.metalness}
          />
        </mesh>
        <mesh
          position={[leafWidth / 2, 0.84, 0.02]}
          rotation={[0, 0, 0.48]}
          castShadow
        >
          <kitBoxGeometry args={[leafWidth * 0.88, 0.1, 0.08]} />
          <TexturedStandardMaterial
            kind="wood"
            color={gateColor}
            roughness={fenceMat.rail.roughness}
            metalness={fenceMat.rail.metalness}
          />
        </mesh>
      </group>

      <WorldHtml position={[0, 2.35, 0]} center style={{ pointerEvents: "none" }}>
        <div
          data-testid="homestead-land-gate-label"
          style={{
            background: "rgba(24, 18, 12, 0.88)",
            color: "#f0e4d0",
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            border: highlighted
              ? "1px solid color-mix(in srgb, #c4a35a 80%, transparent)"
              : "1px solid rgba(196, 163, 90, 0.55)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.45)",
          }}
        >
          Travel
        </div>
      </WorldHtml>
    </group>
  );
}
