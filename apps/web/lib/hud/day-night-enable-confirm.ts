/**
 * Day-night toggle soft visual confirm (PL130.1).
 * Brief settings-row flash when enabling day/night cycle — complements mute-enable
 * (PL125.2). Cycle still cosmetic; settings only.
 */

/** How long the day-night-enable row confirm stays visible. */
export const DAY_NIGHT_ENABLE_CONFIRM_MS = 520;

/**
 * Whether enabling day/night should flash the settings row confirm (PL130.1).
 * True only on false→true cycle edge (not disable, not no-op).
 *
 * @param previousEnabled - Day/night flag before the change.
 * @param nextEnabled - Day/night flag after the change.
 * @returns True when day/night was just enabled.
 */
export function shouldFlashDayNightEnableConfirm(
  previousEnabled: boolean,
  nextEnabled: boolean,
): boolean {
  return previousEnabled === false && nextEnabled === true;
}
