"use client";

import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { ExploreWildsDecor } from "@/components/land-scene/ExploreWildsDecor";
import { useFrame } from "@react-three/fiber";
import {
  exploreCanopyAtmosphereCue,
  exploreCanopyAtmosphereEmissiveIntensity,
  exploreCanopyAtmosphereHazeOpacity,
  exploreCanopyAtmospherePulseEnvelope,
  exploreFirstWalkUpWorldTip,
  exploreWildsFloorColors,
  exploreWildsFloorKitMaterials,
  WORLD,
} from "@game/shared";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { RaisedPathBed } from "@/components/land-scene/FloorSeamSoftener";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";

/**
 * Exploration map — one mixed semi-open canopy.
 * Woodland / mines / hunt yards are gone; trees, ore, and dens share the grass.
 */
export function ForestEnvironment({
  firstWalkUpTip = false,
}: {
  /** PL45.1 — brief soft world tip on first Explore map presence. */
  firstWalkUpTip?: boolean;
}) {
  const wilds = exploreWildsFloorColors();
  const floorKit = exploreWildsFloorKitMaterials();
  const walkUpTip = exploreFirstWalkUpWorldTip();
  const canopyAtmosphere = exploreCanopyAtmosphereCue("explore");
  const canopyMistMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (!canopyAtmosphere.show) return;
    const mistEnv = exploreCanopyAtmospherePulseEnvelope(performance.now());
    const mistMat = canopyMistMatRef.current;
    if (mistMat) {
      mistMat.opacity = exploreCanopyAtmosphereHazeOpacity(mistEnv);
      mistMat.emissiveIntensity =
        exploreCanopyAtmosphereEmissiveIntensity(mistEnv);
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[96, 88]} />
        <TexturedStandardMaterial
          kind="grass"
          color={wilds.canopyColor}
          flatFloor
          metalness={0}
          repeat={12}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.35, 0]}>
        <planeGeometry args={[90, 82]} />
        <meshStandardMaterial
          color={wilds.hazeColor}
          transparent
          opacity={wilds.hazeOpacity}
          depthWrite={false}
        />
      </mesh>

      {canopyAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.42, 0]}
          userData={{ exploreCanopyAtmosphere: true }}
        >
          <planeGeometry
            args={[canopyAtmosphere.hazeWidth, canopyAtmosphere.hazeDepth]}
          />
          <meshStandardMaterial
            ref={canopyMistMatRef}
            color={canopyAtmosphere.hazeColor}
            emissive={canopyAtmosphere.emissive}
            emissiveIntensity={canopyAtmosphere.intensity}
            transparent
            opacity={canopyAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {firstWalkUpTip ? (
        <WorldHtml
          position={[0, 2.4, -4 * WORLD.GRID]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            data-testid="explore-walkup-tip"
            style={{
              background: "rgba(12, 22, 18, 0.88)",
              color: "#d8f0e4",
              padding: "4px 10px",
              borderRadius: 5,
              border: `1px solid ${wilds.hazeColor}`,
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

      <RaisedPathBed
        length={18}
        pathWidth={2.2}
        y={-0.1}
        z={-5.5 * WORLD.GRID}
        along="z"
        bedColor={wilds.pathColor}
        lipColor={floorKit.pathLipColor}
        bedKind="dirt"
        lipKind="dirt"
        lipW={0.12}
      />

      <ExploreWildsDecor />
    </group>
  );
}
