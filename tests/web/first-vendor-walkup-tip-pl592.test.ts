import { describe, expect, it } from "vitest";
import {
  VENDOR_FIRST_WALKUP_WORLD_TIP,
  vendorFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_VENDOR_WALKUP_CUE,
  firstVendorWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstVendorWalkUpCue,
  SUCCESS_CUE_MS,
  VENDOR_BUY_SUCCESS_CUE,
  VENDOR_SELL_SUCCESS_CUE,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL59.2 — First vendor walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near vendor stall;
 * tools / seeds sink; vendor prices unchanged; min HUD.
 */
describe("CityLands PL59.2 first vendor walk-up tip once", () => {
  it("flashes Vendor · tools + seeds on first stall proximity (happy)", () => {
    expect(firstVendorWalkUpCueText()).toBe(FIRST_VENDOR_WALKUP_CUE);
    expect(firstVendorWalkUpCueText()).toBe("Vendor · tools + seeds");
    expect(firstVendorWalkUpCueText().toLowerCase()).toMatch(/tools|seeds/);
    expect(isCoreSuccessCueText("Vendor · tools + seeds")).toBe(true);
    expect(vendorFirstWalkUpWorldTip()).toBe(VENDOR_FIRST_WALKUP_WORLD_TIP);
    expect(vendorFirstWalkUpWorldTip()).toMatch(/Buy/);
    expect(vendorFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstVendorWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstVendorWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstVendorWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstVendorWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstVendorWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps sell/buy confirms distinct and min HUD (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("vendor");
    expect(VENDOR_BUY_SUCCESS_CUE).toBe("Bought");
    expect(VENDOR_SELL_SUCCESS_CUE).toBe("Sold");
    expect(firstVendorWalkUpCueText()).not.toBe(VENDOR_BUY_SUCCESS_CUE);
    expect(firstVendorWalkUpCueText().toLowerCase()).not.toContain("always-on");
    expect(vendorFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Vendor · sticky forever")).toBe(false);
    expect(shouldFlashFirstVendorWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstVendorWalkUpCue(true, true, true)).toBe(false);
  });
});
