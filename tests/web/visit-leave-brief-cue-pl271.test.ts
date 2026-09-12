import { describe, expect, it } from "vitest";
import {
  SFX_PRESETS,
  createGameAudio,
  sfxStepsFor,
  shouldPlaySfx,
  type TonePlayer,
  type ToneStep,
} from "../../apps/web/lib/game-audio";
import {
  SUCCESS_CUE_MS,
  VISIT_LEAVE_SUCCESS_CUE,
  isCoreSuccessCueText,
  visitLeaveSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

function mockPlayer() {
  const played: ToneStep[][] = [];
  const player: TonePlayer = {
    playSteps(steps) {
      played.push(steps);
    },
    startDrone() {
      return () => undefined;
    },
  };
  return { player, played };
}

/**
 * PL27.1 — Visit leave soft SFX + ephemeral TopBar cue (complement PL15.1 arrive).
 */
describe("CityLands PL27.1 visit leave brief cue", () => {
  it("ships visit_leave SFX + Home cue on leave success (happy)", () => {
    expect(SFX_PRESETS.visit_leave.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.visit_leave).not.toEqual(SFX_PRESETS.visit);
    expect(SFX_PRESETS.visit_leave).not.toEqual(SFX_PRESETS.travel);

    const cue = visitLeaveSuccessCueText();
    expect(cue).toBe("Home");
    expect(cue).toBe(VISIT_LEAVE_SUCCESS_CUE);
    expect(isCoreSuccessCueText(cue)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("visit_leave")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.visit_leave]);
    expect(sfxStepsFor("visit_leave")).toEqual(SFX_PRESETS.visit_leave);
  });

  it("keeps soft gain, descending settle, and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.visit_leave) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    // Descending mirror of arrive (high → low)
    expect(SFX_PRESETS.visit_leave[0]!.freq).toBeGreaterThan(
      SFX_PRESETS.visit_leave[SFX_PRESETS.visit_leave.length - 1]!.freq,
    );
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("stays silent on sticky leave prose / mute; sticky is not the cue (failure)", () => {
    // Former sticky leave copy must not read as ephemeral success
    expect(isCoreSuccessCueText("Back on your land.")).toBe(false);
    expect(
      isCoreSuccessCueText("Visiting bob. Esc or Go home to leave."),
    ).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "visit_leave")).toBe(false);
    expect(audio.playSfx("visit_leave")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
