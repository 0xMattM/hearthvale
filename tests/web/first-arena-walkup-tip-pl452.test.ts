import { describe, expect, it } from "vitest";
import {
  ARENA_FIRST_WALKUP_WORLD_TIP,
  arenaFirstWalkUpWorldTip,
  arenaBoardWorldLabel,
  arenaInteractPrompt,
} from "@game/shared";
import {
  FIRST_ARENA_WALKUP_CUE,
  firstArenaWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstArenaWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL45.2 — Arena optional walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near arena plaque;
 * optional path / no gear ladder; free enter/exit; not sticky forever.
 */
describe("CityLands PL45.2 arena optional walk-up tip once", () => {
  it("flashes Arena · optional on first plaque proximity (happy)", () => {
    expect(firstArenaWalkUpCueText()).toBe(FIRST_ARENA_WALKUP_CUE);
    expect(firstArenaWalkUpCueText()).toBe("Arena · optional");
    expect(firstArenaWalkUpCueText().toLowerCase()).toMatch(/optional/);
    expect(isCoreSuccessCueText("Arena · optional")).toBe(true);
    expect(arenaFirstWalkUpWorldTip()).toBe(ARENA_FIRST_WALKUP_WORLD_TIP);
    expect(arenaFirstWalkUpWorldTip()).toMatch(/Optional/);
    expect(arenaFirstWalkUpWorldTip()).toMatch(/\bE\b/);
    expect(arenaBoardWorldLabel().toLowerCase()).toMatch(/optional|ladder/);
    expect(arenaInteractPrompt().toLowerCase()).toMatch(/optional/);

    expect(shouldFlashFirstArenaWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstArenaWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstArenaWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstArenaWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstArenaWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps free enter/exit and no balance invent / min HUD (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("travel");
    expect(firstArenaWalkUpCueText().toLowerCase()).not.toContain("always-on");
    expect(arenaFirstWalkUpWorldTip().toLowerCase()).not.toContain("always-on");
    expect(firstArenaWalkUpCueText().toLowerCase()).not.toMatch(
      /gear ladder|dps|stat/,
    );
    expect(isCoreSuccessCueText("Arena · sticky forever")).toBe(false);
    expect(shouldFlashFirstArenaWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstArenaWalkUpCue(true, true, true)).toBe(false);
  });
});
