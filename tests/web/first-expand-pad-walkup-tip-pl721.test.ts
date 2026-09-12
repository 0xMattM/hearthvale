import { describe, expect, it } from "vitest";
import {
  EXPAND_PAD_FIRST_WALKUP_WORLD_TIP,
  SLOT_EXPANSIONS,
  expandPadFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_EXPAND_PAD_WALKUP_CUE,
  firstExpandPadWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstExpandPadWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL72.1 — First expand-pad walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near expand pad;
 * expand costs unchanged; min HUD.
 */
describe("CityLands PL72.1 first expand-pad walk-up tip once", () => {
  it("flashes Expand · unlock field on first expand-pad proximity (happy)", () => {
    expect(firstExpandPadWalkUpCueText()).toBe(FIRST_EXPAND_PAD_WALKUP_CUE);
    expect(firstExpandPadWalkUpCueText()).toBe("Expand · unlock field");
    expect(firstExpandPadWalkUpCueText().toLowerCase()).toMatch(/unlock|expand/);
    expect(isCoreSuccessCueText("Expand · unlock field")).toBe(true);
    expect(expandPadFirstWalkUpWorldTip()).toBe(
      EXPAND_PAD_FIRST_WALKUP_WORLD_TIP,
    );
    expect(expandPadFirstWalkUpWorldTip()).toMatch(/Expand/);
    expect(expandPadFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstExpandPadWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstExpandPadWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstExpandPadWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstExpandPadWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstExpandPadWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps expand costs and min HUD (failure)", () => {
    expect(SLOT_EXPANSIONS[0]?.coinCost).toBe(25);
    expect(SLOT_EXPANSIONS[0]?.materials).toEqual([
      { itemId: "iron_bar", qty: 1 },
    ]);
    expect(SLOT_EXPANSIONS[1]?.coinCost).toBe(40);
    expect(SLOT_EXPANSIONS[1]?.materials).toEqual([
      { itemId: "iron_bar", qty: 2 },
    ]);
    expect(defaultClosedPanelIds()).toContain("build");
    expect(firstExpandPadWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(expandPadFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Expand · sticky forever")).toBe(false);
    expect(shouldFlashFirstExpandPadWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstExpandPadWalkUpCue(true, true, true)).toBe(false);
  });
});
