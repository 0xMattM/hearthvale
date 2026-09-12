import { describe, expect, it } from "vitest";
import {
  CHARACTER_LEVEL,
  CHARACTER_LEVEL_THRESHOLDS,
  hasExtraDecorPadUnlock,
} from "@game/shared";
import {
  EXTRA_DECOR_PAD_UNLOCK_CUE,
  SUCCESS_CUE_MS,
  extraDecorPadUnlockCueText,
  isCoreSuccessCueText,
  shouldFlashExtraDecorPadUnlockCue,
  titleWithDecorPadUnlockCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL49.2 — Extra decor pad unlock tip once.
 * One-shot ephemeral when characterLevel first reaches the soft unlock.
 */
describe("CityLands PL49.2 extra decor pad unlock tip once", () => {
  it("flashes Decor · extra pad on unlock edge; L5 combines with title (happy)", () => {
    expect(extraDecorPadUnlockCueText()).toBe(EXTRA_DECOR_PAD_UNLOCK_CUE);
    expect(extraDecorPadUnlockCueText()).toBe("Decor · extra pad");
    expect(isCoreSuccessCueText("Decor · extra pad")).toBe(true);
    expect(shouldFlashExtraDecorPadUnlockCue(false, true)).toBe(true);
    expect(titleWithDecorPadUnlockCueText("Homesteader")).toBe(
      "Homesteader · decor pad",
    );
    expect(hasExtraDecorPadUnlock(CHARACTER_LEVEL_THRESHOLDS[5]!)).toBe(true);
    expect(CHARACTER_LEVEL.extraDecorPadAtLevel).toBe(5);
  });

  it("stays one-shot — hydrate and already-unlocked stay quiet (edge)", () => {
    expect(shouldFlashExtraDecorPadUnlockCue(null, true)).toBe(false);
    expect(shouldFlashExtraDecorPadUnlockCue(undefined, true)).toBe(false);
    expect(shouldFlashExtraDecorPadUnlockCue(true, true)).toBe(false);
    expect(shouldFlashExtraDecorPadUnlockCue(false, false)).toBe(false);
    expect(shouldFlashExtraDecorPadUnlockCue(true, false)).toBe(false);
    expect(hasExtraDecorPadUnlock(CHARACTER_LEVEL_THRESHOLDS[5]! - 1)).toBe(
      false,
    );
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("does not invent pad slot / HUD column or sticky unlock prose (failure)", () => {
    expect(CHARACTER_LEVEL.extraDecorPad.slotIndex).toBe(19);
    expect(CHARACTER_LEVEL.extraDecorPad.x).toBe(-4);
    expect(CHARACTER_LEVEL.extraDecorPad.z).toBe(-2);
    expect(isCoreSuccessCueText("Decor · extra pad · always-on")).toBe(false);
    expect(isCoreSuccessCueText("Unlocked extra decor forever")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(extraDecorPadUnlockCueText().toLowerCase()).not.toContain(
      "always-on",
    );
  });
});
