/**
 * Visual cue configs part 28/30 (RF6.4) — split from catalog.ts.
 */

import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  isWarriorLandKind
} from "./catalog-buildings.js";
import { ENERGY } from "./catalog-recipes.js";
import { ItemId } from "./catalog-items.js";
import { formatFreeTravelCircuit } from "./catalog-cues-08.js";
import { exploreMatsCraftChainTip, fishToKitchenTip } from "./catalog-cues-27.js";

/**
 * Explore hunt meat → cook at Kitchen (CL33.3) — notice board + kitchen craft panel.
 * Tip id `meat_to_kitchen` stays stable; parallel to `fish_to_kitchen`.
 *
 * @returns Player-facing tip body.
 */
export function meatToKitchenTip(): string {
  return (
    "Hunt raw meat on Explore (Game Trail / Edge Thicket), then cook it at a Kitchen " +
    "for cooked meat and Cook XP. City kitchen is shared; build unlimited kitchens on Your Land."
  );
}

/**
 * Land gather practice (CL32.3) — notice board + Build Board copy.
 * Tip id `land_gather_practice` stays stable; city trees/ore stay scarce templates.
 *
 * @returns Player-facing tip body.
 */
export function landGatherPracticeTip(): string {
  return (
    "City trees and ore rocks are scarce and shared. On Your Land, place unlimited Trees and Ore Rocks " +
    "from the land editor (P) — chop for Forester XP, chip ore with an Iron Hammer for Miner XP. " +
    "Practice in the city, then build your own gather stations at home."
  );
}

/**
 * Player-facing tip: where to sell explore mats (matches regional books).
 *
 * @returns One-line README / notice copy.
 */
export function exploreRegionalVendorTip(): string {
  return (
    "Sell wood, iron ore, and hunt mats (leather, raw meat, boar tusks) at the Exploration vendor " +
    "for more coins than City or Your Land; wheat and flour sell for less at Explore; " +
    "seeds cost more there."
  );
}

/**
 * Portal / walk-up prompt for free map travel (CL7.1 / CL11.1 / PL5.1).
 * Action-first “Travel · free” + named four-map circuit; fare-free (Vision).
 *
 * @param landKind - Active map kind; warrior portals stress Exit + N.
 * @returns Player-facing interact label.
 */
export function freeTravelPortalPrompt(landKind?: string | null): string {
  const circuit = formatFreeTravelCircuit();
  if (landKind && isWarriorLandKind(landKind)) {
    return `Exit · Travel · free (N) · ${circuit}`;
  }
  return `Travel · free · ${circuit}`;
}

/**
 * Walk-up prompt for the player-land yard gate (tranquera).
 * Short action; Travel panel lists destinations.
 *
 * @returns Player-facing interact label.
 */
export function landGateInteractPrompt(): string {
  return "Travel";
}

/**
 * Travel panel intro — free instant rule, not caravan (CL7.1).
 *
 * @returns Short panel blurb.
 */
export function freeTravelPanelIntro(): string {
  return `Instant circuit: ${formatFreeTravelCircuit()}. No road time or coins. Travel Ration is kitchen energy food, not a travel ticket.`;
}

/**
 * Explicit legacy note — F11.2 caravan is not the CityLands map rule (CL7.1).
 *
 * @returns Disclaimer for travel UI / docs.
 */
export function freeTravelCaravanDisclaimer(): string {
  return "Legacy caravan timer and fare do not apply — map travel is free and instant.";
}

/** Static city notice-board tip (CL8.3) — no live-ops / rotation backend. */
export interface CityNoticeTip {
  id: string;
  title: string;
  body: string;
}

/**
 * Walk-up notice board copy — travel, scarce stations, warrior optional, land→city,
 * explore mats→craft chain, fisher dock + alchemist bench practice, fish→kitchen,
 * meat→kitchen, land gather practice, animal breeder path
 * (CL8.3 / CL9.2 / CL14.2 / CL16.2 / CL19.3 / CL20 / CL21.2 / CL25.3 / CL28 / CL32.3 / CL33.3 / CL40.3).
 *
 * @returns Ordered tip cards for the city notice panel.
 */
export function cityNoticeBoardTips(): CityNoticeTip[] {
  return [
    {
      id: "travel_circuit",
      title: "Free travel circuit",
      // Reason: CL45.3 — id stable; clarify Travel Ration is kitchen energy food, not map fare.
      body: `${formatFreeTravelCircuit()}. Instant hops — no fare or road timer. Travel Ration is kitchen energy food, not a travel ticket.`,
    },
    {
      id: "scarce_stations",
      title: "Scarce city stations",
      // Reason: CL40.3 / PL170.2 — keep id stable; body lists current scarce stations incl. animal pen.
      body: "City plots, trees, ore, workshop, forge, mill, kitchen, loom, fishing dock, alchemy bench, and animal pen are shared and limited. Practice here, then build unlimited stations on Your Land.",
    },

    {
      id: "warrior_optional",
      title: "Warrior is optional",
      body: "The Warrior Arena is a parallel combat stub — not required, not on the economy profession ladder, and has no combat gear ladder. Enter and leave freely (N or the north Exit portal).",
    },
    {
      id: "land_to_city",
      title: "Land → City produce loop",
      body: "Craft on Your Land (unlimited stations), then travel to City to sell at the Vendor or list on the Market board. No forced quest — just the trade hub.",
    },
    {
      id: "explore_vendor_value",
      title: "Explore vendor prices",
      body: exploreRegionalVendorTip(),
    },
    {
      id: "explore_mats_craft",
      title: "Explore mats → craft chain",
      body: exploreMatsCraftChainTip(),
    },
    {
      id: "fisher_alchemist_practice",
      title: "Fisher & Alchemist practice",
      body: "Catch Fish at the shared city river fishing spot (or build unlimited Fishing Docks on Your Land) for the Fisher lesson. Alchemist practices at the shared Alchemy Bench — brew Herbal Tonic there (non-combat). Hearty Stew stays a Cook craft at the Kitchen. No alchemy combat. Homestead is never auto-refilled for these paths.",
    },
    {
      id: "fish_to_kitchen",
      title: "Fish → Kitchen",
      body: fishToKitchenTip(),
    },
    {
      id: "meat_to_kitchen",
      title: "Hunt meat → Kitchen",
      body: meatToKitchenTip(),
    },
    {
      id: "land_gather_practice",
      title: "Land trees & ore",
      body: landGatherPracticeTip(),
    },
    {
      id: "animal_breeder_path",
      title: "Animal Breeder path",
      body: animalBreederPathTip(),
    },
  ];
}

/** Prompt / world tag when mail or notice still has unread content (PL17.1). */
export const UNREAD_CONTENT_PROMPT_TAG = "New";

/**
 * Soft world cue on the city notice board while tips are unread (PL17.1).
 * Opens the same walk-up panel — no always-on HUD column.
 * PL117.2 adds a brief plaque emissive flicker so the board stays glanceable.
 */
export const NOTICE_UNREAD_WORLD_CUE = {
  worldLabel: "New",
  padColor: "#c4a868",
  haloColor: "#e8c878",
  plaqueAccent: "#d4c090",
  labelBorder: "#e8c878",
  /** Soft plaque flicker period while tips remain unread (PL117.2). */
  flickerPeriodMs: 1100,
  /** Steady unread plaque emissive floor (PL17.1 baseline). */
  intensityBase: 0.22,
  /** Soft flicker peak — brief, not a strobe. */
  intensityPeak: 0.52,
} as const;

/**
 * Soft sine envelope for notice-board unread plaque flicker (PL117.2).
 * Continuous while unread; tip ids / localStorage stay in hasUnreadNoticeTips.
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function noticeUnreadFlickerEnvelope(nowMs: number): number {
  const period = NOTICE_UNREAD_WORLD_CUE.flickerPeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Plaque emissive intensity while notice tips are unread (PL117.2).
 * Read state stays quiet (0); unread oscillates between base and peak.
 *
 * @param unread - True when tips remain unseen.
 * @param flickerEnvelope - 0..1 from `noticeUnreadFlickerEnvelope`.
 * @returns Emissive intensity for the plaque mesh.
 */
export function noticeUnreadPlaqueEmissiveIntensity(
  unread: boolean,
  flickerEnvelope: number,
): number {
  if (!unread) return 0;
  const { intensityBase, intensityPeak } = NOTICE_UNREAD_WORLD_CUE;
  const e = Math.min(1, Math.max(0, flickerEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft panel accent when offline mail has pending inbox parcels (PL17.1).
 * Hotkey Mail (L) — same panel; not a TopBar column.
 */
export const MAIL_UNREAD_PANEL_ACCENT = {
  borderColor: "#c4a868",
  headerColor: "#e8d090",
} as const;

/**
 * Ordered notice tip ids currently shipped on the city board (PL17.1).
 *
 * @returns Tip id list from `cityNoticeBoardTips`.
 */
export function cityNoticeTipIds(): string[] {
  return cityNoticeBoardTips().map((t) => t.id);
}

/**
 * Whether the city notice board still has unread tip content (PL17.1).
 * Seen ids are client-persisted; new catalog tip ids re-arm the accent.
 *
 * @param seenTipIds - Tip ids the player has already opened/acknowledged.
 * @param tipIds - Optional tip id list (defaults to live board tips).
 * @returns True when at least one tip id is not yet seen.
 */
export function hasUnreadNoticeTips(
  seenTipIds: readonly string[],

  tipIds: readonly string[] = cityNoticeTipIds(),
): boolean {
  if (tipIds.length === 0) return false;
  const seen = new Set(seenTipIds);
  return tipIds.some((id) => !seen.has(id));
}

/**
 * Pending inbox parcel count — unread offline mail (PL17.1).
 *
 * @param mail - Mail rows (inbox/sent + status).
 * @returns Count of pending inbox parcels.
 */
export function countPendingInboxMail(
  mail: ReadonlyArray<{ direction: string; status: string }>,

): number {
  return mail.filter(
    (m) => m.direction === "inbox" && m.status === "pending",
  ).length;
}

/**
 * Whether offline mail has claimable unread parcels (PL17.1).
 *
 * @param mail - Mail rows (inbox/sent + status).
 * @returns True when inbox has at least one pending parcel.
 */
export function hasUnreadMailParcels(
  mail: ReadonlyArray<{ direction: string; status: string }>,

): boolean {
  return countPendingInboxMail(mail) > 0;
}

/**
 * Appends · New when mail/notice content is unread (PL17.1).
 * Idempotent; empty labels stay empty.
 *
 * @param label - Base interact prompt label.
 * @param unread - True when unread content remains.
 * @returns Label with · New when unread.
 */
export function withUnreadContentPrompt(
  label: string,
  unread: boolean,
): string {
  const trimmed = label.trim();
  if (!trimmed || !unread) return trimmed;
  const lower = trimmed.toLowerCase();
  const tag = UNREAD_CONTENT_PROMPT_TAG.toLowerCase();
  if (lower.endsWith(` · ${tag}`) || lower.endsWith(`· ${tag}`)) {
    return trimmed;
  }
  return `${trimmed} · ${UNREAD_CONTENT_PROMPT_TAG}`;
}

/**
 * Animal Breeder path (CL16.2 / CL26.2 / CL27 / CL34.2 / PL170.2) — city scarce + land pens.
 * Notice-board only — no livestock combat; city pen is one shared scarce station.
 *
 * @returns Player-facing path note for the notice board body.
 */
export function animalBreederPathTip(): string {
  return (
    "Care for the shared city Animal Pen (feed wheat or refresh bedding with wood), or build unlimited pens on Your Land " +
    "(Build Board) for Animal Breeder XP — light care practice, not a livestock fight loop. " +
    "See the Animal Breeder Tutor on the plaza. Homestead is never auto-refilled for breeding."
  );
}

/** Player marketplace board (F11.4) — listing fee + TTL. */
export const MARKET = {
  /** Open listings auto-expire and return escrowed goods. */
  listingTtlMs: 10 * 60 * 1000,
  /** Flat coin sink charged when creating a listing. */
  listFeeCoins: 2,
} as const;

/** Guild social ranks + invite codes (F12.1). */
export const GUILD = {
  inviteCodeLength: 6,
} as const;

export type GuildRank = "owner" | "officer" | "member";

/** Offline mail parcels (F13.4) — stackables + coins; claim when online. */
export const MAIL = {
  maxOpenInbox: 30,
  maxSubjectLen: 48,
} as const;

/** Shared guild bank for stackables only (F12.2). */
export const GUILD_BANK = {
  /** Distinct item kinds the vault may hold. */
  maxSlots: 24,
  /** Cap per stack in the vault. */
  maxStackQty: 999,
} as const;

/**
 * Neutral world claim beacon (F12.3) — one shared grove all yards can reach.
 * Guild claim; timer fills stored mats; contest wars come in F12.4.
 */
export const CLAIM_NODE = {
  slug: "wild_grove",
  name: "Wild Grove",
  produceItemId: "wood" as ItemId,
  produceIntervalMs: 60_000,
  produceQty: 1,
  storageCap: 25,
  claimEnergyCost: 15,
} as const;

/**
 * Soft war for held claims (F12.4) — timed window, score from deliveries, no PvP wipe.
 */
export const CLAIM_WAR = {
  /** Contest duration after a rival opens the window. */
  windowMs: 3 * 60_000,
  /** Energy to open a contest against a held claim. */
  startEnergyCost: 10,
  /** Deliver this stackable to the beacon to score (1 pt per unit). */
  deliverItemId: "wood" as ItemId,
} as const;

/**
 * Expiry timestamp for a listing created at `createdAt`.
 */
export function marketListingExpiresAt(createdAt: number): number {
  return createdAt + MARKET.listingTtlMs;
}

/**
 * True when an open listing should expire.
 */
export function isMarketListingExpired(
  createdAt: number,
  now = Date.now(),
): boolean {
  return now >= marketListingExpiresAt(createdAt);
}

/** Ordered expansions for empty starter slots 6–7 (Content Lock P0.3). */
export const SLOT_EXPANSIONS: Array<{
  slotIndex: number;
  type: "crop_plot";
  x: number;
  z: number;
  coinCost: number;
  materials: Array<{ itemId: ItemId; qty: number }>;
  energyCost: number;
}> = [
  {
    slotIndex: 6,
    type: "crop_plot",
    x: 1,
    z: -2,
    coinCost: 25,
    materials: [{ itemId: "iron_bar", qty: 1 }],
    energyCost: ENERGY.costs.build,
  },
  {
    slotIndex: 7,
    type: "crop_plot",
    x: 1,
    z: 1,
    coinCost: 40,
    materials: [{ itemId: "iron_bar", qty: 2 }],
    energyCost: ENERGY.costs.build,
  },
];

export function nextSlotExpansion(occupiedSlotIndexes: number[]) {
  return SLOT_EXPANSIONS.find((slot) => !occupiedSlotIndexes.includes(slot.slotIndex));
}

/**
 * Brief warm pad flash on the newly unlocked expand footprint after Expanded (PL137.2).
 * Complements expand SFX + Expanded cue (PL20.3) + short-afford pulse (PL123.1).
 * Costs / slots unchanged; mute ok.
 */
export const EXPAND_FIELD_PAD_FLASH = {
  durationMs: 560,
  /** Soft warm field-gold pad (apart from upgrade copper PL137.1 + spawn amber PL134.1). */
  padColor: "#c8b050",
  emissiveColor: "#e0cc70",
  opacityPeak: 0.62,
  intensityPeak: 1.02,
  /** Slightly larger than station pads so the crop footprint reads clearly. */
  radius: 1.05,
} as const;

/**
 * Whether a successful land expand should flash the new footprint (PL137.2).
 * True only on expand ok; fails stay silent.
 *
 * @param expandSucceeded - True when expand API / action succeeded.
 * @returns True when the unlocked footprint should briefly flash.
 */
export function shouldFlashExpandFieldPad(expandSucceeded: boolean): boolean {
  return expandSucceeded === true;
}

/**
 * Soft decay envelope for expand-field pad flash (PL137.2).
 * Peaks at expand edge (1) and reaches 0 at durationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since expand success (0 at start).
 * @returns Envelope in [0, 1]; 0 when outside the flash window.
 */
export function expandFieldPadFlashEnvelope(elapsedMs: number): number {
  const { durationMs } = EXPAND_FIELD_PAD_FLASH;
  if (!(durationMs > 0) || !Number.isFinite(elapsedMs) || elapsedMs < 0) return 0;
  if (elapsedMs >= durationMs) return 0;
  const t = 1 - elapsedMs / durationMs;
  // Reason: ease-out so the new field footprint settles then softens quickly.
  return t * t;
}
