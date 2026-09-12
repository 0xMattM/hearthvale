import { describe, expect, it } from "vitest";
import {
  BGM_DRONE,
  SFX_PRESETS,
  createGameAudio,
  sfxStepsFor,
  shouldPlaySfx,
  type TonePlayer,
  type ToneStep,
} from "../../apps/web/lib/game-audio";
import {
  BGM_MUSIC_TRACKS,
  type MusicPlayer,
} from "../../apps/web/lib/game-audio-music";

function mockPlayer() {
  const played: ToneStep[][] = [];
  let drones = 0;
  const player: TonePlayer = {
    playSteps(steps) {
      played.push(steps);
    },
    startDrone() {
      drones += 1;
      return () => {
        drones -= 1;
      };
    },
  };
  return { player, played, getDrones: () => drones };
}

function mockMusic() {
  let loops = 0;
  const srcs: string[] = [];
  const music: MusicPlayer = {
    playLoop(src) {
      srcs.push(src);
      loops += 1;
      return () => {
        loops -= 1;
      };
    },
  };
  return { music, srcs, getLoops: () => loops };
}

describe("game audio F14.4", () => {
  it("plays plant/craft/hunt cues when unmuted (happy)", () => {
    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("plant")).toBe(true);
    expect(audio.playSfx("craft")).toBe(true);
    expect(audio.playSfx("hunt")).toBe(true);
    expect(played).toHaveLength(3);
    expect(played[0]).toEqual(SFX_PRESETS.plant);
    expect(sfxStepsFor("harvest").length).toBeGreaterThan(0);
  });

  it("starts looping BGM and tears it down on mute (edge)", () => {
    const { player, getDrones } = mockPlayer();
    const { music, srcs, getLoops } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.startBgm();
    expect(getLoops()).toBe(1);
    expect(getDrones()).toBe(0);
    expect(srcs[0]).toBe(BGM_MUSIC_TRACKS.land.src);
    expect(BGM_DRONE.gain).toBeLessThan(0.05);
    audio.setMuted(true);
    expect(getLoops()).toBe(0);
    audio.setMuted(false);
    expect(getLoops()).toBe(1);
  });

  it("skips SFX when muted or unknown (failure)", () => {
    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "plant")).toBe(false);
    expect(audio.playSfx("plant")).toBe(false);
    expect(audio.playSfx("craft")).toBe(false);
    expect(audio.playSfx("nope")).toBe(false);
    expect(played).toHaveLength(0);
    expect(sfxStepsFor("nope")).toEqual([]);
  });
});
