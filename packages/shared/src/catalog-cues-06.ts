/**
 * Visual cue configs part 6/30 (RF6.4) — split from catalog.ts.
 */


/**
 * Soft world tip on first arena plaque proximity (PL45.2).
 * One-shot with ephemeral TopBar; optional path; free enter/exit.
 */
export const ARENA_FIRST_WALKUP_WORLD_TIP = "Optional · E";

/**
 * Soft world tip copy for first arena walk-up (PL45.2).
 *
 * @returns Short Html secondary line (optional path interact hint).
 */
export function arenaFirstWalkUpWorldTip(): string {
  return ARENA_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first empty-land build-board proximity (PL52.1).
 * One-shot with ephemeral TopBar; complements PL3.1 beacon; place costs unchanged.
 */
export const EMPTY_LAND_BUILD_FIRST_WALKUP_WORLD_TIP = "Build · E";

/**
 * Soft world tip copy for first empty-land build-board walk-up (PL52.1).
 *
 * @returns Short Html secondary line (place stations interact hint).
 */
export function emptyLandBuildFirstWalkUpWorldTip(): string {
  return EMPTY_LAND_BUILD_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first visit to another player's land (PL53.1).
 * One-shot with ephemeral TopBar; complements cool visit tint; trade hotkey unchanged.
 */
export const VISIT_LAND_FIRST_WALKUP_WORLD_TIP = "Trade · T";

/**
 * Soft world tip copy for first visit land walk-up (PL53.1).
 *
 * @returns Short Html / banner secondary line (trade interact hint).
 */
export function visitLandFirstWalkUpWorldTip(): string {
  return VISIT_LAND_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip when leaving a visit back to own land (PL114.2).
 * Complements PL27.1 `Home` ephemeral; four-map / visit loop readability; min HUD.
 */
export const VISIT_HOME_RETURN_WORLD_TIP = "Your land";

/**
 * Soft world tip copy when returning home from a visit (PL114.2).
 *
 * @returns Short TopBar secondary line under identity.
 */
export function visitHomeReturnWorldTip(): string {
  return VISIT_HOME_RETURN_WORLD_TIP;
}

/**
 * Whether leaving a visit should show the soft home-return world tip (PL114.2).
 * True only when actually leaving a visit; own-land idle stays quiet.
 *
 * @param wasVisiting - True when `visitLand` was set before leave.
 * @returns True when the brief `Your land` tip should show.
 */
export function shouldShowVisitHomeReturnWorldTip(wasVisiting: boolean): boolean {
  return wasVisiting === true;
}

/**
 * Soft host-name world nameplate while visiting another player's land (PL119.2).
 * Complements PL15.1 `Visiting ·` ephemeral — cool guest teal matches PL51.2 / peer
 * silhouette so the visit host stays readable in-world (not a HUD column).
 * Brief arrive reinforce pulse; visit rules / trade hotkey unchanged.
 */
export const VISIT_HOST_NAMEPLATE = {
  nameBorder: "#5a8a9a",
  nameBorderReinforce: "#8ec4d0",
  textColor: "#c8dce0",
  bg: "rgba(16,28,32,0.78)",
  padColor: "#5a8a9a",
  padOpacityBase: 0.22,
  padOpacityPeak: 0.58,
  emissiveIntensityBase: 0.14,
  emissiveIntensityPeak: 0.46,
  /** Brief pad/border reinforce when visit lands (pairs with SUCCESS_CUE_MS). */
  reinforceDurationMs: 1400,
  /** World label height above shed floor. */
  labelY: 2.45,
  padInner: 0.35,
  padOuter: 0.72,
} as const;

/**
 * Clean host username for the visit world nameplate (PL119.2).
 *
 * @param ownerUsername - Host from a successful visit response.
 * @returns Trimmed name, or null when empty (caller stays quiet).
 */
export function visitHostNameplateLabel(
  ownerUsername: string | null | undefined,
): string | null {
  const cleaned = (ownerUsername ?? "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Whether the visit host world nameplate should render (PL119.2).
 * True while visiting with a readable host name; own-land idle stays quiet.
 *
 * @param visiting - True when viewing another player's land.
 * @param ownerUsername - Host username from visit land DTO.
 * @returns True when the soft shed nameplate should show.
 */
export function shouldShowVisitHostNameplate(
  visiting: boolean,
  ownerUsername: string | null | undefined,
): boolean {
  return visiting === true && visitHostNameplateLabel(ownerUsername) !== null;
}

/**
 * Whether a successful visit arrive should start the nameplate reinforce (PL119.2).
 * Own-land / refuse / empty host stay quiet — complements PL15.1 cue gate.
 *
 * @param visitOk - True when visit API returned a land.
 * @param ownerUsername - Host username from the visit response.
 * @returns True when the brief pad/border reinforce should fire.
 */
export function shouldReinforceVisitHostNameplateOnArrive(
  visitOk: boolean,
  ownerUsername: string | null | undefined,
): boolean {
  return visitOk === true && visitHostNameplateLabel(ownerUsername) !== null;
}

/**
 * Soft decay envelope for visit-host nameplate arrive reinforce (PL119.2).
 * Peaks at arrive (1) and reaches 0 at reinforceDurationMs — not a continuous loop.
 *
 * @param elapsedMs - Milliseconds since visit arrive reinforce start.
 * @returns Envelope in [0, 1]; 0 outside the reinforce window.
 */
export function visitHostNameplateReinforceEnvelope(elapsedMs: number): number {
  const { reinforceDurationMs } = VISIT_HOST_NAMEPLATE;
  if (!(elapsedMs >= 0) || elapsedMs >= reinforceDurationMs) return 0;
  const t = elapsedMs / Math.max(1, reinforceDurationMs);
  // Reason: cosine ease-out pairs with scarce Free settle so arrive reads soft, not a strobe.
  return Math.cos((t * Math.PI) / 2);
}

/**
 * Soft pad opacity under the host nameplate (PL119.2).
 * Steady visit uses padOpacityBase; reinforce peaks toward padOpacityPeak.
 *
 * @param reinforceEnvelope - 0..1 from `visitHostNameplateReinforceEnvelope`.
 * @returns Pad opacity between base and peak.
 */
export function visitHostNameplatePadOpacity(reinforceEnvelope: number): number {
  const { padOpacityBase, padOpacityPeak } = VISIT_HOST_NAMEPLATE;
  const e = Math.min(1, Math.max(0, reinforceEnvelope));
  return padOpacityBase + e * (padOpacityPeak - padOpacityBase);
}

/**
 * Soft pad emissive under the host nameplate (PL119.2).
 *
 * @param reinforceEnvelope - 0..1 from `visitHostNameplateReinforceEnvelope`.
 * @returns Emissive intensity between base and peak.
 */
export function visitHostNameplateEmissiveIntensity(
  reinforceEnvelope: number,
): number {
  const { emissiveIntensityBase, emissiveIntensityPeak } = VISIT_HOST_NAMEPLATE;
  const e = Math.min(1, Math.max(0, reinforceEnvelope));
  return (
    emissiveIntensityBase +
    e * (emissiveIntensityPeak - emissiveIntensityBase)
  );
}

/**
 * Nameplate border color — brighter teal during arrive reinforce (PL119.2).
 *
 * @param reinforceEnvelope - 0..1 from `visitHostNameplateReinforceEnvelope`.
 * @returns CSS hex for the Html nameplate border.
 */
export function visitHostNameplateBorderColor(reinforceEnvelope: number): string {
  const { nameBorder, nameBorderReinforce } = VISIT_HOST_NAMEPLATE;
  return reinforceEnvelope > 0.08 ? nameBorderReinforce : nameBorder;
}

/**
 * Soft preferred-partner nameplate when opening trade while visiting (PL123.2).
 * Complements visit host world nameplate (PL119.2) — cool teal kinship so the
 * host stays glanceable as the trade counterparty without inventing HUD columns.
 * Trade rules / T hotkey unchanged; min HUD.
 */
export const TRADE_PREFERRED_PARTNER_NAMEPLATE = {
  /** Soft chip border — matches visit host teal. */
  border: "#5a8a9a",
  borderReinforce: "#8ec4d0",
  textColor: "#c8dce0",
  bg: "rgba(16,28,32,0.82)",
  /** Prefix before host username. */
  prefix: "Host ·",
} as const;

/**
 * Clean preferred trade partner username for the panel nameplate (PL123.2).
 *
 * @param preferredPartner - Visit host username (or null when not visiting).
 * @returns Trimmed name, or null when empty.
 */
export function tradePreferredPartnerNameplateLabel(
  preferredPartner: string | null | undefined,
): string | null {
  const cleaned = (preferredPartner ?? "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Whether the trade preferred-partner nameplate should render (PL123.2).
 * True when opening/using trade with a readable preferred visit host.
 *
 * @param preferredPartner - Visit host username from visit land DTO.
 * @returns True when the soft Host · chip should show.
 */
export function shouldShowTradePreferredPartnerNameplate(
  preferredPartner: string | null | undefined,
): boolean {
  return tradePreferredPartnerNameplateLabel(preferredPartner) !== null;
}

/**
 * Display line for the trade preferred-partner chip (PL123.2).
 *
 * @param preferredPartner - Visit host username.
 * @returns `Host · name`, or null when quiet.
 */
export function tradePreferredPartnerNameplateText(
  preferredPartner: string | null | undefined,
): string | null {
  const name = tradePreferredPartnerNameplateLabel(preferredPartner);
  if (!name) return null;
  return `${TRADE_PREFERRED_PARTNER_NAMEPLATE.prefix} ${name}`;
}

/**
 * Chip border — brighter teal during trade open reinforce (PL123.2).
 *
 * @param reinforce - True while panel open-accent / brief reinforce is active.
 * @returns CSS hex for the nameplate chip border.
 */
export function tradePreferredPartnerNameplateBorder(reinforce: boolean): string {
  const { border, borderReinforce } = TRADE_PREFERRED_PARTNER_NAMEPLATE;
  return reinforce ? borderReinforce : border;
}

/**
 * Soft world tip on first Warrior map presence (PL53.2).
 * One-shot with ephemeral TopBar; complements PL45.2 plaque tip; free enter/exit.
 */
export const WARRIOR_FIRST_MAP_WORLD_TIP = "Optional · free";

/**
 * Soft world tip copy for first Warrior map presence (PL53.2).
 *
 * @returns Short Html line (optional path + free exit cue).
 */
export function warriorFirstMapWorldTip(): string {
  return WARRIOR_FIRST_MAP_WORLD_TIP;
}

/**
 * Soft world tip on first City hub presence (PL57.1).
 * One-shot with ephemeral TopBar; complements sticky city_hub; scarce stations unchanged.
 */
export const CITY_HUB_FIRST_WORLD_TIP = "Scarce · shared";

/**
 * Soft world tip copy for first City hub presence (PL57.1).
 *
 * @returns Short Html line (shared scarce-station cue).
 */
export function cityHubFirstWorldTip(): string {
  return CITY_HUB_FIRST_WORLD_TIP;
}

/**
 * Soft world tip on first market board proximity (PL59.1).
 * One-shot with ephemeral TopBar; complements sticky post_craft_market; fees unchanged.
 */
export const MARKET_FIRST_WALKUP_WORLD_TIP = "List · E";

/**
 * Soft world tip copy for first market board walk-up (PL59.1).
 *
 * @returns Short Html secondary line (list / buy interact hint).
 */
export function marketFirstWalkUpWorldTip(): string {
  return MARKET_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first vendor stall proximity (PL59.2).
 * One-shot with ephemeral TopBar; tools / seeds sink; prices unchanged.
 */
export const VENDOR_FIRST_WALKUP_WORLD_TIP = "Buy · E";

/**
 * Soft world tip copy for first vendor stall walk-up (PL59.2).
 *
 * @returns Short Html secondary line (buy interact hint).
 */
export function vendorFirstWalkUpWorldTip(): string {
  return VENDOR_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first fishing dock proximity (PL66.1).
 * One-shot with ephemeral TopBar; catch rules / cooldown unchanged.
 */
export const FISHING_DOCK_FIRST_WALKUP_WORLD_TIP = "Catch · E";

/**
 * Soft world tip copy for first fishing dock walk-up (PL66.1).
 *
 * @returns Short Html secondary line (cast interact hint).
 */
export function fishingDockFirstWalkUpWorldTip(): string {
  return FISHING_DOCK_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first animal pen proximity (PL66.2).
 * One-shot with ephemeral TopBar; care / collect rules unchanged.
 */
export const ANIMAL_PEN_FIRST_WALKUP_WORLD_TIP = "Care · E";

/**
 * Soft world tip copy for first animal pen walk-up (PL66.2).
 *
 * @returns Short Html secondary line (care interact hint).
 */
export function animalPenFirstWalkUpWorldTip(): string {
  return ANIMAL_PEN_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first tree stump proximity (PL68.1).
 * One-shot with ephemeral TopBar; chop rules / cooldown unchanged.
 */
export const TREE_STUMP_FIRST_WALKUP_WORLD_TIP = "Chop · E";

/**
 * Soft world tip copy for first tree stump walk-up (PL68.1).
 *
 * @returns Short Html secondary line (chop interact hint).
 */
export function treeStumpFirstWalkUpWorldTip(): string {
  return TREE_STUMP_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first ore node proximity (PL68.2).
 * One-shot with ephemeral TopBar; chip / hammer rules unchanged.
 */
export const ORE_NODE_FIRST_WALKUP_WORLD_TIP = "Chip · E";

/**
 * Soft world tip copy for first ore node walk-up (PL68.2).
 *
 * @returns Short Html secondary line (chip interact hint).
 */
export function oreNodeFirstWalkUpWorldTip(): string {
  return ORE_NODE_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first crop plot proximity (PL68.3).
 * One-shot with ephemeral TopBar; plant / harvest rules unchanged.
 */
export const CROP_PLOT_FIRST_WALKUP_WORLD_TIP = "Plant · E";

/**
 * Soft world tip copy for first crop plot walk-up (PL68.3).
 *
 * @returns Short Html secondary line (plant interact hint).
 */
export function cropPlotFirstWalkUpWorldTip(): string {
  return CROP_PLOT_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first game trail / edge thicket proximity (PL68.4).
 * One-shot with ephemeral TopBar; hunt / spawn rates unchanged.
 */
export const HUNT_TRAIL_FIRST_WALKUP_WORLD_TIP = "Hunt · wildlife nearby";

/**
 * Soft world tip copy for first hunt trail walk-up (PL68.4).
 *
 * @returns Short Html secondary line (wildlife nearby; fights auto-start).
 */
export function huntTrailFirstWalkUpWorldTip(): string {
  return HUNT_TRAIL_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first kitchen proximity (PL70.1).
 * One-shot with ephemeral TopBar; craft recipes unchanged.
 */
export const KITCHEN_FIRST_WALKUP_WORLD_TIP = "Cook · E";

/**
 * Soft world tip copy for first kitchen walk-up (PL70.1).
 *
 * @returns Short Html secondary line (cook interact hint).
 */
export function kitchenFirstWalkUpWorldTip(): string {
  return KITCHEN_FIRST_WALKUP_WORLD_TIP;
}

/**
 * Soft world tip on first mill proximity (PL74.1).
 * One-shot with ephemeral TopBar; craft recipes unchanged.
 */
export const MILL_FIRST_WALKUP_WORLD_TIP = "Grind · E";

/**
 * Soft world tip copy for first mill walk-up (PL74.1).
 *
 * @returns Short Html secondary line (grind interact hint).
 */
export function millFirstWalkUpWorldTip(): string {
  return MILL_FIRST_WALKUP_WORLD_TIP;
}
