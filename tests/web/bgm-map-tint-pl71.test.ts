import { describe, expect, it } from "vitest";
import { CANONICAL_LAND_KINDS } from "../../packages/shared/src/catalog";
import {
  BGM_BEDS,
  BGM_DRONE,
  bgmBedFor,
  bgmBedsDistinguishable,
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
 * PL7.1 — Per-map soft BGM tint (City / Land / Explore / Warrior).
 * Looping songs: land / city / shared wilds (explore + arena).
 * Bed recipes stay for the arrive identity stinger (PL120.1).
 */
describe("CityLands PL7.1 per-map soft BGM tint", () => {
  it("ships four distinguishable beds and swaps music per map (happy)", () => {
    expect(bgmBedsDistinguishable()).toBe(true);
    expect(CANONICAL_LAND_KINDS).toHaveLength(4);
    for (const kind of CANONICAL_LAND_KINDS) {
      expect(BGM_BEDS[kind].gain).toBeLessThan(0.05);
      expect(BGM_BEDS[kind].freq).toBeGreaterThan(0);
    }

    const { player, getDrones } = mockPlayer();
    const { music, srcs, getLoops } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.setBgmLandKind("city");
    audio.startBgm();
    expect(getDrones()).toBe(0);
    expect(getLoops()).toBe(1);
    expect(srcs[0]).toBe(BGM_MUSIC_TRACKS.city.src);

    audio.setBgmLandKind("player_land");
    expect(audio.getBgmLandKind()).toBe("player_land");
    expect(audio.getBgmMusicTrack()).toBe("land");
    expect(srcs.at(-1)).toBe(BGM_MUSIC_TRACKS.land.src);
    expect(getLoops()).toBe(1);

    audio.setBgmLandKind("warrior");
    expect(audio.getBgmMusicTrack()).toBe("wilds");
    expect(srcs.at(-1)).toBe(BGM_MUSIC_TRACKS.wilds.src);
    expect(getLoops()).toBe(1);

    audio.setBgmLandKind("explore");
    expect(audio.getBgmMusicTrack()).toBe("wilds");
    expect(srcs.filter((s) => s === BGM_MUSIC_TRACKS.wilds.src)).toHaveLength(1);
    expect(getLoops()).toBe(1);
  });

  it("maps legacy starter/forest aliases to land/explore beds (edge)", () => {
    expect(bgmBedFor("starter")).toEqual(BGM_BEDS.player_land);
    expect(bgmBedFor("forest")).toEqual(BGM_BEDS.explore);
    expect(BGM_DRONE).toEqual(BGM_BEDS.player_land);

    const { player } = mockPlayer();
    const { music, srcs } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.setBgmLandKind("starter");
    audio.startBgm();
    expect(audio.getBgmLandKind()).toBe("player_land");
    expect(audio.getBgmMusicTrack()).toBe("land");
    expect(srcs[0]).toBe(BGM_MUSIC_TRACKS.land.src);

    audio.setBgmLandKind("forest");
    expect(audio.getBgmLandKind()).toBe("explore");
    expect(srcs.at(-1)).toBe(BGM_MUSIC_TRACKS.wilds.src);
  });

  it("silences BGM on mute and does not restart while muted (failure)", () => {
    const { player, getDrones } = mockPlayer();
    const { music, srcs, getLoops } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.setBgmLandKind("city");
    audio.startBgm();
    expect(getLoops()).toBe(1);
    audio.setMuted(true);
    expect(getLoops()).toBe(0);
    expect(getDrones()).toBe(0);
    audio.setBgmLandKind("warrior");
    expect(getLoops()).toBe(0);
    expect(srcs).toHaveLength(1);
    expect(audio.getBgmLandKind()).toBe("warrior");
    audio.setMuted(false);
    expect(getLoops()).toBe(1);
    expect(srcs.at(-1)).toBe(BGM_MUSIC_TRACKS.wilds.src);
  });
});
