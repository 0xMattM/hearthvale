/**
 * Procedural surface SoT for world object kits (VA1.1–VA1.3, VA2.*, VA3.*, VA4.*, VA5.*).
 * Color + roughness/metalness only — no texture maps / GLTF invent.
 * Complements cue polish (busy/ready/pads); gameplay / layouts unchanged.
 */

/** Shared PBR-ish surface fields for kit materials. */
export interface WorldObjectSurface {
  roughness: number;
  metalness: number;
}

/**
 * Quiet material variation so kits read less flat than default MeshStandard.
 * Values tuned for outdoor daylight + existing DayNightLighting.
 */
export const WORLD_OBJECT_SURFACE = {
  woodBark: { roughness: 0.92, metalness: 0.02 },
  woodCut: { roughness: 0.78, metalness: 0.04 },
  woodTimber: { roughness: 0.86, metalness: 0.03 },
  woodPlank: { roughness: 0.8, metalness: 0.04 },
  stone: { roughness: 0.88, metalness: 0.08 },
  stoneDark: { roughness: 0.9, metalness: 0.06 },
  stoneVein: { roughness: 0.36, metalness: 0.62 },
  millStone: { roughness: 0.74, metalness: 0.14 },
  millRoof: { roughness: 0.9, metalness: 0.02 },
  millDoor: { roughness: 0.88, metalness: 0.03 },
  millWheel: { roughness: 0.55, metalness: 0.38 },
  forgeBrick: { roughness: 0.84, metalness: 0.06 },
  forgeRoof: { roughness: 0.9, metalness: 0.02 },
  forgeChimney: { roughness: 0.72, metalness: 0.18 },
  forgeAnvil: { roughness: 0.4, metalness: 0.74 },
  forgeEmber: { roughness: 0.52, metalness: 0.12 },
  kitchenTimber: { roughness: 0.86, metalness: 0.03 },
  kitchenRoof: { roughness: 0.9, metalness: 0.02 },
  kitchenPot: { roughness: 0.42, metalness: 0.58 },
  kitchenBoard: { roughness: 0.82, metalness: 0.04 },
  workshopTimber: { roughness: 0.88, metalness: 0.02 },
  workshopRoof: { roughness: 0.9, metalness: 0.02 },
  workshopBench: { roughness: 0.68, metalness: 0.1 },
  workshopTool: { roughness: 0.48, metalness: 0.55 },
  /** VA1.2 — loom / alchemy / dock / pen + scarce yard props. */
  loomFrame: { roughness: 0.88, metalness: 0.03 },
  loomBeam: { roughness: 0.9, metalness: 0.02 },
  loomWarp: { roughness: 0.72, metalness: 0.05 },
  loomShuttle: { roughness: 0.55, metalness: 0.22 },
  alchemyBench: { roughness: 0.82, metalness: 0.06 },
  alchemyVessel: { roughness: 0.38, metalness: 0.18 },
  alchemyGlass: { roughness: 0.22, metalness: 0.08 },
  alchemyBurner: { roughness: 0.58, metalness: 0.42 },
  dockPlank: { roughness: 0.86, metalness: 0.03 },
  dockPile: { roughness: 0.9, metalness: 0.02 },
  dockWater: { roughness: 0.28, metalness: 0.12 },
  dockCleat: { roughness: 0.48, metalness: 0.62 },
  penRail: { roughness: 0.9, metalness: 0.02 },
  penPost: { roughness: 0.88, metalness: 0.03 },
  penTrough: { roughness: 0.78, metalness: 0.08 },
  penHay: { roughness: 0.94, metalness: 0.01 },
  yardCrate: { roughness: 0.86, metalness: 0.03 },
  yardBarrel: { roughness: 0.8, metalness: 0.06 },
  yardPost: { roughness: 0.9, metalness: 0.02 },
  yardRope: { roughness: 0.88, metalness: 0.02 },
  yardStone: { roughness: 0.9, metalness: 0.06 },
  /** VA1.3 — environment trees / fences / sheds + crop soil. */
  treeTrunk: { roughness: 0.9, metalness: 0.02 },
  treeBarkBand: { roughness: 0.94, metalness: 0.01 },
  treeCanopy: { roughness: 0.88, metalness: 0.02 },
  treeCanopyLit: { roughness: 0.78, metalness: 0.03 },
  forestTrunk: { roughness: 0.92, metalness: 0.02 },
  forestCanopy: { roughness: 0.86, metalness: 0.02 },
  forestCanopyAlt: { roughness: 0.8, metalness: 0.03 },
  fencePost: { roughness: 0.9, metalness: 0.02 },
  fenceRail: { roughness: 0.86, metalness: 0.03 },
  fenceCap: { roughness: 0.78, metalness: 0.04 },
  shedTimber: { roughness: 0.86, metalness: 0.03 },
  shedRoof: { roughness: 0.9, metalness: 0.02 },
  shedDoor: { roughness: 0.84, metalness: 0.04 },
  shedSill: { roughness: 0.8, metalness: 0.05 },
  cropSoil: { roughness: 0.94, metalness: 0.02 },
  cropSoilMoist: { roughness: 0.88, metalness: 0.04 },
  cropFurrow: { roughness: 0.96, metalness: 0.01 },
  cropBorder: { roughness: 0.88, metalness: 0.03 },
  cropClod: { roughness: 0.92, metalness: 0.02 },
  /** VA2.1 — travel portal posts / lintel / footing (MAP_IDENTITY colors stay in catalog). */
  portalStone: { roughness: 0.82, metalness: 0.1 },
  portalStoneDark: { roughness: 0.88, metalness: 0.06 },
  portalBand: { roughness: 0.42, metalness: 0.58 },
  portalThreshold: { roughness: 0.9, metalness: 0.04 },
  portalKeystone: { roughness: 0.74, metalness: 0.16 },
  /** VA2.2 — vendor stall + market board commerce kits. */
  vendorTimber: { roughness: 0.86, metalness: 0.03 },
  vendorCounter: { roughness: 0.78, metalness: 0.05 },
  vendorAwning: { roughness: 0.92, metalness: 0.02 },
  vendorStripe: { roughness: 0.88, metalness: 0.02 },
  vendorGoods: { roughness: 0.7, metalness: 0.08 },
  vendorGoodsFresh: { roughness: 0.82, metalness: 0.03 },
  marketPost: { roughness: 0.88, metalness: 0.03 },
  marketFrame: { roughness: 0.8, metalness: 0.05 },
  marketSlate: { roughness: 0.9, metalness: 0.04 },
  marketStrip: { roughness: 0.72, metalness: 0.08 },
  /** VA2.3 — notice / build / arena plaque kits. */
  noticePost: { roughness: 0.9, metalness: 0.02 },
  noticePlaque: { roughness: 0.82, metalness: 0.04 },
  noticeSlate: { roughness: 0.92, metalness: 0.03 },
  noticePaper: { roughness: 0.94, metalness: 0.01 },
  noticeTrim: { roughness: 0.45, metalness: 0.55 },
  noticeFooting: { roughness: 0.88, metalness: 0.06 },
  buildPost: { roughness: 0.88, metalness: 0.03 },
  buildBoard: { roughness: 0.8, metalness: 0.05 },
  buildBase: { roughness: 0.9, metalness: 0.04 },
  buildTrim: { roughness: 0.48, metalness: 0.42 },
  buildCap: { roughness: 0.74, metalness: 0.1 },
  arenaPost: { roughness: 0.86, metalness: 0.04 },
  arenaPlaque: { roughness: 0.72, metalness: 0.12 },
  arenaBase: { roughness: 0.9, metalness: 0.05 },
  arenaTrim: { roughness: 0.38, metalness: 0.62 },
  arenaBand: { roughness: 0.5, metalness: 0.48 },
  /** VA2.4 — tutor NPC + housing decor kits. */
  tutorSkin: { roughness: 0.78, metalness: 0.04 },
  tutorCloak: { roughness: 0.88, metalness: 0.03 },
  tutorBoots: { roughness: 0.7, metalness: 0.08 },
  decorPadStone: { roughness: 0.9, metalness: 0.06 },
  decorPadLip: { roughness: 0.82, metalness: 0.08 },
  decorPlanterPot: { roughness: 0.84, metalness: 0.05 },
  decorPlanterSoil: { roughness: 0.94, metalness: 0.02 },
  decorPlanterFoliage: { roughness: 0.9, metalness: 0.02 },
  decorPlanterBloom: { roughness: 0.72, metalness: 0.04 },
  decorBannerPole: { roughness: 0.88, metalness: 0.03 },
  decorBannerCloth: { roughness: 0.92, metalness: 0.02 },
  decorBannerFinial: { roughness: 0.42, metalness: 0.58 },
  /** VA2.5 — hunt trail / edge thicket path + creature kits. */
  huntPath: { roughness: 0.94, metalness: 0.02 },
  huntPathCurb: { roughness: 0.88, metalness: 0.04 },
  huntBrush: { roughness: 0.9, metalness: 0.02 },
  huntBrushTrunk: { roughness: 0.92, metalness: 0.02 },
  huntCreatureHide: { roughness: 0.82, metalness: 0.04 },
  huntCreatureHorn: { roughness: 0.68, metalness: 0.08 },
  huntUnderbrush: { roughness: 0.94, metalness: 0.01 },
  /** VA2.6 — plaza fountain + warrior arena prop kits. Stone stays matte; water is wet, not chrome. */
  fountainBasin: { roughness: 0.92, metalness: 0.04 },
  fountainSpout: { roughness: 0.88, metalness: 0.08 },
  fountainWater: { roughness: 0.62, metalness: 0 },
  fountainLip: { roughness: 0.86, metalness: 0.06 },
  fountainFooting: { roughness: 0.94, metalness: 0.03 },
  arenaPropPost: { roughness: 0.88, metalness: 0.04 },
  arenaPropRope: { roughness: 0.9, metalness: 0.02 },
  arenaPropBench: { roughness: 0.84, metalness: 0.05 },
  arenaPropBannerPole: { roughness: 0.86, metalness: 0.04 },
  arenaPropBannerCloth: { roughness: 0.9, metalness: 0.03 },
  arenaPropPostCap: { roughness: 0.72, metalness: 0.14 },
  /** VA3.1 — expand pad stone + corner posts (afford colors stay on EXPAND_PAD_*). */
  expandPadStone: { roughness: 0.9, metalness: 0.05 },
  expandPadLip: { roughness: 0.84, metalness: 0.07 },
  expandPost: { roughness: 0.88, metalness: 0.03 },
  expandPostCap: { roughness: 0.74, metalness: 0.1 },
  /** VA3.2 — claim node beacon post / banner / footing. */
  claimPost: { roughness: 0.86, metalness: 0.04 },
  claimFooting: { roughness: 0.9, metalness: 0.06 },
  claimBanner: { roughness: 0.92, metalness: 0.02 },
  claimFinial: { roughness: 0.48, metalness: 0.52 },
  /** VA3.3 — avatar farmer kit (palette / PL122.1 tint stay on resolveAvatarKitColors). */
  avatarCloth: { roughness: 0.9, metalness: 0.02 },
  avatarPants: { roughness: 0.86, metalness: 0.03 },
  avatarVest: { roughness: 0.78, metalness: 0.06 },
  avatarSkin: { roughness: 0.76, metalness: 0.04 },
  avatarBoots: { roughness: 0.68, metalness: 0.1 },
  avatarBootCuff: { roughness: 0.72, metalness: 0.08 },
  avatarHat: { roughness: 0.92, metalness: 0.02 },
  avatarHatBand: { roughness: 0.84, metalness: 0.04 },
  avatarBelt: { roughness: 0.7, metalness: 0.12 },
  avatarToolShaft: { roughness: 0.88, metalness: 0.03 },
  avatarToolFerrule: { roughness: 0.42, metalness: 0.58 },
  avatarToolHead: { roughness: 0.4, metalness: 0.62 },
  /** VA3.4 — civic block silhouettes (pad cool tint stays on CITY_HUB_VISUAL). */
  civicPad: { roughness: 0.9, metalness: 0.06 },
  civicWall: { roughness: 0.84, metalness: 0.05 },
  civicRoof: { roughness: 0.88, metalness: 0.04 },
  civicDoor: { roughness: 0.86, metalness: 0.03 },
  civicWindow: { roughness: 0.28, metalness: 0.12 },
  civicSill: { roughness: 0.78, metalness: 0.08 },
  civicTrim: { roughness: 0.72, metalness: 0.14 },
  /** VA4.1 — city hub floors (hexes stay on CITY_HUB_VISUAL / cityHubFloorColors). */
  floorStreets: { roughness: 0.94, metalness: 0.04 },
  floorPlaza: { roughness: 0.82, metalness: 0.1 },
  floorScarceYard: { roughness: 0.92, metalness: 0.03 },
  floorInlay: { roughness: 0.76, metalness: 0.14 },
  floorRoad: { roughness: 0.88, metalness: 0.06 },
  floorCurb: { roughness: 0.78, metalness: 0.12 },
  /** VA4.2 — homestead yard floors (hexes stay on homesteadYardFloorColors). */
  floorMeadow: { roughness: 0.96, metalness: 0.01 },
  floorPlot: { roughness: 0.9, metalness: 0.03 },
  floorYardPad: { roughness: 0.86, metalness: 0.05 },
  floorDirtPath: { roughness: 0.94, metalness: 0.02 },
  floorPathLip: { roughness: 0.88, metalness: 0.04 },
  /** VA4.3 — explore wilds floors (hexes stay on EXPLORE_WILDS_VISUAL / EXPLORE_SECTIONS). */
  floorCanopy: { roughness: 0.97, metalness: 0.01 },
  floorWoodland: { roughness: 0.93, metalness: 0.02 },
  floorMines: { roughness: 0.86, metalness: 0.09 },
  floorHunt: { roughness: 0.91, metalness: 0.03 },
  floorWildsPath: { roughness: 0.95, metalness: 0.02 },
  floorHuntPath: { roughness: 0.89, metalness: 0.04 },
  floorWildsPathLip: { roughness: 0.84, metalness: 0.06 },
  /** VA4.4 — warrior arena floors (hexes stay on WARRIOR_ARENA_VISUAL). */
  floorArenaGrounds: { roughness: 0.96, metalness: 0.02 },
  floorArenaRing: { roughness: 0.78, metalness: 0.08 },
  floorArenaRingBorder: { roughness: 0.84, metalness: 0.06 },
  floorArenaChalk: { roughness: 0.7, metalness: 0.04 },
  floorArenaPath: { roughness: 0.93, metalness: 0.03 },
  floorArenaRingLip: { roughness: 0.8, metalness: 0.1 },
  /** VA5.1 — remote presence rings (RGB/opacity stay on PRESENCE_PEER_* / NEARBY_PEER_*). */
  peerHalo: { roughness: 0.92, metalness: 0.04 },
  peerPing: { roughness: 0.78, metalness: 0.1 },
  peerRingLip: { roughness: 0.7, metalness: 0.16 },
  /** VA5.2 — avatar ground shadow disc (color/opacity stay on kit helper). */
  avatarShadow: { roughness: 0.98, metalness: 0.0 },
  /** VA5.3 — crop growth progress bar (growMs / ready cues stay on catalogs). */
  cropProgressFill: { roughness: 0.68, metalness: 0.08 },
  cropProgressFrame: { roughness: 0.88, metalness: 0.04 },
  /** VA5.4 — cue-pad flash discs (RGB/envelope stay on *_PAD_FLASH catalogs). */
  cuePadFlash: { roughness: 0.84, metalness: 0.06 },
  cuePadFlashWater: { roughness: 0.62, metalness: 0.12 },
} as const satisfies Record<string, WorldObjectSurface>;

export type WorldObjectSurfaceKey = keyof typeof WORLD_OBJECT_SURFACE;

/**
 * Resolves a named kit surface (VA1.1).
 *
 * @param key - Surface id from WORLD_OBJECT_SURFACE.
 * @returns Roughness + metalness for meshStandardMaterial.
 */
export function worldObjectSurface(
  key: WorldObjectSurfaceKey,
): WorldObjectSurface {
  return WORLD_OBJECT_SURFACE[key];
}

/**
 * Stump bark / cut-face surface by ready state (VA1.1).
 * Ready cut-face is smoother; depleted bark stays duller.
 *
 * @param ready - True when choppable now.
 * @returns Body (bark) + top (cut) surface fields.
 */
export function gatherStumpSurfaceMaterials(ready: boolean): {
  body: WorldObjectSurface;
  top: WorldObjectSurface;
  barkBandColor: string;
  rootColor: string;
  kerfColor: string;
  showKerf: boolean;
} {
  const bark = WORLD_OBJECT_SURFACE.woodBark;
  const cut = WORLD_OBJECT_SURFACE.woodCut;
  if (ready) {
    return {
      body: bark,
      top: { roughness: cut.roughness - 0.06, metalness: cut.metalness },
      barkBandColor: "#4a3420",
      rootColor: "#3a2a18",
      kerfColor: "#2a2010",
      showKerf: true,
    };
  }
  return {
    body: { roughness: 0.95, metalness: 0.01 },
    top: { roughness: 0.9, metalness: 0.02 },
    barkBandColor: "#2e2820",
    rootColor: "#241c14",
    kerfColor: "#1a1610",
    showKerf: false,
  };
}

/**
 * Chop-ready wood node kit — tall trunk + leafy canopy (cooling stays a stump).
 * Heights are local Y on the station group; collision stays on the trunk core.
 */
export const GATHER_READY_TREE = {
  trunkY: 0.88,
  trunkHeight: 1.65,
  trunkRadiusTop: 0.15,
  trunkRadiusBase: 0.22,
  flareY: 0.12,
  flareHeight: 0.22,
  flareRadiusTop: 0.26,
  flareRadiusBase: 0.32,
  barkBandY: 1.18,
  canopyY: 2.05,
  canopyRadius: 0.88,
  canopyLitX: 0.38,
  canopyLitY: 2.32,
  canopyLitZ: -0.22,
  canopyLitRadius: 0.52,
  canopySideX: -0.34,
  canopySideY: 2.22,
  canopySideZ: 0.24,
  canopySideRadius: 0.46,
  /** WorldHtml sits above the canopy, not inside the leaf blob. */
  labelY: 3.2,
  walkUpTipY: 3.65,
  depletedTimerY: 1.2,
  depletedWalkUpTipY: 1.15,
  /** Cooling leftover — short trunk segment, same caliber as the living tree. */
  stumpBodyHeight: 0.4,
  stumpBodyY: 0.22,
  stumpRadiusTop: 0.2,
  stumpRadiusBase: 0.22,
  stumpBarkBandY: 0.28,
  stumpBarkBandRadius: 0.215,
  stumpTopY: 0.43,
  stumpTopHeight: 0.08,
  stumpTopRadius: 0.195,
} as const;

/**
 * Mesh mode for a wood gather node.
 *
 * @param ready - True when the node can be chopped now.
 * @returns Leafy tree while ready; stump while cooling.
 */
export function gatherWoodNodeMeshMode(ready: boolean): "tree" | "stump" {
  return ready ? "tree" : "stump";
}

/**
 * Top of the ready canopy sphere (local Y).
 *
 * @returns Canopy center Y plus radius.
 */
export function gatherReadyTreeCanopyTopY(): number {
  return GATHER_READY_TREE.canopyY + GATHER_READY_TREE.canopyRadius;
}

/**
 * Extra radius of the cooling stump vs the living trunk base.
 * Near zero so the leftover reads as the same tree after a chop.
 *
 * @returns `stumpRadiusBase - trunkRadiusBase`.
 */
export function gatherStumpVsTrunkRadiusDelta(): number {
  return GATHER_READY_TREE.stumpRadiusBase - GATHER_READY_TREE.trunkRadiusBase;
}

/**
 * Chop-ready gather tree materials — brighter harvest canopy than yard decor.
 *
 * @returns Trunk / canopy surfaces + tints.
 */
export function gatherReadyTreeMaterials(): {
  trunk: WorldObjectSurface;
  barkBand: WorldObjectSurface;
  canopy: WorldObjectSurface;
  canopyLit: WorldObjectSurface;
  trunkColor: string;
  barkBandColor: string;
  rootColor: string;
  canopyColor: string;
  canopyLitColor: string;
} {
  return {
    trunk: WORLD_OBJECT_SURFACE.treeTrunk,
    barkBand: WORLD_OBJECT_SURFACE.treeBarkBand,
    canopy: WORLD_OBJECT_SURFACE.treeCanopy,
    canopyLit: WORLD_OBJECT_SURFACE.treeCanopyLit,
    trunkColor: "#5c4028",
    barkBandColor: "#4a3020",
    rootColor: "#3a2a18",
    canopyColor: "#3d7a3a",
    canopyLitColor: "#4e8f48",
  };
}

/**
 * Ore rock / vein surface by ready state (VA1.1).
 * Ready veins stay metallic; cooling rock dulls toward stoneDark.
 *
 * @param ready - True when chip-ready.
 * @returns Rock + vein surface fields and rubble tint.
 */
export function gatherOreSurfaceMaterials(ready: boolean): {
  rock: WorldObjectSurface;
  vein: WorldObjectSurface;
  rubbleColor: string;
  understoneColor: string;
} {
  if (ready) {
    return {
      rock: WORLD_OBJECT_SURFACE.stone,
      vein: WORLD_OBJECT_SURFACE.stoneVein,
      rubbleColor: "#5a626a",
      understoneColor: "#4a5058",
    };
  }
  return {
    rock: WORLD_OBJECT_SURFACE.stoneDark,
    vein: { roughness: 0.9, metalness: 0.05 },
    rubbleColor: "#2a3036",
    understoneColor: "#222830",
  };
}

/**
 * Process-station kit color + surface SoT.
 * VA1.1 — mill / forge / kitchen / workshop.
 * VA1.2 — loom / alchemy_bench.
 */
export const PROCESS_STATION_KIT_MATERIALS = {
  mill: {
    baseColor: "#7a7f86",
    towerColor: "#9aa0a8",
    towerLitColor: "#b8a878",
    roofColor: "#5a4030",
    doorColor: "#3a2a1a",
    wheelColor: "#6a6e74",
    wheelUpgradedColor: "#8a9098",
    bandColor: "#6a7078",
    base: WORLD_OBJECT_SURFACE.millStone,
    tower: WORLD_OBJECT_SURFACE.millStone,
    roof: WORLD_OBJECT_SURFACE.millRoof,
    door: WORLD_OBJECT_SURFACE.millDoor,
    wheel: WORLD_OBJECT_SURFACE.millWheel,
  },
  forge: {
    bodyColor: "#6b4a3a",
    bodyLitColor: "#8a6048",
    roofColor: "#3d2a1a",
    chimneyColor: "#4a4a4a",
    chimneyUpgradedColor: "#5a5a5a",
    anvilColor: "#2a2a2e",
    emberColor: "#ff6a2a",
    fireboxLipColor: "#3a2a22",
    body: WORLD_OBJECT_SURFACE.forgeBrick,
    roof: WORLD_OBJECT_SURFACE.forgeRoof,
    chimney: WORLD_OBJECT_SURFACE.forgeChimney,
    anvil: WORLD_OBJECT_SURFACE.forgeAnvil,
    ember: WORLD_OBJECT_SURFACE.forgeEmber,
  },
  kitchen: {
    bodyColor: "#8a5a3a",
    bodyLitColor: "#a87858",
    roofColor: "#3d2a1a",
    potColor: "#c45a2a",
    boardColor: "#e8dcc8",
    shelfColor: "#6a4a30",
    body: WORLD_OBJECT_SURFACE.kitchenTimber,
    roof: WORLD_OBJECT_SURFACE.kitchenRoof,
    pot: WORLD_OBJECT_SURFACE.kitchenPot,
    board: WORLD_OBJECT_SURFACE.kitchenBoard,
  },
  workshop: {
    bodyColor: "#7a5a38",
    bodyLitColor: "#a88858",
    roofColor: "#3d2a1a",
    benchColor: "#c4a35a",
    plankColor: "#8a6a40",
    toolColor: "#7a8088",
    body: WORLD_OBJECT_SURFACE.workshopTimber,
    roof: WORLD_OBJECT_SURFACE.workshopRoof,
    bench: WORLD_OBJECT_SURFACE.workshopBench,
    tool: WORLD_OBJECT_SURFACE.workshopTool,
  },
  loom: {
    bodyColor: "#6a5040",
    bodyLitColor: "#9a7a5a",
    beamColor: "#3a2a1a",
    crossColor: "#4a3828",
    warpColor: "#8a7050",
    warpLitColor: "#c8b070",
    shuttleColor: "#c4a878",
    treadleColor: "#5a4030",
    body: WORLD_OBJECT_SURFACE.loomFrame,
    beam: WORLD_OBJECT_SURFACE.loomBeam,
    warp: WORLD_OBJECT_SURFACE.loomWarp,
    shuttle: WORLD_OBJECT_SURFACE.loomShuttle,
  },
  alchemy_bench: {
    bodyColor: "#4a5a48",
    bodyLitColor: "#6a7a68",
    vesselColor: "#5a8070",
    vesselLitColor: "#8ab0a0",
    // Reason: neon flaskLit was reading as a flickering green blob under Free pads.
    flaskColor: "#6a8860",
    flaskLitColor: "#8aaa78",
    burnerColor: "#3a3228",
    burnerLipColor: "#5a5040",
    body: WORLD_OBJECT_SURFACE.alchemyBench,
    vessel: WORLD_OBJECT_SURFACE.alchemyVessel,
    flask: WORLD_OBJECT_SURFACE.alchemyGlass,
    burner: WORLD_OBJECT_SURFACE.alchemyBurner,
  },
} as const;

export type ProcessStationKitKind = keyof typeof PROCESS_STATION_KIT_MATERIALS;

/**
 * Kit materials for a process station (VA1.1–VA1.2).
 *
 * @param kind - mill | forge | kitchen | workshop | loom | alchemy_bench.
 * @returns Color + surface fields for that kit.
 */
export function processStationKitMaterials<K extends ProcessStationKitKind>(
  kind: K,
): (typeof PROCESS_STATION_KIT_MATERIALS)[K] {
  return PROCESS_STATION_KIT_MATERIALS[kind];
}

/**
 * Fishing-dock plank / water / cleat surfaces by ready state (VA1.2).
 * Ready water stays wetter; cooling planks dull slightly.
 *
 * @param ready - True when catch-ready.
 * @returns Deck / pile / water / cleat surfaces + tints.
 */
export function gatherDockSurfaceMaterials(ready: boolean): {
  deck: WorldObjectSurface;
  pile: WorldObjectSurface;
  water: WorldObjectSurface;
  cleat: WorldObjectSurface;
  deckColor: string;
  deckLitColor: string;
  pileColor: string;
  apronColor: string;
  waterColor: string;
  waterCoolColor: string;
  cleatColor: string;
} {
  const deck = WORLD_OBJECT_SURFACE.dockPlank;
  const pile = WORLD_OBJECT_SURFACE.dockPile;
  const cleat = WORLD_OBJECT_SURFACE.dockCleat;
  if (ready) {
    return {
      deck,
      pile,
      water: WORLD_OBJECT_SURFACE.dockWater,
      cleat,
      deckColor: "#5a4030",
      deckLitColor: "#8a6a48",
      pileColor: "#4a3424",
      apronColor: "#3a2a1c",
      waterColor: "#3a6a88",
      waterCoolColor: "#2a4050",
      cleatColor: "#6a7078",
    };
  }
  return {
    deck: { roughness: 0.92, metalness: 0.02 },
    pile: { roughness: 0.94, metalness: 0.01 },
    water: { roughness: 0.45, metalness: 0.06 },
    cleat: { roughness: 0.62, metalness: 0.4 },
    deckColor: "#4a3828",
    deckLitColor: "#6a5040",
    pileColor: "#3a2a1c",
    apronColor: "#2a2018",
    waterColor: "#2a4050",
    waterCoolColor: "#2a4050",
    cleatColor: "#4a5058",
  };
}

/**
 * Animal-pen rail / trough / hay surfaces by ready state (VA1.2).
 * Ready trough reads cleaner; cooling rails dull toward weathered timber.
 *
 * @param ready - True when care-ready.
 * @returns Rail / post / trough / hay surfaces + tints.
 */
export function gatherPenSurfaceMaterials(ready: boolean): {
  rail: WorldObjectSurface;
  post: WorldObjectSurface;
  trough: WorldObjectSurface;
  hay: WorldObjectSurface;
  railColor: string;
  railLitColor: string;
  troughColor: string;
  hayColor: string;
  showHay: boolean;
} {
  if (ready) {
    return {
      rail: WORLD_OBJECT_SURFACE.penRail,
      post: WORLD_OBJECT_SURFACE.penPost,
      trough: WORLD_OBJECT_SURFACE.penTrough,
      hay: WORLD_OBJECT_SURFACE.penHay,
      railColor: "#5a4a30",
      railLitColor: "#8a7a4a",
      troughColor: "#6a5a40",
      hayColor: "#c4b070",
      showHay: true,
    };
  }
  return {
    rail: { roughness: 0.94, metalness: 0.01 },
    post: { roughness: 0.92, metalness: 0.02 },
    trough: { roughness: 0.88, metalness: 0.04 },
    hay: { roughness: 0.96, metalness: 0.01 },
    railColor: "#4a3e28",
    railLitColor: "#6a5a40",
    troughColor: "#4a4030",
    hayColor: "#8a7a50",
    showHay: false,
  };
}

/** Scarce city-yard atmosphere prop kinds (VA1.2) — not stations. */
export type CityScarceYardPropKind =
  | "crate"
  | "barrel"
  | "post"
  | "rope"
  | "stone";

/**
 * Scarce yard prop colors + surfaces (VA1.2).
 * Cheap atmosphere only — no interact / contention invent.
 */
export const CITY_SCARCE_YARD_PROP_MATERIALS = {
  crate: {
    color: "#7a5a38",
    bandColor: "#5a4030",
    body: WORLD_OBJECT_SURFACE.yardCrate,
  },
  barrel: {
    color: "#6a4a30",
    bandColor: "#8a8080",
    body: WORLD_OBJECT_SURFACE.yardBarrel,
  },
  post: {
    color: "#4a3828",
    tipColor: "#6a5840",
    body: WORLD_OBJECT_SURFACE.yardPost,
  },
  rope: {
    color: "#8a7048",
    body: WORLD_OBJECT_SURFACE.yardRope,
  },
  stone: {
    color: "#6a6860",
    mossColor: "#4a5a40",
    body: WORLD_OBJECT_SURFACE.yardStone,
  },
} as const;

/**
 * World placements for scarce yard props (CityEnvironment units).
 * Kept off station pads (~1.15r) and plaza fountain.
 */
export const CITY_SCARCE_YARD_PROP_PLACEMENTS: ReadonlyArray<{
  kind: CityScarceYardPropKind;
  x: number;
  z: number;
  rotY: number;
}> = [
  { kind: "crate", x: -3.2, z: 0.4, rotY: 0.35 },
  { kind: "barrel", x: 3.0, z: 1.2, rotY: 0.1 },
  { kind: "post", x: 0.2, z: 14.5, rotY: 0 },
  { kind: "rope", x: -16.2, z: 6.0, rotY: 0.6 },
  { kind: "stone", x: 16.4, z: 11.0, rotY: 0.2 },
  { kind: "crate", x: 14.8, z: 0.6, rotY: -0.25 },
];

/**
 * Kit materials for a scarce yard prop (VA1.2).
 *
 * @param kind - crate | barrel | post | rope | stone.
 * @returns Color + surface fields for that prop.
 */
export function cityScarceYardPropMaterials<K extends CityScarceYardPropKind>(
  kind: K,
): (typeof CITY_SCARCE_YARD_PROP_MATERIALS)[K] {
  return CITY_SCARCE_YARD_PROP_MATERIALS[kind];
}

/**
 * Scarce yard atmosphere prop placements (VA1.2).
 *
 * @returns Prop rows for CityEnvironment (not contendable stations).
 */
export function cityScarceYardProps(): ReadonlyArray<{
  kind: CityScarceYardPropKind;
  x: number;
  z: number;
  rotY: number;
}> {
  return CITY_SCARCE_YARD_PROP_PLACEMENTS;
}

/**
 * City atmosphere decor — fences / trees / bushes / main hall (env-only).
 * Not BuildingType stations; no interact / contention invent.
 */
export type CityAtmosphereDecorTree = {
  x: number;
  z: number;
  /** Uniform scale (1 = homestead-sized canopy). */
  scale: number;
};

export type CityAtmosphereDecorBush = {
  x: number;
  z: number;
  scale: number;
};

export type CityAtmosphereDecorFence = {
  /** Segment center in world units. */
  x: number;
  z: number;
  /** Yaw — 0 = rails along X, π/2 = along Z. */
  rotY: number;
  /** Rail run length. */
  length: number;
};

export type CityAtmosphereDecorHall = {
  x: number;
  z: number;
  rotY: number;
  w: number;
  d: number;
  h: number;
};

/**
 * Decorative tree placements — large leafy hub trees, clear of mill/crops/kitchen/dock.
 * Follow camera ghosts a canopy only while the player stands behind it.
 */
export const CITY_ATMOSPHERE_TREE_PLACEMENTS: ReadonlyArray<CityAtmosphereDecorTree> =
  [
    // Plaza corners — inside city fog so they read from the fountain.
    { x: -7.5, z: -6.5, scale: 2.0 },
    { x: 9.5, z: -8.5, scale: 1.9 },
    { x: -10.0, z: 8.5, scale: 2.1 },
    { x: 10.0, z: 8.5, scale: 1.8 },
    { x: -13.5, z: -15.5, scale: 2.2 },
    { x: 15.5, z: -11.5, scale: 2.1 },
    { x: -19.5, z: 3.5, scale: 1.85 },
    { x: 19.5, z: 5.0, scale: 2.55 },
    { x: -17.0, z: 17.5, scale: 1.7 },
    { x: 22.0, z: 13.5, scale: 2.2 },
    { x: -6.5, z: 19.5, scale: 1.55 },
    { x: 4.5, z: 23.0, scale: 1.9 },
    { x: 22.0, z: -3.5, scale: 2.4 },
    { x: -24.0, z: 14.5, scale: 2.0 },
    { x: 24.0, z: 13.0, scale: 1.65 },
    { x: -3.5, z: 21.5, scale: 2.15 },
    { x: 16.5, z: 17.0, scale: 1.75 },
    { x: -12.0, z: 22.0, scale: 2.05 },
  ];

/**
 * Soft bush clusters — walk-through foliage near trees / civic edges.
 */
export const CITY_ATMOSPHERE_BUSH_PLACEMENTS: ReadonlyArray<CityAtmosphereDecorBush> =
  [
    { x: -12.0, z: -12.0, scale: 1.1 },
    { x: 14.0, z: -10.0, scale: 0.95 },
    { x: -18.0, z: 5.0, scale: 1.1 },
    { x: 18.0, z: 7.0, scale: 1.0 },
    { x: -16.0, z: 16.0, scale: 1.05 },
    { x: 21.0, z: 12.0, scale: 1.0 },
    { x: -5.0, z: 18.0, scale: 0.9 },
    { x: 4.0, z: 21.5, scale: 0.95 },
  ];

/**
 * Short fence runs — unused now; the stone perimeter wall owns the hub rim.
 */
export const CITY_ATMOSPHERE_FENCE_PLACEMENTS: ReadonlyArray<CityAtmosphereDecorFence> =
  [];

export type CityAtmosphereDecorExtraKind =
  | "lantern"
  | "bench"
  | "planter"
  | "trough"
  | "signpost"
  | "column"
  | "arch"
  | "wall"
  | "rock"
  | "flowerpot";

export type CityAtmosphereDecorExtra = {
  kind: CityAtmosphereDecorExtraKind;
  x: number;
  z: number;
  rotY: number;
  /** Optional uniform scale (columns / walls / pots). */
  scale?: number;
};

/**
 * Extra civic props — lighter plaza set (breathing room around fountain).
 * Kept off fountain solid (~1.4r) and road center strip.
 */
export const CITY_ATMOSPHERE_EXTRA_PLACEMENTS: ReadonlyArray<CityAtmosphereDecorExtra> =
  [
    { kind: "lantern", x: -8.4, z: -7.8, rotY: 0 },
    { kind: "lantern", x: 8.4, z: -7.8, rotY: 0 },
    { kind: "lantern", x: -8.4, z: 7.6, rotY: 0 },
    { kind: "lantern", x: 8.4, z: 7.6, rotY: 0 },
    { kind: "bench", x: -8.5, z: -4.5, rotY: 0.35 },
    { kind: "bench", x: 8.5, z: -4.5, rotY: -0.35 },
    { kind: "planter", x: -4.0, z: -9.5, rotY: 0.2 },
    { kind: "planter", x: 4.2, z: -9.3, rotY: -0.15 },
    { kind: "signpost", x: -2.8, z: -7.5, rotY: 0.2 },
    { kind: "signpost", x: 2.8, z: 8.5, rotY: -0.15 },

    // Inner-court posts + low muritos on the quadrant corners (lanterns stay off)
    { kind: "column", x: -5.4, z: -5.4, rotY: 0, scale: 1.0 },
    { kind: "column", x: 5.4, z: -5.4, rotY: 0, scale: 1.0 },
    { kind: "column", x: -5.4, z: 5.4, rotY: 0, scale: 0.95 },
    { kind: "column", x: 5.4, z: 5.4, rotY: 0, scale: 0.95 },

    // Stone gate on the City Hall approach — curved vault, not a lintel box
    { kind: "arch", x: 0, z: -8.4, rotY: 0, scale: 1.0 },

    // L-shaped muritos around each inner-court column
    { kind: "wall", x: -5.4, z: -6.2, rotY: 0, scale: 1.0 },
    { kind: "wall", x: 5.4, z: -6.2, rotY: 0, scale: 1.0 },
    { kind: "wall", x: -5.4, z: 6.2, rotY: 0, scale: 1.0 },
    { kind: "wall", x: 5.4, z: 6.2, rotY: 0, scale: 1.0 },
    { kind: "wall", x: -6.2, z: -5.4, rotY: Math.PI / 2, scale: 1.0 },
    { kind: "wall", x: 6.2, z: -5.4, rotY: Math.PI / 2, scale: 1.0 },
    { kind: "wall", x: -6.2, z: 5.4, rotY: Math.PI / 2, scale: 1.0 },
    { kind: "wall", x: 6.2, z: 5.4, rotY: Math.PI / 2, scale: 1.0 },

    { kind: "flowerpot", x: -7.0, z: -9.2, rotY: 0.2, scale: 1.0 },
    { kind: "flowerpot", x: 7.0, z: -9.2, rotY: -0.15, scale: 0.95 },
    { kind: "flowerpot", x: -7.0, z: 8.8, rotY: 0.3, scale: 1.0 },
    { kind: "flowerpot", x: 7.0, z: 8.8, rotY: -0.2, scale: 0.95 },

    { kind: "rock", x: -3.8, z: 3.6, rotY: 0.4, scale: 1.0 },
    { kind: "rock", x: 3.8, z: -3.6, rotY: -0.5, scale: 0.9 },
  ];

/**
 * Main civic hall — large decorative façade on the portal side of the plaza.
 * Env-only; not a BuildingType / scarce station.
 */
export const CITY_ATMOSPHERE_MAIN_HALL: CityAtmosphereDecorHall = {
  x: 0,
  z: -13.4,
  rotY: 0,
  w: 6.2,
  d: 3.4,
  h: 3.9,
};

/**
 * Cooler civic tree palette (distinct from warm homestead canopy).
 *
 * @returns Trunk / canopy surfaces + tints for City decor trees.
 */
export function cityDecorTreeMaterials(): {
  trunk: WorldObjectSurface;
  barkBand: WorldObjectSurface;
  canopy: WorldObjectSurface;
  canopyLit: WorldObjectSurface;
  trunkColor: string;
  barkBandColor: string;
  rootColor: string;
  canopyColor: string;
  canopyLitColor: string;
} {
  return {
    trunk: WORLD_OBJECT_SURFACE.treeTrunk,
    barkBand: WORLD_OBJECT_SURFACE.treeBarkBand,
    canopy: WORLD_OBJECT_SURFACE.treeCanopy,
    canopyLit: WORLD_OBJECT_SURFACE.treeCanopyLit,
    trunkColor: "#4a3a2c",
    barkBandColor: "#3a2e22",
    rootColor: "#2e2418",
    canopyColor: "#2a5a42",
    canopyLitColor: "#3a6e52",
  };
}

/**
 * Soft civic bush foliage materials.
 *
 * @returns Leaf / twig tints + surfaces.
 */
export function cityDecorBushMaterials(): {
  leaf: WorldObjectSurface;
  leafColor: string;
  leafLitColor: string;
  twigColor: string;
} {
  return {
    leaf: WORLD_OBJECT_SURFACE.treeCanopy,
    leafColor: "#2e5a38",
    leafLitColor: "#3a6a44",
    twigColor: "#3a3020",
  };
}

/**
 * Cooler civic fence materials (distinct from homestead warm rails).
 *
 * @returns Post / rail / cap surfaces + tints.
 */
export function cityDecorFenceMaterials(): {
  post: WorldObjectSurface;
  rail: WorldObjectSurface;
  cap: WorldObjectSurface;
  postColor: string;
  railColor: string;
  capColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.fencePost,
    rail: WORLD_OBJECT_SURFACE.fenceRail,
    cap: WORLD_OBJECT_SURFACE.fenceCap,
    postColor: "#4a4238",
    railColor: "#5a5248",
    capColor: "#6a6258",
  };
}

/**
 * City atmosphere tree placements (env-only).
 *
 * @returns Tree rows for CityEnvironment.
 */
export function cityAtmosphereTrees(): ReadonlyArray<CityAtmosphereDecorTree> {
  return CITY_ATMOSPHERE_TREE_PLACEMENTS;
}

/**
 * City atmosphere bush placements (env-only).
 *
 * @returns Bush rows for CityEnvironment.
 */
export function cityAtmosphereBushes(): ReadonlyArray<CityAtmosphereDecorBush> {
  return CITY_ATMOSPHERE_BUSH_PLACEMENTS;
}

/**
 * City atmosphere fence segment placements (env-only).
 *
 * @returns Fence rows for CityEnvironment.
 */
export function cityAtmosphereFences(): ReadonlyArray<CityAtmosphereDecorFence> {
  return CITY_ATMOSPHERE_FENCE_PLACEMENTS;
}

/**
 * City atmosphere extra props (lantern / bench / planter / trough / sign).
 *
 * @returns Extra decor rows for CityEnvironment.
 */
export function cityAtmosphereExtras(): ReadonlyArray<CityAtmosphereDecorExtra> {
  return CITY_ATMOSPHERE_EXTRA_PLACEMENTS;
}

/**
 * Plaza extras must not stack lanterns on columns.
 * Column + murito, and two muritos in an L elbow, are allowed pairs.
 *
 * @param extras - Atmosphere extra rows.
 * @param minDist - Minimum center-to-center gap for unrelated props.
 * @returns True when stacked clutter is gone and eight muritos are present.
 */
export function cityAtmosphereExtrasReadAsUnstacked(
  extras: ReadonlyArray<CityAtmosphereDecorExtra> = CITY_ATMOSPHERE_EXTRA_PLACEMENTS,
  minDist = 1.8,
): boolean {
  if (!(minDist > 0) || extras.length === 0) return false;
  for (let i = 0; i < extras.length; i++) {
    const a = extras[i]!;
    for (let j = i + 1; j < extras.length; j++) {
      const b = extras[j]!;
      const d = Math.hypot(a.x - b.x, a.z - b.z);
      const pair = new Set([a.kind, b.kind]);
      const isCornerWall = pair.has("column") && pair.has("wall");
      const isWallElbow = a.kind === "wall" && b.kind === "wall";
      const floor = isCornerWall || isWallElbow ? 0.7 : minDist;
      if (d < floor) return false;
    }
  }
  return extras.filter((e) => e.kind === "wall").length >= 8;
}

/**
 * City main decorative hall pose (env-only).
 *
 * @returns Hall footprint for CityEnvironment.
 */
export function cityAtmosphereMainHall(): CityAtmosphereDecorHall {
  return CITY_ATMOSPHERE_MAIN_HALL;
}

/** Crop plot visual stage for soil articulation (VA1.3). */
export type CropPlotSoilStage = "empty" | "sprout" | "growing" | "ready";

/**
 * Homestead deciduous corner-tree materials (VA1.3).
 * Atmosphere-only — not gather stumps; layouts unchanged.
 *
 * @returns Trunk / canopy / accent surfaces + tints.
 */
export function homesteadTreeMaterials(): {
  trunk: WorldObjectSurface;
  barkBand: WorldObjectSurface;
  canopy: WorldObjectSurface;
  canopyLit: WorldObjectSurface;
  trunkColor: string;
  barkBandColor: string;
  rootColor: string;
  canopyColor: string;
  canopyLitColor: string;
} {
  return {
    trunk: WORLD_OBJECT_SURFACE.treeTrunk,
    barkBand: WORLD_OBJECT_SURFACE.treeBarkBand,
    canopy: WORLD_OBJECT_SURFACE.treeCanopy,
    canopyLit: WORLD_OBJECT_SURFACE.treeCanopyLit,
    trunkColor: "#5a3d28",
    barkBandColor: "#4a3020",
    rootColor: "#3a2a18",
    canopyColor: "#2f5a2e",
    canopyLitColor: "#3a6b38",
  };
}

/**
 * Explore conifer canopy-tree materials (VA1.3).
 * Cooler than homestead deciduous; section floors unchanged.
 *
 * @returns Trunk / canopy surfaces + tints.
 */
export function forestTreeMaterials(): {
  trunk: WorldObjectSurface;
  barkBand: WorldObjectSurface;
  canopy: WorldObjectSurface;
  canopyAlt: WorldObjectSurface;
  trunkColor: string;
  barkBandColor: string;
  flareColor: string;
  canopyColor: string;
  canopyAltColor: string;
} {
  return {
    trunk: WORLD_OBJECT_SURFACE.forestTrunk,
    barkBand: WORLD_OBJECT_SURFACE.treeBarkBand,
    canopy: WORLD_OBJECT_SURFACE.forestCanopy,
    canopyAlt: WORLD_OBJECT_SURFACE.forestCanopyAlt,
    trunkColor: "#3a2e22",
    barkBandColor: "#2e2418",
    flareColor: "#2a2018",
    canopyColor: "#1e4a28",
    canopyAltColor: "#2a5a32",
  };
}

/**
 * Homestead fence post / rail / cap surfaces (VA1.3).
 * Colors stay on `homesteadYardFloorColors` (empty/lived/visit); PBR only here.
 *
 * @returns Post / rail / cap surfaces + cap tint.
 */
export function homesteadFenceMaterials(): {
  post: WorldObjectSurface;
  rail: WorldObjectSurface;
  cap: WorldObjectSurface;
  capColor: string;
  midRailColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.fencePost,
    rail: WORLD_OBJECT_SURFACE.fenceRail,
    cap: WORLD_OBJECT_SURFACE.fenceCap,
    capColor: "#6a5040",
    midRailColor: "#5a4838",
  };
}

/**
 * Homestead storage-shed kit materials (VA1.3).
 * Chimney / nameplate cues stay on existing shed; kit only.
 *
 * @returns Body / roof / door / sill surfaces + tints.
 */
export function homesteadShedMaterials(): {
  body: WorldObjectSurface;
  roof: WorldObjectSurface;
  door: WorldObjectSurface;
  sill: WorldObjectSurface;
  bodyColor: string;
  plankColor: string;
  roofColor: string;
  doorColor: string;
  sillColor: string;
  eaveColor: string;
} {
  return {
    body: WORLD_OBJECT_SURFACE.shedTimber,
    roof: WORLD_OBJECT_SURFACE.shedRoof,
    door: WORLD_OBJECT_SURFACE.shedDoor,
    sill: WORLD_OBJECT_SURFACE.shedSill,
    bodyColor: "#7a5a3a",
    plankColor: "#6a4a30",
    roofColor: "#5a4030",
    doorColor: "#3a2a1a",
    sillColor: "#4a3424",
    eaveColor: "#4a3224",
  };
}

/**
 * Crop plot bed / furrow / border / clod surfaces by stage (VA1.3).
 * Empty shows furrows+clods; planted moistens; ready dries — cues unchanged.
 *
 * @param stage - empty | sprout | growing | ready.
 * @returns Soil articulation surfaces + tints.
 */
export function cropPlotSoilMaterials(stage: CropPlotSoilStage): {
  bed: WorldObjectSurface;
  furrow: WorldObjectSurface;
  border: WorldObjectSurface;
  clod: WorldObjectSurface;
  furrowColor: string;
  borderColor: string;
  clodColor: string;
  showFurrows: boolean;
  showClods: boolean;
} {
  const border = WORLD_OBJECT_SURFACE.cropBorder;
  const furrow = WORLD_OBJECT_SURFACE.cropFurrow;
  const clod = WORLD_OBJECT_SURFACE.cropClod;
  if (stage === "empty") {
    return {
      bed: WORLD_OBJECT_SURFACE.cropSoil,
      furrow,
      border,
      clod,
      furrowColor: "#3a2818",
      borderColor: "#3d2a1a",
      clodColor: "#4a3424",
      showFurrows: true,
      showClods: true,
    };
  }
  if (stage === "ready") {
    return {
      bed: { roughness: 0.9, metalness: 0.03 },
      furrow,
      border,
      clod,
      furrowColor: "#4a3420",
      borderColor: "#4a3424",
      clodColor: "#5a4430",
      showFurrows: false,
      showClods: false,
    };
  }
  // sprout / growing — moist worked soil
  return {
    bed: WORLD_OBJECT_SURFACE.cropSoilMoist,
    furrow,
    border,
    clod,
    furrowColor: "#2e2014",
    borderColor: "#3a2818",
    clodColor: "#3a2a1c",
    showFurrows: stage === "sprout",
    showClods: false,
  };
}

/**
 * Travel portal kit surfaces (VA2.1).
 * Frame/lintel **colors** stay on `portalMeshTintForLandKind` / MAP_IDENTITY —
 * this SoT only supplies PBR + shared footing/threshold/band articulation tints.
 *
 * @returns Post / lintel / footing / band / threshold / keystone surfaces + accent tints.
 */
export function portalKitMaterials(): {
  post: WorldObjectSurface;
  lintel: WorldObjectSurface;
  footing: WorldObjectSurface;
  band: WorldObjectSurface;
  threshold: WorldObjectSurface;
  keystone: WorldObjectSurface;
  footingColor: string;
  bandColor: string;
  thresholdColor: string;
  keystoneColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.portalStone,
    lintel: WORLD_OBJECT_SURFACE.portalStoneDark,
    footing: WORLD_OBJECT_SURFACE.portalStoneDark,
    band: WORLD_OBJECT_SURFACE.portalBand,
    threshold: WORLD_OBJECT_SURFACE.portalThreshold,
    keystone: WORLD_OBJECT_SURFACE.portalKeystone,
    footingColor: "#2a2824",
    bandColor: "#6a6860",
    thresholdColor: "#3a3834",
    keystoneColor: "#4a4842",
  };
}

/**
 * Vendor stall kit surfaces + counter/awning/goods tints (VA2.2).
 * Commerce pad / lantern cues stay on existing helpers; prices unchanged.
 *
 * @param highlighted - True when interact-highlighted.
 * @returns Timber / counter / awning / goods surfaces + colors.
 */
export function vendorStallKitMaterials(highlighted: boolean): {
  post: WorldObjectSurface;
  counter: WorldObjectSurface;
  awning: WorldObjectSurface;
  stripe: WorldObjectSurface;
  goodsCrate: WorldObjectSurface;
  goodsFresh: WorldObjectSurface;
  postColor: string;
  counterColor: string;
  awningColor: string;
  stripeColor: string;
  goodsCrateColor: string;
  goodsFreshColor: string;
  apronColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.vendorTimber,
    counter: WORLD_OBJECT_SURFACE.vendorCounter,
    awning: WORLD_OBJECT_SURFACE.vendorAwning,
    stripe: WORLD_OBJECT_SURFACE.vendorStripe,
    goodsCrate: WORLD_OBJECT_SURFACE.vendorGoods,
    goodsFresh: WORLD_OBJECT_SURFACE.vendorGoodsFresh,
    postColor: "#5a3a24",
    counterColor: highlighted ? "#d2b080" : "#c4a070",
    awningColor: highlighted ? "#efe4c8" : "#e4d4b0",
    stripeColor: highlighted ? "#b83838" : "#9a3030",
    goodsCrateColor: "#8a6238",
    goodsFreshColor: "#e8c45a",
    apronColor: "#4a301c",
  };
}

/**
 * Market stall cloth — sage canvas + gold stripes (same PBR family as vendor).
 *
 * @param highlighted - True when interact-highlighted.
 * @returns Stall surfaces + sage/gold tints, distinct from vendor cream/burgundy.
 */
export function marketStallKitMaterials(highlighted: boolean): {
  post: WorldObjectSurface;
  counter: WorldObjectSurface;
  awning: WorldObjectSurface;
  stripe: WorldObjectSurface;
  goodsCrate: WorldObjectSurface;
  goodsFresh: WorldObjectSurface;
  postColor: string;
  counterColor: string;
  awningColor: string;
  stripeColor: string;
  goodsCrateColor: string;
  goodsFreshColor: string;
  apronColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.vendorTimber,
    counter: WORLD_OBJECT_SURFACE.vendorCounter,
    awning: WORLD_OBJECT_SURFACE.vendorAwning,
    stripe: WORLD_OBJECT_SURFACE.vendorStripe,
    goodsCrate: WORLD_OBJECT_SURFACE.vendorGoods,
    goodsFresh: WORLD_OBJECT_SURFACE.vendorGoodsFresh,
    postColor: "#5a3a24",
    counterColor: highlighted ? "#d2b080" : "#c4a070",
    awningColor: highlighted ? "#9ec4b4" : "#6e9a88",
    stripeColor: highlighted ? "#e0c878" : "#c4a24a",
    goodsCrateColor: "#8a6238",
    goodsFreshColor: "#d4c090",
    apronColor: "#4a301c",
  };
}

/**
 * REALM market stall cloth — indigo canvas + gold stripes (chain kinship).
 *
 * @param highlighted - True when interact-highlighted.
 * @returns Stall surfaces + indigo/gold tints, distinct from coin-market sage.
 */
export function realmMarketStallKitMaterials(highlighted: boolean): {
  post: WorldObjectSurface;
  counter: WorldObjectSurface;
  awning: WorldObjectSurface;
  stripe: WorldObjectSurface;
  goodsCrate: WorldObjectSurface;
  goodsFresh: WorldObjectSurface;
  postColor: string;
  counterColor: string;
  awningColor: string;
  stripeColor: string;
  goodsCrateColor: string;
  goodsFreshColor: string;
  apronColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.vendorTimber,
    counter: WORLD_OBJECT_SURFACE.vendorCounter,
    awning: WORLD_OBJECT_SURFACE.vendorAwning,
    stripe: WORLD_OBJECT_SURFACE.vendorStripe,
    goodsCrate: WORLD_OBJECT_SURFACE.vendorGoods,
    goodsFresh: WORLD_OBJECT_SURFACE.vendorGoodsFresh,
    postColor: "#5a3a24",
    counterColor: highlighted ? "#d2b080" : "#c4a070",
    awningColor: highlighted ? "#7a8ab8" : "#4a5a88",
    stripeColor: highlighted ? "#e8d078" : "#c4a24a",
    goodsCrateColor: "#8a6238",
    goodsFreshColor: "#d4c090",
    apronColor: "#4a301c",
  };
}

/**
 * Market listing-board kit surfaces (VA2.2).
 * Commerce pad / lantern cues unchanged.
 *
 * @param highlighted - True when interact-highlighted.
 * @returns Post / frame / slate / strip surfaces + colors.
 */
export function marketBoardKitMaterials(highlighted: boolean): {
  post: WorldObjectSurface;
  frame: WorldObjectSurface;
  slate: WorldObjectSurface;
  strip: WorldObjectSurface;
  postColor: string;
  frameColor: string;
  slateColor: string;
  stripColor: string;
  stripAltColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.marketPost,
    frame: WORLD_OBJECT_SURFACE.marketFrame,
    slate: WORLD_OBJECT_SURFACE.marketSlate,
    strip: WORLD_OBJECT_SURFACE.marketStrip,
    postColor: "#4a3520",
    frameColor: highlighted ? "#d4b56a" : "#8a6a3a",
    slateColor: "#2a2418",
    stripColor: "#c4a86a",
    stripAltColor: "#a89058",
  };
}

/**
 * Notice-board plaque kit surfaces (VA2.3).
 * Unread pad / flicker emissives stay on `NOTICE_UNREAD_WORLD_CUE` helpers.
 *
 * @param highlighted - True when interact-highlighted.
 * @returns Timber / plaque / slate / paper / trim surfaces + colors.
 */
export function noticeBoardKitMaterials(highlighted: boolean): {
  post: WorldObjectSurface;
  plaque: WorldObjectSurface;
  slate: WorldObjectSurface;
  paper: WorldObjectSurface;
  trim: WorldObjectSurface;
  footing: WorldObjectSurface;
  postColor: string;
  footingColor: string;
  slateColor: string;
  paperColor: string;
  paperAltColor: string;
  trimColor: string;
  capColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.noticePost,
    plaque: WORLD_OBJECT_SURFACE.noticePlaque,
    slate: WORLD_OBJECT_SURFACE.noticeSlate,
    paper: WORLD_OBJECT_SURFACE.noticePaper,
    trim: WORLD_OBJECT_SURFACE.noticeTrim,
    footing: WORLD_OBJECT_SURFACE.noticeFooting,
    postColor: "#3a2e1c",
    footingColor: highlighted ? "#6a8058" : "#3a4a30",
    slateColor: "#1a2218",
    paperColor: "#e8e0c8",
    paperAltColor: "#d8d0b8",
    trimColor: "#8a8070",
    capColor: "#4a3c28",
  };
}

/**
 * Player-land build-board kit surfaces (VA2.3).
 * Empty-land beacon pad / orb / board emissives stay on existing cue helpers.
 *
 * @param highlighted - True when interact-highlighted.
 * @param beaconMode - Empty-land beacon vs soft built-yard board.
 * @returns Post / board / base / trim surfaces + colors.
 */
export function buildBoardKitMaterials(
  highlighted: boolean,
  beaconMode: "beacon" | "soft",
): {
  post: WorldObjectSurface;
  board: WorldObjectSurface;
  base: WorldObjectSurface;
  trim: WorldObjectSurface;
  cap: WorldObjectSurface;
  postColor: string;
  baseColor: string;
  boardColor: string;
  trimColor: string;
  capColor: string;
  crossbeamColor: string;
} {
  const isBeacon = beaconMode === "beacon";
  return {
    post: WORLD_OBJECT_SURFACE.buildPost,
    board: WORLD_OBJECT_SURFACE.buildBoard,
    base: WORLD_OBJECT_SURFACE.buildBase,
    trim: WORLD_OBJECT_SURFACE.buildTrim,
    cap: WORLD_OBJECT_SURFACE.buildCap,
    postColor: "#4a3520",
    baseColor: highlighted ? "#8a7a55" : isBeacon ? "#6a5a38" : "#5a4a32",
    boardColor: highlighted ? "#c4a86a" : isBeacon ? "#b89248" : "#7a5a30",
    trimColor: "#7a7060",
    capColor: "#5a4a30",
    crossbeamColor: "#3a2e1c",
  };
}

/**
 * Warrior arena plaque kit surfaces (VA2.3).
 * Face / post **colors** stay on `WARRIOR_ARENA_VISUAL`; pulse emissives unchanged.
 * This SoT supplies PBR + metal trim / band articulation tints.
 *
 * @returns Post / plaque / base / trim / band surfaces + accent tints.
 */
export function arenaBoardKitMaterials(): {
  post: WorldObjectSurface;
  plaque: WorldObjectSurface;
  base: WorldObjectSurface;
  trim: WorldObjectSurface;
  band: WorldObjectSurface;
  trimColor: string;
  bandColor: string;
  capColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.arenaPost,
    plaque: WORLD_OBJECT_SURFACE.arenaPlaque,
    base: WORLD_OBJECT_SURFACE.arenaBase,
    trim: WORLD_OBJECT_SURFACE.arenaTrim,
    band: WORLD_OBJECT_SURFACE.arenaBand,
    trimColor: "#6a5850",
    bandColor: "#4a3830",
    capColor: "#3a2a22",
  };
}

/**
 * Tutor NPC kit surfaces (VA2.4).
 * Profession cloak **colors** stay on `tutorialNpcCloakColor`; claim pad cues unchanged.
 *
 * @returns Skin / cloak / boots surfaces + boot tint.
 */
export function tutorNpcKitMaterials(): {
  skin: WorldObjectSurface;
  cloak: WorldObjectSurface;
  boots: WorldObjectSurface;
  bootsColor: string;
  headColor: string;
} {
  return {
    skin: WORLD_OBJECT_SURFACE.tutorSkin,
    cloak: WORLD_OBJECT_SURFACE.tutorCloak,
    boots: WORLD_OBJECT_SURFACE.tutorBoots,
    bootsColor: "#3a2a1c",
    headColor: "#e0c4a8",
  };
}

/**
 * Housing decor pad kit surfaces (VA2.4).
 * Walk-up tip emissive stays on existing cue helpers.
 *
 * @param highlighted - True when interact-highlighted.
 * @returns Stone pad / lip surfaces + colors.
 */
export function housingDecorPadKitMaterials(highlighted: boolean): {
  pad: WorldObjectSurface;
  lip: WorldObjectSurface;
  padColor: string;
  lipColor: string;
} {
  return {
    pad: WORLD_OBJECT_SURFACE.decorPadStone,
    lip: WORLD_OBJECT_SURFACE.decorPadLip,
    padColor: highlighted ? "#c4b07a" : "#6a5a40",
    lipColor: highlighted ? "#a89868" : "#4a3e2c",
  };
}

/**
 * Housing planter kit surfaces (VA2.4).
 *
 * @param highlighted - True when interact-highlighted.
 * @returns Pot / soil / foliage / bloom surfaces + colors.
 */
export function housingDecorPlanterKitMaterials(highlighted: boolean): {
  pot: WorldObjectSurface;
  soil: WorldObjectSurface;
  foliage: WorldObjectSurface;
  bloom: WorldObjectSurface;
  potColor: string;
  soilColor: string;
  foliageColor: string;
  bloomColor: string;
  rimColor: string;
} {
  return {
    pot: WORLD_OBJECT_SURFACE.decorPlanterPot,
    soil: WORLD_OBJECT_SURFACE.decorPlanterSoil,
    foliage: WORLD_OBJECT_SURFACE.decorPlanterFoliage,
    bloom: WORLD_OBJECT_SURFACE.decorPlanterBloom,
    potColor: highlighted ? "#a07050" : "#7a4e38",
    soilColor: "#3a2a18",
    foliageColor: "#3d8a4a",
    bloomColor: "#d45a7a",
    rimColor: "#5a3a28",
  };
}

/**
 * Housing banner kit surfaces (VA2.4).
 *
 * @param highlighted - True when interact-highlighted.
 * @returns Pole / cloth / finial surfaces + colors.
 */
export function housingDecorBannerKitMaterials(highlighted: boolean): {
  pole: WorldObjectSurface;
  cloth: WorldObjectSurface;
  finial: WorldObjectSurface;
  poleColor: string;
  clothColor: string;
  finialColor: string;
} {
  return {
    pole: WORLD_OBJECT_SURFACE.decorBannerPole,
    cloth: WORLD_OBJECT_SURFACE.decorBannerCloth,
    finial: WORLD_OBJECT_SURFACE.decorBannerFinial,
    poleColor: "#5c4330",
    clothColor: highlighted ? "#d4a04a" : "#b07830",
    finialColor: "#8a8070",
  };
}

/**
 * Hunt trail / edge thicket kit surfaces (VA2.5).
 * Path / creature **colors** stay on `huntTrailWayfindingVisual`; ready cues unchanged.
 *
 * @param kind - `trail` (Animal Hunter) or `thicket` (Monster Hunter).
 * @returns Path / brush / hide / horn surfaces + articulation tints.
 */
export function huntTrailKitMaterials(kind: "trail" | "thicket"): {
  path: WorldObjectSurface;
  pathCurb: WorldObjectSurface;
  brush: WorldObjectSurface;
  brushTrunk: WorldObjectSurface;
  hide: WorldObjectSurface;
  horn: WorldObjectSurface;
  underbrush: WorldObjectSurface;
  brushColor: string;
  brushAltColor: string;
  brushTrunkColor: string;
  curbColor: string;
  underbrushColor: string;
  hornColor: string;
} {
  if (kind === "thicket") {
    return {
      path: WORLD_OBJECT_SURFACE.huntPath,
      pathCurb: WORLD_OBJECT_SURFACE.huntPathCurb,
      brush: WORLD_OBJECT_SURFACE.huntBrush,
      brushTrunk: WORLD_OBJECT_SURFACE.huntBrushTrunk,
      hide: WORLD_OBJECT_SURFACE.huntCreatureHide,
      horn: WORLD_OBJECT_SURFACE.huntCreatureHorn,
      underbrush: WORLD_OBJECT_SURFACE.huntUnderbrush,
      brushColor: "#3a5028",
      brushAltColor: "#4a6030",
      brushTrunkColor: "#2a2014",
      curbColor: "#2a2830",
      underbrushColor: "#2e3a22",
      hornColor: "#2a1a12",
    };
  }
  return {
    path: WORLD_OBJECT_SURFACE.huntPath,
    pathCurb: WORLD_OBJECT_SURFACE.huntPathCurb,
    brush: WORLD_OBJECT_SURFACE.huntBrush,
    brushTrunk: WORLD_OBJECT_SURFACE.huntBrushTrunk,
    hide: WORLD_OBJECT_SURFACE.huntCreatureHide,
    horn: WORLD_OBJECT_SURFACE.huntCreatureHorn,
    underbrush: WORLD_OBJECT_SURFACE.huntUnderbrush,
    brushColor: "#4a6038",
    brushAltColor: "#5a7040",
    brushTrunkColor: "#3a2c18",
    curbColor: "#4a3e28",
    underbrushColor: "#3a4a28",
    hornColor: "#c4a070",
  };
}

/**
 * City plaza fountain kit surfaces (VA2.6).
 * Stone / water tints live here so the mesh can stay matte stone + readable water
 * without the PL125.1 cyan emissive pulse on the basin.
 *
 * @returns Basin / spout / water / lip / footing surfaces + accent tints.
 */
export function plazaFountainKitMaterials(): {
  basin: WorldObjectSurface;
  spout: WorldObjectSurface;
  water: WorldObjectSurface;
  lip: WorldObjectSurface;
  footing: WorldObjectSurface;
  basinColor: string;
  spoutColor: string;
  waterColor: string;
  waterEmissive: string;
  lipColor: string;
  footingColor: string;
} {
  return {
    basin: WORLD_OBJECT_SURFACE.fountainBasin,
    spout: WORLD_OBJECT_SURFACE.fountainSpout,
    water: WORLD_OBJECT_SURFACE.fountainWater,
    lip: WORLD_OBJECT_SURFACE.fountainLip,
    footing: WORLD_OBJECT_SURFACE.fountainFooting,
    basinColor: "#9a9286",
    spoutColor: "#8a8680",
    waterColor: "#3a8aaa",
    waterEmissive: "#5ab0c8",
    lipColor: "#a8a094",
    footingColor: "#6a6458",
  };
}

/** Hollow two-tier plaza fountain proportions (visual only; walk solid unchanged). */
export const PLAZA_FOUNTAIN_VISUAL = {
  outerRadius: 1.08,
  innerRadius: 0.82,
  wallHeight: 0.5,
  wallY: 0.27,
  basinFloorY: 0.06,
  waterY: 0.36,
  rimY: 0.52,
  footingRadius: 1.28,
  pedestalRadius: 0.16,
  pedestalHeight: 0.58,
  pedestalY: 0.5,
  upperBowlOuter: 0.28,
  upperBowlInner: 0.18,
  upperBowlY: 0.82,
  upperWaterY: 0.86,
  nozzleRadius: 0.045,
  nozzleHeight: 0.1,
  jetHeight: 0.28,
  streamCount: 8,
  stoneEmissiveIntensity: 0,
  waterEmissiveIntensity: 0.05,
  ripplePeriodMs: 3800,
  rippleRingCount: 7,
} as const;

export interface PlazaFountainVisualLayout {
  outerRadius: number;
  innerRadius: number;
  wallHeight: number;
  wallY: number;
  basinFloorY: number;
  waterY: number;
  rimY: number;
  footingRadius: number;
  pedestalRadius: number;
  pedestalHeight: number;
  pedestalY: number;
  upperBowlOuter: number;
  upperBowlInner: number;
  upperBowlY: number;
  upperWaterY: number;
  nozzleRadius: number;
  nozzleHeight: number;
  jetHeight: number;
  streamCount: number;
  stoneEmissiveIntensity: number;
  waterEmissiveIntensity: number;
  ripplePeriodMs: number;
  rippleRingCount: number;
}

/**
 * Plaza fountain visual layout SoT — hollow basin, water below the rim, no stone glow.
 *
 * @returns Frozen two-tier fountain proportions.
 */
export function plazaFountainVisualLayout(): PlazaFountainVisualLayout {
  return PLAZA_FOUNTAIN_VISUAL;
}

/**
 * True when the layout reads as a pool inside a stone rim (not a solid drum).
 *
 * @param layout - Fountain proportions; defaults to SoT.
 * @returns True when inner radius and water sit inside the outer rim.
 */
export function plazaFountainReadsAsBasin(
  layout: PlazaFountainVisualLayout = plazaFountainVisualLayout(),
): boolean {
  return (
    layout.innerRadius < layout.outerRadius &&
    layout.waterY < layout.rimY &&
    layout.waterY > layout.basinFloorY &&
    layout.stoneEmissiveIntensity === 0
  );
}

/**
 * Stream yaw angles around the upper bowl.
 *
 * @param count - How many falls; non-finite / negative → none.
 * @returns Radians in [0, 2π).
 */
export function plazaFountainStreamAngles(count: number): number[] {
  if (!Number.isFinite(count) || count <= 0) return [];
  const n = Math.floor(count);
  return Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2);
}

/**
 * Expanding-ring phase for the plaza pool (not a UV offset).
 * UV offset slides rings sideways; this value only grows radius from center.
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @param periodMs - Loop length; non-positive → 0.
 * @returns Phase in [0, 1).
 */
export function plazaFountainRipplePhase(
  nowMs: number,
  periodMs: number = PLAZA_FOUNTAIN_VISUAL.ripplePeriodMs,
): number {
  if (!(periodMs > 0) || !Number.isFinite(nowMs)) return 0;
  const t = nowMs / periodMs;
  return t - Math.floor(t);
}

/**
 * Ring radii in 0..1 measured from the pool center.
 * Phase increases radius; it never translates X/Y.
 *
 * @param phase - 0..1 from `plazaFountainRipplePhase`.
 * @param ringCount - How many rings; non-finite / ≤0 → none.
 * @returns Radius factors in [0, 1).
 */
export function plazaFountainRippleRadii(
  phase: number,
  ringCount: number = PLAZA_FOUNTAIN_VISUAL.rippleRingCount,
): number[] {
  if (!Number.isFinite(phase) || !Number.isFinite(ringCount) || ringCount <= 0)
    return [];
  const p = phase - Math.floor(phase);
  const n = Math.floor(ringCount);
  return Array.from({ length: n }, (_, i) => {
    const u = i / n + p;
    return u - Math.floor(u);
  });
}

/**
 * Warrior arena prop kit surfaces (VA2.6).
 * Floor / ring / haze **colors** stay on `WARRIOR_ARENA_VISUAL`; exit chrome unchanged.
 *
 * @returns Post / rope / bench / banner surfaces + prop tints.
 */
export function warriorArenaPropKitMaterials(): {
  post: WorldObjectSurface;
  postCap: WorldObjectSurface;
  rope: WorldObjectSurface;
  bench: WorldObjectSurface;
  bannerPole: WorldObjectSurface;
  bannerCloth: WorldObjectSurface;
  postColor: string;
  postCapColor: string;
  ropeColor: string;
  benchColor: string;
  benchAltColor: string;
  bannerPoleColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.arenaPropPost,
    postCap: WORLD_OBJECT_SURFACE.arenaPropPostCap,
    rope: WORLD_OBJECT_SURFACE.arenaPropRope,
    bench: WORLD_OBJECT_SURFACE.arenaPropBench,
    bannerPole: WORLD_OBJECT_SURFACE.arenaPropBannerPole,
    bannerCloth: WORLD_OBJECT_SURFACE.arenaPropBannerCloth,
    postColor: "#5a4030",
    postCapColor: "#6a5040",
    ropeColor: "#8a6a40",
    benchColor: "#4a3a2a",
    benchAltColor: "#453628",
    bannerPoleColor: "#3a2a1a",
  };
}

/**
 * Expand pad kit surfaces (VA3.1).
 * Pad **colors** + short-afford pulse stay on `EXPAND_PAD_AFFORD_CUE` / pulse helpers.
 *
 * @returns Pad / lip / post / cap surfaces + post tints.
 */
export function expandPadKitMaterials(): {
  pad: WorldObjectSurface;
  lip: WorldObjectSurface;
  post: WorldObjectSurface;
  postCap: WorldObjectSurface;
  postColor: string;
  postCapColor: string;
  lipColor: string;
} {
  return {
    pad: WORLD_OBJECT_SURFACE.expandPadStone,
    lip: WORLD_OBJECT_SURFACE.expandPadLip,
    post: WORLD_OBJECT_SURFACE.expandPost,
    postCap: WORLD_OBJECT_SURFACE.expandPostCap,
    postColor: "#5c4330",
    postCapColor: "#6a5040",
    lipColor: "#4a3e2c",
  };
}

/**
 * Claim node beacon kit surfaces (VA3.2).
 * Banner **ownership colors** + walk-up tip + held soft cue (PL145.1) + contest soft cue (PL146.1) stay in `ClaimNodeBuilding` / `CLAIM_NODE_HELD_SOFT_CUE` / `CLAIM_NODE_CONTEST_SOFT_CUE`.
 *
 * @returns Post / footing / banner / finial surfaces + accent tints.
 */
export function claimNodeKitMaterials(): {
  post: WorldObjectSurface;
  footing: WorldObjectSurface;
  banner: WorldObjectSurface;
  finial: WorldObjectSurface;
  postColor: string;
  postLitColor: string;
  footingColor: string;
  finialColor: string;
} {
  return {
    post: WORLD_OBJECT_SURFACE.claimPost,
    footing: WORLD_OBJECT_SURFACE.claimFooting,
    banner: WORLD_OBJECT_SURFACE.claimBanner,
    finial: WORLD_OBJECT_SURFACE.claimFinial,
    postColor: "#5a4a3a",
    postLitColor: "#8a7a5a",
    footingColor: "#3a3228",
    finialColor: "#8a7a4a",
  };
}

/**
 * Avatar farmer kit surfaces (VA3.3).
 * Palette + PL122.1 vest/hatBand tint stay on `resolveAvatarKitColors`.
 *
 * @returns Cloth / skin / boots / hat / tool surfaces + articulation tints.
 */
export function avatarFarmerKitMaterials(): {
  cloth: WorldObjectSurface;
  pants: WorldObjectSurface;
  vest: WorldObjectSurface;
  skin: WorldObjectSurface;
  boots: WorldObjectSurface;
  bootCuff: WorldObjectSurface;
  hat: WorldObjectSurface;
  hatBand: WorldObjectSurface;
  belt: WorldObjectSurface;
  toolShaft: WorldObjectSurface;
  toolFerrule: WorldObjectSurface;
  toolHead: WorldObjectSurface;
  bootCuffColor: string;
  beltColor: string;
  toolFerruleColor: string;
} {
  return {
    cloth: WORLD_OBJECT_SURFACE.avatarCloth,
    pants: WORLD_OBJECT_SURFACE.avatarPants,
    vest: WORLD_OBJECT_SURFACE.avatarVest,
    skin: WORLD_OBJECT_SURFACE.avatarSkin,
    boots: WORLD_OBJECT_SURFACE.avatarBoots,
    bootCuff: WORLD_OBJECT_SURFACE.avatarBootCuff,
    hat: WORLD_OBJECT_SURFACE.avatarHat,
    hatBand: WORLD_OBJECT_SURFACE.avatarHatBand,
    belt: WORLD_OBJECT_SURFACE.avatarBelt,
    toolShaft: WORLD_OBJECT_SURFACE.avatarToolShaft,
    toolFerrule: WORLD_OBJECT_SURFACE.avatarToolFerrule,
    toolHead: WORLD_OBJECT_SURFACE.avatarToolHead,
    bootCuffColor: "#4a3824",
    beltColor: "#3a2a18",
    toolFerruleColor: "#7a8088",
  };
}

/**
 * Civic block silhouette kit surfaces (VA3.4).
 * Cool pad tint stays on `CITY_HUB_VISUAL.civicPadColor`; wall body color stays on caller.
 *
 * @returns Pad / wall / roof / door / window / sill / trim surfaces + accent tints.
 */
export function civicBlockKitMaterials(): {
  pad: WorldObjectSurface;
  wall: WorldObjectSurface;
  roof: WorldObjectSurface;
  door: WorldObjectSurface;
  window: WorldObjectSurface;
  sill: WorldObjectSurface;
  trim: WorldObjectSurface;
  roofColor: string;
  doorColor: string;
  windowColor: string;
  windowEmissive: string;
  windowEmissiveIntensity: number;
  sillColor: string;
  trimColor: string;
} {
  return {
    pad: WORLD_OBJECT_SURFACE.civicPad,
    wall: WORLD_OBJECT_SURFACE.civicWall,
    roof: WORLD_OBJECT_SURFACE.civicRoof,
    door: WORLD_OBJECT_SURFACE.civicDoor,
    window: WORLD_OBJECT_SURFACE.civicWindow,
    sill: WORLD_OBJECT_SURFACE.civicSill,
    trim: WORLD_OBJECT_SURFACE.civicTrim,
    roofColor: "#4a4540",
    doorColor: "#3a3028",
    windowColor: "#a8c4d8",
    windowEmissive: "#304050",
    windowEmissiveIntensity: 0.25,
    sillColor: "#5a5550",
    trimColor: "#5a5248",
  };
}

/**
 * City hub floor kit surfaces (VA4.1).
 * Streets / plaza / scarce / inlay / road **colors** stay on `cityHubFloorColors` /
 * `CITY_HUB_VISUAL` — PBR + curb accent only here.
 *
 * @returns Floor layer surfaces + curb accent tint.
 */
export function cityHubFloorKitMaterials(): {
  streets: WorldObjectSurface;
  plaza: WorldObjectSurface;
  scarceYard: WorldObjectSurface;
  inlay: WorldObjectSurface;
  road: WorldObjectSurface;
  curb: WorldObjectSurface;
  curbColor: string;
  scarceCurbColor: string;
} {
  return {
    streets: WORLD_OBJECT_SURFACE.floorStreets,
    plaza: WORLD_OBJECT_SURFACE.floorPlaza,
    scarceYard: WORLD_OBJECT_SURFACE.floorScarceYard,
    inlay: WORLD_OBJECT_SURFACE.floorInlay,
    road: WORLD_OBJECT_SURFACE.floorRoad,
    curb: WORLD_OBJECT_SURFACE.floorCurb,
    curbColor: "#687078",
    scarceCurbColor: "#8a6a48",
  };
}

export {
  cityCivicDirtPatchClearsPlaza,
  cityCivicGrassReadsAsLawn,
  cityCivicGrassSurface,
  cityPlazaDirtSpurInner,
  cityPlazaDirtSpurOuter,
  cityPlazaDirtSpurSurface,
  cityPlazaDirtSpursReadAsTrails,
  cityPlazaFloorSurface,
  cityPlazaPathSurface,
  cityPlazaQuadrantSlabs,
  cityPlazaReadsAsZoned,
  cityPlazaSeamInset,
  cityPlazaWearPadClearsWalks,
} from "./city-plaza-floor.js";
export type {
  CityCivicGrassSurface,
  CityPlazaDirtSpur,
  CityPlazaDirtSpurSurface,
  CityPlazaFloorKind,
  CityPlazaFloorSurface,
  CityPlazaSlab,
  CityPlazaWearPad,
} from "./city-plaza-floor.js";

/**
 * Homestead yard floor kit surfaces (VA4.2).
 * Meadow / plot / pad / path **colors** stay on `homesteadYardFloorColors`
 * (empty/lived/visit); PL142.1 path emissive stays on catalog cue — PBR + lip only.
 *
 * @returns Yard floor surfaces + path-lip accent tint.
 */
export function homesteadYardFloorKitMaterials(): {
  meadow: WorldObjectSurface;
  plot: WorldObjectSurface;
  pad: WorldObjectSurface;
  path: WorldObjectSurface;
  pathLip: WorldObjectSurface;
  pathLipColor: string;
} {
  return {
    meadow: WORLD_OBJECT_SURFACE.floorMeadow,
    plot: WORLD_OBJECT_SURFACE.floorPlot,
    pad: WORLD_OBJECT_SURFACE.floorYardPad,
    path: WORLD_OBJECT_SURFACE.floorDirtPath,
    pathLip: WORLD_OBJECT_SURFACE.floorPathLip,
    pathLipColor: "#5a4838",
  };
}

/**
 * Explore wilds floor kit surfaces (VA4.3).
 * Outer canopy / section / path **colors** stay on `exploreWildsFloorColors` /
 * `EXPLORE_SECTIONS`; woodland+mines landmark emissive+haze stay on catalog cues —
 * PBR + path-lip accents only here.
 *
 * @returns Wilds floor surfaces + path-lip accent tints.
 */
export function exploreWildsFloorKitMaterials(): {
  canopy: WorldObjectSurface;
  woodland: WorldObjectSurface;
  mines: WorldObjectSurface;
  hunt: WorldObjectSurface;
  entryPath: WorldObjectSurface;
  huntPath: WorldObjectSurface;
  pathLip: WorldObjectSurface;
  pathLipColor: string;
  huntPathLipColor: string;
} {
  return {
    canopy: WORLD_OBJECT_SURFACE.floorCanopy,
    woodland: WORLD_OBJECT_SURFACE.floorWoodland,
    mines: WORLD_OBJECT_SURFACE.floorMines,
    hunt: WORLD_OBJECT_SURFACE.floorHunt,
    entryPath: WORLD_OBJECT_SURFACE.floorWildsPath,
    huntPath: WORLD_OBJECT_SURFACE.floorHuntPath,
    pathLip: WORLD_OBJECT_SURFACE.floorWildsPathLip,
    pathLipColor: "#2a3228",
    huntPathLipColor: "#6a5230",
  };
}

/**
 * Section floor surface from the Explore wilds kit (VA4.3).
 *
 * @param sectionId - Explore section id (`woodland` / `mines` / `hunt`).
 * @returns Matching floor surface; canopy fallback for unknown ids.
 */
export function exploreSectionFloorKitSurface(
  sectionId: string,
): WorldObjectSurface {
  const kit = exploreWildsFloorKitMaterials();
  if (sectionId === "woodland") return kit.woodland;
  if (sectionId === "mines") return kit.mines;
  if (sectionId === "hunt") return kit.hunt;
  return kit.canopy;
}

/**
 * Warrior arena floor kit surfaces (VA4.4).
 * Grounds / ring / chalk / path **colors** stay on `WARRIOR_ARENA_VISUAL` —
 * PBR + ring-lip accent only here.
 *
 * @returns Arena floor surfaces + ring-lip accent tint.
 */
export function warriorArenaFloorKitMaterials(): {
  grounds: WorldObjectSurface;
  ring: WorldObjectSurface;
  ringBorder: WorldObjectSurface;
  chalk: WorldObjectSurface;
  path: WorldObjectSurface;
  ringLip: WorldObjectSurface;
  ringLipColor: string;
} {
  return {
    grounds: WORLD_OBJECT_SURFACE.floorArenaGrounds,
    ring: WORLD_OBJECT_SURFACE.floorArenaRing,
    ringBorder: WORLD_OBJECT_SURFACE.floorArenaRingBorder,
    chalk: WORLD_OBJECT_SURFACE.floorArenaChalk,
    path: WORLD_OBJECT_SURFACE.floorArenaPath,
    ringLip: WORLD_OBJECT_SURFACE.floorArenaRingLip,
    ringLipColor: "#6a4028",
  };
}

/**
 * Interact select HighlightRing visual SoT (VA4.4).
 * Shared by BuildingMesh + ResourceMeshes — gold cue color/opacity/geometry only.
 *
 * @returns Ring mesh params for meshBasicMaterial select feedback.
 */
export function interactHighlightRingMaterials(): {
  color: string;
  opacity: number;
  innerRadius: number;
  outerRadius: number;
  segments: number;
  y: number;
} {
  return {
    color: "#e6c96a",
    opacity: 0.85,
    innerRadius: 1.05,
    outerRadius: 1.28,
    segments: 32,
    y: 0.04,
  };
}

/**
 * Remote presence ring kit surfaces (VA5.1).
 * Halo / ping **colors**, geometry, opacity, and emissive stay on
 * `PRESENCE_PEER_SILHOUETTE` / `NEARBY_PEER_PING` (+ PL134.2 exit fade) —
 * PBR + quiet lip accent only here.
 *
 * @returns Halo / ping / lip surfaces + lip accent tint.
 */
export function remotePresenceKitMaterials(): {
  halo: WorldObjectSurface;
  ping: WorldObjectSurface;
  lip: WorldObjectSurface;
  lipColor: string;
} {
  return {
    halo: WORLD_OBJECT_SURFACE.peerHalo,
    ping: WORLD_OBJECT_SURFACE.peerPing,
    lip: WORLD_OBJECT_SURFACE.peerRingLip,
    lipColor: "#3a5860",
  };
}

/**
 * Avatar ground shadow disc surfaces (VA5.2).
 * Soft underfoot disc shared by local + remote `AvatarKit` — not presence cues.
 *
 * @returns Shadow surface + disc color / opacity / radius.
 */
export function avatarGroundShadowMaterials(): {
  shadow: WorldObjectSurface;
  color: string;
  opacity: number;
  radius: number;
  segments: number;
  y: number;
} {
  return {
    shadow: WORLD_OBJECT_SURFACE.avatarShadow,
    color: "#1a2118",
    opacity: 0.28,
    radius: 0.5,
    segments: 16,
    y: 0.02,
  };
}

/**
 * Crop growth progress bar surfaces (VA5.3).
 * Fill / frame **geometry scale** matches prior CropFieldMesh bar; growMs,
 * ready pulse (PL12.1), growing sway (PL121.1), and timer badge stay intact.
 *
 * @returns Fill / frame surfaces + pale fill tint + quiet frame lip tint + layout.
 */
export function cropGrowthProgressBarMaterials(): {
  fill: WorldObjectSurface;
  frame: WorldObjectSurface;
  fillColor: string;
  frameColor: string;
  maxWidth: number;
  height: number;
  depth: number;
  y: number;
  /** Extra half-extent on frame vs fill max so the track reads as a lip. */
  frameLip: number;
} {
  return {
    fill: WORLD_OBJECT_SURFACE.cropProgressFill,
    frame: WORLD_OBJECT_SURFACE.cropProgressFrame,
    fillColor: "#e8f0e2",
    frameColor: "#6a7860",
    maxWidth: 1.4,
    height: 0.08,
    depth: 0.08,
    y: 0.35,
    frameLip: 0.03,
  };
}

/**
 * Cue-pad flash disc surfaces (VA5.4).
 * Pad **RGB**, opacity peaks, radii, and envelope helpers stay on
 * `GATHER_SUCCESS_PAD_FLASH` / `FISH_CATCH_SPLASH_FLASH` / expand / build /
 * craft / upgrade catalogs — PBR only here. Water disc is slightly smoother
 * for the dock splash; land pads share one matte disc.
 *
 * @returns Land disc + water disc surfaces.
 */
export function cuePadFlashMaterials(): {
  disc: WorldObjectSurface;
  waterDisc: WorldObjectSurface;
} {
  return {
    disc: WORLD_OBJECT_SURFACE.cuePadFlash,
    waterDisc: WORLD_OBJECT_SURFACE.cuePadFlashWater,
  };
}

/**
 * True when two surfaces differ enough to read apart (test helper).
 *
 * @param a - First surface.
 * @param b - Second surface.
 */
export function worldObjectSurfacesDiffer(
  a: WorldObjectSurface,
  b: WorldObjectSurface,
): boolean {
  return a.roughness !== b.roughness || a.metalness !== b.metalness;
}
