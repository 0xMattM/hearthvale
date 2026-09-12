import { describe, expect, it } from "vitest";
import {
  shouldShowVisitHomeReturnWorldTip,
  VISIT_HOME_RETURN_WORLD_TIP,
  visitHomeReturnWorldTip,
} from "@game/shared";
import {
  MAP_CHIP_ARRIVE_PULSE_MS,
  formatCurrentMapChip,
  shouldPulseMapChipOnVisitHomeReturn,
} from "../../apps/web/lib/hud/topbar-chrome";
import {
  SUCCESS_CUE_MS,
  VISIT_LEAVE_SUCCESS_CUE,
  isCoreSuccessCueText,
  visitLeaveSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL114.2 — Visit-home return cue clarity.
 * Choice: soft `Your land` tip + Land map-chip pulse reinforce PL27.1 `Home`
 * ephemeral; visit rules / min HUD unchanged.
 */
describe("CityLands PL114.2 visit-home return cue clarity", () => {
  it("shows Your land tip + Land chip pulse when leaving a visit (happy)", () => {
    expect(shouldShowVisitHomeReturnWorldTip(true)).toBe(true);
    expect(shouldPulseMapChipOnVisitHomeReturn(true)).toBe(true);
    expect(visitHomeReturnWorldTip()).toBe("Your land");
    expect(visitHomeReturnWorldTip()).toBe(VISIT_HOME_RETURN_WORLD_TIP);
    expect(visitLeaveSuccessCueText()).toBe(VISIT_LEAVE_SUCCESS_CUE);
    expect(isCoreSuccessCueText(visitLeaveSuccessCueText())).toBe(true);
    expect(formatCurrentMapChip("player_land").word).toBe("Land");
  });

  it("keeps tip brief alongside Home ephemeral; pulse brief (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    expect(MAP_CHIP_ARRIVE_PULSE_MS).toBeGreaterThanOrEqual(300);
    expect(MAP_CHIP_ARRIVE_PULSE_MS).toBeLessThanOrEqual(800);
    // Soft tip is identity reinforce — not a second success cue verb.
    expect(isCoreSuccessCueText(VISIT_HOME_RETURN_WORLD_TIP)).toBe(false);
    expect(VISIT_HOME_RETURN_WORLD_TIP.toLowerCase()).toContain("land");
    expect(VISIT_HOME_RETURN_WORLD_TIP).not.toBe(VISIT_LEAVE_SUCCESS_CUE);
  });

  it("stays quiet on own-land idle / non-leave (failure)", () => {
    expect(shouldShowVisitHomeReturnWorldTip(false)).toBe(false);
    expect(shouldPulseMapChipOnVisitHomeReturn(false)).toBe(false);
    expect(shouldShowVisitHomeReturnWorldTip(Boolean(null))).toBe(false);
    expect(shouldPulseMapChipOnVisitHomeReturn(Boolean(0))).toBe(false);
  });
});
