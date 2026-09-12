/**
 * Onboarding tip + first-walkup localStorage helpers (RF7.5).
 */

import type { OnboardingTipId } from "@/lib/onboarding";

export const TIPS_KEY = "game_mvp_tips_dismissed";
export const NOTICE_SEEN_KEY = "game_mvp_notice_seen";
export const PORTAL_WALKUP_KEY = "game_mvp_portal_walkup_seen";
export const EXPLORE_WALKUP_KEY = "game_mvp_explore_walkup_seen";
export const ARENA_WALKUP_KEY = "game_mvp_arena_walkup_seen";
export const EMPTY_LAND_BUILD_WALKUP_KEY = "game_mvp_empty_land_build_walkup_seen";
export const VISIT_LAND_WALKUP_KEY = "game_mvp_visit_land_walkup_seen";
export const WARRIOR_MAP_WALKUP_KEY = "game_mvp_warrior_map_walkup_seen";
export const CITY_HUB_WALKUP_KEY = "game_mvp_city_hub_walkup_seen";
export const MARKET_WALKUP_KEY = "game_mvp_market_walkup_seen";
export const VENDOR_WALKUP_KEY = "game_mvp_vendor_walkup_seen";
export const FISHING_DOCK_WALKUP_KEY = "game_mvp_fishing_dock_walkup_seen";
export const ANIMAL_PEN_WALKUP_KEY = "game_mvp_animal_pen_walkup_seen";
export const TREE_STUMP_WALKUP_KEY = "game_mvp_tree_stump_walkup_seen";
export const ORE_NODE_WALKUP_KEY = "game_mvp_ore_node_walkup_seen";
export const CROP_PLOT_WALKUP_KEY = "game_mvp_crop_plot_walkup_seen";
export const HUNT_TRAIL_WALKUP_KEY = "game_mvp_hunt_trail_walkup_seen";
export const KITCHEN_WALKUP_KEY = "game_mvp_kitchen_walkup_seen";
export const NOTICE_BOARD_WALKUP_KEY = "game_mvp_notice_board_walkup_seen";
export const EXPAND_PAD_WALKUP_KEY = "game_mvp_expand_pad_walkup_seen";
export const MILL_WALKUP_KEY = "game_mvp_mill_walkup_seen";
export const WORKSHOP_WALKUP_KEY = "game_mvp_workshop_walkup_seen";
export const FORGE_WALKUP_KEY = "game_mvp_forge_walkup_seen";
export const LOOM_WALKUP_KEY = "game_mvp_loom_walkup_seen";
export const ALCHEMY_BENCH_WALKUP_KEY = "game_mvp_alchemy_bench_walkup_seen";
export const DECOR_PAD_WALKUP_KEY = "game_mvp_decor_pad_walkup_seen";
export const TUTOR_WALKUP_KEY = "game_mvp_tutor_walkup_seen";
export const CLAIM_NODE_WALKUP_KEY = "game_mvp_claim_node_walkup_seen";

export function loadDismissedTips(username: string): OnboardingTipId[] {
  try {
    const raw = window.localStorage.getItem(`${TIPS_KEY}:${username}`);
    if (!raw) return [];
    return JSON.parse(raw) as OnboardingTipId[];
  } catch {
    return [];
  }
}

export function saveDismissedTips(username: string, ids: OnboardingTipId[]) {
  window.localStorage.setItem(`${TIPS_KEY}:${username}`, JSON.stringify(ids));
}

export function loadSeenNoticeTips(username: string): string[] {
  try {
    const raw = window.localStorage.getItem(`${NOTICE_SEEN_KEY}:${username}`);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveSeenNoticeTips(username: string, ids: string[]) {
  window.localStorage.setItem(
    `${NOTICE_SEEN_KEY}:${username}`,
    JSON.stringify(ids),
  );
}

export function loadPortalWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${PORTAL_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function savePortalWalkUpSeen(username: string) {
  window.localStorage.setItem(`${PORTAL_WALKUP_KEY}:${username}`, "1");
}

export function loadExploreWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${EXPLORE_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveExploreWalkUpSeen(username: string) {
  window.localStorage.setItem(`${EXPLORE_WALKUP_KEY}:${username}`, "1");
}

export function loadArenaWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${ARENA_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveArenaWalkUpSeen(username: string) {
  window.localStorage.setItem(`${ARENA_WALKUP_KEY}:${username}`, "1");
}

export function loadEmptyLandBuildWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(
        `${EMPTY_LAND_BUILD_WALKUP_KEY}:${username}`,
      ) === "1"
    );
  } catch {
    return false;
  }
}

export function saveEmptyLandBuildWalkUpSeen(username: string) {
  window.localStorage.setItem(
    `${EMPTY_LAND_BUILD_WALKUP_KEY}:${username}`,
    "1",
  );
}

export function loadVisitLandWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${VISIT_LAND_WALKUP_KEY}:${username}`) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function saveVisitLandWalkUpSeen(username: string) {
  window.localStorage.setItem(`${VISIT_LAND_WALKUP_KEY}:${username}`, "1");
}

export function loadWarriorMapWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${WARRIOR_MAP_WALKUP_KEY}:${username}`) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function saveWarriorMapWalkUpSeen(username: string) {
  window.localStorage.setItem(`${WARRIOR_MAP_WALKUP_KEY}:${username}`, "1");
}

export function loadCityHubWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${CITY_HUB_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveCityHubWalkUpSeen(username: string) {
  window.localStorage.setItem(`${CITY_HUB_WALKUP_KEY}:${username}`, "1");
}

export function loadMarketWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${MARKET_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveMarketWalkUpSeen(username: string) {
  window.localStorage.setItem(`${MARKET_WALKUP_KEY}:${username}`, "1");
}

export function loadVendorWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${VENDOR_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveVendorWalkUpSeen(username: string) {
  window.localStorage.setItem(`${VENDOR_WALKUP_KEY}:${username}`, "1");
}

export function loadFishingDockWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${FISHING_DOCK_WALKUP_KEY}:${username}`) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function saveFishingDockWalkUpSeen(username: string) {
  window.localStorage.setItem(`${FISHING_DOCK_WALKUP_KEY}:${username}`, "1");
}

export function loadAnimalPenWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${ANIMAL_PEN_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveAnimalPenWalkUpSeen(username: string) {
  window.localStorage.setItem(`${ANIMAL_PEN_WALKUP_KEY}:${username}`, "1");
}

export function loadTreeStumpWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${TREE_STUMP_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveTreeStumpWalkUpSeen(username: string) {
  window.localStorage.setItem(`${TREE_STUMP_WALKUP_KEY}:${username}`, "1");
}

export function loadOreNodeWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${ORE_NODE_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveOreNodeWalkUpSeen(username: string) {
  window.localStorage.setItem(`${ORE_NODE_WALKUP_KEY}:${username}`, "1");
}

export function loadCropPlotWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${CROP_PLOT_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveCropPlotWalkUpSeen(username: string) {
  window.localStorage.setItem(`${CROP_PLOT_WALKUP_KEY}:${username}`, "1");
}

export function loadHuntTrailWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${HUNT_TRAIL_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveHuntTrailWalkUpSeen(username: string) {
  window.localStorage.setItem(`${HUNT_TRAIL_WALKUP_KEY}:${username}`, "1");
}

export function loadKitchenWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${KITCHEN_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveKitchenWalkUpSeen(username: string) {
  window.localStorage.setItem(`${KITCHEN_WALKUP_KEY}:${username}`, "1");
}

export function loadNoticeBoardWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${NOTICE_BOARD_WALKUP_KEY}:${username}`) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function saveNoticeBoardWalkUpSeen(username: string) {
  window.localStorage.setItem(`${NOTICE_BOARD_WALKUP_KEY}:${username}`, "1");
}

export function loadExpandPadWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${EXPAND_PAD_WALKUP_KEY}:${username}`) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function saveExpandPadWalkUpSeen(username: string) {
  window.localStorage.setItem(`${EXPAND_PAD_WALKUP_KEY}:${username}`, "1");
}

export function loadMillWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${MILL_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveMillWalkUpSeen(username: string) {
  window.localStorage.setItem(`${MILL_WALKUP_KEY}:${username}`, "1");
}

export function loadWorkshopWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${WORKSHOP_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveWorkshopWalkUpSeen(username: string) {
  window.localStorage.setItem(`${WORKSHOP_WALKUP_KEY}:${username}`, "1");
}

export function loadForgeWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${FORGE_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveForgeWalkUpSeen(username: string) {
  window.localStorage.setItem(`${FORGE_WALKUP_KEY}:${username}`, "1");
}

export function loadLoomWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${LOOM_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveLoomWalkUpSeen(username: string) {
  window.localStorage.setItem(`${LOOM_WALKUP_KEY}:${username}`, "1");
}

export function loadAlchemyBenchWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(
        `${ALCHEMY_BENCH_WALKUP_KEY}:${username}`,
      ) === "1"
    );
  } catch {
    return false;
  }
}

export function saveAlchemyBenchWalkUpSeen(username: string) {
  window.localStorage.setItem(`${ALCHEMY_BENCH_WALKUP_KEY}:${username}`, "1");
}

export function loadDecorPadWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${DECOR_PAD_WALKUP_KEY}:${username}`) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function saveDecorPadWalkUpSeen(username: string) {
  window.localStorage.setItem(`${DECOR_PAD_WALKUP_KEY}:${username}`, "1");
}

export function loadTutorWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${TUTOR_WALKUP_KEY}:${username}`) === "1"
    );
  } catch {
    return false;
  }
}

export function saveTutorWalkUpSeen(username: string) {
  window.localStorage.setItem(`${TUTOR_WALKUP_KEY}:${username}`, "1");
}

export function loadClaimNodeWalkUpSeen(username: string): boolean {
  try {
    return (
      window.localStorage.getItem(`${CLAIM_NODE_WALKUP_KEY}:${username}`) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function saveClaimNodeWalkUpSeen(username: string) {
  window.localStorage.setItem(`${CLAIM_NODE_WALKUP_KEY}:${username}`, "1");
}
