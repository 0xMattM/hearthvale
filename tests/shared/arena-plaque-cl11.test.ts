import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  LAND_DESTINATIONS,
  PLAYER_LAND_BUILDINGS,
  PLAYER_LAND_STATIONS,
  WARRIOR_TRAINING_BUILDING_TYPES,
  arenaBoardWorldLabel,
  arenaInteractPrompt,
  arenaPlaqueCopy,
  cityNoticeBoardTips,
  freeTravelPortalPrompt,
  isPlayerLandStationType,
  isWarriorTrainingBuildingType,
  warriorArenaExitHint,
  warriorArenaExitLabel,
} from "@game/shared";

describe("CityLands CL11.1 arena plaque + exit clarity", () => {
  it("states optional / no gear ladder and free exit (happy)", () => {
    const copy = arenaPlaqueCopy();
    expect(copy.title).toMatch(/warrior arena/i);
    expect(copy.lead.toLowerCase()).toMatch(/optional/);
    expect(copy.lead.toLowerCase()).toMatch(/profession ladder/);
    expect(copy.body.toLowerCase()).toMatch(/gear ladder|combat gear/);
    expect(copy.exitHint).toMatch(/\bN\b/);
    expect(copy.exitHint.toLowerCase()).toMatch(/portal|exit/);
    expect(copy.exitHint.toLowerCase()).toMatch(/free/);
    expect(copy.noLadderNote.toLowerCase()).toMatch(/no combat gear ladder/);
    expect(copy.noLadderNote.toLowerCase()).toMatch(/homestead|your land/);

    expect(arenaInteractPrompt().toLowerCase()).toMatch(/optional/);
    expect(arenaInteractPrompt().toLowerCase()).toMatch(/no ladder/);
    expect(warriorArenaExitLabel()).toMatch(/Exit/);
    expect(warriorArenaExitLabel()).toMatch(/\bN\b/);
    expect(warriorArenaExitHint().toLowerCase()).toMatch(/north|portal/);
    expect(arenaBoardWorldLabel().toLowerCase()).toMatch(/optional/);
  });

  it("warrior portal prompt stresses Exit + N; other maps keep Travel · free (edge)", () => {
    const warrior = freeTravelPortalPrompt("warrior");
    expect(warrior).toMatch(/^Exit · Travel · free/);
    expect(warrior).toMatch(/\bN\b/);
    expect(warrior).toContain("City");

    const city = freeTravelPortalPrompt("city");
    expect(city).toMatch(/^Travel · free/);
    expect(city).not.toMatch(/^Exit/);

    const bare = freeTravelPortalPrompt();
    expect(bare).toMatch(/^Travel · free/);
  });

  it("rejects combat-ladder / paid-exit language in destination + notice tip (failure)", () => {
    const warriorDest = LAND_DESTINATIONS.find((d) => d.kind === "warrior")!;
    expect(warriorDest.blurb.toLowerCase()).toMatch(/optional|free/);
    expect(warriorDest.blurb.toLowerCase()).toMatch(/no gear|profession ladder/);
    expect(warriorDest.blurb.toLowerCase()).not.toMatch(
      /required class|must fight|gear unlock/,
    );

    const tip = cityNoticeBoardTips().find((t) => t.id === "warrior_optional")!;
    expect(tip.body.toLowerCase()).toMatch(/not required/);
    expect(tip.body.toLowerCase()).toMatch(/profession ladder/);
    expect(tip.body.toLowerCase()).toMatch(/gear ladder|enter and leave|exit/);
    expect(tip.body).toMatch(/\bN\b/);
  });
});

describe("CityLands CL11.2 no warrior training on player land", () => {
  it("keeps arena boards out of homestead catalog (happy)", () => {
    for (const type of WARRIOR_TRAINING_BUILDING_TYPES) {
      expect(isWarriorTrainingBuildingType(type)).toBe(true);
      expect(isPlayerLandStationType(type)).toBe(false);
      expect(type in PLAYER_LAND_STATIONS).toBe(false);
    }
    expect(
      PLAYER_LAND_BUILDINGS.some((b) => isWarriorTrainingBuildingType(b.type)),
    ).toBe(false);
    expect(Object.keys(PLAYER_LAND_STATIONS)).not.toContain("arena_board");
  });

  it("treats unknown production ids as non-training (edge)", () => {
    expect(isWarriorTrainingBuildingType("mill")).toBe(false);
    expect(isWarriorTrainingBuildingType("portal")).toBe(false);
    expect(isWarriorTrainingBuildingType("")).toBe(false);
  });

  it("documents homestead refusal copy for training buildings (failure)", () => {
    expect(ACTION_ERROR.warriorTrainingHomesteadForbidden.toLowerCase()).toMatch(
      /arena|warrior/,
    );
    expect(ACTION_ERROR.warriorTrainingHomesteadForbidden.toLowerCase()).toMatch(
      /not on your land|your land/,
    );
  });
});
