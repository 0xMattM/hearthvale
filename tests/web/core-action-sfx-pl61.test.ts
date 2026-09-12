import { describe, expect, it } from "vitest";
import {
  SFX_PRESETS,
  createGameAudio,
  sfxStepsFor,
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
 * PL6.1 — SFX for gather / build / travel (presets + mute edge).
 */
describe("CityLands PL6.1 gather / build / travel SFX", () => {
  it("ships distinct gather/build/travel presets and plays unmuted (happy)", () => {
    expect(SFX_PRESETS.gather.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.build.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.travel.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.gather).not.toEqual(SFX_PRESETS.build);
    expect(SFX_PRESETS.build).not.toEqual(SFX_PRESETS.travel);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("gather")).toBe(true);
    expect(audio.playSfx("build")).toBe(true);
    expect(audio.playSfx("travel")).toBe(true);
    expect(played).toEqual([
      SFX_PRESETS.gather,
      SFX_PRESETS.build,
      SFX_PRESETS.travel,
    ]);
    expect(sfxStepsFor("gather")).toEqual(SFX_PRESETS.gather);
  });

  it("keeps legacy plant/harvest/craft/hunt cues (edge)", () => {
    for (const id of ["plant", "harvest", "craft", "hunt"] as const) {
      expect(shouldPlaySfx(false, id)).toBe(true);
      expect(sfxStepsFor(id).length).toBeGreaterThan(0);
    }
  });

  it("skips gather/build/travel when muted or unknown (failure)", () => {
    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "gather")).toBe(false);
    expect(audio.playSfx("gather")).toBe(false);
    expect(audio.playSfx("build")).toBe(false);
    expect(audio.playSfx("travel")).toBe(false);
    expect(audio.playSfx("nope")).toBe(false);
    expect(played).toHaveLength(0);
    expect(sfxStepsFor("warp")).toEqual([]);
  });
});
