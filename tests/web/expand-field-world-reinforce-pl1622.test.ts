import { describe, expect, it } from "vitest";

import {
  EXPAND_FIELD_WORLD_REINFORCE,
  expandFieldWorldReinforceBackground,
  shouldFlashExpandFieldWorldReinforce,
} from "../../apps/web/lib/hud/expand-field-feedback";
import { STATION_UPGRADE_WORLD_REINFORCE } from "../../apps/web/lib/hud/station-upgrade-feedback";
import { CROP_HARVEST_WORLD_REINFORCE } from "../../apps/web/lib/hud/crop-harvest-feedback";
import { EXPAND_FIELD_PAD_FLASH } from "@game/shared";

/**
 * PL162.2 — Expand-field soft world reinforce leftover.
 * Brief soft rim after expand ok (complements Expanded PL20.3 + field-gold pad
 * PL137.2). Costs / slots unchanged; mute ok; fail silent.
 * Choice: one-shot field-gold rim (not another Expanded toast / pad-only) so
 * expand stays world-readable beside footprint pad.
 */
describe("CityLands PL162.2 expand-field soft world reinforce", () => {
  it("flashes quiet field-gold rim when expand succeeds (happy)", () => {
    expect(shouldFlashExpandFieldWorldReinforce(true)).toBe(true);
    expect(EXPAND_FIELD_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(EXPAND_FIELD_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = expandFieldWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(EXPAND_FIELD_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — field-gold footprint pad.
    expect(EXPAND_FIELD_PAD_FLASH.durationMs).toBeGreaterThan(0);
    expect(EXPAND_FIELD_PAD_FLASH.padColor).toMatch(/^#/);
  });

  it("stays quiet on fail; rim ≠ upgrade copper / harvest wheat (edge)", () => {
    expect(shouldFlashExpandFieldWorldReinforce(false)).toBe(false);

    expect(EXPAND_FIELD_WORLD_REINFORCE.outerRgba).not.toBe(
      STATION_UPGRADE_WORLD_REINFORCE.outerRgba,
    );
    expect(EXPAND_FIELD_WORLD_REINFORCE.midRgba).not.toBe(
      STATION_UPGRADE_WORLD_REINFORCE.midRgba,
    );
    expect(EXPAND_FIELD_WORLD_REINFORCE.outerRgba).not.toBe(
      CROP_HARVEST_WORLD_REINFORCE.outerRgba,
    );
    expect(EXPAND_FIELD_WORLD_REINFORCE.midRgba).not.toBe(
      CROP_HARVEST_WORLD_REINFORCE.midRgba,
    );
    expect(EXPAND_FIELD_WORLD_REINFORCE.clearPct).toBeLessThan(
      EXPAND_FIELD_WORLD_REINFORCE.midPct,
    );
    expect(EXPAND_FIELD_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent costs / slots / NFT combat; keeps ok gate (failure)", () => {
    expect(expandFieldWorldReinforceBackground()).not.toMatch(
      /slot\s*change|always.?on|nft/i,
    );
    expect(String(EXPAND_FIELD_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(EXPAND_FIELD_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashExpandFieldWorldReinforce(true)).not.toBe(
      shouldFlashExpandFieldWorldReinforce(false),
    );
  });
});
