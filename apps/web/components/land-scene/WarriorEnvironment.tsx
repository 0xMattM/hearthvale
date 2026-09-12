"use client";

import "@/components/land-scene/kit-box-geometry";
import { RaisedFloorCurb } from "@/components/land-scene/FloorSeamSoftener";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { useRef } from "react";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import {
  WARRIOR_ARENA_VISUAL,
  WARRIOR_BUILDINGS,
  WORLD,
  warriorArenaAtmosphereCue,
  warriorArenaAtmosphereEmissiveIntensity,
  warriorArenaAtmosphereHazeOpacity,
  warriorArenaAtmospherePulseEnvelope,
  warriorArenaExitHint,
  warriorArenaExitLabel,
  warriorArenaFloorKitMaterials,
  warriorArenaPropKitMaterials,
  warriorFirstMapWorldTip,
} from "@game/shared";

/**
 * Warrior arena environment — optional combat-path stub space (CL5.1 / CL11.1 / PL11.1 / PL41.2).
 * Scorched grounds + warm clay ring vs other map floors; plaque accent on exit chrome.
 * PL41.2: slight warm haze so Arena reads apart from Explore cool canopy (PL36.2).
 * PL53.2: one-shot soft world tip on first Warrior map presence (complements plaque tip).
 * PL177.1: quiet pulsing warm mist leftover over PL41.2 static haze.
 * VA2.6: post/rope/bench/banner prop PBR + post caps — floors / MAP_IDENTITY unchanged.
 * VA4.4: grounds / ring / chalk / path get shared PBR + ring lip (WARRIOR_ARENA_VISUAL hexes stay).
 * No balance or profession coupling.
 */
export function WarriorEnvironment({
  firstMapTip = false,
}: {
  /** PL53.2 — brief soft world tip on first Warrior map presence. */
  firstMapTip?: boolean;
}) {
  const posts: Array<[number, number]> = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    posts.push([Math.cos(a) * 7.2, Math.sin(a) * 7.2]);
  }

  const exitPortal = WARRIOR_BUILDINGS.find((b) => b.type === "portal");
  const exitX = (exitPortal?.x ?? 0) * WORLD.GRID;
  const exitZ = (exitPortal?.z ?? -5) * WORLD.GRID;
  const v = WARRIOR_ARENA_VISUAL;
  const kit = warriorArenaPropKitMaterials();
  const floorKit = warriorArenaFloorKitMaterials();
  const walkUpTip = warriorFirstMapWorldTip();
  // Reason: PL177.1 — WarriorEnvironment only mounts on Warrior map.
  const arenaAtmosphere = warriorArenaAtmosphereCue("warrior");
  const arenaMistMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (!arenaAtmosphere.show) return;
    const mistEnv = warriorArenaAtmospherePulseEnvelope(performance.now());
    const mistMat = arenaMistMatRef.current;
    if (mistMat) {
      mistMat.opacity = warriorArenaAtmosphereHazeOpacity(mistEnv);
      mistMat.emissiveIntensity =
        warriorArenaAtmosphereEmissiveIntensity(mistEnv);
    }
  });

  return (
    <group>
      {/* Scorched dusty grounds — matte floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[56, 48]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={v.groundsColor}
          flatFloor
          metalness={0}
          repeat={8}
        />
      </mesh>
      {/* Raised curb: grounds → ring */}
      <RaisedFloorCurb
        width={16}
        depth={16}
        y={-0.12}
        color="#7a6a58"
        kind="dirt"
        curbW={0.28}
        curbH={0.09}
      />

      {/* Soft warm haze — optional-path atmosphere apart from Explore cool haze (PL41.2) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.35, 0]}>
        <planeGeometry args={[52, 44]} />
        <meshStandardMaterial
          color={v.hazeColor}
          transparent
          opacity={v.hazeOpacity}
          depthWrite={false}
        />
      </mesh>

      {/* PL177.1 — soft pulsing warm arena mist leftover over PL41.2 static haze */}
      {arenaAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.42, 0]}
          userData={{ warriorArenaAtmosphere: true }}
        >
          <planeGeometry
            args={[arenaAtmosphere.hazeWidth, arenaAtmosphere.hazeDepth]}
          />
          <meshStandardMaterial
            ref={arenaMistMatRef}
            color={arenaAtmosphere.hazeColor}
            emissive={arenaAtmosphere.emissive}
            emissiveIntensity={arenaAtmosphere.intensity}
            transparent
            opacity={arenaAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* Packed clay ring — matte */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <circleGeometry args={[8, 40]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={v.ringFillColor}
          flatFloor
          metalness={0}
          repeat={5}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <ringGeometry args={[6.4, 7.6, 40]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={v.ringBorderColor}
          flatFloor
          metalness={0}
        />
      </mesh>
      {/* VA4.4 — clay ring outer lip (articulation; hexes stay on WARRIOR_ARENA_VISUAL) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, 0]} receiveShadow>
        <ringGeometry args={[7.55, 7.78, 40]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={floorKit.ringLipColor}
          flatFloor
          metalness={0}
        />
      </mesh>
      {/* Inner chalk circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <ringGeometry args={[3.8, 4.1, 40]} />
        <TexturedStandardMaterial
          kind="plaster"
          color={v.chalkColor}
          flatFloor
          metalness={0}
        />
      </mesh>

      {/* Entry / exit path to north portal */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[exitX, -0.06, exitZ / 2]}
        receiveShadow
      >
        <planeGeometry args={[2.2, Math.abs(exitZ) + 2]} />
        <TexturedStandardMaterial
          kind="dirt"
          color={v.pathColor}
          flatFloor
          metalness={0}
          repeat={4}
        />
      </mesh>

      <ArenaExitLabel x={exitX} z={exitZ} accent={v.plaqueAccent} />

      {/* PL53.2 — one-shot soft tip near ring center; dismisses with TopBar cue */}
      {firstMapTip ? (
        <WorldHtml
          position={[0, 2.4, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            data-testid="warrior-map-walkup-tip"
            style={{
              background: "rgba(16, 12, 10, 0.88)",
              color: "#f0e8e0",
              padding: "4px 10px",
              borderRadius: 5,
              border: `1px solid ${v.plaqueAccent}`,
              fontSize: 11,
              fontWeight: 650,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            {walkUpTip}
          </div>
        </WorldHtml>
      ) : null}

      {/* Low arena wall posts + caps (VA2.6) */}
      {posts.map(([x, z], i) => (
        <group key={`aw-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <kitBoxGeometry args={[0.35, 1.1, 0.35]} />
            <TexturedStandardMaterial kind="wood" color={kit.postColor}
              roughness={kit.post.roughness}
              metalness={kit.post.metalness} />
          </mesh>
          <mesh position={[0, 1.14, 0]} castShadow>
            <kitBoxGeometry args={[0.4, 0.1, 0.4]} />
            <TexturedStandardMaterial kind="wood" color={kit.postCapColor}
              roughness={kit.postCap.roughness}
              metalness={kit.postCap.metalness} />
          </mesh>
        </group>
      ))}
      {/* Rope rails between posts (short segments) */}
      {posts.map(([x, z], i) => {
        const [nx, nz] = posts[(i + 1) % posts.length]!;
        const mx = (x + nx) / 2;
        const mz = (z + nz) / 2;
        const angle = Math.atan2(nz - z, nx - x);
        const len = Math.hypot(nx - x, nz - z);
        return (
          <mesh
            key={`ar-${i}`}
            position={[mx, 0.95, mz]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <kitBoxGeometry args={[len * 0.92, 0.06, 0.06]} />
            <TexturedStandardMaterial kind="plaster" color={kit.ropeColor}
              roughness={kit.rope.roughness}
              metalness={kit.rope.metalness} />
          </mesh>
        );
      })}

      {/* Spectator benches */}
      <mesh position={[-9.5, 0.35, 0]} castShadow>
        <kitBoxGeometry args={[1.2, 0.7, 8]} />
        <TexturedStandardMaterial kind="plaster" color={kit.benchColor}
          roughness={kit.bench.roughness}
          metalness={kit.bench.metalness} />
      </mesh>
      <mesh position={[9.5, 0.35, 0]} castShadow>
        <kitBoxGeometry args={[1.2, 0.7, 8]} />
        <TexturedStandardMaterial kind="plaster" color={kit.benchColor}
          roughness={kit.bench.roughness}
          metalness={kit.bench.metalness} />
      </mesh>
      <mesh position={[0, 0.4, 9.2]} castShadow>
        <kitBoxGeometry args={[8, 0.8, 1.2]} />
        <TexturedStandardMaterial kind="plaster" color={kit.benchAltColor}
          roughness={kit.bench.roughness}
          metalness={kit.bench.metalness} />
      </mesh>

      {/* Banner poles (cosmetic only) */}
      <mesh position={[-6.5, 1.6, -6]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 3.2, 6]} />
        <TexturedStandardMaterial kind="cloth" color={kit.bannerPoleColor}
          roughness={kit.bannerPole.roughness}
          metalness={kit.bannerPole.metalness} />
      </mesh>
      <mesh position={[-6.5, 2.6, -5.7]} castShadow>
        <kitBoxGeometry args={[0.05, 1.2, 0.7]} />
        <TexturedStandardMaterial kind="cloth" color={v.plaqueFace}
          roughness={kit.bannerCloth.roughness}
          metalness={kit.bannerCloth.metalness} />
      </mesh>
      <mesh position={[6.5, 1.6, -6]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 3.2, 6]} />
        <TexturedStandardMaterial kind="cloth" color={kit.bannerPoleColor}
          roughness={kit.bannerPole.roughness}
          metalness={kit.bannerPole.metalness} />
      </mesh>
      <mesh position={[6.5, 2.6, -5.7]} castShadow>
        <kitBoxGeometry args={[0.05, 1.2, 0.7]} />
        <TexturedStandardMaterial kind="cloth" color={v.plaqueFace}
          roughness={kit.bannerCloth.roughness}
          metalness={kit.bannerCloth.metalness} />
      </mesh>
    </group>
  );
}

/**
 * Floating exit wayfinding over the north portal (CL11.1 / PL11.1 accent).
 *
 * @param props - World position aligned to WARRIOR_BUILDINGS portal + plaque accent.
 */
function ArenaExitLabel({
  x,
  z,
  accent,
}: {
  x: number;
  z: number;
  accent: string;
}) {
  return (
    <WorldHtml position={[x, 3.1, z]} center style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          background: "rgba(16, 12, 10, 0.88)",
          color: "#f0e8e0",
          padding: "4px 10px",
          borderRadius: 4,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 10px ${accent}55`,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.04,
            color: accent,
          }}
        >
          {warriorArenaExitLabel()}
        </span>
        <span style={{ fontSize: 10, opacity: 0.9 }}>
          {warriorArenaExitHint()}
        </span>
      </div>
    </WorldHtml>
  );
}
