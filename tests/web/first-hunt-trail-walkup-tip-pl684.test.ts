import { describe, expect, it } from "vitest";
import {
  EDGE_HUNT,
  HUNT,
  HUNT_TRAIL_FIRST_WALKUP_WORLD_TIP,
  huntTrailFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_HUNT_TRAIL_WALKUP_CUE,
  firstHuntTrailWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstHuntTrailWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL68.4 — First hunt trail walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near game trail / edge thicket;
 * hunt / spawn rates unchanged; min HUD.
 */
describe("CityLands PL68.4 first hunt trail walk-up tip once", () => {
  it("flashes Trail · hunt on first trail/thicket proximity (happy)", () => {
    expect(firstHuntTrailWalkUpCueText()).toBe(FIRST_HUNT_TRAIL_WALKUP_CUE);
    expect(firstHuntTrailWalkUpCueText()).toBe("Trail · hunt");
    expect(firstHuntTrailWalkUpCueText().toLowerCase()).toMatch(/hunt|trail/);
    expect(isCoreSuccessCueText("Trail · hunt")).toBe(true);
    expect(huntTrailFirstWalkUpWorldTip()).toBe(
      HUNT_TRAIL_FIRST_WALKUP_WORLD_TIP,
    );
    expect(huntTrailFirstWalkUpWorldTip()).toMatch(/Hunt/);
    expect(huntTrailFirstWalkUpWorldTip()).toMatch(/wildlife|nearby/i);
    expect(huntTrailFirstWalkUpWorldTip()).not.toMatch(/\bE\b/);

    expect(shouldFlashFirstHuntTrailWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstHuntTrailWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstHuntTrailWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstHuntTrailWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstHuntTrailWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps hunt cooldown / spawn rates and min HUD (failure)", () => {
    expect(HUNT.cooldownMs).toBe(60_000);
    expect(EDGE_HUNT.cooldownMs).toBe(90_000);
    expect(HUNT.leatherQty).toBe(1);
    expect(EDGE_HUNT.tuskQty).toBe(1);
    expect(firstHuntTrailWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(huntTrailFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Trail · sticky forever")).toBe(false);
    expect(shouldFlashFirstHuntTrailWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstHuntTrailWalkUpCue(true, true, true)).toBe(false);
  });
});
