/**
 * Title-cover identity — name, intro, and gate copy shown before login.
 * Auth endpoints stay username/password; this file is presentation only.
 */

/** World name on the cover, tab title, and gate heading. */
export const GAME_TITLE = "Hearthvale";

/** Quiet kicker that ties the world to the Realm economy / token. */
export const GAME_KICKER = "A Realm sandbox";

/** One-line promise under the title. */
export const GAME_TAGLINE = "Tillage, trade, and the wilds beyond the wall";

/** Short welcome read before the settler signs in. */
export const GAME_INTRO =
  "The City is the shared heart — tutors, a market, and scarce craft halls. Your own land waits empty beyond the portal until you build. The wilds and the Warrior's path are yours to walk when you are ready.";

/** Four maps the intro should name without dumping HUD help. */
export const TITLE_COVER_PILLARS: ReadonlyArray<{
  glyph: string;
  word: string;
  blurb: string;
}> = [
  { glyph: "◆", word: "City", blurb: "Shared plaza, tutors, market" },
  { glyph: "▣", word: "Land", blurb: "Your homestead to till" },
  { glyph: "✦", word: "Explore", blurb: "Woods, mines, and hunt trails" },
  { glyph: "✧", word: "Arena", blurb: "Optional warrior path" },
];

/** Labels on the styled connect card. */
export const TITLE_COVER_GATE = {
  heading: "Cross the gate",
  lede: "A local settler name. No wallet needed to play.",
  usernameLabel: "Settler name",
  passwordLabel: "Password",
  login: "Enter",
  register: "Join",
  busyLogin: "Crossing…",
  busyRegister: "Founding…",
} as const;

const PLACEHOLDER_TITLES = new Set(["enter the land", "game mvp", "game"]);

/**
 * Browser / metadata title for the cover.
 *
 * @param title - Candidate display name.
 * @returns Trimmed title, or Hearthvale when blank.
 */
export function titleCoverDocumentTitle(title: string = GAME_TITLE): string {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : GAME_TITLE;
}

/**
 * Whether copy is leftover placeholder chrome, not a real game name.
 *
 * @param copy - Title or heading to check.
 * @returns True when the string is a known untitled placeholder.
 */
export function isPlaceholderGateCopy(copy: string): boolean {
  return PLACEHOLDER_TITLES.has(copy.trim().toLowerCase());
}

/**
 * Whether the intro is long enough and names the City + homestead.
 *
 * @param intro - Welcome paragraph on the cover.
 * @returns True when the intro can stand in for a game welcome.
 */
export function isTitleCoverIntroComplete(intro: string): boolean {
  const text = intro.trim();
  if (text.length < 80) return false;
  return /city/i.test(text) && /(land|homestead)/i.test(text);
}

/**
 * Login / register button label while the request is in flight.
 *
 * @param mode - Auth action on the gate.
 * @param busy - True while the API call is open.
 * @returns Resting or busy label from TITLE_COVER_GATE.
 */
export function titleCoverAuthLabel(
  mode: "login" | "register",
  busy: boolean,
): string {
  if (mode === "login") {
    return busy ? TITLE_COVER_GATE.busyLogin : TITLE_COVER_GATE.login;
  }
  return busy ? TITLE_COVER_GATE.busyRegister : TITLE_COVER_GATE.register;
}
