/**
 * In-memory world chat ring buffer (HTTP + WS push).
 */

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  t: number;
}

const MAX = 80;
const messages: ChatMessage[] = [];
let seq = 0;

/**
 * Posts a chat line (truncated, length-limited).
 */
export function postChat(
  username: string,
  text: string,
): { ok: true; message: ChatMessage } | { ok: false; error: string } {
  const cleaned = text.trim().slice(0, 160);
  if (!cleaned) return { ok: false, error: "Type a message first." };
  const message: ChatMessage = {
    id: `c${++seq}`,
    username,
    text: cleaned,
    t: Date.now(),
  };
  messages.push(message);
  if (messages.length > MAX) messages.shift();
  return { ok: true, message };
}

/**
 * Recent chat lines newest-last.
 */
export function listChat(limit = 40): ChatMessage[] {
  return messages.slice(-Math.max(1, Math.min(limit, MAX)));
}
