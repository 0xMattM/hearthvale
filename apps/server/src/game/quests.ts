/**
 * Onboarding quest log (Q) — progressive station chain.
 * Rewards are claimed by talking to the NPC, never from this board.
 */

import {
  ACTION_ERROR,
  visibleOnboardingQuestIds,
  type QuestStatus,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { players } from "../db/schema.js";
import { listTutorialNpcs } from "./tutorial-npcs.js";
import type { ActionResult } from "./actions/farming.js";

export interface QuestRowDto {
  id: string;
  title: string;
  blurb: string;
  status: QuestStatus;
  rewardCoins: number;
  rewardCharacterXp: number;
  /** Walk-up NPC who pays the reward — not the Q log. */
  claimAtNpc: string;
}

function playerByUserId(userId: string) {
  return db.select().from(players).where(eq(players.userId, userId)).get();
}

/**
 * Lists the onboarding chain visible so far (one new station at a time).
 */
export function listQuests(userId: string): QuestRowDto[] {
  if (!playerByUserId(userId)) return [];
  const npcs = listTutorialNpcs(userId);
  const claimed = new Set(
    npcs.filter((n) => n.quest.status === "claimed").map((n) => n.quest.id),
  );
  const visible = new Set(visibleOnboardingQuestIds(claimed));
  return npcs
    .filter((n) => visible.has(n.quest.id))
    .map((n) => ({
      id: n.quest.id,
      title: n.quest.title,
      blurb: n.quest.blurb,
      status: n.quest.status,
      rewardCoins: n.quest.rewardCoins,
      rewardCharacterXp: n.quest.rewardCharacterXp,
      claimAtNpc: n.name,
    }));
}

/**
 * Quest-board claim is disabled — rewards are paid at the NPC walk-up.
 */
export function claimQuest(
  _userId: string,
  _questId: string,
): ActionResult & { rewardCoins?: number; rewardCharacterXp?: number } {
  return { ok: false, error: ACTION_ERROR.questClaimAtNpc };
}
