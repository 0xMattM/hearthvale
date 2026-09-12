/**
 * Brief open accents for Trade / Quest / Mail / Notice / Chat / Tutor panels
 * (PL29.1–PL29.2 / PL34.1 / PL34.3 / PL38.1 / PL55.1).
 * Same panels; escrow rules, quest rewards, notice tips, chat receive ping,
 * and tutor XP / claim rules unchanged.
 */

/** How long the open accent stays on trade/quest/mail/notice/chat/tutor header / border. */
export const SOCIAL_PANEL_OPEN_ACCENT_MS = 450;

/**
 * Whether opening Trade should play the brief accent.
 * True only on transition into trade (T / invite review; not when already open / closing).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Trade just opened.
 */
export function shouldPlayTradeOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "trade" && next === "trade";
}

/**
 * Whether opening the Quest log should play the brief accent.
 * True only on transition into quests (Q; not when already open / closing).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Quest log just opened.
 */
export function shouldPlayQuestOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "quests" && next === "quests";
}

/**
 * Whether opening Mail should play the brief accent (PL34.1).
 * True only on transition into mail (L; not when already open / closing).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Mail just opened.
 */
export function shouldPlayMailOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "mail" && next === "mail";
}

/**
 * Whether opening the Notice board should play the brief accent (PL34.3).
 * True only on transition into notice (walk-up; not when already open / closing).
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Notice just opened.
 */
export function shouldPlayNoticeOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "notice" && next === "notice";
}

/**
 * Whether opening Chat should play the brief accent (PL38.1).
 * True only on transition into chat (C; not when already open / closing).
 * Receive ping (PL27.2) stays independent — silent while panel is open.
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Chat just opened.
 */
export function shouldPlayChatOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "chat" && next === "chat";
}

/**
 * Whether opening a Tutorial NPC panel should play the brief accent (PL55.1).
 * True only on transition into tutorial_npc (walk-up; not when already open / closing).
 * XP / claim rules unchanged.
 *
 * @param previous - Panel before open.
 * @param next - Panel after open.
 * @returns True when Tutor panel just opened.
 */
export function shouldPlayTutorialNpcOpenAccent(
  previous: string | null,
  next: string | null,
): boolean {
  return previous !== "tutorial_npc" && next === "tutorial_npc";
}
