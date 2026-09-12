import { describe, expect, it } from "vitest";
import { QUEST_READY_ROW_ACCENT } from "../../apps/web/lib/hud/quest-ready-row-accent";
import {
  QUEST_PENDING_CLOSED_GLANCE,
  countReadyQuests,
  hasReadyQuestReward,
  questPendingClosedGlanceLabel,
  shouldShowQuestPendingClosedGlance,
} from "../../apps/web/lib/hud/quest-pending-closed-glance";

/**
 * PL189.1 — Quest-pending closed glance leftover.
 * Choice: quiet TopBar Q · Quest chip while a claimable reward is pending and
 * Quest panel closed (complements claim rim + open accent + ready-row; no column).
 */
describe("CityLands PL189.1 quest-pending closed glance leftover", () => {
  const ready = [
    { status: "ready" as const },
    { status: "active" as const },
  ];
  const twoReady = [
    { status: "ready" as const },
    { status: "ready" as const },
  ];
  const noneReady = [
    { status: "active" as const },
    { status: "claimed" as const },
    { status: "locked" as const },
  ];

  it("shows quiet Q · Quest chip while claimable and Quest closed (happy)", () => {
    expect(hasReadyQuestReward(ready)).toBe(true);
    expect(shouldShowQuestPendingClosedGlance(ready, false)).toBe(true);
    expect(questPendingClosedGlanceLabel(ready)).toBe("Q · Quest");
    expect(questPendingClosedGlanceLabel(twoReady)).toBe("Q · Quest · 2");
    expect(countReadyQuests(twoReady)).toBe(2);

    expect(QUEST_PENDING_CLOSED_GLANCE.hotkey).toBe("Q");
    expect(QUEST_PENDING_CLOSED_GLANCE.word).toBe("Quest");
    expect(QUEST_PENDING_CLOSED_GLANCE.borderColor).toBe(
      QUEST_READY_ROW_ACCENT.statusColor,
    );
    expect(QUEST_PENDING_CLOSED_GLANCE.textColor).toBe(
      QUEST_READY_ROW_ACCENT.statusColor,
    );
    expect(QUEST_PENDING_CLOSED_GLANCE.className).toBe("topbar-quest-glance");
  });

  it("clears when none ready or Quest panel open (edge)", () => {
    expect(shouldShowQuestPendingClosedGlance(noneReady, false)).toBe(false);
    expect(shouldShowQuestPendingClosedGlance([], false)).toBe(false);
    expect(shouldShowQuestPendingClosedGlance(ready, true)).toBe(false);
    expect(questPendingClosedGlanceLabel(noneReady)).toBe("");
    expect(questPendingClosedGlanceLabel([])).toBe("");
    expect(hasReadyQuestReward(noneReady)).toBe(false);
  });

  it("does not invent quest column or change claim rules (failure)", () => {
    expect(QUEST_PENDING_CLOSED_GLANCE.className).not.toMatch(
      /column|hud-quest-column/i,
    );
    expect(questPendingClosedGlanceLabel(ready)).not.toMatch(/nft|combat/i);
    expect(shouldShowQuestPendingClosedGlance(ready, false)).not.toBe(
      shouldShowQuestPendingClosedGlance(ready, true),
    );
    expect(countReadyQuests([{ status: "claimed" }])).toBe(0);
    expect(String(QUEST_PENDING_CLOSED_GLANCE.className)).not.toMatch(
      /toast|stack|fare/i,
    );
  });
});
