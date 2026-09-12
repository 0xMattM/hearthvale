import { describe, expect, it } from "vitest";
import {
  ECONOMY_PROFESSIONS,
  TUTORIAL_NPCS,
  TUTOR_FIRST_WALKUP_WORLD_TIP,
  tutorFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_TUTOR_WALKUP_CUE,
  TUTOR_CLAIM_READY_EDGE_CUE,
  firstTutorWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstTutorWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL76.2 — First tutor NPC walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near any profession tutor;
 * tutor XP / claim rules unchanged; min HUD.
 */
describe("CityLands PL76.2 first tutor NPC walk-up tip once", () => {
  it("flashes Tutor · learn + claim on first tutor proximity (happy)", () => {
    expect(firstTutorWalkUpCueText()).toBe(FIRST_TUTOR_WALKUP_CUE);
    expect(firstTutorWalkUpCueText()).toBe("Tutor · learn + claim");
    expect(firstTutorWalkUpCueText().toLowerCase()).toMatch(/learn|claim/);
    expect(isCoreSuccessCueText("Tutor · learn + claim")).toBe(true);
    expect(tutorFirstWalkUpWorldTip()).toBe(TUTOR_FIRST_WALKUP_WORLD_TIP);
    expect(tutorFirstWalkUpWorldTip()).toMatch(/Talk/);
    expect(tutorFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstTutorWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstTutorWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstTutorWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstTutorWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstTutorWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps tutor XP / claim rules and min HUD (failure)", () => {
    expect(ECONOMY_PROFESSIONS.length).toBeGreaterThan(0);
    expect(TUTORIAL_NPCS.farmer.quest.rewardCharacterXp).toBe(18);
    expect(TUTORIAL_NPCS.farmer.quest.rewardCoins).toBe(6);
    expect(defaultClosedPanelIds()).toContain("tutorial_npc");
    expect(firstTutorWalkUpCueText()).not.toBe(TUTOR_CLAIM_READY_EDGE_CUE);
    expect(firstTutorWalkUpCueText().toLowerCase()).not.toContain("always-on");
    expect(tutorFirstWalkUpWorldTip().toLowerCase()).not.toContain("always-on");
    expect(isCoreSuccessCueText("Tutor · sticky forever")).toBe(false);
    expect(shouldFlashFirstTutorWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstTutorWalkUpCue(true, true, true)).toBe(false);
  });
});
