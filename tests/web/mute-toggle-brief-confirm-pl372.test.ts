import { describe, expect, it } from "vitest";
import {
  MUTE_OFF_SUCCESS_CUE,
  MUTE_ON_SUCCESS_CUE,
  isCoreSuccessCueText,
  muteToggleSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { createGameAudio, shouldPlaySfx } from "../../apps/web/lib/game-audio";

/**
 * PL37.2 — Mute toggle brief confirm (ephemeral Muted / Unmuted).
 * Choice: TopBar cue only — no always-on audio column; audio respects mute immediately.
 */
describe("CityLands PL37.2 mute toggle brief confirm", () => {
  it("flashes Muted / Unmuted for mute flips (happy)", () => {
    expect(muteToggleSuccessCueText(true)).toBe(MUTE_ON_SUCCESS_CUE);
    expect(muteToggleSuccessCueText(false)).toBe(MUTE_OFF_SUCCESS_CUE);
    expect(MUTE_ON_SUCCESS_CUE).toBe("Muted");
    expect(MUTE_OFF_SUCCESS_CUE).toBe("Unmuted");
    expect(isCoreSuccessCueText("Muted")).toBe(true);
    expect(isCoreSuccessCueText("Unmuted")).toBe(true);
  });

  it("applies mute immediately so SFX stay silent when muted (edge)", () => {
    const audio = createGameAudio();
    audio.setMuted(true);
    expect(audio.isMuted()).toBe(true);
    expect(shouldPlaySfx(true, "build")).toBe(false);
    audio.setMuted(false);
    expect(audio.isMuted()).toBe(false);
    expect(shouldPlaySfx(false, "build")).toBe(true);
    // Cue copy does not invent an always-on audio meter string.
    expect(muteToggleSuccessCueText(true)).not.toMatch(/volume|dB|level/i);
  });

  it("refuses empty or inventing sticky mute column copy (failure)", () => {
    expect(muteToggleSuccessCueText(true).length).toBeGreaterThan(0);
    expect(muteToggleSuccessCueText(false).length).toBeGreaterThan(0);
    expect(muteToggleSuccessCueText(true)).not.toBe(
      muteToggleSuccessCueText(false),
    );
    expect(isCoreSuccessCueText("Mute audio (BGM + SFX)")).toBe(false);
  });
});
