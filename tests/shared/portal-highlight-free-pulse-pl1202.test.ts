import { describe, expect, it } from "vitest";
import {
  CANONICAL_LAND_KINDS,
  PORTAL_HIGHLIGHT_FREE_PULSE,
  PORTAL_WORLD_SOFT,
  portalHighlightFreePulseEmissiveIntensity,
  portalHighlightFreePulseEnvelope,
  portalHighlightFreePulseOpacity,
  portalMeshTintForLandKind,
  portalWorldLabelParts,
} from "@game/shared";

/**
 * PL120.2 — Portal highlight Free pulse (soft veil while interact-highlighted).
 * Complements Travel · free label (PL37.1) + circuit tint (PL14.2); destinations
 * unchanged; mute ok. Choice: continuous soft sine while highlighted (not
 * one-shot) so fare-free portals stay glanceable in range.
 */
describe("CityLands PL120.2 portal highlight Free pulse", () => {
  it("pulses veil opacity/emissive only while highlighted (happy)", () => {
    const peak = 1;
    expect(portalHighlightFreePulseOpacity(true, peak)).toBeCloseTo(
      PORTAL_HIGHLIGHT_FREE_PULSE.opacityPeak,
      5,
    );
    expect(
      portalHighlightFreePulseEmissiveIntensity(true, false, peak),
    ).toBeCloseTo(PORTAL_HIGHLIGHT_FREE_PULSE.emissivePeak, 5);
    expect(portalHighlightFreePulseOpacity(true, 0)).toBeCloseTo(
      PORTAL_HIGHLIGHT_FREE_PULSE.opacityBase,
      5,
    );
    expect(
      portalHighlightFreePulseEmissiveIntensity(true, false, 0),
    ).toBeCloseTo(PORTAL_HIGHLIGHT_FREE_PULSE.emissiveBase, 5);
    expect(PORTAL_HIGHLIGHT_FREE_PULSE.periodMs).toBeGreaterThan(0);
    expect(portalWorldLabelParts("city").soft).toBe(PORTAL_WORLD_SOFT);
  });

  it("keeps idle steady and walk-up brighter; envelope soft (edge)", () => {
    expect(portalHighlightFreePulseOpacity(false, 1)).toBeCloseTo(
      PORTAL_HIGHLIGHT_FREE_PULSE.opacityIdle,
      5,
    );
    expect(
      portalHighlightFreePulseEmissiveIntensity(false, false, 1),
    ).toBeCloseTo(PORTAL_HIGHLIGHT_FREE_PULSE.emissiveIdle, 5);

    const walkUpFloor = portalHighlightFreePulseEmissiveIntensity(
      true,
      true,
      0,
    );
    expect(walkUpFloor).toBeCloseTo(
      PORTAL_HIGHLIGHT_FREE_PULSE.emissiveWalkUp,
      5,
    );
    expect(walkUpFloor).toBeGreaterThan(
      PORTAL_HIGHLIGHT_FREE_PULSE.emissiveBase,
    );

    const mid = portalHighlightFreePulseEnvelope(
      PORTAL_HIGHLIGHT_FREE_PULSE.periodMs / 4,
    );
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThanOrEqual(1);
    expect(PORTAL_HIGHLIGHT_FREE_PULSE.opacityPeak).toBeGreaterThan(
      PORTAL_HIGHLIGHT_FREE_PULSE.opacityBase,
    );
  });

  it("does not invent fares or collapse map tints (failure)", () => {
    expect(portalHighlightFreePulseEnvelope(-1)).toBeGreaterThanOrEqual(0);
    expect(
      portalHighlightFreePulseEmissiveIntensity(false, false, 3),
    ).toBeCloseTo(PORTAL_HIGHLIGHT_FREE_PULSE.emissiveIdle, 5);
    expect(portalHighlightFreePulseOpacity(false, -2)).toBeCloseTo(
      PORTAL_HIGHLIGHT_FREE_PULSE.opacityIdle,
      5,
    );

    const veils = new Set(
      CANONICAL_LAND_KINDS.map(
        (k) => portalMeshTintForLandKind(k).portalVeil.toLowerCase(),
      ),
    );
    expect(veils.size).toBe(CANONICAL_LAND_KINDS.length);
    for (const kind of CANONICAL_LAND_KINDS) {
      expect(portalWorldLabelParts(kind).soft.toLowerCase()).toMatch(/free/);
      expect(portalWorldLabelParts(kind).soft.toLowerCase()).not.toMatch(
        /fare|caravan|coins/,
      );
    }
  });
});
