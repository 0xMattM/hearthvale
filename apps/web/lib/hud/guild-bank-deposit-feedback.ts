/**
 * Guild-bank deposit soft confirm leftover (PL143.2).
 * Brief quiet confirm rim after bank deposit ok —
 * complements Deposited ephemeral (PL48.2) + membership open accent (PL140.2).
 * Bank caps / stack rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful guild bank deposit (PL143.2).
 * Quiet membership-blue kinship with guild member open accent — distinct from
 * trade handshake sage + market teal.
 */
export const GUILD_BANK_DEPOSIT_WORLD_REINFORCE = {
  durationMs: 480,
  opacityPeak: 0.84,
  clearPct: 49,
  midPct: 75,
  midRgba: "rgba(64, 100, 120, 0.22)",
  outerRgba: "rgba(32, 52, 68, 0.38)",
} as const;

/**
 * Whether a successful guild bank deposit should flash the soft confirm rim (PL143.2).
 * True only on ok deposit; fail / refuse stay quiet. Bank caps unchanged.
 *
 * @param ok - Whether the guild bank deposit action succeeded.
 * @returns True when the soft deposit rim should briefly flash.
 */
export function shouldFlashGuildBankDepositWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the guild-bank deposit reinforce (PL143.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function guildBankDepositWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } =
    GUILD_BANK_DEPOSIT_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
