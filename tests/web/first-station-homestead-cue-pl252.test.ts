import { describe, expect, it } from "vitest";
import {
  emptyLandBuildBeaconMode,
  isFirstHomesteadStationPlace,
} from "@game/shared";
import {
  HOMESTEAD_FIRST_PLACE_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  homesteadFirstPlaceSuccessCueText,
  isCoreSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import {
  SFX_PRESETS,
  createGameAudio,
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
 * PL25.2 — First placeable station place gets ephemeral Homestead cue.
 * Subsequent places use brief Built (PL28.3); mute ok.
 */
describe("CityLands PL25.2 first station place homestead cue", () => {
  it("ships Homestead cue when yard is still empty of stations (happy)", () => {
    const empty = [{ type: "build_board" as const }];
    expect(isFirstHomesteadStationPlace(empty)).toBe(true);
    expect(emptyLandBuildBeaconMode(empty)).toBe("beacon");
    expect(homesteadFirstPlaceSuccessCueText()).toBe(
      HOMESTEAD_FIRST_PLACE_SUCCESS_CUE,
    );
    expect(homesteadFirstPlaceSuccessCueText()).toBe("Homestead");
    expect(isCoreSuccessCueText(HOMESTEAD_FIRST_PLACE_SUCCESS_CUE)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("build")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.build]);
  });

  it("stays Homestead-silent after first station; brief cue window (edge)", () => {
    const lived = [
      { type: "build_board" as const },
      { type: "workshop" as const },
    ];
    expect(isFirstHomesteadStationPlace(lived)).toBe(false);
    expect(emptyLandBuildBeaconMode(lived)).toBe("soft");
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat sticky Built prose as Homestead cue; decor alone is still first (failure)", () => {
    expect(isCoreSuccessCueText("Built workshop.")).toBe(false);
    expect(isCoreSuccessCueText("Homestead started")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    // Reason: PL3.1 / PL22.1 — housing decor alone does not clear empty beacon.
    expect(
      isFirstHomesteadStationPlace([
        { type: "build_board" },
        { type: "decor_planter" },
      ]),
    ).toBe(true);
  });
});
