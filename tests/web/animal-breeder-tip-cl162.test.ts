import { describe, expect, it } from "vitest";
import {
  animalBreederPathTip,
  CITY_BUILDINGS,
  CITY_PRACTICE_STATIONS,
  cityNoticeBoardTips,
  SEEDED_CITY_TUTORIAL_NPCS,
  TUTORIAL_NPCS,
} from "@game/shared";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

describe("CityLands CL16.2 / CL27 Animal Breeder path tip", () => {
  it("documents land pen feed path via notice tip (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "animal_breeder_path");
    expect(tip).toBeDefined();
    expect(tip!.title).toMatch(/Animal Breeder/i);
    expect(tip!.body).toBe(animalBreederPathTip());
    expect(tip!.body.toLowerCase()).toMatch(/pen|wheat|feed/);
    expect(TUTORIAL_NPCS.animal_breeder.seededOnCity).toBe(true);
    expect(TUTORIAL_NPCS.animal_breeder.quest.objective).toBe("feed_animal_pen");
    expect(SEEDED_CITY_TUTORIAL_NPCS).toContain("animal_breeder");
    expect(
      CITY_BUILDINGS.some((b) => b.tutorialNpcId === "animal_breeder"),
    ).toBe(true);
  });

  it("maps practice to scarce city animal_pen and notice walk-up only (edge)", () => {
    expect(CITY_PRACTICE_STATIONS.animal_breeder).toEqual(["animal_pen"]);
    expect(defaultClosedPanelIds()).toContain("notice");
  });

  it("does not invent livestock combat (failure)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "animal_breeder_path")!;
    expect(tip.body.toLowerCase()).not.toMatch(/combat|arena|hunt damage/);
    expect(
      cityNoticeBoardTips().every((t) => t.id !== "animal_breeder_combat"),
    ).toBe(true);
    expect(TUTORIAL_NPCS.animal_breeder.quest.rewardCoins).toBeGreaterThan(0);
  });
});
