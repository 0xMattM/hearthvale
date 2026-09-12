import { describe, expect, it } from "vitest";
import {
  TUTORIAL_NPCS,
  cityNoticeBoardTips,
  exploreMatsCraftChainTip,
} from "@game/shared";

describe("CityLands CL31.2 Hunter tutor / tip fidelity", () => {
  it("tip and tutors name Animal vs Monster Hunter XP (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "explore_mats_craft");
    expect(tip).toBeDefined();
    expect(tip!.body).toBe(exploreMatsCraftChainTip());
    expect(tip!.body.toLowerCase()).toMatch(/animal hunter xp/);
    expect(tip!.body.toLowerCase()).toMatch(/monster hunter xp/);
    expect(tip!.body.toLowerCase()).toMatch(/not.*cook|neither.*cook/);

    expect(TUTORIAL_NPCS.animal_hunter.basics.toLowerCase()).toMatch(
      /animal hunter xp/,
    );
    expect(TUTORIAL_NPCS.monster_hunter.basics.toLowerCase()).toMatch(
      /monster hunter xp/,
    );
    // Quest ids stay stable (loot objectives unchanged)
    expect(TUTORIAL_NPCS.animal_hunter.quest.objective).toBe("hold_leather");
    expect(TUTORIAL_NPCS.monster_hunter.quest.objective).toBe("hold_boar_tusk");
    expect(TUTORIAL_NPCS.animal_hunter.quest.id).toBe("tutorial_animal_hunter");
    expect(TUTORIAL_NPCS.monster_hunter.quest.id).toBe("tutorial_monster_hunter");
  });

  it("keeps explore_mats_craft tip id stable (edge)", () => {
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "explore_mats_craft")).toHaveLength(1);
    expect(ids).not.toContain("animal_monster_hunter_xp");
  });

  it("does not claim shared Hunter XP for both zones (failure)", () => {
    const body = exploreMatsCraftChainTip().toLowerCase();
    expect(body).not.toMatch(/grant hunter xp \(not cook\)/);
    expect(body).toMatch(/animal hunter xp/);
    expect(body).toMatch(/monster hunter xp/);
  });
});
