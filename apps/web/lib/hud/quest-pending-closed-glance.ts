/**
 * Quest-pending closed glance (PL189.1).
 * Quiet TopBar/Q chip while a claimable quest reward is pending and Quest panel
 * closed — complements claim rim PL138.2 + panel open accent PL29.2 + ready-row
 * PL128.1; no always-on quest column. Quest rules unchanged; clears when none
 * ready or panel open; mute ok.
 */

import type { QuestStatus } from "@game/shared";
import { QUEST_READY_ROW_ACCENT } from "./quest-ready-row-accent";

/**
 * Soft closed-glance chip chrome (PL189.1).
 * Warm kinship with QUEST_READY_ROW_ACCENT — not a permanent Quest column.
 */
export const QUEST_PENDING_CLOSED_GLANCE = {
  /** Hotkey letter (KEYBINDS KeyQ). */
  hotkey: "Q",
  /** Quiet chip word — not a Quest column. */
  word: "Quest",
  borderColor: QUEST_READY_ROW_ACCENT.statusColor,
  textColor: QUEST_READY_ROW_ACCENT.statusColor,
  className: "topbar-quest-glance",
} as const;

/**
 * Count claimable (ready) starter quests (PL189.1).
 *
 * @param quests - Quest rows with status.
 * @returns Number of ready (claimable) quests.
 */
export function countReadyQuests(
  quests: ReadonlyArray<{ status: QuestStatus | string }>,
): number {
  let n = 0;
  for (const q of quests) {
    if (q.status === "ready") n += 1;
  }
  return n;
}

/**
 * Whether any starter quest reward is claimable (PL189.1).
 *
 * @param quests - Quest rows with status.
 * @returns True when at least one quest is ready to claim.
 */
export function hasReadyQuestReward(
  quests: ReadonlyArray<{ status: QuestStatus | string }>,
): boolean {
  return countReadyQuests(quests) > 0;
}

/**
 * Whether the closed quest glance chip should render (PL189.1).
 * True only while a claimable reward is pending and Quest panel is closed.
 *
 * @param quests - Quest rows with status.
 * @param questPanelOpen - True when the Quest panel is the open contextual panel.
 * @returns True when the quiet TopBar/Q chip should show.
 */
export function shouldShowQuestPendingClosedGlance(
  quests: ReadonlyArray<{ status: QuestStatus | string }>,
  questPanelOpen: boolean,
): boolean {
  if (questPanelOpen) return false;
  return hasReadyQuestReward(quests);
}

/**
 * Compact chip label for pending closed glance (PL189.1).
 * `Q · Quest` or `Q · Quest · N` when more than one ready reward.
 *
 * @param quests - Quest rows with status.
 * @returns Chip text; empty string when nothing ready (caller should gate).
 */
export function questPendingClosedGlanceLabel(
  quests: ReadonlyArray<{ status: QuestStatus | string }>,
): string {
  const n = countReadyQuests(quests);
  if (n <= 0) return "";
  const { hotkey, word } = QUEST_PENDING_CLOSED_GLANCE;
  if (n > 1) return `${hotkey} · ${word} · ${n}`;
  return `${hotkey} · ${word}`;
}
