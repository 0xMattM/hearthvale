/**
 * Panel / hotkey / walk-away orchestration extracted from GameApp (CL6.2).
 * Pure helpers keep open/close parity testable without the monolith.
 */

/** One contextual overlay at a time — never always-on columns. */
export type HudPanelId =
  | "inventory"
  | "craft"
  | "vendor"
  | "trade"
  | "visit"
  | "market"
  | "realm_market"
  | "chat"
  | "guild"
  | "quests"
  | "tutorial_npc"
  | "build"
  | "achievements"
  | "mail"
  | "deeds"
  | "settings"
  | "travel"
  | "decor"
  | "arena"
  | "notice"
  | "plant"
  | null;

export type CraftStationPanel =
  | "mill"
  | "forge"
  | "kitchen"
  | "workshop"
  | "loom"
  | "alchemy_bench";

/** Result of resolving a keyboard event for HUD panel routing. */
export type PanelHotkeyResult = {
  preventDefault?: boolean;
} & (
  | { action: "none" }
  | {
      action: "toggle";
      panel: Exclude<HudPanelId, null>;
      /** Market hotkey clears walk-up board binding (M opens global market). */
      clearMarketBoard?: boolean;
      /** Deed hotkey clears walk-up REALM stall binding (B opens the global desk, not the stall). */
      clearRealmMarket?: boolean;
    }
  | { action: "escape" }
  | { action: "interact" }
);

export interface PanelHotkeyContext {
  /** True while visiting another player's land. */
  visiting: boolean;
  /** True on the player's own private land (layout editor hotkey). */
  onPlayerLand?: boolean;
}

/**
 * Toggles a panel id: same id closes; different id opens.
 *
 * @param current - Active panel or null.
 * @param next - Panel to toggle.
 * @returns Next panel id.
 */
export function toggleHudPanel(
  current: HudPanelId,
  next: Exclude<HudPanelId, null>,
): HudPanelId {
  return current === next ? null : next;
}

/**
 * Returns whether the event target is a text-entry control.
 *
 * @param target - KeyboardEvent.target.
 * @returns True when panel hotkeys must be ignored.
 */
export function isTextEntryTarget(target: EventTarget | null): boolean {
  const tag = (target as HTMLElement | null)?.tagName;
  return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
}

/**
 * Maps a key event to a panel action (visit-aware).
 *
 * @param event - Minimal keyboard fields.
 * @param ctx - Visit / map context.
 * @returns Routed action; `none` when ignored.
 */
export function resolvePanelHotkey(
  event: { code: string; repeat: boolean; target: EventTarget | null },
  ctx: PanelHotkeyContext,
): PanelHotkeyResult {
  if (event.repeat) return { action: "none" };
  if (isTextEntryTarget(event.target)) return { action: "none" };

  switch (event.code) {
    case "KeyI":
      return { action: "toggle", panel: "inventory" };
    case "KeyP":
      if (ctx.visiting || ctx.onPlayerLand === false) {
        return { action: "none" };
      }
      return { action: "toggle", panel: "build" };
    case "KeyT":
      return { action: "toggle", panel: "trade" };
    case "KeyN":
      // Reason: browser find-as-you-type; still swallow while visiting.
      if (ctx.visiting) return { action: "none", preventDefault: true };
      return { action: "toggle", panel: "travel", preventDefault: true };
    case "KeyV":
      if (ctx.visiting) return { action: "none" };
      return { action: "toggle", panel: "visit" };
    case "KeyM":
      return {
        action: "toggle",
        panel: "market",
        clearMarketBoard: true,
        clearRealmMarket: true,
      };
    case "KeyC":
      return { action: "toggle", panel: "chat" };
    case "KeyG":
      return { action: "toggle", panel: "guild" };
    case "KeyQ":
      return { action: "toggle", panel: "quests" };
    case "KeyJ":
      return { action: "toggle", panel: "achievements" };
    case "KeyL":
      return { action: "toggle", panel: "mail" };
    case "KeyB":
      // Reason: B is the global Creditcoin desk — the indigo stall is its own panel.
      return { action: "toggle", panel: "deeds", clearRealmMarket: true };
    case "KeyH":
      return { action: "toggle", panel: "settings" };
    case "Escape":
      return { action: "escape" };
    case "KeyE":
      return { action: "interact", preventDefault: true as const };
    default:
      return { action: "none" };
  }
}

/** Side effects when a walk-up panel must close after leaving range. */
export type ContextualWalkAway =
  | { close: false }
  | {
      close: true;
      clearCraft?: boolean;
      clearTutorial?: boolean;
      clearMarketBoard?: boolean;
      clearRealmMarket?: boolean;
    };

export interface ContextualWalkAwayInput {
  panel: HudPanelId;
  craftStation: string | null;
  tutorialProfessionId: string | null;
  marketBoardId: string | null;
  realmMarketId: string | null;
  targetBuilding: {
    id: string;
    type: string;
    tutorialNpcId?: string | null;
  } | null;
}

/**
 * Closes contextual panels when the player walks away from the target.
 *
 * @param input - Active panel + proximity building.
 * @returns Close effects; `close: false` when nothing changes.
 */
export function resolveContextualWalkAway(
  input: ContextualWalkAwayInput,
): ContextualWalkAway {
  const building = input.targetBuilding;

  if (input.panel === "craft" && input.craftStation) {
    if (!building || building.type !== input.craftStation) {
      return { close: true, clearCraft: true };
    }
  }
  if (input.panel === "vendor") {
    if (!building || building.type !== "vendor_stall") {
      return { close: true };
    }
  }
  if (input.panel === "tutorial_npc") {
    if (
      !building ||
      building.type !== "tutorial_npc" ||
      building.tutorialNpcId !== input.tutorialProfessionId
    ) {
      return { close: true, clearTutorial: true };
    }
  }
  if (input.panel === "market" && input.marketBoardId) {
    if (!building || building.id !== input.marketBoardId) {
      return { close: true, clearMarketBoard: true };
    }
  }
  if (input.panel === "realm_market" && input.realmMarketId) {
    if (!building || building.id !== input.realmMarketId) {
      return { close: true, clearRealmMarket: true };
    }
  }
  if (input.panel === "arena") {
    if (!building || building.type !== "arena_board") {
      return { close: true };
    }
  }
  if (input.panel === "notice") {
    if (!building || building.type !== "notice_board") {
      return { close: true };
    }
  }
  return { close: false };
}

/**
 * True when E would re-open the same tutor already in dialogue.
 * Lets the talk box advance lines instead of resetting the conversation.
 *
 * @param panel - Active HUD panel.
 * @param currentProfessionId - Tutor currently being spoken with.
 * @param nextProfessionId - Tutor the interact target would open.
 * @returns True when interact must be ignored.
 */
export function shouldSkipTutorialNpcReopen(
  panel: HudPanelId,
  currentProfessionId: string | null,
  nextProfessionId: string,
): boolean {
  return (
    panel === "tutorial_npc" &&
    currentProfessionId !== null &&
    currentProfessionId === nextProfessionId
  );
}

/** Intent to open a panel from a building interact (not gather/hunt/etc.). */
export type BuildingPanelIntent =
  | {
      type: "craft";
      station: CraftStationPanel;
      buildingId: string;
    }
  | { type: "travel" }
  | { type: "decor"; buildingId: string }
  | { type: "vendor" }
  | { type: "tutorial_npc"; professionId: string }
  | { type: "market"; buildingId: string }
  | { type: "realm_market"; buildingId: string }
  | { type: "build" }
  | { type: "arena" }
  | { type: "notice" };

/**
 * Returns a panel-open intent for walk-up buildings, or null for action nodes.
 *
 * @param building - Nearby building dto fields.
 * @returns Panel intent or null when interact is an immediate action.
 */
export function buildingPanelIntent(building: {
  id: string;
  type: string;
  tutorialNpcId?: string | null;
}): BuildingPanelIntent | null {
  if (
    building.type === "mill" ||
    building.type === "forge" ||
    building.type === "kitchen" ||
    building.type === "workshop" ||
    building.type === "loom" ||
    building.type === "alchemy_bench"
  ) {
    return {
      type: "craft",
      station: building.type,
      buildingId: building.id,
    };
  }
  if (building.type === "portal") return { type: "travel" };
  if (building.type === "decor_pad") {
    return { type: "decor", buildingId: building.id };
  }
  if (building.type === "vendor_stall") return { type: "vendor" };
  if (building.type === "tutorial_npc" && building.tutorialNpcId) {
    return { type: "tutorial_npc", professionId: building.tutorialNpcId };
  }
  if (building.type === "market_board") {
    return { type: "market", buildingId: building.id };
  }
  if (building.type === "realm_market") {
    return { type: "realm_market", buildingId: building.id };
  }
  if (building.type === "arena_board") return { type: "arena" };
  if (building.type === "notice_board") return { type: "notice" };
  return null;
}

/**
 * Lists panel ids that are never always-on walking chrome (CL6.1/CL6.2).
 *
 * @returns Closed-by-default panel ids.
 */
export function defaultClosedPanelIds(): Exclude<HudPanelId, null>[] {
  return [
    "inventory",
    "craft",
    "vendor",
    "trade",
    "visit",
    "market",
    "realm_market",
    "chat",
    "guild",
    "quests",
    "tutorial_npc",
    "build",
    "achievements",
    "mail",
    "deeds",
    "settings",
    "travel",
    "decor",
    "arena",
    "notice",
    "plant",
  ];
}
