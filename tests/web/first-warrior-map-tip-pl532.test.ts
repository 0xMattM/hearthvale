import { describe, expect, it } from "vitest";
import {
  WARRIOR_FIRST_MAP_WORLD_TIP,
  warriorFirstMapWorldTip,
} from "@game/shared";
import {
  FIRST_ARENA_WALKUP_CUE,
  FIRST_WARRIOR_MAP_CUE,
  firstArenaWalkUpCueText,
  firstWarriorMapCueText,
  isCoreSuccessCueText,
  isEnteringWarriorMap,
  shouldFlashFirstWarriorMapCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL53.2 — First warrior map presence tip once.
 * One-shot ephemeral TopBar + soft world tip on first Warrior map presence;
 * complements PL45.2 plaque tip; no balance invent; free enter/exit; min HUD.
 */
describe("CityLands PL53.2 first warrior map presence tip once", () => {
  it("flashes Warrior · optional on first map presence (happy)", () => {
    expect(firstWarriorMapCueText()).toBe(FIRST_WARRIOR_MAP_CUE);
    expect(firstWarriorMapCueText()).toBe("Warrior · optional");
    expect(firstWarriorMapCueText().toLowerCase()).toMatch(/warrior|optional/);
    expect(isCoreSuccessCueText("Warrior · optional")).toBe(true);
    expect(warriorFirstMapWorldTip()).toBe(WARRIOR_FIRST_MAP_WORLD_TIP);
    expect(warriorFirstMapWorldTip()).toMatch(/Optional|free/i);

    expect(isEnteringWarriorMap("city", "warrior")).toBe(true);
    expect(isEnteringWarriorMap(null, "warrior")).toBe(true);
    expect(shouldFlashFirstWarriorMapCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and distinct from plaque tip (edge)", () => {
    expect(shouldFlashFirstWarriorMapCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstWarriorMapCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstWarriorMapCue(true, false, false)).toBe(false);
    expect(isEnteringWarriorMap("warrior", "warrior")).toBe(false);
    expect(isEnteringWarriorMap("warrior", "city")).toBe(false);
    expect(isEnteringWarriorMap("city", "city")).toBe(false);
    // Complements PL45.2 plaque tip — map cue is distinct wording.
    expect(firstWarriorMapCueText()).not.toBe(firstArenaWalkUpCueText());
    expect(FIRST_WARRIOR_MAP_CUE).not.toBe(FIRST_ARENA_WALKUP_CUE);
  });

  it("keeps travel closed and free enter/exit / min HUD unchanged (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("travel");
    expect(firstWarriorMapCueText().toLowerCase()).not.toContain("always-on");
    expect(warriorFirstMapWorldTip().toLowerCase()).not.toContain("always-on");
    expect(firstWarriorMapCueText().toLowerCase()).not.toMatch(
      /ladder|gear|dps|power/,
    );
    expect(isCoreSuccessCueText("Warrior · sticky forever")).toBe(false);
    expect(shouldFlashFirstWarriorMapCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstWarriorMapCue(true, true, true)).toBe(false);
  });
});
