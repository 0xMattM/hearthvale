import {
  cityHubFirstSessionTip,
  emptyLandBuildBoardTip,
  firstFreeTravelTip,
  isCityLandKind,
  isPlayerLandStationType,
  postCraftMarketTip,
  welcomeMayorFirstSessionTip,
  type PlayerStateDto,
} from "@game/shared";

export type OnboardingTipId =
  | "welcome"
  | "city_hub"
  | "free_travel"
  | "empty_land"
  | "move"
  | "plant"
  | "wait"
  | "harvest"
  | "craft"
  | "post_craft_market"
  | "vendor"
  | "market"
  | "visit"
  | "ore"
  | "expand"
  | "level";

export interface OnboardingTip {
  id: OnboardingTipId;
  text: string;
}

export interface OnboardingContext {
  hasMoved: boolean;
  hasPlanted: boolean;
  hasHarvestedWheat: boolean;
  hasCrafted: boolean;
  hasVendorVisit: boolean;
  /** True when the active map is the shared City hub (CL12.1). */
  isOnCity: boolean;
  /** True when the player has placed any land station (CL16.1). */
  hasPlacedStation: boolean;
  characterLevel: number;
  /** True when the Governor intro quest is claimed. */
  hasMetMayor: boolean;
  dismissed: OnboardingTipId[];
}

/**
 * Derives progress flags from player state for first-session tips.
 */
export function onboardingFlagsFromState(state: PlayerStateDto): {
  hasPlanted: boolean;
  hasHarvestedWheat: boolean;
  hasCrafted: boolean;
  isOnCity: boolean;
  hasPlacedStation: boolean;
} {
  const hasPlanted = state.buildings.some(
    (b) =>
      b.type === "crop_plot" &&
      (b.cropState === "planted" || b.cropState === "ready"),
  );
  const wheat = state.inventory.find((i) => i.itemId === "wheat")?.qty ?? 0;
  const flour = state.inventory.find((i) => i.itemId === "flour")?.qty ?? 0;
  const ironBar = state.inventory.find((i) => i.itemId === "iron_bar")?.qty ?? 0;
  const plank = state.inventory.find((i) => i.itemId === "plank")?.qty ?? 0;
  const cloth = state.inventory.find((i) => i.itemId === "cloth")?.qty ?? 0;
  const stew = state.inventory.find((i) => i.itemId === "stew")?.qty ?? 0;
  // Reason: CL21.1 post-craft tip should fire after any common land craft, not only mill/forge.
  const hasCrafted =
    flour > 0 ||
    ironBar > 0 ||
    plank > 0 ||
    cloth > 0 ||
    stew > 0 ||
    state.blacksmithXp > 0 ||
    state.cookXp > 0 ||
    state.carpenterXp > 0 ||
    state.weaverXp > 0;
  return {
    hasPlanted: hasPlanted || state.farmerXp > 0,
    hasHarvestedWheat: wheat > 0 || flour > 0 || state.farmerXp > 0,
    hasCrafted,
    isOnCity: isCityLandKind(state.landKind),
    hasPlacedStation: state.buildings.some((b) =>
      isPlayerLandStationType(b.type),
    ),
  };
}

const TIPS: OnboardingTip[] = [
  {
    id: "welcome",
    text: welcomeMayorFirstSessionTip(),
  },
  {
    id: "city_hub",
    text: cityHubFirstSessionTip(),
  },
  {
    id: "free_travel",
    text: firstFreeTravelTip(),
  },
  {
    id: "empty_land",
    text: emptyLandBuildBoardTip(),
  },
  { id: "move", text: "WASD to walk · Your Land starts empty" },
  { id: "plant", text: "Walk to a Field · press E to plant wheat" },
  {
    id: "wait",
    text: "Wheat takes 3 minutes · visit Mill, Forge, or Kitchen while you wait · I = inventory",
  },
  { id: "harvest", text: "When a Field turns gold · E to harvest" },
  { id: "craft", text: "Carry wheat to the Mill · E to craft flour" },
  {
    id: "post_craft_market",
    text: postCraftMarketTip(),
  },
  { id: "vendor", text: "Vendor Stall buys mats · T opens player trade" },
  {
    id: "market",
    text: "Press M for the player market · list or buy stackable goods for coins",
  },
  {
    id: "visit",
    text: "Press V to visit another land · trade with the owner (T)",
  },
  {
    id: "ore",
    text: "Forge an Iron Hammer · chip the Ore Rock west of the fields for more iron",
  },
  {
    id: "expand",
    text: "Unlock extra fields on the marked pads · coins + iron bars + energy",
  },
  {
    id: "level",
    text: "Character level rises with XP · at Lv 5 you unlock an extra decor pad (cosmetic only)",
  },
];

/**
 * Next non-blocking tip for the first session (Early Game).
 * City hub tip is one-shot / dismissible and clears once the player is on City (CL12.1).
 * Free-travel tip is one-shot after city hub / first portal (PL13.1); dismissible only.
 * Empty-land tip is one-shot / dismissible and clears after a station is placed (CL16.1).
 * Post-craft market tip is one-shot after first land craft; clears on City / vendor (CL21.1).
 */
export function nextOnboardingTip(ctx: OnboardingContext): OnboardingTip | null {
  for (const tip of TIPS) {
    if (ctx.dismissed.includes(tip.id)) continue;
    if (tip.id === "welcome" && ctx.hasMetMayor) continue;
    if (tip.id === "city_hub" && ctx.isOnCity) continue;
    // Reason: PL13.1 — free_travel follows city_hub in order; on City hub tip is skipped so this is next.
    if (
      tip.id === "empty_land" &&
      (ctx.isOnCity || ctx.hasPlacedStation)
    ) {
      continue;
    }
    if (tip.id === "move" && ctx.hasMoved) continue;
    if (tip.id === "plant" && ctx.hasPlanted) continue;
    if (tip.id === "wait" && (ctx.hasHarvestedWheat || ctx.hasCrafted)) continue;
    if (tip.id === "harvest" && ctx.hasHarvestedWheat) continue;
    if (tip.id === "craft" && ctx.hasCrafted) continue;
    // Reason: CL21.1 — only after a craft; auto-clears once they reach City or Vendor.
    if (tip.id === "post_craft_market") {
      if (!ctx.hasCrafted) continue;
      if (ctx.isOnCity || ctx.hasVendorVisit) continue;
    }
    if (tip.id === "vendor" && ctx.hasVendorVisit) continue;
    // harvest tip only after planting
    if (tip.id === "harvest" && !ctx.hasPlanted) continue;
    // craft tip only after having wheat path started
    if (tip.id === "craft" && !ctx.hasHarvestedWheat && !ctx.hasPlanted) continue;
    // vendor last core loop — only after craft or harvest progress
    if (tip.id === "vendor" && !ctx.hasHarvestedWheat && !ctx.hasCrafted) continue;
    // post-core economy tips after vendor visit (or dismiss vendor)
    if (
      (tip.id === "market" ||
        tip.id === "visit" ||
        tip.id === "ore" ||
        tip.id === "expand") &&
      !ctx.hasVendorVisit &&
      !ctx.dismissed.includes("vendor")
    ) {
      continue;
    }
    // Soft unlock tip once Settler (Lv 3+)
    if (tip.id === "level" && ctx.characterLevel < 3) continue;
    return tip;
  }
  return null;
}
