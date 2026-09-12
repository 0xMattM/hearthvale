import { describe, expect, it } from "vitest";
import {
  emptyLandBuildBeaconMode,
  isFirstHomesteadStationPlace,
} from "@game/shared";
import {
  HOMESTEAD_FIRST_PLACE_SUCCESS_CUE,
  STATION_BUILT_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  isCoreSuccessCueText,
  stationBuiltSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import {
  SFX_PRESETS,
  createGameAudio,
  shouldPlaySfx,
  type TonePlayer,
  type ToneStep,
} from "../../apps/web/lib/game-audio";

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
 * PL28.3 — Subsequent station place ephemeral Built cue (+ soft build SFX).
 * First place stays Homestead (PL25.2); place costs unchanged; mute ok.
 */
describe("CityLands PL28.3 subsequent station place Built cue", () => {
  it("ships Built ephemeral cue + soft build SFX after first homestead (happy)", () => {
    const lived = [
      { type: "build_board" as const },
      { type: "workshop" as const },
    ];
    expect(isFirstHomesteadStationPlace(lived)).toBe(false);
    expect(emptyLandBuildBeaconMode(lived)).toBe("soft");

    expect(stationBuiltSuccessCueText()).toBe(STATION_BUILT_SUCCESS_CUE);
    expect(stationBuiltSuccessCueText()).toBe("Built");
    expect(isCoreSuccessCueText(STATION_BUILT_SUCCESS_CUE)).toBe(true);
    expect(STATION_BUILT_SUCCESS_CUE).not.toBe(HOMESTEAD_FIRST_PLACE_SUCCESS_CUE);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("build")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.build]);
  });

  it("keeps brief SUCCESS_CUE_MS and soft build gain (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    for (const step of SFX_PRESETS.build) {
      expect(step.gain).toBeLessThanOrEqual(0.12);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
  });

  it("does not treat sticky Built prose as the cue; mute skips build SFX (failure)", () => {
    expect(isCoreSuccessCueText("Built workshop.")).toBe(false);
    expect(isCoreSuccessCueText("Built kitchen.")).toBe(false);
    expect(isCoreSuccessCueText("Homestead")).toBe(true);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "build")).toBe(false);
    expect(audio.playSfx("build")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
