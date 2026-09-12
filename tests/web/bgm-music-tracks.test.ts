import { describe, expect, it } from "vitest";
import {
  createGameAudio,
  type TonePlayer,
} from "../../apps/web/lib/game-audio";
import {
  BGM_MUSIC_TRACKS,
  BGM_MUSIC_TRANSITION,
  bgmMusicTrackFor,
  shouldSwapBgmMusicTrack,
  type MusicPlayOptions,
  type MusicPlayer,
} from "../../apps/web/lib/game-audio-music";

function mockTone(): TonePlayer {
  return {
    playSteps() {
      /* unused */
    },
    startDrone() {
      return () => undefined;
    },
  };
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
 * Looping map music: land / city / shared wilds (explore + arena).
 */
describe("map looping BGM music tracks", () => {
  it("plays Cozy Game Loop on land and Calm Optimism on explore (happy)", () => {
    const { music, started, getLoops } = mockMusic();
    const audio = createGameAudio(mockTone(), music);

    expect(bgmMusicTrackFor("player_land")).toBe("land");
    expect(bgmMusicTrackFor("city")).toBe("city");
    expect(bgmMusicTrackFor("explore")).toBe("wilds");
    expect(BGM_MUSIC_TRACKS.land.src).toContain("cozy-game-loop");
    expect(BGM_MUSIC_TRACKS.city.src).toContain("peaceful-affection");
    expect(BGM_MUSIC_TRACKS.wilds.src).toContain("calm-optimism");

    audio.setBgmLandKind("player_land");
    audio.startBgm();
    expect(getLoops()).toBe(1);
    expect(started[0]).toEqual({
      src: BGM_MUSIC_TRACKS.land.src,
      volume: BGM_MUSIC_TRACKS.land.volume,
      opts: undefined,
    });

    audio.setBgmLandKind("explore");
    expect(audio.getBgmMusicTrack()).toBe("wilds");
    expect(getLoops()).toBe(1);
    expect(started.at(-1)).toMatchObject({
      src: BGM_MUSIC_TRACKS.wilds.src,
      volume: BGM_MUSIC_TRACKS.wilds.volume,
      opts: {
        fadeInSec: BGM_MUSIC_TRANSITION.fadeInSec,
        startVolumeFactor: BGM_MUSIC_TRANSITION.quietStartGainFactor,
      },
    });
  });

  it("keeps Calm Optimism across explore/arena without restarting (edge)", () => {
    expect(bgmMusicTrackFor("warrior")).toBe("wilds");
    expect(bgmMusicTrackFor("starter")).toBe("land");
    expect(bgmMusicTrackFor("forest")).toBe("wilds");
    expect(bgmMusicTrackFor(null)).toBe("land");
    expect(
      shouldSwapBgmMusicTrack("explore", "warrior", true, false),
    ).toBe(false);
    expect(shouldSwapBgmMusicTrack("city", "player_land", true, false)).toBe(
      true,
    );
    expect(shouldSwapBgmMusicTrack("city", "explore", true, false)).toBe(true);
    expect(BGM_MUSIC_TRANSITION.fadeInSec).toBeGreaterThan(0);

    const { music, started, getLoops } = mockMusic();
    const audio = createGameAudio(mockTone(), music);
    audio.setBgmLandKind("explore");
    audio.startBgm();
    audio.startBgm();
    expect(started).toHaveLength(1);
    expect(getLoops()).toBe(1);

    audio.setBgmLandKind("warrior");
    audio.startBgm();
    expect(started).toHaveLength(1);
    expect(audio.getBgmMusicTrack()).toBe("wilds");
    expect(getLoops()).toBe(1);

    audio.setBgmLandKind("city");
    expect(started).toHaveLength(2);
    expect(started.at(-1)?.src).toBe(BGM_MUSIC_TRACKS.city.src);
  });

  it("stays silent while muted and resumes the current map track (failure)", () => {
    expect(shouldSwapBgmMusicTrack("city", "explore", true, true)).toBe(false);
    expect(shouldSwapBgmMusicTrack("city", "explore", false, false)).toBe(
      false,
    );

    const { music, started, getLoops } = mockMusic();
    const audio = createGameAudio(mockTone(), music);
    audio.setMuted(true);
    audio.setBgmLandKind("explore");
    audio.startBgm();
    expect(getLoops()).toBe(0);
    expect(started).toHaveLength(0);
    expect(audio.getBgmMusicTrack()).toBe("wilds");

    audio.setMuted(false);
    expect(getLoops()).toBe(1);
    expect(started[0]?.src).toBe(BGM_MUSIC_TRACKS.wilds.src);
    expect(started[0]?.opts).toBeUndefined();

    audio.setBgmLandKind("city");
    expect(started).toHaveLength(2);
    expect(started[1]?.src).toBe(BGM_MUSIC_TRACKS.city.src);
    audio.setMuted(true);
    expect(getLoops()).toBe(0);
    audio.setBgmLandKind("explore");
    expect(started).toHaveLength(2);
    audio.stopBgm();
    audio.setMuted(false);
    expect(getLoops()).toBe(0);
  });
});
