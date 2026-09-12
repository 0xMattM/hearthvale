/**
 * Readable visual states for crop / ore / trail kits (F14.3).
 */

import {
  GATHER_NODE_DEPLETED_CUE,
  gatherOreSurfaceMaterials,
  huntTrailWayfindingVisual,
  type WorldObjectSurface,
} from "@game/shared";

export type CropVisualState = "empty" | "sprout" | "growing" | "ready";
export type NodeVisualState = "ready" | "cooling";

export interface CropVisual {
  state: CropVisualState;
  /** 0–1 growth progress while planted. */
  progress: number;
  soilColor: string;
  stemColor: string;
  headColor: string | null;
  stemHeight: number;
  showReadyBadge: boolean;
  showProgressBar: boolean;
}

export interface OreVisual {
  state: NodeVisualState;
  rockColor: string;
  veinColor: string;
  veinEmissive: string;
  veinIntensity: number;
  showReadyBadge: boolean;
  /** VA1.1 — rock / vein PBR surfaces + rubble tints. */
  rockSurface: WorldObjectSurface;
  veinSurface: WorldObjectSurface;
  rubbleColor: string;
  understoneColor: string;
}

export interface TrailVisual {
  state: NodeVisualState;
  pathColor: string;
  creatureColor: string;
  creatureScale: number;
  showReadyBadge: boolean;
  showTracks: boolean;
  /** PL116.1 — quiet Animal vs Monster wayfinding pad. */
  showWayfindingPad: boolean;
  padColor: string;
  padOpacity: number;
  padEmissive: string;
  padEmissiveIntensity: number;
}

const CROP_GROW_MS = 3 * 60 * 1000;

const CROP_PALETTE: Record<
  string,
  { stem: string; head: string; readyStem: string; readyHead: string }
> = {
  wheat: {
    stem: "#6faf55",
    head: "#b8c85a",
    readyStem: "#c4a030",
    readyHead: "#f0d45a",
  },
  corn: {
    stem: "#5a9a38",
    head: "#d4b028",
    readyStem: "#6a8a28",
    readyHead: "#f0c020",
  },
  potato: {
    stem: "#6a8a48",
    head: "#c4a070",
    readyStem: "#8a7a48",
    readyHead: "#c09058",
  },
  cotton: {
    stem: "#5a8a50",
    head: "#d8d0c4",
    readyStem: "#6a9a58",
    readyHead: "#f4eee4",
  },
  herb: {
    stem: "#4a8a58",
    head: "#68b868",
    readyStem: "#3a7a4a",
    readyHead: "#90d878",
  },
};

const ORE_VEIN_PALETTE: Record<
  string,
  { vein: string; emissive: string }
> = {
  iron: { vein: "#b8d0e8", emissive: "#6a9acc" },
  copper: { vein: "#d08048", emissive: "#e07030" },
  gold: { vein: "#e8c050", emissive: "#f0d060" },
};

/**
 * Maps crop plot timing into distinct visual stages.
 *
 * @param cropState - Empty / planted / ready from the client clock.
 * @param readyAt - Harvest-ready timestamp, or null.
 * @param nowMs - Current game clock ms.
 * @param highlighted - Nearby highlight tint.
 * @param plantedAt - Plant timestamp; when set, progress uses real grow window.
 * @param cropId - Catalog crop id for harvest-head color (wheat default).
 * @returns Soil / stem / head paint for the plot mesh.
 */
export function cropVisual(
  cropState: "empty" | "planted" | "ready" | null,
  readyAt: number | null,
  nowMs: number,
  highlighted: boolean,
  plantedAt?: number | null,
  cropId?: string | null,
): CropVisual {
  const palette = CROP_PALETTE[cropId ?? "wheat"] ?? CROP_PALETTE.wheat!;
  if (cropState === "empty" || cropState == null) {
    return {
      state: "empty",
      progress: 0,
      soilColor: highlighted ? "#8a6a3a" : "#5c4228",
      stemColor: palette.stem,
      headColor: null,
      stemHeight: 0,
      showReadyBadge: false,
      showProgressBar: false,
    };
  }
  if (cropState === "ready" || (readyAt != null && nowMs >= readyAt)) {
    return {
      state: "ready",
      progress: 1,
      soilColor: highlighted ? "#9a7a3a" : "#6a5230",
      stemColor: palette.readyStem,
      headColor: palette.readyHead,
      stemHeight: 0.9,
      showReadyBadge: true,
      showProgressBar: false,
    };
  }
  const growMs =
    plantedAt != null && readyAt != null && readyAt > plantedAt
      ? readyAt - plantedAt
      : CROP_GROW_MS;
  const remain = readyAt != null ? Math.max(0, readyAt - nowMs) : growMs;
  const progress = 1 - remain / growMs;
  const sprout = progress < 0.35;
  return {
    state: sprout ? "sprout" : "growing",
    progress,
    soilColor: highlighted ? "#7a5a32" : "#4a3820",
    stemColor: sprout ? palette.stem : palette.stem,
    headColor: progress > 0.7 ? palette.head : null,
    stemHeight: 0.18 + progress * 0.65,
    showReadyBadge: false,
    showProgressBar: true,
  };
}

/**
 * Ore rock ready vs cooldown look (PL12.2 depleted rock SoT).
 *
 * @param ready - True when the node can be chipped.
 * @param highlighted - Nearby highlight tint.
 * @param oreKind - Iron / copper / gold vein tint (null = iron).
 * @returns Rock / vein paint for the ore mesh.
 */
export function oreVisual(
  ready: boolean,
  highlighted: boolean,
  oreKind?: string | null,
): OreVisual {
  const surface = gatherOreSurfaceMaterials(ready);
  const veins = ORE_VEIN_PALETTE[oreKind ?? "iron"] ?? ORE_VEIN_PALETTE.iron!;
  if (ready) {
    return {
      state: "ready",
      rockColor: highlighted
        ? "#9aa2aa"
        : GATHER_NODE_DEPLETED_CUE.oreReadyRock,
      veinColor: veins.vein,
      veinEmissive: veins.emissive,
      veinIntensity: highlighted ? 0.85 : 0.45,
      showReadyBadge: true,
      rockSurface: surface.rock,
      veinSurface: surface.vein,
      rubbleColor: surface.rubbleColor,
      understoneColor: surface.understoneColor,
    };
  }
  return {
    state: "cooling",
    rockColor: highlighted
      ? "#4a5058"
      : GATHER_NODE_DEPLETED_CUE.oreDepletedRock,
    veinColor: "#4a5058",
    veinEmissive: "#000000",
    veinIntensity: 0,
    showReadyBadge: false,
    rockSurface: surface.rock,
    veinSurface: surface.vein,
    rubbleColor: surface.rubbleColor,
    understoneColor: surface.understoneColor,
  };
}

/**
 * Game trail / edge thicket ready vs scattered wildlife (PL116.1 wayfinding SoT).
 */
export function trailVisual(
  ready: boolean,
  highlighted: boolean,
  kind: "trail" | "thicket" = "trail",
): TrailVisual {
  const way = huntTrailWayfindingVisual(kind, ready, highlighted);
  if (ready) {
    return {
      state: "ready",
      pathColor: way.pathColor,
      creatureColor: way.creatureColor,
      creatureScale: 1.15,
      showReadyBadge: true,
      showTracks: true,
      showWayfindingPad: way.showWayfindingPad,
      padColor: way.padColor,
      padOpacity: way.padOpacity,
      padEmissive: way.padEmissive,
      padEmissiveIntensity: way.padEmissiveIntensity,
    };
  }
  return {
    state: "cooling",
    pathColor: way.pathColor,
    creatureColor: way.creatureColor,
    creatureScale: 0.7,
    showReadyBadge: false,
    showTracks: false,
    showWayfindingPad: way.showWayfindingPad,
    padColor: way.padColor,
    padOpacity: way.padOpacity,
    padEmissive: way.padEmissive,
    padEmissiveIntensity: way.padEmissiveIntensity,
  };
}

/**
 * Shared HUD chip styles for READY / timer labels above nodes.
 */
export function resourceBadgeStyle(kind: "ready" | "timer"): {
  background: string;
  color: string;
} {
  if (kind === "ready") {
    return { background: "rgba(40,70,28,0.88)", color: "#d8f0b8" };
  }
  return { background: "rgba(20,28,18,0.75)", color: "#e8f0e2" };
}
