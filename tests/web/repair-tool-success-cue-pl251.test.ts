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
  REPAIR_TOOL_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  isCoreSuccessCueText,
  repairToolSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import {
  TOOL,
  canRepairTool,
  toolRepairMatCost,
} from "@game/shared";

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
 * PL25.1 — Repair tool soft confirm (+ ephemeral TopBar cue).
 * Durability rules / mat costs unchanged by cue; mute ok.
 */
describe("CityLands PL25.1 repair tool success cue", () => {
  it("ships repair SFX + Repaired cue and mat SoT (happy)", () => {
    expect(SFX_PRESETS.repair.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.repair).not.toEqual(SFX_PRESETS.equip);
    expect(SFX_PRESETS.repair).not.toEqual(SFX_PRESETS.craft);
    expect(SFX_PRESETS.repair).not.toEqual(SFX_PRESETS.refuse);

    expect(repairToolSuccessCueText()).toBe(REPAIR_TOOL_SUCCESS_CUE);
    expect(repairToolSuccessCueText()).toBe("Repaired");
    expect(isCoreSuccessCueText(REPAIR_TOOL_SUCCESS_CUE)).toBe(true);

    expect(toolRepairMatCost("wooden_hoe")).toEqual(TOOL.repairMats.wooden_hoe);
    expect(toolRepairMatCost("iron_hammer")).toEqual(
      TOOL.repairMats.iron_hammer,
    );
    expect(canRepairTool(10, 25)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("repair")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.repair]);
    expect(sfxStepsFor("repair")).toEqual(SFX_PRESETS.repair);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS; full tools not repairable (edge)", () => {
    for (const step of SFX_PRESETS.repair) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);

    expect(canRepairTool(25, 25)).toBe(false);
    expect(canRepairTool(0, 25)).toBe(false);
    expect(canRepairTool(null, 25)).toBe(false);
    expect(toolRepairMatCost("wheat")).toBeNull();
  });

  it("does not treat sticky / fail repair prose as the cue; mute skips SFX (failure)", () => {
    expect(isCoreSuccessCueText("Tool repaired.")).toBe(false);
    expect(isCoreSuccessCueText("Repaired hoe")).toBe(false);
    expect(isCoreSuccessCueText("You need 1× Wood to repair that tool.")).toBe(
      false,
    );
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "repair")).toBe(false);
    expect(audio.playSfx("repair")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
