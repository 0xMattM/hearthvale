import { describe, expect, it } from "vitest";
import {
  NOTICE_BOARD_FIRST_WALKUP_WORLD_TIP,
  NOTICE_UNREAD_WORLD_CUE,
  cityNoticeTipIds,
  noticeBoardFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_NOTICE_BOARD_WALKUP_CUE,
  firstNoticeBoardWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstNoticeBoardWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL70.2 — First notice board walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near notice board;
 * tip / mail rules unchanged; min HUD.
 */
describe("CityLands PL70.2 first notice board walk-up tip once", () => {
  it("flashes Notices · city tips on first board proximity (happy)", () => {
    expect(firstNoticeBoardWalkUpCueText()).toBe(FIRST_NOTICE_BOARD_WALKUP_CUE);
    expect(firstNoticeBoardWalkUpCueText()).toBe("Notices · city tips");
    expect(firstNoticeBoardWalkUpCueText().toLowerCase()).toMatch(/tips/);
    expect(isCoreSuccessCueText("Notices · city tips")).toBe(true);
    expect(noticeBoardFirstWalkUpWorldTip()).toBe(
      NOTICE_BOARD_FIRST_WALKUP_WORLD_TIP,
    );
    expect(noticeBoardFirstWalkUpWorldTip()).toMatch(/Read/);
    expect(noticeBoardFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstNoticeBoardWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstNoticeBoardWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstNoticeBoardWalkUpCue(false, false, true)).toBe(
      false,
    );
    expect(shouldFlashFirstNoticeBoardWalkUpCue(true, false, false)).toBe(
      false,
    );
    expect(shouldFlashFirstNoticeBoardWalkUpCue(false, true, false)).toBe(
      false,
    );
  });

  it("keeps tip / mail rules and min HUD (failure)", () => {
    const tipIds = cityNoticeTipIds();
    expect(tipIds.length).toBeGreaterThan(0);
    expect(tipIds).toContain("fish_to_kitchen");
    expect(NOTICE_UNREAD_WORLD_CUE.worldLabel).toBe("New");
    expect(defaultClosedPanelIds()).toContain("notice");
    expect(defaultClosedPanelIds()).toContain("mail");
    expect(firstNoticeBoardWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(noticeBoardFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Notices · sticky forever")).toBe(false);
    expect(shouldFlashFirstNoticeBoardWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstNoticeBoardWalkUpCue(true, true, true)).toBe(false);
  });
});
