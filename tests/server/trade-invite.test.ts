import { afterEach, describe, expect, it } from "vitest";
import {
  arePlayersNearbyForTrade,
  TRADE_PING_RANGE,
} from "../../apps/server/src/game/tradeInvite.ts";
import {
  reportPresence,
  resetPresence,
} from "../../apps/server/src/game/presence.ts";

describe("trade invite nearby F8.5", () => {
  afterEach(() => {
    resetPresence();
  });

  it("pings when same land within range (happy)", () => {
    reportPresence({
      userId: "a",
      username: "alice",
      landId: "land1",
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: "b",
      username: "bob",
      landId: "land1",
      x: TRADE_PING_RANGE / 2,
      z: 0,
    });
    expect(arePlayersNearbyForTrade("a", "b")).toBe(true);
  });

  it("skips when different lands (edge)", () => {
    reportPresence({
      userId: "a",
      username: "alice",
      landId: "land1",
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: "b",
      username: "bob",
      landId: "land2",
      x: 0,
      z: 0,
    });
    expect(arePlayersNearbyForTrade("a", "b")).toBe(false);
  });

  it("skips when too far or missing presence (failure)", () => {
    reportPresence({
      userId: "a",
      username: "alice",
      landId: "land1",
      x: 0,
      z: 0,
    });
    reportPresence({
      userId: "b",
      username: "bob",
      landId: "land1",
      x: TRADE_PING_RANGE + 1,
      z: 0,
    });
    expect(arePlayersNearbyForTrade("a", "b")).toBe(false);
    expect(arePlayersNearbyForTrade("a", "missing")).toBe(false);
  });
});
