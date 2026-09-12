import { describe, expect, it } from "vitest";
import {
  MAYOR_NPC,
  TUTORIAL_NPCS,
  TUTORIAL_QUEST_CHAIN,
  visibleOnboardingQuestIds,
  welcomeMayorFirstSessionTip,
  mapSpawnPosition,
  MAP_SPAWN,
} from "@game/shared";

/**
 * Onboarding chain: Governor first, then stations one at a time.
 */
describe("onboarding quest chain", () => {
  it("starts at the Governor and reveals Farmer next (happy)", () => {
    expect(TUTORIAL_QUEST_CHAIN[0]).toBe("mayor");
    expect(TUTORIAL_QUEST_CHAIN[1]).toBe("farmer");
    expect(MAYOR_NPC.name).toBe("Governor");
    expect(TUTORIAL_NPCS.farmer.quest.objective).toBe("farm_starter_loop");
    expect(visibleOnboardingQuestIds(new Set())).toEqual([MAYOR_NPC.quest.id]);
    expect(
      visibleOnboardingQuestIds(new Set([MAYOR_NPC.quest.id])),
    ).toEqual([MAYOR_NPC.quest.id, TUTORIAL_NPCS.farmer.quest.id]);
  });

  it("walks the remaining stations after each claim (edge)", () => {
    const claimed = new Set([MAYOR_NPC.quest.id, TUTORIAL_NPCS.farmer.quest.id]);
    const visible = visibleOnboardingQuestIds(claimed);
    expect(visible.at(-1)).toBe(TUTORIAL_NPCS.cook.quest.id);
    expect(visible).toHaveLength(3);
    expect(TUTORIAL_QUEST_CHAIN).toContain("blacksmith");
    expect(TUTORIAL_QUEST_CHAIN).toContain("builder");
  });

  it("welcome copy and city spawn sit by City Hall (failure)", () => {
    const tip = welcomeMayorFirstSessionTip();
    expect(tip.toLowerCase()).toMatch(/welcome/);
    expect(tip.toLowerCase()).toMatch(/governor/);
    expect(mapSpawnPosition("city")).toEqual(MAP_SPAWN.city);
    expect(MAP_SPAWN.city.z).toBeLessThan(MAP_SPAWN.player_land.z);
    expect(mapSpawnPosition("nope")).toEqual(MAP_SPAWN.player_land);
    expect(visibleOnboardingQuestIds(new Set(["unknown"]))).toEqual([
      MAYOR_NPC.quest.id,
    ]);
  });
});
