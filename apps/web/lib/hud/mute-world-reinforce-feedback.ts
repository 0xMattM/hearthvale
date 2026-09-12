/**
 * Mute soft world reinforce leftover (PL180.1).
 * Brief soft rim when mute toggles on/off from settings —
 * complements Muted/Unmuted ephemeral (PL37.2) + mute enable confirm (PL125.2).
 * Audio rules unchanged; mute ok (rim is visual-only); no-op quiet.
 */

/**
 * Brief soft world rim flash when mute toggles from settings (PL180.1).
 * Quiet hush graphite settle — kinship with mute chrome, distinct from
 * day-night dawn-slate enable rim + wallet-disconnect ash-slate.
 */
export const MUTE_WORLD_REINFORCE = {
  durationMs: 500,
  opacityPeak: 0.8,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(100, 104, 116, 0.2)",
  outerRgba: "rgba(32, 36, 48, 0.36)",
} as const;

/**
 * Whether a mute settings toggle should flash the soft world rim (PL180.1).
 * True on mute or unmute edge; no-op stays quiet. Audio rules unchanged.
 *
 * @param previousMuted - Mute flag before the change.
 * @param nextMuted - Mute flag after the change.
 * @returns True when the soft mute rim should briefly flash.
 */
export function shouldFlashMuteWorldReinforce(
  previousMuted: boolean,
  nextMuted: boolean,
): boolean {
  return previousMuted !== nextMuted;
}

/**
 * CSS `background` radial gradient for the mute reinforce (PL180.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function muteWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = MUTE_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
