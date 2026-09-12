"use client";

import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { CombatFoeMesh } from "@/components/land-scene/CombatFoeMesh";
import { CropPlotPlants } from "@/components/land-scene/CropPlotPlants";
import type { BuildingDto, LandKind } from "@game/shared";
import {
  CROP_GROWING_SOFT_SWAY,
  CROP_READY_WORLD_PULSE,
  cityCropPlotLandmarkCue,
  cityCropPlotLandmarkEmissiveIntensity,
  cityCropPlotLandmarkHazeOpacity,
  cityCropPlotLandmarkPulseEnvelope,
  cityOreNodeLandmarkCue,
  cityOreNodeLandmarkEmissiveIntensity,
  cityOreNodeLandmarkHazeOpacity,
  cityOreNodeLandmarkPulseEnvelope,
  oreNodeAtmosphereCue,
  oreNodeAtmosphereEmissiveIntensity,
  oreNodeAtmosphereHazeOpacity,
  oreNodeAtmospherePulseEnvelope,
  cropGrowingAtmosphereCue,
  cropGrowingAtmosphereEmissiveIntensity,
  cropGrowingAtmosphereHazeOpacity,
  cropGrowingAtmospherePulseEnvelope,
  cropGrowingPadEmissiveIntensity,
  cropGrowingSoftSwayActive,
  cropGrowingSoftSwayEnvelope,
  cropGrowingStemEmissiveIntensity,
  cropGrowingStemSwayRadians,
  cropGrowthProgressBarMaterials,
  cropPlotFirstWalkUpWorldTip,
  cropPlotSoilMaterials,
  cropReadyWorldLabelParts,
  cropReadyWorldPulseIntensity,
  explorePremiumNodeGlow,
  gatherOreDepletedPad,
  gatherStationReadyWorldLabelParts,
  huntDenSeed,
  huntTerritoryPoint,
  huntTrailFirstWalkUpWorldTip,
  interactHighlightRingMaterials,
  LIVE_COMBAT,
  oreNodeFirstWalkUpWorldTip,
} from "@game/shared";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";
import { GatherSuccessFlashPad } from "@/components/land-scene/GatherSuccessFlashPad";
import { clientCropState } from "@/components/land-scene/landProximity";
import { ORE_KIT_SILHOUETTE } from "@/lib/ore-kit-silhouette";
import {
  cropVisual,
  oreVisual,
  trailVisual,
} from "@/lib/resource-visuals";

/** VA4.4 — select gold ring SoT shared with BuildingMesh. */
function HighlightRing({ show }: { show: boolean }) {
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
 * Name-first floating label when a crop plot is harvest-ready (PL40.1).
 * Complements pad pulse (PL12.1); empty stay quiet; growing soft sway (PL121.1).
 */
function CropReadyWorldLabel({
  cropId,
  y,
}: {
  cropId: string | null;
  y: number;
}) {
  const { name, soft } = cropReadyWorldLabelParts(cropId);
  return (
    <WorldHtml position={[0, y, 0]} center style={{ pointerEvents: "none" }}>
      <div
        data-testid="crop-ready-world-label"
        data-crop={cropId ?? "unknown"}
        style={{
          background: "rgba(18, 22, 16, 0.82)",
          color: "#e8f0e2",
          padding: "3px 8px",
          borderRadius: 5,
          border: "1px solid #a0b830",
          fontSize: 11,
          whiteSpace: "nowrap",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        <div style={{ fontWeight: 650 }}>{name}</div>
        <div style={{ fontSize: 9, opacity: 0.75 }}>{soft}</div>
      </div>
    </WorldHtml>
  );
}

/**
 * Name-first floating label when ore is mine-ready (PL23.2).
 * Replaces the old CHIP badge; depleted keeps timer/pad only.
 */
function GatherReadyWorldLabel({
  type,
  y,
}: {
  type: "tree_stump" | "ore_node" | "fishing_dock" | "animal_pen";
  y: number;
}) {
  const { name, soft } = gatherStationReadyWorldLabelParts(type);
  return (
    <WorldHtml position={[0, y, 0]} center style={{ pointerEvents: "none" }}>
      <div
        data-testid="gather-ready-world-label"
        data-gather={type}
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
        <div style={{ fontWeight: 650 }}>{name}</div>
        <div style={{ fontSize: 9, opacity: 0.75 }}>{soft}</div>
      </div>
    </WorldHtml>
  );
}

/**
 * Crop plot — empty / sprout / growing / ready are visually distinct (F14.3).
 * VA1.3 — soil bed PBR + furrows / clods / border timber articulation.
 */
export function CropFieldMesh({
  building,
  highlighted,
  px,
  pz,
  nowMs,
  landKind,
  showFirstWalkUpTip = false,
}: {
  building: BuildingDto;
  highlighted: boolean;
  px: number;
  pz: number;
  nowMs: number;
  landKind?: LandKind;
  /** PL68.3 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
}) {
  const cropState = clientCropState(building, nowMs);
  const v = cropVisual(
    cropState,
    building.readyAt,
    nowMs,
    highlighted,
    building.plantedAt,
    building.cropId,
  );
  const soil = cropPlotSoilMaterials(v.state);
  const isReady = v.state === "ready";
  const isGrowing = cropGrowingSoftSwayActive(v.state);
  const pulseIntensity = isReady
    ? cropReadyWorldPulseIntensity(nowMs)
    : 0;
  const swayEnvelope = isGrowing ? cropGrowingSoftSwayEnvelope(nowMs) : 0;
  const growingPadIntensity = cropGrowingPadEmissiveIntensity(
    isGrowing,
    swayEnvelope,
  );
  const stemSway = cropGrowingStemSwayRadians(isGrowing, swayEnvelope);
  const stemGlow = cropGrowingStemEmissiveIntensity(isGrowing, swayEnvelope);
  const walkUpTip = cropPlotFirstWalkUpWorldTip();
  // Reason: VA5.3 — progress fill/frame PBR; growMs / ready / sway cues unchanged.
  const progressBar = cropGrowthProgressBarMaterials();
  const progressWidth = Math.max(0.08, v.progress * progressBar.maxWidth);
  // Reason: PL171.1 — quiet warm soil landmark while on City scarce crop plot.
  const cityLandmark = cityCropPlotLandmarkCue(landKind);
  // Reason: PL190.1 — quiet warm soil mist while growing on player land.
  const growingAtmosphere = cropGrowingAtmosphereCue(landKind, v.state);
  const soilMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const growingAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (cityLandmark.show) {
      const envelope = cityCropPlotLandmarkPulseEnvelope(performance.now());
      const intensity = cityCropPlotLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = cityCropPlotLandmarkHazeOpacity(envelope);
      if (soilMatRef.current && !showFirstWalkUpTip) {
        soilMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    if (growingAtmosphere.show && growingAtmosphereMatRef.current) {
      const envelope = cropGrowingAtmospherePulseEnvelope(performance.now());
      growingAtmosphereMatRef.current.emissiveIntensity =
        cropGrowingAtmosphereEmissiveIntensity(envelope);
      growingAtmosphereMatRef.current.opacity =
        cropGrowingAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* PL171.1 — soft pulsing warm soil landmark under City scarce crop plot */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          userData={{ cityCropPlotLandmark: true }}
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
      {/* PL190.1 — quiet warm pulsing soil mist while growing on player land */}
      {growingAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, growingAtmosphere.hazeY, 0]}
          userData={{ cropGrowingAtmosphere: true }}
        >
          <circleGeometry args={[growingAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={growingAtmosphereMatRef}
            color={growingAtmosphere.hazeColor}
            emissive={growingAtmosphere.emissive}
            emissiveIntensity={growingAtmosphere.intensity}
            transparent
            opacity={growingAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* PL12.1 — soft pad + emissive pulse only when harvest-ready */}
      {isReady ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          receiveShadow
        >
          <circleGeometry args={[1.15, 24]} />
          <meshStandardMaterial
            color={CROP_READY_WORLD_PULSE.padColor}
            transparent
            opacity={CROP_READY_WORLD_PULSE.opacity}
            emissive={CROP_READY_WORLD_PULSE.emissiveColor}
            emissiveIntensity={pulseIntensity}
          />
        </mesh>
      ) : null}
      {/* PL121.1 — quiet growing pad (apart from empty + ready pulse) */}
      {isGrowing ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.018, 0]}
          receiveShadow
        >
          <circleGeometry args={[1.05, 20]} />
          <meshStandardMaterial
            color={CROP_GROWING_SOFT_SWAY.padColor}
            transparent
            opacity={CROP_GROWING_SOFT_SWAY.opacity}
            emissive={CROP_GROWING_SOFT_SWAY.emissiveColor}
            emissiveIntensity={growingPadIntensity}
          />
        </mesh>
      ) : null}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <kitBoxGeometry args={[1.7, 0.24, 1.7]} />
        <TexturedStandardMaterial kind="dirt" ref={soilMatRef}
          color={v.soilColor}
          roughness={soil.bed.roughness}
          metalness={soil.bed.metalness}
          emissive={
            showFirstWalkUpTip
              ? "#6a8a4a"
              : cityLandmark.show
                ? cityLandmark.emissive
                : "#000000"
          }
          emissiveIntensity={
            showFirstWalkUpTip
              ? 0.26
              : cityLandmark.show
                ? cityLandmark.intensity
                : 0
          } />
      </mesh>
      {/* Furrows — readable empty / early sprout soil (VA1.3) */}
      {soil.showFurrows
        ? [-0.4, 0, 0.4].map((z) => (
            <mesh key={z} position={[0, 0.25, z]}>
              <kitBoxGeometry args={[1.4, 0.04, 0.08]} />
              <TexturedStandardMaterial kind="dirt" color={soil.furrowColor}
                roughness={soil.furrow.roughness}
                metalness={soil.furrow.metalness} />
            </mesh>
          ))
        : null}
      {/* Corner soil clods — empty bed only (VA1.3) */}
      {soil.showClods
        ? [
            [0.55, 0.28, 0.55],
            [-0.52, 0.26, 0.48],
            [0.48, 0.27, -0.52],
            [-0.5, 0.25, -0.48],
          ].map(([cx, cy, cz], i) => (
            <mesh key={`clod-${i}`} position={[cx!, cy!, cz!]} castShadow>
              <sphereGeometry args={[0.1, 6, 5]} />
              <TexturedStandardMaterial kind="dirt" color={soil.clodColor}
                roughness={soil.clod.roughness}
                metalness={soil.clod.metalness} />
            </mesh>
          ))
        : null}
      {[
        [0, 0.22, 0.88],
        [0, 0.22, -0.88],
        [0.88, 0.22, 0],
        [-0.88, 0.22, 0],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x!, y!, z!]}>
          <kitBoxGeometry
            args={i < 2 ? [1.8, 0.12, 0.1] : [0.1, 0.12, 1.8]}
          />
          <TexturedStandardMaterial kind="dirt" color={soil.borderColor}
            roughness={soil.border.roughness}
            metalness={soil.border.metalness} />
        </mesh>
      ))}

      <CropPlotPlants
        visual={v}
        cropId={building.cropId}
        stemSway={stemSway}
        stemGlow={stemGlow}
        pulseIntensity={pulseIntensity}
        isReady={isReady}
        isGrowing={isGrowing}
      />

      {v.showProgressBar ? (
        <group>
          {/* Quiet full-width frame lip so the fill reads as progress (VA5.3). */}
          <mesh position={[0, progressBar.y - 0.012, 0]}>
            <kitBoxGeometry
              args={[
                progressBar.maxWidth + progressBar.frameLip * 2,
                progressBar.height + 0.02,
                progressBar.depth + progressBar.frameLip * 2,
              ]}
            />
            <TexturedStandardMaterial kind="wood" color={progressBar.frameColor}
              roughness={progressBar.frame.roughness}
              metalness={progressBar.frame.metalness} />
          </mesh>
          <mesh position={[0, progressBar.y, 0]}>
            <kitBoxGeometry
              args={[progressWidth, progressBar.height, progressBar.depth]}
            />
            <TexturedStandardMaterial kind="wood" color={progressBar.fillColor}
              roughness={progressBar.fill.roughness}
              metalness={progressBar.fill.metalness} />
          </mesh>
        </group>
      ) : null}

      {isReady ? (
        <CropReadyWorldLabel cropId={building.cropId} y={1.45} />
      ) : null}

      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 1.9, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="crop-plot-walkup-tip"
            data-crop-plot-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #8aaa68",
              boxShadow: "0 0 10px rgba(106,138,74,0.4)",
            }}
          >
            {walkUpTip}
          </div>
        </WorldHtml>
      ) : null}

      <HighlightRing show={highlighted} />
    </group>
  );
}

/**
 * Ore rock — bright veins when chip-ready; dull when cooling (F14.3).
 */
export function OreNodeMesh({
  highlighted,
  px,
  pz,
  building,
  nowMs,
  showFirstWalkUpTip = false,
  landKind = "player_land",
  gatherSuccessFlash = false,
  gatherSuccessFlashStartedAt = null,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  building: BuildingDto;
  nowMs: number;
  /** PL68.2 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL116.2 — Explore premium glow when ready. */
  landKind?: LandKind;
  /** PL131.2 — brief mint-lime pad after successful mine. */
  gatherSuccessFlash?: boolean;
  gatherSuccessFlashStartedAt?: number | null;
}) {
  const ready = building.readyAt == null || nowMs >= building.readyAt;
  const v = oreVisual(ready, highlighted, building.cropId);
  const depletedPad = gatherOreDepletedPad(ready);
  const premiumGlow = explorePremiumNodeGlow(landKind, ready, "ore");
  const walkUpTip = oreNodeFirstWalkUpWorldTip();
  // Reason: PL172.1 — quiet cool mineral landmark while on City scarce ore.
  const cityLandmark = cityOreNodeLandmarkCue(landKind);
  // Reason: PL192.1 — quiet cool ore mist leftover on player land (≠ City landmark / premium / ready).
  const oreAtmosphere = oreNodeAtmosphereCue(landKind);
  const rockMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const oreAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (cityLandmark.show && !showFirstWalkUpTip && !premiumGlow.show) {
      const envelope = cityOreNodeLandmarkPulseEnvelope(performance.now());
      const intensity = cityOreNodeLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = cityOreNodeLandmarkHazeOpacity(envelope);
      if (rockMatRef.current) rockMatRef.current.emissiveIntensity = intensity;
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL192.1 — continuous cool leftover mist on player land.
    if (oreAtmosphere.show && oreAtmosphereMatRef.current) {
      const envelope = oreNodeAtmospherePulseEnvelope(performance.now());
      oreAtmosphereMatRef.current.emissiveIntensity =
        oreNodeAtmosphereEmissiveIntensity(envelope);
      oreAtmosphereMatRef.current.opacity =
        oreNodeAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* PL172.1 — soft pulsing cool mineral landmark under City scarce ore */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          userData={{ cityOreNodeLandmark: true }}
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
      {/* PL192.1 — quiet cool pulsing ore mist leftover on player land */}
      {oreAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, oreAtmosphere.hazeY, 0]}
          userData={{ oreNodeAtmosphere: true }}
        >
          <circleGeometry args={[oreAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={oreAtmosphereMatRef}
            color={oreAtmosphere.hazeColor}
            emissive={oreAtmosphere.emissive}
            emissiveIntensity={oreAtmosphere.intensity}
            transparent
            opacity={oreAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* PL12.2 — quiet pad when ore is depleted / cooling */}
      {depletedPad.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          receiveShadow
        >
          <circleGeometry args={[1.05, 20]} />
          <meshStandardMaterial
            color={depletedPad.color}
            transparent
            opacity={depletedPad.opacity}
            emissive={showFirstWalkUpTip ? "#6a7a9a" : "#000000"}
            emissiveIntensity={showFirstWalkUpTip ? 0.22 : 0}
          />
        </mesh>
      ) : null}
      {/* PL116.2 — soft Explore premium glow while chip-ready */}
      {premiumGlow.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.025, 0]}
          receiveShadow
        >
          <circleGeometry args={[1.08, 20]} />
          <meshStandardMaterial
            color={premiumGlow.padColor}
            transparent
            opacity={premiumGlow.padOpacity}
            emissive={
              showFirstWalkUpTip ? "#6a7a9a" : premiumGlow.emissive
            }
            emissiveIntensity={
              showFirstWalkUpTip ? 0.4 : premiumGlow.intensity
            }
          />
        </mesh>
      ) : null}
      {/* PL131.2 — brief mint-lime settle after Mined */}
      <GatherSuccessFlashPad
        active={gatherSuccessFlash}
        startedAtMs={gatherSuccessFlashStartedAt}
        y={0.03}
        radius={1.12}
      />
      {/* Rubble cluster — no circular understone disc (ORE-LOOK-1) */}
      {ORE_KIT_SILHOUETTE.hasCircularUnderstone ? (
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <cylinderGeometry args={[0.85, 0.95, 0.12, 10]} />
          <TexturedStandardMaterial kind="metal" color={v.understoneColor}
            roughness={v.rockSurface.roughness}
            metalness={v.rockSurface.metalness * 0.5} />
        </mesh>
      ) : null}
      {[
        [0.55, 0.12, -0.4, 0.12],
        [-0.5, 0.1, 0.45, 0.1],
        [0.15, 0.09, 0.62, 0.09],
        [-0.22, 0.07, -0.52, 0.11],
        [0.42, 0.08, 0.18, 0.09],
      ].map(([x, y, z, r], i) => (
        <mesh key={`ore-rubble-${i}`} position={[x!, y!, z!]} castShadow>
          <dodecahedronGeometry args={[r!, 0]} />
          <TexturedStandardMaterial kind="metal" color={v.rubbleColor}
            roughness={v.rockSurface.roughness}
            metalness={v.rockSurface.metalness} />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0]} castShadow>
        <dodecahedronGeometry args={[0.75, 0]} />
        <TexturedStandardMaterial kind="stone" ref={rockMatRef}
          color={v.rockColor}
          roughness={v.rockSurface.roughness}
          metalness={v.rockSurface.metalness}
          emissive={
            showFirstWalkUpTip
              ? "#6a7a9a"
              : premiumGlow.show
                ? premiumGlow.emissive
                : cityLandmark.show
                  ? cityLandmark.emissive
                  : "#000000"
          }
          emissiveIntensity={
            showFirstWalkUpTip
              ? 0.26
              : premiumGlow.show
                ? premiumGlow.intensity * 0.55
                : cityLandmark.show
                  ? cityLandmark.intensity
                  : 0
          } />
      </mesh>
      <mesh position={[0.35, 0.25, 0.3]} castShadow>
        <dodecahedronGeometry args={[0.35, 0]} />
        <TexturedStandardMaterial kind="stone" color={v.rockColor}
          roughness={v.rockSurface.roughness}
          metalness={v.rockSurface.metalness} />
      </mesh>
      <mesh position={[-0.4, 0.22, -0.28]} castShadow>
        <dodecahedronGeometry args={[0.28, 0]} />
        <TexturedStandardMaterial kind="stone" color={v.rubbleColor}
          roughness={v.rockSurface.roughness}
          metalness={v.rockSurface.metalness} />
      </mesh>
      {/* Iron vein — primary readiness cue (VA1.1 metallic SoT) */}
      <mesh position={[-0.15, 0.55, 0.35]} rotation={[0.4, 0.2, 0.6]} castShadow>
        <kitBoxGeometry args={[0.55, 0.08, 0.12]} />
        <TexturedStandardMaterial kind="metal" color={v.veinColor}
          emissive={showFirstWalkUpTip ? "#8aa0c0" : v.veinEmissive}
          emissiveIntensity={
            showFirstWalkUpTip ? 0.4 : v.veinIntensity
          }
          metalness={v.veinSurface.metalness}
          roughness={v.veinSurface.roughness} />
      </mesh>
      <mesh position={[0.25, 0.7, -0.15]} rotation={[-0.3, 0.5, 0.2]} castShadow>
        <kitBoxGeometry args={[0.35, 0.06, 0.1]} />
        <TexturedStandardMaterial kind="plaster" color={v.veinColor}
          emissive={v.veinEmissive}
          emissiveIntensity={v.veinIntensity * 0.8}
          metalness={v.veinSurface.metalness}
          roughness={v.veinSurface.roughness} />
      </mesh>
      {v.showReadyBadge ? (
        <GatherReadyWorldLabel type="ore_node" y={1.45} />
      ) : null}
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 1.85, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="ore-node-walkup-tip"
            data-ore-node-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #8aa0c0",
              boxShadow: "0 0 10px rgba(106,122,154,0.4)",
            }}
          >
            {walkUpTip}
          </div>
        </WorldHtml>
      ) : null}
      <HighlightRing show={highlighted} />
    </group>
  );
}

/**
 * Game trail — loose hares in a brush patch (no hunt station plot).
 */
export function GameTrailMesh({
  px,
  pz,
  building,
  nowMs,
  showFirstWalkUpTip = false,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  building: BuildingDto;
  nowMs: number;
  /** Kept for BuildingMesh callers; habitat is map-agnostic. */
  landKind?: LandKind;
  /** PL68.4 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
}) {
  const ready = building.readyAt == null || nowMs >= building.readyAt;
  const v = trailVisual(ready, false, "trail");
  const walkUpTip = huntTrailFirstWalkUpWorldTip();
  const seed = huntDenSeed(building.id);
  const tipAt = huntTerritoryPoint(seed, 1, LIVE_COMBAT.habitatRadius);

  return (
    <group position={[px, 0, pz]}>
      <CombatFoeMesh
        kind="hare"
        buildingId={building.id}
        ready={ready}
        hideColor={v.creatureColor}
        hornColor="#c4a070"
        padX={px}
        padZ={pz}
      />
      {showFirstWalkUpTip ? (
        <WorldHtml
          position={[tipAt.x, 1.85, tipAt.z]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            data-testid="hunt-trail-walkup-tip"
            data-hunt-trail-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #c4a35a",
              boxShadow: "0 0 10px rgba(196,163,90,0.4)",
            }}
          >
            {walkUpTip}
          </div>
        </WorldHtml>
      ) : null}
    </group>
  );
}

/**
 * Edge thicket — loose boars in denser brush (no hunt station plot).
 */
export function EdgeThicketMesh({
  px,
  pz,
  building,
  nowMs,
  showFirstWalkUpTip = false,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  building: BuildingDto;
  nowMs: number;
  /** Kept for BuildingMesh callers; habitat is map-agnostic. */
  landKind?: LandKind;
  /** PL68.4 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
}) {
  const ready = building.readyAt == null || nowMs >= building.readyAt;
  const v = trailVisual(ready, false, "thicket");
  const walkUpTip = huntTrailFirstWalkUpWorldTip();
  const seed = huntDenSeed(building.id);
  const tipAt = huntTerritoryPoint(seed, 1, LIVE_COMBAT.habitatRadius);

  return (
    <group position={[px, 0, pz]}>
      <CombatFoeMesh
        kind="boar"
        buildingId={building.id}
        ready={ready}
        hideColor={v.creatureColor}
        hornColor="#2a1a12"
        padX={px}
        padZ={pz}
      />
      {showFirstWalkUpTip ? (
        <WorldHtml
          position={[tipAt.x, 1.95, tipAt.z]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            data-testid="hunt-trail-walkup-tip"
            data-hunt-trail-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #c4a35a",
              boxShadow: "0 0 10px rgba(196,163,90,0.4)",
            }}
          >
            {walkUpTip}
          </div>
        </WorldHtml>
      ) : null}
    </group>
  );
}
