import { afterEach, describe, expect, it } from "vitest";
import {
  addClient,
  broadcastLand,
  countOnLand,
  joinLand,
  pushChat,
  pushPresence,
  pushTradeInvite,
  removeClient,
  resetHub,
} from "../../apps/server/src/ws/hub.ts";
import type { WebSocket } from "ws";

function mockSocket() {
  const sent: string[] = [];
  const socket = {
    readyState: 1,
    send(raw: string) {
      sent.push(raw);
    },
  } as unknown as WebSocket;
  return { socket, sent };
}

describe("ws hub F8.3+", () => {
  afterEach(() => {
    resetHub();
  });

  it("broadcasts presence to land subscribers (happy)", () => {
    const a = mockSocket();
    const b = mockSocket();
    addClient({
      socket: a.socket,
      userId: "1",
      username: "alice",
      landId: null,
    });
    addClient({
      socket: b.socket,
      userId: "2",
      username: "bob",
      landId: null,
    });
    joinLand(a.socket, "land-a");
    joinLand(b.socket, "land-a");
    expect(countOnLand("land-a")).toBe(2);

    pushPresence("land-a", [{ username: "alice", x: 1, z: 2 }]);
    expect(a.sent).toHaveLength(1);
    expect(b.sent).toHaveLength(1);
    expect(JSON.parse(a.sent[0]).type).toBe("presence");
  });

  it("does not leak presence across lands (edge)", () => {
    const a = mockSocket();
    const b = mockSocket();
    addClient({
      socket: a.socket,
      userId: "1",
      username: "alice",
      landId: null,
    });
    addClient({
      socket: b.socket,
      userId: "2",
      username: "bob",
      landId: null,
    });
    joinLand(a.socket, "land-a");
    joinLand(b.socket, "land-b");
    broadcastLand("land-a", { type: "ping" });
    expect(a.sent).toHaveLength(1);
    expect(b.sent).toHaveLength(0);
  });

  it("world chat reaches all clients; remove stops delivery (failure path)", () => {
    const a = mockSocket();
    addClient({
      socket: a.socket,
      userId: "1",
      username: "alice",
      landId: "land-a",
    });
    pushChat(null, {
      id: "m1",
      username: "bob",
      text: "hi",
      t: 1,
    });
    expect(a.sent).toHaveLength(1);
    removeClient(a.socket);
    pushChat(null, {
      id: "m2",
      username: "bob",
      text: "again",
      t: 2,
    });
    expect(a.sent).toHaveLength(1);
  });

  it("indexes land peers so other lands stay quiet (RF4.3)", () => {
    const a = mockSocket();
    const b = mockSocket();
    const c = mockSocket();
    addClient({
      socket: a.socket,
      userId: "1",
      username: "alice",
      landId: null,
    });
    addClient({
      socket: b.socket,
      userId: "2",
      username: "bob",
      landId: null,
    });
    addClient({
      socket: c.socket,
      userId: "3",
      username: "cara",
      landId: null,
    });
    joinLand(a.socket, "land-a");
    joinLand(b.socket, "land-a");
    joinLand(c.socket, "land-b");
    expect(countOnLand("land-a")).toBe(2);
    expect(countOnLand("land-b")).toBe(1);
    const n = broadcastLand("land-a", { type: "ping" });
    expect(n).toBe(2);
    expect(a.sent).toHaveLength(1);
    expect(b.sent).toHaveLength(1);
    expect(c.sent).toHaveLength(0);
  });
});
