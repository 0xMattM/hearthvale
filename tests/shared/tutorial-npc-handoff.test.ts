import { describe, expect, it } from "vitest";
import {
  TUTORIAL_NPCS,
  TUTORIAL_QUEST_CHAIN,
  nextTutorialNpcInChain,
  tutorialNpcHandoffLines,
  tutorialNpcSpokenName,
} from "@game/shared";

/**
 * After a claim, the tutor points at the next station — not a dead end.
 */
describe("tutorial NPC handoff", () => {
  it("sends Farmer to the Cook and Carpenter to the Miner (happy)", () => {
    expect(nextTutorialNpcInChain("mayor")?.id).toBe("farmer");
    expect(nextTutorialNpcInChain("farmer")?.id).toBe("cook");
    expect(nextTutorialNpcInChain("carpenter")?.id).toBe("miner");
    expect(nextTutorialNpcInChain("miner")?.id).toBe("blacksmith");
    expect(tutorialNpcSpokenName("blacksmith")).toBe("Blacksmith");
    const farmerHandoff = tutorialNpcHandoffLines("farmer");
    expect(farmerHandoff[0]).toMatch(/all I can teach/i);
    expect(farmerHandoff[1]).toMatch(/Cook/);
    expect(farmerHandoff[1]).toMatch(/Kitchen/);
    const smithHandoff = tutorialNpcHandoffLines("miner");
    expect(smithHandoff[1]).toMatch(/Blacksmith/);
    expect(smithHandoff[1]).toMatch(/Forge/);
  });

  it("ends the chain at the last tutor and names every step (edge)", () => {
    const last = TUTORIAL_QUEST_CHAIN[TUTORIAL_QUEST_CHAIN.length - 1];
    expect(last).toBe("clerk");
    expect(nextTutorialNpcInChain(last)).toBeNull();
    const endLines = tutorialNpcHandoffLines("clerk");
    expect(endLines[0]).toMatch(/all I can teach/i);
    expect(endLines.join(" ")).toMatch(/every city tutor/i);
    expect(endLines.join(" ")).not.toMatch(/Go talk to/i);
    expect(tutorialNpcSpokenName("forester")).toBe("Forester");
    expect(tutorialNpcSpokenName("mayor")).toBe("Governor");
    expect(tutorialNpcSpokenName("broker")).toBe("Market Broker");
    expect(tutorialNpcSpokenName("clerk")).toBe("Deed Clerk");
    expect(tutorialNpcHandoffLines("mayor")[1]).toMatch(/Farmer/);
    expect(tutorialNpcHandoffLines("monster_hunter")[1]).toMatch(/Market Broker/);
    expect(tutorialNpcHandoffLines("broker")[1]).toMatch(/Deed Clerk/);
    expect(tutorialNpcHandoffLines("animal_breeder")[1]).toMatch(/Builder/);
    expect(tutorialNpcHandoffLines("animal_breeder")[1]).toMatch(/fountain/);
    expect(tutorialNpcHandoffLines("builder")[1]).not.toMatch(/portal/);
    expect(TUTORIAL_NPCS.cook.name).toMatch(/Cook/);
  });

  it("does not invent a next tutor for unknown ids (failure)", () => {
    expect(nextTutorialNpcInChain("nope")).toBeNull();
    expect(nextTutorialNpcInChain("")).toBeNull();
    expect(tutorialNpcSpokenName("nope")).toBe("tutor");
    const unknown = tutorialNpcHandoffLines("wizard");
    expect(unknown.join(" ").toLowerCase()).not.toMatch(/blacksmith/);
    expect(unknown.join(" ").toLowerCase()).not.toMatch(/claim/);
    expect(unknown[0]).toMatch(/forget the steps/i);
  });
});
