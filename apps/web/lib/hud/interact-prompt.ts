import type { BuildingDto, LandKind } from "@game/shared";
import {
  CLAIM_NODE,
  CLAIM_WAR,
  ITEMS,
  arenaInteractPrompt,
  expandRefuseClarityText,
  expandSlotShortfall,
  formatGrowRemaining,
  freeTravelPortalPrompt,
  landGateInteractPrompt,
  isCityLandKind,
  isCityScarceStationType,
  isExploreLandKind,
  isStationContendedByPresence,
  nextSlotExpansion,
  oreChipInteractLabel,
  tutorialNpcWorldLabel,
  withCityScarceStationAvailabilityPrompt,
  withExploreSectionPrompt,
  withUnreadContentPrompt,
  type LiveCombatDto,
} from "@game/shared";
import { liveCombatInteractLabel } from "./combat-prompt";
import {
  clientCropState,
  oreNodeReady,
  type InteractTarget,
} from "../../components/land-scene/landProximity";

export interface InteractPromptView {
  label: string;
  showKey: boolean;
}

export interface InteractPromptInput {
  target: InteractTarget | null;
  visiting: boolean;
  gameNow: number;
  /** Occupied slot indexes on the active land (expand cost). */
  occupiedSlotIndexes: number[];
  /** Active map kind — explore prompts get section wayfinding (CL10.1). */
  landKind?: LandKind | string | null;
  /**
   * Remote presence world positions — city scarce Busy/Free prompt detail (PL8.2).
   * Land unlimited ignores this; no always-on panel.
   */
  presenceOthers?: ReadonlyArray<{ x: number; z: number }>;
  /**
   * City notice board still has unread tips (PL17.1) — soft · New on walk-up prompt.
   * Does not open a HUD column; same notice panel.
   */
  hasUnreadNotice?: boolean;
  /**
   * PL21.2 — equipped tool item id for ore chip prompt clarity (null = none).
   * Omit to keep the classic ready label.
   */
  equippedToolItemId?: string | null;
  /** PL21.2 — whether inventory holds the ore required tool (Iron Hammer). */
  hasRequiredOreTool?: boolean;
  /** PL26.1 / PL26.2 — wallet for expand afford tint / refuse clarity. */
  softCurrency?: number;
  /** PL26.1 / PL26.2 — energy for expand afford / refuse clarity. */
  energy?: number;
  /**
   * PL26.1 / PL26.2 — inventory qty lookup for expand mats.
   * Omit to keep the classic full-cost expand prompt.
   */
  inventoryQty?: (itemId: string) => number;
  /** Live Explore / Arena fight on the nearby target. */
  combat?: LiveCombatDto | null;
}

/**
 * Builds the floating interact prompt for the current proximity target.
 *
 * @param input - Target, visit flag, clock, and slot occupancy.
 * @returns Prompt view or null when nothing is actionable nearby.
 */
export function resolveInteractPrompt(
  input: InteractPromptInput,
): InteractPromptView | null {
  const {
    target,
    visiting,
    gameNow,
    occupiedSlotIndexes,
    landKind,
    presenceOthers = [],
    hasUnreadNotice = false,
    equippedToolItemId,
    hasRequiredOreTool,
    softCurrency,
    energy,
    inventoryQty,
  } = input;
  if (!target) return null;

  if (target.kind === "building") {
    const combatLabel = liveCombatInteractLabel(
      input.combat,
      target.building.id,
    );
    if (combatLabel) return { label: combatLabel, showKey: false };
  }

  if (visiting) {
    if (target.kind === "expand" || target.kind === "gate") return null;
    return visitPrompt(target.building, gameNow);
  }

  if (target.kind === "gate") {
    return { label: landGateInteractPrompt(), showKey: true };
  }

  if (target.kind === "expand") {
    const next = nextSlotExpansion(occupiedSlotIndexes);
    if (!next) return { label: "No expand slots left", showKey: false };
    // Reason: PL26.2 — when short, name missing coins/mats/energy; affordable keeps full cost.
    if (
      softCurrency != null &&
      energy != null &&
      typeof inventoryQty === "function"
    ) {
      const shortfall = expandSlotShortfall({
        occupiedSlotIndexes,
        softCurrency,
        energy,
        inventoryQty,
      });
      const clarity = expandRefuseClarityText(shortfall);
      if (clarity) {
        return { label: `Expand field · ${clarity}`, showKey: true };
      }
    }
    const mats = next.materials
      .map((m) => `${m.qty}× ${ITEMS[m.itemId].name}`)
      .join(", ");
    return {
      label: `Expand field · ${next.coinCost} coins + ${mats} + ${next.energyCost} energy`,
      showKey: true,
    };
  }

  let prompt = ownLandPrompt(
    target.building,
    gameNow,
    landKind,
    equippedToolItemId,
    hasRequiredOreTool,
  );
  if (!prompt) return null;

  // Reason: PL17.1 — notice board soft · New when tip ids are still unread.
  prompt = applyUnreadNoticePrompt(
    prompt,
    target.building.type,
    hasUnreadNotice,
  );

  // Reason: PL8.2 — scarce city stations name Busy vs Free from soft presence; land unchanged.
  if (
    landKind &&
    isCityLandKind(String(landKind)) &&
    isCityScarceStationType(target.building.type)
  ) {
    const busy = isStationContendedByPresence(
      target.building.x,
      target.building.z,
      presenceOthers,
    );
    prompt = {
      ...prompt,
      label: withCityScarceStationAvailabilityPrompt(prompt.label, busy),
    };
  }

  if (!landKind || !isExploreLandKind(String(landKind))) return prompt;
  return {
    ...prompt,
    label: withExploreSectionPrompt(target.building.type, prompt.label),
  };
}

/**
 * Prompt text while visiting another player's land (no interact key).
 *
 * @param building - Nearby building.
 * @param gameNow - Synced game clock ms.
 * @returns Prompt or null.
 */
function visitPrompt(
  building: BuildingDto,
  gameNow: number,
): InteractPromptView | null {
  if (building.type === "crop_plot") {
    const crop = clientCropState(building, gameNow);
    if (crop === "planted" && building.readyAt) {
      return {
        label: `Their field · ${formatGrowRemaining(Math.max(0, building.readyAt - gameNow))}`,
        showKey: false,
      };
    }
    return { label: `Their field · ${crop ?? "empty"}`, showKey: false };
  }
  if (building.type === "mill") return { label: "Their Mill", showKey: false };
  if (building.type === "forge") return { label: "Their Forge", showKey: false };
  if (building.type === "kitchen")
    return { label: "Their Kitchen", showKey: false };
  if (building.type === "ore_node")
    return { label: "Their Ore Rock", showKey: false };
  if (building.type === "tree_stump")
    return { label: "Their Tree Stump", showKey: false };
  if (building.type === "workshop")
    return { label: "Their Workshop", showKey: false };
  if (building.type === "loom") return { label: "Their Loom", showKey: false };
  if (building.type === "alchemy_bench")
    return { label: "Their Alchemy Bench", showKey: false };
  if (building.type === "fishing_dock")
    return { label: "Their Fishing Dock", showKey: false };
  if (building.type === "animal_pen")
    return { label: "Their Animal Pen", showKey: false };
  if (building.type === "game_trail")
    return { label: "Their Game Trail", showKey: false };
  if (building.type === "edge_thicket")
    return { label: "Their Edge Thicket", showKey: false };
  if (building.type === "vendor_stall") {
    return { label: "Their Vendor Stall", showKey: false };
  }
  return null;
}

/**
 * Interact label for craft stations (Use / Collect / Working / Busy).
 *
 * @param building - Nearby craft building with optional craft glance.
 * @param baseName - Station display name (e.g. Mill).
 * @returns Prompt view.
 */
function craftStationInteractPrompt(
  building: BuildingDto,
  baseName: string,
): InteractPromptView {
  const craft = building.craft;
  if (craft?.isYours && craft.state === "ready")
    return { label: "Collect", showKey: true };
  if (craft?.isYours && craft.state === "working")
    return { label: "Working", showKey: true };
  if (craft && !craft.isYours) return { label: "Busy", showKey: false };
  const tierSuffix =
    (building.type === "mill" || building.type === "forge") &&
    building.tier >= 2
      ? " (T2)"
      : "";
  return { label: `Use ${baseName}${tierSuffix}`, showKey: true };
}

/**
 * Prompt text on the player's active map (own land / city / explore / warrior).
 *
 * @param building - Nearby building.
 * @param gameNow - Synced game clock ms.
 * @param landKind - Active map kind (warrior portals stress Exit + N).
 * @returns Prompt or null.
 */
function ownLandPrompt(
  building: BuildingDto,
  gameNow: number,
  landKind?: LandKind | string | null,
  equippedToolItemId?: string | null,
  hasRequiredOreTool?: boolean,
): InteractPromptView | null {
  if (building.type === "crop_plot") {
    const crop = clientCropState(building, gameNow);
    if (crop === "empty") return { label: "Plant seed", showKey: true };
    if (crop === "ready") return { label: "Harvest", showKey: true };
    const remain = building.readyAt
      ? Math.max(0, building.readyAt - gameNow)
      : 0;
    return {
      label: `Growing · ${formatGrowRemaining(remain)}`,
      showKey: false,
    };
  }
  if (building.type === "mill")
    return craftStationInteractPrompt(building, "Mill");
  if (building.type === "forge")
    return craftStationInteractPrompt(building, "Forge");
  if (building.type === "kitchen")
    return craftStationInteractPrompt(building, "Kitchen");
  if (building.type === "workshop")
    return craftStationInteractPrompt(building, "Workshop");
  if (building.type === "loom")
    return craftStationInteractPrompt(building, "Loom");
  if (building.type === "alchemy_bench")
    return craftStationInteractPrompt(building, "Alchemy Bench");
  if (building.type === "ore_node") {
    if (!oreNodeReady(building, gameNow)) {
      const remain = building.readyAt
        ? Math.max(0, building.readyAt - gameNow)
        : 0;
      return {
        label: `Ore rock settling · ${formatGrowRemaining(remain)}`,
        showKey: false,
      };
    }
    // Reason: PL21.2 — name Iron Hammer; clarify equip vs broken/missing.
    return {
      label: oreChipInteractLabel(
        equippedToolItemId,
        hasRequiredOreTool,
        building.cropId,
      ),
      showKey: true,
    };
  }
  if (building.type === "tree_stump") {
    if (!oreNodeReady(building, gameNow)) {
      const remain = building.readyAt
        ? Math.max(0, building.readyAt - gameNow)
        : 0;
      return {
        label: `Stump recovering · ${formatGrowRemaining(remain)}`,
        showKey: false,
      };
    }
    return { label: "Chop wood", showKey: true };
  }
  if (building.type === "fishing_dock") {
    if (!oreNodeReady(building, gameNow)) {
      const remain = building.readyAt
        ? Math.max(0, building.readyAt - gameNow)
        : 0;
      const place = isCityLandKind(String(landKind ?? ""))
        ? "River"
        : "Dock";
      return {
        label: `${place} settling · ${formatGrowRemaining(remain)}`,
        showKey: false,
      };
    }
    return { label: "Catch fish", showKey: true };
  }
  if (building.type === "animal_pen") {
    if (!oreNodeReady(building, gameNow)) {
      const remain = building.readyAt
        ? Math.max(0, building.readyAt - gameNow)
        : 0;
      return {
        label: `Pen settling · ${formatGrowRemaining(remain)}`,
        showKey: false,
      };
    }
    // Reason: CL27.1 / CL34.2 — wheat feed or wood bedding; no livestock combat.
    return { label: "Care for animals (wheat / wood)", showKey: true };
  }
  if (building.type === "game_trail") {
    if (building.readyAt != null && gameNow < building.readyAt) {
      return {
        label: `Wildlife scattered · ${formatGrowRemaining(building.readyAt - gameNow)}`,
        showKey: false,
      };
    }
    return { label: "Hares nearby", showKey: false };
  }
  if (building.type === "edge_thicket") {
    if (building.readyAt != null && gameNow < building.readyAt) {
      return {
        label: `Wildlife scattered · ${formatGrowRemaining(building.readyAt - gameNow)}`,
        showKey: false,
      };
    }
    return { label: "Boars nearby", showKey: false };
  }
  if (building.type === "claim_node") {
    const claim = building.claim;
    if (claim?.contestEndsAt) {
      const remain = Math.max(0, claim.contestEndsAt - gameNow);
      const yours = claim.yourContestScore ?? 0;
      return {
        label: `Soft war · deliver wood · you ${yours} · ${formatGrowRemaining(remain)}`,
        showKey: true,
      };
    }
    if (!claim?.claimedGuildName) {
      return {
        label: `Claim ${claim?.name ?? "Wild Grove"} (guild · ${CLAIM_NODE.claimEnergyCost} energy)`,
        showKey: true,
      };
    }
    if (claim.isYours) {
      return {
        label:
          claim.storedQty > 0
            ? `Collect claim · ${claim.storedQty} stored`
            : `Your claim · waiting for mats`,
        showKey: claim.storedQty > 0,
      };
    }
    return {
      label: `Contest ${claim.claimedGuildName} (soft war · ${CLAIM_WAR.startEnergyCost} energy)`,
      showKey: true,
    };
  }
  if (building.type === "portal") {
    return { label: freeTravelPortalPrompt(landKind), showKey: true };
  }
  if (building.type === "decor_pad") {
    return { label: "Place housing decor", showKey: true };
  }
  if (building.type === "decor_planter" || building.type === "decor_banner") {
    return { label: "Yard decor", showKey: false };
  }
  if (building.type === "vendor_stall") {
    return { label: "Vendor Stall", showKey: true };
  }
  if (building.type === "tutorial_npc") {
    const name = tutorialNpcWorldLabel(building.tutorialNpcId);
    return { label: `Talk to ${name}`, showKey: true };
  }
  if (building.type === "market_board") {
    return { label: "City Market Board", showKey: true };
  }
  if (building.type === "realm_market") {
    return { label: "REALM Market", showKey: true };
  }
  if (building.type === "arena_dummy") {
    if (building.readyAt != null && gameNow < building.readyAt) {
      return {
        label: `Dummy resetting · ${formatGrowRemaining(building.readyAt - gameNow)}`,
        showKey: false,
      };
    }
    return { label: "Spar · dummy", showKey: true };
  }
  if (building.type === "arena_board") {
    return { label: arenaInteractPrompt(), showKey: true };
  }
  if (building.type === "notice_board") {
    return { label: "City notice board", showKey: true };
  }
  return null;
}

/**
 * Applies PL17.1 unread · New detail after the base own-land prompt is resolved.
 * Kept separate so visit / explore section wrappers stay composition-friendly.
 */
function applyUnreadNoticePrompt(
  prompt: InteractPromptView,
  buildingType: BuildingDto["type"],
  hasUnreadNotice: boolean,
): InteractPromptView {
  if (buildingType !== "notice_board" || !hasUnreadNotice) return prompt;
  return {
    ...prompt,
    label: withUnreadContentPrompt(prompt.label, true),
  };
}
