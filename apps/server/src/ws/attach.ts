import type { Server as HttpServer } from "node:http";
import { eq } from "drizzle-orm";
import { WebSocketServer, type WebSocket } from "ws";
import { userIdFromToken } from "../auth/auth.js";
import {
  CHAT_RATE_LIMIT,
  CHAT_RATE_WINDOW_MS,
  PRESENCE_RATE_LIMIT,
  PRESENCE_RATE_WINDOW_MS,
  consumeRateLimit,
} from "../auth/rateLimit.js";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { listChat, postChat } from "../game/chat.js";
import { postGuildChat } from "../game/guildChat.js";
import {
  activeLandIdForUser,
  listPresenceOnLand,
  reportPresence,
} from "../game/presence.js";
import {
  addClient,
  joinLand,
  pushChat,
  pushPresence,
  removeClient,
} from "./hub.js";

interface InMsg {
  type?: string;
  token?: string;
  landId?: string;
  x?: number;
  z?: number;
  text?: string;
}

interface SocketMeta {
  userId: string;
  username: string;
  landId: string | null;
}

type TaggedSocket = WebSocket & { _meta?: SocketMeta };

/**
 * Attaches `/ws` upgrade handler to the Hono HTTP server (F8.3).
 */
export function attachWebSocket(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket: TaggedSocket) => {
    socket.on("message", (data) => {
      let msg: InMsg;
      try {
        msg = JSON.parse(String(data)) as InMsg;
      } catch {
        socket.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
        return;
      }

      if (msg.type === "auth") {
        const userId = userIdFromToken(msg.token);
        if (!userId) {
          socket.send(JSON.stringify({ type: "error", error: "Unauthorized" }));
          socket.close();
          return;
        }
        const user = db.select().from(users).where(eq(users.id, userId)).get();
        if (!user) {
          socket.send(JSON.stringify({ type: "error", error: "Unauthorized" }));
          socket.close();
          return;
        }
        removeClient(socket);
        socket._meta = { userId, username: user.username, landId: null };
        addClient({
          socket,
          userId,
          username: user.username,
          landId: null,
        });
        socket.send(
          JSON.stringify({
            type: "authed",
            username: user.username,
            chat: listChat(20),
          }),
        );
        return;
      }

      const meta = socket._meta;
      if (!meta) {
        socket.send(JSON.stringify({ type: "error", error: "Auth first" }));
        return;
      }

      if (msg.type === "join") {
        const landId = activeLandIdForUser(meta.userId);
        if (!landId) {
          socket.send(JSON.stringify({ type: "error", error: "No land" }));
          return;
        }
        joinLand(socket, landId);
        meta.landId = landId;
        socket.send(
          JSON.stringify({
            type: "joined",
            landId,
            others: listPresenceOnLand(landId, meta.userId),
          }),
        );
        return;
      }

      if (msg.type === "presence" && meta.landId) {
        if (
          !consumeRateLimit(
            `presence:${meta.userId}`,
            PRESENCE_RATE_LIMIT,
            PRESENCE_RATE_WINDOW_MS,
          )
        ) {
          return;
        }
        reportPresence({
          userId: meta.userId,
          username: meta.username,
          landId: meta.landId,
          x: typeof msg.x === "number" ? msg.x : 0,
          z: typeof msg.z === "number" ? msg.z : 0,
        });
        // Full land snapshot; each client filters self.
        pushPresence(meta.landId, listPresenceOnLand(meta.landId, ""));
        return;
      }

      if (msg.type === "chat") {
        if (
          !consumeRateLimit(
            `chat:${meta.userId}`,
            CHAT_RATE_LIMIT,
            CHAT_RATE_WINDOW_MS,
          )
        ) {
          socket.send(
            JSON.stringify({
              type: "error",
              error: "Slow down — chat is cooling off.",
            }),
          );
          return;
        }
        const result = postChat(meta.username, msg.text ?? "");
        if (!result.ok) {
          socket.send(JSON.stringify({ type: "error", error: result.error }));
          return;
        }
        pushChat(null, result.message);
        return;
      }

      if (msg.type === "guild_chat") {
        if (
          !consumeRateLimit(
            `chat:${meta.userId}`,
            CHAT_RATE_LIMIT,
            CHAT_RATE_WINDOW_MS,
          )
        ) {
          socket.send(
            JSON.stringify({
              type: "error",
              error: "Slow down — chat is cooling off.",
            }),
          );
          return;
        }
        const result = postGuildChat(meta.userId, msg.text ?? "");
        if (!result.ok) {
          socket.send(JSON.stringify({ type: "error", error: result.error }));
          return;
        }
        // postGuildChat already broadcasts to guild members
        return;
      }
    });

    socket.on("close", () => {
      removeClient(socket);
    });
  });

  return wss;
}
