/**
 * Creditcoin NFT homestead biome layouts — gather nodes on the plot.
 * Free starter land stays empty (CL3.1); only `lands.nft_token_id` plots seed these.
 */

import type { LandNftBiome, LandNftSize } from "./creditcoin.js";
import { LAND_NFT_BIOMES, LAND_NFT_SIZES } from "./creditcoin.js";
import type { BuildingType } from "./catalog-land.js";
import {
  isHomesteadPickupBuildingType,
  isPlayerLandPlaceCell,
} from "./catalog-player-stations.js";

/** Slot range reserved for biome seeds so player-placed kits (100+) never collide. */
export const NFT_LAND_BIOME_SLOT_BASE = 800;
export const NFT_LAND_BIOME_SLOT_END = 820;

export interface NftLandBiomeBuilding {
  type: BuildingType;
  slotIndex: number;
  x: number;
  z: number;
  /** Ore kind for `ore_node`; omitted on trees and empty crop plots. */
  cropId?: string;
  minSize: LandNftSize;
}

const SIZE_RANK: Record<LandNftSize, number> = {
  small: 0,
  medium: 1,
  large: 2,
};

const FOREST_NODES: readonly NftLandBiomeBuilding[] = [
  { type: "tree_stump", slotIndex: 800, x: -4, z: -3, minSize: "small" },
  { type: "tree_stump", slotIndex: 801, x: 4, z: -3, minSize: "small" },
  { type: "tree_stump", slotIndex: 802, x: -4, z: 3, minSize: "small" },
  { type: "tree_stump", slotIndex: 803, x: 3, z: 4, minSize: "small" },
  { type: "tree_stump", slotIndex: 804, x: -5, z: 0, minSize: "medium" },
  { type: "tree_stump", slotIndex: 805, x: 5, z: -1, minSize: "medium" },
  { type: "tree_stump", slotIndex: 806, x: 0, z: -5, minSize: "large" },
  { type: "tree_stump", slotIndex: 807, x: 5, z: 4, minSize: "large" },
];

const MOUNTAIN_NODES: readonly NftLandBiomeBuilding[] = [
  {
    type: "ore_node",
    slotIndex: 800,
    x: -4,
    z: -3,
    cropId: "iron",
    minSize: "small",
  },
  {
    type: "ore_node",
    slotIndex: 801,
    x: 4,
    z: -3,
    cropId: "copper",
    minSize: "small",
  },
  {
    type: "ore_node",
    slotIndex: 802,
    x: -4,
    z: 3,
    cropId: "iron",
    minSize: "small",
  },
  {
    type: "ore_node",
    slotIndex: 803,
    x: 3,
    z: 4,
    cropId: "copper",
    minSize: "small",
  },
  {
    type: "ore_node",
    slotIndex: 804,
    x: 5,
    z: 0,
    cropId: "gold",
    minSize: "medium",
  },
  {
    type: "ore_node",
    slotIndex: 805,
    x: -5,
    z: -1,
    cropId: "iron",
    minSize: "medium",
  },
  {
    type: "ore_node",
    slotIndex: 806,
    x: 0,
    z: -5,
    cropId: "gold",
    minSize: "large",
  },
  {
    type: "ore_node",
    slotIndex: 807,
    x: 5,
    z: 4,
    cropId: "copper",
    minSize: "large",
  },
];

const FERTILE_NODES: readonly NftLandBiomeBuilding[] = [
  { type: "crop_plot", slotIndex: 800, x: -2, z: -3, minSize: "small" },
  { type: "crop_plot", slotIndex: 801, x: -1, z: -3, minSize: "small" },
  { type: "crop_plot", slotIndex: 802, x: 0, z: -3, minSize: "small" },
  { type: "crop_plot", slotIndex: 803, x: 1, z: -3, minSize: "small" },
  { type: "crop_plot", slotIndex: 804, x: 2, z: -3, minSize: "medium" },
  { type: "crop_plot", slotIndex: 805, x: -2, z: -2, minSize: "medium" },
  { type: "crop_plot", slotIndex: 806, x: -1, z: -2, minSize: "large" },
  { type: "crop_plot", slotIndex: 807, x: 0, z: -2, minSize: "large" },
];

const NODES_BY_BIOME: Record<LandNftBiome, readonly NftLandBiomeBuilding[]> = {
  forest: FOREST_NODES,
  mountain: MOUNTAIN_NODES,
  fertile: FERTILE_NODES,
};

/**
 * Whether a building slot belongs to the NFT biome seed template.
 *
 * Args:
 *   slotIndex: `buildings.slot_index`.
 *
 * Returns:
 *   True for reserved biome slots (800–819).
 */
export function isNftLandBiomeSlot(slotIndex: number): boolean {
  if (!Number.isFinite(slotIndex)) return false;
  return (
    slotIndex >= NFT_LAND_BIOME_SLOT_BASE && slotIndex < NFT_LAND_BIOME_SLOT_END
  );
}

/**
 * True when the land editor may move or pick up this building.
 * NFT biome stock (trees / ore / plots that came with the plot) stays planted.
 *
 * @param type - Building type.
 * @param slotIndex - `buildings.slot_index` (biome stock uses 800–819).
 * @returns False for stock nodes and non-pickup types.
 */
export function canPickupHomesteadBuilding(
  type: string,
  slotIndex: number | null | undefined,
): boolean {
  if (!isHomesteadPickupBuildingType(type)) return false;
  const slot = typeof slotIndex === "number" ? slotIndex : 0;
  return !isNftLandBiomeSlot(slot);
}

function sizeRank(size: string | null | undefined): number {
  if (size === "medium" || size === "large") return SIZE_RANK[size];
  return SIZE_RANK.small;
}

/**
 * Gather nodes that spawn on an NFT homestead for a biome + size.
 *
 * Args:
 *   biome: LandNFT biome (`forest` / `mountain` / `fertile`).
 *   size: LandNFT size; larger plots get extra nodes.
 *
 * Returns:
 *   Template rows that fit the yard grid. Unknown biome → empty.
 */
export function nftLandBiomeBuildings(
  biome: string | null | undefined,
  size?: string | null,
): NftLandBiomeBuilding[] {
  if (!biome || !LAND_NFT_BIOMES.includes(biome as LandNftBiome)) return [];
  const rank = sizeRank(size);
  const nftSize: LandNftSize = LAND_NFT_SIZES.includes(size as LandNftSize)
    ? (size as LandNftSize)
    : "small";
  return NODES_BY_BIOME[biome as LandNftBiome].filter(
    (node) =>
      SIZE_RANK[node.minSize] <= rank &&
      isPlayerLandPlaceCell(node.x, node.z, nftSize),
  );
}
