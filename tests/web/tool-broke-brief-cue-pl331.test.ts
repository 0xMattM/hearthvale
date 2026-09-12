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
  TOOL_BROKE_SUCCESS_CUE,
  isCoreSuccessCueText,
  shouldFlashToolBrokeCue,
  toolBrokeSuccessCueText,
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
 * PL33.1 — Tool broke soft confirm (+ ephemeral TopBar cue).
 * Durability rules unchanged; sticky “Craft or equip another” prose removed; mute ok.
 */
describe("CityLands PL33.1 tool broke brief cue", () => {
  it("ships tool_break SFX + Tool broke cue when equip clears (happy)", () => {
    expect(SFX_PRESETS.tool_break.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.tool_break).not.toEqual(SFX_PRESETS.repair);
    expect(SFX_PRESETS.tool_break).not.toEqual(SFX_PRESETS.refuse);
    expect(SFX_PRESETS.tool_break).not.toEqual(SFX_PRESETS.equip);

    expect(toolBrokeSuccessCueText()).toBe(TOOL_BROKE_SUCCESS_CUE);
    expect(toolBrokeSuccessCueText()).toBe("Tool broke");
    expect(isCoreSuccessCueText(TOOL_BROKE_SUCCESS_CUE)).toBe(true);
    expect(shouldFlashToolBrokeCue("inv-1", null)).toBe(true);
    expect(shouldFlashToolBrokeCue("inv-1", undefined)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("tool_break")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.tool_break]);
    expect(sfxStepsFor("tool_break")).toEqual(SFX_PRESETS.tool_break);
  });

  it("skips cue when still equipped or never equipped; soft gain (edge)", () => {
    expect(shouldFlashToolBrokeCue("inv-1", "inv-1")).toBe(false);
    expect(shouldFlashToolBrokeCue("inv-1", "inv-2")).toBe(false);
    expect(shouldFlashToolBrokeCue(null, null)).toBe(false);
    expect(shouldFlashToolBrokeCue(undefined, null)).toBe(false);
    expect(shouldFlashToolBrokeCue("", null)).toBe(false);

    for (const step of SFX_PRESETS.tool_break) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat sticky break prose as the cue; mute skips SFX (failure)", () => {
    expect(
      isCoreSuccessCueText(
        "Your tool broke from use. Craft or equip another.",
      ),
    ).toBe(false);
    expect(isCoreSuccessCueText("Tool broke.")).toBe(false);
    expect(isCoreSuccessCueText("Broken")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "tool_break")).toBe(false);
    expect(audio.playSfx("tool_break")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
