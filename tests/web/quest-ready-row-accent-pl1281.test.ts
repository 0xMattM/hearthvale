import { describe, expect, it } from "vitest";
import { STARTER_QUESTS } from "@game/shared";
import {
  QUEST_READY_ROW_ACCENT,
  questReadyRowAccentClassName,
  shouldShowQuestReadyRowAccent,
} from "../../apps/web/lib/hud/quest-ready-row-accent";
import {
  QUEST_CLAIM_SUCCESS_CUE,
  questClaimSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL128.1 — Quest-ready soft row accent.
 * Quiet ready-row tint when a quest is claimable in Quest panel
 * (complements claim cue PL29.3). Catalog / claim rules unchanged; min HUD.
 * Choice: continuous ready-row tint (not one-shot) so claimable quests stay
 * glanceable while the panel is open beside Claim + Quest claimed cue.
 */
describe("CityLands PL128.1 quest-ready soft row accent", () => {
  it("tints only claimable ready rows (happy)", () => {
    expect(shouldShowQuestReadyRowAccent("ready")).toBe(true);
    expect(questReadyRowAccentClassName("ready")).toBe(
      QUEST_READY_ROW_ACCENT.rowClassName,
    );
    expect(QUEST_READY_ROW_ACCENT.rowClassName).toBe("quest-panel__row--ready");
    expect(QUEST_READY_ROW_ACCENT.statusColor.length).toBeGreaterThan(0);
    expect(QUEST_READY_ROW_ACCENT.backgroundRgba).toMatch(/^rgba/);

    // Complements — does not replace — PL29.3 claim cue.
    expect(questClaimSuccessCueText()).toBe(QUEST_CLAIM_SUCCESS_CUE);
    expect(questClaimSuccessCueText()).toBe("Quest claimed");
  });

  it("stays quiet for locked / active / claimed (edge)", () => {
    expect(shouldShowQuestReadyRowAccent("locked")).toBe(false);
    expect(shouldShowQuestReadyRowAccent("active")).toBe(false);
    expect(shouldShowQuestReadyRowAccent("claimed")).toBe(false);
    expect(questReadyRowAccentClassName("active")).toBe("");
    expect(questReadyRowAccentClassName("claimed")).toBe("");
    expect(QUEST_READY_ROW_ACCENT.borderRgba).not.toBe(
      QUEST_READY_ROW_ACCENT.backgroundRgba,
    );
  });

  it("does not invent quest rewards or catalog ids (failure)", () => {
    expect(STARTER_QUESTS.length).toBe(5);
    expect(STARTER_QUESTS[0]?.rewardCoins).toBe(5);
    expect(String(QUEST_READY_ROW_ACCENT.rowClassName)).not.toMatch(
      /nft|combat/i,
    );
    expect(shouldShowQuestReadyRowAccent("ready")).not.toBe(
      shouldShowQuestReadyRowAccent("claimed"),
    );
    expect(QUEST_READY_ROW_ACCENT.statusColor).not.toMatch(/\d+\s*coins/i);
  });
});
