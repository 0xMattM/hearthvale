import { describe, expect, it } from "vitest";
import {
  BGM_BEDS,
  createGameAudio,
  type TonePlayer,
} from "../../apps/web/lib/game-audio";
import {
  BGM_MUSIC_TRACKS,
  type MusicPlayer,
} from "../../apps/web/lib/game-audio-music";

function mockPlayer() {
  const started: Array<{ freq: number; gain: number; type: OscillatorType }> =
    [];
  let drones = 0;
  const player: TonePlayer = {
    playSteps() {
      /* unused */
    },
    startDrone(freq, gain, type) {
      started.push({ freq, gain, type });
      drones += 1;
      return () => {
        drones -= 1;
      };
    },
  };
  return { player, started, getDrones: () => drones };
}

function mockMusic() {
  const srcs: string[] = [];
  let loops = 0;
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

/**
 * PL7.2 — Explore ambient tint vs homestead Land (AudioDirection wilds).
 * Explore uses Calm Optimism; land uses Cozy Game Loop.
 */
describe("CityLands PL7.2 Explore ambient tint vs Land", () => {
  it("uses a sparser/tenser Explore bed than Land (happy)", () => {
    const land = BGM_BEDS.player_land;
    const explore = BGM_BEDS.explore;

    expect(explore.freq).not.toBe(land.freq);
    expect(explore.type).not.toBe(land.type);
    // Reason: wilds stay quieter / sparser than the warm homestead pad (stinger).
    expect(explore.gain).toBeLessThan(land.gain);
    expect(explore.partial).toBeDefined();
    expect(land.partial).toBeUndefined();
    expect(explore.gain).toBeLessThan(0.05);
    expect(explore.partial!.gain).toBeLessThan(explore.gain);

    const { player, getDrones } = mockPlayer();
    const { music, srcs, getLoops } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.setBgmLandKind("explore");
    audio.startBgm();
    expect(getDrones()).toBe(0);
    expect(getLoops()).toBe(1);
    expect(srcs).toEqual([BGM_MUSIC_TRACKS.wilds.src]);
  });

  it("Land bed stays a single warm voice without Explore partial (edge)", () => {
    const { player, getDrones } = mockPlayer();
    const { music, srcs, getLoops } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.setBgmLandKind("player_land");
    audio.startBgm();
    expect(getDrones()).toBe(0);
    expect(getLoops()).toBe(1);
    expect(srcs).toEqual([BGM_MUSIC_TRACKS.land.src]);

    audio.setBgmLandKind("explore");
    expect(getLoops()).toBe(1);
    expect(srcs.at(-1)).toBe(BGM_MUSIC_TRACKS.wilds.src);
    audio.setBgmLandKind("player_land");
    expect(getLoops()).toBe(1);
    expect(srcs.at(-1)).toBe(BGM_MUSIC_TRACKS.land.src);
  });

  it("muted Explore never starts wilds voices (failure)", () => {
    const { player, started, getDrones } = mockPlayer();
    const { music, srcs, getLoops } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.setMuted(true);
    audio.setBgmLandKind("explore");
    audio.startBgm();
    expect(getDrones()).toBe(0);
    expect(getLoops()).toBe(0);
    expect(started).toHaveLength(0);
    expect(srcs).toHaveLength(0);
  });
});
