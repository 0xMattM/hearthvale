/**
 * Brief economy panel open accents (PL19.1–PL19.2) — same panels, visible open feedback.
 * Vendor: walk-up stall. Market: walk-up board or M hotkey.
 */

/** How long the open accent stays on vendor/market header / border. */
export const ECONOMY_PANEL_OPEN_ACCENT_MS = 450;

/**
 * Whether opening the vendor panel should play the brief accent.
 * True only on transition into vendor (not when already open / closing).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when vendor just opened.
 */
export function shouldPlayVendorOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "vendor" && next === "vendor";
}

/**
 * Whether opening the market panel should play the brief accent.
 * True only on transition into market (not when already open / closing).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when market just opened.
 */
export function shouldPlayMarketOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "market" && next === "market";
}
