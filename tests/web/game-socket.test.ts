import { describe, expect, it } from "vitest";
import { wsUrlFromApi } from "../../apps/web/lib/gameSocket.ts";

describe("gameSocket url F8.3", () => {
  it("maps http API to ws /ws (happy)", () => {
    expect(wsUrlFromApi("http://localhost:8787")).toBe(
      "ws://localhost:8787/ws",
    );
  });

  it("maps https API to wss (edge)", () => {
    expect(wsUrlFromApi("https://game.example.com")).toBe(
      "wss://game.example.com/ws",
    );
  });

  it("strips path/query from API base (failure-ish)", () => {
    expect(wsUrlFromApi("http://localhost:8787/api?x=1")).toBe(
      "ws://localhost:8787/ws",
    );
  });
});
