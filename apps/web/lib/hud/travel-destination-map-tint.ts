/**

 * TravelPanel destination map-tint (PL133.2) + open map accent (PL144.2).

 * Quiet destination-row accents matching TopBar map-chip colors for

 * City / Land / Explore / Arena (complements chip PL14.1, arrive pulse PL40.2,

 * Arrived whisper PL115.2). Fare-free destinations unchanged; Here stays readable.

 * PL144.2: brief open chrome uses the current-map chip accent (kinship with

 * destination rows) instead of the generic workspace green (PL24.3).

 */



import {

  mapIdentityForLandKind,

  type CanonicalLandKind,

} from "@game/shared";



/**

 * Soft destination-row tint strengths (PL133.2).

 * Here rows stay louder than idle destinations so current map remains readable.

 */

export const TRAVEL_DESTINATION_MAP_TINT = {

  /** Idle row left inset / border mix toward map accent. */

  idleBorderMixPct: 45,

  /** Idle row soft fill mix. */

  idleFillMixPct: 10,

  /** Here row fill mix (stronger than idle; still map-tinted). */

  hereFillMixPct: 18,

  /** CSS class on destination buttons. */

  rowClassName: "travel-panel__dest--map-tint",

  /** CSS class when this destination is current (Here). */

  hereClassName: "travel-panel__dest--here",

} as const;



/**

 * Brief Travel open accent keyed to the current-map chip (PL144.2).

 * Complements destination map-tints (PL133.2) + Travel open flash (PL24.3);

 * destinations / fares unchanged; mute ok; min HUD.

 */

export const TRAVEL_PANEL_MAP_OPEN_ACCENT = {

  /** CSS class while the open accent plays. */

  className: "travel-panel--map-open-accent",

  /** CSS custom property carrying the current-map chip accent. */

  cssVar: "--travel-map-accent",

  /** Data attribute for tests / a11y. */

  dataAttr: "data-map-open-accent",

} as const;



/**

 * Map-chip accent for a Travel destination kind (PL133.2).

 * Same palette as TopBar `formatCurrentMapChip` / MAP_IDENTITY.

 *

 * @param kind - Destination land kind (canonical or alias).

 * @returns Hex accent matching the TopBar map chip for that map.

 */

export function travelDestinationMapTintAccent(

  kind: CanonicalLandKind | string | null | undefined,

): string {

  return mapIdentityForLandKind(kind).accent;

}



/**

 * Whether opening Travel should play the map-tint open accent (PL144.2).

 * True only on transition into travel (N / portal / notice / arena).

 *

 * @param previous - Panel before open.

 * @param next - Panel after open.

 * @returns True when Travel just opened and map accent should flash.

 */

export function shouldPlayTravelMapOpenAccent(

  previous: string | null,

  next: string | null,

): boolean {

  return previous !== "travel" && next === "travel";

}



/**

 * CSS class for TravelPanel when the map open accent is active (PL144.2).

 *

 * @param openAccent - True during the brief open flash.

 * @returns Class name, or empty when idle.

 */

export function travelPanelMapOpenAccentClassName(openAccent: boolean): string {

  return openAccent ? TRAVEL_PANEL_MAP_OPEN_ACCENT.className : "";

}



/**

 * Inline CSS custom property for the Travel map open accent (PL144.2).

 * Always sets the current-map chip accent so open chrome kinship matches

 * destination-row tints even when the flash is off.

 *

 * @param kind - Current land kind (where Travel was opened).

 * @returns Style fragment with `--travel-map-accent`.

 */

export function travelPanelMapOpenAccentStyle(

  kind: CanonicalLandKind | string | null | undefined,

): Record<string, string> {

  return {

    [TRAVEL_PANEL_MAP_OPEN_ACCENT.cssVar]: travelDestinationMapTintAccent(kind),

  };

}



/**

 * Whether a destination row should carry map-tint chrome (PL133.2).

 * Always true for known circuit destinations — tint is continuous while panel open.

 *

 * @param kind - Destination land kind.

 * @returns True when map-tint accents apply.

 */

export function shouldShowTravelDestinationMapTint(

  kind: CanonicalLandKind | string | null | undefined,

): boolean {

  return Boolean(kind && String(kind).trim());

}



/**

 * Inline style for a TravelPanel destination row (PL133.2).

 * Idle: quiet left inset + soft border in map accent.

 * Here: thicker border + stronger fill so current map stays readable.

 *

 * @param kind - Destination land kind.

 * @param atDest - True when the player is already on this map.

 * @returns CSSProperties fragment for the destination button.

 */

export function travelDestinationMapTintStyle(

  kind: CanonicalLandKind | string | null | undefined,

  atDest: boolean,

): {

  border: string;

  background: string;

  boxShadow: string;

  color?: string;

} {

  const accent = travelDestinationMapTintAccent(kind);

  const {

    idleBorderMixPct,

    idleFillMixPct,

    hereFillMixPct,

  } = TRAVEL_DESTINATION_MAP_TINT;



  if (atDest) {

    return {

      border: `2px solid ${accent}`,

      background: `color-mix(in srgb, ${accent} ${hereFillMixPct}%, transparent)`,

      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 35%, transparent)`,

      color: accent,

    };

  }



  return {

    border: `1px solid color-mix(in srgb, ${accent} ${idleBorderMixPct}%, transparent)`,

    background: `color-mix(in srgb, ${accent} ${idleFillMixPct}%, transparent)`,

    boxShadow: `inset 3px 0 0 ${accent}`,

  };

}



/**

 * CSS class list for a destination row (PL133.2).

 *

 * @param atDest - True when this destination is current.

 * @returns Space-joined class names.

 */

export function travelDestinationMapTintClassName(atDest: boolean): string {

  const { rowClassName, hereClassName } = TRAVEL_DESTINATION_MAP_TINT;

  return atDest ? `${rowClassName} ${hereClassName}` : rowClassName;

}


