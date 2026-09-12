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
  EXPAND_FIELD_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  expandFieldSuccessCueText,
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
 * PL20.3 — Expand field ephemeral TopBar cue (+ soft SFX).
 * Costs unchanged; fail silent or refuse path.
 */
describe("CityLands PL20.3 expand field success cue", () => {
  it("ships expand SFX + Expanded ephemeral cue (happy)", () => {
    expect(SFX_PRESETS.expand.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.expand).not.toEqual(SFX_PRESETS.build);
    expect(SFX_PRESETS.expand).not.toEqual(SFX_PRESETS.gather);
    expect(SFX_PRESETS.expand).not.toEqual(SFX_PRESETS.refuse);

    expect(expandFieldSuccessCueText()).toBe(EXPAND_FIELD_SUCCESS_CUE);
    expect(expandFieldSuccessCueText()).toBe("Expanded");
    expect(isCoreSuccessCueText(EXPAND_FIELD_SUCCESS_CUE)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("expand")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.expand]);
    expect(sfxStepsFor("expand")).toEqual(SFX_PRESETS.expand);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.expand) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat sticky / fail expand prose as the cue; mute skips SFX (failure)", () => {
    expect(isCoreSuccessCueText("Expanded land.")).toBe(false);
    expect(isCoreSuccessCueText("Not enough coins to expand")).toBe(false);
    expect(isCoreSuccessCueText("Could not expand")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "expand")).toBe(false);
    expect(audio.playSfx("expand")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
