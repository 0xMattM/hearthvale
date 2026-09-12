import { describe, expect, it } from "vitest";
import {
  TUTORIAL_NPCS,
  animalBreederPathTip,
  cityNoticeBoardTips,
} from "@game/shared";

describe("CityLands CL37.3 Breeder path tip names feed + clean", () => {
  it("tip and tutor basics name wheat feed and wood bedding (happy)", () => {
    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "animal_breeder_path",
    );
    expect(tip).toBeDefined();
    expect(tip!.body).toBe(animalBreederPathTip());
    const tipBody = tip!.body.toLowerCase();
    expect(tipBody).toMatch(/wheat|feed/);
    expect(tipBody).toMatch(/wood|bedding/);

    const basics = TUTORIAL_NPCS.animal_breeder.basics.toLowerCase();
    expect(basics).toMatch(/wheat|feed/);
    expect(basics).toMatch(/wood|bedding/);
    expect(TUTORIAL_NPCS.animal_breeder.toolsNeeded.toLowerCase()).toMatch(
      /wheat/,
    );
    expect(TUTORIAL_NPCS.animal_breeder.toolsNeeded.toLowerCase()).toMatch(
      /wood/,
    );
  });

  it("keeps animal_breeder_path tip id and feed quest stable (edge)", () => {
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "animal_breeder_path")).toHaveLength(1);
    expect(TUTORIAL_NPCS.animal_breeder.quest.id).toBe(
      "tutorial_animal_breeder",
    );
    expect(TUTORIAL_NPCS.animal_breeder.quest.objective).toBe(
      "feed_animal_pen",
    );
  });

  it("does not invent livestock combat on tip or tutor (failure)", () => {
    const tip = animalBreederPathTip().toLowerCase();
    const tutor = `${TUTORIAL_NPCS.animal_breeder.basics} ${TUTORIAL_NPCS.animal_breeder.toolsNeeded}`.toLowerCase();
    expect(tip).not.toMatch(/\bcombat\b|\barena\b/);
    expect(tutor).not.toMatch(/\bcombat\b|\barena\b/);
  });
});
