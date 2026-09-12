import { describe, expect, it } from "vitest";
import {
  TIPS_ENABLE_CONFIRM_MS,
  shouldFlashTipsEnableConfirm,
} from "../../apps/web/lib/hud/tips-enable-confirm";

/**
 * PL130.2 — Tips-toggle soft confirm.
 * Choice: brief settings-row flash when enabling onboarding tips (SFX-free visual)
 * so tip preference stays glanceable beside mute/day toggles; disable stays quiet;
 * tip ids / localStorage unchanged; settings only.
 */
describe("CityLands PL130.2 tips-toggle soft confirm", () => {
  it("flashes tips-row confirm only when enabling tips (happy)", () => {
    expect(shouldFlashTipsEnableConfirm(false, true)).toBe(true);
    expect(TIPS_ENABLE_CONFIRM_MS).toBeGreaterThan(0);
  });

  it("stays quiet on disable / no-op (edge)", () => {
    expect(shouldFlashTipsEnableConfirm(true, false)).toBe(false);
    expect(shouldFlashTipsEnableConfirm(false, false)).toBe(false);
    expect(shouldFlashTipsEnableConfirm(true, true)).toBe(false);
  });

  it("refuses inventing always-on tips chrome / column (failure)", () => {
    expect(TIPS_ENABLE_CONFIRM_MS).toBeLessThanOrEqual(1200);
    expect(shouldFlashTipsEnableConfirm(false, true)).not.toBe(
      shouldFlashTipsEnableConfirm(true, false),
    );
  });
});
