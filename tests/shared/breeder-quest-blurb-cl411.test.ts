import { describe, expect, it } from "vitest";
import { TUTORIAL_NPCS, cityNoticeBoardTips } from "@game/shared";

describe("CityLands CL41.1 Breeder quest blurb names clean beat", () => {
  it("quest blurb mentions feed and clean/bedding (happy)", () => {
    const blurb = TUTORIAL_NPCS.animal_breeder.quest.blurb.toLowerCase();
    expect(blurb).toMatch(/feed|wheat/);
    expect(blurb).toMatch(/wood|bedding|clean|refresh/);
    expect(TUTORIAL_NPCS.animal_breeder.basics.toLowerCase()).toMatch(
      /wheat|feed/,
    );
    expect(TUTORIAL_NPCS.animal_breeder.basics.toLowerCase()).toMatch(
      /wood|bedding/,
    );
  });

  it("keeps feed_animal_pen objective and tip id stable (edge)", () => {
    expect(TUTORIAL_NPCS.animal_breeder.quest.id).toBe(
      "tutorial_animal_breeder",
    );
    expect(TUTORIAL_NPCS.animal_breeder.quest.objective).toBe(
      "feed_animal_pen",
    );
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "animal_breeder_path")).toHaveLength(1);
  });

  it("does not claim livestock combat in quest blurb (failure)", () => {
    const blurb = TUTORIAL_NPCS.animal_breeder.quest.blurb.toLowerCase();
    expect(blurb).not.toMatch(/combat|battle|fight|arena/);
  });
});
