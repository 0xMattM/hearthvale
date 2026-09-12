/**
 * Guild-bank withdraw soft confirm leftover (PL148.1).
 * Brief quiet confirm rim after bank withdraw ok —
 * complements Withdrew ephemeral (PL48.3) + deposit rim (PL143.2).
 * Bank caps / stack rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful guild bank withdraw (PL148.1).
 * Quiet steel-slate kinship with deposit membership-blue — distinct outward
 * retrieve, not another Deposited / Withdrew toast.
 */
export const GUILD_BANK_WITHDRAW_WORLD_REINFORCE = {
  durationMs: 480,
  opacityPeak: 0.82,
  clearPct: 49,
  midPct: 75,
  midRgba: "rgba(90, 116, 132, 0.2)",
  outerRgba: "rgba(48, 68, 82, 0.36)",
} as const;

/**
 * Whether a successful guild bank withdraw should flash the soft confirm rim (PL148.1).
 * True only on ok withdraw; fail / refuse stay quiet. Bank caps unchanged.
 *
 * @param ok - Whether the guild bank withdraw action succeeded.
 * @returns True when the soft withdraw rim should briefly flash.
 */
export function shouldFlashGuildBankWithdrawWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the guild-bank withdraw reinforce (PL148.1).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function guildBankWithdrawWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    GUILD_BANK_WITHDRAW_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
