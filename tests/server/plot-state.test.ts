import { describe, expect, it } from "vitest";

/**
 * Mirrors server resolvePlotState without importing sqlite-native modules.
 */
function resolvePlotState(
  plot: { cropId: string | null; readyAt: number | null },
  now: number,
): "empty" | "planted" | "ready" {
  if (!plot.cropId || !plot.readyAt) return "empty";
  if (now >= plot.readyAt) return "ready";
  return "planted";
}

describe("plot growth state", () => {
  it("is empty without crop", () => {
    expect(resolvePlotState({ cropId: null, readyAt: null }, 1000)).toBe("empty");
  });

  it("is planted before readyAt", () => {
    expect(
      resolvePlotState({ cropId: "wheat", readyAt: 2000 }, 1500),
    ).toBe("planted");
  });

  it("is ready at or after readyAt", () => {
    expect(resolvePlotState({ cropId: "wheat", readyAt: 2000 }, 2000)).toBe("ready");
  });
});
