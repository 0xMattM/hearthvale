/**
 * Chat-pending closed glance (PL197.1).
 * Quiet TopBar/C chip while unread world/guild chat lines arrived and Chat
 * panel closed — complements receive ping PL27.2 + open accent PL38.1; no
 * always-on chat column. Chat rules unchanged; clears when none pending or
 * panel open; mute ok.
 */

/**
 * Soft pending unread chat line (client-staged while Chat closed).
 */
export interface PendingChatGlanceLine {
  /** Stable message id. */
  id: string;
  /** Channel the line arrived on (world or guild). */
  channel: "world" | "guild" | string;
}

/**
 * Soft closed-glance chip chrome (PL197.1).
 * Seafoam kinship with chat open accent — not a permanent Chat column.
 */
export const CHAT_PENDING_CLOSED_GLANCE = {
  /** Hotkey letter (KEYBINDS KeyC). */
  hotkey: "C",
  /** Quiet chip word — not a Chat column. */
  word: "Chat",
  borderColor: "#78b8a0",
  textColor: "#a0d8c0",
  className: "topbar-chat-glance",
} as const;

/**
 * Count staged unread chat/guild lines awaiting panel review (PL197.1).
 *
 * @param pending - Staged unread lines.
 * @returns Number of pending lines with a non-empty id.
 */
export function countPendingChatGlanceLines(
  pending: ReadonlyArray<PendingChatGlanceLine>,
): number {
  let n = 0;
  for (const row of pending) {
    if (row.id.trim().length > 0) n += 1;
  }
  return n;
}

/**
 * Whether any unread chat/guild line is pending review (PL197.1).
 *
 * @param pending - Staged unread lines.
 * @returns True when at least one line id is staged.
 */
export function hasPendingChatGlance(
  pending: ReadonlyArray<PendingChatGlanceLine>,
): boolean {
  return countPendingChatGlanceLines(pending) > 0;
}

/**
 * Whether the closed chat glance chip should render (PL197.1).
 * True only while unread lines are pending and Chat panel is closed.
 *
 * @param pending - Staged unread lines.
 * @param chatPanelOpen - True when Chat is the open contextual panel.
 * @returns True when the quiet TopBar/C chip should show.
 */
export function shouldShowChatPendingClosedGlance(
  pending: ReadonlyArray<PendingChatGlanceLine>,
  chatPanelOpen: boolean,
): boolean {
  if (chatPanelOpen) return false;
  return hasPendingChatGlance(pending);
}

/**
 * Compact chip label for pending closed glance (PL197.1).
 * `C · Chat` or `C · Chat · N` when more than one unread line.
 *
 * @param pending - Staged unread lines.
 * @returns Chip text; empty string when nothing pending (caller should gate).
 */
export function chatPendingClosedGlanceLabel(
  pending: ReadonlyArray<PendingChatGlanceLine>,
): string {
  const n = countPendingChatGlanceLines(pending);
  if (n <= 0) return "";
  const { hotkey, word } = CHAT_PENDING_CLOSED_GLANCE;
  if (n > 1) return `${hotkey} · ${word} · ${n}`;
  return `${hotkey} · ${word}`;
}

/**
 * Whether an incoming chat/guild line should stage the closed glance (PL197.1).
 * Own echoes and empty ids stay silent; panel-open staging is caller-gated.
 * Complements receive ping — cooldown does not block the persistent chip.
 *
 * @param input - Sender + self identity and message id.
 * @returns True when the line should be staged as unread.
 */
export function shouldStageChatPendingClosedGlance(input: {
  messageId: string | null | undefined;
  fromUsername: string | null | undefined;
  selfUsername: string | null | undefined;
}): boolean {
  const id = (input.messageId ?? "").trim();
  if (!id) return false;
  const from = (input.fromUsername ?? "").trim();
  if (!from) return false;
  const self = (input.selfUsername ?? "").trim();
  if (self && from.toLowerCase() === self.toLowerCase()) return false;
  return true;
}

/**
 * Merge a newly received unread line into the pending glance list (PL197.1).
 * Dedupes by id; newest channel wins. Chat rules unchanged.
 *
 * @param current - Existing staged lines.
 * @param incoming - Unread line just received.
 * @returns Next pending list.
 */
export function mergePendingChatGlanceLine(
  current: ReadonlyArray<PendingChatGlanceLine>,
  incoming: PendingChatGlanceLine,
): PendingChatGlanceLine[] {
  const id = incoming.id.trim();
  if (!id) return [...current];
  const channel = (incoming.channel || "world").trim() || "world";
  const without = current.filter((row) => row.id.trim() !== id);
  return [...without, { id, channel }];
}

/**
 * Clear all staged unread chat lines after Chat panel opens (PL197.1).
 * Open = acknowledged; chat SoT unchanged.
 *
 * @returns Empty pending list.
 */
export function clearPendingChatGlanceLines(): PendingChatGlanceLine[] {
  return [];
}
