/**
 * In-game audio cues (F14.4 / PL6 / PL7 / PL10 / PL15 / PL16 / PL18 / PL20 / PL25 / PL27 / PL28 / PL29 / PL31 / PL33.1–PL33.2 / PL51.1) — Web Audio SFX + looping map music; respects mute.
 */

import {
  ACTION_ERROR,
  CANONICAL_LAND_KINDS,
  normalizeLandKind,
  type CanonicalLandKind,
} from "@game/shared";
import {
  BGM_MUSIC_TRACKS,
  BGM_MUSIC_TRANSITION,
  bgmMusicTrackFor,
  createHtmlMusicPlayer,
  shouldSwapBgmMusicTrack,
  type BgmMusicTrackId,
  type MusicPlayer,
} from "./game-audio-music";

export type SfxId =
  | "plant"
  | "harvest"
  | "craft"
  | "hunt"
  | "gather"
  | "build"
  | "travel"
  | "travel_warrior"
  | "vendor_buy"
  | "vendor_sell"
  | "visit"
  | "visit_leave"
  | "refuse"
  | "decor"
  | "trade_invite"
  | "trade_offer"
  | "trade_accept"
  | "eat"
  | "equip"
  | "expand"
  | "repair"
  | "chat"
  | "quest_claim"
  | "guild_claim"
  | "soft_war"
  | "tool_break"
  | "hunt_lose";

export interface ToneStep {
  freq: number;
  durationSec: number;
  gain: number;
  type?: OscillatorType;
}

/** Frequency recipes for core production / travel / vendor cues (F14.4 / PL6.1 / PL10.1 / PL11.2). */
export const SFX_PRESETS: Record<SfxId, ToneStep[]> = {
  plant: [
    { freq: 392, durationSec: 0.07, gain: 0.08, type: "sine" },
    { freq: 523, durationSec: 0.1, gain: 0.07, type: "sine" },
  ],
  harvest: [
    { freq: 587, durationSec: 0.06, gain: 0.09, type: "triangle" },
    { freq: 784, durationSec: 0.12, gain: 0.07, type: "sine" },
  ],
  craft: [
    { freq: 220, durationSec: 0.05, gain: 0.1, type: "square" },
    { freq: 330, durationSec: 0.08, gain: 0.07, type: "triangle" },
  ],
  // Hunt win resolve (F14.4 / PL33.2) — tense settle kept as win confirm
  hunt: [
    { freq: 140, durationSec: 0.09, gain: 0.11, type: "sawtooth" },
    { freq: 90, durationSec: 0.14, gain: 0.08, type: "triangle" },
  ],
  // Soft hunt lose (PL33.2); quieter descending settle — distinct from win hunt / refuse
  hunt_lose: [
    { freq: 165, durationSec: 0.06, gain: 0.07, type: "triangle" },
    { freq: 123, durationSec: 0.08, gain: 0.05, type: "sine" },
    { freq: 98, durationSec: 0.1, gain: 0.035, type: "sine" },
  ],
  gather: [
    { freq: 180, durationSec: 0.06, gain: 0.1, type: "triangle" },
    { freq: 240, durationSec: 0.1, gain: 0.07, type: "sine" },
  ],
  build: [
    { freq: 150, durationSec: 0.05, gain: 0.11, type: "square" },
    { freq: 200, durationSec: 0.06, gain: 0.08, type: "triangle" },
    { freq: 300, durationSec: 0.08, gain: 0.05, type: "sine" },
  ],
  travel: [
    { freq: 260, durationSec: 0.08, gain: 0.07, type: "sine" },
    { freq: 390, durationSec: 0.1, gain: 0.08, type: "sine" },
    { freq: 520, durationSec: 0.12, gain: 0.06, type: "triangle" },
  ],
  // Darker square-led enter cue — optional warrior path (PL11.2); still soft / mute-safe
  travel_warrior: [
    { freq: 110, durationSec: 0.09, gain: 0.08, type: "square" },
    { freq: 165, durationSec: 0.1, gain: 0.07, type: "triangle" },
    { freq: 220, durationSec: 0.11, gain: 0.05, type: "sine" },
  ],
  // Soft marketplace confirm — spend coins (AudioDirection UI confirm)
  vendor_buy: [
    { freq: 660, durationSec: 0.05, gain: 0.07, type: "sine" },
    { freq: 880, durationSec: 0.09, gain: 0.06, type: "triangle" },
  ],
  // Soft marketplace confirm — receive coins (distinct from buy)
  vendor_sell: [
    { freq: 523, durationSec: 0.05, gain: 0.07, type: "triangle" },
    { freq: 698, durationSec: 0.07, gain: 0.06, type: "sine" },
    { freq: 880, durationSec: 0.08, gain: 0.05, type: "sine" },
  ],
  // Soft social arrive — visiting another land (PL15.1); distinct from map travel
  visit: [
    { freq: 349, durationSec: 0.06, gain: 0.07, type: "sine" },
    { freq: 440, durationSec: 0.08, gain: 0.06, type: "triangle" },
    { freq: 523, durationSec: 0.1, gain: 0.05, type: "sine" },
  ],
  // Soft social leave — returning home from a visit (PL27.1); descending mirror of arrive
  visit_leave: [
    { freq: 523, durationSec: 0.06, gain: 0.07, type: "sine" },
    { freq: 440, durationSec: 0.08, gain: 0.055, type: "triangle" },
    { freq: 349, durationSec: 0.1, gain: 0.045, type: "sine" },
  ],
  // Quiet descending refuse — busy / energy / already-here (PL16.1); not arcade spam
  refuse: [
    { freq: 220, durationSec: 0.07, gain: 0.06, type: "triangle" },
    { freq: 165, durationSec: 0.1, gain: 0.045, type: "sine" },
  ],
  // Soft housing decor place confirm (PL16.2); distinct from station build
  decor: [
    { freq: 440, durationSec: 0.05, gain: 0.07, type: "sine" },
    { freq: 554, durationSec: 0.08, gain: 0.05, type: "triangle" },
  ],
  // Soft incoming trade ping (PL18.1); distinct from visit / vendor
  trade_invite: [
    { freq: 494, durationSec: 0.05, gain: 0.07, type: "sine" },
    { freq: 659, durationSec: 0.09, gain: 0.055, type: "triangle" },
  ],
  // Soft trade offer sent confirm (PL28.1); outbound lift — distinct from invite/accept
  trade_offer: [
    { freq: 440, durationSec: 0.05, gain: 0.07, type: "sine" },
    { freq: 554, durationSec: 0.08, gain: 0.055, type: "triangle" },
  ],
  // Soft trade accept confirm (PL18.2); brighter settle than invite ping
  trade_accept: [
    { freq: 523, durationSec: 0.05, gain: 0.07, type: "triangle" },
    { freq: 784, durationSec: 0.1, gain: 0.05, type: "sine" },
  ],
  // Soft quest claim confirm (PL29.3); gentle rise — distinct from tutor Claimed (no SFX) / trade accept
  quest_claim: [
    { freq: 392, durationSec: 0.05, gain: 0.07, type: "sine" },
    { freq: 523, durationSec: 0.07, gain: 0.055, type: "triangle" },
    { freq: 659, durationSec: 0.1, gain: 0.045, type: "sine" },
  ],
  // Soft guild Wild Grove claim / collect confirm (PL31.2); earthy settle — distinct from quest
  guild_claim: [
    { freq: 196, durationSec: 0.06, gain: 0.075, type: "triangle" },
    { freq: 294, durationSec: 0.08, gain: 0.055, type: "sine" },
    { freq: 392, durationSec: 0.1, gain: 0.04, type: "sine" },
  ],
  // Soft soft-war start confirm (PL31.2); slightly tense lift — distinct from guild claim
  soft_war: [
    { freq: 220, durationSec: 0.05, gain: 0.07, type: "square" },
    { freq: 277, durationSec: 0.07, gain: 0.055, type: "triangle" },
    { freq: 330, durationSec: 0.09, gain: 0.04, type: "sine" },
  ],
  // Soft tool break (PL33.1); descending crack — distinct from repair settle / refuse
  tool_break: [
    { freq: 330, durationSec: 0.05, gain: 0.075, type: "square" },
    { freq: 196, durationSec: 0.08, gain: 0.055, type: "triangle" },
    { freq: 110, durationSec: 0.1, gain: 0.04, type: "sine" },
  ],
  // Soft eat confirm (PL20.1); warm bite — distinct from harvest / vendor
  eat: [
    { freq: 392, durationSec: 0.05, gain: 0.07, type: "sine" },
    { freq: 494, durationSec: 0.09, gain: 0.05, type: "triangle" },
  ],
  // Soft equip / unequip confirm (PL20.2); short clack — not craft hammer
  equip: [
    { freq: 330, durationSec: 0.04, gain: 0.08, type: "triangle" },
    { freq: 440, durationSec: 0.07, gain: 0.05, type: "sine" },
  ],
  // Soft land-expand confirm (PL20.3); earthy thud rise — distinct from build
  expand: [
    { freq: 130, durationSec: 0.06, gain: 0.08, type: "triangle" },
    { freq: 196, durationSec: 0.08, gain: 0.06, type: "sine" },
    { freq: 262, durationSec: 0.09, gain: 0.045, type: "sine" },
  ],
  // Soft tool repair confirm (PL25.1); metallic settle — distinct from equip / craft
  repair: [
    { freq: 247, durationSec: 0.05, gain: 0.08, type: "triangle" },
    { freq: 370, durationSec: 0.08, gain: 0.055, type: "sine" },
    { freq: 494, durationSec: 0.09, gain: 0.04, type: "sine" },
  ],
  // Soft chat receive ping (PL27.2); quiet blip — distinct from trade invite
  chat: [
    { freq: 587, durationSec: 0.04, gain: 0.06, type: "sine" },
    { freq: 784, durationSec: 0.07, gain: 0.045, type: "triangle" },
  ],
};
/** Soft ambient bed recipe (PL7.1). Optional partial for sparse/tense Explore (PL7.2). */
export interface BgmBed {
  freq: number;
  gain: number;
  type: OscillatorType;
  /** Second quiet voice — Explore wilds sparsity / tension only. */
  partial?: { freq: number; gain: number; type: OscillatorType };
}

/**
 * Per-map soft BGM tints (PL7.1). Quiet drones — not a music suite.
 * Explore is intentionally sparser/tenser than homestead Land (PL7.2 / AudioDirection).
 */
export const BGM_BEDS: Record<CanonicalLandKind, BgmBed> = {
  // Soft urban hum — slightly brighter triangle
  city: { freq: 130.81, gain: 0.016, type: "triangle" },
  // Warm homestead (legacy F14.4 drone)
  player_land: { freq: 98, gain: 0.018, type: "sine" },
  // Wilds: lower gain + sparse second partial (no combat suite)
  explore: {
    freq: 82.41,
    gain: 0.01,
    type: "sawtooth",
    partial: { freq: 123.47, gain: 0.005, type: "sine" },
  },
  // Darker optional-path pad
  warrior: { freq: 73.42, gain: 0.014, type: "square" },
};

/** @deprecated Prefer `BGM_BEDS.player_land` — kept for F14.4 callers/tests. */
export const BGM_DRONE = BGM_BEDS.player_land;

/**
 * Resolves a land-kind string (incl. legacy aliases) to its BGM bed.
 */
export function bgmBedFor(kind: string | null | undefined): BgmBed {
  const n = kind ? normalizeLandKind(kind) : null;
  return BGM_BEDS[n ?? "player_land"];
}

/**
 * True when all four canonical beds differ in freq or type (PL7.1 distinguishability).
 */
export function bgmBedsDistinguishable(): boolean {
  const beds = CANONICAL_LAND_KINDS.map((k) => BGM_BEDS[k]);
  for (let i = 0; i < beds.length; i++) {
    for (let j = i + 1; j < beds.length; j++) {
      const a = beds[i]!;
      const b = beds[j]!;
      if (a.freq === b.freq && a.type === b.type && a.gain === b.gain) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Soft map-bed swap (PL51.1) — quieter restart into the new bed while the old
 * voice fades (~0.2s in `startDrone` stop). Bed identities stay in `BGM_BEDS`.
 */
export const BGM_MAP_TRANSITION = {
  /** New bed fades in over this many seconds. */
  fadeInSec: 0.4,
  /** Start new bed at this fraction of target gain (quieter restart). */
  quietStartGainFactor: 0.28,
} as const;

/**
 * Brief map-bed identity stinger on free-travel arrive (PL120.1).
 * Soft two-note rooted on the destination bed so City/Land/Explore/Arena
 * read apart — complements travel SFX (PL11.2); bed recipes stay in `BGM_BEDS`.
 */
export const BGM_ARRIVE_IDENTITY_STINGER = {
  /** Soft peak gain — readable over the quiet drone, not a music suite. */
  gain: 0.045,
  /** Second partial gain (slightly quieter). */
  partialGain: 0.032,
  /** Root note duration. */
  rootDurationSec: 0.09,
  /** Fifth / partial duration. */
  partialDurationSec: 0.11,
  /** Interval above bed fundamental (perfect fifth). */
  intervalRatio: 1.5,
} as const;

/**
 * Tone steps for a brief destination-bed identity stinger (PL120.1).
 * Uses the map bed's fundamental + oscillator type so arrive reads the new bed.
 *
 * @param kind - Destination land kind after free travel.
 * @returns Soft two-note recipe rooted on `BGM_BEDS`.
 */
export function bgmArriveIdentityStingerSteps(
  kind: string | null | undefined,
): ToneStep[] {
  const bed = bgmBedFor(kind);
  const { gain, partialGain, rootDurationSec, partialDurationSec, intervalRatio } =
    BGM_ARRIVE_IDENTITY_STINGER;
  return [
    {
      freq: bed.freq,
      durationSec: rootDurationSec,
      gain,
      type: bed.type,
    },
    {
      freq: bed.freq * intervalRatio,
      durationSec: partialDurationSec,
      gain: partialGain,
      type: bed.type,
    },
  ];
}

/**
 * Whether free-travel arrive should play the bed-identity stinger (PL120.1).
 * Same-map / refuse / mute stay quiet; visit swaps are not free-travel arrives.
 *
 * @param travelOk - True when travel API succeeded.
 * @param prevKind - Map before travel.
 * @param nextKind - Map after travel.
 * @param muted - Client mute flag.
 * @returns True when the brief stinger should play.
 */
export function shouldPlayBgmArriveIdentityStinger(
  travelOk: boolean,
  prevKind: string | null | undefined,
  nextKind: string | null | undefined,
  muted: boolean,
): boolean {
  if (!travelOk || muted) return false;
  const prev = (prevKind ? normalizeLandKind(prevKind) : null) ?? "player_land";
  const next = (nextKind ? normalizeLandKind(nextKind) : null) ?? "player_land";
  return prev !== next;
}

export interface StartDroneOptions {
  /** Soft fade-in duration (PL51.1 map swap). */
  fadeInSec?: number;
  /** Initial gain as a fraction of target (PL51.1 quieter restart). */
  quietStartGainFactor?: number;
}

/**
 * Whether a landKind / visit map bed change should soft-crossfade (PL51.1).
 * Mute and same-bed no-ops stay silent / unchanged.
 *
 * @param prevKind - Bed before the swap.
 * @param nextKind - Bed after the swap.
 * @param bgmWanted - Player wants ambient BGM running.
 * @param muted - Client mute flag.
 * @returns True when the controller should quieter-restart into `nextKind`.
 */
export function shouldSoftBgmMapTransition(
  prevKind: CanonicalLandKind,
  nextKind: CanonicalLandKind,
  bgmWanted: boolean,
  muted: boolean,
): boolean {
  if (!bgmWanted || muted) return false;
  return prevKind !== nextKind;
}

/**
 * Returns false when muted or id unknown — used by play path and tests.
 */
export function shouldPlaySfx(
  muted: boolean,
  id: string,
): id is SfxId {
  if (muted) return false;
  return id in SFX_PRESETS;
}

/**
 * Looks up a cue recipe (empty when unknown).
 */
export function sfxStepsFor(id: string): ToneStep[] {
  if (!(id in SFX_PRESETS)) return [];
  return SFX_PRESETS[id as SfxId];
}

/**
 * Travel confirm SFX for a destination map (PL11.2).
 * Warrior uses a darker square-led variant; other maps keep the default travel cue.
 *
 * @param kind - Destination land kind (or null/unknown → default travel).
 * @returns Sfx id to play on successful free travel.
 */
export function travelSfxFor(
  kind: CanonicalLandKind | string | null | undefined,
): SfxId {
  const normalized = kind ? normalizeLandKind(String(kind)) : null;
  return normalized === "warrior" ? "travel_warrior" : "travel";
}

/**
 * Whether an action-failure message should play the soft refuse tone (PL16.1 / PL21.2 / PL54).
 * Busy / energy / already-here / required-tool / too-far / coins / materials refuses —
 * other errors stay silent so the cue does not become arcade spam.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the quiet refuse SFX should play.
 */
export function isSoftRefuseError(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  return (
    error === ACTION_ERROR.stationBusy ||
    error === ACTION_ERROR.craftAlreadyStarted ||
    error === ACTION_ERROR.craftNone ||
    error === ACTION_ERROR.craftNotYours ||
    error === ACTION_ERROR.craftNotReady ||
    error === ACTION_ERROR.notEnoughEnergy ||
    error === ACTION_ERROR.travelAlreadyHere ||
    error === ACTION_ERROR.needHammer ||
    error === ACTION_ERROR.needHammerBroken ||
    error === ACTION_ERROR.cropNotReady ||
    error === ACTION_ERROR.plotNotEmpty ||
    error === ACTION_ERROR.oreNodeCooldown ||
    error === ACTION_ERROR.woodStumpCooldown ||
    error === ACTION_ERROR.fishingDockCooldown ||
    error === ACTION_ERROR.animalPenCooldown ||
    error === ACTION_ERROR.huntCooldown ||
    error === ACTION_ERROR.missingSeed ||
    error === ACTION_ERROR.noBread ||
    error === ACTION_ERROR.noFood ||
    error === ACTION_ERROR.buildBoardMissing ||
    error === ACTION_ERROR.buildBoardPickupOnly ||
    error === ACTION_ERROR.buildCellOccupied ||
    error === ACTION_ERROR.buildCellOutOfBounds ||
    error === ACTION_ERROR.needStationKit ||
    error === ACTION_ERROR.placeKitPlayerLandOnly ||
    error === ACTION_ERROR.pickupNotStation ||
    error === ACTION_ERROR.pickupLandStock ||
    error === ACTION_ERROR.unknownKit ||
    error === ACTION_ERROR.toolAlreadyRepaired ||
    error === ACTION_ERROR.decorAlreadyPlaced ||
    error === ACTION_ERROR.questNotReady ||
    error === ACTION_ERROR.questLocked ||
    error === ACTION_ERROR.questAlreadyClaimed ||
    error === ACTION_ERROR.vendorWontBuy ||
    error === ACTION_ERROR.vendorWontSell ||
    error === ACTION_ERROR.claimNeedGuild ||
    error === ACTION_ERROR.claimHeldByOther ||
    error === ACTION_ERROR.claimNothingStored ||
    error === ACTION_ERROR.claimWarAlreadyOpen ||
    error === ACTION_ERROR.claimWarNeedMats ||
    error === ACTION_ERROR.claimWarNotOpen ||
    error === ACTION_ERROR.marketOwnListing ||
    error === ACTION_ERROR.marketExpired ||
    error === ACTION_ERROR.mailSelf ||
    error === ACTION_ERROR.mailInboxFull ||
    // Reason: PL85.1 — travelInProgress embeds remaining seconds.
    /^Your caravan is still on the road \(\d+s left\)\.$/.test(error) ||
    error === ACTION_ERROR.tradeSelf ||
    error === ACTION_ERROR.tradeEmpty ||
    error === ACTION_ERROR.tradePlayerMissing ||
    error === ACTION_ERROR.tradeNotFound ||
    error === ACTION_ERROR.tradeNotYours ||
    error === ACTION_ERROR.tradeOnlyRecipient ||
    error === ACTION_ERROR.tradeYouBroke ||
    error === ACTION_ERROR.tradeSenderBroke ||
    error === ACTION_ERROR.tradeYouMissingItems ||
    error === ACTION_ERROR.tradeSenderMissingItems ||
    error === ACTION_ERROR.mailEmpty ||
    error === ACTION_ERROR.mailPlayerMissing ||
    error === ACTION_ERROR.mailAlreadyClaimed ||
    error === ACTION_ERROR.marketNotFound ||
    error === ACTION_ERROR.marketNotYours ||
    error === ACTION_ERROR.guildInviteInvalid ||
    error === ACTION_ERROR.guildNameInvalid ||
    error === ACTION_ERROR.mailNotFound ||
    error === ACTION_ERROR.mailOnlyRecipient ||
    error === ACTION_ERROR.mailOnlySender ||
    // Reason: PL97.1 — marketNeedFee embeds fee; also matched by needCoins "to" regex below.
    error === ACTION_ERROR.marketNotStackable ||
    error === ACTION_ERROR.guildBankFull ||
    error === ACTION_ERROR.guildBankEmpty ||
    error === ACTION_ERROR.guildRankForbidden ||
    error === ACTION_ERROR.guildInviteForbidden ||
    error === ACTION_ERROR.huntExploreOnly ||
    error === ACTION_ERROR.warriorTrainingHomesteadForbidden ||
    error === ACTION_ERROR.notATool ||
    error === ACTION_ERROR.oreNodeMissing ||
    error === ACTION_ERROR.woodStumpMissing ||
    error === ACTION_ERROR.fishingDockMissing ||
    error === ACTION_ERROR.animalPenMissing ||
    error === ACTION_ERROR.plotMissing ||
    error === ACTION_ERROR.huntMissing ||
    error === ACTION_ERROR.claimNodeMissing ||
    error === ACTION_ERROR.guildBankNotStackable ||
    error === ACTION_ERROR.guildBankUnknownItem ||
    error === ACTION_ERROR.guildBankBadQty ||
    error === ACTION_ERROR.mailNotStackable ||
    error === ACTION_ERROR.marketInvalid ||
    error === ACTION_ERROR.invalidQty ||
    error === ACTION_ERROR.unknownRecipe ||
    // Reason: PL104.2 — needsStation embeds station name.
    /^You need a .+ on your land to craft that\.$/.test(error) ||
    // Reason: PL104.3 — needsXp embeds need + profession.
    /^You need \d+ .+ XP first\. Keep practicing or specialize\.$/.test(
      error,
    ) ||
    error === ACTION_ERROR.decorPadMissing ||
    error === ACTION_ERROR.decorStarterOnly ||
    error === ACTION_ERROR.noExpandSlots ||
    error === ACTION_ERROR.unknownDecor ||
    // Reason: PL106.2 — needCoinsDecor embeds price (distinct from needCoins* "to" forms).
    /^You need \d+ coins for that decor/.test(error) ||
    error === ACTION_ERROR.unknownSeed ||
    error === ACTION_ERROR.cropMissing ||
    error === ACTION_ERROR.itemMissing ||
    error === ACTION_ERROR.unknownStation ||
    error === ACTION_ERROR.guildNotFound ||
    error === ACTION_ERROR.guildTargetMissing ||
    error === ACTION_ERROR.guildRankInvalid ||
    error === ACTION_ERROR.questUnknown ||
    // Reason: PL110.2 — missingItem(name) is `You need ${Title Case}.`; carve out other You-need*.
    (/^You need [A-Z].+\.$/.test(error) &&
      !/^You need \d+/.test(error) &&
      !/^You need a .+ on your land to craft that\.$/.test(error) &&
      error !== ACTION_ERROR.missingSeed) ||
    error === ACTION_ERROR.deedMissing ||
    error === ACTION_ERROR.deedNotYours ||
    error === ACTION_ERROR.deedNeedMint ||
    error === ACTION_ERROR.deedAlreadyMinted ||
    error === ACTION_ERROR.deedAlreadyListed ||
    error === ACTION_ERROR.deedNotListed ||
    error === ACTION_ERROR.deedBadPrice ||
    error === ACTION_ERROR.deedAlreadyOwned ||
    error === ACTION_ERROR.deedNeedForest ||
    error === ACTION_ERROR.walletAlreadyLinked ||
    error === ACTION_ERROR.walletNotLinked ||
    error === ACTION_ERROR.guildAlreadyIn ||
    error === ACTION_ERROR.guildNotIn ||
    error === ACTION_ERROR.guildExists ||
    error === ACTION_ERROR.claimWarNeedGuild ||
    error === ACTION_ERROR.buildPlayerLandOnly ||
    error === ACTION_ERROR.alreadyUpgraded ||
    error === ACTION_ERROR.cannotUpgradeBuilding ||
    // Reason: PL90.1 — needCoinsTravel embeds fare (distinct from needCoins* "to" forms).
    /^You need \d+ coins for the caravan/.test(error) ||
    error === ACTION_ERROR.tooFar ||
    error === ACTION_ERROR.notEnoughCoins ||
    error === ACTION_ERROR.missingMaterials ||
    error === ACTION_ERROR.notEnoughItems ||
    // Reason: PL54.2 / PL54.3 — dynamic needCoins* / needMats* templates.
    /^You need \d+ coins to /.test(error) ||
    /^You need \d+× .+ to /.test(error)
  );
}

export interface TonePlayer {
  playSteps: (steps: ToneStep[]) => void;
  startDrone: (
    freq: number,
    gain: number,
    type: OscillatorType,
    opts?: StartDroneOptions,
  ) => () => void;
}

/**
 * Browser Web Audio sink. Safe no-op when AudioContext is unavailable.
 */
export function createWebAudioPlayer(): TonePlayer {
  let ctx: AudioContext | null = null;

  function ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }

  return {
    playSteps(steps) {
      const audio = ensureCtx();
      if (!audio) return;
      let t = audio.currentTime;
      for (const step of steps) {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = step.type ?? "sine";
        osc.frequency.value = step.freq;
        gain.gain.value = step.gain;
        gain.gain.setValueAtTime(step.gain, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + step.durationSec);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(t);
        osc.stop(t + step.durationSec + 0.02);
        t += step.durationSec * 0.85;
      }
    },
    startDrone(freq, gainLevel, type, opts) {
      const audio = ensureCtx();
      if (!audio) return () => undefined;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const fadeInSec = opts?.fadeInSec ?? 0;
      const quietFactor = opts?.quietStartGainFactor ?? 1;
      // Reason: PL51.1 — quieter restart into the new map bed (old still fading).
      if (fadeInSec > 0 && quietFactor < 1) {
        const startG = Math.max(0.0001, gainLevel * quietFactor);
        gain.gain.value = startG;
        gain.gain.setValueAtTime(startG, audio.currentTime);
        gain.gain.linearRampToValueAtTime(
          gainLevel,
          audio.currentTime + fadeInSec,
        );
      } else {
        gain.gain.value = gainLevel;
      }
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      return () => {
        try {
          gain.gain.cancelScheduledValues(audio.currentTime);
          gain.gain.setValueAtTime(
            Math.max(0.0001, gain.gain.value),
            audio.currentTime,
          );
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime + 0.2,
          );
          osc.stop(audio.currentTime + 0.25);
        } catch {
          try {
            osc.stop();
          } catch {
            /* already stopped */
          }
        }
      };
    },
  };
}

export interface GameAudioController {
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
  playSfx: (id: string) => boolean;
  /** Soft BGM map tint (city / land / explore / warrior). */
  setBgmLandKind: (kind: string | null | undefined) => void;
  getBgmLandKind: () => CanonicalLandKind;
  /** Which looping MP3 is selected for the current map. */
  getBgmMusicTrack: () => BgmMusicTrackId;
  startBgm: () => void;
  stopBgm: () => void;
  /** Brief destination-bed identity stinger on free-travel arrive (PL120.1). */
  playBgmArriveIdentityStinger: (kind: string | null | undefined) => boolean;
}

/**
 * Starts primary (+ optional partial) drone voices for a bed; returns combined stop.
 *
 * @param player - Tone sink.
 * @param bed - Map bed recipe (identities unchanged).
 * @param soft - When set, quieter restart / brief fade-in (PL51.1).
 */
function startBedVoices(
  player: TonePlayer,
  bed: BgmBed,
  soft?: StartDroneOptions,
): () => void {
  const stops: Array<() => void> = [
    player.startDrone(bed.freq, bed.gain, bed.type, soft),
  ];
  if (bed.partial) {
    stops.push(
      player.startDrone(
        bed.partial.freq,
        bed.partial.gain,
        bed.partial.type,
        soft,
      ),
    );
  }
  return () => {
    for (const stop of stops) stop();
  };
}

/**
 * Mute-aware SFX + looping map-music controller.
 *
 * @param player - Web Audio sink for SFX / arrive stingers.
 * @param music - Looping MP3 sink (HTMLAudio in the browser; mock in tests).
 */
export function createGameAudio(
  player: TonePlayer = createWebAudioPlayer(),
  music: MusicPlayer = createHtmlMusicPlayer(),
): GameAudioController {
  let muted = false;
  let mapKind: CanonicalLandKind = "player_land";
  let stopMusic: (() => void) | null = null;
  let bgmWanted = false;

  function haltMusic() {
    if (stopMusic) {
      stopMusic();
      stopMusic = null;
    }
  }

  function startCurrentTrack(soft: boolean) {
    const trackId = bgmMusicTrackFor(mapKind);
    const track = BGM_MUSIC_TRACKS[trackId];
    stopMusic = music.playLoop(
      track.src,
      track.volume,
      soft
        ? {
            fadeInSec: BGM_MUSIC_TRANSITION.fadeInSec,
            startVolumeFactor: BGM_MUSIC_TRANSITION.quietStartGainFactor,
          }
        : undefined,
    );
  }

  function startBgm() {
    bgmWanted = true;
    if (muted) return;
    // Reason: cold start / unmute stay full-gain; land/city/wilds swaps fade elsewhere.
    if (stopMusic) return;
    startCurrentTrack(false);
  }

  function softRestartMusic() {
    haltMusic();
    startCurrentTrack(true);
  }

  return {
    setMuted(next) {
      muted = next;
      if (muted) haltMusic();
      else if (bgmWanted) startBgm();
    },
    isMuted: () => muted,
    playSfx(id) {
      if (!shouldPlaySfx(muted, id)) return false;
      player.playSteps(sfxStepsFor(id));
      return true;
    },
    setBgmLandKind(kind) {
      const next = (kind ? normalizeLandKind(kind) : null) ?? "player_land";
      if (next === mapKind) return;
      const prev = mapKind;
      mapKind = next;
      if (shouldSwapBgmMusicTrack(prev, next, bgmWanted, muted)) {
        softRestartMusic();
      }
    },
    getBgmLandKind: () => mapKind,
    getBgmMusicTrack: () => bgmMusicTrackFor(mapKind),
    startBgm,
    stopBgm() {
      bgmWanted = false;
      haltMusic();
    },
    playBgmArriveIdentityStinger(kind) {
      if (muted) return false;
      const steps = bgmArriveIdentityStingerSteps(kind);
      if (steps.length === 0) return false;
      player.playSteps(steps);
      return true;
    },
  };
}
