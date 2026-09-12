import { describe, expect, it } from "vitest";
import {
  DAY_NIGHT_ENABLE_CONFIRM_MS,
  shouldFlashDayNightEnableConfirm,
} from "../../apps/web/lib/hud/day-night-enable-confirm";

/**
 * PL130.1 — Day-night toggle soft confirm.
 * Choice: brief settings-row flash when enabling day/night (SFX-free visual)
 * so cosmetic lighting toggle stays glanceable beside mute-enable (PL125.2);
 * disable stays quiet; cycle still cosmetic; settings only.
 */
describe("CityLands PL130.1 day-night toggle soft confirm", () => {
  it("flashes day-night-row confirm only when enabling cycle (happy)", () => {
    expect(shouldFlashDayNightEnableConfirm(false, true)).toBe(true);
    expect(DAY_NIGHT_ENABLE_CONFIRM_MS).toBeGreaterThan(0);
  });

  it("stays quiet on disable / no-op (edge)", () => {
    expect(shouldFlashDayNightEnableConfirm(true, false)).toBe(false);
    expect(shouldFlashDayNightEnableConfirm(false, false)).toBe(false);
    expect(shouldFlashDayNightEnableConfirm(true, true)).toBe(false);
  });

  it("refuses inventing always-on day chrome / column (failure)", () => {
    expect(DAY_NIGHT_ENABLE_CONFIRM_MS).toBeLessThanOrEqual(1200);
    expect(shouldFlashDayNightEnableConfirm(false, true)).not.toBe(
      shouldFlashDayNightEnableConfirm(true, false),
    );
  });
});
