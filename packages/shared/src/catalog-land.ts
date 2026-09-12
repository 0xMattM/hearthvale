/**
 * Land kinds and building type union (RF6.3).
 */

export type BuildingType =
  | "crop_plot"
  | "mill"
  | "forge"
  | "vendor_stall"
  | "ore_node"
  | "kitchen"
  | "game_trail"
  | "edge_thicket"
  | "tree_stump"
  | "workshop"
  | "portal"
  | "decor_pad"
  | "decor_planter"
  | "decor_banner"
  | "claim_node"
  /** City walk-up tutor (CL2.2); profession via tutorialNpcId on DTO / city template. */
  | "tutorial_npc"
  /** City player market board (CL2.3). */
  | "market_board"
  /** Player-land layout editor (hotkey P) — non-production marker type kept for leftover rows. */
  | "build_board"
  /** Warrior arena info plaque (CL5.1) — walk-up stub; no combat balance. */
  | "arena_board"
  /** Warrior arena training dummy — live click combat (Explore + Arena only). */
  | "arena_dummy"
  /** City event / notice board (CL8.3) — walk-up static tips; no live-ops. */
  | "notice_board"
  /** City REALM / Creditcoin player market stall (walk-up; B desk is the same path). */
  | "realm_market"
  /** Weaver loom (CL9.1) — placeable craft station on player land. */
  | "loom"
  /** Fisher dock (CL19.1) — placeable catch station on player land. */
  | "fishing_dock"
  /** Animal pen (CL26.2 / CL27.1) — placeable on player land; wheat feed grants breeder XP. */
  | "animal_pen"
  /** Alchemist bench (CL28.2) — placeable brew station; non-combat tonic. */
  | "alchemy_bench";

/**
 * CityLands four map spaces (PlayerVision).
 * City hub / private lands / exploration / optional warrior arena.
 */
export type CanonicalLandKind =
  | "city"
  | "player_land"
  | "explore"
  | "warrior";

/**
 * Stored or API land kinds.
 * Legacy aliases (pre-CityLands): `starter` → player_land, `forest` → explore.
 */
export type LandKind = CanonicalLandKind | "starter" | "forest";

/** Canonical CityLands map kinds in travel order. */
export const CANONICAL_LAND_KINDS: readonly CanonicalLandKind[] = [
  "city",
  "player_land",
  "explore",
  "warrior",
] as const;

/**
 * Maps stored/API kind strings to a canonical CityLands kind.
 */
export function normalizeLandKind(value: string): CanonicalLandKind | null {
  if (value === "city") return "city";
  // Reason: starter was the packed homestead; CityLands renames it to empty player land.
  if (value === "player_land" || value === "starter") return "player_land";
  // Reason: forest glade becomes the exploration map kind.
  if (value === "explore" || value === "forest") return "explore";
  if (value === "warrior") return "warrior";
  return null;
}

/**
 * True when value is a known land kind (canonical or legacy alias).
 */
export function isLandKind(value: string): value is LandKind {
  return normalizeLandKind(value) !== null;
}

/**
 * True when kind is the player's private land (including legacy `starter`).
 */
export function isPlayerLandKind(kind: string): boolean {
  return normalizeLandKind(kind) === "player_land";
}

/**
 * True when kind is the exploration map (including legacy `forest`).
 */
export function isExploreLandKind(kind: string): boolean {
  return normalizeLandKind(kind) === "explore";
}

/**
 * True when kind is the city hub map.
 */
export function isCityLandKind(kind: string): boolean {
  return normalizeLandKind(kind) === "city";
}

/**
 * True when kind is the optional warrior arena map.
 */
export function isWarriorLandKind(kind: string): boolean {
  return normalizeLandKind(kind) === "warrior";
}


/**
 * Equipped / inventory tool durability readability (PL21.1).
 * Percentage of max keeps wooden hoe (~25) and iron tools aligned without toast spam.
 */
