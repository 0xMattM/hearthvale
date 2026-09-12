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
 * PL10.1 — Vendor buy/sell SFX (confirm tones + mute edge).
 */
describe("CityLands PL10.1 vendor buy/sell SFX", () => {
  it("ships distinct vendor_buy / vendor_sell presets and plays unmuted (happy)", () => {
    expect(SFX_PRESETS.vendor_buy.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.vendor_sell.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.vendor_buy).not.toEqual(SFX_PRESETS.vendor_sell);
    expect(SFX_PRESETS.vendor_buy).not.toEqual(SFX_PRESETS.craft);
    expect(SFX_PRESETS.vendor_sell).not.toEqual(SFX_PRESETS.travel);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("vendor_buy")).toBe(true);
    expect(audio.playSfx("vendor_sell")).toBe(true);
    expect(played).toEqual([
      SFX_PRESETS.vendor_buy,
      SFX_PRESETS.vendor_sell,
    ]);
    expect(sfxStepsFor("vendor_buy")).toEqual(SFX_PRESETS.vendor_buy);
    expect(sfxStepsFor("vendor_sell")).toEqual(SFX_PRESETS.vendor_sell);
  });

  it("keeps soft UI gain — marketplace confirms stay quiet (edge)", () => {
    for (const step of [
      ...SFX_PRESETS.vendor_buy,
      ...SFX_PRESETS.vendor_sell,
    ]) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
  });

  it("skips vendor cues when muted or unknown (failure)", () => {
    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "vendor_buy")).toBe(false);
    expect(shouldPlaySfx(true, "vendor_sell")).toBe(false);
    expect(audio.playSfx("vendor_buy")).toBe(false);
    expect(audio.playSfx("vendor_sell")).toBe(false);
    expect(audio.playSfx("vendor_warp")).toBe(false);
    expect(played).toHaveLength(0);
    expect(sfxStepsFor("vendor_warp")).toEqual([]);
  });
});
