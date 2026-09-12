import { describe, expect, it } from "vitest";
import {
  ENERGY,
  EXPAND_PAD_AFFORD_CUE,
  EXPAND_PAD_SHORT_AFFORD_PULSE,
  SLOT_EXPANSIONS,
  expandPadAffordMode,
  expandPadMeshColors,
  expandPadShortAffordPulseActive,
  expandPadShortAffordPulseEmissive,
  expandPadShortAffordPulseEmissiveIntensity,
  expandPadShortAffordPulseEnvelope,
} from "@game/shared";

/**
 * PL123.1 — Expand-pad short afford pulse (soft pad while short + highlighted).
 * Complements PL26.1 short tint; expand costs / slots unchanged; mute ok.
 * Choice: continuous soft sine while short+highlighted (not one-shot) so
 * can't-afford pads stay glanceable in walk-up range.
 */
describe("CityLands PL123.1 expand-pad short afford pulse", () => {
  const first = SLOT_EXPANSIONS[0]!;

  function qty(map: Record<string, number>) {
    return (itemId: string) => map[itemId] ?? 0;
  }

  it("pulses emissive only while short and interact-highlighted (happy)", () => {
    expect(expandPadShortAffordPulseActive("short", true)).toBe(true);
    expect(expandPadShortAffordPulseEmissive("short", true)).toBe(
      EXPAND_PAD_SHORT_AFFORD_PULSE.emissive,
    );

    const peak = expandPadShortAffordPulseEmissiveIntensity(
      "short",
      true,
      false,
      1,
    );
    const trough = expandPadShortAffordPulseEmissiveIntensity(
      "short",
      true,
      false,
      0,
    );
    expect(peak).toBeCloseTo(EXPAND_PAD_SHORT_AFFORD_PULSE.emissivePeak, 5);
    expect(trough).toBeCloseTo(EXPAND_PAD_SHORT_AFFORD_PULSE.emissiveBase, 5);
    expect(peak).toBeGreaterThan(trough);
    expect(EXPAND_PAD_SHORT_AFFORD_PULSE.periodMs).toBeGreaterThan(0);
    expect(EXPAND_PAD_SHORT_AFFORD_PULSE.emissive).not.toBe(
      EXPAND_PAD_AFFORD_CUE.affordableEmissive,
    );
  });

  it("stays quiet when affordable or not highlighted; walk-up floor (edge)", () => {
    expect(expandPadShortAffordPulseActive("affordable", true)).toBe(false);
    expect(expandPadShortAffordPulseActive("short", false)).toBe(false);

    const affordableLit = expandPadShortAffordPulseEmissiveIntensity(
      "affordable",
      true,
      false,
      1,
    );
    expect(affordableLit).toBeCloseTo(
      expandPadMeshColors("affordable", true).emissiveIntensity,
      5,
    );
    expect(expandPadShortAffordPulseEmissive("affordable", true)).toBe(
      EXPAND_PAD_AFFORD_CUE.affordableEmissive,
    );

    const shortIdle = expandPadShortAffordPulseEmissiveIntensity(
      "short",
      false,
      false,
      1,
    );
    expect(shortIdle).toBeCloseTo(
      EXPAND_PAD_AFFORD_CUE.shortEmissiveIntensity,
      5,
    );

    const walkUp = expandPadShortAffordPulseEmissiveIntensity(
      "short",
      true,
      true,
      0,
    );
    expect(walkUp).toBeGreaterThanOrEqual(
      EXPAND_PAD_SHORT_AFFORD_PULSE.emissiveWalkUpFloor,
    );

    const mid = expandPadShortAffordPulseEnvelope(
      EXPAND_PAD_SHORT_AFFORD_PULSE.periodMs / 4,
    );
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThanOrEqual(1);
  });

  it("does not change SLOT_EXPANSIONS costs or invent free expand (failure)", () => {
    expect(first.coinCost).toBe(25);
    expect(first.energyCost).toBe(ENERGY.costs.build);
    expect(first.materials).toEqual([{ itemId: "iron_bar", qty: 1 }]);

    expect(
      expandPadAffordMode({
        occupiedSlotIndexes: [],
        softCurrency: 0,
        energy: 0,
        inventoryQty: qty({}),
      }),
    ).toBe("short");
    expect(expandPadShortAffordPulseEnvelope(-1)).toBeGreaterThanOrEqual(0);
    expect(
      expandPadShortAffordPulseEmissiveIntensity("short", false, false, 3),
    ).toBeCloseTo(EXPAND_PAD_AFFORD_CUE.shortEmissiveIntensity, 5);
    expect(expandPadShortAffordPulseActive("short", false)).toBe(false);
  });
});
