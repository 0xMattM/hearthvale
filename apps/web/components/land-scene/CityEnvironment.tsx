"use client";

import "@/components/land-scene/kit-box-geometry";
import {
  CityDecorBush,
  CityDecorFence,
  CityDecorTree,
  CityMainHall,
  CityCivicHouse,
} from "@/components/land-scene/CityEnvKits";
import { CityDecorExtra } from "@/components/land-scene/CityEnvExtras";
import { CityPlazaFountain } from "@/components/land-scene/CityPlazaFountain";
import { CityRiver } from "@/components/land-scene/CityRiver";
import { CityPerimeterWall } from "@/components/land-scene/CityPerimeterWall";
import {
  RaisedFloorCurb,
  RaisedPathBed,
} from "@/components/land-scene/FloorSeamSoftener";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { VillageGltfProp } from "@/components/land-scene/VillageGltfProp";
import { japanVillageProp } from "@/lib/japan-village";
import { useFrame } from "@react-three/fiber";
import {
  CITY_DEED_DESK_ATMOSPHERE_CUE,
  cityAtmosphereBushes,
  cityAtmosphereExtras,
  cityAtmosphereFences,
  cityAtmosphereMainHall,
  cityAtmosphereTrees,
  cityDeedDeskAtmosphereCue,
  cityDeedDeskAtmosphereEmissiveIntensity,
  cityDeedDeskAtmosphereHazeOpacity,
  cityDeedDeskAtmospherePulseEnvelope,
  cityDeedDeskLandmarkCue,
  cityDeedDeskLandmarkEmissiveIntensity,
  cityDeedDeskLandmarkHazeOpacity,
  cityDeedDeskLandmarkPulseEnvelope,
  cityHubFirstWorldTip,
  cityHubFloorColors,
  cityPlazaAtmosphereCue,
  cityPlazaAtmosphereEmissiveIntensity,
  cityPlazaAtmosphereHazeOpacity,
  cityPlazaAtmospherePulseEnvelope,
  cityScarceStationMarkers,
  cityScarceStationFloorChromeVisible,
  cityScarceYardAtmosphereCue,
  cityScarceYardAtmosphereEmissiveIntensity,
  cityScarceYardAtmosphereHazeOpacity,
  cityScarceYardAtmospherePulseEnvelope,
  cityScarceYardPropMaterials,
  cityScarceYardProps,
  cityTutorLaneAtmosphereCue,
  cityTutorLaneAtmosphereEmissiveIntensity,
  cityTutorLaneAtmosphereHazeOpacity,
  cityTutorLaneAtmospherePulseEnvelope,
  cityTutorLaneLandmarkCue,
  cityTutorLaneLandmarkEmissiveIntensity,
  cityTutorLaneLandmarkHazeOpacity,
  cityTutorLaneLandmarkPulseEnvelope,
  isStationContendedByPresence,
  shouldFlashScarceFreeSettleEdge,
  shouldPulseScarceBusyPeerEdge,
  cityHubFloorKitMaterials,
  cityCivicGrassSurface,
  cityCivicHouses,
  cityPerimeterInnerStoneFloor,
  cityPerimeterOutsideBushes,
  cityPerimeterOutsideGround,
  cityPerimeterOutsideTrees,
  cityPlazaDirtSpurSurface,
  cityPlazaFloorSurface,
  cityPlazaPathSurface,
  cityPlazaQuadrantSlabs,
  cityPlazaSeamInset,
  type CityScarceYardPropKind,
} from "@game/shared";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { useEffect, useRef } from "react";
import type { MeshStandardMaterial } from "three";

export interface CityPresencePeer {
  x: number;
  z: number;
}

/**
 * City hub environment — plaza + City Hall (CL1.3 / CL2.1 / PL1.1).
 * Scarce stations are real buildings on the shared city land.
 * World Free/Busy pad circles + sticky labels removed (clutter); HUD rims stay.
 * Floating scarce-yard / tutor-lane Html plaques removed (clutter).
 * Placeholder brick-pack civic houses around the hub are gone.
 * Margin clay houses (hall kit, smaller, tinted) sit inside the wall.
 * PL57.1: one-shot soft world tip on first City presence (complements sticky city_hub).
 * Plaza fountain is a hollow stone basin + water (no stone glow / haze disc).
 * PL129.1: quiet cooler emissive + haze on existing tutor-lane strip (vs warm scarce yard).
 * PL165.1: quiet cool system-slate haze/emissive on civic atmosphere deed desk (B path; no BuildingType).
 * PL199.1: quiet pulsing cool civic mist leftover over existing deed desk (≠ landmark disc).
 * PL166.1: optional HUD rim notify on free→busy (same gate as pad peer pulse).
 * PL177.2: quiet pulsing warm scarce-yard mist leftover over the shared yard floor.
 * PL182.1: quiet pulsing cool plaza mist leftover over the stone plaza floor.
 * PL185.1: quiet pulsing cool tutor-lane mist leftover over the existing strip.
 * VA1.2: scarce yard atmosphere props (crate/barrel/post/rope/stone) — not stations.
 * VA4.1: hub floor planes get shared PBR + plaza/scarce curb lips (CITY_HUB_VISUAL hexes stay).
 */
export function CityEnvironment({
  others = [],
  firstHubTip = false,
  onScarceFreeSettle,
  onScarceBusyEdge,
}: {
  others?: ReadonlyArray<CityPresencePeer>;
  /** PL57.1 — brief soft world tip on first City hub presence. */
  firstHubTip?: boolean;
  /** PL165.2 — notify HUD when a scarce pad edges busy→Free (contention unchanged). */
  onScarceFreeSettle?: () => void;
  /** PL166.1 — notify HUD when a scarce pad edges free→busy (contention unchanged). */
  onScarceBusyEdge?: () => void;
} = {}) {
  const scarce = cityScarceStationMarkers();
  const yardProps = cityScarceYardProps();
  const decorTrees = cityAtmosphereTrees();
  const decorBushes = cityAtmosphereBushes();
  const decorFences = cityAtmosphereFences();
  const decorExtras = cityAtmosphereExtras();
  const mainHall = cityAtmosphereMainHall();
  const floors = cityHubFloorColors();
  const floorKit = cityHubFloorKitMaterials();
  const innerStone = cityPerimeterInnerStoneFloor();
  const outerGround = cityPerimeterOutsideGround();
  const outerTrees = cityPerimeterOutsideTrees();
  const outerBushes = cityPerimeterOutsideBushes();
  const plazaPath = cityPlazaPathSurface();
  const plazaFloor = cityPlazaFloorSurface();
  const civicGrass = cityCivicGrassSurface();
  const dirtSpurs = cityPlazaDirtSpurSurface();
  const civicHouses = cityCivicHouses();
  const plazaSeam = cityPlazaSeamInset(civicGrass);
  const plazaFieldSlabs = cityPlazaQuadrantSlabs(
    civicGrass.plazaWidth,
    civicGrass.plazaDepth,
    plazaSeam,
  );
  const plazaInlaySlabs = cityPlazaQuadrantSlabs(
    civicGrass.inlaySize,
    civicGrass.inlaySize,
    plazaSeam,
  );
  const walkUpTip = cityHubFirstWorldTip();
  const tutorLane = cityTutorLaneLandmarkCue();
  const deedDesk = cityDeedDeskLandmarkCue("city");
  // Reason: PL199.1 — quiet cool civic mist leftover over deed desk (≠ landmark).
  const deedDeskAtmosphere = cityDeedDeskAtmosphereCue("city");
  // Reason: PL177.2 — CityEnvironment only mounts on City map.
  const yardAtmosphere = cityScarceYardAtmosphereCue("city");
  // Reason: PL182.1 — quiet pulsing cool plaza mist leftover over stone floor.
  const plazaAtmosphere = cityPlazaAtmosphereCue("city");
  // Reason: PL185.1 — quiet pulsing cool tutor-lane mist leftover over strip.
  const tutorLaneAtmosphere = cityTutorLaneAtmosphereCue("city");
  const yardMistMatRef = useRef<MeshStandardMaterial>(null);
  const plazaMistMatRef = useRef<MeshStandardMaterial>(null);
  const tutorLaneMistMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const now = performance.now();
    if (yardAtmosphere.show) {
      const mistEnv = cityScarceYardAtmospherePulseEnvelope(now);
      const mistMat = yardMistMatRef.current;
      if (mistMat) {
        mistMat.opacity = cityScarceYardAtmosphereHazeOpacity(mistEnv);
        mistMat.emissiveIntensity =
          cityScarceYardAtmosphereEmissiveIntensity(mistEnv);
      }
    }
    // Reason: PL182.1 — quiet pulsing cool plaza mist while on City.
    if (plazaAtmosphere.show) {
      const plazaEnv = cityPlazaAtmospherePulseEnvelope(now);
      const plazaMat = plazaMistMatRef.current;
      if (plazaMat) {
        plazaMat.opacity = cityPlazaAtmosphereHazeOpacity(plazaEnv);
        plazaMat.emissiveIntensity =
          cityPlazaAtmosphereEmissiveIntensity(plazaEnv);
      }
    }
    // Reason: PL185.1 — quiet pulsing cool tutor-lane mist while on City.
    if (tutorLaneAtmosphere.show) {
      const laneEnv = cityTutorLaneAtmospherePulseEnvelope(now);
      const laneMat = tutorLaneMistMatRef.current;
      if (laneMat) {
        laneMat.opacity = cityTutorLaneAtmosphereHazeOpacity(laneEnv);
        laneMat.emissiveIntensity =
          cityTutorLaneAtmosphereEmissiveIntensity(laneEnv);
      }
    }
  });

  return (
    <group>
      {/* Countryside beyond the walls — grass + dirt, not civic stone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[outerGround.x, outerGround.y, outerGround.z]}
        receiveShadow
      >
        <planeGeometry args={[outerGround.width, outerGround.depth]} />
        <TexturedStandardMaterial
          kind={outerGround.grassKind}
          color={outerGround.grassColor}
          flatFloor
          metalness={0}
          repeat={outerGround.grassRepeat}
        />
      </mesh>
      {outerGround.dirtPatches.map((pad) => (
        <mesh
          key={`outer-dirt-${pad.x}-${pad.z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[pad.x, outerGround.dirtY, pad.z]}
          receiveShadow
        >
          <circleGeometry args={[pad.radius, 14]} />
          <TexturedStandardMaterial
            kind={outerGround.dirtKind}
            color={outerGround.dirtColor}
            flatFloor
            metalness={0}
            repeat={3}
          />
        </mesh>
      ))}
      {/* Inner streets stay inside the wall box (PL36.1); VA4.1 + procedural grain */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[innerStone.x, innerStone.y, innerStone.z]}
        receiveShadow
      >
        <planeGeometry args={[innerStone.width, innerStone.depth]} />
        <TexturedStandardMaterial
          kind="stone"
          color={floors.streetsColor}
          flatFloor
          metalness={0}
          repeat={10}
        />
      </mesh>
      <CityRiver />
      <CityPerimeterWall />

      {/* Plaza sits proud of streets; raised curb = real edge (no transparent apron) */}
      <RaisedFloorCurb
        width={32}
        depth={28}
        y={-0.14}
        color={floorKit.curbColor}
        kind="stone"
        curbW={0.32}
        curbH={0.11}
      />
      {/* Plaza lawn underlay — shows in the path-side grass seams */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, civicGrass.underlayY, 0]}
        receiveShadow
      >
        <planeGeometry args={[civicGrass.plazaWidth, civicGrass.plazaDepth]} />
        <TexturedStandardMaterial
          kind={civicGrass.kind}
          color={civicGrass.color}
          flatFloor
          metalness={0}
          repeat={civicGrass.repeat}
        />
      </mesh>
      {/* Plaza field — four flagstone quadrants with grass seams at the cross */}
      {plazaFieldSlabs.map((slab) => (
        <mesh
          key={`plaza-field-${slab.x}-${slab.z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[slab.x, plazaFloor.fieldY, slab.z]}
          receiveShadow
        >
          <planeGeometry args={[slab.width, slab.depth]} />
          <TexturedStandardMaterial
            kind={plazaFloor.fieldKind}
            color={floors.plazaColor}
            flatFloor
            metalness={0}
            repeat={plazaFloor.fieldRepeat}
          />
        </mesh>
      ))}
      {/* PL182.1 — soft pulsing cool plaza mist leftover over stone plaza floor */}
      {plazaAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            plazaAtmosphere.plazaCenterX,
            plazaAtmosphere.hazeY,
            plazaAtmosphere.plazaCenterZ,
          ]}
          userData={{ cityPlazaAtmosphere: true }}
        >
          <planeGeometry
            args={[plazaAtmosphere.hazeWidth, plazaAtmosphere.hazeDepth]}
          />
          <meshStandardMaterial
            ref={plazaMistMatRef}
            color={plazaAtmosphere.hazeColor}
            emissive={plazaAtmosphere.emissive}
            emissiveIntensity={plazaAtmosphere.intensity}
            transparent
            opacity={plazaAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* Raised curb around plaza — replaces flat lip planes */}
      {/* (streets→plaza curb already above) */}

      {/* Scarce yard — civic lawn (brown yard hex stays on contrast cues) */}
      <RaisedFloorCurb
        width={52}
        depth={30}
        y={-0.1}
        x={0}
        z={6.6}
        color={floorKit.scarceCurbColor}
        kind="dirt"
        curbW={0.3}
        curbH={0.1}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.068, 6.6]} receiveShadow>
        <planeGeometry args={[52, 30]} />
        <TexturedStandardMaterial
          kind={civicGrass.kind}
          color={civicGrass.color}
          flatFloor
          metalness={0}
          repeat={civicGrass.repeat}
        />
      </mesh>
      {civicGrass.dirtPatches.map((pad) => (
        <mesh
          key={`civic-dirt-${pad.x}-${pad.z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[pad.x, civicGrass.dirtY, pad.z]}
          receiveShadow
        >
          <circleGeometry args={[pad.radius, 14]} />
          <TexturedStandardMaterial
            kind={civicGrass.dirtKind}
            color={civicGrass.dirtColor}
            flatFloor
            metalness={0}
            repeat={3}
          />
        </mesh>
      ))}

      {/* PL177.2 — soft pulsing warm scarce-yard mist leftover over shared yard floor */}
      {yardAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            yardAtmosphere.yardCenterX,
            yardAtmosphere.hazeY,
            yardAtmosphere.yardCenterZ,
          ]}
          userData={{ cityScarceYardAtmosphere: true }}
        >
          <planeGeometry
            args={[yardAtmosphere.hazeWidth, yardAtmosphere.hazeDepth]}
          />
          <meshStandardMaterial
            ref={yardMistMatRef}
            color={yardAtmosphere.hazeColor}
            emissive={yardAtmosphere.emissive}
            emissiveIntensity={yardAtmosphere.intensity}
            transparent
            opacity={yardAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* VA1.2 — scarce yard atmosphere props (off pads; not contendable) */}
      {yardProps.map((p, i) => (
        <ScarceYardProp
          key={`yard-prop-${p.kind}-${i}`}
          kind={p.kind}
          x={p.x}
          z={p.z}
          rotY={p.rotY}
        />
      ))}

      {/* Atmosphere decor — fences / trees / bushes / main hall (not stations) */}
      {decorTrees.map((t, i) => (
        <CityDecorTree
          key={`city-tree-${i}`}
          x={t.x}
          z={t.z}
          scale={t.scale}
        />
      ))}
      {decorBushes.map((b, i) => (
        <CityDecorBush
          key={`city-bush-${i}`}
          x={b.x}
          z={b.z}
          scale={b.scale}
        />
      ))}
      {outerTrees.map((t, i) => (
        <CityDecorTree
          key={`city-outer-tree-${i}`}
          x={t.x}
          z={t.z}
          scale={t.scale}
        />
      ))}
      {outerBushes.map((b, i) => (
        <CityDecorBush
          key={`city-outer-bush-${i}`}
          x={b.x}
          z={b.z}
          scale={b.scale}
        />
      ))}
      {decorFences.map((f, i) => (
        <CityDecorFence
          key={`city-fence-${i}`}
          x={f.x}
          z={f.z}
          rotY={f.rotY}
          length={f.length}
        />
      ))}
      {decorExtras.map((e, i) => (
        <CityDecorExtra
          key={`city-extra-${e.kind}-${i}`}
          kind={e.kind}
          x={e.x}
          z={e.z}
          rotY={e.rotY}
          scale={e.scale}
        />
      ))}
      <CityMainHall {...mainHall} />
      {civicHouses.map((house) => (
        <CityCivicHouse key={house.id} {...house} />
      ))}

      {/* Tutor lane strip — only with floor chrome (full-yard overlay fought dirt/grass) */}
      {cityScarceStationFloorChromeVisible() ? (
        <TutorLaneLandmark landmark={tutorLane} />
      ) : null}
      {/* PL185.1 — soft pulsing cool tutor-lane mist leftover over existing strip */}
      {tutorLaneAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            tutorLaneAtmosphere.laneCenterX,
            tutorLaneAtmosphere.hazeY,
            tutorLaneAtmosphere.laneCenterZ,
          ]}
          userData={{ cityTutorLaneAtmosphere: true }}
        >
          <planeGeometry
            args={[
              tutorLaneAtmosphere.hazeWidth,
              tutorLaneAtmosphere.hazeDepth,
            ]}
          />
          <meshStandardMaterial
            ref={tutorLaneMistMatRef}
            color={tutorLaneAtmosphere.hazeColor}
            emissive={tutorLaneAtmosphere.emissive}
            emissiveIntensity={tutorLaneAtmosphere.intensity}
            transparent
            opacity={tutorLaneAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* Inner court — four flagstone pads so grass seams reach the fountain walks */}
      <RaisedFloorCurb
        width={12}
        depth={12}
        y={-0.1}
        color={floorKit.curbColor}
        kind="stone"
        curbW={0.24}
        curbH={0.08}
      />
      {plazaInlaySlabs.map((slab) => (
        <mesh
          key={`plaza-inlay-${slab.x}-${slab.z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[slab.x, -0.048, slab.z]}
          receiveShadow
        >
          <planeGeometry args={[slab.width, slab.depth]} />
          <TexturedStandardMaterial
            kind={plazaFloor.inlayKind}
            color={plazaFloor.inlayColor}
            flatFloor
            metalness={0}
            repeat={plazaFloor.inlayRepeat}
          />
        </mesh>
      ))}
      {plazaFloor.wearPads.map((pad) => (
        <mesh
          key={`plaza-wear-${pad.x}-${pad.z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[pad.x, plazaFloor.wearY, pad.z]}
          receiveShadow
        >
          <circleGeometry args={[pad.radius, 16]} />
          <TexturedStandardMaterial
            kind={plazaFloor.wearKind}
            color={plazaFloor.wearColor}
            flatFloor
            metalness={0}
            repeat={3.2}
          />
        </mesh>
      ))}

      {/* Fountain court — worn flagstones + cobble ring in the path-cross hole */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, plazaFloor.courtY, 0]}
        receiveShadow
      >
        <circleGeometry args={[plazaFloor.courtRadius, 28]} />
        <TexturedStandardMaterial
          kind={plazaFloor.courtKind}
          color={plazaFloor.courtColor}
          flatFloor
          metalness={0}
          repeat={plazaFloor.courtRepeat}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, plazaFloor.courtY + 0.001, 0]}
        receiveShadow
      >
        <ringGeometry
          args={[plazaFloor.courtRingInner, plazaFloor.courtRingOuter, 28]}
        />
        <TexturedStandardMaterial
          kind={plazaFloor.courtRingKind}
          color={plazaFloor.courtRingColor}
          flatFloor
          metalness={0}
          repeat={4}
        />
      </mesh>

      {/* Paved cobble walks — darker grain than the flagstone field, not wood */}
      <RaisedPathBed
        length={plazaPath.cobbleLength}
        pathWidth={plazaPath.cobbleWidth}
        y={-0.032}
        along="z"
        bedColor={floors.roadColor}
        lipColor={floorKit.curbColor}
        bedKind={plazaPath.bedKind}
        lipKind={plazaPath.lipKind}
        lipW={0.12}
        crossClear={3.4}
      />
      <RaisedPathBed
        length={plazaPath.cobbleLength}
        pathWidth={plazaPath.cobbleWidth}
        y={-0.016}
        along="x"
        bedColor={floors.roadColor}
        lipColor={floorKit.curbColor}
        bedKind={plazaPath.bedKind}
        lipKind={plazaPath.lipKind}
        lipW={0.12}
        crossClear={3.4}
      />
      {/* Packed-earth caminitos — continue the fountain cross onto the lawn */}
      {dirtSpurs.spurs.map((spur) => (
        <RaisedPathBed
          key={`dirt-spur-${spur.along}-${spur.x}-${spur.z}`}
          length={spur.length}
          pathWidth={spur.pathWidth}
          y={spur.y}
          x={spur.x}
          z={spur.z}
          along={spur.along}
          bedColor={dirtSpurs.color}
          lipColor={dirtSpurs.color}
          bedKind={dirtSpurs.bedKind}
          lipKind={dirtSpurs.lipKind}
          lipW={dirtSpurs.lipW}
        />
      ))}

      {/* Civic atmosphere deed desk — soft landmark pulse (PL165.1); B opens DeedPanel */}
      {deedDesk.show ? (
        <DeedDeskLandmark
          landmark={deedDesk}
          atmosphere={deedDeskAtmosphere}
        />
      ) : null}

      {/* Plaza fountain — stone basin + water; no landmark glow disc */}
      <CityPlazaFountain />

      {/* PL57.1 — one-shot soft tip near plaza fountain; dismisses with TopBar cue */}
      {firstHubTip ? (
        <WorldHtml
          position={[0, 2.4, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            data-testid="city-hub-walkup-tip"
            style={{
              background: "rgba(14, 16, 20, 0.88)",
              color: "#e8eef4",
              padding: "4px 10px",
              borderRadius: 5,
              border: `1px solid ${floors.scarceYardColor}`,
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

      {scarce.map((m) => {
        const busy = isStationContendedByPresence(m.x, m.z, others);
        return (
          <ScarceStationPadWatcher
            key={`scarce-${m.slotIndex}`}
            busy={busy}
            onFreeSettle={onScarceFreeSettle}
            onBusyEdge={onScarceBusyEdge}
          />
        );
      })}

      {/* PL1.1 wayfinding Html plaques removed (clutter). */}
    </group>
  );
}

/**
 * Scarce yard atmosphere prop (VA1.2) — crate / barrel / post / rope / stone.
 * Not a station; no Busy/Free pads; layouts / contention unchanged.
 */
function ScarceYardProp({
  kind,
  x,
  z,
  rotY,
}: {
  kind: CityScarceYardPropKind;
  x: number;
  z: number;
  rotY: number;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {kind === "crate" ? <ScarceYardCrate /> : null}
      {kind === "barrel" ? <ScarceYardBarrel /> : null}
      {kind === "post" ? <ScarceYardPost /> : null}
      {kind === "rope" ? <ScarceYardRope /> : null}
      {kind === "stone" ? <ScarceYardStone /> : null}
    </group>
  );
}

function ScarceYardCrate() {
  const mat = cityScarceYardPropMaterials("crate");
  return (
    <VillageGltfProp
      model={japanVillageProp("crate")}
      kit={
        <>
          <mesh position={[0, 0.28, 0]} castShadow>
            <kitBoxGeometry args={[0.55, 0.5, 0.45]} />
            <TexturedStandardMaterial kind="dirt" color={mat.color}
              roughness={mat.body.roughness}
              metalness={mat.body.metalness} />
          </mesh>
          <mesh position={[0, 0.28, 0.24]}>
            <kitBoxGeometry args={[0.52, 0.06, 0.04]} />
            <TexturedStandardMaterial kind="wood" color={mat.bandColor}
              roughness={mat.body.roughness}
              metalness={mat.body.metalness} />
          </mesh>
        </>
      }
    />
  );
}

function ScarceYardBarrel() {
  const mat = cityScarceYardPropMaterials("barrel");
  return (
    <VillageGltfProp
      model={japanVillageProp("barrel")}
      kit={
        <>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.3, 0.65, 10]} />
            <TexturedStandardMaterial kind="dirt" color={mat.color}
              roughness={mat.body.roughness}
              metalness={mat.body.metalness} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.31, 0.31, 0.05, 10]} />
            <TexturedStandardMaterial kind="metal" color={mat.bandColor}
              roughness={0.55}
              metalness={0.35} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 10]} />
            <TexturedStandardMaterial kind="metal" color={mat.bandColor}
              roughness={0.55}
              metalness={0.35} />
          </mesh>
        </>
      }
    />
  );
}

function ScarceYardPost() {
  const mat = cityScarceYardPropMaterials("post");
  return (
    <>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 1.1, 6]} />
        <TexturedStandardMaterial kind="metal" color={mat.color}
          roughness={mat.body.roughness}
          metalness={mat.body.metalness} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.08, 6]} />
        <TexturedStandardMaterial kind="plaster" color={mat.tipColor}
          roughness={mat.body.roughness}
          metalness={mat.body.metalness} />
      </mesh>
    </>
  );
}

function ScarceYardRope() {
  const mat = cityScarceYardPropMaterials("rope");
  return (
    <mesh position={[0, 0.12, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.22, 0.07, 6, 14]} />
      <TexturedStandardMaterial kind="dirt" color={mat.color}
        roughness={mat.body.roughness}
        metalness={mat.body.metalness} />
    </mesh>
  );
}

function ScarceYardStone() {
  const mat = cityScarceYardPropMaterials("stone");
  return (
    <>
      <mesh position={[0, 0.18, 0]} castShadow>
        <kitBoxGeometry args={[0.5, 0.32, 0.4]} />
        <TexturedStandardMaterial kind="dirt" color={mat.color}
          roughness={mat.body.roughness}
          metalness={mat.body.metalness} />
      </mesh>
      <mesh position={[0.08, 0.28, 0.05]}>
        <kitBoxGeometry args={[0.22, 0.08, 0.18]} />
        <TexturedStandardMaterial kind="plaster" color={mat.mossColor}
          roughness={0.95}
          metalness={0.01} />
      </mesh>
    </>
  );
}

/**
 * Soft cooler emissive + haze on the existing tutor-lane strip (PL129.1).
 * Tutorials read apart from warm scarce yards; complements the plaza fountain.
 */
function TutorLaneLandmark({
  landmark,
}: {
  landmark: ReturnType<typeof cityTutorLaneLandmarkCue>;
}) {
  const stripMatRef = useRef<MeshStandardMaterial | null>(null);
  const hazeMatRef = useRef<MeshStandardMaterial | null>(null);

  useFrame(() => {
    const envelope = cityTutorLaneLandmarkPulseEnvelope(performance.now());
    const intensity = cityTutorLaneLandmarkEmissiveIntensity(envelope);
    const hazeOpacity = cityTutorLaneLandmarkHazeOpacity(envelope);
    if (stripMatRef.current) stripMatRef.current.emissiveIntensity = intensity;
    if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
  });

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[landmark.stripX, landmark.stripY, landmark.stripZ]}
        receiveShadow
      >
        <planeGeometry args={[landmark.stripWidth, landmark.stripDepth]} />
        <TexturedStandardMaterial
          kind="plaster"
          ref={stripMatRef}
          color={landmark.stripColor}
          emissive={landmark.emissive}
          emissiveIntensity={landmark.intensity}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[landmark.stripX, landmark.stripY + 0.02, landmark.stripZ]}
      >
        <planeGeometry args={[landmark.hazeWidth, landmark.hazeDepth]} />
        <meshStandardMaterial
          ref={hazeMatRef}
          color={landmark.hazeColor}
          emissive={landmark.emissive}
          emissiveIntensity={0.1}
          transparent
          opacity={landmark.hazeOpacity}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Soft cool system-slate haze/emissive on a civic atmosphere deed desk (PL165.1).
 * Visible hub cue for the B / DeedPanel wallet path — no BuildingType / E interact.
 * Complements open accent PL55.2; no combat / NFT power.
 */
function DeedDeskLandmark({
  landmark,
  atmosphere,
}: {
  landmark: ReturnType<typeof cityDeedDeskLandmarkCue>;
  atmosphere: ReturnType<typeof cityDeedDeskAtmosphereCue>;
}) {
  const topMatRef = useRef<MeshStandardMaterial | null>(null);
  const ledgerMatRef = useRef<MeshStandardMaterial | null>(null);
  const hazeMatRef = useRef<MeshStandardMaterial | null>(null);
  const atmosphereHazeMatRef = useRef<MeshStandardMaterial | null>(null);

  useFrame(() => {
    const now = performance.now();
    const envelope = cityDeedDeskLandmarkPulseEnvelope(now);
    const intensity = cityDeedDeskLandmarkEmissiveIntensity(envelope);
    const hazeOpacity = cityDeedDeskLandmarkHazeOpacity(envelope);
    if (topMatRef.current) topMatRef.current.emissiveIntensity = intensity;
    if (ledgerMatRef.current)
      ledgerMatRef.current.emissiveIntensity = intensity * 1.2;
    if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    // Reason: PL199.1 — continuous civic mist leftover (distinct from landmark).
    if (atmosphere.show && atmosphereHazeMatRef.current) {
      const mistEnv = cityDeedDeskAtmospherePulseEnvelope(now);
      atmosphereHazeMatRef.current.opacity =
        cityDeedDeskAtmosphereHazeOpacity(mistEnv);
      atmosphereHazeMatRef.current.emissiveIntensity =
        cityDeedDeskAtmosphereEmissiveIntensity(mistEnv);
    }
  });

  const { deskX, deskY, deskZ } = landmark;

  return (
    <group position={[deskX, deskY, deskZ]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        userData={{ cityDeedDeskLandmark: true }}
      >
        <circleGeometry args={[landmark.hazeRadius, 22]} />
        <meshStandardMaterial
          ref={hazeMatRef}
          color={landmark.hazeColor}
          emissive={landmark.emissive}
          emissiveIntensity={0.1}
          transparent
          opacity={landmark.hazeOpacity}
          depthWrite={false}
        />
      </mesh>
      {/* PL199.1 — soft pulsing cool civic mist leftover over deed desk */}
      {atmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, CITY_DEED_DESK_ATMOSPHERE_CUE.hazeY, 0]}
          userData={{ cityDeedDeskAtmosphere: true }}
        >
          <circleGeometry
            args={[CITY_DEED_DESK_ATMOSPHERE_CUE.hazeRadius, 24]}
          />
          <meshStandardMaterial
            ref={atmosphereHazeMatRef}
            color={CITY_DEED_DESK_ATMOSPHERE_CUE.hazeColor}
            emissive={CITY_DEED_DESK_ATMOSPHERE_CUE.emissive}
            emissiveIntensity={atmosphere.intensity}
            transparent
            opacity={atmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* Four short legs */}
      {(
        [
          [-0.42, -0.28],
          [0.42, -0.28],
          [-0.42, 0.28],
          [0.42, 0.28],
        ] as const
      ).map(([lx, lz], i) => (
        <mesh key={`deed-leg-${i}`} position={[lx, 0.32, lz]} castShadow>
          <kitBoxGeometry args={[0.08, 0.64, 0.08]} />
          <TexturedStandardMaterial kind="plaster" color={landmark.legColor}
            roughness={0.9}
            metalness={0.02} />
        </mesh>
      ))}
      {/* Desk top */}
      <mesh position={[0, 0.66, 0]} castShadow receiveShadow>
        <kitBoxGeometry args={[1.05, 0.08, 0.62]} />
        <TexturedStandardMaterial kind="plaster" ref={topMatRef}
          color={landmark.deskTopColor}
          roughness={0.82}
          metalness={0.04}
          emissive={landmark.emissive}
          emissiveIntensity={landmark.intensity} />
      </mesh>
      {/* Ledger / deed slate on desk — cool system kinship with panel accent */}
      <mesh position={[0.08, 0.72, 0.02]} castShadow rotation={[0, -0.18, 0]}>
        <kitBoxGeometry args={[0.42, 0.02, 0.32]} />
        <TexturedStandardMaterial kind="plaster" ref={ledgerMatRef}
          color={landmark.ledgerColor}
          roughness={0.55}
          metalness={0.08}
          emissive={landmark.emissive}
          emissiveIntensity={landmark.intensity * 1.2} />
      </mesh>
      {/* Ink pot — small silhouette cue */}
      <mesh position={[-0.28, 0.74, -0.12]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.1, 8]} />
        <TexturedStandardMaterial kind="plaster" color="#2a3038"
          roughness={0.45}
          metalness={0.25} />
      </mesh>
      <WorldHtml position={[0, 1.55, 0]} center style={{ pointerEvents: "none" }}>
        <div
          data-testid="city-deed-desk-landmark"
          style={{
            background: "rgba(14, 22, 28, 0.86)",
            color: "#d8e4ec",
            padding: "2px 8px",
            borderRadius: 5,
            border: `1px solid ${landmark.emissive}`,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.02,
            whiteSpace: "nowrap",
          }}
        >
          {landmark.worldLabel}
        </div>
      </WorldHtml>
    </group>
  );
}

/**
 * Headless scarce-station watcher — fires HUD rims on Free/Busy edges.
 * No world pad circles or Free/Busy sticky labels (user-removed clutter).
 */
function ScarceStationPadWatcher({
  busy,
  onFreeSettle,
  onBusyEdge,
}: {
  busy: boolean;
  onFreeSettle?: () => void;
  onBusyEdge?: () => void;
}) {
  const wasBusyRef = useRef(busy);

  useEffect(() => {
    if (shouldPulseScarceBusyPeerEdge(wasBusyRef.current, busy)) {
      onBusyEdge?.();
    }
    if (shouldFlashScarceFreeSettleEdge(wasBusyRef.current, busy)) {
      onFreeSettle?.();
    }
    wasBusyRef.current = busy;
  }, [busy, onFreeSettle, onBusyEdge]);

  return null;
}
