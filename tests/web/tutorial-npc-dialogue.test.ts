import { describe, expect, it } from "vitest";
import type { TutorialNpcView } from "../../apps/web/lib/api";
import { shouldSkipTutorialNpcReopen } from "../../apps/web/lib/hud/panel-orchestration";
import {
  MAYOR_DIALOGUE_ACCEPT,
  dialogueAdvanceAction,
  splitSpokenSentences,
  tutorialNpcDialogueLines,
} from "../../apps/web/lib/hud/tutorial-npc-dialogue";

function npc(over: Partial<TutorialNpcView> = {}): TutorialNpcView {
  return {
    id: "farmer",
    name: "Farmer Tutor",
    basics: "Buy wheat seeds at the Vendor. Plant them on a Field.",
    toolsNeeded: "Wooden Hoe for planting.",
    buildingsNeeded: "Crop Field plus the Vendor stall.",
    seededOnCity: true,
    quest: {
      id: "tutorial_farmer",
      title: "First Harvest",
      blurb: "Buy seeds, plant, then harvest ripe wheat.",
      status: "active",
      rewardCoins: 6,
      rewardCharacterXp: 18,
    },
    ...over,
  };
}

describe("tutorial NPC dialogue", () => {
  it("speaks mayor lore one sentence at a time then offers the Farmer reply (happy)", () => {
    const mayor = npc({
      id: "mayor",
      name: "Governor",
      basics:
        "Welcome, newcomer. This plaza is our shared City — scarce stations, tutors at every craft, a market, and City Hall behind me. Your own land is a short trip through the portal when you are ready to build.",
      toolsNeeded:
        "Start with the Farmer by the wheat plots northwest of the plaza. Buy seeds at the Vendor if you need them.",
      buildingsNeeded:
        "City Hall is the civic heart. Every station has a tutor beside it — follow them in order.",
      quest: {
        id: "tutorial_mayor",
        title: "Meet the Farmer",
        blurb: "Find the Farmer by the wheat plots northwest of the plaza.",
        status: "ready",
        rewardCoins: 4,
        rewardCharacterXp: 10,
      },
    });
    const beats = tutorialNpcDialogueLines(mayor);
    expect(beats[0]).toEqual({
      speaker: "npc",
      text: "Welcome, newcomer.",
    });
    expect(beats.some((beat) => beat.text.includes("shared City"))).toBe(true);
    expect(beats.some((beat) => beat.text.includes("Farmer"))).toBe(true);
    const last = beats[beats.length - 1];
    expect(last).toEqual({
      speaker: "player",
      text: MAYOR_DIALOGUE_ACCEPT,
      claim: true,
    });
    expect(beats.filter((beat) => beat.claim).length).toBe(1);
    expect(dialogueAdvanceAction(beats, 0)).toBe("next");
    expect(dialogueAdvanceAction(beats, beats.length - 1)).toBe("claim");
    const mayorClaimed = tutorialNpcDialogueLines({
      ...mayor,
      quest: { ...mayor.quest, status: "claimed" },
    });
    expect(mayorClaimed.some((beat) => beat.claim)).toBe(false);
    expect(mayorClaimed[0]?.text).toMatch(/all I can teach/i);
    expect(mayorClaimed.some((beat) => /Farmer/.test(beat.text))).toBe(true);
    expect(
      shouldSkipTutorialNpcReopen("tutorial_npc", "mayor", "mayor"),
    ).toBe(true);
  });

  it("splits sentences, locks the Farmer, and skips reopen only for the same tutor (edge)", () => {
    expect(splitSpokenSentences("")).toEqual([]);
    expect(splitSpokenSentences("  ")).toEqual([]);
    expect(splitSpokenSentences("Hello. Next line!")).toEqual([
      "Hello.",
      "Next line!",
    ]);

    const locked = tutorialNpcDialogueLines(npc({ quest: { ...npc().quest, status: "locked" } }));
    expect(locked.every((beat) => beat.speaker === "npc")).toBe(true);
    expect(locked.some((beat) => beat.text.includes("Governor"))).toBe(true);
    expect(locked.some((beat) => beat.claim)).toBe(false);

    const claimed = tutorialNpcDialogueLines(
      npc({ quest: { ...npc().quest, status: "claimed" } }),
    );
    expect(claimed.some((beat) => beat.claim)).toBe(false);
    expect(claimed[0]?.text).toMatch(/all I can teach/i);
    expect(claimed.some((beat) => /Cook/.test(beat.text))).toBe(true);
    expect(claimed.some((beat) => /already claimed/i.test(beat.text))).toBe(
      false,
    );
    expect(dialogueAdvanceAction(claimed, claimed.length - 1)).toBe("close");

    const loading = tutorialNpcDialogueLines(null);
    expect(loading).toEqual([{ speaker: "npc", text: "…" }]);
    expect(dialogueAdvanceAction(loading, 0)).toBe("close");

    expect(shouldSkipTutorialNpcReopen(null, "mayor", "mayor")).toBe(false);
    expect(
      shouldSkipTutorialNpcReopen("tutorial_npc", "mayor", "farmer"),
    ).toBe(false);
    expect(shouldSkipTutorialNpcReopen("quests", "mayor", "mayor")).toBe(false);
  });

  it("does not dump a claim beat when copy is empty or status is unknown (failure)", () => {
    const empty = tutorialNpcDialogueLines(
      npc({
        basics: "",
        toolsNeeded: "   ",
        buildingsNeeded: "",
        quest: { ...npc().quest, blurb: "", status: "bogus" },
      }),
    );
    expect(empty.length).toBeGreaterThan(0);
    expect(empty.every((beat) => beat.speaker === "npc")).toBe(true);
    expect(empty.some((beat) => beat.claim)).toBe(false);

    expect(dialogueAdvanceAction([], 0)).toBe("close");
    expect(dialogueAdvanceAction(empty, -1)).toBe("close");
    expect(dialogueAdvanceAction(empty, 99)).toBe("close");

    const readyFarmer = tutorialNpcDialogueLines(
      npc({ quest: { ...npc().quest, status: "ready" } }),
    );
    const claim = readyFarmer[readyFarmer.length - 1];
    expect(claim?.claim).toBe(true);
    expect(claim?.text).toBe("I'll take that.");
    expect(readyFarmer.some((beat) => /Basics|Tools needed/.test(beat.text))).toBe(
      false,
    );

    const lastClaimed = tutorialNpcDialogueLines(
      npc({
        id: "clerk",
        name: "Deed Clerk",
        quest: { ...npc().quest, status: "claimed" },
      }),
    );
    expect(lastClaimed.map((beat) => beat.text).join(" ")).not.toMatch(
      /Go talk to/i,
    );
    expect(lastClaimed.some((beat) => beat.claim)).toBe(false);
  });
});
