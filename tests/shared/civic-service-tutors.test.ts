import { describe, expect, it } from "vitest";
import {
  BROKER_NPC,
  CITY_BUILDINGS,
  CITY_LAND,
  CLERK_NPC,
  SEEDED_CITY_NPCS,
  TUTORIAL_QUEST_CHAIN,
  cityTutorialNpcGrid,
  cityTutorialNpcYaw,
  cityTutorYawGap,
  getTutorialNpc,
  getTutorialQuest,
  tutorialNpcWorldLabel,
  tutorialNpcWhereabouts,
} from "@game/shared";

/**
 * Civic Market Broker and Deed Clerk — teach player market and optional chain.
 */
describe("civic service tutors", () => {
  it("places Broker by the Market and Clerk by the Deed desk (happy)", () => {
    expect(getTutorialNpc("broker")).toEqual(BROKER_NPC);
    expect(getTutorialNpc("clerk")).toEqual(CLERK_NPC);
    expect(BROKER_NPC.quest.objective).toBe("talk");
    expect(CLERK_NPC.quest.objective).toBe("talk");
    expect(cityTutorialNpcGrid("broker")).toEqual({ x: 6, z: 0 });
    expect(cityTutorialNpcGrid("clerk")).toEqual({ x: 3, z: -2 });
    expect(tutorialNpcWorldLabel("broker")).toBe("Market Broker");
    expect(tutorialNpcWorldLabel("clerk")).toBe("Deed Clerk");
    expect(tutorialNpcWhereabouts("broker")).toMatch(/Market/);
    expect(tutorialNpcWhereabouts("clerk")).toMatch(/Deed desk/);
    expect(TUTORIAL_QUEST_CHAIN.at(-2)).toBe("broker");
    expect(TUTORIAL_QUEST_CHAIN.at(-1)).toBe("clerk");
    expect(SEEDED_CITY_NPCS).toContain("broker");
    expect(SEEDED_CITY_NPCS).toContain("clerk");
  });

  it("keeps unique cells, slots, and idle yaw (edge)", () => {
    const broker = CITY_BUILDINGS.find((b) => b.tutorialNpcId === "broker")!;
    const clerk = CITY_BUILDINGS.find((b) => b.tutorialNpcId === "clerk")!;
    expect(broker.slotIndex).toBe(32);
    expect(clerk.slotIndex).toBe(33);
    expect(CITY_BUILDINGS.length).toBe(CITY_LAND.buildSlots);
    expect(
      CITY_BUILDINGS.filter((b) => b.x === broker.x && b.z === broker.z),
    ).toHaveLength(1);
    expect(
      CITY_BUILDINGS.filter((b) => b.x === clerk.x && b.z === clerk.z),
    ).toHaveLength(1);
    expect(cityTutorYawGap(cityTutorialNpcYaw("broker"), cityTutorialNpcYaw("clerk"))).toBeGreaterThan(
      0.2,
    );
    expect(getTutorialQuest("tutorial_broker")?.npc.id).toBe("broker");
    expect(getTutorialQuest("tutorial_clerk")?.npc.id).toBe("clerk");
  });

  it("does not gate play on a wallet or invent economy professions (failure)", () => {
    expect(BROKER_NPC.basics.toLowerCase()).not.toMatch(/must link|required wallet/);
    expect(CLERK_NPC.basics.toLowerCase()).toMatch(/optional/);
    expect(CLERK_NPC.toolsNeeded.toLowerCase()).toMatch(/without a wallet/);
    expect(CLERK_NPC.basics.toLowerCase()).toMatch(/never combat/);
    expect(getTutorialNpc("market")).toBeNull();
    expect(getTutorialNpc("realm")).toBeNull();
    expect(BROKER_NPC.id).not.toBe("farmer");
  });
});
