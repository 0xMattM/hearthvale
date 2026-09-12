/**
 * Chat-send soft confirm leftover (PL139.2).
 * Brief quiet soft rim after chat send ok —
 * complements Sent ephemeral (PL62.2) + receive ping (PL27.2).
 * Chat rules unchanged; mute ok; fail silent.
 */

/**
 * Brief soft world rim flash after a successful chat send (PL139.2).
 * Quiet social seafoam — distinct from receive Chat ephemeral and home meadow.
 */
export const CHAT_SEND_WORLD_REINFORCE = {
  durationMs: 420,
  opacityPeak: 0.78,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(72, 100, 112, 0.2)",
  outerRgba: "rgba(36, 52, 64, 0.36)",
} as const;

/**
 * Whether a successful chat send should flash the soft confirm rim (PL139.2).
 * True only on ok send; fail / refuse stay quiet.
 *
 * @param ok - Whether the chat send action succeeded.
 * @returns True when the soft chat-send rim should briefly flash.
 */
export function shouldFlashChatSendWorldReinforce(ok: boolean): boolean {
  return ok === true;
}

/**
 * CSS `background` radial gradient for the chat-send reinforce (PL139.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function chatSendWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = CHAT_SEND_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
