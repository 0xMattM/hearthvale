import { describe, expect, it } from "vitest";
import {
  BGM_BEDS,
  BGM_MAP_TRANSITION,
  createGameAudio,
  shouldSoftBgmMapTransition,
  type StartDroneOptions,
  type TonePlayer,
} from "../../apps/web/lib/game-audio";
import {
  BGM_MUSIC_TRACKS,
  BGM_MUSIC_TRANSITION,
  type MusicPlayOptions,
  type MusicPlayer,
} from "../../apps/web/lib/game-audio-music";

function mockPlayer() {
  const started: Array<{
    freq: number;
    gain: number;
    type: OscillatorType;
    opts?: StartDroneOptions;
  }> = [];
  let drones = 0;
  const player: TonePlayer = {
    playSteps() {
      /* unused */
    },
    startDrone(freq, gain, type, opts) {
      started.push({ freq, gain, type, opts });
      drones += 1;
      return () => {
        drones -= 1;
      };
    },
  };
  return { player, started, getDrones: () => drones };
}

function mockMusic() {
  const started: Array<{
    src: string;
    volume: number;
    opts?: MusicPlayOptions;
  }> = [];
  let loops = 0;
  const music: MusicPlayer = {
    playLoop(src, volume, opts) {
      started.push({ src, volume, opts });
      loops += 1;
      return () => {
        loops -= 1;
      };
    },
  };
  return { music, started, getLoops: () => loops };
}

/**
 * PL51.1 — BGM soft transition on map change (quieter restart / brief crossfade).
 * Looping songs: land / city / wilds; explore and arena share Calm Optimism.
 */
describe("CityLands PL51.1 BGM soft transition on map change", () => {
  it("quieter-restarts into the explore track while playing (happy)", () => {
    expect(BGM_MAP_TRANSITION.fadeInSec).toBeGreaterThan(0);
    expect(BGM_MAP_TRANSITION.quietStartGainFactor).toBeGreaterThan(0);
    expect(BGM_MAP_TRANSITION.quietStartGainFactor).toBeLessThan(1);
    expect(BGM_MUSIC_TRANSITION.fadeInSec).toBeGreaterThan(0);

    const { player, getDrones } = mockPlayer();
    const { music, started, getLoops } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.setBgmLandKind("city");
    audio.startBgm();
    expect(getDrones()).toBe(0);
    expect(getLoops()).toBe(1);
    expect(started[0]?.opts).toBeUndefined();
    expect(started[0]).toMatchObject({
      src: BGM_MUSIC_TRACKS.city.src,
      volume: BGM_MUSIC_TRACKS.city.volume,
    });

    audio.setBgmLandKind("explore");
    expect(audio.getBgmLandKind()).toBe("explore");
    expect(getLoops()).toBe(1);
    const softOpts = {
      fadeInSec: BGM_MUSIC_TRANSITION.fadeInSec,
      startVolumeFactor: BGM_MUSIC_TRANSITION.quietStartGainFactor,
    };
    expect(started.at(-1)?.opts).toEqual(softOpts);
    expect(started.at(-1)).toMatchObject({
      src: BGM_MUSIC_TRACKS.wilds.src,
      volume: BGM_MUSIC_TRACKS.wilds.volume,
    });
    expect(BGM_BEDS.explore.freq).not.toBe(BGM_BEDS.city.freq);
  });

  it("cold start and same-bed stay full-gain / no-op (edge)", () => {
    expect(
      shouldSoftBgmMapTransition("city", "warrior", true, false),
    ).toBe(true);
    expect(
      shouldSoftBgmMapTransition("city", "city", true, false),
    ).toBe(false);

    const { player } = mockPlayer();
    const { music, started, getLoops } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.setBgmLandKind("player_land");
    audio.startBgm();
    expect(started).toHaveLength(1);
    expect(started[0]?.opts).toBeUndefined();

    const before = started.length;
    audio.setBgmLandKind("player_land");
    expect(started).toHaveLength(before);
    expect(getLoops()).toBe(1);

    audio.setBgmLandKind("warrior");
    expect(started).toHaveLength(before + 1);
    expect(started.at(-1)?.src).toBe(BGM_MUSIC_TRACKS.wilds.src);
    audio.startBgm();
    expect(started).toHaveLength(before + 1);

    // Explore and arena share Calm Optimism — no restart.
    audio.setBgmLandKind("explore");
    expect(started).toHaveLength(before + 1);
    audio.startBgm();
    expect(started).toHaveLength(before + 1);
  });

  it("muted map swaps stay silent; unmute hard-starts current bed (failure)", () => {
    expect(
      shouldSoftBgmMapTransition("city", "explore", true, true),
    ).toBe(false);
    expect(
      shouldSoftBgmMapTransition("city", "explore", false, false),
    ).toBe(false);

    const { player, getDrones } = mockPlayer();
    const { music, started, getLoops } = mockMusic();
    const audio = createGameAudio(player, music);
    audio.setBgmLandKind("city");
    audio.startBgm();
    audio.setMuted(true);
    expect(getLoops()).toBe(0);
    expect(getDrones()).toBe(0);
    const before = started.length;
    audio.setBgmLandKind("warrior");
    expect(started).toHaveLength(before);
    expect(getLoops()).toBe(0);
    expect(audio.getBgmLandKind()).toBe("warrior");

    audio.setMuted(false);
    expect(getLoops()).toBe(1);
    expect(started.at(-1)?.opts).toBeUndefined();
    expect(started.at(-1)).toMatchObject({
      src: BGM_MUSIC_TRACKS.wilds.src,
      volume: BGM_MUSIC_TRACKS.wilds.volume,
    });
  });
});
