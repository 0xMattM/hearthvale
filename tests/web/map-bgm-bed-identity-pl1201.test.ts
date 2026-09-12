import { describe, expect, it } from "vitest";
import {
  BGM_ARRIVE_IDENTITY_STINGER,
  BGM_BEDS,
  bgmArriveIdentityStingerSteps,
  bgmBedsDistinguishable,
  createGameAudio,
  shouldPlayBgmArriveIdentityStinger,
  travelSfxFor,
  type TonePlayer,
  type ToneStep,
} from "../../apps/web/lib/game-audio";
import { CANONICAL_LAND_KINDS } from "@game/shared";

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
 * PL120.1 — Map BGM bed identity stinger on free-travel arrive.
 * Complements travel SFX (PL11.2) + soft bed swap (PL51.1); fare-free travel
 * unchanged; mute ok. Choice: bed-rooted two-note stinger (not a second suite)
 * so City/Land/Explore/Arena beds stay glanceably distinct on arrive.
 */
describe("CityLands PL120.1 map BGM bed identity", () => {
  it("plays bed-rooted stinger on successful map change (happy)", () => {
    expect(bgmBedsDistinguishable()).toBe(true);
    expect(
      shouldPlayBgmArriveIdentityStinger(true, "city", "explore", false),
    ).toBe(true);

    const steps = bgmArriveIdentityStingerSteps("explore");
    expect(steps).toHaveLength(2);
    expect(steps[0]?.freq).toBe(BGM_BEDS.explore.freq);
    expect(steps[0]?.type).toBe(BGM_BEDS.explore.type);
    expect(steps[1]?.freq).toBeCloseTo(
      BGM_BEDS.explore.freq * BGM_ARRIVE_IDENTITY_STINGER.intervalRatio,
      5,
    );

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playBgmArriveIdentityStinger("explore")).toBe(true);
    expect(played).toEqual([steps]);
    // Travel confirm stays separate from bed identity.
    expect(travelSfxFor("explore")).toBe("travel");
  });

  it("keeps four map stingers distinct and soft (edge)", () => {
    const roots = CANONICAL_LAND_KINDS.map(
      (k) => bgmArriveIdentityStingerSteps(k)[0]!,
    );
    const rootKeys = new Set(roots.map((s) => `${s.freq}:${s.type}`));
    expect(rootKeys.size).toBe(CANONICAL_LAND_KINDS.length);

    for (const kind of CANONICAL_LAND_KINDS) {
      for (const step of bgmArriveIdentityStingerSteps(kind)) {
        expect(step.gain).toBeLessThanOrEqual(0.1);
        expect(step.durationSec).toBeLessThanOrEqual(0.2);
      }
      expect(bgmArriveIdentityStingerSteps(kind)[0]?.type).toBe(
        BGM_BEDS[kind].type,
      );
    }
    expect(BGM_ARRIVE_IDENTITY_STINGER.gain).toBeGreaterThan(
      BGM_ARRIVE_IDENTITY_STINGER.partialGain,
    );
  });

  it("stays quiet on same-map / refuse / mute (failure)", () => {
    expect(
      shouldPlayBgmArriveIdentityStinger(true, "city", "city", false),
    ).toBe(false);
    expect(
      shouldPlayBgmArriveIdentityStinger(false, "city", "explore", false),
    ).toBe(false);
    expect(
      shouldPlayBgmArriveIdentityStinger(true, "city", "explore", true),
    ).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(audio.playBgmArriveIdentityStinger("warrior")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
