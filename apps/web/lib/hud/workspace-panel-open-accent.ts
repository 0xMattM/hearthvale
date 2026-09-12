/**
 * Brief open accents for Build / Craft / Travel / Decor / Arena stub panels
 * (PL24.1–PL24.3 / PL34.2 / PL52.2).
 * Same panels; place costs, recipes, fare-free destinations, decor coin costs,
 * and optional arena path copy unchanged.
 */

/** How long the open accent stays on build/craft/travel/decor/arena header / border. */
export const WORKSPACE_PANEL_OPEN_ACCENT_MS = 450;

/**
 * Whether opening the build panel should play the brief accent.
 * True only on transition into build (not when already open / closing).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Build Board just opened.
 */
export function shouldPlayBuildOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "build" && next === "build";
}

/**
 * Whether opening a craft station panel should play the brief accent.
 * True only on transition into craft (not when already open / closing).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when craft panel just opened.
 */
export function shouldPlayCraftOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "craft" && next === "craft";
}

/**
 * Whether opening Travel should play the brief accent.
 * True only on transition into travel (N / portal / notice / arena).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Travel just opened.
 */
export function shouldPlayTravelOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "travel" && next === "travel";
}

/**
 * Whether opening Housing decor should play the brief accent (PL34.2).
 * True only on transition into decor (walk-up pad; not when already open / closing).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Decor panel just opened.
 */
export function shouldPlayDecorOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "decor" && next === "decor";
}

/**
 * Whether opening the Arena stub should play the brief accent (PL52.2).
 * True only on transition into arena (plaque walk-up; not when already open / closing).
 * Optional path copy / free enter-exit unchanged; no balance invent.
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Arena stub just opened.
 */
export function shouldPlayArenaOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "arena" && next === "arena";
}
