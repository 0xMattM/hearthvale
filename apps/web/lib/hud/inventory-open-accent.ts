/**
 * Brief inventory / settings / guild / achievements / deed open accents
 * (PL9.2 / PL38.2 / PL46.1–PL46.2 / PL55.2) — same panels, visible open feedback.
 * Hotkey open only; no extra chrome columns.
 * Settings / Guild / Achievements / Deed reuse the inventory accent duration/tint
 * (system prefs / optional wallet path).
 */

/** How long the open accent stays on bag / settings / guild / achievements / deed header / border. */
export const INVENTORY_OPEN_ACCENT_MS = 450;

/**
 * Whether opening inventory should play the brief accent.
 * True only on transition into inventory (not when already open / closing).
 *
 * @param previous - Panel before the toggle.
 * @param next - Panel after the toggle.
 * @returns True when bag just opened.
 */
export function shouldPlayInventoryOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "inventory" && next === "inventory";
}

/**
 * Whether opening Settings should play the brief accent (PL38.2).
 * True only on transition into settings (H; not when already open / closing).
 * Prefs / mute confirm (PL37.2) unchanged.
 *
 * @param previous - Panel before the toggle.
 * @param next - Panel after the toggle.
 * @returns True when Settings just opened.
 */
export function shouldPlaySettingsOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "settings" && next === "settings";
}

/**
 * Whether opening Guild should play the brief accent (PL46.1).
 * True only on transition into guild (G; not when already open / closing).
 * Claim / war rules unchanged.
 *
 * @param previous - Panel before the toggle.
 * @param next - Panel after the toggle.
 * @returns True when Guild just opened.
 */
export function shouldPlayGuildOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "guild" && next === "guild";
}

/**
 * Whether opening Guild should play the membership open accent (PL140.2).
 * True only on transition into guild while already a member (complements
 * Created/Joined PL50.1; min HUD). Non-members keep the generic PL46.1 accent.
 *
 * @param previous - Panel before the toggle.
 * @param next - Panel after the toggle.
 * @param hasMembership - True when the player is already in a guild.
 * @returns True when Guild just opened with membership.
 */
export function shouldPlayGuildMembershipOpenAccent(
  previous: string | null,
  next: string | null,
  hasMembership: boolean,
): boolean {
  return (
    shouldPlayGuildOpenAccent(previous, next) && Boolean(hasMembership)
  );
}

/**
 * Whether opening Achievements should play the brief accent (PL46.2).
 * True only on transition into achievements (A; not when already open / closing).
 * Stub counters unchanged.
 *
 * @param previous - Panel before the toggle.
 * @param next - Panel after the toggle.
 * @returns True when Achievements just opened.
 */
export function shouldPlayAchievementsOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "achievements" && next === "achievements";
}

/**
 * Whether opening the Deed desk should play the brief accent (PL55.2).
 * True only on transition into deeds (B; settings / wallet optional path).
 * No combat power; core loops stay wallet-free.
 *
 * @param previous - Panel before the toggle.
 * @param next - Panel after the toggle.
 * @returns True when Deed desk just opened.
 */
export function shouldPlayDeedOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "deeds" && next === "deeds";
}

/**
 * Whether opening the indigo REALM stall should play the brief accent.
 * True only on transition into realm_market (E at the stall; not B).
 *
 * @param previous - Panel before the toggle.
 * @param next - Panel after the toggle.
 * @returns True when the REALM stall desk just opened.
 */
export function shouldPlayRealmMarketOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "realm_market" && next === "realm_market";
}
