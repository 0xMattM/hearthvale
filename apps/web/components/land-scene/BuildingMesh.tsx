"use client";

import { CityRiverFishingSpot } from "@/components/land-scene/CityRiverFishingSpot";
import {
  GatherDepletedStumpMesh,
  GatherReadyTreeMesh,
} from "@/components/land-scene/GatherReadyTreeMesh";
import type {
  BuildingDto,
  EmptyLandBuildBeaconMode,
  ExpandPadAffordMode,
  LandKind,
} from "@game/shared";
import {
  arenaBoardLandmarkCue,
  arenaBoardLandmarkEmissiveIntensity,
  arenaBoardLandmarkHazeOpacity,
  arenaBoardLandmarkPulseEnvelope,
  arenaBoardWorldLabel,
  arenaFirstWalkUpWorldTip,
  arenaPlaqueHighlightPulseEmissiveIntensity,
  arenaPlaqueHighlightPulseEnvelope,
  CITY_SERVICE_VISUAL_KITS,
  cityCommerceServicePad,
  emptyLandBuildBeaconWorldLabel,
  emptyLandBuildBoardLandmarkCue,
  emptyLandBuildBoardLandmarkEmissiveIntensity,
  emptyLandBuildBoardLandmarkHazeOpacity,
  emptyLandBuildBoardLandmarkPulseEnvelope,
  buildBoardAtmosphereCue,
  buildBoardAtmosphereEmissiveIntensity,
  buildBoardAtmosphereHazeOpacity,
  buildBoardAtmospherePulseEnvelope,
  emptyLandBuildFirstWalkUpWorldTip,
  expandPadFirstWalkUpWorldTip,
  expandPadLandmarkCue,
  expandPadLandmarkEmissiveIntensity,
  expandPadLandmarkHazeOpacity,
  expandPadLandmarkPulseEnvelope,
  housingDecorLandmarkCue,
  housingDecorLandmarkEmissiveIntensity,
  housingDecorLandmarkHazeOpacity,
  housingDecorLandmarkPulseEnvelope,
  housingDecorAtmosphereCue,
  housingDecorAtmosphereEmissiveIntensity,
  housingDecorAtmosphereHazeOpacity,
  housingDecorAtmospherePulseEnvelope,
  expandPadMeshColors,
  expandPadKitMaterials,
  claimEmptyLandmarkCue,
  claimEmptyLandmarkEmissiveIntensity,
  claimEmptyLandmarkHazeOpacity,
  claimEmptyLandmarkPulseEnvelope,
  claimNodeKitMaterials,
  expandPadShortAffordPulseEmissive,
  expandPadShortAffordPulseEmissiveIntensity,
  expandPadShortAffordPulseEnvelope,
  fishingDockFirstWalkUpWorldTip,
  fishingDockReadyShimmerEnvelope,
  fishingDockReadyWaterEmissiveIntensity,
  fishingDockReadyWaterShimmer,
  animalPenFirstWalkUpWorldTip,
  animalPenReadyPadEmissiveIntensity,
  animalPenReadyPadPulse,
  animalPenReadyPadPulseEnvelope,
  treeStumpFirstWalkUpWorldTip,
  kitchenFirstWalkUpWorldTip,
  millFirstWalkUpWorldTip,
  workshopFirstWalkUpWorldTip,
  forgeFirstWalkUpWorldTip,
  loomFirstWalkUpWorldTip,
  alchemyBenchFirstWalkUpWorldTip,
  decorPadFirstWalkUpWorldTip,
  gatherStationReadyWorldLabelParts,
  gatherStumpWorldVisual,
  gatherStumpSurfaceMaterials,
  GATHER_READY_TREE,
  gatherDockSurfaceMaterials,
  gatherPenSurfaceMaterials,
  explorePremiumNodeGlow,
  CITY_NOTICE_BOARD_ATMOSPHERE_CUE,
  cityNoticeBoardAtmosphereCue,
  cityNoticeBoardAtmosphereEmissiveIntensity,
  cityNoticeBoardAtmosphereHazeOpacity,
  cityNoticeBoardAtmospherePulseEnvelope,
  cityNoticeBoardLandmarkCue,
  cityNoticeBoardLandmarkEmissiveIntensity,
  cityNoticeBoardLandmarkHazeOpacity,
  cityNoticeBoardLandmarkPulseEnvelope,
  housingDecorWorldLabelParts,
  NOTICE_UNREAD_WORLD_CUE,
  noticeBoardFirstWalkUpWorldTip,
  noticeUnreadFlickerEnvelope,
  noticeUnreadPlaqueEmissiveIntensity,
  portalMeshTintForLandKind,
  portalKitMaterials,
  noticeBoardKitMaterials,
  buildBoardKitMaterials,
  arenaBoardKitMaterials,
  housingDecorPadKitMaterials,
  housingDecorPlanterKitMaterials,
  housingDecorBannerKitMaterials,
  interactHighlightRingMaterials,
  processStationWorldLabelParts,
  PROCESS_STATION_WORKING_EMISSIVE,
  processStationWorkingEmissiveEnvelope,
  processStationWorkingEmissiveIntensity,
  shouldShowProcessStationWorkingEmissive,
  CRAFT_COMPLETE_BENCH_FLASH,
  craftCompleteBenchFlashEmissiveIntensity,
  craftCompleteBenchFlashEnvelope,
  craftCompleteBenchFlashOpacity,
  shouldShowCraftCompleteBenchFlash,
  cuePadFlashMaterials,
  STATION_UPGRADE_PAD_FLASH,
  stationUpgradePadFlashEmissiveIntensity,
  stationUpgradePadFlashEnvelope,
  stationUpgradePadFlashOpacity,
  shouldShowStationUpgradePadFlash,
  shouldShowGatherSuccessPadFlash,
  shouldShowFishCatchSplashFlash,
  CLAIM_EMPTY_LANDMARK_CUE,
  CLAIM_NODE_HELD_SOFT_CUE,
  SOFT_WAR_CONTEST_ATMOSPHERE_CUE,
  claimNodeContestSoftCueActive,
  claimNodeContestSoftCueEmissive,
  claimNodeContestSoftCueEmissiveIntensity,
  claimNodeContestSoftCueEnvelope,
  softWarContestAtmosphereCue,
  softWarContestAtmosphereEmissiveIntensity,
  softWarContestAtmosphereHazeOpacity,
  softWarContestAtmospherePulseEnvelope,
  claimNodeFirstWalkUpWorldTip,
  claimNodeHeldSoftCueEmissive,
  claimNodeHeldSoftCueEmissiveIntensity,
  claimNodeHeldSoftCueEnvelope,
  claimNodeOwnershipBannerColor,
  cityFishingDockLandmarkCue,
  cityFishingDockLandmarkEmissiveIntensity,
  cityFishingDockLandmarkHazeOpacity,
  cityFishingDockLandmarkPulseEnvelope,
  fishingDockAtmosphereCue,
  fishingDockAtmosphereEmissiveIntensity,
  fishingDockAtmosphereHazeOpacity,
  fishingDockAtmospherePulseEnvelope,
  animalPenAtmosphereCue,
  animalPenAtmosphereEmissiveIntensity,
  animalPenAtmosphereHazeOpacity,
  animalPenAtmospherePulseEnvelope,
  treeStumpAtmosphereCue,
  treeStumpAtmosphereEmissiveIntensity,
  treeStumpAtmosphereHazeOpacity,
  treeStumpAtmospherePulseEnvelope,
  alchemyBenchAtmosphereCue,
  alchemyBenchAtmosphereEmissiveIntensity,
  alchemyBenchAtmosphereHazeOpacity,
  alchemyBenchAtmospherePulseEnvelope,
  cityAlchemyBenchLandmarkCue,
  cityAlchemyBenchLandmarkEmissiveIntensity,
  cityAlchemyBenchLandmarkHazeOpacity,
  cityAlchemyBenchLandmarkPulseEnvelope,
  cityLoomLandmarkCue,
  cityLoomLandmarkEmissiveIntensity,
  cityLoomLandmarkHazeOpacity,
  cityLoomLandmarkPulseEnvelope,
  loomAtmosphereCue,
  loomAtmosphereEmissiveIntensity,
  loomAtmosphereHazeOpacity,
  loomAtmospherePulseEnvelope,
  cityAnimalPenLandmarkCue,
  cityAnimalPenLandmarkEmissiveIntensity,
  cityAnimalPenLandmarkHazeOpacity,
  cityAnimalPenLandmarkPulseEnvelope,
  cityTreeStumpLandmarkCue,
  cityTreeStumpLandmarkEmissiveIntensity,
  cityTreeStumpLandmarkHazeOpacity,
  cityTreeStumpLandmarkPulseEnvelope,
  cityWorkshopLandmarkCue,
  cityWorkshopLandmarkEmissiveIntensity,
  cityWorkshopLandmarkHazeOpacity,
  cityWorkshopLandmarkPulseEnvelope,
  workshopAtmosphereCue,
  workshopAtmosphereEmissiveIntensity,
  workshopAtmosphereHazeOpacity,
  workshopAtmospherePulseEnvelope,
  expandPadAtmosphereCue,
  expandPadAtmosphereEmissiveIntensity,
  expandPadAtmosphereHazeOpacity,
  expandPadAtmospherePulseEnvelope,
  cityForgeLandmarkCue,
  cityForgeLandmarkEmissiveIntensity,
  cityForgeLandmarkHazeOpacity,
  cityForgeLandmarkPulseEnvelope,
  cityMillLandmarkCue,
  cityMillLandmarkHazeOpacity,
  cityMillLandmarkPulseEnvelope,
  millAtmosphereCue,
  millAtmosphereEmissiveIntensity,
  millAtmosphereHazeOpacity,
  millAtmospherePulseEnvelope,
  forgeAtmosphereCue,
  forgeAtmosphereEmissiveIntensity,
  forgeAtmosphereHazeOpacity,
  forgeAtmospherePulseEnvelope,
  cityKitchenLandmarkCue,
  cityKitchenLandmarkEmissiveIntensity,
  cityKitchenLandmarkHazeOpacity,
  cityKitchenLandmarkPulseEnvelope,
  kitchenAtmosphereCue,
  kitchenAtmosphereEmissiveIntensity,
  kitchenAtmosphereHazeOpacity,
  kitchenAtmospherePulseEnvelope,
  PORTAL_ARENA_EXIT_SOFT_PULSE,
  PORTAL_FREE_ATMOSPHERE_CUE,
  PORTAL_FREE_TRAVEL_SOFT_PULSE,
  PORTAL_HIGHLIGHT_FREE_PULSE,
  isWarriorLandKind,
  portalArenaExitSoftPulseEmissive,
  portalArenaExitSoftPulseEmissiveIntensity,
  portalArenaExitSoftPulseEnvelope,
  portalFirstWalkUpWorldTip,
  portalFreeAtmosphereCue,
  portalFreeAtmosphereEmissiveIntensity,
  portalFreeAtmosphereHazeOpacity,
  portalFreeAtmospherePulseEnvelope,
  portalFreeLandmarkCue,
  portalFreeLandmarkEmissiveIntensity,
  portalFreeLandmarkHazeOpacity,
  portalFreeLandmarkPulseEnvelope,
  portalFreeTravelSoftPulseEmissive,
  portalFreeTravelSoftPulseEmissiveIntensity,
  portalFreeTravelSoftPulseEnvelope,
  portalHighlightFreePulseEmissiveIntensity,
  portalHighlightFreePulseEnvelope,
  portalHighlightFreePulseOpacity,
  portalWorldLabelParts,
  WARRIOR_ARENA_VISUAL,
  type ProcessStationType,
} from "@game/shared";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type MeshStandardMaterial } from "three";
import { FishCatchSplashPad } from "@/components/land-scene/FishCatchSplashPad";
import { GatherSuccessFlashPad } from "@/components/land-scene/GatherSuccessFlashPad";
import { GRID } from "@/components/land-scene/landProximity";
import { GltfOrKit, preloadHeroGltf } from "@/components/land-scene/GltfOrKit";
import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { TutorialNpcBuilding } from "@/components/land-scene/TutorialNpcBuilding";
import {
  CropFieldMesh,
  EdgeThicketMesh,
  GameTrailMesh,
  OreNodeMesh,
} from "@/components/land-scene/ResourceMeshes";
import { CombatFoeMesh } from "@/components/land-scene/CombatFoeMesh";
import { AlchemyKitMeshes, LoomKitMeshes } from "@/components/land-scene/loom-alchemy-kits";
import { ForgeKitMeshes, MillKitMeshes } from "@/components/land-scene/mill-forge-kits";
import {
  KitchenKitMeshes,
  WorkshopKitMeshes,
} from "@/components/land-scene/kitchen-workshop-kits";
import { VendorStall } from "@/components/land-scene/vendor-stall-kit";
import { MarketStall } from "@/components/land-scene/market-stall-kit";
import { heroModelFor } from "@/lib/hero-buildings";
import { processStationLabelY } from "@/lib/process-station-silhouette";

const millHero = heroModelFor("mill");
if (millHero) preloadHeroGltf(millHero.url);

interface BuildingMeshProps {
  building: BuildingDto;
  highlighted: boolean;
  nowMs: number;
  /** Active map — portal mesh tint by circuit role (PL14.2). */
  landKind?: LandKind;
  /** PL3.1 — empty-land beacon intensity for build_board only. */
  emptyLandBeaconMode?: EmptyLandBuildBeaconMode;
  /** PL17.1 — soft unread glow on city notice board while tips are unread. */
  noticeUnread?: boolean;
  /** PL30.3 — soft claim accent when this tutor's objective is claimable. */
  tutorClaimable?: boolean;
  /** PL42.2 — one-shot soft world tip on first portal proximity. */
  portalFirstWalkUpTip?: boolean;
  /** PL45.2 — one-shot soft world tip on first arena plaque proximity. */
  arenaFirstWalkUpTip?: boolean;
  /** PL52.1 — one-shot soft world tip on first empty-land build-board proximity. */
  emptyLandBuildFirstWalkUpTip?: boolean;
  /** PL59.1 — one-shot soft world tip on first market board proximity. */
  marketFirstWalkUpTip?: boolean;
  /** PL59.2 — one-shot soft world tip on first vendor stall proximity. */
  vendorFirstWalkUpTip?: boolean;
  /** PL66.1 — one-shot soft world tip on first fishing dock proximity. */
  fishingDockFirstWalkUpTip?: boolean;
  /** PL66.2 — one-shot soft world tip on first animal pen proximity. */
  animalPenFirstWalkUpTip?: boolean;
  /** PL68.1 — one-shot soft world tip on first tree stump proximity. */
  treeStumpFirstWalkUpTip?: boolean;
  /** PL68.2 — one-shot soft world tip on first ore node proximity. */
  oreNodeFirstWalkUpTip?: boolean;
  /** PL68.3 — one-shot soft world tip on first crop plot proximity. */
  cropPlotFirstWalkUpTip?: boolean;
  /** PL68.4 — one-shot soft world tip on first hunt trail/thicket proximity. */
  huntTrailFirstWalkUpTip?: boolean;
  /** PL70.1 — one-shot soft world tip on first kitchen proximity. */
  kitchenFirstWalkUpTip?: boolean;
  /** PL70.2 — one-shot soft world tip on first notice board proximity. */
  noticeBoardFirstWalkUpTip?: boolean;
  /** PL74.1 — one-shot soft world tip on first mill proximity. */
  millFirstWalkUpTip?: boolean;
  /** PL74.2 — one-shot soft world tip on first workshop proximity. */
  workshopFirstWalkUpTip?: boolean;
  /** PL74.3 — one-shot soft world tip on first forge proximity. */
  forgeFirstWalkUpTip?: boolean;
  /** PL77.1 — one-shot soft world tip on first loom proximity. */
  loomFirstWalkUpTip?: boolean;
  /** PL77.2 — one-shot soft world tip on first alchemy bench proximity. */
  alchemyBenchFirstWalkUpTip?: boolean;
  /** PL80.1 — one-shot soft world tip on first claim-node proximity. */
  claimNodeFirstWalkUpTip?: boolean;
  /** PL75.1 — one-shot soft world tip on first housing decor-pad proximity. */
  decorPadFirstWalkUpTip?: boolean;
  /** PL76.2 — one-shot soft world tip on first tutorial NPC proximity. */
  tutorFirstWalkUpTip?: boolean;
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
   * PL137.1 — upgraded mill/forge building id briefly flashing after upgrade ok.
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
}

/**
 * Production structures ? kits by default; mill uses GLTF hero with kit fallback (F14.1).
 */
export function BuildingMesh({
  building,
  highlighted,
  nowMs,
  landKind = "player_land",
  emptyLandBeaconMode = "soft",
  noticeUnread = false,
  tutorClaimable = false,
  portalFirstWalkUpTip = false,
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
  craftPanelStation = null,
  craftCompleteFlashStation = null,
  craftCompleteFlashStartedAt = null,
  stationUpgradeFlashBuildingId = null,
  stationUpgradeFlashStartedAt = null,
  gatherSuccessFlashBuildingId = null,
  gatherSuccessFlashStartedAt = null,
  fishCatchSplashBuildingId = null,
  fishCatchSplashStartedAt = null,
}: BuildingMeshProps) {
  const px = building.x * GRID;
  const pz = building.z * GRID;
  const craftWorking = shouldShowProcessStationWorkingEmissive(
    building.type,
    craftPanelStation,
    Boolean(building.craft && building.craft.state === "working"),
  );
  const craftCompleteFlash = shouldShowCraftCompleteBenchFlash(
    building.type,
    craftCompleteFlashStation,
  );
  const stationUpgradeFlash = shouldShowStationUpgradePadFlash(
    building.id,
    stationUpgradeFlashBuildingId,
  );
  const gatherSuccessFlash = shouldShowGatherSuccessPadFlash(
    building.id,
    gatherSuccessFlashBuildingId,
  );
  const fishCatchSplash = shouldShowFishCatchSplashFlash(
    building.id,
    fishCatchSplashBuildingId,
  );

  if (building.type === "crop_plot") {
    return (
      <CropFieldMesh
        building={building}
        highlighted={highlighted}
        px={px}
        pz={pz}
        nowMs={nowMs}
        landKind={landKind}
        showFirstWalkUpTip={cropPlotFirstWalkUpTip && highlighted}
      />
    );
  }
  if (building.type === "mill") {
    return (
      <MillBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        tier={building.tier ?? 1}
        landKind={landKind}
        showFirstWalkUpTip={millFirstWalkUpTip && highlighted}
        craftWorking={craftWorking}
        craft={building.craft}
        craftCompleteFlash={craftCompleteFlash}
        craftCompleteFlashStartedAt={craftCompleteFlashStartedAt}
        stationUpgradeFlash={stationUpgradeFlash}
        stationUpgradeFlashStartedAt={stationUpgradeFlashStartedAt}
        nowMs={nowMs}
      />
    );
  }
  if (building.type === "forge") {
    return (
      <ForgeBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        tier={building.tier ?? 1}
        landKind={landKind}
        showFirstWalkUpTip={forgeFirstWalkUpTip && highlighted}
        craftWorking={craftWorking}
        craft={building.craft}
        craftCompleteFlash={craftCompleteFlash}
        craftCompleteFlashStartedAt={craftCompleteFlashStartedAt}
        stationUpgradeFlash={stationUpgradeFlash}
        stationUpgradeFlashStartedAt={stationUpgradeFlashStartedAt}
        nowMs={nowMs}
      />
    );
  }
  if (building.type === "ore_node") {
    return (
      <OreNodeMesh
        highlighted={highlighted}
        px={px}
        pz={pz}
        building={building}
        nowMs={nowMs}
        showFirstWalkUpTip={oreNodeFirstWalkUpTip && highlighted}
        landKind={landKind}
        gatherSuccessFlash={gatherSuccessFlash}
        gatherSuccessFlashStartedAt={gatherSuccessFlashStartedAt}
      />
    );
  }
  if (building.type === "kitchen") {
    return (
      <KitchenBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        showFirstWalkUpTip={kitchenFirstWalkUpTip && highlighted}
        craftWorking={craftWorking}
        craft={building.craft}
        craftCompleteFlash={craftCompleteFlash}
        craftCompleteFlashStartedAt={craftCompleteFlashStartedAt}
        nowMs={nowMs}
      />
    );
  }
  if (building.type === "tree_stump") {
    return (
      <TreeStumpBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        building={building}
        nowMs={nowMs}
        showFirstWalkUpTip={treeStumpFirstWalkUpTip && highlighted}
        landKind={landKind}
        gatherSuccessFlash={gatherSuccessFlash}
        gatherSuccessFlashStartedAt={gatherSuccessFlashStartedAt}
      />
    );
  }
  if (building.type === "workshop") {
    return (
      <WorkshopBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        showFirstWalkUpTip={workshopFirstWalkUpTip && highlighted}
        craftWorking={craftWorking}
        craft={building.craft}
        craftCompleteFlash={craftCompleteFlash}
        craftCompleteFlashStartedAt={craftCompleteFlashStartedAt}
        nowMs={nowMs}
      />
    );
  }
  if (building.type === "loom") {
    return (
      <LoomBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        showFirstWalkUpTip={loomFirstWalkUpTip && highlighted}
        craftWorking={craftWorking}
        craft={building.craft}
        craftCompleteFlash={craftCompleteFlash}
        craftCompleteFlashStartedAt={craftCompleteFlashStartedAt}
        nowMs={nowMs}
      />
    );
  }
  if (building.type === "alchemy_bench") {
    return (
      <AlchemyBenchBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        showFirstWalkUpTip={alchemyBenchFirstWalkUpTip && highlighted}
        craftWorking={craftWorking}
        craft={building.craft}
        craftCompleteFlash={craftCompleteFlash}
        craftCompleteFlashStartedAt={craftCompleteFlashStartedAt}
        nowMs={nowMs}
      />
    );
  }
  if (building.type === "fishing_dock") {
    return (
      <FishingDockBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        building={building}
        nowMs={nowMs}
        landKind={landKind}
        showFirstWalkUpTip={fishingDockFirstWalkUpTip && highlighted}
        fishCatchSplash={fishCatchSplash}
        fishCatchSplashStartedAt={fishCatchSplashStartedAt}
      />
    );
  }
  if (building.type === "animal_pen") {
    return (
      <AnimalPenBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        building={building}
        nowMs={nowMs}
        landKind={landKind}
        showFirstWalkUpTip={animalPenFirstWalkUpTip && highlighted}
        gatherSuccessFlash={gatherSuccessFlash}
        gatherSuccessFlashStartedAt={gatherSuccessFlashStartedAt}
      />
    );
  }
  if (building.type === "game_trail") {
    return (
      <GameTrailMesh
        highlighted={highlighted}
        px={px}
        pz={pz}
        building={building}
        nowMs={nowMs}
        landKind={landKind}
        showFirstWalkUpTip={huntTrailFirstWalkUpTip && highlighted}
      />
    );
  }
  if (building.type === "edge_thicket") {
    return (
      <EdgeThicketMesh
        highlighted={highlighted}
        px={px}
        pz={pz}
        building={building}
        nowMs={nowMs}
        landKind={landKind}
        showFirstWalkUpTip={huntTrailFirstWalkUpTip && highlighted}
      />
    );
  }
  if (building.type === "portal") {
    return (
      <PortalBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        showFirstWalkUpTip={portalFirstWalkUpTip && highlighted}
      />
    );
  }
  if (building.type === "decor_pad") {
    return (
      <DecorPadBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        showFirstWalkUpTip={decorPadFirstWalkUpTip && highlighted}
      />
    );
  }
  if (building.type === "decor_planter") {
    return (
      <DecorPlanterBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
      />
    );
  }
  if (building.type === "decor_banner") {
    return (
      <DecorBannerBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
      />
    );
  }
  if (building.type === "claim_node") {
    return (
      <ClaimNodeBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        building={building}
        showFirstWalkUpTip={claimNodeFirstWalkUpTip && highlighted}
      />
    );
  }
  if (building.type === "tutorial_npc") {
    return (
      <TutorialNpcBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        professionId={building.tutorialNpcId}
        claimable={tutorClaimable}
        showFirstWalkUpTip={tutorFirstWalkUpTip && highlighted}
      />
    );
  }
  if (building.type === "market_board") {
    return (
      <MarketStall
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        showFirstWalkUpTip={marketFirstWalkUpTip && highlighted}
      />
    );
  }
  if (building.type === "realm_market") {
    return (
      <MarketStall
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        currency="realm"
      />
    );
  }
  if (building.type === "build_board") {
    return null;
  }
  if (building.type === "arena_dummy") {
    return (
      <group position={[px, 0, pz]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <circleGeometry args={[0.85, 20]} />
          <meshStandardMaterial
            color={highlighted ? "#8a5a38" : "#6a4830"}
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
        <CombatFoeMesh
          kind="dummy"
          buildingId={building.id}
          ready={building.readyAt == null || nowMs >= (building.readyAt ?? 0)}
          hideColor="#c4a070"
          padX={px}
          padZ={pz}
        />
        <HighlightRing show={highlighted} />
      </group>
    );
  }
  if (building.type === "arena_board") {
    return (
      <ArenaBoardBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        showFirstWalkUpTip={arenaFirstWalkUpTip && highlighted}
      />
    );
  }
  if (building.type === "notice_board") {
    return (
      <NoticeBoardBuilding
        highlighted={highlighted}
        px={px}
        pz={pz}
        landKind={landKind}
        unread={noticeUnread}
        showFirstWalkUpTip={noticeBoardFirstWalkUpTip && highlighted}
      />
    );
  }
  return (
    <VendorStall
      highlighted={highlighted}
      px={px}
      pz={pz}
      landKind={landKind}
      showFirstWalkUpTip={vendorFirstWalkUpTip && highlighted}
    />
  );
}

/** VA4.4 — select gold ring SoT shared with ResourceMeshes. */
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
 * Soft warm pad under a process station while craft panel is open (PL121.2).
 */
function ProcessStationWorkingPad({
  working,
  nowMs,
}: {
  working: boolean;
  nowMs: number;
}) {
  if (!working) return null;
  const intensity = processStationWorkingEmissiveIntensity(
    true,
    processStationWorkingEmissiveEnvelope(nowMs),
  );
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.016, 0]}
      receiveShadow
    >
      <circleGeometry args={[1.2, 24]} />
      <meshStandardMaterial
        color={PROCESS_STATION_WORKING_EMISSIVE.padColor}
        transparent
        opacity={PROCESS_STATION_WORKING_EMISSIVE.opacity}
        emissive={PROCESS_STATION_WORKING_EMISSIVE.emissiveColor}
        emissiveIntensity={intensity}
      />
    </mesh>
  );
}

/**
 * Brief sprout-olive settle pad after craft success (PL131.1).
 * Complements working gold pad (PL121.2); recipes / XP unchanged.
 */
function ProcessStationCompleteFlashPad({
  active,
  startedAtMs,
}: {
  active: boolean;
  startedAtMs: number | null;
}) {
  const matRef = useRef<MeshStandardMaterial>(null);
  // Reason: VA5.4 — PBR under craft settle envelope; pad RGB stays on catalog.
  const flashMat = cuePadFlashMaterials();

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    if (!active || startedAtMs == null) {
      mat.opacity = 0;
      mat.emissiveIntensity = 0;
      return;
    }
    const envelope = craftCompleteBenchFlashEnvelope(
      performance.now() - startedAtMs,
    );
    mat.opacity = craftCompleteBenchFlashOpacity(envelope);
    mat.emissiveIntensity = craftCompleteBenchFlashEmissiveIntensity(envelope);
  });

  if (!active) return null;
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.02, 0]}
      receiveShadow
    >
      <circleGeometry args={[1.28, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={CRAFT_COMPLETE_BENCH_FLASH.padColor}
        transparent
        opacity={CRAFT_COMPLETE_BENCH_FLASH.opacityPeak}
        emissive={CRAFT_COMPLETE_BENCH_FLASH.emissiveColor}
        emissiveIntensity={CRAFT_COMPLETE_BENCH_FLASH.intensityPeak}
        roughness={flashMat.disc.roughness}
        metalness={flashMat.disc.metalness}
      />
    </mesh>
  );
}

/**
 * Brief warm copper settle pad after station upgrade ok (PL137.1).
 * Complements craft olive settle (PL131.1); costs / tiers unchanged.
 */
function ProcessStationUpgradeFlashPad({
  active,
  startedAtMs,
}: {
  active: boolean;
  startedAtMs: number | null;
}) {
  const matRef = useRef<MeshStandardMaterial>(null);
  // Reason: VA5.4 — PBR under upgrade settle envelope; pad RGB stays on catalog.
  const flashMat = cuePadFlashMaterials();

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    if (!active || startedAtMs == null) {
      mat.opacity = 0;
      mat.emissiveIntensity = 0;
      return;
    }
    const envelope = stationUpgradePadFlashEnvelope(
      performance.now() - startedAtMs,
    );
    mat.opacity = stationUpgradePadFlashOpacity(envelope);
    mat.emissiveIntensity =
      stationUpgradePadFlashEmissiveIntensity(envelope);
  });

  if (!active) return null;
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.025, 0]}
      receiveShadow
    >
      <circleGeometry args={[STATION_UPGRADE_PAD_FLASH.radius, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={STATION_UPGRADE_PAD_FLASH.padColor}
        transparent
        opacity={STATION_UPGRADE_PAD_FLASH.opacityPeak}
        emissive={STATION_UPGRADE_PAD_FLASH.emissiveColor}
        emissiveIntensity={STATION_UPGRADE_PAD_FLASH.intensityPeak}
        roughness={flashMat.disc.roughness}
        metalness={flashMat.disc.metalness}
      />
    </mesh>
  );
}

/**
 * Working glow + craft-complete + upgrade settle pads for process stations
 * (PL121.2 / PL131.1 / PL137.1).
 */
function ProcessStationCraftPads({
  working,
  nowMs,
  completeFlash = false,
  completeFlashStartedAt = null,
  upgradeFlash = false,
  upgradeFlashStartedAt = null,
}: {
  working: boolean;
  nowMs: number;
  completeFlash?: boolean;
  completeFlashStartedAt?: number | null;
  /** PL137.1 — mill/forge upgrade settle. */
  upgradeFlash?: boolean;
  upgradeFlashStartedAt?: number | null;
}) {
  return (
    <>
      <ProcessStationWorkingPad working={working} nowMs={nowMs} />
      <ProcessStationCompleteFlashPad
        active={completeFlash}
        startedAtMs={completeFlashStartedAt}
      />
      <ProcessStationUpgradeFlashPad
        active={upgradeFlash}
        startedAtMs={upgradeFlashStartedAt}
      />
    </>
  );
}

/**
 * Name-first floating label for process craft stations (PL23.1).
 * Catalog name leads; soft Craft / Working / Collect / Busy by job.
 */
function ProcessStationWorldLabel({
  type,
  y,
  craft = null,
}: {
  type: ProcessStationType;
  y: number;
  craft?: {
    state: "working" | "ready";
    isYours: boolean;
  } | null;
}) {
  const { name, soft } = processStationWorldLabelParts(type, craft);
  return (
    <WorldHtml position={[0, y, 0]} center style={{ pointerEvents: "none" }}>
      <div
        data-testid="process-station-world-label"
        data-station={type}
        data-craft-soft={soft}
        style={{
          background: "rgba(18, 22, 16, 0.82)",
          color: "#e8f0e2",
          padding: "3px 8px",
          borderRadius: 5,
          border: "1px solid #7a6a48",
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
 * Name-first floating label when a gather node is ready (PL23.2).
 * Depleted nodes keep timer/pad only — do not call this then.
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

function MillBuilding({
  highlighted,
  px,
  pz,
  tier,
  landKind = "player_land",
  showFirstWalkUpTip = false,
  craftWorking = false,
  craft = null,
  craftCompleteFlash = false,
  craftCompleteFlashStartedAt = null,
  stationUpgradeFlash = false,
  stationUpgradeFlashStartedAt = null,
  nowMs = 0,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  tier: number;
  /** Active map — City PL173.2 cool grain landmark. */
  landKind?: LandKind;
  /** PL74.1 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL121.2 — soft working glow while craft panel open. */
  craftWorking?: boolean;
  craft?: {
    state: "working" | "ready";
    isYours: boolean;
  } | null;
  /** PL131.1 — brief settle flash after craft success. */
  craftCompleteFlash?: boolean;
  craftCompleteFlashStartedAt?: number | null;
  /** PL137.1 — brief copper settle after upgrade ok. */
  stationUpgradeFlash?: boolean;
  stationUpgradeFlashStartedAt?: number | null;
  nowMs?: number;
}) {
  const hero = heroModelFor("mill");
  const walkUpTip = millFirstWalkUpWorldTip();
  // Reason: PL173.2 — quiet cool grain landmark while on City scarce mill.
  const cityLandmark = cityMillLandmarkCue(landKind);
  // Reason: PL192.2 — quiet warm grain mist leftover on player land (≠ City landmark / working).
  const millAtmosphere = millAtmosphereCue(landKind);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const millAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (cityLandmark.show && hazeMatRef.current) {
      const envelope = cityMillLandmarkPulseEnvelope(performance.now());
      hazeMatRef.current.opacity = cityMillLandmarkHazeOpacity(envelope);
    }
    // Reason: PL192.2 — continuous warm leftover mist on player land.
    if (millAtmosphere.show && millAtmosphereMatRef.current) {
      const envelope = millAtmospherePulseEnvelope(performance.now());
      millAtmosphereMatRef.current.emissiveIntensity =
        millAtmosphereEmissiveIntensity(envelope);
      millAtmosphereMatRef.current.opacity =
        millAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      <ProcessStationCraftPads
        working={craftWorking}
        nowMs={nowMs}
        completeFlash={craftCompleteFlash}
        completeFlashStartedAt={craftCompleteFlashStartedAt}
        upgradeFlash={stationUpgradeFlash}
        upgradeFlashStartedAt={stationUpgradeFlashStartedAt}
      />
      {/* PL173.2 — soft pulsing cool grain landmark under City scarce mill */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          userData={{ cityMillLandmark: true }}
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
      {/* PL192.2 — quiet warm pulsing grain mist leftover on player land */}
      {millAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, millAtmosphere.hazeY, 0]}
          userData={{ millAtmosphere: true }}
        >
          <circleGeometry args={[millAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={millAtmosphereMatRef}
            color={millAtmosphere.hazeColor}
            emissive={millAtmosphere.emissive}
            emissiveIntensity={millAtmosphere.intensity}
            transparent
            opacity={millAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <GltfOrKit
        model={hero}
        kit={
          <MillKitMeshes
            highlighted={highlighted}
            tier={tier}
            landKind={landKind}
            showFirstWalkUpTip={showFirstWalkUpTip}
            craftWorking={craftWorking}
            nowMs={nowMs}
          />
        }
      />
      <ProcessStationWorldLabel
        type="mill"
        y={processStationLabelY("mill")}
        craft={craft}
      />
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 6.05, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="mill-walkup-tip"
            data-mill-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #b8a878",
              boxShadow: "0 0 10px rgba(184,168,120,0.4)",
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

function ForgeBuilding({
  highlighted,
  px,
  pz,
  tier,
  landKind = "player_land",
  showFirstWalkUpTip = false,
  craftWorking = false,
  craft = null,
  
  craftCompleteFlash = false,
  craftCompleteFlashStartedAt = null,
  stationUpgradeFlash = false,
  stationUpgradeFlashStartedAt = null,
  nowMs = 0,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  tier: number;
  /** Active map — City PL173.1 warm ember landmark. */
  landKind?: LandKind;
  /** PL74.3 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL121.2 — soft working glow while craft panel open. */
  craftWorking?: boolean;
  craft?: {
    state: "working" | "ready";
    isYours: boolean;
  } | null;
  /** PL131.1 — brief settle flash after craft success. */
  craftCompleteFlash?: boolean;
  craftCompleteFlashStartedAt?: number | null;
  /** PL137.1 — brief copper settle after upgrade ok. */
  stationUpgradeFlash?: boolean;
  stationUpgradeFlashStartedAt?: number | null;
  nowMs?: number;
}) {
  const walkUpTip = forgeFirstWalkUpWorldTip();
  // Reason: PL173.1 — quiet warm ember landmark while on City scarce forge.
  const cityLandmark = cityForgeLandmarkCue(landKind);
  // Reason: PL193.1 — quiet deep coal mist leftover on player land (≠ City landmark / working).
  const forgeAtmosphere = forgeAtmosphereCue(landKind);
  const lipMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const forgeAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (cityLandmark.show) {
      const envelope = cityForgeLandmarkPulseEnvelope(performance.now());
      const intensity = cityForgeLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = cityForgeLandmarkHazeOpacity(envelope);
      if (lipMatRef.current) {
        lipMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL193.1 — continuous warm leftover mist on player land.
    if (forgeAtmosphere.show && forgeAtmosphereMatRef.current) {
      const envelope = forgeAtmospherePulseEnvelope(performance.now());
      forgeAtmosphereMatRef.current.emissiveIntensity =
        forgeAtmosphereEmissiveIntensity(envelope);
      forgeAtmosphereMatRef.current.opacity =
        forgeAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      <ProcessStationCraftPads
        working={craftWorking}
        nowMs={nowMs}
        completeFlash={craftCompleteFlash}
        completeFlashStartedAt={craftCompleteFlashStartedAt}
        upgradeFlash={stationUpgradeFlash}
        upgradeFlashStartedAt={stationUpgradeFlashStartedAt}
      />
      {/* PL173.1 — soft pulsing warm ember landmark under City scarce forge */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          userData={{ cityForgeLandmark: true }}
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
      {/* PL193.1 — quiet warm pulsing forge mist leftover on player land */}
      {forgeAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, forgeAtmosphere.hazeY, 0]}
          userData={{ forgeAtmosphere: true }}
        >
          <circleGeometry args={[forgeAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={forgeAtmosphereMatRef}
            color={forgeAtmosphere.hazeColor}
            emissive={forgeAtmosphere.emissive}
            emissiveIntensity={forgeAtmosphere.intensity}
            transparent
            opacity={forgeAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <ForgeKitMeshes
        highlighted={highlighted}
        tier={tier}
        showFirstWalkUpTip={showFirstWalkUpTip}
        craftWorking={craftWorking}
        nowMs={nowMs}
        lipMatRef={lipMatRef}
        cityLandmarkShow={cityLandmark.show}
        cityLandmarkEmissive={cityLandmark.emissive}
        cityLandmarkIntensity={cityLandmark.intensity}
      />
      <ProcessStationWorldLabel
        type="forge"
        y={processStationLabelY("forge")}
        craft={craft}
      />
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 2.9, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="forge-walkup-tip"
            data-forge-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #ff6a2a",
              boxShadow: "0 0 10px rgba(255,106,42,0.4)",
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

function PortalBuilding({
  highlighted,
  px,
  pz,
  landKind,
  showFirstWalkUpTip = false,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  landKind: LandKind;
  /** PL42.2 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
}) {
  // Reason: PL14.2 — veil/frame tint encodes circuit role (destination map identity).
  const tint = portalMeshTintForLandKind(landKind);
  // Reason: VA2.1 — shared PBR + footing/band/threshold articulation; colors stay MAP_IDENTITY.
  const kit = portalKitMaterials();
  const label = portalWorldLabelParts(landKind);
  const walkUpTip = portalFirstWalkUpWorldTip();
  // Reason: PL168.2 — quiet cool Free cyan landmark while Free (non-Arena).
  const freeLandmark = portalFreeLandmarkCue(landKind);
  // Reason: PL186.1 — quiet deeper cool Free mist leftover (distinct from landmark).
  const freeAtmosphere = portalFreeAtmosphereCue(landKind);
  const veilMatRef = useRef<MeshStandardMaterial>(null);
  const thresholdMatRef = useRef<MeshStandardMaterial>(null);
  const footingMatLeftRef = useRef<MeshStandardMaterial>(null);
  const footingMatRightRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const atmosphereHazeMatRef = useRef<MeshStandardMaterial>(null);
  const frameColor = highlighted ? tint.portalFrameLit : tint.portalFrame;

  useFrame(() => {
    const now = performance.now();
    const envelope = portalHighlightFreePulseEnvelope(now);
    const veilMat = veilMatRef.current;
    if (veilMat) {
      // Reason: PL120.2 — soft Free pulse while interact-highlighted; idle stays steady.
      veilMat.opacity = portalHighlightFreePulseOpacity(highlighted, envelope);
      veilMat.emissiveIntensity = portalHighlightFreePulseEmissiveIntensity(
        highlighted,
        showFirstWalkUpTip,
        envelope,
      );
    }
    const thresholdMat = thresholdMatRef.current;
    if (thresholdMat) {
      if (isWarriorLandKind(landKind)) {
        // Reason: PL147.2 — warmer Exit threshold pulse on Arena portals (vs cool Free).
        const exitEnvelope = portalArenaExitSoftPulseEnvelope(now);
        thresholdMat.emissive.set(
          portalArenaExitSoftPulseEmissive(highlighted, landKind),
        );
        thresholdMat.emissiveIntensity =
          portalArenaExitSoftPulseEmissiveIntensity(
            highlighted,
            landKind,
            exitEnvelope,
          );
      } else {
        // Reason: PL144.1 — quieter cooler threshold pulse beside veil Free pulse.
        const softEnvelope = portalFreeTravelSoftPulseEnvelope(now);
        thresholdMat.emissive.set(
          portalFreeTravelSoftPulseEmissive(highlighted),
        );
        thresholdMat.emissiveIntensity =
          portalFreeTravelSoftPulseEmissiveIntensity(highlighted, softEnvelope);
      }
    }
    // Reason: PL168.2 — continuous Free cyan footing/haze (independent of highlight pulse).
    if (freeLandmark.show) {
      const landmarkEnv = portalFreeLandmarkPulseEnvelope(now);
      const intensity = portalFreeLandmarkEmissiveIntensity(landmarkEnv);
      const hazeOpacity = portalFreeLandmarkHazeOpacity(landmarkEnv);
      if (footingMatLeftRef.current) {
        footingMatLeftRef.current.emissiveIntensity = intensity;
      }
      if (footingMatRightRef.current) {
        footingMatRightRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL186.1 — continuous Free mist leftover (distinct from landmark disc).
    if (freeAtmosphere.show && atmosphereHazeMatRef.current) {
      const mistEnv = portalFreeAtmospherePulseEnvelope(now);
      atmosphereHazeMatRef.current.opacity =
        portalFreeAtmosphereHazeOpacity(mistEnv);
      atmosphereHazeMatRef.current.emissiveIntensity =
        portalFreeAtmosphereEmissiveIntensity(mistEnv);
    }
  });

  return (
    <group
      position={[px, 0, pz]}
      userData={{ portalTintKind: landKind, portalVeil: tint.portalVeil }}
    >
      {/* PL168.2 — soft pulsing cool Free cyan landmark under fare-free portal */}
      {freeLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          userData={{ portalFreeLandmark: true }}
        >
          <circleGeometry args={[freeLandmark.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={hazeMatRef}
            color={freeLandmark.hazeColor}
            emissive={freeLandmark.emissive}
            emissiveIntensity={0.1}
            transparent
            opacity={freeLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* PL186.1 — soft pulsing deeper cool Free mist leftover (≠ landmark disc) */}
      {freeAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, PORTAL_FREE_ATMOSPHERE_CUE.hazeY, 0]}
          userData={{ portalFreeAtmosphere: true }}
        >
          <circleGeometry args={[PORTAL_FREE_ATMOSPHERE_CUE.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={atmosphereHazeMatRef}
            color={PORTAL_FREE_ATMOSPHERE_CUE.hazeColor}
            emissive={PORTAL_FREE_ATMOSPHERE_CUE.emissive}
            emissiveIntensity={freeAtmosphere.intensity}
            transparent
            opacity={freeAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* Footings — PL168.2 soft Free landmark emissive on non-Arena */}
      <mesh position={[-0.7, 0.08, 0]} castShadow>
        <kitBoxGeometry args={[0.42, 0.16, 0.42]} />
        <TexturedStandardMaterial kind="plaster" ref={footingMatLeftRef}
          color={kit.footingColor}
          roughness={kit.footing.roughness}
          metalness={kit.footing.metalness}
          emissive={freeLandmark.show ? freeLandmark.emissive : "#000000"}
          emissiveIntensity={freeLandmark.show ? freeLandmark.intensity : 0} />
      </mesh>
      <mesh position={[0.7, 0.08, 0]} castShadow>
        <kitBoxGeometry args={[0.42, 0.16, 0.42]} />
        <TexturedStandardMaterial kind="plaster" ref={footingMatRightRef}
          color={kit.footingColor}
          roughness={kit.footing.roughness}
          metalness={kit.footing.metalness}
          emissive={freeLandmark.show ? freeLandmark.emissive : "#000000"}
          emissiveIntensity={freeLandmark.show ? freeLandmark.intensity : 0} />
      </mesh>
      {/* Posts */}
      <mesh position={[-0.7, 1.1, 0]} castShadow>
        <kitBoxGeometry args={[0.28, 2.2, 0.28]} />
        <TexturedStandardMaterial kind="wood" color={frameColor}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness} />
      </mesh>
      <mesh position={[0.7, 1.1, 0]} castShadow>
        <kitBoxGeometry args={[0.28, 2.2, 0.28]} />
        <TexturedStandardMaterial kind="wood" color={frameColor}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness} />
      </mesh>
      {/* Mid bands */}
      <mesh position={[-0.7, 0.85, 0]} castShadow>
        <kitBoxGeometry args={[0.34, 0.1, 0.34]} />
        <TexturedStandardMaterial kind="wood" color={kit.bandColor}
          roughness={kit.band.roughness}
          metalness={kit.band.metalness} />
      </mesh>
      <mesh position={[0.7, 0.85, 0]} castShadow>
        <kitBoxGeometry args={[0.34, 0.1, 0.34]} />
        <TexturedStandardMaterial kind="wood" color={kit.bandColor}
          roughness={kit.band.roughness}
          metalness={kit.band.metalness} />
      </mesh>
      {/* Threshold slab — PL144.1 cooler Free / PL147.2 warmer Exit on Arena */}
      <mesh position={[0, 0.06, 0.08]} receiveShadow>
        <kitBoxGeometry args={[1.35, 0.1, 0.55]} />
        <TexturedStandardMaterial kind="wood" ref={thresholdMatRef}
          color={kit.thresholdColor}
          roughness={kit.threshold.roughness}
          metalness={kit.threshold.metalness}
          emissive={
            isWarriorLandKind(landKind)
              ? portalArenaExitSoftPulseEmissive(highlighted, landKind)
              : portalFreeTravelSoftPulseEmissive(highlighted)
          }
          emissiveIntensity={
            isWarriorLandKind(landKind)
              ? PORTAL_ARENA_EXIT_SOFT_PULSE.emissiveIdle
              : PORTAL_FREE_TRAVEL_SOFT_PULSE.emissiveIdle
          } />
      </mesh>
      {/* Lintel + keystone */}
      <mesh position={[0, 2.25, 0]} castShadow>
        <kitBoxGeometry args={[1.7, 0.28, 0.35]} />
        <TexturedStandardMaterial kind="wood" color={tint.portalLintel}
          roughness={kit.lintel.roughness}
          metalness={kit.lintel.metalness} />
      </mesh>
      <mesh position={[0, 2.42, 0]} castShadow>
        <kitBoxGeometry args={[0.32, 0.18, 0.4]} />
        <TexturedStandardMaterial kind="wood" color={kit.keystoneColor}
          roughness={kit.keystone.roughness}
          metalness={kit.keystone.metalness} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <planeGeometry args={[1.1, 1.8]} />
        <meshStandardMaterial
          ref={veilMatRef}
          color={tint.portalVeil}
          transparent
          opacity={PORTAL_HIGHLIGHT_FREE_PULSE.opacityIdle}
          emissive={tint.portalEmissive}
          emissiveIntensity={PORTAL_HIGHLIGHT_FREE_PULSE.emissiveIdle}
        />
      </mesh>
      {/* PL37.1 — soft world Html names fare-free circuit role; PL42.2 tip once */}
      <WorldHtml position={[0, 2.85, 0]} center style={{ pointerEvents: "none" }}>
        <div
          data-testid="portal-world-label"
          data-portal-kind={landKind}
          data-portal-walkup-tip={showFirstWalkUpTip ? "1" : "0"}
          data-portal-free-pulse={highlighted ? "1" : "0"}
          data-portal-free-travel-soft-pulse={highlighted ? "1" : "0"}
          data-portal-free-landmark={freeLandmark.show ? "1" : "0"}
          style={{
            background: "rgba(18, 22, 16, 0.82)",
            color: "#e8f0e2",
            padding: "3px 8px",
            borderRadius: 5,
            border: `1px solid ${
              showFirstWalkUpTip ? tint.portalFrameLit : tint.portalVeil
            }`,
            fontSize: 11,
            whiteSpace: "nowrap",
            textAlign: "center",
            lineHeight: 1.2,
            boxShadow: highlighted
              ? `0 0 8px color-mix(in srgb, ${tint.portalVeil} 40%, transparent)`
              : "none",
          }}
        >
          <div style={{ fontWeight: 650 }}>{label.name}</div>
          <div style={{ fontSize: 9, opacity: 0.75 }}>{label.soft}</div>
          {showFirstWalkUpTip ? (
            <div
              data-testid="portal-walkup-tip"
              style={{ fontSize: 9, opacity: 0.9, marginTop: 2 }}
            >
              {walkUpTip}
            </div>
          ) : null}
        </div>
      </WorldHtml>
      <HighlightRing show={highlighted} />
    </group>
  );
}

function DecorPadBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  showFirstWalkUpTip = false,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — player land PL176.1 landmark + PL201.1 rosewood mist. */
  landKind?: LandKind;
  /** PL75.1 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
}) {
  const walkUpTip = decorPadFirstWalkUpWorldTip();
  // Reason: VA2.4 — stone pad + lip PBR; walk-up tip emissive unchanged.
  const kit = housingDecorPadKitMaterials(highlighted);
  // Reason: PL176.1 — quiet warm decor landmark while on player land.
  const decorLandmark = housingDecorLandmarkCue(landKind);
  // Reason: PL201.1 — quiet warm rosewood mist leftover (≠ landmark / tip / place).
  const decorAtmosphere = housingDecorAtmosphereCue(landKind);
  const lipMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const atmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const now = performance.now();
    if (decorLandmark.show) {
      const envelope = housingDecorLandmarkPulseEnvelope(now);
      const intensity = housingDecorLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = housingDecorLandmarkHazeOpacity(envelope);
      if (lipMatRef.current) lipMatRef.current.emissiveIntensity = intensity;
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL201.1 — continuous warm leftover mist while decor pad on player land.
    if (decorAtmosphere.show && atmosphereMatRef.current) {
      const envelope = housingDecorAtmospherePulseEnvelope(now);
      atmosphereMatRef.current.emissiveIntensity =
        housingDecorAtmosphereEmissiveIntensity(envelope);
      atmosphereMatRef.current.opacity =
        housingDecorAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* PL176.1 — soft pulsing warm decor landmark under housing decor_pad */}
      {decorLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          userData={{ housingDecorLandmark: true }}
        >
          <circleGeometry args={[decorLandmark.hazeRadius, 20]} />
          <meshStandardMaterial
            ref={hazeMatRef}
            color={decorLandmark.hazeColor}
            emissive={decorLandmark.emissive}
            emissiveIntensity={0.1}
            transparent
            opacity={decorLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* PL201.1 — quiet warm pulsing rosewood mist leftover over decor pad */}
      {decorAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, decorAtmosphere.hazeY, 0]}
          userData={{ housingDecorAtmosphere: true }}
        >
          <circleGeometry args={[decorAtmosphere.hazeRadius, 20]} />
          <meshStandardMaterial
            ref={atmosphereMatRef}
            color={decorAtmosphere.hazeColor}
            emissive={decorAtmosphere.emissive}
            emissiveIntensity={decorAtmosphere.intensity}
            transparent
            opacity={decorAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.08, 12]} />
        <TexturedStandardMaterial kind="stone" color={kit.padColor}
          roughness={kit.pad.roughness}
          metalness={kit.pad.metalness}
          emissive={showFirstWalkUpTip ? "#c4b07a" : "#000000"}
          emissiveIntensity={showFirstWalkUpTip ? 0.22 : 0} />
      </mesh>
      {/* Lip ring (VA2.4) */}
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <cylinderGeometry args={[0.58, 0.62, 0.04, 12]} />
        <TexturedStandardMaterial kind="stone" ref={lipMatRef}
          color={kit.lipColor}
          roughness={kit.lip.roughness}
          metalness={kit.lip.metalness}
          emissive={
            decorLandmark.show ? decorLandmark.emissive : "#000000"
          }
          emissiveIntensity={
            decorLandmark.show ? decorLandmark.intensity : 0
          } />
      </mesh>
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 1.15, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="decor-pad-walkup-tip"
            data-decor-pad-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #c4b07a",
              boxShadow: "0 0 10px rgba(196,176,122,0.35)",
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

function DecorPlanterBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — player land PL176.1 landmark + PL201.1 rosewood mist. */
  landKind?: LandKind;
}) {
  const { name, soft } = housingDecorWorldLabelParts("planter");
  // Reason: VA2.4 — pot / foliage / bloom PBR + rim / soil articulation.
  const kit = housingDecorPlanterKitMaterials(highlighted);
  // Reason: PL176.1 — quiet warm decor landmark on placed planter.
  const decorLandmark = housingDecorLandmarkCue(landKind);
  // Reason: PL201.1 — quiet warm rosewood mist leftover (≠ landmark / tip / place).
  const decorAtmosphere = housingDecorAtmosphereCue(landKind);
  const rimMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const atmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const now = performance.now();
    if (decorLandmark.show) {
      const envelope = housingDecorLandmarkPulseEnvelope(now);
      const intensity = housingDecorLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = housingDecorLandmarkHazeOpacity(envelope);
      if (rimMatRef.current) rimMatRef.current.emissiveIntensity = intensity;
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    if (decorAtmosphere.show && atmosphereMatRef.current) {
      const envelope = housingDecorAtmospherePulseEnvelope(now);
      atmosphereMatRef.current.emissiveIntensity =
        housingDecorAtmosphereEmissiveIntensity(envelope);
      atmosphereMatRef.current.opacity =
        housingDecorAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {decorLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          userData={{ housingDecorLandmark: true }}
        >
          <circleGeometry args={[decorLandmark.hazeRadius, 20]} />
          <meshStandardMaterial
            ref={hazeMatRef}
            color={decorLandmark.hazeColor}
            emissive={decorLandmark.emissive}
            emissiveIntensity={0.1}
            transparent
            opacity={decorLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {decorAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, decorAtmosphere.hazeY, 0]}
          userData={{ housingDecorAtmosphere: true }}
        >
          <circleGeometry args={[decorAtmosphere.hazeRadius, 20]} />
          <meshStandardMaterial
            ref={atmosphereMatRef}
            color={decorAtmosphere.hazeColor}
            emissive={decorAtmosphere.emissive}
            emissiveIntensity={decorAtmosphere.intensity}
            transparent
            opacity={decorAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.55, 10]} />
        <TexturedStandardMaterial kind="plaster" color={kit.potColor}
          roughness={kit.pot.roughness}
          metalness={kit.pot.metalness} />
      </mesh>
      {/* Pot rim (VA2.4) */}
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.4, 0.06, 10]} />
        <TexturedStandardMaterial kind="plaster" ref={rimMatRef}
          color={kit.rimColor}
          roughness={kit.pot.roughness}
          metalness={kit.pot.metalness}
          emissive={
            decorLandmark.show ? decorLandmark.emissive : "#000000"
          }
          emissiveIntensity={
            decorLandmark.show ? decorLandmark.intensity : 0
          } />
      </mesh>
      {/* Soil bed (VA2.4) */}
      <mesh position={[0, 0.58, 0]} receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 10]} />
        <TexturedStandardMaterial kind="dirt" color={kit.soilColor}
          roughness={kit.soil.roughness}
          metalness={kit.soil.metalness} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.32, 10, 8]} />
        <TexturedStandardMaterial kind="grass" color={kit.foliageColor}
          roughness={kit.foliage.roughness}
          metalness={kit.foliage.metalness} />
      </mesh>
      <mesh position={[0.12, 0.95, 0.05]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <TexturedStandardMaterial kind="grass" color={kit.bloomColor}
          roughness={kit.bloom.roughness}
          metalness={kit.bloom.metalness} />
      </mesh>
      <WorldHtml position={[0, 1.55, 0]} center style={{ pointerEvents: "none" }}>
        <div
          data-testid="housing-decor-world-label"
          data-decor-id="planter"
          style={{
            background: "rgba(18, 22, 16, 0.82)",
            color: "#e8f0e2",
            padding: "3px 8px",
            borderRadius: 5,
            border: "1px solid #7a6a48",
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
      <HighlightRing show={highlighted} />
    </group>
  );
}

function DecorBannerBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — player land PL176.1 landmark + PL201.1 rosewood mist. */
  landKind?: LandKind;
}) {
  const { name, soft } = housingDecorWorldLabelParts("banner");
  // Reason: VA2.4 — pole / cloth / finial PBR.
  const kit = housingDecorBannerKitMaterials(highlighted);
  // Reason: PL176.1 — quiet warm decor landmark on placed banner.
  const decorLandmark = housingDecorLandmarkCue(landKind);
  // Reason: PL201.1 — quiet warm rosewood mist leftover (≠ landmark / tip / place).
  const decorAtmosphere = housingDecorAtmosphereCue(landKind);
  const footingMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const atmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const now = performance.now();
    if (decorLandmark.show) {
      const envelope = housingDecorLandmarkPulseEnvelope(now);
      const intensity = housingDecorLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = housingDecorLandmarkHazeOpacity(envelope);
      if (footingMatRef.current) {
        footingMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    if (decorAtmosphere.show && atmosphereMatRef.current) {
      const envelope = housingDecorAtmospherePulseEnvelope(now);
      atmosphereMatRef.current.emissiveIntensity =
        housingDecorAtmosphereEmissiveIntensity(envelope);
      atmosphereMatRef.current.opacity =
        housingDecorAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {decorLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          userData={{ housingDecorLandmark: true }}
        >
          <circleGeometry args={[decorLandmark.hazeRadius, 20]} />
          <meshStandardMaterial
            ref={hazeMatRef}
            color={decorLandmark.hazeColor}
            emissive={decorLandmark.emissive}
            emissiveIntensity={0.1}
            transparent
            opacity={decorLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {decorAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, decorAtmosphere.hazeY, 0]}
          userData={{ housingDecorAtmosphere: true }}
        >
          <circleGeometry args={[decorAtmosphere.hazeRadius, 20]} />
          <meshStandardMaterial
            ref={atmosphereMatRef}
            color={decorAtmosphere.hazeColor}
            emissive={decorAtmosphere.emissive}
            emissiveIntensity={decorAtmosphere.intensity}
            transparent
            opacity={decorAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.2, 8]} />
        <TexturedStandardMaterial kind="plaster" color={kit.poleColor}
          roughness={kit.pole.roughness}
          metalness={kit.pole.metalness} />
      </mesh>
      {/* Pole footing (VA2.4) */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.12, 8]} />
        <TexturedStandardMaterial kind="plaster" ref={footingMatRef}
          color={kit.poleColor}
          roughness={kit.pole.roughness}
          metalness={kit.pole.metalness}
          emissive={
            decorLandmark.show ? decorLandmark.emissive : "#000000"
          }
          emissiveIntensity={
            decorLandmark.show ? decorLandmark.intensity : 0
          } />
      </mesh>
      {/* Finial (VA2.4) */}
      <mesh position={[0, 2.25, 0]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <TexturedStandardMaterial kind="plaster" color={kit.finialColor}
          roughness={kit.finial.roughness}
          metalness={kit.finial.metalness} />
      </mesh>
      <mesh position={[0.35, 1.55, 0]} castShadow>
        <kitBoxGeometry args={[0.7, 0.55, 0.04]} />
        <TexturedStandardMaterial kind="cloth" color={kit.clothColor}
          roughness={kit.cloth.roughness}
          metalness={kit.cloth.metalness} />
      </mesh>
      <WorldHtml position={[0, 2.35, 0]} center style={{ pointerEvents: "none" }}>
        <div
          data-testid="housing-decor-world-label"
          data-decor-id="banner"
          style={{
            background: "rgba(18, 22, 16, 0.82)",
            color: "#e8f0e2",
            padding: "3px 8px",
            borderRadius: 5,
            border: "1px solid #7a6a48",
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
      <HighlightRing show={highlighted} />
    </group>
  );
}

function KitchenBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  showFirstWalkUpTip = false,
  craftWorking = false,
  craft = null,
  
  craftCompleteFlash = false,
  craftCompleteFlashStartedAt = null,
  nowMs = 0,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — City PL174.1 warm hearth landmark. */
  landKind?: LandKind;
  /** PL70.1 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL121.2 — soft working glow while craft panel open. */
  craftWorking?: boolean;
  craft?: {
    state: "working" | "ready";
    isYours: boolean;
  } | null;
  /** PL131.1 — brief settle flash after craft success. */
  craftCompleteFlash?: boolean;
  craftCompleteFlashStartedAt?: number | null;
  nowMs?: number;
}) {
  const walkUpTip = kitchenFirstWalkUpWorldTip();
  // Reason: PL174.1 — quiet warm hearth landmark while on City scarce kitchen.
  const cityLandmark = cityKitchenLandmarkCue(landKind);
  // Reason: PL193.2 — quiet stew-hearth mist leftover on player land (≠ City landmark / working).
  const kitchenAtmosphere = kitchenAtmosphereCue(landKind);
  const lipMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const kitchenAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (cityLandmark.show) {
      const envelope = cityKitchenLandmarkPulseEnvelope(performance.now());
      const intensity = cityKitchenLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = cityKitchenLandmarkHazeOpacity(envelope);
      if (lipMatRef.current) {
        lipMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL193.2 — continuous warm leftover mist on player land.
    if (kitchenAtmosphere.show && kitchenAtmosphereMatRef.current) {
      const envelope = kitchenAtmospherePulseEnvelope(performance.now());
      kitchenAtmosphereMatRef.current.emissiveIntensity =
        kitchenAtmosphereEmissiveIntensity(envelope);
      kitchenAtmosphereMatRef.current.opacity =
        kitchenAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      <ProcessStationCraftPads
        working={craftWorking}
        nowMs={nowMs}
        completeFlash={craftCompleteFlash}
        completeFlashStartedAt={craftCompleteFlashStartedAt}
      />
      {/* PL174.1 — soft pulsing warm hearth landmark under City scarce kitchen */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          userData={{ cityKitchenLandmark: true }}
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
      {/* PL193.2 — quiet warm pulsing hearth mist leftover on player land */}
      {kitchenAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, kitchenAtmosphere.hazeY, 0]}
          userData={{ kitchenAtmosphere: true }}
        >
          <circleGeometry args={[kitchenAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={kitchenAtmosphereMatRef}
            color={kitchenAtmosphere.hazeColor}
            emissive={kitchenAtmosphere.emissive}
            emissiveIntensity={kitchenAtmosphere.intensity}
            transparent
            opacity={kitchenAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <KitchenKitMeshes
        highlighted={highlighted}
        showFirstWalkUpTip={showFirstWalkUpTip}
        craftWorking={craftWorking}
        nowMs={nowMs}
        lipMatRef={lipMatRef}
        cityLandmarkShow={cityLandmark.show}
        cityLandmarkEmissive={cityLandmark.emissive}
        cityLandmarkIntensity={cityLandmark.intensity}
      />
      <ProcessStationWorldLabel
        type="kitchen"
        y={processStationLabelY("kitchen")}
        craft={craft}
      />
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 2.25, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="kitchen-walkup-tip"
            data-kitchen-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #c45a2a",
              boxShadow: "0 0 10px rgba(196,90,42,0.4)",
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

function TreeStumpBuilding({
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
  /** PL68.1 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL116.2 — Explore premium glow when ready. */
  landKind?: LandKind;
  /** PL131.2 — brief mint-lime pad after successful chop. */
  gatherSuccessFlash?: boolean;
  gatherSuccessFlashStartedAt?: number | null;
}) {
  const ready = building.readyAt == null || nowMs >= building.readyAt;
  const look = gatherStumpWorldVisual(ready, highlighted);
  const surf = gatherStumpSurfaceMaterials(ready);
  const premiumGlow = explorePremiumNodeGlow(landKind, ready, "wood");
  const walkUpTip = treeStumpFirstWalkUpWorldTip();
  // Reason: PL171.2 — quiet cool woodland landmark while on City scarce stump.
  const cityLandmark = cityTreeStumpLandmarkCue(landKind);
  // Reason: PL191.2 — quiet cool wood mist leftover on player land (≠ City landmark / ready top).
  const stumpAtmosphere = treeStumpAtmosphereCue(landKind);
  const topMatRef = useRef<MeshStandardMaterial>(null);
  const bodyMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const stumpAtmosphereMatRef = useRef<MeshStandardMaterial>(null);
  const trunkEmissive = showFirstWalkUpTip
    ? "#6a8a4a"
    : premiumGlow.show
      ? premiumGlow.emissive
      : cityLandmark.show
        ? cityLandmark.emissive
        : "#000000";
  const trunkEmissiveIntensity = showFirstWalkUpTip
    ? 0.28
    : premiumGlow.show
      ? premiumGlow.intensity * 0.55
      : cityLandmark.show
        ? cityLandmark.intensity * 0.55
        : 0;
  const canopyEmissive = showFirstWalkUpTip
    ? "#8aaa68"
    : premiumGlow.show
      ? premiumGlow.emissive
      : cityLandmark.show
        ? cityLandmark.emissive
        : "#000000";
  const canopyEmissiveIntensity = showFirstWalkUpTip
    ? 0.32
    : premiumGlow.show
      ? premiumGlow.intensity * 0.7
      : cityLandmark.show
        ? cityLandmark.intensity
        : 0;

  useFrame(() => {
    if (cityLandmark.show && !showFirstWalkUpTip && !premiumGlow.show) {
      const envelope = cityTreeStumpLandmarkPulseEnvelope(performance.now());
      const intensity = cityTreeStumpLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = cityTreeStumpLandmarkHazeOpacity(envelope);
      if (topMatRef.current) topMatRef.current.emissiveIntensity = intensity;
      if (bodyMatRef.current) {
        bodyMatRef.current.emissiveIntensity = intensity * 0.55;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL191.2 — continuous cool leftover mist on player land.
    if (stumpAtmosphere.show && stumpAtmosphereMatRef.current) {
      const envelope = treeStumpAtmospherePulseEnvelope(performance.now());
      stumpAtmosphereMatRef.current.emissiveIntensity =
        treeStumpAtmosphereEmissiveIntensity(envelope);
      stumpAtmosphereMatRef.current.opacity =
        treeStumpAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* PL171.2 — soft pulsing cool woodland landmark under City scarce stump */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          userData={{ cityTreeStumpLandmark: true }}
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
      {/* PL191.2 — quiet cool pulsing wood mist leftover on player land */}
      {stumpAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, stumpAtmosphere.hazeY, 0]}
          userData={{ treeStumpAtmosphere: true }}
        >
          <circleGeometry args={[stumpAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={stumpAtmosphereMatRef}
            color={stumpAtmosphere.hazeColor}
            emissive={stumpAtmosphere.emissive}
            emissiveIntensity={stumpAtmosphere.intensity}
            transparent
            opacity={stumpAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* PL12.2 — quiet depleted pad distinct from ready stump */}
      {look.showDepletedPad ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          receiveShadow
        >
          <circleGeometry args={[1.0, 20]} />
          <meshStandardMaterial
            color={look.padColor}
            transparent
            opacity={look.padOpacity}
            emissive={showFirstWalkUpTip ? "#6a8a4a" : "#000000"}
            emissiveIntensity={showFirstWalkUpTip ? 0.22 : 0}
          />
        </mesh>
      ) : null}
      {/* PL116.2 — soft Explore premium glow while chop-ready */}
      {premiumGlow.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.025, 0]}
          receiveShadow
        >
          <circleGeometry args={[1.05, 20]} />
          <meshStandardMaterial
            color={premiumGlow.padColor}
            transparent
            opacity={premiumGlow.padOpacity}
            emissive={
              showFirstWalkUpTip ? "#6a8a4a" : premiumGlow.emissive
            }
            emissiveIntensity={
              showFirstWalkUpTip ? 0.4 : premiumGlow.intensity
            }
          />
        </mesh>
      ) : null}
      {/* PL131.2 — brief mint-lime settle after Chopped */}
      <GatherSuccessFlashPad
        active={gatherSuccessFlash}
        startedAtMs={gatherSuccessFlashStartedAt}
        y={0.03}
        radius={1.08}
      />
      {ready ? (
        <GatherReadyTreeMesh
          worldX={px}
          worldZ={pz}
          trunkColor={look.bodyColor}
          trunkMatRef={bodyMatRef}
          canopyMatRef={topMatRef}
          emissive={trunkEmissive}
          trunkEmissiveIntensity={trunkEmissiveIntensity}
          canopyEmissive={canopyEmissive}
          canopyEmissiveIntensity={canopyEmissiveIntensity}
        />
      ) : (
        <GatherDepletedStumpMesh
          bodyColor={look.bodyColor}
          topColor={look.topColor}
          barkBandColor={surf.barkBandColor}
          rootColor={surf.rootColor}
          bodyRoughness={surf.body.roughness}
          bodyMetalness={surf.body.metalness}
          topRoughness={surf.top.roughness}
          topMetalness={surf.top.metalness}
          bodyMatRef={bodyMatRef}
          topMatRef={topMatRef}
          emissive={trunkEmissive}
          bodyEmissiveIntensity={trunkEmissiveIntensity}
          topEmissive={canopyEmissive}
          topEmissiveIntensity={canopyEmissiveIntensity}
        />
      )}
      {/* PL23.2 — name + Ready when choppable; depleted stays timer only */}
      {ready ? (
        <GatherReadyWorldLabel type="tree_stump" y={GATHER_READY_TREE.labelY} />
      ) : null}
      {showFirstWalkUpTip ? (
        <WorldHtml
          position={[
            0,
            ready ? GATHER_READY_TREE.walkUpTipY : GATHER_READY_TREE.depletedWalkUpTipY,
            0,
          ]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            data-testid="tree-stump-walkup-tip"
            data-tree-stump-walkup-tip="1"
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

function WorkshopBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  showFirstWalkUpTip = false,
  craftWorking = false,
  craft = null,
  
  craftCompleteFlash = false,
  craftCompleteFlashStartedAt = null,
  nowMs = 0,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — City PL172.2 warm timber landmark. */
  landKind?: LandKind;
  /** PL74.2 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL121.2 — soft working glow while craft panel open. */
  craftWorking?: boolean;
  craft?: {
    state: "working" | "ready";
    isYours: boolean;
  } | null;
  /** PL131.1 — brief settle flash after craft success. */
  craftCompleteFlash?: boolean;
  craftCompleteFlashStartedAt?: number | null;
  nowMs?: number;
}) {
  const walkUpTip = workshopFirstWalkUpWorldTip();
  // Reason: PL172.2 — quiet warm timber landmark while on City scarce workshop.
  const cityLandmark = cityWorkshopLandmarkCue(landKind);
  // Reason: PL196.1 — quiet deep timber mist leftover on player land (≠ City landmark / working).
  const workshopAtmosphere = workshopAtmosphereCue(landKind);
  const plankMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const workshopAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (cityLandmark.show) {
      const envelope = cityWorkshopLandmarkPulseEnvelope(performance.now());
      const intensity = cityWorkshopLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = cityWorkshopLandmarkHazeOpacity(envelope);
      if (plankMatRef.current) {
        plankMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL196.1 — continuous warm leftover mist on player land.
    if (workshopAtmosphere.show && workshopAtmosphereMatRef.current) {
      const envelope = workshopAtmospherePulseEnvelope(performance.now());
      workshopAtmosphereMatRef.current.emissiveIntensity =
        workshopAtmosphereEmissiveIntensity(envelope);
      workshopAtmosphereMatRef.current.opacity =
        workshopAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      <ProcessStationCraftPads
        working={craftWorking}
        nowMs={nowMs}
        completeFlash={craftCompleteFlash}
        completeFlashStartedAt={craftCompleteFlashStartedAt}
      />
      {/* PL172.2 — soft pulsing warm timber landmark under City scarce workshop */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          userData={{ cityWorkshopLandmark: true }}
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
      {/* PL196.1 — quiet warm pulsing timber mist leftover on player land */}
      {workshopAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, workshopAtmosphere.hazeY, 0]}
          userData={{ workshopAtmosphere: true }}
        >
          <circleGeometry args={[workshopAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={workshopAtmosphereMatRef}
            color={workshopAtmosphere.hazeColor}
            emissive={workshopAtmosphere.emissive}
            emissiveIntensity={workshopAtmosphere.intensity}
            transparent
            opacity={workshopAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <WorkshopKitMeshes
        highlighted={highlighted}
        showFirstWalkUpTip={showFirstWalkUpTip}
        craftWorking={craftWorking}
        nowMs={nowMs}
        plankMatRef={plankMatRef}
        cityLandmarkShow={cityLandmark.show}
        cityLandmarkEmissive={cityLandmark.emissive}
        cityLandmarkIntensity={cityLandmark.intensity}
      />
      <ProcessStationWorldLabel
        type="workshop"
        y={processStationLabelY("workshop")}
        craft={craft}
      />
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 2.15, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="workshop-walkup-tip"
            data-workshop-walkup-tip="1"
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
      <HighlightRing show={highlighted} />
    </group>
  );
}

/** CL26.2 — light land pen stub; no livestock mesh/combat. */
function AnimalPenBuilding({
  highlighted,
  px,
  pz,
  building,
  nowMs,
  landKind,
  showFirstWalkUpTip = false,
  gatherSuccessFlash = false,
  gatherSuccessFlashStartedAt = null,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  building: BuildingDto;
  nowMs: number;
  landKind?: LandKind;
  /** PL66.2 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL131.2 — brief mint-lime pad after successful collect. */
  gatherSuccessFlash?: boolean;
  gatherSuccessFlashStartedAt?: number | null;
}) {
  const ready = building.readyAt == null || nowMs >= building.readyAt;
  const penKit = gatherPenSurfaceMaterials(ready);
  const rail = highlighted ? penKit.railLitColor : penKit.railColor;
  const walkUpTip = animalPenFirstWalkUpWorldTip();
  const pulse = animalPenReadyPadPulse(ready);
  // Reason: PL170.2 — quiet warm pen landmark while on City scarce animal pen.
  const cityLandmark = cityAnimalPenLandmarkCue(landKind);
  // Reason: PL191.1 — quiet warm pen mist leftover on player land (≠ City landmark / ready pad).
  const penAtmosphere = animalPenAtmosphereCue(landKind);
  const padMatRef = useRef<MeshStandardMaterial>(null);
  const troughMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const penAtmosphereMatRef = useRef<MeshStandardMaterial>(null);
  // Reason: PL30.2 — quiet pad when settling; ready pad stays brighter (no spawn invent).
  // PL127.1 — ready uses soft pulse pad color; cooling keeps prior quiet greens.
  const padColor = pulse.show
    ? pulse.padColor
    : ready
      ? highlighted
        ? "#6a8a4a"
        : "#3a5a28"
      : highlighted
        ? "#4a5a38"
        : "#2a3a20";

  useFrame(() => {
    const mat = padMatRef.current;
    if (mat) {
      if (showFirstWalkUpTip) {
        mat.emissiveIntensity = 0.28;
      } else {
        // PL127.1 — soft pad emissive sine while collect-ready (cooldown / rates unchanged).
        const envelope = ready
          ? animalPenReadyPadPulseEnvelope(performance.now())
          : 0;
        mat.emissiveIntensity = animalPenReadyPadEmissiveIntensity(
          ready,
          envelope,
        );
      }
    }
    // Reason: PL170.2 — continuous warm hay footing/haze (independent of ready pad).
    if (cityLandmark.show) {
      const landmarkEnv = cityAnimalPenLandmarkPulseEnvelope(performance.now());
      const intensity = cityAnimalPenLandmarkEmissiveIntensity(landmarkEnv);
      const hazeOpacity = cityAnimalPenLandmarkHazeOpacity(landmarkEnv);
      if (troughMatRef.current) {
        troughMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL191.1 — continuous warm leftover mist on player land.
    if (penAtmosphere.show && penAtmosphereMatRef.current) {
      const envelope = animalPenAtmospherePulseEnvelope(performance.now());
      penAtmosphereMatRef.current.emissiveIntensity =
        animalPenAtmosphereEmissiveIntensity(envelope);
      penAtmosphereMatRef.current.opacity =
        animalPenAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* PL170.2 — soft pulsing warm hay landmark under City scarce animal pen */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          userData={{ cityAnimalPenLandmark: true }}
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
      {/* PL191.1 — quiet warm pulsing pen mist leftover on player land */}
      {penAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, penAtmosphere.hazeY, 0]}
          userData={{ animalPenAtmosphere: true }}
        >
          <circleGeometry args={[penAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={penAtmosphereMatRef}
            color={penAtmosphere.hazeColor}
            emissive={penAtmosphere.emissive}
            emissiveIntensity={penAtmosphere.intensity}
            transparent
            opacity={penAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <kitBoxGeometry args={[1.9, 0.08, 1.9]} />
        <TexturedStandardMaterial
          ref={padMatRef}
          kind="dirt"
          color={padColor}
          emissive={
            showFirstWalkUpTip
              ? "#6a8a4a"
              : pulse.show
                ? pulse.padEmissive
                : "#000000"
          }
          emissiveIntensity={showFirstWalkUpTip ? 0.28 : 0}
          transparent={pulse.show}
          opacity={pulse.show ? 0.92 : 1}
          repeat={2}
        />
      </mesh>
      {/* PL127.1 — soft ready under-pad halo (cooling stays quiet) */}
      {pulse.show ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[1.05, 20]} />
          <meshStandardMaterial
            color={pulse.padColor}
            transparent
            opacity={pulse.padOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* PL131.2 — brief mint-lime settle after Collected */}
      <GatherSuccessFlashPad
        active={gatherSuccessFlash}
        startedAtMs={gatherSuccessFlashStartedAt}
        y={0.035}
        radius={1.18}
      />
      {/* Open corral rails (not solid walls) + corner posts / trough / hay */}
      {([0.28, 0.58] as const).map((y) => (
        <group key={`pen-rail-${y}`}>
          <mesh position={[0, y, -0.9]} castShadow>
            <kitBoxGeometry args={[1.85, 0.07, 0.07]} />
            <TexturedStandardMaterial
              kind="wood"
              color={rail}
              roughness={penKit.rail.roughness}
              metalness={penKit.rail.metalness}
            />
          </mesh>
          <mesh position={[0, y, 0.9]} castShadow>
            <kitBoxGeometry args={[1.85, 0.07, 0.07]} />
            <TexturedStandardMaterial
              kind="wood"
              color={rail}
              roughness={penKit.rail.roughness}
              metalness={penKit.rail.metalness}
            />
          </mesh>
          <mesh position={[-0.9, y, 0]} castShadow>
            <kitBoxGeometry args={[0.07, 0.07, 1.65]} />
            <TexturedStandardMaterial
              kind="wood"
              color={rail}
              roughness={penKit.rail.roughness}
              metalness={penKit.rail.metalness}
            />
          </mesh>
          <mesh position={[0.9, y, 0]} castShadow>
            <kitBoxGeometry args={[0.07, 0.07, 1.65]} />
            <TexturedStandardMaterial
              kind="wood"
              color={rail}
              roughness={penKit.rail.roughness}
              metalness={penKit.rail.metalness}
            />
          </mesh>
        </group>
      ))}
      {(
        [
          [-0.9, -0.9],
          [0.9, -0.9],
          [-0.9, 0.9],
          [0.9, 0.9],
        ] as const
      ).map(([ox, oz]) => (
        <mesh key={`pen-post-${ox}-${oz}`} position={[ox, 0.55, oz]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 1.0, 6]} />
          <TexturedStandardMaterial kind="wood" color={rail}
            roughness={penKit.post.roughness}
            metalness={penKit.post.metalness} />
        </mesh>
      ))}
      <mesh position={[0, 0.22, 0.35]} castShadow>
        <kitBoxGeometry args={[0.7, 0.22, 0.35]} />
        <TexturedStandardMaterial kind="wood" ref={troughMatRef}
          color={penKit.troughColor}
          roughness={penKit.trough.roughness}
          metalness={penKit.trough.metalness}
          emissive={cityLandmark.show ? cityLandmark.emissive : "#000000"}
          emissiveIntensity={cityLandmark.show ? cityLandmark.intensity : 0} />
      </mesh>
      {penKit.showHay ? (
        <mesh position={[-0.35, 0.18, -0.25]} castShadow>
          <kitBoxGeometry args={[0.55, 0.18, 0.4]} />
          <TexturedStandardMaterial kind="grass" color={penKit.hayColor}
            roughness={penKit.hay.roughness}
            metalness={penKit.hay.metalness} />
        </mesh>
      ) : null}
      {/* PL30.2 — name + Ready when care available; depleted stays timer/pad */}
      {ready ? <GatherReadyWorldLabel type="animal_pen" y={1.55} /> : null}
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 1.9, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="animal-pen-walkup-tip"
            data-animal-pen-walkup-tip="1"
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

function LoomBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  showFirstWalkUpTip = false,
  craftWorking = false,
  craft = null,
  
  craftCompleteFlash = false,
  craftCompleteFlashStartedAt = null,
  nowMs = 0,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — City PL169.2 warm thread landmark. */
  landKind?: LandKind;
  /** PL77.1 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL121.2 — soft working glow while craft panel open. */
  craftWorking?: boolean;
  craft?: {
    state: "working" | "ready";
    isYours: boolean;
  } | null;
  /** PL131.1 — brief settle flash after craft success. */
  craftCompleteFlash?: boolean;
  craftCompleteFlashStartedAt?: number | null;
  nowMs?: number;
}) {
  const walkUpTip = loomFirstWalkUpWorldTip();
  // Reason: PL169.2 — quiet warm thread landmark while on City scarce loom.
  const cityLandmark = cityLoomLandmarkCue(landKind);
  // Reason: PL194.1 — quiet deep thread mist leftover on player land (≠ City landmark / working).
  const loomAtmosphere = loomAtmosphereCue(landKind);
  const treadleMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const loomAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (cityLandmark.show) {
      const envelope = cityLoomLandmarkPulseEnvelope(performance.now());
      const intensity = cityLoomLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = cityLoomLandmarkHazeOpacity(envelope);
      if (treadleMatRef.current) {
        treadleMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL194.1 — continuous warm leftover mist on player land.
    if (loomAtmosphere.show && loomAtmosphereMatRef.current) {
      const envelope = loomAtmospherePulseEnvelope(performance.now());
      loomAtmosphereMatRef.current.emissiveIntensity =
        loomAtmosphereEmissiveIntensity(envelope);
      loomAtmosphereMatRef.current.opacity =
        loomAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      <ProcessStationCraftPads
        working={craftWorking}
        nowMs={nowMs}
        completeFlash={craftCompleteFlash}
        completeFlashStartedAt={craftCompleteFlashStartedAt}
      />
      {/* PL169.2 — soft pulsing warm thread landmark under City scarce loom */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          userData={{ cityLoomLandmark: true }}
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
      {/* PL194.1 — quiet warm pulsing thread mist leftover on player land */}
      {loomAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, loomAtmosphere.hazeY, 0]}
          userData={{ loomAtmosphere: true }}
        >
          <circleGeometry args={[loomAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={loomAtmosphereMatRef}
            color={loomAtmosphere.hazeColor}
            emissive={loomAtmosphere.emissive}
            emissiveIntensity={loomAtmosphere.intensity}
            transparent
            opacity={loomAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <LoomKitMeshes
        highlighted={highlighted}
        showFirstWalkUpTip={showFirstWalkUpTip}
        craftWorking={craftWorking}
        nowMs={nowMs}
        treadleMatRef={treadleMatRef}
        cityLandmarkShow={cityLandmark.show}
        cityLandmarkEmissive={cityLandmark.emissive}
        cityLandmarkIntensity={cityLandmark.intensity}
      />
      <ProcessStationWorldLabel
        type="loom"
        y={processStationLabelY("loom")}
        craft={craft}
      />
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 2.65, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="loom-walkup-tip"
            data-loom-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #c8b070",
              boxShadow: "0 0 10px rgba(200,176,112,0.4)",
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

/** CL28.2 ? low-poly alembic table; craft station, not gather. */
function AlchemyBenchBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  showFirstWalkUpTip = false,
  craftWorking = false,
  craft = null,
  
  craftCompleteFlash = false,
  craftCompleteFlashStartedAt = null,
  nowMs = 0,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — City PL170.1 cool tonic landmark. */
  landKind?: LandKind;
  /** PL77.2 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL121.2 — soft working glow while craft panel open. */
  craftWorking?: boolean;
  craft?: {
    state: "working" | "ready";
    isYours: boolean;
  } | null;
  /** PL131.1 — brief settle flash after craft success. */
  craftCompleteFlash?: boolean;
  craftCompleteFlashStartedAt?: number | null;
  nowMs?: number;
}) {
  const walkUpTip = alchemyBenchFirstWalkUpWorldTip();
  // Reason: PL170.1 — quiet cool tonic landmark while on City scarce alchemy bench.
  const cityLandmark = cityAlchemyBenchLandmarkCue(landKind);
  // Reason: PL194.2 — quiet deep tonic mist leftover on player land (≠ City landmark / working).
  const alchemyAtmosphere = alchemyBenchAtmosphereCue(landKind);
  const burnerLipMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const alchemyAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (cityLandmark.show) {
      const envelope = cityAlchemyBenchLandmarkPulseEnvelope(performance.now());
      const intensity = cityAlchemyBenchLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = cityAlchemyBenchLandmarkHazeOpacity(envelope);
      if (burnerLipMatRef.current) {
        burnerLipMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL194.2 — continuous cool leftover mist on player land.
    if (alchemyAtmosphere.show && alchemyAtmosphereMatRef.current) {
      const envelope = alchemyBenchAtmospherePulseEnvelope(performance.now());
      alchemyAtmosphereMatRef.current.emissiveIntensity =
        alchemyBenchAtmosphereEmissiveIntensity(envelope);
      alchemyAtmosphereMatRef.current.opacity =
        alchemyBenchAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      <ProcessStationCraftPads
        working={craftWorking}
        nowMs={nowMs}
        completeFlash={craftCompleteFlash}
        completeFlashStartedAt={craftCompleteFlashStartedAt}
      />
      {/* PL170.1 — soft pulsing cool tonic landmark under City scarce alchemy bench */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          userData={{ cityAlchemyBenchLandmark: true }}
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
      {/* PL194.2 — quiet cool pulsing tonic mist leftover on player land */}
      {alchemyAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, alchemyAtmosphere.hazeY, 0]}
          userData={{ alchemyBenchAtmosphere: true }}
        >
          <circleGeometry args={[alchemyAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={alchemyAtmosphereMatRef}
            color={alchemyAtmosphere.hazeColor}
            emissive={alchemyAtmosphere.emissive}
            emissiveIntensity={alchemyAtmosphere.intensity}
            transparent
            opacity={alchemyAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <AlchemyKitMeshes
        highlighted={highlighted}
        showFirstWalkUpTip={showFirstWalkUpTip}
        craftWorking={craftWorking}
        nowMs={nowMs}
        burnerLipMatRef={burnerLipMatRef}
        cityLandmarkShow={cityLandmark.show}
        cityLandmarkEmissive={cityLandmark.emissive}
        cityLandmarkIntensity={cityLandmark.intensity}
      />
      <ProcessStationWorldLabel
        type="alchemy_bench"
        y={processStationLabelY("alchemy_bench")}
        craft={craft}
      />
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 2.25, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="alchemy-bench-walkup-tip"
            data-alchemy-bench-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: "1px solid #8ab0a0",
              boxShadow: "0 0 10px rgba(138,176,160,0.4)",
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

function FishingDockBuilding({
  highlighted,
  px,
  pz,
  building,
  nowMs,
  landKind = "player_land",
  showFirstWalkUpTip = false,
  fishCatchSplash = false,
  fishCatchSplashStartedAt = null,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  building: BuildingDto;
  nowMs: number;
  /** Active map — City PL169.1 cool water landmark. */
  landKind?: LandKind;
  /** PL66.1 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** PL132.1 — brief cool water splash after successful catch. */
  fishCatchSplash?: boolean;
  fishCatchSplashStartedAt?: number | null;
}) {
  if (landKind === "city") {
    return (
      <CityRiverFishingSpot
        highlighted={highlighted}
        px={px}
        pz={pz}
        building={building}
        nowMs={nowMs}
        showFirstWalkUpTip={showFirstWalkUpTip}
        fishCatchSplash={fishCatchSplash}
        fishCatchSplashStartedAt={fishCatchSplashStartedAt}
      />
    );
  }
  const ready = building.readyAt == null || nowMs >= building.readyAt;
  const dockKit = gatherDockSurfaceMaterials(ready);
  const walkUpTip = fishingDockFirstWalkUpWorldTip();
  const shimmer = fishingDockReadyWaterShimmer(ready);
  // Reason: PL169.1 — quiet cool water landmark while on City scarce dock.
  const cityLandmark = cityFishingDockLandmarkCue(landKind);
  // Reason: PL190.2 — quiet cool water mist leftover on City or player land.
  const dockAtmosphere = fishingDockAtmosphereCue(landKind);
  const waterMatRef = useRef<MeshStandardMaterial>(null);
  const pileMatLeftRef = useRef<MeshStandardMaterial>(null);
  const pileMatRightRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const dockAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const mat = waterMatRef.current;
    if (mat) {
      if (showFirstWalkUpTip) {
        mat.emissiveIntensity = 0.35;
      } else {
        // PL118.2 — soft water shimmer while catch-ready (cooldown / rates unchanged).
        const envelope = ready
          ? fishingDockReadyShimmerEnvelope(performance.now())
          : 0;
        mat.emissiveIntensity = fishingDockReadyWaterEmissiveIntensity(
          ready,
          envelope,
        );
      }
    }
    // Reason: PL169.1 — continuous cool water footing/haze (independent of ready shimmer).
    if (cityLandmark.show) {
      const landmarkEnv = cityFishingDockLandmarkPulseEnvelope(
        performance.now(),
      );
      const intensity = cityFishingDockLandmarkEmissiveIntensity(landmarkEnv);
      const hazeOpacity = cityFishingDockLandmarkHazeOpacity(landmarkEnv);
      if (pileMatLeftRef.current) {
        pileMatLeftRef.current.emissiveIntensity = intensity;
      }
      if (pileMatRightRef.current) {
        pileMatRightRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL190.2 — continuous cool leftover mist on City / player land.
    if (dockAtmosphere.show && dockAtmosphereMatRef.current) {
      const envelope = fishingDockAtmospherePulseEnvelope(performance.now());
      dockAtmosphereMatRef.current.emissiveIntensity =
        fishingDockAtmosphereEmissiveIntensity(envelope);
      dockAtmosphereMatRef.current.opacity =
        fishingDockAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* PL169.1 — soft pulsing cool water landmark under City scarce dock */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, -0.05]}
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
      {/* PL190.2 — quiet cool pulsing water mist leftover on City / player land */}
      {dockAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, dockAtmosphere.hazeY, -0.05]}
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
      {/* VA1.2 — dock plank/cleat surfaces + apron / piles */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <kitBoxGeometry args={[1.8, 0.18, 1.2]} />
        <TexturedStandardMaterial kind="wood" color={highlighted ? dockKit.deckLitColor : dockKit.deckColor}
          roughness={dockKit.deck.roughness}
          metalness={dockKit.deck.metalness}
          emissive={showFirstWalkUpTip ? "#4a7a9a" : "#000000"}
          emissiveIntensity={showFirstWalkUpTip ? 0.26 : 0} />
      </mesh>
      <mesh position={[0, 0.08, 0.55]} castShadow>
        <kitBoxGeometry args={[1.6, 0.12, 0.35]} />
        <TexturedStandardMaterial kind="wood" color={dockKit.apronColor}
          roughness={dockKit.deck.roughness}
          metalness={dockKit.deck.metalness} />
      </mesh>
      <mesh position={[-0.7, 0.55, -0.35]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.0, 8]} />
        <TexturedStandardMaterial kind="wood" ref={pileMatLeftRef}
          color={dockKit.pileColor}
          roughness={dockKit.pile.roughness}
          metalness={dockKit.pile.metalness}
          emissive={cityLandmark.show ? cityLandmark.emissive : "#000000"}
          emissiveIntensity={cityLandmark.show ? cityLandmark.intensity : 0} />
      </mesh>
      <mesh position={[0.7, 0.55, -0.35]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.0, 8]} />
        <TexturedStandardMaterial kind="wood" ref={pileMatRightRef}
          color={dockKit.pileColor}
          roughness={dockKit.pile.roughness}
          metalness={dockKit.pile.metalness}
          emissive={cityLandmark.show ? cityLandmark.emissive : "#000000"}
          emissiveIntensity={cityLandmark.show ? cityLandmark.intensity : 0} />
      </mesh>
      <mesh position={[-0.55, 0.28, 0.4]} castShadow>
        <kitBoxGeometry args={[0.18, 0.1, 0.12]} />
        <TexturedStandardMaterial kind="wood" color={dockKit.cleatColor}
          roughness={dockKit.cleat.roughness}
          metalness={dockKit.cleat.metalness} />
      </mesh>
      <mesh position={[0.55, 0.28, 0.4]} castShadow>
        <kitBoxGeometry args={[0.18, 0.1, 0.12]} />
        <TexturedStandardMaterial kind="wood" color={dockKit.cleatColor}
          roughness={dockKit.cleat.roughness}
          metalness={dockKit.cleat.metalness} />
      </mesh>
      <mesh position={[0.62, 0.95, -0.12]} rotation={[0.55, 0, 0.18]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 1.55, 6]} />
        <TexturedStandardMaterial
          kind="wood"
          color={dockKit.pileColor}
          roughness={dockKit.pile.roughness}
          metalness={dockKit.pile.metalness}
        />
      </mesh>
      <mesh position={[0.95, 0.22, 0.48]}>
        <cylinderGeometry args={[0.012, 0.012, 0.7, 5]} />
        <TexturedStandardMaterial
          kind="metal"
          color={dockKit.cleatColor}
          roughness={dockKit.cleat.roughness}
          metalness={0.35}
        />
      </mesh>
      {/* PL118.2 — soft ready water pad under dock (cooling stays quiet) */}
      {shimmer.show ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -0.15]}>
          <circleGeometry args={[0.85, 20]} />
          <meshStandardMaterial
            color={shimmer.padColor}
            transparent
            opacity={shimmer.padOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* PL132.1 — brief cool water splash after Caught */}
      <FishCatchSplashPad
        active={fishCatchSplash}
        startedAtMs={fishCatchSplashStartedAt}
      />
      <mesh position={[0, 0.06, -0.2]}>
        <kitBoxGeometry args={[1.4, 0.08, 0.5]} />
        <meshStandardMaterial
          ref={waterMatRef}
          color={ready ? shimmer.waterColor : dockKit.waterCoolColor}
          roughness={dockKit.water.roughness}
          metalness={dockKit.water.metalness}
          transparent
          opacity={0.85}
          emissive={
            showFirstWalkUpTip
              ? "#6aa0c0"
              : ready
                ? shimmer.waterEmissive
                : "#000000"
          }
          emissiveIntensity={
            showFirstWalkUpTip
              ? 0.35
              : fishingDockReadyWaterEmissiveIntensity(ready, 0.5)
          }
        />
      </mesh>
      {/* PL30.1 — name + Ready when catch available; depleted stays timer/pad */}
      {ready ? <GatherReadyWorldLabel type="fishing_dock" y={1.35} /> : null}
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 1.75, 0]} center style={{ pointerEvents: "none" }}>
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
        </WorldHtml>
      ) : null}
      <HighlightRing show={highlighted} />
    </group>
  );
}

/**
 * Player-land build board — full empty-land beacon until first station (PL3.1).
 * PL52.1: brief soft walk-up tip under the beacon on first proximity.
 * PL160.1: quiet warm timber landmark haze while beacon shows.
 * PL200.1: quiet warm timber mist leftover while yard can place (beacon + soft).
 */
function BuildBoardBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  beaconMode,
  showFirstWalkUpTip = false,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — PL200.1 warm timber mist on player land. */
  landKind?: LandKind;
  beaconMode: EmptyLandBuildBeaconMode;
  /** PL52.1 — brief soft world tip on first empty-land walk-up. */
  showFirstWalkUpTip?: boolean;
}) {
  const isBeacon = beaconMode === "beacon";
  const worldLabel = emptyLandBuildBeaconWorldLabel(beaconMode);
  const walkUpTip = emptyLandBuildFirstWalkUpWorldTip();
  // Reason: VA2.3 — timber/board/trim PBR + caps/crossbeam; beacon emissives unchanged.
  const kit = buildBoardKitMaterials(highlighted, beaconMode);
  const emptyLandmark = emptyLandBuildBoardLandmarkCue(beaconMode);
  // Reason: PL200.1 — quiet warm timber mist leftover while yard can place (≠ landmark / spawn).
  const boardAtmosphere = buildBoardAtmosphereCue(landKind);
  const footingMatRef = useRef<MeshStandardMaterial | null>(null);
  const hazeMatRef = useRef<MeshStandardMaterial | null>(null);
  const boardAtmosphereMatRef = useRef<MeshStandardMaterial | null>(null);

  useFrame(() => {
    const now = performance.now();
    // PL160.1 — quiet warm timber footing/haze pulse while empty-land beacon shows.
    if (emptyLandmark.show) {
      const landmarkEnv = emptyLandBuildBoardLandmarkPulseEnvelope(now);
      const intensity =
        emptyLandBuildBoardLandmarkEmissiveIntensity(landmarkEnv);
      const hazeOpacity = emptyLandBuildBoardLandmarkHazeOpacity(landmarkEnv);
      if (footingMatRef.current) {
        footingMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL200.1 — continuous warm leftover mist while yard can place.
    if (boardAtmosphere.show && boardAtmosphereMatRef.current) {
      const envelope = buildBoardAtmospherePulseEnvelope(now);
      boardAtmosphereMatRef.current.emissiveIntensity =
        buildBoardAtmosphereEmissiveIntensity(envelope);
      boardAtmosphereMatRef.current.opacity =
        buildBoardAtmosphereHazeOpacity(envelope);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* PL160.1 — empty yard: soft pulsing warm timber landmark under build board */}
      {emptyLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.025, 0]}
          userData={{ emptyLandBuildBoardLandmark: true }}
        >
          <circleGeometry args={[emptyLandmark.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={hazeMatRef}
            color={emptyLandmark.hazeColor}
            emissive={emptyLandmark.emissive}
            emissiveIntensity={0.1}
            transparent
            opacity={emptyLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* PL200.1 — quiet warm pulsing timber mist leftover while yard can place */}
      {boardAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, boardAtmosphere.hazeY, 0]}
          userData={{ buildBoardAtmosphere: true }}
        >
          <circleGeometry args={[boardAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={boardAtmosphereMatRef}
            color={boardAtmosphere.hazeColor}
            emissive={boardAtmosphere.emissive}
            emissiveIntensity={boardAtmosphere.intensity}
            transparent
            opacity={boardAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {isBeacon ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <circleGeometry args={[1.35, 24]} />
          <meshStandardMaterial
            color="#d4b060"
            transparent
            opacity={showFirstWalkUpTip ? 0.72 : 0.62}
            emissive="#8a6820"
            emissiveIntensity={showFirstWalkUpTip ? 0.48 : 0.35}
          />
        </mesh>
      ) : null}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <kitBoxGeometry args={[1.4, 0.12, 1.0]} />
        <TexturedStandardMaterial kind="stone" ref={footingMatRef}
          color={kit.baseColor}
          roughness={kit.base.roughness}
          metalness={kit.base.metalness}
          emissive={emptyLandmark.show ? emptyLandmark.emissive : "#000000"}
          emissiveIntensity={
            emptyLandmark.show ? emptyLandmark.intensity : 0
          } />
      </mesh>
      {/* Post footings (VA2.3) */}
      <mesh position={[-0.45, 0.14, -0.35]} receiveShadow>
        <kitBoxGeometry args={[0.22, 0.08, 0.22]} />
        <TexturedStandardMaterial kind="wood" color={kit.capColor}
          roughness={kit.cap.roughness}
          metalness={kit.cap.metalness} />
      </mesh>
      <mesh position={[0.45, 0.14, -0.35]} receiveShadow>
        <kitBoxGeometry args={[0.22, 0.08, 0.22]} />
        <TexturedStandardMaterial kind="plaster" color={kit.capColor}
          roughness={kit.cap.roughness}
          metalness={kit.cap.metalness} />
      </mesh>
      <mesh position={[-0.45, 0.85, -0.35]} castShadow>
        <kitBoxGeometry args={[0.1, 1.5, 0.1]} />
        <TexturedStandardMaterial kind="wood" color={kit.postColor}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness} />
      </mesh>
      <mesh position={[0.45, 0.85, -0.35]} castShadow>
        <kitBoxGeometry args={[0.1, 1.5, 0.1]} />
        <TexturedStandardMaterial kind="wood" color={kit.postColor}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness} />
      </mesh>
      {/* Post caps (VA2.3) */}
      <mesh position={[-0.45, 1.65, -0.35]} castShadow>
        <kitBoxGeometry args={[0.14, 0.08, 0.14]} />
        <TexturedStandardMaterial kind="wood" color={kit.capColor}
          roughness={kit.cap.roughness}
          metalness={kit.cap.metalness} />
      </mesh>
      <mesh position={[0.45, 1.65, -0.35]} castShadow>
        <kitBoxGeometry args={[0.14, 0.08, 0.14]} />
        <TexturedStandardMaterial kind="plaster" color={kit.capColor}
          roughness={kit.cap.roughness}
          metalness={kit.cap.metalness} />
      </mesh>
      {/* Crossbeam (VA2.3) */}
      <mesh position={[0, 1.55, -0.35]} castShadow>
        <kitBoxGeometry args={[0.95, 0.08, 0.08]} />
        <TexturedStandardMaterial kind="wood" color={kit.crossbeamColor}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness} />
      </mesh>
      <mesh position={[0, 1.4, -0.35]} castShadow>
        <kitBoxGeometry args={[1.2, 0.75, 0.08]} />
        <TexturedStandardMaterial kind="wood" color={kit.boardColor}
          roughness={kit.board.roughness}
          metalness={kit.board.metalness}
          emissive={isBeacon ? "#6a4a18" : "#000000"}
          emissiveIntensity={
            isBeacon ? (showFirstWalkUpTip ? 0.4 : 0.28) : 0
          } />
      </mesh>
      {/* Board metal corner trim (VA2.3) */}
      <mesh position={[-0.55, 1.7, -0.3]} castShadow>
        <kitBoxGeometry args={[0.08, 0.08, 0.04]} />
        <TexturedStandardMaterial kind="wood" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[0.55, 1.7, -0.3]} castShadow>
        <kitBoxGeometry args={[0.08, 0.08, 0.04]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[-0.55, 1.1, -0.3]} castShadow>
        <kitBoxGeometry args={[0.08, 0.08, 0.04]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[0.55, 1.1, -0.3]} castShadow>
        <kitBoxGeometry args={[0.08, 0.08, 0.04]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      {isBeacon ? (
        <mesh position={[0, 2.05, -0.35]} castShadow>
          <sphereGeometry args={[0.12, 10, 10]} />
          <TexturedStandardMaterial kind="plaster" color="#f0d878"
            emissive="#e8c040"
            emissiveIntensity={showFirstWalkUpTip ? 1.05 : 0.85} />
        </mesh>
      ) : null}
      <WorldHtml
        position={[0, isBeacon ? 2.45 : 2.0, 0]}
        center
        style={{ pointerEvents: "none" }}
      >
        <div
          data-testid="build-board-world-label"
          data-empty-land-walkup-tip={showFirstWalkUpTip ? "1" : "0"}
          style={{
            background: isBeacon
              ? "rgba(18, 22, 16, 0.88)"
              : "rgba(20,28,18,0.75)",
            color: "#e8f0e2",
            padding: isBeacon ? "4px 10px" : "2px 8px",
            borderRadius: isBeacon ? 6 : 4,
            border: isBeacon
              ? showFirstWalkUpTip
                ? "1px solid #e0c878"
                : "1px solid #c4a060"
              : "none",
            fontSize: isBeacon ? 12 : 11,
            fontWeight: isBeacon ? 650 : 400,
            whiteSpace: "nowrap",
            textAlign: "center",
            lineHeight: 1.25,
            opacity: isBeacon ? 1 : 0.72,
            boxShadow: showFirstWalkUpTip
              ? "0 0 10px rgba(212, 176, 96, 0.45)"
              : undefined,
          }}
        >
          <div>{worldLabel}</div>
          {showFirstWalkUpTip ? (
            <div
              data-testid="empty-land-build-walkup-tip"
              style={{
                fontSize: 9,
                opacity: 0.9,
                marginTop: 2,
                fontWeight: 600,
              }}
            >
              {walkUpTip}
            </div>
          ) : null}
        </div>
      </WorldHtml>
      <HighlightRing show={highlighted} />
    </group>
  );
}

/** Warrior arena plaque (CL5.1 / CL11.1) — informational stub, no combat ladder. */
function ArenaBoardBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  showFirstWalkUpTip = false,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — Warrior gets PL155.1 warm plaque landmark. */
  landKind?: LandKind;
  /** PL45.2 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
}) {
  const v = WARRIOR_ARENA_VISUAL;
  const walkUpTip = arenaFirstWalkUpWorldTip();
  const plaqueMatRef = useRef<MeshStandardMaterial>(null);
  const footingMatRef = useRef<MeshStandardMaterial | null>(null);
  const hazeMatRef = useRef<MeshStandardMaterial | null>(null);
  // Reason: VA2.3 — PBR + metal trim/band; WARRIOR_ARENA_VISUAL colors + pulse unchanged.
  const kit = arenaBoardKitMaterials();
  const arenaLandmark = arenaBoardLandmarkCue(landKind);

  useFrame(() => {
    const mat = plaqueMatRef.current;
    if (mat) {
      // Reason: PL129.2 — soft plaque sine while interact-highlighted; idle stays steady.
      const envelope = arenaPlaqueHighlightPulseEnvelope(performance.now());
      mat.emissiveIntensity = arenaPlaqueHighlightPulseEmissiveIntensity(
        highlighted,
        showFirstWalkUpTip,
        envelope,
      );
    }
    // PL155.1 — quiet warm footing/haze pulse on Warrior (highlight pulse stays on face).
    if (!arenaLandmark.show) return;
    const landmarkEnv = arenaBoardLandmarkPulseEnvelope(performance.now());
    const intensity = arenaBoardLandmarkEmissiveIntensity(landmarkEnv);
    const hazeOpacity = arenaBoardLandmarkHazeOpacity(landmarkEnv);
    if (footingMatRef.current) {
      footingMatRef.current.emissiveIntensity = intensity;
    }
    if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
  });

  return (
    <group position={[px, 0, pz]}>
      {/* PL155.1 — Warrior: soft pulsing warm plaque landmark under arena board */}
      {arenaLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.025, 0]}
          userData={{ arenaBoardLandmark: true }}
        >
          <circleGeometry args={[arenaLandmark.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={hazeMatRef}
            color={arenaLandmark.hazeColor}
            emissive={arenaLandmark.emissive}
            emissiveIntensity={0.1}
            transparent
            opacity={arenaLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.16, 8]} />
        <TexturedStandardMaterial kind="stone" ref={footingMatRef}
          color={highlighted ? v.plaqueBaseLit : v.plaqueBase}
          roughness={kit.base.roughness}
          metalness={kit.base.metalness}
          emissive={arenaLandmark.show ? arenaLandmark.emissive : "#000000"}
          emissiveIntensity={arenaLandmark.show ? arenaLandmark.intensity : 0} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <kitBoxGeometry args={[0.14, 1.5, 0.14]} />
        <TexturedStandardMaterial kind="wood" color={v.plaquePost}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness} />
      </mesh>
      {/* Mid metal band (VA2.3) */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <kitBoxGeometry args={[0.2, 0.08, 0.2]} />
        <TexturedStandardMaterial kind="wood" color={kit.bandColor}
          roughness={kit.band.roughness}
          metalness={kit.band.metalness} />
      </mesh>
      {/* Post cap (VA2.3) */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <kitBoxGeometry args={[0.18, 0.08, 0.18]} />
        <TexturedStandardMaterial kind="wood" color={kit.capColor}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness} />
      </mesh>
      <mesh position={[0, 1.45, 0.08]} castShadow>
        <kitBoxGeometry args={[1.1, 0.7, 0.1]} />
        <TexturedStandardMaterial kind="wood" ref={plaqueMatRef}
          color={highlighted ? v.plaqueFaceLit : v.plaqueFace}
          roughness={kit.plaque.roughness}
          metalness={kit.plaque.metalness}
          emissive={v.plaqueEmissive}
          emissiveIntensity={arenaPlaqueHighlightPulseEmissiveIntensity(
            highlighted,
            showFirstWalkUpTip,
            0,
          )} />
      </mesh>
      {/* Plaque metal frame trim (VA2.3) */}
      <mesh position={[0, 1.78, 0.14]} castShadow>
        <kitBoxGeometry args={[1.14, 0.05, 0.04]} />
        <TexturedStandardMaterial kind="wood" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[0, 1.12, 0.14]} castShadow>
        <kitBoxGeometry args={[1.14, 0.05, 0.04]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[-0.54, 1.45, 0.14]} castShadow>
        <kitBoxGeometry args={[0.05, 0.7, 0.04]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[0.54, 1.45, 0.14]} castShadow>
        <kitBoxGeometry args={[0.05, 0.7, 0.04]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <WorldHtml position={[0, 2.05, 0]} center style={{ pointerEvents: "none" }}>
        <div
          data-testid="arena-world-label"
          data-arena-walkup-tip={showFirstWalkUpTip ? "1" : "0"}
          style={{
            background: "rgba(16, 10, 8, 0.9)",
            color: "#f0e8e0",
            padding: "3px 9px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
            border: `2px solid ${
              showFirstWalkUpTip ? v.plaqueFaceLit : v.plaqueAccent
            }`,
            boxShadow: `0 0 12px ${v.plaqueAccent}66, 0 0 4px ${v.plaqueEmissive}44`,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          <div>{arenaBoardWorldLabel()}</div>
          {showFirstWalkUpTip ? (
            <div
              data-testid="arena-walkup-tip"
              style={{ fontSize: 9, opacity: 0.9, marginTop: 2, fontWeight: 600 }}
            >
              {walkUpTip}
            </div>
          ) : null}
        </div>
      </WorldHtml>
      <HighlightRing show={highlighted} />
    </group>
  );
}

function NoticeBoardBuilding({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  unread = false,
  showFirstWalkUpTip = false,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  /** Active map — City gets PL153.2 cool civic landmark. */
  landKind?: LandKind;
  /** PL17.1 — soft pad / plaque accent while tips are unread. */
  unread?: boolean;
  /** PL70.2 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
}) {
  const { worldLabel } = CITY_SERVICE_VISUAL_KITS.notice_board;
  const walkUpTip = noticeBoardFirstWalkUpWorldTip();
  const plaqueMatRef = useRef<MeshStandardMaterial>(null);
  const footingMatRef = useRef<MeshStandardMaterial | null>(null);
  const hazeMatRef = useRef<MeshStandardMaterial | null>(null);
  const atmosphereHazeMatRef = useRef<MeshStandardMaterial | null>(null);
  // Reason: VA2.3 — timber/plaque/trim PBR; unread flicker / pad cues unchanged.
  const kit = noticeBoardKitMaterials(highlighted);
  const cityLandmark = cityNoticeBoardLandmarkCue(landKind);
  // Reason: PL187.2 — quiet cool civic mist leftover over notice pad (City).
  const noticeAtmosphere = cityNoticeBoardAtmosphereCue(landKind);
  const plaqueColor = unread
    ? NOTICE_UNREAD_WORLD_CUE.plaqueAccent
    : highlighted
      ? "#7a9a6a"
      : "#3a5238";

  useFrame(() => {
    const now = performance.now();
    const mat = plaqueMatRef.current;
    if (mat) {
      if (showFirstWalkUpTip) {
        mat.emissiveIntensity = 0.32;
      } else {
        // PL117.2 — soft plaque flicker while tips unread (tip ids unchanged).
        const envelope = unread ? noticeUnreadFlickerEnvelope(now) : 0;
        mat.emissiveIntensity = noticeUnreadPlaqueEmissiveIntensity(
          unread,
          envelope,
        );
      }
    }
    // PL153.2 — quiet cool civic footing/haze pulse on City (unread gold stays on plaque).
    if (cityLandmark.show) {
      const landmarkEnv = cityNoticeBoardLandmarkPulseEnvelope(now);
      const intensity = cityNoticeBoardLandmarkEmissiveIntensity(landmarkEnv);
      const hazeOpacity = cityNoticeBoardLandmarkHazeOpacity(landmarkEnv);
      if (footingMatRef.current) {
        footingMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL187.2 — continuous civic mist leftover (distinct from landmark).
    if (noticeAtmosphere.show && atmosphereHazeMatRef.current) {
      const mistEnv = cityNoticeBoardAtmospherePulseEnvelope(now);
      atmosphereHazeMatRef.current.opacity =
        cityNoticeBoardAtmosphereHazeOpacity(mistEnv);
      atmosphereHazeMatRef.current.emissiveIntensity =
        cityNoticeBoardAtmosphereEmissiveIntensity(mistEnv);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* Single post + plaque — distinct from twin-post market board (PL1.3 kit: post) */}
      {/* PL153.2 — City: soft pulsing cool civic landmark under notice board */}
      {cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.025, 0]}
          userData={{ cityNoticeBoardLandmark: true }}
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
      {/* PL187.2 — soft pulsing cool civic mist leftover over notice pad */}
      {noticeAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, CITY_NOTICE_BOARD_ATMOSPHERE_CUE.hazeY, 0]}
          userData={{ cityNoticeBoardAtmosphere: true }}
        >
          <circleGeometry
            args={[CITY_NOTICE_BOARD_ATMOSPHERE_CUE.hazeRadius, 24]}
          />
          <meshStandardMaterial
            ref={atmosphereHazeMatRef}
            color={CITY_NOTICE_BOARD_ATMOSPHERE_CUE.hazeColor}
            emissive={CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive}
            emissiveIntensity={noticeAtmosphere.intensity}
            transparent
            opacity={noticeAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {unread ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <circleGeometry args={[0.95, 20]} />
          <meshStandardMaterial
            color={NOTICE_UNREAD_WORLD_CUE.padColor}
            transparent
            opacity={0.62}
          />
        </mesh>
      ) : null}
      {unread ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <ringGeometry args={[0.85, 1.15, 24]} />
          <meshStandardMaterial
            color={NOTICE_UNREAD_WORLD_CUE.haloColor}
            emissive={NOTICE_UNREAD_WORLD_CUE.haloColor}
            emissiveIntensity={0.48}
            transparent
            opacity={0.8}
          />
        </mesh>
      ) : null}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.28, 0.35, 0.14, 8]} />
        <TexturedStandardMaterial kind="plaster" ref={footingMatRef}
          color={kit.footingColor}
          roughness={kit.footing.roughness}
          metalness={kit.footing.metalness}
          emissive={cityLandmark.show ? cityLandmark.emissive : "#000000"}
          emissiveIntensity={cityLandmark.show ? cityLandmark.intensity : 0} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 1.75, 8]} />
        <TexturedStandardMaterial kind="wood" color={kit.postColor}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness} />
      </mesh>
      {/* Post cap (VA2.3) */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.08, 8]} />
        <TexturedStandardMaterial kind="wood" color={kit.capColor}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness} />
      </mesh>
      <mesh position={[0, 1.55, 0.12]} castShadow>
        <kitBoxGeometry args={[0.95, 0.85, 0.08]} />
        <TexturedStandardMaterial kind="wood" ref={plaqueMatRef}
          color={plaqueColor}
          roughness={kit.plaque.roughness}
          metalness={kit.plaque.metalness}
          emissive={
            showFirstWalkUpTip
              ? "#8aaa68"
              : unread
                ? NOTICE_UNREAD_WORLD_CUE.haloColor
                : "#000000"
          }
          emissiveIntensity={
            showFirstWalkUpTip
              ? 0.32
              : noticeUnreadPlaqueEmissiveIntensity(unread, 0.5)
          } />
      </mesh>
      {/* Metal corner trim (VA2.3) */}
      <mesh position={[-0.42, 1.9, 0.17]} castShadow>
        <kitBoxGeometry args={[0.08, 0.08, 0.03]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[0.42, 1.9, 0.17]} castShadow>
        <kitBoxGeometry args={[0.08, 0.08, 0.03]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[-0.42, 1.2, 0.17]} castShadow>
        <kitBoxGeometry args={[0.08, 0.08, 0.03]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[0.42, 1.2, 0.17]} castShadow>
        <kitBoxGeometry args={[0.08, 0.08, 0.03]} />
        <TexturedStandardMaterial kind="plaster" color={kit.trimColor}
          roughness={kit.trim.roughness}
          metalness={kit.trim.metalness} />
      </mesh>
      <mesh position={[0, 1.55, 0.17]}>
        <kitBoxGeometry args={[0.75, 0.6, 0.03]} />
        <TexturedStandardMaterial kind="plaster" color={kit.slateColor}
          roughness={kit.slate.roughness}
          metalness={kit.slate.metalness} />
      </mesh>
      {/* Paper scrap cue */}
      <mesh position={[-0.12, 1.62, 0.2]} rotation={[0, 0, -0.08]}>
        <kitBoxGeometry args={[0.35, 0.28, 0.02]} />
        <TexturedStandardMaterial kind="plaster" color={kit.paperColor}
          roughness={kit.paper.roughness}
          metalness={kit.paper.metalness} />
      </mesh>
      <mesh position={[0.18, 1.45, 0.2]} rotation={[0, 0, 0.12]}>
        <kitBoxGeometry args={[0.28, 0.22, 0.02]} />
        <TexturedStandardMaterial kind="plaster" color={kit.paperAltColor}
          roughness={kit.paper.roughness}
          metalness={kit.paper.metalness} />
      </mesh>
      <WorldHtml position={[0, 2.2, 0]} center style={{ pointerEvents: "none" }}>
        <div
          data-testid="notice-board-world-label"
          data-unread={unread ? "true" : "false"}
          data-notice-walkup-tip={showFirstWalkUpTip ? "1" : "0"}
          style={{
            background: "rgba(20,28,18,0.75)",
            color: "#e8f0e2",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "nowrap",
            border: showFirstWalkUpTip
              ? "1px solid #8aaa68"
              : unread
                ? `1px solid ${NOTICE_UNREAD_WORLD_CUE.labelBorder}`
                : "1px solid transparent",
            boxShadow: showFirstWalkUpTip
              ? "0 0 10px rgba(106,138,74,0.4)"
              : undefined,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          <div>
            {unread
              ? `${worldLabel} · ${NOTICE_UNREAD_WORLD_CUE.worldLabel}`
              : worldLabel}
          </div>
          {showFirstWalkUpTip ? (
            <div
              data-testid="notice-board-walkup-tip"
              style={{
                fontSize: 9,
                opacity: 0.9,
                marginTop: 2,
                fontWeight: 600,
              }}
            >
              {walkUpTip}
            </div>
          ) : null}
        </div>
      </WorldHtml>
      <HighlightRing show={highlighted} />
    </group>
  );
}

export function ExpandPadMesh({
  x,
  z,
  highlighted,
  affordMode = "short",
  showFirstWalkUpTip = false,
  landKind = "player_land",
}: {
  x: number;
  z: number;
  highlighted: boolean;
  /** PL26.1 — quiet pad tint when expand is affordable vs short. */
  affordMode?: ExpandPadAffordMode;
  /** PL72.1 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
  /** Active map — PL196.2 cool footing mist on player land. */
  landKind?: LandKind;
}) {
  // Reason: PL26.1 — affordable vs short funds/energy without a HUD column.
  const look = expandPadMeshColors(affordMode, highlighted);
  const walkUpTip = expandPadFirstWalkUpWorldTip();
  // Reason: VA3.1 — pad/post PBR + lip/caps; afford tint + short pulse unchanged.
  const kit = expandPadKitMaterials();
  // Reason: PL163.1 — quiet warm field-gold landmark while pad is visible.
  const landmark = expandPadLandmarkCue(true);
  // Reason: PL196.2 — quiet cool footing mist leftover on player land (≠ warm landmark / flash).
  const expandAtmosphere = expandPadAtmosphereCue(landKind, true);
  const padMatRef = useRef<MeshStandardMaterial>(null);
  const lipMatRef = useRef<MeshStandardMaterial>(null);
  const hazeMatRef = useRef<MeshStandardMaterial>(null);
  const expandAtmosphereMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const now = performance.now();
    const mat = padMatRef.current;
    if (mat) {
      // Reason: PL123.1 — soft short-afford pulse while interact-highlighted.
      const envelope = expandPadShortAffordPulseEnvelope(now);
      mat.emissive.set(
        expandPadShortAffordPulseEmissive(affordMode, highlighted),
      );
      mat.emissiveIntensity = expandPadShortAffordPulseEmissiveIntensity(
        affordMode,
        highlighted,
        showFirstWalkUpTip,
        envelope,
      );
    }
    // Reason: PL163.1 — continuous field-gold lip/haze (independent of afford pulse).
    if (landmark.show) {
      const landmarkEnv = expandPadLandmarkPulseEnvelope(now);
      const intensity = expandPadLandmarkEmissiveIntensity(landmarkEnv);
      const hazeOpacity = expandPadLandmarkHazeOpacity(landmarkEnv);
      if (lipMatRef.current) {
        lipMatRef.current.emissiveIntensity = intensity;
      }
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
    }
    // Reason: PL196.2 — continuous cool footing mist leftover on player land.
    if (expandAtmosphere.show && expandAtmosphereMatRef.current) {
      const atmosphereEnv = expandPadAtmospherePulseEnvelope(now);
      expandAtmosphereMatRef.current.emissiveIntensity =
        expandPadAtmosphereEmissiveIntensity(atmosphereEnv);
      expandAtmosphereMatRef.current.opacity =
        expandPadAtmosphereHazeOpacity(atmosphereEnv);
    }
  });

  return (
    <group position={[x * GRID, 0, z * GRID]}>
      {/* PL163.1 — soft pulsing warm field-gold landmark under expand pad */}
      {landmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          userData={{ expandPadLandmark: true }}
        >
          <circleGeometry args={[landmark.hazeRadius, 24]} />
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
      ) : null}
      {/* PL196.2 — quiet cool pulsing footing mist leftover on player land */}
      {expandAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, expandAtmosphere.hazeY, 0]}
          userData={{ expandPadAtmosphere: true }}
        >
          <circleGeometry args={[expandAtmosphere.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={expandAtmosphereMatRef}
            color={expandAtmosphere.hazeColor}
            emissive={expandAtmosphere.emissive}
            emissiveIntensity={expandAtmosphere.intensity}
            transparent
            opacity={expandAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <kitBoxGeometry args={[1.6, 0.08, 1.6]} />
        <TexturedStandardMaterial kind="stone" ref={padMatRef}
          color={look.padColor}
          roughness={kit.pad.roughness}
          metalness={kit.pad.metalness}
          emissive={expandPadShortAffordPulseEmissive(affordMode, highlighted)}
          emissiveIntensity={expandPadShortAffordPulseEmissiveIntensity(
            affordMode,
            highlighted,
            showFirstWalkUpTip,
            0,
          )} />
      </mesh>
      {/* Footing lip (VA3.1) — PL163.1 soft landmark emissive */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <kitBoxGeometry args={[1.72, 0.04, 1.72]} />
        <TexturedStandardMaterial kind="stone" ref={lipMatRef}
          color={kit.lipColor}
          roughness={kit.lip.roughness}
          metalness={kit.lip.metalness}
          emissive={landmark.show ? landmark.emissive : "#000000"}
          emissiveIntensity={landmark.show ? landmark.intensity : 0} />
      </mesh>
      {[
        [-0.7, -0.7],
        [0.7, -0.7],
        [-0.7, 0.7],
        [0.7, 0.7],
      ].map(([sx, sz]) => (
        <group key={`${sx}-${sz}`} position={[sx, 0, sz]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <kitBoxGeometry args={[0.1, 0.7, 0.1]} />
            <TexturedStandardMaterial kind="wood" color={kit.postColor}
              roughness={kit.post.roughness}
              metalness={kit.post.metalness} />
          </mesh>
          {/* Post cap (VA3.1) */}
          <mesh position={[0, 0.74, 0]} castShadow>
            <kitBoxGeometry args={[0.14, 0.08, 0.14]} />
            <TexturedStandardMaterial kind="wood" color={kit.postCapColor}
              roughness={kit.postCap.roughness}
              metalness={kit.postCap.metalness} />
          </mesh>
        </group>
      ))}
      <WorldHtml position={[0, 1.1, 0]} center style={{ pointerEvents: "none" }}>
        <div
          style={{
            background: "rgba(20,28,18,0.7)",
            color: "#e8f0e2",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "nowrap",
          }}
        >
          <div>Expand field</div>
          {showFirstWalkUpTip ? (
            <div
              data-testid="expand-pad-walkup-tip"
              data-expand-pad-walkup-tip="1"
              style={{
                fontSize: 9,
                opacity: 0.9,
                marginTop: 2,
                fontWeight: 600,
              }}
            >
              {walkUpTip}
            </div>
          ) : null}
        </div>
      </WorldHtml>
      <HighlightRing show={highlighted} />
    </group>
  );
}

function ClaimNodeBuilding({
  highlighted,
  px,
  pz,
  building,
  showFirstWalkUpTip = false,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  building: BuildingDto;
  /** PL80.1 — brief soft world tip on first walk-up. */
  showFirstWalkUpTip?: boolean;
}) {
  const claim = building.claim;
  const held = Boolean(claim?.claimedGuildName);
  const yours = Boolean(claim?.isYours);
  const banner = claimNodeOwnershipBannerColor(held, yours);
  const label = claim
    ? held
      ? yours
        ? `${claim.name} · ${claim.storedQty}/${claim.storageCap}`
        : `${claim.name} · ${claim.claimedGuildName}`
      : `${claim.name} · unclaimed`
    : "Wild Grove";
  const walkUpTip = claimNodeFirstWalkUpWorldTip();
  // Reason: VA3.2 — post/footing/banner/finial PBR; ownership colors + tip emissives unchanged.
  const kit = claimNodeKitMaterials();
  const contestActiveInitial = claimNodeContestSoftCueActive(
    claim?.contestEndsAt,
    Date.now(),
  );
  // Reason: PL163.2 — quiet cool grove mist while unheld / no contest.
  const emptyLandmark = claimEmptyLandmarkCue(held, contestActiveInitial);
  // Reason: PL183.2 — quiet ember mist leftover while soft-war contest is open.
  const contestAtmosphere = softWarContestAtmosphereCue(
    claim?.contestEndsAt,
    Date.now(),
  );
  const footingMatRef = useRef<MeshStandardMaterial>(null);
  const bannerMatRef = useRef<MeshStandardMaterial>(null);
  const postMatRef = useRef<MeshStandardMaterial>(null);
  const emptyHazeMatRef = useRef<MeshStandardMaterial>(null);
  const contestHazeMatRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const now = performance.now();
    const wallNow = Date.now();
    const contestActive = claimNodeContestSoftCueActive(
      claim?.contestEndsAt,
      wallNow,
    );
    const emptyCue = claimEmptyLandmarkCue(held, contestActive);
    const contestMist = softWarContestAtmosphereCue(
      claim?.contestEndsAt,
      wallNow,
    );
    // Reason: PL146.1 — contest ember wins over held green; tip gold still wins briefly.
    // Reason: PL163.2 — empty grove mist fills unheld / no-contest idle.
    let emissive: string;
    let intensity: number;
    if (showFirstWalkUpTip) {
      emissive = CLAIM_NODE_HELD_SOFT_CUE.tipEmissive;
      intensity = CLAIM_NODE_HELD_SOFT_CUE.tipIntensity;
    } else if (contestActive) {
      const envelope = claimNodeContestSoftCueEnvelope(now);
      emissive = claimNodeContestSoftCueEmissive(true);
      intensity = claimNodeContestSoftCueEmissiveIntensity(true, envelope);
    } else if (yours) {
      const envelope = claimNodeHeldSoftCueEnvelope(now);
      emissive = claimNodeHeldSoftCueEmissive(yours);
      intensity = claimNodeHeldSoftCueEmissiveIntensity(yours, envelope);
    } else if (emptyCue.show) {
      const envelope = claimEmptyLandmarkPulseEnvelope(now);
      emissive = CLAIM_EMPTY_LANDMARK_CUE.emissive;
      intensity = claimEmptyLandmarkEmissiveIntensity(envelope);
    } else {
      emissive = "#000000";
      intensity = 0;
    }
    const footing = footingMatRef.current;
    if (footing) {
      footing.emissive.set(emissive);
      footing.emissiveIntensity = intensity * 0.55;
    }
    const bannerMat = bannerMatRef.current;
    if (bannerMat) {
      bannerMat.emissive.set(emissive);
      bannerMat.emissiveIntensity = intensity;
    }
    const post = postMatRef.current;
    if (post) {
      // Tip still soft-lights the post; held/contest/empty cues stay banner/footing only.
      post.emissive.set(
        showFirstWalkUpTip ? CLAIM_NODE_HELD_SOFT_CUE.tipEmissive : "#000000",
      );
      post.emissiveIntensity = showFirstWalkUpTip ? 0.22 : 0;
    }
    // Reason: PL163.2 — haze disc only while empty landmark is active.
    if (emptyHazeMatRef.current) {
      if (emptyCue.show && !showFirstWalkUpTip) {
        const envelope = claimEmptyLandmarkPulseEnvelope(now);
        emptyHazeMatRef.current.opacity =
          claimEmptyLandmarkHazeOpacity(envelope);
        emptyHazeMatRef.current.visible = true;
      } else if (emptyCue.show && showFirstWalkUpTip) {
        // Tip owns banner; keep a soft haze floor so empty grove still reads.
        const envelope = claimEmptyLandmarkPulseEnvelope(now);
        emptyHazeMatRef.current.opacity =
          claimEmptyLandmarkHazeOpacity(envelope) * 0.7;
        emptyHazeMatRef.current.visible = true;
      } else {
        emptyHazeMatRef.current.visible = false;
      }
    }
    // Reason: PL183.2 — quiet pulsing ember mist while soft-war contest is open.
    if (contestHazeMatRef.current) {
      if (contestMist.show) {
        const mistEnv = softWarContestAtmospherePulseEnvelope(now);
        contestHazeMatRef.current.opacity =
          softWarContestAtmosphereHazeOpacity(mistEnv);
        contestHazeMatRef.current.emissiveIntensity =
          softWarContestAtmosphereEmissiveIntensity(mistEnv);
        contestHazeMatRef.current.visible = true;
      } else {
        contestHazeMatRef.current.visible = false;
      }
    }
  });

  const initialEmissive = showFirstWalkUpTip
    ? CLAIM_NODE_HELD_SOFT_CUE.tipEmissive
    : contestActiveInitial
      ? claimNodeContestSoftCueEmissive(true)
      : yours
        ? claimNodeHeldSoftCueEmissive(yours)
        : emptyLandmark.show
          ? CLAIM_EMPTY_LANDMARK_CUE.emissive
          : "#000000";
  const initialIntensity = showFirstWalkUpTip
    ? CLAIM_NODE_HELD_SOFT_CUE.tipIntensity
    : contestActiveInitial
      ? claimNodeContestSoftCueEmissiveIntensity(true, 0)
      : yours
        ? claimNodeHeldSoftCueEmissiveIntensity(yours, 0)
        : emptyLandmark.show
          ? emptyLandmark.intensity
          : 0;

  return (
    <group
      position={[px, 0, pz]}
      userData={{
        claimNodeHeldSoftCue: yours ? "1" : "0",
        claimNodeContestSoftCue: contestActiveInitial ? "1" : "0",
        claimEmptyLandmark: emptyLandmark.show ? "1" : "0",
        softWarContestAtmosphere: contestAtmosphere.show ? "1" : "0",
      }}
    >
      {/* PL163.2 — soft pulsing cool grove mist under unheld claim node */}
      {emptyLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          userData={{ claimEmptyLandmark: true }}
        >
          <circleGeometry args={[emptyLandmark.hazeRadius, 20]} />
          <meshStandardMaterial
            ref={emptyHazeMatRef}
            color={emptyLandmark.hazeColor}
            emissive={emptyLandmark.emissive}
            emissiveIntensity={0.08}
            transparent
            opacity={emptyLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {/* PL183.2 — soft pulsing ember mist leftover while soft-war contest open */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, SOFT_WAR_CONTEST_ATMOSPHERE_CUE.hazeY, 0]}
        visible={contestAtmosphere.show}
        userData={{ softWarContestAtmosphere: true }}
      >
        <circleGeometry
          args={[SOFT_WAR_CONTEST_ATMOSPHERE_CUE.hazeRadius, 20]}
        />
        <meshStandardMaterial
          ref={contestHazeMatRef}
          color={SOFT_WAR_CONTEST_ATMOSPHERE_CUE.hazeColor}
          emissive={SOFT_WAR_CONTEST_ATMOSPHERE_CUE.emissive}
          emissiveIntensity={contestAtmosphere.intensity}
          transparent
          opacity={contestAtmosphere.hazeOpacity}
          depthWrite={false}
        />
      </mesh>
      {/* Footing ring (VA3.2) — PL145.1 held / PL146.1 contest / PL163.2 empty */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.42, 0.48, 0.12, 10]} />
        <TexturedStandardMaterial kind="plaster" ref={footingMatRef}
          color={kit.footingColor}
          roughness={kit.footing.roughness}
          metalness={kit.footing.metalness}
          emissive={initialEmissive}
          emissiveIntensity={initialIntensity * 0.55} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 1.8, 8]} />
        <TexturedStandardMaterial kind="wood" ref={postMatRef}
          color={highlighted ? kit.postLitColor : kit.postColor}
          roughness={kit.post.roughness}
          metalness={kit.post.metalness}
          emissive={showFirstWalkUpTip ? CLAIM_NODE_HELD_SOFT_CUE.tipEmissive : "#000000"}
          emissiveIntensity={showFirstWalkUpTip ? 0.22 : 0} />
      </mesh>
      {/* Finial (VA3.2) */}
      <mesh position={[0, 1.88, 0]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <TexturedStandardMaterial kind="wood" color={kit.finialColor}
          roughness={kit.finial.roughness}
          metalness={kit.finial.metalness} />
      </mesh>
      <mesh position={[0.35, 1.35, 0]} castShadow>
        <kitBoxGeometry args={[0.55, 0.7, 0.06]} />
        <TexturedStandardMaterial kind="cloth" ref={bannerMatRef}
          color={banner}
          roughness={kit.banner.roughness}
          metalness={kit.banner.metalness}
          emissive={initialEmissive}
          emissiveIntensity={initialIntensity} />
      </mesh>
      <WorldHtml position={[0, 2.1, 0]} center style={{ pointerEvents: "none" }}>
        <div
          style={{
            background: "rgba(20,28,18,0.75)",
            color: "#e8f0e2",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </WorldHtml>
      {showFirstWalkUpTip ? (
        <WorldHtml position={[0, 2.65, 0]} center style={{ pointerEvents: "none" }}>
          <div
            data-testid="claim-node-walkup-tip"
            data-claim-node-walkup-tip="1"
            style={{
              background: "rgba(20,28,18,0.8)",
              color: "#e8f0e2",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              fontWeight: 600,
              border: `1px solid ${CLAIM_NODE_HELD_SOFT_CUE.tipEmissive}`,
              boxShadow: "0 0 10px rgba(196,163,90,0.4)",
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
