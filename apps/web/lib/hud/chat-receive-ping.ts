/**
 * Quiet chat-receive feedback when the chat panel is closed (PL27.2).
 * No always-on chat column; cooldown avoids arcade spam stacks.
 */

/** Minimum gap between receive pings (SFX + optional ephemeral). */
export const CHAT_RECEIVE_PING_COOLDOWN_MS = 1200;

export interface ChatReceivePingInput {
  /** True when the chat panel is already open (player is reading). */
  chatPanelOpen: boolean;
  /** Sender username on the incoming line. */
  fromUsername: string | null | undefined;
  /** Local player username — own echoes stay silent. */
  selfUsername: string | null | undefined;
}

/**
 * Whether an incoming chat line should trigger a soft receive ping.
 * Panel-open and own-message paths stay silent.
 *
 * @param input - Panel + sender identity.
 * @returns True when a quiet ping is appropriate.
 */
export function shouldPlayChatReceivePing(
  input: ChatReceivePingInput,
): boolean {
  if (input.chatPanelOpen) return false;
  const from = (input.fromUsername ?? "").trim();
  if (!from) return false;
  const self = (input.selfUsername ?? "").trim();
  if (self && from.toLowerCase() === self.toLowerCase()) return false;
  return true;
}

/**
 * Cooldown gate so rapid lines do not stack SFX / ephemeral spam.
 *
 * @param nowMs - Current time.
 * @param lastPingMs - Last successful ping time, or null if never.
 * @param cooldownMs - Minimum gap (defaults to CHAT_RECEIVE_PING_COOLDOWN_MS).
 * @returns True when enough time has passed.
 */
export function shouldAllowChatReceivePingAt(
  nowMs: number,
  lastPingMs: number | null,
  cooldownMs: number = CHAT_RECEIVE_PING_COOLDOWN_MS,
): boolean {
  if (lastPingMs == null) return true;
  return nowMs - lastPingMs >= cooldownMs;
}
