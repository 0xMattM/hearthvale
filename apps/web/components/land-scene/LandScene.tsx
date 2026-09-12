"use client";

import type { BuildingDto, ExpandPadAffordMode, LandKind } from "@game/shared";
import {
  emptyLandBuildBeaconMode,
  homesteadYardAtmosphereMode,
  homesteadYardHalf,
  homesteadYardPresenceFor,
  isPlayerLandStationType,
  nextSlotExpansion,
  shouldShowBuildPlaceSpawnFlash,
  shouldShowExpandFieldPadFlash,
  walkObstaclesForMap,
} from "@game/shared";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from "three";
import "@/components/land-scene/kit-box-geometry";
import { useMemo, useRef } from "react";
import {
  SCENE_CLOCK_INTERVAL_MS,
  useSyncedNow,
} from "@/lib/hud/use-synced-now";
import { BuildingMesh, ExpandPadMesh } from "@/components/land-scene/BuildingMesh";
import { BuildPlaceSpawnFlashPad } from "@/components/land-scene/BuildPlaceSpawnFlashPad";
import { ExpandFieldFlashPad } from "@/components/land-scene/ExpandFieldFlashPad";
import { CameraFollow } from "@/components/land-scene/CameraFollow";
import { PlayerViewProvider } from "@/components/land-scene/PlayerViewContext";
import { CityEnvironment } from "@/components/land-scene/CityEnvironment";
import { ForestEnvironment } from "@/components/land-scene/ForestEnvironment";
import { HomesteadEnvironment } from "@/components/land-scene/HomesteadEnvironment";
import { HomesteadPlaceGrid } from "@/components/land-scene/HomesteadPlaceGrid";
import { HomesteadEditorOverlay } from "@/components/land-scene/HomesteadEditorOverlay";
import { DayNightLighting } from "@/components/land-scene/DayNightLighting";
import { PlayerAvatar } from "@/components/land-scene/PlayerAvatar";
import { RemotePlayerAvatar } from "@/components/land-scene/RemotePlayerAvatar";
import { WarriorEnvironment } from "@/components/land-scene/WarriorEnvironment";
import { GRID } from "@/components/land-scene/landProximity";
import { LAND_SCENE_STACK_CLASS } from "@/lib/hud/world-html-layer";
import {
  sceneAllowsExpandPad,
  sceneTemplateForLandKind,
} from "@/lib/scene-template";

export interface RemotePresence {
  username: string;
  x: number;
  z: number;
}

interface LandSceneProps {
  buildings: BuildingDto[];
  landKind?: LandKind;
  /** Creditcoin NFT plot size — larger yard than the free starter land. */
  nftLandSize?: string | null;
  /** Snapshot `serverNow` from the last state payload (scene clock advances locally). */
  nowMs: number;
  /** Local ms when `nowMs` arrived — pairs with `syncedNow`. */
  clockReceivedAt: number;
  nearestBuildingId: string | null;
  onPlayerPos: (x: number, z: number) => void;
  showExpandPad: boolean;
  expandHighlighted: boolean;
  /** Yard-exit gate is the current interact target (own player land). */
  gateHighlighted?: boolean;
  /** PL26.1 — affordable vs short pad tint; null when no expand slots. */
  expandAffordMode?: ExpandPadAffordMode | null;
  others?: RemotePresence[];
  /** Cosmetic day/night; false locks midday (F14.5). */
  dayNightEnabled?: boolean;
  /** PL17.1 — soft unread world accent on city notice board. */
  noticeUnread?: boolean;
  /** PL30.3 — profession ids whose tutor quests are claimable. */
  tutorClaimableIds?: ReadonlySet<string> | readonly string[];
  /** PL42.2 — brief soft world tip on nearest portal (first walk-up). */
  portalFirstWalkUpTip?: boolean;
  /** PL45.1 — brief soft world tip on first Explore map presence. */
  exploreFirstWalkUpTip?: boolean;
  /** PL53.2 — brief soft world tip on first Warrior map presence. */
  warriorFirstMapTip?: boolean;
  /** PL57.1 — brief soft world tip on first City hub presence. */
  cityFirstHubTip?: boolean;
  /** PL165.2 — soft HUD rim when a scarce City station settles busy→Free. */
  onScarceFreeSettle?: () => void;
  /** PL166.1 — soft HUD rim when a scarce City station edges free→busy. */
  onScarceBusyEdge?: () => void;
  /** PL184.2 — soft HUD rim when a peer first enters interact range. */
  onNearbyPeerEnter?: () => void;
  /** PL45.2 — brief soft world tip on nearest arena plaque (first walk-up). */
  arenaFirstWalkUpTip?: boolean;
  /** PL52.1 — brief soft world tip on nearest empty-land build board (first walk-up). */
  emptyLandBuildFirstWalkUpTip?: boolean;
  /** PL59.1 — brief soft world tip on nearest market board (first walk-up). */
  marketFirstWalkUpTip?: boolean;
  /** PL59.2 — brief soft world tip on nearest vendor stall (first walk-up). */
  vendorFirstWalkUpTip?: boolean;
  /** PL66.1 — brief soft world tip on nearest fishing dock (first walk-up). */
  fishingDockFirstWalkUpTip?: boolean;
  /** PL66.2 — brief soft world tip on nearest animal pen (first walk-up). */
  animalPenFirstWalkUpTip?: boolean;
  /** PL68.1 — brief soft world tip on nearest tree stump (first walk-up). */
  treeStumpFirstWalkUpTip?: boolean;
  /** PL68.2 — brief soft world tip on nearest ore node (first walk-up). */
  oreNodeFirstWalkUpTip?: boolean;
  /** PL68.3 — brief soft world tip on nearest crop plot (first walk-up). */
  cropPlotFirstWalkUpTip?: boolean;
  /** PL68.4 — brief soft world tip on nearest hunt trail/thicket (first walk-up). */
  huntTrailFirstWalkUpTip?: boolean;
  /** Live foe world XZ for camera framing and facing. */
  combatFoeWorld?: { x: number; z: number } | null;
  combatGuarding?: boolean;
  combatSwingAt?: number | null;
  /** Equipped combat weapon catalog id (null when unarmed). */
  combatWeaponItemId?: string | null;
  /** PL70.1 — brief soft world tip on nearest kitchen (first walk-up). */
  kitchenFirstWalkUpTip?: boolean;
  /** PL70.2 — brief soft world tip on nearest notice board (first walk-up). */
  noticeBoardFirstWalkUpTip?: boolean;
  /** PL74.1 — brief soft world tip on nearest mill (first walk-up). */
  millFirstWalkUpTip?: boolean;
  /** PL74.2 — brief soft world tip on nearest workshop (first walk-up). */
  workshopFirstWalkUpTip?: boolean;
  /** PL74.3 — brief soft world tip on nearest forge (first walk-up). */
  forgeFirstWalkUpTip?: boolean;
  /** PL77.1 — brief soft world tip on nearest loom (first walk-up). */
  loomFirstWalkUpTip?: boolean;
  /** PL77.2 — brief soft world tip on nearest alchemy bench (first walk-up). */
  alchemyBenchFirstWalkUpTip?: boolean;
  /** PL80.1 — brief soft world tip on nearest claim beacon (first walk-up). */
  claimNodeFirstWalkUpTip?: boolean;
  /** PL75.1 — brief soft world tip on nearest housing decor pad (first walk-up). */
  decorPadFirstWalkUpTip?: boolean;
  /** PL76.2 — brief soft world tip on nearest tutorial NPC (first walk-up). */
  tutorFirstWalkUpTip?: boolean;
  /** PL72.1 — brief soft world tip on expand pad (first walk-up). */
  expandPadFirstWalkUpTip?: boolean;
  /** PL51.2 — visiting another player's land (cool guest yard tint). */
  visiting?: boolean;
  /** PL119.2 — host username for soft world nameplate while visiting. */
  visitHostUsername?: string | null;
  /** PL119.2 — brief pad/border reinforce on successful visit arrive. */
  visitHostNameplateReinforce?: boolean;
  /**
   * PL121.2 — craft panel station id while open (null when closed).
   * Soft working emissive on matching process station.
   */
  craftPanelStation?: string | null;
  /**
   * PL131.1 — process station id briefly flashing after craft success.
   */
  craftCompleteFlashStation?: string | null;
  /** PL131.1 — `performance.now()` when craft-complete flash started. */
  craftCompleteFlashStartedAt?: number | null;
  /**
   * PL137.1 — upgraded mill/forge id briefly flashing after upgrade ok.
   */
  stationUpgradeFlashBuildingId?: string | null;
  /** PL137.1 — `performance.now()` when station-upgrade flash started. */
  stationUpgradeFlashStartedAt?: number | null;
  /**
   * PL131.2 — gather building id briefly flashing after stump / ore / pen success.
   */
  gatherSuccessFlashBuildingId?: string | null;
  /** PL131.2 — `performance.now()` when gather-success flash started. */
  gatherSuccessFlashStartedAt?: number | null;
  /**
   * PL132.1 — fishing dock id briefly splash-flashing after catch success.
   */
  fishCatchSplashBuildingId?: string | null;
  /** PL132.1 — `performance.now()` when fish-catch splash started. */
  fishCatchSplashStartedAt?: number | null;
  /**
   * PL134.1 — newly placed station id briefly spawn-flashing after build ok.
   */
  buildPlaceSpawnFlashBuildingId?: string | null;
  /** PL134.1 — `performance.now()` when build-place spawn flash started. */
  buildPlaceSpawnFlashStartedAt?: number | null;
  /**
   * PL137.2 — grid x of the unlocked expand footprint briefly flashing.
   */
  expandFieldFlashX?: number | null;
  /** PL137.2 — grid z of the unlocked expand footprint. */
  expandFieldFlashZ?: number | null;
  /** PL137.2 — `performance.now()` when expand-field flash started. */
  expandFieldFlashStartedAt?: number | null;
  /** Homestead kit placement editor — ghost grid when set. */
  placingKit?: boolean;
  /** Building type for place ghost silhouette. */
  placePreviewBuildingType?: string | null;
  /** Quarter-turn facing for place ghost (0–3). */
  placeFacing?: number;
  onPlaceKitCell?: (gridX: number, gridZ: number) => void;
  /** Land editor (P) — click stations to move or pick up. */
  landEditorActive?: boolean;
  /** Building selected in the land editor. */
  landEditorSelectedId?: string | null;
  onLandEditorSelect?: (buildingId: string) => void;
  onLandEditorMove?: (buildingId: string) => void;
  onLandEditorPickup?: (buildingId: string) => void;
  landEditorBusy?: boolean;
}

/**
 * Active land scene — branches environment by CityLands map kind (CL1.3).
 */
export function LandScene({
  buildings,
  landKind = "player_land",
  nftLandSize = null,
  nowMs: serverNow,
  clockReceivedAt,
  nearestBuildingId,
  onPlayerPos,
  showExpandPad,
  expandHighlighted,
  gateHighlighted = false,
  expandAffordMode = null,
  others = [],
  dayNightEnabled = true,
  noticeUnread = false,
  tutorClaimableIds = [],
  portalFirstWalkUpTip = false,
  exploreFirstWalkUpTip = false,
  warriorFirstMapTip = false,
  cityFirstHubTip = false,
  onScarceFreeSettle,
  onScarceBusyEdge,
  onNearbyPeerEnter,
  arenaFirstWalkUpTip = false,
  emptyLandBuildFirstWalkUpTip = false,
  marketFirstWalkUpTip = false,
  vendorFirstWalkUpTip = false,
  fishingDockFirstWalkUpTip = false,
  animalPenFirstWalkUpTip = false,
  treeStumpFirstWalkUpTip = false,
  oreNodeFirstWalkUpTip = false,
  cropPlotFirstWalkUpTip = false,
  huntTrailFirstWalkUpTip = false,
  combatFoeWorld = null,
  combatGuarding = false,
  combatSwingAt = null,
  combatWeaponItemId = null,
  kitchenFirstWalkUpTip = false,
  noticeBoardFirstWalkUpTip = false,
  millFirstWalkUpTip = false,
  workshopFirstWalkUpTip = false,
  forgeFirstWalkUpTip = false,
  loomFirstWalkUpTip = false,
  alchemyBenchFirstWalkUpTip = false,
  claimNodeFirstWalkUpTip = false,
  decorPadFirstWalkUpTip = false,
  tutorFirstWalkUpTip = false,
  expandPadFirstWalkUpTip = false,
  visiting = false,
  visitHostUsername = null,
  visitHostNameplateReinforce = false,
  craftPanelStation = null,
  craftCompleteFlashStation = null,
  craftCompleteFlashStartedAt = null,
  stationUpgradeFlashBuildingId = null,
  stationUpgradeFlashStartedAt = null,
  gatherSuccessFlashBuildingId = null,
  gatherSuccessFlashStartedAt = null,
  fishCatchSplashBuildingId = null,
  fishCatchSplashStartedAt = null,
  buildPlaceSpawnFlashBuildingId = null,
  buildPlaceSpawnFlashStartedAt = null,
  expandFieldFlashX = null,
  expandFieldFlashZ = null,
  expandFieldFlashStartedAt = null,
  placingKit = false,
  placePreviewBuildingType = null,
  placeFacing = 0,
  onPlaceKitCell,
  landEditorActive = false,
  landEditorSelectedId = null,
  onLandEditorSelect,
  onLandEditorMove,
  onLandEditorPickup,
  landEditorBusy = false,
}: LandSceneProps) {
  const nowMs = useSyncedNow(
    serverNow,
    clockReceivedAt,
    SCENE_CLOCK_INTERVAL_MS,
  );
  const playerPosRef = useRef({ x: 0.5, z: 3.2 });
  const combatFoeRef = useRef<{ x: number; z: number } | null>(null);
  combatFoeRef.current = combatFoeWorld;
  const onPlayerPosRef = useRef(onPlayerPos);
  onPlayerPosRef.current = onPlayerPos;

  const template = sceneTemplateForLandKind(landKind);

  const claimableSet = useMemo(() => {
    if (tutorClaimableIds instanceof Set) return tutorClaimableIds;
    return new Set(tutorClaimableIds);
  }, [tutorClaimableIds]);

  const expandPad = useMemo(() => {
    if (!sceneAllowsExpandPad(landKind)) return null;
    const occupied = buildings.map((b) => b.slotIndex);
    return nextSlotExpansion(occupied);
  }, [buildings, landKind]);

  const emptyLandBeaconMode = useMemo(
    () => emptyLandBuildBeaconMode(buildings),
    [buildings],
  );

  const yardAtmosphereMode = useMemo(
    () => homesteadYardAtmosphereMode(buildings),
    [buildings],
  );

  const yardPresence = useMemo(
    () => homesteadYardPresenceFor(visiting, landKind),
    [visiting, landKind],
  );

  const yardHalf = homesteadYardHalf(
    landKind === "player_land" ? nftLandSize : null,
  );

  const walkObstacles = useMemo(
    () =>
      walkObstaclesForMap(
        buildings,
        landKind,
        landKind === "player_land" ? nftLandSize : null,
      ),
    [buildings, landKind, nftLandSize],
  );

  return (
    <div className={LAND_SCENE_STACK_CLASS}>
      <Canvas
        shadows
        // Reason: HiDPI would render 2–3× pixels in dev; cap DPR and drop scale if FPS dips.
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
          // Reason: bright readable world — prior 0.98 exposure + dark night keys crushed the scene.
          toneMappingExposure: 1.22,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = PCFSoftShadowMap;
        }}
        camera={{ position: [8, 9, 11], fov: 40 }}
      >
        <PlayerViewProvider playerPosRef={playerPosRef}>
        {/* SoftShadows removed — caused grass/floor shimmer; ContactShadows for contact only */}
        <ContactShadows
          position={[0, -0.06, 0]}
          opacity={0.12}
          scale={40}
          blur={3.6}
          far={10}
          resolution={256}
          frames={1}
        />
        <DayNightLighting
          landKind={landKind}
          nowMs={nowMs}
          enabled={dayNightEnabled}
        />
        {template === "city" ? (
          <CityEnvironment
            others={others}
            firstHubTip={cityFirstHubTip}
            onScarceFreeSettle={onScarceFreeSettle}
            onScarceBusyEdge={onScarceBusyEdge}
          />
        ) : template === "explore" ? (
          <ForestEnvironment firstWalkUpTip={exploreFirstWalkUpTip} />
        ) : template === "warrior" ? (
          <WarriorEnvironment firstMapTip={warriorFirstMapTip} />
        ) : (
          <HomesteadEnvironment
            atmosphereMode={yardAtmosphereMode}
            presence={yardPresence}
            visitHostUsername={
              visiting ? visitHostUsername ?? null : null
            }
            visitHostNameplateReinforce={
              visiting && visitHostNameplateReinforce
            }
            gateHighlighted={gateHighlighted && !visiting}
            yardHalf={yardHalf}
          />
        )}

        {placingKit && onPlaceKitCell && landKind === "player_land" ? (
          <HomesteadPlaceGrid
            occupied={buildings.map((b) => ({ x: b.x, z: b.z }))}
            previewBuildingType={placePreviewBuildingType}
            facing={placeFacing}
            nftLandSize={nftLandSize}
            onPickCell={onPlaceKitCell}
          />
        ) : null}

        {buildings.map((building) => (
          <BuildingMesh
            key={building.id}
            building={building}
            highlighted={
              building.id === nearestBuildingId ||
              (landEditorActive && building.id === landEditorSelectedId)
            }
            nowMs={nowMs}
            landKind={landKind}
            emptyLandBeaconMode={
              building.type === "build_board" ? emptyLandBeaconMode : undefined
            }
            noticeUnread={
              building.type === "notice_board" ? noticeUnread : false
            }
            tutorClaimable={
              building.type === "tutorial_npc" &&
              Boolean(
                building.tutorialNpcId &&
                  claimableSet.has(building.tutorialNpcId),
              )
            }
            portalFirstWalkUpTip={
              building.type === "portal" ? portalFirstWalkUpTip : false
            }
            arenaFirstWalkUpTip={
              building.type === "arena_board" ? arenaFirstWalkUpTip : false
            }
            emptyLandBuildFirstWalkUpTip={
              building.type === "build_board"
                ? emptyLandBuildFirstWalkUpTip
                : false
            }
            marketFirstWalkUpTip={
              building.type === "market_board" ? marketFirstWalkUpTip : false
            }
            vendorFirstWalkUpTip={
              building.type === "vendor_stall" ? vendorFirstWalkUpTip : false
            }
            fishingDockFirstWalkUpTip={
              building.type === "fishing_dock" ? fishingDockFirstWalkUpTip : false
            }
            animalPenFirstWalkUpTip={
              building.type === "animal_pen" ? animalPenFirstWalkUpTip : false
            }
            treeStumpFirstWalkUpTip={
              building.type === "tree_stump" ? treeStumpFirstWalkUpTip : false
            }
            oreNodeFirstWalkUpTip={
              building.type === "ore_node" ? oreNodeFirstWalkUpTip : false
            }
            cropPlotFirstWalkUpTip={
              building.type === "crop_plot" ? cropPlotFirstWalkUpTip : false
            }
            huntTrailFirstWalkUpTip={
              building.type === "game_trail" ||
              building.type === "edge_thicket"
                ? huntTrailFirstWalkUpTip
                : false
            }
            kitchenFirstWalkUpTip={
              building.type === "kitchen" ? kitchenFirstWalkUpTip : false
            }
            noticeBoardFirstWalkUpTip={
              building.type === "notice_board"
                ? noticeBoardFirstWalkUpTip
                : false
            }
            millFirstWalkUpTip={
              building.type === "mill" ? millFirstWalkUpTip : false
            }
            workshopFirstWalkUpTip={
              building.type === "workshop" ? workshopFirstWalkUpTip : false
            }
            forgeFirstWalkUpTip={
              building.type === "forge" ? forgeFirstWalkUpTip : false
            }
            loomFirstWalkUpTip={
              building.type === "loom" ? loomFirstWalkUpTip : false
            }
            alchemyBenchFirstWalkUpTip={
              building.type === "alchemy_bench"
                ? alchemyBenchFirstWalkUpTip
                : false
            }
            claimNodeFirstWalkUpTip={
              building.type === "claim_node" ? claimNodeFirstWalkUpTip : false
            }
            decorPadFirstWalkUpTip={
              building.type === "decor_pad" ? decorPadFirstWalkUpTip : false
            }
            tutorFirstWalkUpTip={
              building.type === "tutorial_npc" ? tutorFirstWalkUpTip : false
            }
            craftPanelStation={craftPanelStation}
            craftCompleteFlashStation={craftCompleteFlashStation}
            craftCompleteFlashStartedAt={craftCompleteFlashStartedAt}
            stationUpgradeFlashBuildingId={stationUpgradeFlashBuildingId}
            stationUpgradeFlashStartedAt={stationUpgradeFlashStartedAt}
            gatherSuccessFlashBuildingId={gatherSuccessFlashBuildingId}
            gatherSuccessFlashStartedAt={gatherSuccessFlashStartedAt}
            fishCatchSplashBuildingId={fishCatchSplashBuildingId}
            fishCatchSplashStartedAt={fishCatchSplashStartedAt}
          />
        ))}

        {landEditorActive &&
        landKind === "player_land" &&
        onLandEditorSelect &&
        onLandEditorMove &&
        onLandEditorPickup ? (
          <HomesteadEditorOverlay
            buildings={buildings}
            selectedId={landEditorSelectedId}
            placingKit={placingKit}
            busy={landEditorBusy}
            onSelect={onLandEditorSelect}
            onMove={onLandEditorMove}
            onPickup={onLandEditorPickup}
          />
        ) : null}

        {(() => {
          // Reason: PL134.1 — world pad overlay on newly placed station (id-scoped).
          if (
            !buildPlaceSpawnFlashBuildingId ||
            buildPlaceSpawnFlashStartedAt == null ||
            !shouldShowBuildPlaceSpawnFlash(
              buildPlaceSpawnFlashBuildingId,
              buildPlaceSpawnFlashBuildingId,
            )
          ) {
            return null;
          }
          const placed = buildings.find(
            (b) => b.id === buildPlaceSpawnFlashBuildingId,
          );
          if (!placed || !isPlayerLandStationType(placed.type)) return null;
          return (
            <group
              key={`build-spawn-flash-${placed.id}`}
              position={[placed.x * GRID, 0, placed.z * GRID]}
            >
              <BuildPlaceSpawnFlashPad
                active
                startedAtMs={buildPlaceSpawnFlashStartedAt}
              />
            </group>
          );
        })()}

        {showExpandPad && expandPad ? (
          <ExpandPadMesh
            x={expandPad.x}
            z={expandPad.z}
            highlighted={expandHighlighted}
            affordMode={expandAffordMode ?? "short"}
            showFirstWalkUpTip={expandPadFirstWalkUpTip && expandHighlighted}
            landKind={landKind}
          />
        ) : null}

        {(() => {
          // Reason: PL137.2 — warm field pad on the footprint just unlocked (coords frozen at expand).
          if (
            expandFieldFlashStartedAt == null ||
            !shouldShowExpandFieldPadFlash(expandFieldFlashX, expandFieldFlashZ)
          ) {
            return null;
          }
          return (
            <group
              key={`expand-field-flash-${expandFieldFlashX}-${expandFieldFlashZ}`}
              position={[
                expandFieldFlashX! * GRID,
                0,
                expandFieldFlashZ! * GRID,
              ]}
            >
              <ExpandFieldFlashPad
                active
                startedAtMs={expandFieldFlashStartedAt}
              />
            </group>
          );
        })()}

        {others.map((o) => (
          <RemotePlayerAvatar
            key={o.username}
            username={o.username}
            x={o.x}
            z={o.z}
            playerPosRef={playerPosRef}
            onInteractRangeEnter={onNearbyPeerEnter}
          />
        ))}

        <PlayerAvatar
          landKind={landKind}
          nftLandSize={nftLandSize}
          obstacles={walkObstacles}
          combatFoeWorld={combatFoeWorld}
          combatGuarding={combatGuarding}
          combatSwingAt={combatSwingAt}
          combatWeaponItemId={combatWeaponItemId}
          onPosition={(x, z) => {
            playerPosRef.current = { x, z };
            onPlayerPosRef.current(x, z);
          }}
        />
        <CameraFollow targetRef={playerPosRef} combatFoeRef={combatFoeRef} />
        </PlayerViewProvider>
      </Canvas>
    </div>
  );
}
