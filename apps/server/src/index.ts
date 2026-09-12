import "./load-env.js";
import { serve } from "@hono/node-server";
import type { Server } from "node:http";
import { LIVE_COMBAT } from "@game/shared";
import { app } from "./app.js";
import { dbDriver, migrateDatabase } from "./db/client.js";
import { pulseActiveCombatSessions } from "./game/actions/combat-live.js";
import { startAttestcoinWorker } from "./game/creditcoin/worker.js";
import { attachWebSocket } from "./ws/attach.js";

const port = Number(process.env.PORT ?? 8787);
const maxListenAttempts = 8;

/**
 * Starts the HTTP + WebSocket server with retry on Windows EADDRINUSE.
 */
function listen(attempt = 1): Server {
  const server = serve({ fetch: app.fetch, port }, () => {
    console.log(`Game server listening on http://localhost:${port}`);
    console.log(`WebSocket gateway on ws://localhost:${port}/ws`);
    console.log(`DB driver: ${dbDriver}`);
  }) as unknown as Server;

  function onListenError(err: NodeJS.ErrnoException): void {
    try {
      server.close();
    } catch {
      /* ignore */
    }
    if (err.code === "EADDRINUSE" && attempt < maxListenAttempts) {
      const delayMs = 250 * attempt;
      console.warn(
        `Port ${port} busy (attempt ${attempt}/${maxListenAttempts}); retry in ${delayMs}ms…`,
      );
      setTimeout(() => listen(attempt + 1), delayMs);
      return;
    }
    console.error(err);
    process.exit(1);
  }

  // Reason: attach before WebSocketServer so EADDRINUSE is not an unhandled `ws` error.
  server.on("error", onListenError);
  const wss = attachWebSocket(server);
  wss.on("error", onListenError);

  if (attempt === 1) {
    function shutdown() {
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 1500).unref();
    }
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
    process.once("SIGUSR2", shutdown);
  }

  return server;
}

void migrateDatabase()
  .then(() => {
    startAttestcoinWorker();
    listen();
    setInterval(() => {
      try {
        pulseActiveCombatSessions();
      } catch {
        /* ignore a bad session; next pulse continues */
      }
    }, LIVE_COMBAT.tickMs).unref();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
