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
  DECOR_PLACE_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  decorPlaceSuccessCueText,
  isCoreSuccessCueText,
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
 * PL16.2 — Decor place success cue (soft SFX + ephemeral TopBar line).
 */
describe("CityLands PL16.2 decor place success cue", () => {
  it("ships decor SFX + Decor placed ephemeral cue (happy)", () => {
    expect(SFX_PRESETS.decor.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.decor).not.toEqual(SFX_PRESETS.build);
    expect(SFX_PRESETS.decor).not.toEqual(SFX_PRESETS.refuse);

    expect(decorPlaceSuccessCueText()).toBe(DECOR_PLACE_SUCCESS_CUE);
    expect(decorPlaceSuccessCueText()).toBe("Decor placed");
    expect(isCoreSuccessCueText(DECOR_PLACE_SUCCESS_CUE)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("decor")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.decor]);
    expect(sfxStepsFor("decor")).toEqual(SFX_PRESETS.decor);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.decor) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat sticky cosmetic prose as the ephemeral cue; mute skips SFX (failure)", () => {
    expect(
      isCoreSuccessCueText("Decor placed — cosmetic only."),
    ).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(isCoreSuccessCueText("Could not place decor")).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "decor")).toBe(false);
    expect(audio.playSfx("decor")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
