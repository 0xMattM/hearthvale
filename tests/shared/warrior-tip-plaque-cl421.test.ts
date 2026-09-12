import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ECONOMY_PROFESSIONS,
  LAND_DESTINATIONS,
  PLAYER_LAND_BUILDINGS,
  PLAYER_LAND_STATIONS,
  TUTORIAL_NPCS,
  WARRIOR_TRAINING_BUILDING_TYPES,
  arenaPlaqueCopy,
  cityNoticeBoardTips,
  isPlayerLandStationType,
  isWarriorTrainingBuildingType,
} from "@game/shared";

/** Balance / ladder phrases that must stay out of optional warrior copy. */
const BALANCE_OR_LADDER_PATTERNS = [
  /\b\d+\s*(dps|hp|damage|defense|atk|def)\b/i,
  /\bgear\s*score\b/i,
  /\breq(uired)?\s*level\b/i,
  /\bmust\s+fight\b/i,
  /\bclass\s+lock\b/i,
];

describe("CityLands CL42.1 Warrior arena tip / plaque fidelity", () => {
  it("keeps tip + plaque optional with free exit (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "warrior_optional")!;
    expect(tip.title.toLowerCase()).toMatch(/optional/);
    expect(tip.body.toLowerCase()).toMatch(/not required|optional/);
    expect(tip.body.toLowerCase()).toMatch(/profession ladder/);
    expect(tip.body.toLowerCase()).toMatch(/gear ladder/);
    expect(tip.body).toMatch(/\bN\b/);
    expect(tip.body.toLowerCase()).toMatch(/exit|portal/);

    const plaque = arenaPlaqueCopy();
    expect(plaque.lead.toLowerCase()).toMatch(/optional/);
    expect(plaque.lead.toLowerCase()).toMatch(/profession ladder/);
    expect(plaque.body.toLowerCase()).toMatch(/placeholder|stub/);
    expect(plaque.exitHint.toLowerCase()).toMatch(/free|anytime/);
    expect(plaque.noLadderNote.toLowerCase()).toMatch(/homestead|your land/);

    const dest = LAND_DESTINATIONS.find((d) => d.kind === "warrior")!;
    expect(dest.blurb.toLowerCase()).toMatch(/optional/);
    expect(dest.blurb.toLowerCase()).toMatch(/not on the profession|no combat gear ladder/);
  });

  it("omits balance numbers from tip, plaque, and destination (edge)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "warrior_optional")!;
    const plaque = arenaPlaqueCopy();
    const dest = LAND_DESTINATIONS.find((d) => d.kind === "warrior")!;
    const blobs = [
      tip.title,
      tip.body,
      plaque.title,
      plaque.lead,
      plaque.body,
      plaque.exitHint,
      plaque.noLadderNote,
      dest.blurb,
    ];
    for (const text of blobs) {
      for (const pattern of BALANCE_OR_LADDER_PATTERNS) {
        expect(text).not.toMatch(pattern);
      }
    }
  });

  it("keeps warrior training off homestead and economy tutors (failure)", () => {
    for (const type of WARRIOR_TRAINING_BUILDING_TYPES) {
      expect(isWarriorTrainingBuildingType(type)).toBe(true);
      expect(isPlayerLandStationType(type)).toBe(false);
      expect(type in PLAYER_LAND_STATIONS).toBe(false);
    }
    expect(
      PLAYER_LAND_BUILDINGS.some((b) => isWarriorTrainingBuildingType(b.type)),
    ).toBe(false);
    expect(ACTION_ERROR.warriorTrainingHomesteadForbidden.toLowerCase()).toMatch(
      /not on your land|your land/,
    );

    for (const id of ECONOMY_PROFESSIONS) {
      expect(id).not.toBe("warrior");
    }
    expect(Object.keys(TUTORIAL_NPCS)).not.toContain("warrior");
  });
});
