/**
 * Chooses chat transport: WebSocket when ready, else HTTP (F8.4).
 */
export function preferWsChat(
  wsReady: boolean,
): "websocket" | "http" {
  return wsReady ? "websocket" : "http";
}
