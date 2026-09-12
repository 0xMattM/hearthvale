import { describe, expect, it } from "vitest";
import { TUTORIAL_QUEST_CHAIN, type QuestStatus } from "@game/shared";
import {
  partitionQuestBoard,
  questBoardEmptyNote,
  questBoardPipKind,
  questBoardProgress,
  questStatusLabel,
  type QuestBoardRow,
} from "../../apps/web/lib/hud/quest-board-view";

function row(
  over: Partial<QuestBoardRow> & Pick<QuestBoardRow, "id" | "status">,
): QuestBoardRow {
  return {
    title: over.title ?? over.id,
    blurb: over.blurb ?? "Do the work.",
    rewardCoins: over.rewardCoins ?? 6,
    rewardCharacterXp: over.rewardCharacterXp ?? 18,
    claimAtNpc: over.claimAtNpc,
    ...over,
  };
}

describe("quest board view", () => {
  it("features the ready errand and compact finished list (happy)", () => {
    const quests = [
      row({ id: "tutorial_mayor", status: "claimed", title: "Meet the Farmer" }),
      row({ id: "tutorial_farmer", status: "claimed", title: "First Harvest" }),
      row({
        id: "tutorial_carpenter",
        status: "ready",
        title: "Carpenter Basics",
        claimAtNpc: "Carpenter Tutor",
      }),
    ];
    const board = partitionQuestBoard(quests);
    expect(board.current?.id).toBe("tutorial_carpenter");
    expect(board.done.map((q) => q.id)).toEqual([
      "tutorial_mayor",
      "tutorial_farmer",
    ]);
    expect(questStatusLabel("ready")).toBe("Turn in");
    expect(questStatusLabel("claimed")).toBe("Done");
    const progress = questBoardProgress(quests);
    expect(progress.done).toBe(2);
    expect(progress.total).toBe(TUTORIAL_QUEST_CHAIN.length);
    expect(questBoardPipKind(0, 2, true)).toBe("done");
    expect(questBoardPipKind(2, 2, true)).toBe("current");
    expect(questBoardEmptyNote({ current: board.current, ...progress })).toBe(
      null,
    );
  });

  it("handles empty, locked, and all-claimed boards (edge)", () => {
    expect(partitionQuestBoard([]).current).toBeNull();
    expect(partitionQuestBoard([]).done).toEqual([]);
    expect(
      questBoardEmptyNote({ current: null, done: 0, total: 14 }),
    ).toMatch(/Governor/);

    const locked = partitionQuestBoard([
      row({ id: "tutorial_farmer", status: "locked" }),
    ]);
    expect(locked.current?.status).toBe("locked");
    expect(questStatusLabel("locked")).toBe("Locked");
    expect(questStatusLabel("active")).toBe("Current");

    const finished = [
      row({ id: "a", status: "claimed" }),
      row({ id: "b", status: "claimed" }),
    ];
    expect(partitionQuestBoard(finished).current).toBeNull();
    expect(
      questBoardEmptyNote({
        current: null,
        done: TUTORIAL_QUEST_CHAIN.length,
        total: TUTORIAL_QUEST_CHAIN.length,
      }),
    ).toMatch(/stations stay open/);
    const n = TUTORIAL_QUEST_CHAIN.length;
    expect(questBoardPipKind(n - 1, n, false)).toBe("done");
    expect(questBoardPipKind(n, n, false)).toBe("todo");
    expect(questBoardPipKind(-1, 0, true)).toBe("todo");
  });

  it("never treats the board as a claim surface (failure)", () => {
    const unknown = questStatusLabel("bogus" as QuestStatus);
    expect(unknown).toBe("Current");
    expect(unknown.toLowerCase()).not.toMatch(/claim/);
    expect(questBoardProgress([]).done).toBe(0);
    expect(questBoardProgress([]).total).toBeGreaterThan(0);
    expect(
      questBoardEmptyNote({ current: null, done: 0, total: 0 }),
    ).toBe("No errands posted.");
    const tooManyClaimed = questBoardProgress(
      Array.from({ length: 40 }, (_, i) => row({ id: `q${i}`, status: "claimed" })),
    );
    expect(tooManyClaimed.done).toBe(TUTORIAL_QUEST_CHAIN.length);
    expect(tooManyClaimed.done).toBeLessThanOrEqual(tooManyClaimed.total);
  });
});
