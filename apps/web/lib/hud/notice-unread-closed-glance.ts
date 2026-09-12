/**
 * Notice-unread closed glance (PL197.2).
 * Quiet TopBar notice chip while unread tip ids are pending and Notice panel
 * closed — complements unread flicker PL117.2 + open accent PL34.3; no
 * always-on notice column. Tip ids SoT unchanged; clears when all seen or
 * panel open; mute ok.
 */

import {
  NOTICE_UNREAD_WORLD_CUE,
  cityNoticeTipIds,
  hasUnreadNoticeTips,
} from "@game/shared";

/**
 * Soft closed-glance chip chrome (PL197.2).
 * Warm kinship with NOTICE_UNREAD_WORLD_CUE — not a permanent Notice column.
 * Walk-up board (no TopBar hotkey) — chip word only.
 */
export const NOTICE_UNREAD_CLOSED_GLANCE = {
  /** Quiet chip word — not a Notice column; walk-up opens the board. */
  word: "Notice",
  borderColor: NOTICE_UNREAD_WORLD_CUE.labelBorder,
  textColor: NOTICE_UNREAD_WORLD_CUE.haloColor,
  className: "topbar-notice-glance",
} as const;

/**
 * Count unread notice tip ids still pending review (PL197.2).
 *
 * @param seenTipIds - Tip ids the player has already opened/acknowledged.
 * @param tipIds - Optional tip id list (defaults to live board tips).
 * @returns Number of tip ids not yet seen.
 */
export function countUnreadNoticeTips(
  seenTipIds: readonly string[],
  tipIds: readonly string[] = cityNoticeTipIds(),
): number {
  const seen = new Set(seenTipIds);
  let n = 0;
  for (const id of tipIds) {
    if (!seen.has(id)) n += 1;
  }
  return n;
}

/**
 * Whether the closed notice glance chip should render (PL197.2).
 * True only while unread tips are pending and Notice panel is closed.
 *
 * @param seenTipIds - Tip ids already acknowledged.
 * @param noticePanelOpen - True when Notice is the open contextual panel.
 * @param tipIds - Optional tip id list (defaults to live board tips).
 * @returns True when the quiet TopBar notice chip should show.
 */
export function shouldShowNoticeUnreadClosedGlance(
  seenTipIds: readonly string[],
  noticePanelOpen: boolean,
  tipIds: readonly string[] = cityNoticeTipIds(),
): boolean {
  if (noticePanelOpen) return false;
  return hasUnreadNoticeTips(seenTipIds, tipIds);
}

/**
 * Compact chip label for unread closed glance (PL197.2).
 * `Notice` or `Notice · N` when more than one unread tip.
 *
 * @param seenTipIds - Tip ids already acknowledged.
 * @param tipIds - Optional tip id list (defaults to live board tips).
 * @returns Chip text; empty string when nothing unread (caller should gate).
 */
export function noticeUnreadClosedGlanceLabel(
  seenTipIds: readonly string[],
  tipIds: readonly string[] = cityNoticeTipIds(),
): string {
  const n = countUnreadNoticeTips(seenTipIds, tipIds);
  if (n <= 0) return "";
  const { word } = NOTICE_UNREAD_CLOSED_GLANCE;
  if (n > 1) return `${word} · ${n}`;
  return word;
}
