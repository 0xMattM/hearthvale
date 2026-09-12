export * from "./achievements.js";
export * from "./catalog.js";
export * from "./character.js";
export * from "./chain-combat-invariant.js";
export * from "./chain-market.js";
export * from "./market-analytics.js";
export * from "./creditcoin.js";
export * from "./creditcoin-abi.js";
export * from "./creditcoin-calldata.js";
export * from "./creditcoin-settlement.js";
export * from "./combat.js";
export * from "./combat-live.js";
export * from "./keybinds.js";
export * from "./land-deed.js";
export * from "./messages.js";
export * from "./quests.js";
export * from "./tutorial-npcs.js";
export * from "./tutorial-npc-handoff.js";
export * from "./tutor-look.js";
export * from "./screen-compass.js";
export * from "./visual-cue-math.js";
export * from "./wallet.js";
export * from "./world.js";
export * from "./world-collision.js";
export * from "./world-object-materials.js";
export * from "./city-civic-houses.js";
export * from "./explore-wilds-mix.js";
export * from "./foliage-occlusion.js";

import type {
  BuildingType,
  CanonicalLandKind,
  GuildRank,
} from "./catalog.js";
import type { LandDeedDto } from "./land-deed.js";
import type { LiveCombatDto } from "./combat-live.js";

export interface InventoryStackDto {
  id: string;
  itemId: string;
  qty: number;
  durability: number | null;
}

export interface BuildingDto {
  id: string;
  type: BuildingType;
  slotIndex: number;
  x: number;
  z: number;
  /** 1 = starter; 2 = upgraded mill/forge (F10.4). */
  tier: number;
  /** Crop plots only */
  cropState: "empty" | "planted" | "ready" | null;
  cropId: string | null;
  plantedAt: number | null;
  readyAt: number | null;
  /**
   * Process-station craft job glance (wait/collect).
   * City: only your own job (peers invisible). Land/Explore: yours or busy-by-other.
   */
  craft: BuildingCraftDto | null;
  /** Claim beacon only (F12.3). */
  claim: ClaimNodeDto | null;
  /** Tutorial NPC profession id when type is tutorial_npc (CL2.2). */
  tutorialNpcId: string | null;
}

/** Live craft job on a process station (start → wait → collect). */
export interface BuildingCraftDto {
  /** Null when busy-by-other (land/explore) — do not reveal peer recipe. */
  recipeId: string | null;
  /** Null when busy-by-other. */
  readyAt: number | null;
  state: "working" | "ready";
  isYours: boolean;
}

/** Live status for a claim_node building (shared world node). */
export interface ClaimNodeDto {
  slug: string;
  name: string;
  produceItemId: string;
  storedQty: number;
  storageCap: number;
  claimedGuildName: string | null;
  isYours: boolean;
  /** Soft-war contest end (F12.4); null when idle. */
  contestEndsAt: number | null;
  contestScores: Array<{ guildName: string; score: number }>;
  yourContestScore: number | null;
}

export interface PlayerStateDto {
  playerId: string;
  username: string;
  /** Optional linked wallet stub (F15.1); null when unlinked. Never gates play. */
  walletAddress: string | null;
  /** Off-chain premium land deeds (F15.2). Empty when none — never gates play. */
  deeds: LandDeedDto[];
  /** Creditcoin / Attestcoin overlay. Absent when unlinked. Never gates combat. */
  chain?: import("./creditcoin.js").CreditcoinSnapshotDto | null;
  /** True when the player owns at least one on-chain LandNFT. Never gates combat. */
  hasNftLand?: boolean;
  softCurrency: number;
  softCurrencyName: string;
  energy: number;
  maxEnergy: number;
  characterXp: number;
  /** Derived from characterXp (F13.1). */
  characterLevel: number;
  /** Cosmetic title for characterLevel. */
  characterTitle: string;
  /** XP earned within the current level. */
  xpIntoLevel: number;
  /** XP still needed for next level; null at max. */
  xpToNextLevel: number | null;
  farmerXp: number;
  blacksmithXp: number;
  cookXp: number;
  /**
   * Legacy alias of animalHunterXp (pre-CL31 shared hunter column).
   * Prefer animalHunterXp / monsterHunterXp for new UI.
   */
  hunterXp: number;
  /** Explore game_trail hunt XP (CL31.1). */
  animalHunterXp: number;
  /** Explore edge_thicket hunt XP (CL31.1). */
  monsterHunterXp: number;
  carpenterXp: number;
  weaverXp: number;
  /** Tree chop XP (CL18.1); separate from carpenter craft XP. */
  foresterXp: number;
  /** Ore gather XP (CL18.2); separate from blacksmith craft XP. */
  minerXp: number;
  /** Land station place XP (CL18.3); economy Builder ladder. */
  builderXp: number;
  /** Fishing dock catch XP (CL23.1); Fisher ladder. */
  fisherXp: number;
  /** Animal pen feed XP (CL27.2); Animal Breeder ladder. */
  animalBreederXp: number;
  /** Alchemy bench brew XP (CL31.3); Alchemist ladder. */
  alchemistXp: number;
  guildName: string | null;
  /** Null when not in a guild (F12.1). */
  guildRank: GuildRank | null;
  /** Visible to owner/officer only; null otherwise. */
  guildInviteCode: string | null;
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  landId: string;
  /** Canonical CityLands map kind (aliases normalized). */
  landKind: CanonicalLandKind;
  /** Set when standing on a Creditcoin NFT homestead (not the free starter yard). */
  nftTokenId?: string | null;
  /** LandNFT size when `nftTokenId` is set (drives a larger yard than starter). */
  nftLandSize?: string | null;
  /** Pending caravan destination (F11.2), null when idle. */
  travelDestinationKind: CanonicalLandKind | null;
  /** Server epoch ms when caravan arrives; null when idle. */
  travelArriveAt: number | null;
  buildSlots: number;
  equippedToolInventoryId: string | null;
  /** Equipped melee / bow stack; null when unarmed. */
  equippedWeaponInventoryId?: string | null;
  /** Equipped armor stack; null when none. */
  equippedArmorInventoryId?: string | null;
  /** Equipped shield stack; null when none (bows are two-handed). */
  equippedShieldInventoryId?: string | null;
  /** In-progress Explore / Arena click fight; null when idle. */
  combat?: LiveCombatDto | null;
  buildings: BuildingDto[];
  inventory: InventoryStackDto[];
  serverNow: number;
}

/** Public view of another player's land (visit mode). */
export interface VisitLandDto {
  ownerUsername: string;
  landId: string;
  landKind: CanonicalLandKind;
  buildings: BuildingDto[];
  serverNow: number;
}
