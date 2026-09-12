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
  HUNT_LOSE_SUCCESS_CUE,
  HUNT_LOSE_SUCCESS_CUE_PREFIX,
  HUNT_WIN_SUCCESS_CUE,
  HUNT_WIN_SUCCESS_CUE_PREFIX,
  SUCCESS_CUE_MS,
  huntEncounterSuccessCueText,
  huntLoseSuccessCueText,
  huntWinSuccessCueText,
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
 * PL33.2 — Hunt encounter brief win/lose cues (+ soft lose SFX).
 * Loot / energy drain rules unchanged; sticky encounter prose removed; mute ok.
 */
describe("CityLands PL33.2 hunt encounter brief cues", () => {
  it("ships hunt win/lose cues + hunt / hunt_lose SFX (happy)", () => {
    expect(SFX_PRESETS.hunt.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.hunt_lose.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.hunt_lose).not.toEqual(SFX_PRESETS.hunt);
    expect(SFX_PRESETS.hunt_lose).not.toEqual(SFX_PRESETS.refuse);
    expect(SFX_PRESETS.hunt_lose).not.toEqual(SFX_PRESETS.tool_break);

    expect(huntWinSuccessCueText("Forest Hare")).toBe("Won · Forest Hare");
    expect(huntWinSuccessCueText("Forest Hare")).toBe(
      `${HUNT_WIN_SUCCESS_CUE_PREFIX}Forest Hare`,
    );
    expect(huntLoseSuccessCueText("Forest Hare")).toBe("Lost · Forest Hare");
    expect(huntLoseSuccessCueText("Forest Hare")).toBe(
      `${HUNT_LOSE_SUCCESS_CUE_PREFIX}Forest Hare`,
    );

    expect(
      huntEncounterSuccessCueText({ won: true, foeName: "Forest Hare" }),
    ).toBe("Won · Forest Hare");
    expect(
      huntEncounterSuccessCueText({ won: false, foeName: "Forest Hare" }),
    ).toBe("Lost · Forest Hare");

    expect(isCoreSuccessCueText("Won · Forest Hare")).toBe(true);
    expect(isCoreSuccessCueText("Lost · Forest Hare")).toBe(true);
    expect(isCoreSuccessCueText(HUNT_WIN_SUCCESS_CUE)).toBe(true);
    expect(isCoreSuccessCueText(HUNT_LOSE_SUCCESS_CUE)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("hunt")).toBe(true);
    expect(audio.playSfx("hunt_lose")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.hunt, SFX_PRESETS.hunt_lose]);
    expect(sfxStepsFor("hunt")).toEqual(SFX_PRESETS.hunt);
    expect(sfxStepsFor("hunt_lose")).toEqual(SFX_PRESETS.hunt_lose);
  });

  it("falls back without foe name; soft gain; brief SUCCESS_CUE_MS (edge)", () => {
    expect(huntWinSuccessCueText()).toBe(HUNT_WIN_SUCCESS_CUE);
    expect(huntWinSuccessCueText("")).toBe(HUNT_WIN_SUCCESS_CUE);
    expect(huntWinSuccessCueText("   ")).toBe(HUNT_WIN_SUCCESS_CUE);
    expect(huntWinSuccessCueText(null)).toBe(HUNT_WIN_SUCCESS_CUE);
    expect(huntLoseSuccessCueText(undefined)).toBe(HUNT_LOSE_SUCCESS_CUE);
    expect(huntLoseSuccessCueText("")).toBe(HUNT_LOSE_SUCCESS_CUE);
    expect(huntEncounterSuccessCueText(null)).toBeNull();
    expect(huntEncounterSuccessCueText(undefined)).toBeNull();
    expect(huntEncounterSuccessCueText({ won: true })).toBe("Won");
    expect(huntEncounterSuccessCueText({ won: false })).toBe("Lost");

    for (const step of SFX_PRESETS.hunt_lose) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat sticky encounter prose as the cue; mute skips SFX (failure)", () => {
    expect(
      isCoreSuccessCueText(
        "Beat the Forest Hare (3 rounds) — +1 leather, +1 meat.",
      ),
    ).toBe(false);
    expect(
      isCoreSuccessCueText(
        "The Forest Hare bested you (2 rounds). No loot. Rest and try again.",
      ),
    ).toBe(false);
    expect(isCoreSuccessCueText("Won.")).toBe(false);
    expect(isCoreSuccessCueText("Lost.")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "hunt")).toBe(false);
    expect(shouldPlaySfx(true, "hunt_lose")).toBe(false);
    expect(audio.playSfx("hunt")).toBe(false);
    expect(audio.playSfx("hunt_lose")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
