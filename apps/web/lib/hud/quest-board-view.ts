import {
  MAYOR_DISPLAY_NAME,
  TUTORIAL_QUEST_CHAIN,
  type QuestStatus,
} from "@game/shared";

/** Quest row as the Q board receives it from GameApp. */
export interface QuestBoardRow {
  id: string;
  title: string;
  blurb: string;
  status: QuestStatus;
  rewardCoins: number;
  rewardCharacterXp: number;
  claimAtNpc?: string;
}

/** Pip on the city-tutor progress trail. */
export type QuestBoardPipKind = "done" | "current" | "todo";

/**
 * Player-facing status for a quest slip (not the raw API token).
 *
 * @param status - Catalog / API quest status.
 * @returns Short board label.
 */
export function questStatusLabel(status: QuestStatus): string {
  if (status === "claimed") return "Done";
  if (status === "ready") return "Turn in";
  if (status === "active") return "Current";
  if (status === "locked") return "Locked";
  return "Current";
}

/**
 * Counts claimed tutors against the full onboarding chain.
 *
 * @param quests - Visible quest rows on the board.
 * @returns Done count and chain length.
 */
export function questBoardProgress(
  quests: ReadonlyArray<Pick<QuestBoardRow, "status">>,
): { done: number; total: number } {
  const claimed = quests.filter((quest) => quest.status === "claimed").length;
  const total = TUTORIAL_QUEST_CHAIN.length;
  return { done: Math.min(claimed, total), total };
}

/**
 * Splits the log into finished slips and the one errand to glance at.
 *
 * @param quests - Visible quest rows in chain order.
 * @returns Claimed list plus the featured open quest.
 */
export function partitionQuestBoard(quests: readonly QuestBoardRow[]): {
  done: QuestBoardRow[];
  current: QuestBoardRow | null;
  upcoming: QuestBoardRow[];
} {
  const done = quests.filter((quest) => quest.status === "claimed");
  const open = quests.filter((quest) => quest.status !== "claimed");
  const current =
    open.find((quest) => quest.status === "ready") ??
    open.find((quest) => quest.status === "active") ??
    open[0] ??
    null;
  const upcoming = open.filter((quest) => quest.id !== current?.id);
  return { done, current, upcoming };
}

/**
 * Kind of a progress pip along the city-tutor chain.
 *
 * @param index - Zero-based pip index.
 * @param done - Claimed count.
 * @param hasOpenQuest - True when an unclaimed errand is on the board.
 * @returns Pip kind.
 */
export function questBoardPipKind(
  index: number,
  done: number,
  hasOpenQuest: boolean,
): QuestBoardPipKind {
  if (index < 0) return "todo";
  if (index < done) return "done";
  if (index === done && hasOpenQuest) return "current";
  return "todo";
}

/**
 * Empty / complete copy when there is no featured errand.
 *
 * @param input - Featured quest plus progress.
 * @returns Board note, or null when a current slip is showing.
 */
export function questBoardEmptyNote(input: {
  current: QuestBoardRow | null;
  done: number;
  total: number;
}): string | null {
  if (input.current) return null;
  if (input.total <= 0) return "No errands posted.";
  if (input.done >= input.total) {
    return "Every city tutor has a lesson claimed. The stations stay open.";
  }
  return `Talk to the ${MAYOR_DISPLAY_NAME} at City Hall to begin.`;
}
