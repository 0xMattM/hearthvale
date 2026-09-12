/**
 * Mail-pending closed glance (PL133.1).
 * Quiet TopBar/L chip while inbox has pending parcels and Mail is closed —
 * complements panel unread PL17.1 + open accent PL34.1; no always-on mail column.
 * Mailbox rules unchanged; clears when inbox empty or panel open.
 */

import {
  MAIL_UNREAD_PANEL_ACCENT,
  countPendingInboxMail,
  hasUnreadMailParcels,
} from "@game/shared";

/**
 * Soft closed-glance chip chrome (PL133.1).
 * Warm kinship with MAIL_UNREAD_PANEL_ACCENT — not a permanent Mail column.
 */
export const MAIL_PENDING_CLOSED_GLANCE = {
  /** Hotkey letter (KEYBINDS KeyL). */
  hotkey: "L",
  /** Quiet chip word — not a Mail column. */
  word: "Mail",
  borderColor: MAIL_UNREAD_PANEL_ACCENT.borderColor,
  textColor: MAIL_UNREAD_PANEL_ACCENT.headerColor,
  className: "topbar-mail-glance",
} as const;

/**
 * Whether the closed mail glance chip should render (PL133.1).
 * True only while inbox has pending parcels and Mail panel is closed.
 *
 * @param mail - Mail rows (inbox/sent + status).
 * @param mailPanelOpen - True when the Mail panel is the open contextual panel.
 * @returns True when the quiet TopBar/L chip should show.
 */
export function shouldShowMailPendingClosedGlance(
  mail: ReadonlyArray<{ direction: string; status: string }>,
  mailPanelOpen: boolean,
): boolean {
  if (mailPanelOpen) return false;
  return hasUnreadMailParcels(mail);
}

/**
 * Compact chip label for pending closed glance (PL133.1).
 * `L · Mail` or `L · Mail · N` when more than one pending parcel.
 *
 * @param mail - Mail rows (inbox/sent + status).
 * @returns Chip text; empty string when nothing pending (caller should gate).
 */
export function mailPendingClosedGlanceLabel(
  mail: ReadonlyArray<{ direction: string; status: string }>,
): string {
  const n = countPendingInboxMail(mail);
  if (n <= 0) return "";
  const { hotkey, word } = MAIL_PENDING_CLOSED_GLANCE;
  if (n > 1) return `${hotkey} · ${word} · ${n}`;
  return `${hotkey} · ${word}`;
}
