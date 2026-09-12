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
  VISIT_SUCCESS_CUE_PREFIX,
  isCoreSuccessCueText,
  visitSuccessCueText,
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
 * PL15.1 — Visit arrive soft SFX + ephemeral TopBar cue.
 */
describe("CityLands PL15.1 visit arrive confirm", () => {
  it("ships visit SFX + Visiting · owner cue on success (happy)", () => {
    expect(SFX_PRESETS.visit.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.visit).not.toEqual(SFX_PRESETS.travel);
    expect(SFX_PRESETS.visit).not.toEqual(SFX_PRESETS.vendor_buy);

    const cue = visitSuccessCueText("alice");
    expect(cue).toBe("Visiting · alice");
    expect(cue?.startsWith(VISIT_SUCCESS_CUE_PREFIX)).toBe(true);
    expect(isCoreSuccessCueText(cue)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("visit")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.visit]);
    expect(sfxStepsFor("visit")).toEqual(SFX_PRESETS.visit);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.visit) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    expect(visitSuccessCueText("  bob  ")).toBe("Visiting · bob");
  });

  it("stays silent on empty/own refuse paths and mute (failure)", () => {
    expect(visitSuccessCueText("")).toBeNull();
    expect(visitSuccessCueText("   ")).toBeNull();
    expect(visitSuccessCueText(null)).toBeNull();
    expect(visitSuccessCueText(undefined)).toBeNull();
    // Sticky leave-hint prose is not the ephemeral arrive cue
    expect(
      isCoreSuccessCueText("Visiting bob. Esc or Go home to leave."),
    ).toBe(false);
    expect(isCoreSuccessCueText("You are already on your own land.")).toBe(
      false,
    );

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "visit")).toBe(false);
    expect(audio.playSfx("visit")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
