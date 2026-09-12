/**
 * Quest-ready soft row accent (PL128.1).
 * Quiet ready-row tint when a quest is claimable in the Quest panel —
 * complements claim cue PL29.3 so ready quests stay glanceable.
 * Quest catalog / claim rules unchanged; min HUD.
 */

import type { QuestStatus } from "@game/shared";

/**
 * Soft claimable-row chrome for Quest panel ready rows (PL128.1).
 * Warm amber-olive kinship with Claim afford — not a second Claim toast.
 */
export const QUEST_READY_ROW_ACCENT = {
  /** CSS class applied to ready (claimable) quest rows. */
  rowClassName: "quest-panel__row--ready",
  borderRgba: "rgba(168, 148, 64, 0.55)",
  backgroundRgba: "rgba(58, 72, 36, 0.55)",
  statusColor: "#e0d078",
} as const;

/**
 * Whether a quest row should show the ready soft accent (PL128.1).
 * True only for `ready` (claimable); locked / active / claimed stay quiet.
 *
 * @param status - Quest status from the catalog / API.
 * @returns True when the soft ready-row tint should apply.
 */
export function shouldShowQuestReadyRowAccent(status: QuestStatus): boolean {
  return status === "ready";
}

/**
 * CSS class for a quest row given its status (PL128.1).
 *
 * @param status - Quest status from the catalog / API.
 * @returns Ready accent class, or empty string when not claimable.
 */
export function questReadyRowAccentClassName(status: QuestStatus): string {
  return shouldShowQuestReadyRowAccent(status)
    ? QUEST_READY_ROW_ACCENT.rowClassName
    : "";
}
