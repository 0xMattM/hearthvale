/**
 * Mute-enable soft visual confirm (PL125.2).
 * Brief settings-row flash when enabling mute — complements ephemeral Muted (PL37.2)
 * and immediate audio silencing. Settings only; unmute stays TopBar-cue-only.
 */

/** How long the mute-enable row confirm stays visible. */
export const MUTE_ENABLE_CONFIRM_MS = 520;

/**
 * Whether enabling mute should flash the settings mute-row confirm (PL125.2).
 * True only on false→true mute edge (not unmute, not no-op).
 *
 * @param previousMuted - Mute flag before the change.
 * @param nextMuted - Mute flag after the change.
 * @returns True when mute was just enabled.
 */
export function shouldFlashMuteEnableConfirm(
  previousMuted: boolean,
  nextMuted: boolean,
): boolean {
  return previousMuted === false && nextMuted === true;
}
