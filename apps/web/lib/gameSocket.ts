/**
 * Client WebSocket gateway for presence + chat (F8.3).
 * Falls back to HTTP when the socket is closed.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export type GameSocketMessage =
  | { type: "authed"; username: string; chat?: ChatLine[] }
  | { type: "joined"; landId: string; others?: PresenceLine[] }
  | { type: "presence"; others: PresenceLine[] }
  | { type: "chat"; message: ChatLine }
  | { type: "guild_chat"; message: ChatLine }
  | { type: "trade_invite"; tradeId: string; fromUsername: string }
  | {
      type: "guild_invite";
      code: string;
      fromUsername: string;
      guildName?: string;
    }
  | { type: "error"; error: string };

export interface ChatLine {
  id: string;
  username: string;
  text: string;
  t: number;
}

export interface PresenceLine {
  username: string;
  x: number;
  z: number;
  updatedAt?: number;
}

/**
 * Builds `ws(s)://host/ws` from the REST API base URL.
 */
export function wsUrlFromApi(apiUrl = API_URL): string {
  const u = new URL(apiUrl);
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
  u.pathname = "/ws";
  u.search = "";
  u.hash = "";
  return u.toString();
}

export interface GameSocketHandlers {
  onMessage: (msg: GameSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Opens an authenticated land channel. Returns a dispose function.
 */
export function connectGameSocket(
  token: string,
  landId: string,
  handlers: GameSocketHandlers,
): { dispose: () => void; sendPresence: (x: number, z: number) => void; sendChat: (text: string) => void; sendGuildChat: (text: string) => void; ready: () => boolean } {
  let socket: WebSocket | null = null;
  let disposed = false;
  let joined = false;

  function open() {
    if (disposed) return;
    socket = new WebSocket(wsUrlFromApi());
    socket.onopen = () => {
      socket?.send(JSON.stringify({ type: "auth", token }));
      handlers.onOpen?.();
    };
    socket.onmessage = (ev) => {
      let msg: GameSocketMessage;
      try {
        msg = JSON.parse(String(ev.data)) as GameSocketMessage;
      } catch {
        return;
      }
      if (msg.type === "authed") {
        socket?.send(JSON.stringify({ type: "join", landId }));
      }
      if (msg.type === "joined") joined = true;
      handlers.onMessage(msg);
    };
    socket.onclose = () => {
      joined = false;
      handlers.onClose?.();
      if (!disposed) {
        window.setTimeout(open, 2500);
      }
    };
  }

  open();

  return {
    dispose() {
      disposed = true;
      socket?.close();
      socket = null;
    },
    sendPresence(x: number, z: number) {
      if (!joined || !socket || socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ type: "presence", x, z }));
    },
    sendChat(text: string) {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ type: "chat", text }));
    },
    sendGuildChat(text: string) {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ type: "guild_chat", text }));
    },
    ready: () => joined && socket?.readyState === WebSocket.OPEN,
  };
}
