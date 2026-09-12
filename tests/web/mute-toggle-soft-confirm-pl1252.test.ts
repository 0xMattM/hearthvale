import { describe, expect, it } from "vitest";
import { createGameAudio, shouldPlaySfx } from "../../apps/web/lib/game-audio";
import {
  MUTE_ENABLE_CONFIRM_MS,
  shouldFlashMuteEnableConfirm,
} from "../../apps/web/lib/hud/mute-enable-confirm";
import {
  MUTE_ON_SUCCESS_CUE,
  muteToggleSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL125.2 — Mute-toggle soft confirm.
 * Choice: brief settings mute-row flash when enabling mute (SFX-free visual)
 * so mute stays glanceable beside TopBar Muted (PL37.2); unmute stays cue-only;
 * mute still silences BGM+SFX; settings only.
 */
describe("CityLands PL125.2 mute-toggle soft confirm", () => {
  it("flashes mute-row confirm only when enabling mute (happy)", () => {
    expect(shouldFlashMuteEnableConfirm(false, true)).toBe(true);
    expect(MUTE_ENABLE_CONFIRM_MS).toBeGreaterThan(0);
    expect(muteToggleSuccessCueText(true)).toBe(MUTE_ON_SUCCESS_CUE);
    expect(MUTE_ON_SUCCESS_CUE).toBe("Muted");
  });

  it("stays quiet on unmute / no-op; audio still silences (edge)", () => {
    expect(shouldFlashMuteEnableConfirm(true, false)).toBe(false);
    expect(shouldFlashMuteEnableConfirm(false, false)).toBe(false);
    expect(shouldFlashMuteEnableConfirm(true, true)).toBe(false);

    const audio = createGameAudio();
    audio.setMuted(true);
    expect(audio.isMuted()).toBe(true);
    expect(shouldPlaySfx(true, "build")).toBe(false);
  });

  it("refuses inventing always-on mute chrome / column (failure)", () => {
    expect(MUTE_ENABLE_CONFIRM_MS).toBeLessThanOrEqual(1200);
    expect(shouldFlashMuteEnableConfirm(false, true)).not.toBe(
      shouldFlashMuteEnableConfirm(true, false),
    );
    expect(muteToggleSuccessCueText(true)).not.toMatch(/volume|dB|column/i);
  });
});
