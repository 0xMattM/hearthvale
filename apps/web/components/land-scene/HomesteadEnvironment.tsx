"use client";

import "@/components/land-scene/kit-box-geometry";
import { useEffect, useRef } from "react";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import {
  VISIT_HOST_NAMEPLATE,
  emptyHomesteadMeadowLandmarkCue,
  emptyHomesteadMeadowLandmarkEmissiveIntensity,
  emptyHomesteadMeadowLandmarkHazeOpacity,
  emptyHomesteadMeadowLandmarkPulseEnvelope,
  homesteadFenceLandmarkCue,
  homesteadFenceLandmarkEmissiveIntensity,
  homesteadFenceLandmarkHazeOpacity,
  homesteadFenceLandmarkPulseEnvelope,
  homesteadFenceAtmosphereCue,
  homesteadFenceAtmosphereEmissiveIntensity,
  homesteadFenceAtmosphereHazeOpacity,
  homesteadFenceAtmospherePulseEnvelope,
  homesteadFenceMaterials,
  homesteadYardFloorColors,
  livedHomesteadAtmosphereCue,
  livedHomesteadAtmosphereEmissiveIntensity,
  livedHomesteadAtmosphereHazeOpacity,
  livedHomesteadAtmospherePulseEnvelope,
  shouldShowVisitHostNameplate,
  visitHostNameplateEmissiveIntensity,
  visitHostNameplateLabel,
  visitHostNameplatePadOpacity,
  visitHostNameplateReinforceEnvelope,
  visitLandAtmosphereCue,
  visitLandAtmosphereEmissiveIntensity,
  visitLandAtmosphereHazeOpacity,
  visitLandAtmospherePulseEnvelope,
  PLAYER_LAND_GATE,
  HOMESTEAD_YARD,
  homesteadYardLayout,
  type HomesteadYardAtmosphereMode,
  type HomesteadYardPresence,
} from "@game/shared";
import { HomesteadFenceRun, HomesteadYardTree, HomesteadYardGate } from "@/components/land-scene/HomesteadEnvKits";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";

/**
 * Player land environment — small private yard (CityLands `player_land`).
 * Open grass yard: no starter shed or wooden path. Layout editor is hotkey P.
 */
export function HomesteadEnvironment({
  atmosphereMode = "empty",
  presence = "home",
  visitHostUsername = null,
  visitHostNameplateReinforce = false,
  gateHighlighted = false,
  yardHalf = HOMESTEAD_YARD.starterHalf,
}: {
  atmosphereMode?: HomesteadYardAtmosphereMode;
  /** PL51.2 — cool visit vs warm home; visit rules unchanged. */
  presence?: HomesteadYardPresence;
  /** PL119.2 — host username for soft world nameplate while visiting. */
  visitHostUsername?: string | null;
  /** PL119.2 — brief pad/border reinforce on successful visit arrive. */
  visitHostNameplateReinforce?: boolean;
  /** Yard-exit gate is the current interact target. */
  gateHighlighted?: boolean;
  /** Walk half-extent (starter 7.2; NFT small is larger). */
  yardHalf?: number;
} = {}) {
  const floors = homesteadYardFloorColors(atmosphereMode, presence);
  const fenceMat = homesteadFenceMaterials();
  // Reason: PL175.2 — quiet pulsing cool mist leftover while visiting.
  const visitAtmosphere = visitLandAtmosphereCue(presence);
  // Reason: PL181.1 — quiet pulsing warm hearth mist while lived at home (≠ visit).
  const livedAtmosphere = livedHomesteadAtmosphereCue(atmosphereMode, presence);
  // Reason: PL176.2 — HomesteadEnvironment only mounts on player land.
  const fenceLandmark = homesteadFenceLandmarkCue("player_land");
  // Reason: PL201.2 — quiet cool boundary mist leftover over fence corners.
  const fenceAtmosphere = homesteadFenceAtmosphereCue("player_land");
  // Reason: PL178.2 — warm empty-meadow landmark only before first station.
  const meadowLandmark = emptyHomesteadMeadowLandmarkCue(atmosphereMode);
  const fenceCapMatRefs = useRef<Array<MeshStandardMaterial | null>>([]);
  const fenceHazeMatRefs = useRef<Array<MeshStandardMaterial | null>>([]);
  const fenceAtmosphereMatRefs = useRef<Array<MeshStandardMaterial | null>>([]);
  const hostPadMatRef = useRef<MeshStandardMaterial>(null);
  const visitMistMatRef = useRef<MeshStandardMaterial>(null);
  const livedMistMatRef = useRef<MeshStandardMaterial>(null);
  const meadowMatRef = useRef<MeshStandardMaterial>(null);
  const meadowMistMatRef = useRef<MeshStandardMaterial>(null);
  const reinforceStartRef = useRef<number | null>(null);

  const hostLabel =
    presence === "visit"
      ? visitHostNameplateLabel(visitHostUsername)
      : null;
  const showHostNameplate =
    presence === "visit" &&
    shouldShowVisitHostNameplate(true, visitHostUsername);
  const nameBorder = visitHostNameplateReinforce
    ? VISIT_HOST_NAMEPLATE.nameBorderReinforce
    : VISIT_HOST_NAMEPLATE.nameBorder;

  useEffect(() => {
    if (visitHostNameplateReinforce && showHostNameplate) {
      reinforceStartRef.current = performance.now();
    } else if (!visitHostNameplateReinforce) {
      reinforceStartRef.current = null;
    }
  }, [visitHostNameplateReinforce, showHostNameplate]);

  useFrame(() => {
    const now = performance.now();

    // Reason: PL175.2 — quiet pulsing cool mist leftover over PL51.2 static haze.
    if (visitAtmosphere.show) {
      const mistEnv = visitLandAtmospherePulseEnvelope(now);
      const mistMat = visitMistMatRef.current;
      if (mistMat) {
        mistMat.opacity = visitLandAtmosphereHazeOpacity(mistEnv);
        mistMat.emissiveIntensity =
          visitLandAtmosphereEmissiveIntensity(mistEnv);
      }
    }

    // Reason: PL181.1 — quiet pulsing warm hearth mist while lived at home.
    if (livedAtmosphere.show) {
      const mistEnv = livedHomesteadAtmospherePulseEnvelope(now);
      const mistMat = livedMistMatRef.current;
      if (mistMat) {
        mistMat.opacity = livedHomesteadAtmosphereHazeOpacity(mistEnv);
        mistMat.emissiveIntensity =
          livedHomesteadAtmosphereEmissiveIntensity(mistEnv);
      }
    }

    // Reason: PL176.2 — quiet cool fence-post landmark pulse on caps + corner haze.
    if (fenceLandmark.show) {
      const fenceEnv = homesteadFenceLandmarkPulseEnvelope(now);
      const fenceIntensity = homesteadFenceLandmarkEmissiveIntensity(fenceEnv);
      const fenceHazeOpacity = homesteadFenceLandmarkHazeOpacity(fenceEnv);
      for (const mat of fenceCapMatRefs.current) {
        if (mat) mat.emissiveIntensity = fenceIntensity;
      }
      for (const mat of fenceHazeMatRefs.current) {
        if (mat) mat.opacity = fenceHazeOpacity;
      }
    }

    // Reason: PL201.2 — quiet cool boundary mist leftover over fence corners.
    if (fenceAtmosphere.show) {
      const mistEnv = homesteadFenceAtmospherePulseEnvelope(now);
      const mistIntensity = homesteadFenceAtmosphereEmissiveIntensity(mistEnv);
      const mistOpacity = homesteadFenceAtmosphereHazeOpacity(mistEnv);
      for (const mat of fenceAtmosphereMatRefs.current) {
        if (mat) {
          mat.opacity = mistOpacity;
          mat.emissiveIntensity = mistIntensity;
        }
      }
    }

    // Reason: PL178.2 — mist owns the cue; never pulse emissive on the grass plane.
    if (meadowLandmark.show) {
      const meadowEnv = emptyHomesteadMeadowLandmarkPulseEnvelope(now);
      const meadowMist = meadowMistMatRef.current;
      if (meadowMist) {
        meadowMist.opacity = emptyHomesteadMeadowLandmarkHazeOpacity(meadowEnv);
        meadowMist.emissiveIntensity =
          emptyHomesteadMeadowLandmarkEmissiveIntensity(meadowEnv);
      }
    }

    // Reason: PL119.2 — soft pad decay on arrive; steady visit keeps quiet base.
    if (!showHostNameplate) return;
    const started = reinforceStartRef.current;
    const elapsed =
      started != null ? performance.now() - started : Number.POSITIVE_INFINITY;
    const reinforceEnv = visitHostNameplateReinforceEnvelope(elapsed);
    const padMat = hostPadMatRef.current;
    if (padMat) {
      padMat.opacity = visitHostNameplatePadOpacity(reinforceEnv);
      padMat.emissiveIntensity =
        visitHostNameplateEmissiveIntensity(reinforceEnv);
    }
  });

  const yard = homesteadYardLayout(yardHalf);
  const { fence, gateZ, farFenceZ, sideLength, farRailLength } = yard;
  const meadowW = Math.max(48, fence * 4);
  const meadowD = Math.max(40, fence * 3.4);

  const fencePosts: Array<[number, number]> = [];
  for (let x = -fence; x <= fence; x += 2) {
    fencePosts.push([x, farFenceZ]);
    // Reason: yard gate owns the camera-near opening (skip posts at x=-2,0,2).
    if (Math.abs(x) <= PLAYER_LAND_GATE.postOffsetX + 0.6) continue;
    fencePosts.push([x, gateZ]);
  }
  const sideInner = Math.max(2, fence - 3);
  for (let z = -sideInner; z <= sideInner; z += 2) {
    fencePosts.push([-fence, z]);
    fencePosts.push([fence, z]);
  }

  return (
    <group>
      {/* One continuous matte grass field — no nested plot rectangles / transparent aprons */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.12, 0]}
        userData={{ emptyHomesteadMeadowLandmark: meadowLandmark.show }}
      >
        <planeGeometry args={[meadowW, meadowD]} />
        <TexturedStandardMaterial
          ref={meadowMatRef}
          kind="grass"
          color={floors.meadowColor}
          flatFloor
          emissive="#000000"
          emissiveIntensity={0}
          metalness={0}
          repeat={10}
        />
      </mesh>

      {/* PL178.2 — soft pulsing warm empty-meadow mist leftover over outer meadow */}
      {meadowLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, meadowLandmark.hazeY, 0]}
          userData={{ emptyHomesteadMeadowAtmosphere: true }}
        >
          <planeGeometry
            args={[meadowLandmark.hazeWidth, meadowLandmark.hazeDepth]}
          />
          <meshStandardMaterial
            ref={meadowMistMatRef}
            color={meadowLandmark.hazeColor}
            emissive={meadowLandmark.emissive}
            emissiveIntensity={meadowLandmark.intensity}
            transparent
            opacity={meadowLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* PL181.1 — soft pulsing warm lived hearth mist leftover over plot (home only) */}
      {livedAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, livedAtmosphere.hazeY, 0]}
          userData={{ livedHomesteadAtmosphere: true }}
        >
          <planeGeometry
            args={[livedAtmosphere.hazeWidth, livedAtmosphere.hazeDepth]}
          />
          <meshStandardMaterial
            ref={livedMistMatRef}
            color={livedAtmosphere.hazeColor}
            emissive={livedAtmosphere.emissive}
            emissiveIntensity={livedAtmosphere.intensity}
            transparent
            opacity={livedAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* Soft cool visit haze (PL51.2) — atmosphere only; no HUD */}
      {floors.hazeColor ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.32, 0]}>
          <planeGeometry args={[meadowW - 2, meadowD - 2]} />
          <meshStandardMaterial
            color={floors.hazeColor}
            transparent
            opacity={floors.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* PL175.2 — soft pulsing cool visit mist leftover over PL51.2 static haze */}
      {visitAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.36, 0]}
          userData={{ visitLandAtmosphere: true }}
        >
          <planeGeometry
            args={[visitAtmosphere.hazeWidth, visitAtmosphere.hazeDepth]}
          />
          <meshStandardMaterial
            ref={visitMistMatRef}
            color={visitAtmosphere.hazeColor}
            emissive={visitAtmosphere.emissive}
            emissiveIntensity={visitAtmosphere.intensity}
            transparent
            opacity={visitAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* PL176.2 — soft cool fence-post landmark haze at yard corners */}
      {fenceLandmark.show
        ? (
            [
              [-fence, farFenceZ],
              [fence, farFenceZ],
              [-fence, gateZ],
              [fence, gateZ],
            ] as Array<[number, number]>
          ).map(([hx, hz], hi) => (
            <mesh
              key={`fence-lm-${hi}`}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[hx, 0.012, hz]}
              userData={{ homesteadFenceLandmark: true }}
            >
              <circleGeometry args={[fenceLandmark.hazeRadius, 16]} />
              <meshStandardMaterial
                ref={(mat) => {
                  fenceHazeMatRefs.current[hi] = mat;
                }}
                color={fenceLandmark.hazeColor}
                emissive={fenceLandmark.emissive}
                emissiveIntensity={0.08}
                transparent
                opacity={fenceLandmark.hazeOpacity}
                depthWrite={false}
              />
            </mesh>
          ))
        : null}

      {/* PL201.2 — quiet cool pulsing boundary mist leftover at yard corners */}
      {fenceAtmosphere.show
        ? (
            [
              [-fence, farFenceZ],
              [fence, farFenceZ],
              [-fence, gateZ],
              [fence, gateZ],
            ] as Array<[number, number]>
          ).map(([hx, hz], hi) => (
            <mesh
              key={`fence-atm-${hi}`}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[hx, fenceAtmosphere.hazeY, hz]}
              userData={{ homesteadFenceAtmosphere: true }}
            >
              <circleGeometry args={[fenceAtmosphere.hazeRadius, 16]} />
              <meshStandardMaterial
                ref={(mat) => {
                  fenceAtmosphereMatRefs.current[hi] = mat;
                }}
                color={fenceAtmosphere.hazeColor}
                emissive={fenceAtmosphere.emissive}
                emissiveIntensity={fenceAtmosphere.intensity}
                transparent
                opacity={fenceAtmosphere.hazeOpacity}
                depthWrite={false}
              />
            </mesh>
          ))
        : null}

      {/* Fence rails + posts (PL114.1 — empty warmer; visit cooler; VA1.3 PBR) */}
      {fencePosts.map(([x, z], i) => (
        <group key={`fp-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <kitBoxGeometry args={[0.14, 1.1, 0.14]} />
            <TexturedStandardMaterial kind="wood" color={floors.fencePostColor}
              roughness={fenceMat.post.roughness}
              metalness={fenceMat.post.metalness} />
          </mesh>
          <mesh position={[0, 1.14, 0]} castShadow>
            <kitBoxGeometry args={[0.18, 0.08, 0.18]} />
            <TexturedStandardMaterial
              ref={(mat) => {
                fenceCapMatRefs.current[i] = mat;
              }}
              kind="wood"
              color={fenceMat.capColor}
              roughness={fenceMat.cap.roughness}
              metalness={fenceMat.cap.metalness}
              emissive={
                fenceLandmark.show ? fenceLandmark.emissive : "#000000"
              }
              emissiveIntensity={
                fenceLandmark.show ? fenceLandmark.intensity : 0
              }
            />
          </mesh>
        </group>
      ))}
      {/* Long rails + quieter mid rail (VA1.3); village GLTF tiles when present */}
      <HomesteadFenceRun
        x={0}
        z={farFenceZ}
        rotY={0}
        length={farRailLength}
        railColor={floors.fenceRailColor}
        midRailColor={fenceMat.midRailColor}
      />
      <HomesteadYardGate
        atmosphereMode={atmosphereMode}
        presence={presence}
        highlighted={gateHighlighted}
        yardHalf={yardHalf}
      />
      <HomesteadFenceRun
        x={-fence}
        z={0}
        rotY={Math.PI / 2}
        length={sideLength}
        railColor={floors.fenceRailColor}
        midRailColor={fenceMat.midRailColor}
      />
      <HomesteadFenceRun
        x={fence}
        z={0}
        rotY={Math.PI / 2}
        length={sideLength}
        railColor={floors.fenceRailColor}
        midRailColor={fenceMat.midRailColor}
      />

      {/* Corner trees — place markers (VA1.3 PBR) */}
      <HomesteadYardTree at={[-yardHalf, farFenceZ + 1.2]} />
      <HomesteadYardTree at={[yardHalf, farFenceZ + 1.2]} />
      <HomesteadYardTree at={[-yardHalf, gateZ - 1.2]} />
      <HomesteadYardTree at={[yardHalf - 0.2, gateZ - 1.5]} />

      {/* Visit host nameplate — yard center, no starter shed. */}
      {showHostNameplate && hostLabel ? (
        <group position={[0, 0, -2]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry
              args={[
                VISIT_HOST_NAMEPLATE.padInner,
                VISIT_HOST_NAMEPLATE.padOuter,
                28,
              ]}
            />
            <meshStandardMaterial
              ref={hostPadMatRef}
              color={VISIT_HOST_NAMEPLATE.padColor}
              emissive={VISIT_HOST_NAMEPLATE.padColor}
              emissiveIntensity={VISIT_HOST_NAMEPLATE.emissiveIntensityBase}
              transparent
              opacity={VISIT_HOST_NAMEPLATE.padOpacityBase}
              depthWrite={false}
            />
          </mesh>
          <WorldHtml
            position={[0, VISIT_HOST_NAMEPLATE.labelY, 0]}
            center
            style={{ pointerEvents: "none" }}
          >
            <div
              data-testid="visit-host-nameplate"
              data-reinforce={visitHostNameplateReinforce ? "1" : "0"}
              style={{
                background: VISIT_HOST_NAMEPLATE.bg,
                color: VISIT_HOST_NAMEPLATE.textColor,
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                border: `1px solid color-mix(in srgb, ${nameBorder} 70%, transparent)`,
                boxShadow: visitHostNameplateReinforce
                  ? `0 0 10px color-mix(in srgb, ${VISIT_HOST_NAMEPLATE.nameBorderReinforce} 45%, transparent)`
                  : "none",
              }}
            >
              {hostLabel}
            </div>
          </WorldHtml>
        </group>
      ) : null}
    </group>
  );
}
