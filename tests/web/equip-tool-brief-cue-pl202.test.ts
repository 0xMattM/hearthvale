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
  EQUIP_TOOL_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  UNEQUIP_TOOL_SUCCESS_CUE,
  equipToolSuccessCueText,
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
 * PL20.2 — Equip / unequip soft confirm (+ ephemeral TopBar cue).
 * Durability rules unchanged; mute ok.
 */
describe("CityLands PL20.2 equip tool brief cue", () => {
  it("ships equip SFX + Equipped / Unequipped cues (happy)", () => {
    expect(SFX_PRESETS.equip.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.equip).not.toEqual(SFX_PRESETS.craft);
    expect(SFX_PRESETS.equip).not.toEqual(SFX_PRESETS.eat);
    expect(SFX_PRESETS.equip).not.toEqual(SFX_PRESETS.refuse);

    expect(equipToolSuccessCueText("inv_1")).toBe(EQUIP_TOOL_SUCCESS_CUE);
    expect(equipToolSuccessCueText("inv_1")).toBe("Equipped");
    expect(equipToolSuccessCueText(null)).toBe(UNEQUIP_TOOL_SUCCESS_CUE);
    expect(equipToolSuccessCueText(null)).toBe("Unequipped");
    expect(equipToolSuccessCueText(undefined)).toBe(UNEQUIP_TOOL_SUCCESS_CUE);
    expect(isCoreSuccessCueText(EQUIP_TOOL_SUCCESS_CUE)).toBe(true);
    expect(isCoreSuccessCueText(UNEQUIP_TOOL_SUCCESS_CUE)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("equip")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.equip]);
    expect(sfxStepsFor("equip")).toEqual(SFX_PRESETS.equip);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.equip) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat sticky / fail equip prose as the cue; mute skips SFX (failure)", () => {
    expect(isCoreSuccessCueText("Equipped hoe.")).toBe(false);
    expect(isCoreSuccessCueText("Tool equipped")).toBe(false);
    expect(isCoreSuccessCueText("Could not equip tool")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "equip")).toBe(false);
    expect(audio.playSfx("equip")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
