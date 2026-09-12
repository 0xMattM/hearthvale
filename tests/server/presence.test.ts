import { afterEach, describe, expect, it } from "vitest";
import {
  listPresenceOnLand,
  reportPresence,
  resetPresence,
} from "../../apps/server/src/game/presence.ts";

describe("presence F8.1", () => {
  afterEach(() => {
    resetPresence();
  });

  it("reports and lists another player on the same land (happy)", () => {
    expect(
      reportPresence({
        userId: "a",
        username: "alice",
        landId: "land1",
        x: 1,
        z: 2,
      }).ok,
    ).toBe(true);
    expect(
      reportPresence({
        userId: "b",
        username: "bob",
        landId: "land1",
        x: 3,
        z: 4,
      }).ok,
    ).toBe(true);

    const others = listPresenceOnLand("land1", "a");
    expect(others).toHaveLength(1);
    expect(others[0].username).toBe("bob");
    expect(others[0].x).toBe(3);
  });

  it("hides stale presence (edge)", () => {
    reportPresence({
      userId: "b",
      username: "bob",
      landId: "land1",
      x: 0,
      z: 0,
    });
    const stale = listPresenceOnLand("land1", "a", Date.now() + 60_000);
    expect(stale).toHaveLength(0);
  });

  it("rejects invalid payload (failure)", () => {
    const result = reportPresence({
      userId: "a",
      username: "alice",
      landId: "",
      x: 1,
      z: 2,
    });
    expect(result.ok).toBe(false);
  });
});
