/**
 * Tips-toggle soft visual confirm (PL130.2).
 * Brief settings-row flash when enabling onboarding tips — complements mute-enable
 * (PL125.2) and day-night enable (PL130.1). Tip ids / localStorage unchanged; settings only.
 */

/** How long the tips-enable row confirm stays visible. */
export const TIPS_ENABLE_CONFIRM_MS = 520;

/**
 * Whether enabling tips should flash the settings tips-row confirm (PL130.2).
 * True only on false→true tips edge (not disable, not no-op).
 *
 * @param previousEnabled - Tips flag before the change.
 * @param nextEnabled - Tips flag after the change.
 * @returns True when tips were just enabled.
 */
export function shouldFlashTipsEnableConfirm(
  previousEnabled: boolean,
  nextEnabled: boolean,
): boolean {
  return previousEnabled === false && nextEnabled === true;
}
