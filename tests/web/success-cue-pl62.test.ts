import { describe, expect, it } from "vitest";
import {
  SUCCESS_CUE_MS,
  coreSuccessCueText,
  isCoreSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL6.2 — Brief success cue on plant / harvest / craft / travel.
 */
describe("CityLands PL6.2 brief core-action success cue", () => {
  it("uses short copy for plant/harvest/craft/travel (happy)", () => {
    expect(coreSuccessCueText("plant")).toBe("Planted");
    expect(coreSuccessCueText("harvest")).toBe("Harvested");
    expect(coreSuccessCueText("craft")).toBe("Crafted");
    expect(coreSuccessCueText("travel")).toBe("Arrived");
    expect(coreSuccessCueText("travel", "City")).toBe("Arrived · City");
    expect(coreSuccessCueText("travel", "Your Land")).toBe(
      "Arrived · Your Land",
    );
  });

  it("clears quickly — SUCCESS_CUE_MS stays brief (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("recognizes ephemeral cues only — not permanent toasts (failure)", () => {
    expect(isCoreSuccessCueText("Planted")).toBe(true);
    expect(isCoreSuccessCueText("Harvested")).toBe(true);
    expect(isCoreSuccessCueText("Crafted")).toBe(true);
    expect(isCoreSuccessCueText("Arrived · Exploration")).toBe(true);
    expect(isCoreSuccessCueText("Harvested · Wheat ×2")).toBe(true);
    expect(isCoreSuccessCueText("Working · Flour")).toBe(true);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(isCoreSuccessCueText("Listed on the market.")).toBe(false);
    expect(isCoreSuccessCueText("Visiting bob. Esc or Go home to leave.")).toBe(
      false,
    );
  });
});
