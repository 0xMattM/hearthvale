import { describe, expect, it } from "vitest";
import {
  BUILD_PLACE_SPAWN_FLASH,
  EXPAND_FIELD_PAD_FLASH,
  SLOT_EXPANSIONS,
  STATION_UPGRADE_PAD_FLASH,
  expandFieldPadFlashEmissiveIntensity,
  expandFieldPadFlashEnvelope,
  expandFieldPadFlashOpacity,
  nextSlotExpansion,
  shouldFlashExpandFieldPad,
  shouldShowExpandFieldPadFlash,
} from "@game/shared";
import { expandFieldSuccessCueText } from "../../apps/web/lib/hud/success-cue";

/**
 * PL137.2 — Expand-field soft pad flash.
 * Choice: brief field-gold pad on the unlocked footprint after Expanded
 * (not another Expanded toast) so expand stays world-readable beside SFX/cue;
 * costs / slots unchanged; mute ok.
 */
describe("CityLands PL137.2 expand-field soft pad flash", () => {
  it("flashes field-gold settle on expand ok at footprint (happy)", () => {
    expect(shouldFlashExpandFieldPad(true)).toBe(true);
    expect(EXPAND_FIELD_PAD_FLASH.durationMs).toBeGreaterThan(0);
    expect(EXPAND_FIELD_PAD_FLASH.intensityPeak).toBeGreaterThan(0);
    expect(EXPAND_FIELD_PAD_FLASH.opacityPeak).toBeGreaterThan(0);

    const next = nextSlotExpansion([]);
    expect(next).toBeDefined();
    expect(shouldShowExpandFieldPadFlash(next!.x, next!.z)).toBe(true);
    expect(expandFieldPadFlashEnvelope(0)).toBeCloseTo(1, 5);
    expect(expandFieldPadFlashOpacity(1)).toBeCloseTo(
      EXPAND_FIELD_PAD_FLASH.opacityPeak,
      5,
    );
    expect(expandFieldPadFlashEmissiveIntensity(1)).toBeCloseTo(
      EXPAND_FIELD_PAD_FLASH.intensityPeak,
      5,
    );

    // Complements — does not replace — Expanded ephemeral.
    expect(expandFieldSuccessCueText()).toBe("Expanded");
  });

  it("stays quiet on fail / null coords; pad ≠ upgrade copper or spawn amber (edge)", () => {
    expect(shouldFlashExpandFieldPad(false)).toBe(false);
    expect(shouldShowExpandFieldPadFlash(null, 0)).toBe(false);
    expect(shouldShowExpandFieldPadFlash(0, null)).toBe(false);
    expect(shouldShowExpandFieldPadFlash(Number.NaN, 1)).toBe(false);

    expect(EXPAND_FIELD_PAD_FLASH.padColor.toLowerCase()).not.toBe(
      STATION_UPGRADE_PAD_FLASH.padColor.toLowerCase(),
    );
    expect(EXPAND_FIELD_PAD_FLASH.padColor.toLowerCase()).not.toBe(
      BUILD_PLACE_SPAWN_FLASH.padColor.toLowerCase(),
    );
    expect(
      expandFieldPadFlashEnvelope(EXPAND_FIELD_PAD_FLASH.durationMs),
    ).toBe(0);
    expect(EXPAND_FIELD_PAD_FLASH.durationMs).toBeLessThan(2000);
  });

  it("keeps expand costs / slots; clamps envelope (failure)", () => {
    expect(SLOT_EXPANSIONS.length).toBeGreaterThan(0);
    expect(SLOT_EXPANSIONS[0]!.coinCost).toBeGreaterThan(0);
    expect(SLOT_EXPANSIONS[0]!.type).toBe("crop_plot");

    expect(expandFieldPadFlashEnvelope(-1)).toBe(0);
    expect(expandFieldPadFlashEnvelope(Number.NaN)).toBe(0);
    expect(expandFieldPadFlashOpacity(2)).toBeCloseTo(
      EXPAND_FIELD_PAD_FLASH.opacityPeak,
      5,
    );
    expect(expandFieldPadFlashEmissiveIntensity(-1)).toBe(0);
    expect(shouldFlashExpandFieldPad(true)).not.toBe(
      shouldFlashExpandFieldPad(false),
    );
  });
});
