import { ACTION_ERROR } from "@game/shared";

/**
 * Claims the Intendente intro so Farmer (and the quest log) can unlock.
 *
 * @param claimTutorialQuest - Server claim fn.
 * @param userId - Player user id.
 */
export function claimMayorIntro(
  claimTutorialQuest: (
    userId: string,
    professionOrQuestId: string,
  ) => { ok: boolean; error?: string },
  userId: string,
): void {
  const result = claimTutorialQuest(userId, "mayor");
  if (result.ok) return;
  if (result.error === ACTION_ERROR.questAlreadyClaimed) return;
  throw new Error(`mayor intro failed: ${result.error}`);
}
