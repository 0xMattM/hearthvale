/**
 * Visual cue configs part 8/30 (RF6.4) — split from catalog.ts.
 */

  import { sinePulseEnvelope } from "./visual-cue-math.js";
import {
  CanonicalLandKind,
  LAND_DESTINATIONS,
  LandKind,
  cssHexRgbDistance,
  isPlayerLandStationType,
  isWarriorLandKind,
  mapIdentityForLandKind,
  normalizeLandKind
} from "./catalog-buildings.js";
import { ItemId } from "./catalog-items.js";
import { PORTAL_WORLD_SOFT, PORTAL_WORLD_SOFT_WARRIOR } from "./catalog-cues-04.js";
import { CLAIM_EMPTY_LANDMARK_CUE, CLAIM_NODE_CONTEST_SOFT_CUE, CLAIM_NODE_HELD_SOFT_CUE, SOFT_WAR_CONTEST_ATMOSPHERE_CUE, SoftWarContestAtmosphereCueVisual, claimNodeContestSoftCueActive } from "./catalog-cues-07.js";

/**
 * Soft soft-war contest atmosphere leftover fields (PL183.2).
 * Shows while `contestEndsAt` is in the future — same gate as PL146.1 pulse.
 *
 * @param contestEndsAt - From `ClaimNodeDto.contestEndsAt` (ms wall clock).
 * @param nowMs - Current clock ms (e.g. `Date.now()`).
 * @returns Quiet ember mist fields; `show` false when no open contest.
 */
export function softWarContestAtmosphereCue(
  contestEndsAt: number | null | undefined,
  nowMs: number,
): SoftWarContestAtmosphereCueVisual {
  const c = SOFT_WAR_CONTEST_ATMOSPHERE_CUE;
  if (!claimNodeContestSoftCueActive(contestEndsAt, nowMs)) {
    return {
      show: false,
      emissive: c.emissive,
      intensity: 0,
      hazeColor: c.hazeColor,
      hazeOpacity: 0,
      hazeRadius: c.hazeRadius,
      hazeY: c.hazeY,
    };
  }
  return {
    show: true,
    emissive: c.emissive,
    intensity: c.intensityBase,
    hazeColor: c.hazeColor,
    hazeOpacity: c.hazeOpacityBase,
    hazeRadius: c.hazeRadius,
    hazeY: c.hazeY,
  };
}

/**
 * Soft sine envelope for soft-war contest atmosphere leftover (PL183.2).
 *
 * @param nowMs - Clock ms (e.g. `performance.now()`).
 * @returns Envelope in [0, 1].
 */
export function softWarContestAtmospherePulseEnvelope(nowMs: number): number {
  const period = SOFT_WAR_CONTEST_ATMOSPHERE_CUE.pulsePeriodMs;
  if (!(period > 0) || !Number.isFinite(nowMs)) return 0;
  return sinePulseEnvelope(nowMs, period);
}

/**
 * Mist emissive intensity for the soft-war contest atmosphere leftover (PL183.2).
 *
 * @param pulseEnvelope - 0..1 from `softWarContestAtmospherePulseEnvelope`.
 * @returns Emissive intensity for the leftover mist disc.
 */
export function softWarContestAtmosphereEmissiveIntensity(
  pulseEnvelope: number,
): number {
  const { intensityBase, intensityPeak } = SOFT_WAR_CONTEST_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return intensityBase + e * (intensityPeak - intensityBase);
}

/**
 * Soft leftover mist opacity while a soft-war contest is open (PL183.2).
 *
 * @param pulseEnvelope - 0..1 from `softWarContestAtmospherePulseEnvelope`.
 * @returns Opacity for the leftover mist disc.
 */
export function softWarContestAtmosphereHazeOpacity(
  pulseEnvelope: number,
): number {
  const { hazeOpacityBase, hazeOpacityPeak } = SOFT_WAR_CONTEST_ATMOSPHERE_CUE;
  const e = Math.min(1, Math.max(0, pulseEnvelope));
  return hazeOpacityBase + e * (hazeOpacityPeak - hazeOpacityBase);
}

/**
 * RGB distance between contest atmosphere mist and contest beacon ember (PL183.2).
 *
 * @returns Soft distinct ember so zone mist ≠ beacon pulse alone.
 */
export function softWarContestAtmosphereVsBeaconContrast(): number {
  return cssHexRgbDistance(
    SOFT_WAR_CONTEST_ATMOSPHERE_CUE.emissive,
    CLAIM_NODE_CONTEST_SOFT_CUE.emissive,
  );
}

/**
 * RGB distance between contest atmosphere mist and empty grove landmark (PL183.2).
 *
 * @returns Soft distinct ember so contest mist ≠ empty grove alone.
 */
export function softWarContestAtmosphereVsEmptyContrast(): number {
  return cssHexRgbDistance(
    SOFT_WAR_CONTEST_ATMOSPHERE_CUE.emissive,
    CLAIM_EMPTY_LANDMARK_CUE.emissive,
  );
}

/**
 * RGB distance between contest atmosphere mist and tip gold (PL183.2).
 *
 * @returns Soft distinct ember so contest mist ≠ first walk-up tip alone.
 */
export function softWarContestAtmosphereVsTipContrast(): number {
  return cssHexRgbDistance(
    SOFT_WAR_CONTEST_ATMOSPHERE_CUE.emissive,
    CLAIM_NODE_HELD_SOFT_CUE.tipEmissive,
  );
}

/**
 * Soft world tip on first notice board proximity (PL70.2).
 * One-shot with ephemeral TopBar; tip / mail rules unchanged.
 */
export const NOTICE_BOARD_FIRST_WALKUP_WORLD_TIP = "Read · E";

/**
 * Soft world tip copy for first notice board walk-up (PL70.2).
 *
 * @returns Short Html secondary line (read interact hint).
 */
export function noticeBoardFirstWalkUpWorldTip(): string {
  return NOTICE_BOARD_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first expand-pad proximity (PL72.1).
 * One-shot with ephemeral TopBar; expand costs unchanged.
 */
export const EXPAND_PAD_FIRST_WALKUP_WORLD_TIP = "Expand · E";

/**
 * Soft world tip copy for first expand-pad walk-up (PL72.1).
 *
 * @returns Short Html secondary line (expand interact hint).
 */
export function expandPadFirstWalkUpWorldTip(): string {
  return EXPAND_PAD_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first housing decor-pad proximity (PL75.1).
 * One-shot with ephemeral TopBar; decor costs unchanged.
 */
export const DECOR_PAD_FIRST_WALKUP_WORLD_TIP = "Place · E";

/**
 * Soft world tip copy for first decor-pad walk-up (PL75.1).
 *
 * @returns Short Html secondary line (place interact hint).
 */
export function decorPadFirstWalkUpWorldTip(): string {
  return DECOR_PAD_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first tutorial NPC proximity (PL76.2).
 * One-shot with ephemeral TopBar; tutor XP / claim rules unchanged.
 */
export const TUTOR_FIRST_WALKUP_WORLD_TIP = "Talk · E";

/**
 * Soft world tip copy for first tutor walk-up (PL76.2).
 *
 * @returns Short Html secondary line (talk interact hint).
 */
export function tutorFirstWalkUpWorldTip(): string {
  return TUTOR_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Name-first floating label for a portal mesh (PL37.1).
 * Circuit role word from map identity; soft fare-free line (complements PL5.1 / PL14.2).
 *
 * @param landKind - Active map where the portal stands.
 * @returns Bold-name + soft detail parts for world Html.
 */
export function portalWorldLabelParts(landKind?: string | null): {
  name: string;
  soft: string;
} {
  const id = mapIdentityForLandKind(landKind);
  if (landKind && isWarriorLandKind(landKind)) {
    return { name: id.word, soft: PORTAL_WORLD_SOFT_WARRIOR };
  }
  return { name: id.word, soft: PORTAL_WORLD_SOFT };
}

/** Suffix for the current map row in TravelPanel (PL5.2). */
export const TRAVEL_YOU_ARE_HERE = "Here";

/**
 * Whether TravelPanel should emphasize a destination blurb (PL11.2).
 * Warrior alone gets stronger optional-path emphasis; other maps stay quiet.
 *
 * @param kind - Destination land kind.
 * @returns True when the row should use emphasis chrome.
 */
export function isTravelDestinationBlurbEmphasized(
  kind: CanonicalLandKind | string,
): boolean {
  return isWarriorLandKind(String(kind));
}

/**
 * Whether a travel destination is the player's current map (PL5.2).
 *
 * @param destKind - Destination kind from LAND_DESTINATIONS.
 * @param currentKind - Active land kind (may be legacy alias).
 * @returns True when the destination is already current.
 */
export function isTravelDestinationHere(
  destKind: CanonicalLandKind,
  currentKind: LandKind | CanonicalLandKind | string | null | undefined,
): boolean {
  if (currentKind == null || currentKind === "") return false;
  const here = normalizeLandKind(String(currentKind)) ?? currentKind;
  return destKind === here;
}

/**
 * Button / strip label for a travel destination (PL5.2).
 * Compact: destination name only; Here badge when current (no fare copy).
 *
 * @param destName - Display name from LAND_DESTINATIONS.
 * @param isHere - Whether this is the current map.
 * @returns Name, with here badge when current.
 */
export function travelDestinationActionLabel(
  destName: string,
  isHere: boolean,
): string {
  return isHere ? `${destName} · ${TRAVEL_YOU_ARE_HERE}` : destName;
}

/**
 * TravelPanel free-travel destination name for Arrived · whisper (PL115.2).
 * SoT = `LAND_DESTINATIONS.name` (not map-chip short words; no caravan invent).
 *
 * @param kind - Destination land kind (may be legacy alias).
 * @returns Panel name (City / Your Land / Exploration / Warrior Arena), or null.
 */
export function travelArriveDestinationLabel(
  kind: CanonicalLandKind | string | null | undefined,
): string | null {
  if (kind == null || kind === "") return null;
  const n = normalizeLandKind(String(kind));
  if (!n) return null;
  return LAND_DESTINATIONS.find((d) => d.kind === n)?.name ?? null;
}

/**
 * Whether successful free travel should flash the one-shot Arrived cue (PL115.2).
 * True only on ok arrive; refuse / already-here / failed travel stay quiet.
 * Complements PL6.2 ephemeral; first-map walk-up tips may replace Arrived.
 *
 * @param ok - Whether the travel API / apply succeeded.
 * @returns True when Arrived · dest should flash (caller may still prefer walk-up tips).
 */
export function shouldFlashTravelArriveCue(ok: boolean): boolean {
  return ok === true;
}

/**
 * Legacy caravan constants (F11.2). CityLands map travel is free/instant (CL1.2);
 * these remain for Travel Ration recipes / Content Lock history only.
 */
export const TRAVEL = {
  /** Legacy road time — not used for CityLands free travel. */
  durationMs: 45_000,
  /** Legacy soft-currency fare — not charged for CityLands free travel. */
  coinCost: 15,
  /** Optional mat formerly used as fare; still craftable. */
  rationItemId: "travel_ration" as ItemId,
} as const;

/**
 * Compact circuit string for travel UI (CL7.1).
 *
 * @returns Destination names joined with ↔.
 */
export function formatFreeTravelCircuit(): string {
  return LAND_DESTINATIONS.map((d) => d.name).join(" ↔ ");
}

/**
 * First-session onboarding tip: City is the shared hub (CL12.1).
 * Default spawn may still be empty player_land — tip points players to City.
 *
 * @returns One-line dismissible tip copy (not an always-on HUD column).
 */
export function cityHubFirstSessionTip(): string {
  return "City is the shared hub — tutorials, market, scarce stations. Your Land starts empty · press N or a Portal to travel.";
}

/**
 * One-shot welcome: talk to the Governor near City Hall (first session).
 * Complements city_hub; dismissible; not an always-on HUD column.
 *
 * @returns One-line welcome copy pointing at the Governor.
 */
export function welcomeMayorFirstSessionTip(): string {
  return "Welcome! Talk to the Governor in front of City Hall — he's a few steps from where you arrive in the City (N / Portal).";
}

/**
 * First free-travel tip after city hub / first portal (PL13.1).
 * One-shot dismissible; four maps · fare-free · N opens travel — not an always-on HUD column.
 *
 * @returns One-line tip copy.
 */
export function firstFreeTravelTip(): string {
  return `Four maps · fare-free · press N to open travel (or a Portal): ${formatFreeTravelCircuit()}.`;
}

/**
 * Empty player land is intentional — build via P land editor or travel to City (CL16.1).
 * Used by land-editor panel copy and one-shot onboarding; not an always-on HUD column.
 *
 * @returns One-line tip copy.
 */
export function emptyLandBuildBoardTip(): string {
  return "Empty land is intentional — craft station kits at a Workshop, then press P to place from your bag, move, or pick up stations. City is N / Portal.";
}

/** Full world label on the build board when the yard has no stations (PL3.1). */
export const EMPTY_LAND_BUILD_BEACON_LABEL = "Build here · empty land";

/** Soft world label after the first placed station (PL3.1). */
export const EMPTY_LAND_BUILD_SOFT_LABEL = "Build";

/** Beacon intensity for the player-land build board (PL3.1). */
export type EmptyLandBuildBeaconMode = "beacon" | "soft";

/**
 * Empty-land build board beacon mode (PL3.1).
 * Fresh yard (board/markers only) → full beacon; after any placeable station → soft.
 *
 * @param buildings - Buildings on the active land.
 * @returns `beacon` when empty of stations; `soft` once at least one is placed.
 */
export function emptyLandBuildBeaconMode(
  buildings: ReadonlyArray<{ type: string }>,

): EmptyLandBuildBeaconMode {
  const hasStation = buildings.some((b) => isPlayerLandStationType(b.type));
  return hasStation ? "soft" : "beacon";
}

/**
 * True when the next placeable station place is the homestead's first (PL25.2).
 * Same empty-yard gate as PL3.1 beacon / PL22.1 lived atmosphere.
 *
 * @param buildings - Buildings on the active land before place.
 * @returns True when the yard still has no placeable stations.
 */
export function isFirstHomesteadStationPlace(
  buildings: ReadonlyArray<{ type: string }>,

): boolean {
  return emptyLandBuildBeaconMode(buildings) === "beacon";
}

/**
 * World-label copy for the build board beacon (PL3.1).
 *
 * @param mode - Beacon intensity from `emptyLandBuildBeaconMode`.
 * @returns Player-facing floating label.
 */
export function emptyLandBuildBeaconWorldLabel(
  mode: EmptyLandBuildBeaconMode,
): string {
  return mode === "beacon"
    ? EMPTY_LAND_BUILD_BEACON_LABEL
    : EMPTY_LAND_BUILD_SOFT_LABEL;
}

/**
 * Homestead yard floor palette (PL22.1 / PL114.1).
 * Empty yard: warmer outer meadow + readable fence vs Explore cool canopy (PL36.2);
 * plot stays quieter than lived until first station (PL22.1).
 * Complements PL3.1 beacon (beacon still on empty; soft board after place).
 * PL51.2: visit presence uses a quieter cool guest tint vs warm home yard.
 */
export const HOMESTEAD_YARD_VISUAL = {
  /** Lived / default outer meadow (after first station). */
  meadowColor: "#4d6b3f",
  empty: {
    /** Warmer sunlit outer meadow — empty land ≠ Explore canopy (PL114.1). */
    meadowColor: "#628848",
    plotColor: "#5a7a48",
    pathColor: "#6b5538",
    /** Warmer fence wood so empty-yard boundary reads (PL114.1). */
    fencePostColor: "#8a6040",
    fenceRailColor: "#9a7050",
  },
  lived: {
    plotColor: "#7c9240",
    pathColor: "#8a6e42",
    /** Quiet warm pad under the yard cross — atmosphere only. */
    padColor: "#9a8050",
    fencePostColor: "#5c4330",
    fenceRailColor: "#6a4e36",
  },
  /** Quiet cool guest atmosphere when visiting another player's land (PL51.2). */
  visit: {
    meadowColor: "#3d5e58",
    empty: {
      plotColor: "#4a6e62",
      pathColor: "#5a5e52",
    },
    lived: {
      plotColor: "#5a7a6a",
      pathColor: "#6a6e58",
      padColor: "#6e7a68",
    },
    hazeColor: "#1e3038",
    hazeOpacity: 0.14,
    fencePostColor: "#4a524c",
    fenceRailColor: "#556058",
  },
} as const;

/** Homestead yard atmosphere after empty-land beacon softens (PL22.1). */
export type HomesteadYardAtmosphereMode = "empty" | "lived";

/** Home yard vs visiting another player's land (PL51.2). */
export type HomesteadYardPresence = "home" | "visit";

/**
 * Built-yard atmosphere mode (PL22.1) — same station gate as PL3.1 beacon.
 *
 * @param buildings - Buildings on the active player land.
 * @returns `empty` until first placeable station; `lived` after.
 */
export function homesteadYardAtmosphereMode(
  buildings: ReadonlyArray<{ type: string }>,

): HomesteadYardAtmosphereMode {
  return emptyLandBuildBeaconMode(buildings) === "soft" ? "lived" : "empty";
}
