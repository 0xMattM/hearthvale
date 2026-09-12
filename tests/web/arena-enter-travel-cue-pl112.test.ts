import { describe, expect, it } from "vitest";
import {
  LAND_DESTINATIONS,
  TRAVEL,
  isTravelDestinationBlurbEmphasized,
} from "@game/shared";
import {
  SFX_PRESETS,
  createGameAudio,
  sfxStepsFor,
  shouldPlaySfx,
  travelSfxFor,
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
 * PL11.2 — Arena enter travel cue (distinct SFX + warrior blurb emphasis).
 * Still fare-free instant; mute skips cue.
 */
describe("CityLands PL11.2 arena enter travel cue", () => {
  it("uses travel_warrior for warrior and default travel elsewhere (happy)", () => {
    expect(travelSfxFor("warrior")).toBe("travel_warrior");
    expect(travelSfxFor("city")).toBe("travel");
    expect(travelSfxFor("player_land")).toBe("travel");
    expect(travelSfxFor("explore")).toBe("travel");
    expect(SFX_PRESETS.travel_warrior).not.toEqual(SFX_PRESETS.travel);
    expect(SFX_PRESETS.travel_warrior[0]!.type).toBe("square");

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx(travelSfxFor("warrior"))).toBe(true);
    expect(audio.playSfx(travelSfxFor("city"))).toBe(true);
    expect(played).toEqual([
      SFX_PRESETS.travel_warrior,
      SFX_PRESETS.travel,
    ]);

    const warrior = LAND_DESTINATIONS.find((d) => d.kind === "warrior")!;
    expect(isTravelDestinationBlurbEmphasized("warrior")).toBe(true);
    expect(isTravelDestinationBlurbEmphasized("city")).toBe(false);
    expect(warrior.blurb.toLowerCase()).toMatch(/optional/);
    expect(warrior.blurb.toLowerCase()).toMatch(/not required|no combat gear|profession ladder/);
    expect(warrior.blurb.toLowerCase()).toMatch(/free/);
  });

  it("keeps free/instant travel constants unused for fare (edge)", () => {
    expect(TRAVEL.coinCost).toBeGreaterThan(0);
    // CityLands map travel does not charge TRAVEL.coinCost — cue only.
    for (const step of SFX_PRESETS.travel_warrior) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(sfxStepsFor("travel_warrior")).toEqual(SFX_PRESETS.travel_warrior);
    expect(LAND_DESTINATIONS.filter((d) => isTravelDestinationBlurbEmphasized(d.kind))).toHaveLength(
      1,
    );
  });

  it("skips warrior travel cue when muted or unknown (failure)", () => {
    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "travel_warrior")).toBe(false);
    expect(audio.playSfx("travel_warrior")).toBe(false);
    expect(audio.playSfx(travelSfxFor("warrior"))).toBe(false);
    expect(audio.playSfx("travel_arena_boom")).toBe(false);
    expect(played).toHaveLength(0);
    expect(sfxStepsFor("travel_arena_boom")).toEqual([]);
    expect(isTravelDestinationBlurbEmphasized("starter")).toBe(false);
  });
});
