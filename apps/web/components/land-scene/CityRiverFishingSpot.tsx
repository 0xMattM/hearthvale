"use client";

import "@/components/land-scene/kit-box-geometry";
import { FishCatchSplashPad } from "@/components/land-scene/FishCatchSplashPad";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import type { BuildingDto } from "@game/shared";
import {
  cityFishingDockLandmarkCue,
  cityFishingDockLandmarkEmissiveIntensity,
  cityFishingDockLandmarkHazeOpacity,
  cityFishingDockLandmarkPulseEnvelope,
  cityFishingSpotWorldName,
  fishingDockAtmosphereCue,
  fishingDockAtmosphereEmissiveIntensity,
  fishingDockAtmosphereHazeOpacity,
  fishingDockAtmospherePulseEnvelope,
  fishingDockFirstWalkUpWorldTip,
  gatherDockSurfaceMaterials,
  gatherStationReadyWorldLabelParts,
  interactHighlightRingMaterials,
} from "@game/shared";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";

/**
 * City riverbank fishing interact — crate, pole, and bank rocks instead of a
 * wooden pier sitting on grass. Catch rules stay on `fishing_dock`.
 */
export function CityRiverFishingSpot({
  highlighted,
  px,
  pz,
  building,
  nowMs,
  showFirstWalkUpTip = false,
  fishCatchSplash = false,
  fishCatchSplashStartedAt = null,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  building: BuildingDto;
  nowMs: number;
  showFirstWalkUpTip?: boolean;
  fishCatchSplash?: boolean;
  fishCatchSplashStartedAt?: number | null;
}) {
  const ready = building.readyAt == null || nowMs >= building.readyAt;
  const dockKit = gatherDockSurfaceMaterials(ready);
  const walkUpTip = fishingDockFirstWalkUpWorldTip();
  const cityLandmark = cityFishingDockLandmarkCue("city");
  const dockAtmosphere = fishingDockAtmosphereCue("city");
  const { name, soft } = gatherStationReadyWorldLabelParts(
    "fishing_dock",
    "city",
  );
  const poleMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const dockAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (cityLandmark.show) {
      const landmarkEnv = cityFishingDockLandmarkPulseEnvelope(
        performance.now(),
      );
      const intensity = cityFishingDockLandmarkEmissiveIntensity(landmarkEnv);
      const hazeOpacity = cityFishingDockLandmarkHazeOpacity(landmarkEnv);
      if (poleMatRef.current) poleMatRef.current.emissiveIntensity = intensity;
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    if (dockAtmosphere.show && dockAtmosphereMatRef.current) {
      const envelope = fishingDockAtmospherePulseEnvelope(performance.now());
      dockAtmosphereMatRef.current.emissiveIntensity =
        fishingDockAtmosphereEmissiveIntensity(envelope);
      dockAtmosphereMatRef.current.opacity =
        fishingDockAtmosphereHazeOpacity(envelope);
    }
  });

  const ring = interactHighlightRingMaterials();

  return (
    <group position={[px, 0, pz]}>
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0.15]}
          userData={{ cityFishingDockLandmark: true }}
        >
          <circleGeometry args={[cityLandmark.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={hazeMatRef}
            color={cityLandmark.hazeColor}
            emissive={cityLandmark.emissive}
            emissiveIntensity={0.1}
            transparent
            opacity={cityLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {dockAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, dockAtmosphere.hazeY, 0.2]}
          userData={{ fishingDockAtmosphere: true }}
        >
          <circleGeometry args={[dockAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={dockAtmosphereMatRef}
            color={dockAtmosphere.hazeColor}
            emissive={dockAtmosphere.emissive}
            emissiveIntensity={dockAtmosphere.intensity}
            transparent
            opacity={dockAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* Bank rocks — reads as a shoreline, not a pier */}
      <mesh position={[-0.42, 0.16, 0.12]} castShadow>
        <sphereGeometry args={[0.22, 8, 6]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#5a564e"
          roughness={0.9}
          metalness={0.06}
        />
      </mesh>
      <mesh position={[0.38, 0.12, 0.28]} castShadow>
        <sphereGeometry args={[0.16, 8, 6]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#4a4844"
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* Catch crate — the walk-up interact object */}
      <mesh position={[0, 0.22, -0.08]} castShadow>
        <kitBoxGeometry args={[0.55, 0.38, 0.42]} />
        <TexturedStandardMaterial
          kind="wood"
          color={highlighted ? dockKit.deckLitColor : dockKit.deckColor}
          roughness={dockKit.deck.roughness}
          metalness={dockKit.deck.metalness}
          emissive={showFirstWalkUpTip ? "#4a7a9a" : "#000000"}
          emissiveIntensity={showFirstWalkUpTip ? 0.26 : 0}
        />
      </mesh>
      <mesh position={[0, 0.44, -0.08]} castShadow>
        <kitBoxGeometry args={[0.58, 0.06, 0.16]} />
        <TexturedStandardMaterial
          kind="wood"
          color={dockKit.cleatColor}
          roughness={dockKit.cleat.roughness}
          metalness={dockKit.cleat.metalness}
        />
      </mesh>

      {/* Fishing pole leaning toward the river (+Z) */}
      <group position={[0.12, 0.55, 0.05]} rotation={[0.72, 0.15, 0.08]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.035, 1.15, 6]} />
          <TexturedStandardMaterial
            kind="wood"
            ref={poleMatRef}
            color={dockKit.pileColor}
            roughness={dockKit.pile.roughness}
            metalness={dockKit.pile.metalness}
            emissive={cityLandmark.show ? cityLandmark.emissive : "#000000"}
            emissiveIntensity={cityLandmark.show ? cityLandmark.intensity : 0}
          />
        </mesh>
        <mesh position={[0, 1.12, 0]}>
          <cylinderGeometry args={[0.012, 0.018, 0.08, 6]} />
          <meshStandardMaterial color="#6a7078" metalness={0.45} roughness={0.4} />
        </mesh>
      </group>

      <FishCatchSplashPad
        active={fishCatchSplash}
        startedAtMs={fishCatchSplashStartedAt}
        y={-0.06}
      />
      {ready ? (
        <Html position={[0, 1.35, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="gather-ready-world-label"
            data-gather="fishing_dock"
            data-city-fishing-spot="1"
            style={{
              background: "rgba(18, 22, 16, 0.82)",
              color: "#e8f0e2",
              padding: "3px 8px",
              borderRadius: 5,
              border: "1px solid #6a8a48",
              fontSize: 11,
              whiteSpace: "nowrap",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            <div style={{ fontWeight: 650 }}>
              {name || cityFishingSpotWorldName()}
            </div>
            <div style={{ fontSize: 9, opacity: 0.75 }}>{soft}</div>
          </div>
        </Html>
      ) : null}
      {showFirstWalkUpTip ? (
        <Html position={[0, 1.75, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="fishing-dock-walkup-tip"
            data-fishing-dock-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #6aa0c0",
              boxShadow: "0 0 10px rgba(74,122,154,0.45)",
            }}
          >
            {walkUpTip}
          </div>
        </Html>
      ) : null}
      {highlighted ? (
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
      ) : null}
    </group>
  );
}
