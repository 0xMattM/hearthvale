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
  EAT_FOOD_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  eatFoodSuccessCueText,
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
 * PL20.1 — Eat food ephemeral TopBar cue (+ soft SFX).
 * Energy numbers unchanged; empty / refuse stay silent.
 */
describe("CityLands PL20.1 eat food success cue", () => {
  it("ships eat SFX + Ate ephemeral cue (happy)", () => {
    expect(SFX_PRESETS.eat.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.eat).not.toEqual(SFX_PRESETS.harvest);
    expect(SFX_PRESETS.eat).not.toEqual(SFX_PRESETS.vendor_buy);
    expect(SFX_PRESETS.eat).not.toEqual(SFX_PRESETS.refuse);

    expect(eatFoodSuccessCueText()).toBe(EAT_FOOD_SUCCESS_CUE);
    expect(eatFoodSuccessCueText()).toBe("Ate");
    expect(isCoreSuccessCueText(EAT_FOOD_SUCCESS_CUE)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("eat")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.eat]);
    expect(sfxStepsFor("eat")).toEqual(SFX_PRESETS.eat);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.eat) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat sticky / fail eat prose as the cue; mute skips SFX (failure)", () => {
    expect(isCoreSuccessCueText("Ate bread (+energy).")).toBe(false);
    expect(isCoreSuccessCueText("Not enough food")).toBe(false);
    expect(isCoreSuccessCueText("Could not eat")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "eat")).toBe(false);
    expect(audio.playSfx("eat")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
