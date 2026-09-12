import { describe, expect, it } from "vitest";
import {
  MINIMAL_WALKING_HOTKEYS,
  compactHudGlanceParts,
  hudMeterPercent,
} from "../../apps/web/lib/hud/hud-chrome";

describe("walking HUD chrome", () => {
  it("compacts glance labels to a key mark (happy)", () => {
    expect(compactHudGlanceParts("Q · Quest")).toEqual({
      mark: "Q",
      count: null,
    });
    expect(compactHudGlanceParts("Q · Quest · 2")).toEqual({
      mark: "Q",
      count: "2",
    });
    expect(compactHudGlanceParts("L · Mail · 3")).toEqual({
      mark: "L",
      count: "3",
    });
    expect(MINIMAL_WALKING_HOTKEYS.map((b) => b.key)).toEqual([
      "E",
      "I",
      "N",
      "Q",
      "H",
    ]);
    expect(hudMeterPercent(50, 100)).toBe(50);
  });

  it("marks word-only glances and clamps meters (edge)", () => {
    expect(compactHudGlanceParts("Notice")).toEqual({ mark: "•", count: null });
    expect(compactHudGlanceParts("  I · Bag  ")).toEqual({
      mark: "I",
      count: null,
    });
    expect(hudMeterPercent(0, 100)).toBe(0);
    expect(hudMeterPercent(100, 100)).toBe(100);
    expect(hudMeterPercent(150, 100)).toBe(100);
    expect(MINIMAL_WALKING_HOTKEYS.every((b) => b.title.length > 0)).toBe(true);
  });

  it("does not invent marks or percents from empty / invalid input (failure)", () => {
    expect(compactHudGlanceParts("")).toEqual({ mark: "", count: null });
    expect(compactHudGlanceParts("   ")).toEqual({ mark: "", count: null });
    expect(compactHudGlanceParts("Q · Quest").mark.toLowerCase()).not.toMatch(
      /claim/,
    );
    expect(hudMeterPercent(10, 0)).toBe(0);
    expect(hudMeterPercent(Number.NaN, 100)).toBe(0);
    expect(hudMeterPercent(20, Number.NaN)).toBe(0);
    expect(MINIMAL_WALKING_HOTKEYS.some((b) => /interact/i.test(b.key))).toBe(
      false,
    );
  });
});
