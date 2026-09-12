import { describe, expect, it } from "vitest";
import {
  CANONICAL_LAND_KINDS,
  PORTAL_FREE_TRAVEL_SOFT_PULSE,
  PORTAL_HIGHLIGHT_FREE_PULSE,
  PORTAL_WORLD_SOFT,
  portalFreeTravelSoftPulseActive,
  portalFreeTravelSoftPulseEmissive,
  portalFreeTravelSoftPulseEmissiveIntensity,
  portalFreeTravelSoftPulseEnvelope,
  portalHighlightFreePulseEnvelope,
  portalMeshTintForLandKind,
  portalWorldLabelParts,
} from "@game/shared";

/**
 * PL144.1 — Portal free-travel soft pulse leftover.
 * Quiet cooler threshold emissive sine while interact-highlighted
 * (complements veil Free pulse PL120.2 + Travel · free soft PL37.1 + tip PL42.2).
 * Fare-free / destinations unchanged; mute ok.
 * Choice: continuous cooler cyan underfoot (not another veil intensity bump)
 * so Free reads across warm Arena map tints beside the existing veil pulse.
 */
describe("CityLands PL144.1 portal free-travel soft pulse leftover", () => {
  it("pulses cooler threshold emissive only while highlighted (happy)", () => {
    expect(portalFreeTravelSoftPulseActive(true)).toBe(true);
    expect(portalFreeTravelSoftPulseEmissive(true)).toBe(
      PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive,
    );
    expect(
      portalFreeTravelSoftPulseEmissiveIntensity(true, 1),
    ).toBeCloseTo(PORTAL_FREE_TRAVEL_SOFT_PULSE.emissivePeak, 5);
    expect(
      portalFreeTravelSoftPulseEmissiveIntensity(true, 0),
    ).toBeCloseTo(PORTAL_FREE_TRAVEL_SOFT_PULSE.emissiveBase, 5);
    expect(PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive).toMatch(/^#/);
    expect(PORTAL_FREE_TRAVEL_SOFT_PULSE.periodMs).toBe(
      PORTAL_HIGHLIGHT_FREE_PULSE.periodMs,
    );
    expect(portalWorldLabelParts("city").soft).toBe(PORTAL_WORLD_SOFT);
  });

  it("keeps idle dark and stays phase-locked with veil pulse (edge)", () => {
    expect(portalFreeTravelSoftPulseActive(false)).toBe(false);
    expect(portalFreeTravelSoftPulseEmissive(false)).toBe("#000000");
    expect(
      portalFreeTravelSoftPulseEmissiveIntensity(false, 1),
    ).toBeCloseTo(PORTAL_FREE_TRAVEL_SOFT_PULSE.emissiveIdle, 5);

    const mid = portalFreeTravelSoftPulseEnvelope(
      PORTAL_FREE_TRAVEL_SOFT_PULSE.periodMs / 4,
    );
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThanOrEqual(1);
    expect(mid).toBeCloseTo(
      portalHighlightFreePulseEnvelope(
        PORTAL_HIGHLIGHT_FREE_PULSE.periodMs / 4,
      ),
      5,
    );
    expect(PORTAL_FREE_TRAVEL_SOFT_PULSE.emissivePeak).toBeGreaterThan(
      PORTAL_FREE_TRAVEL_SOFT_PULSE.emissiveBase,
    );
    // Cooler leftover stays quieter than the veil Free peak.
    expect(PORTAL_FREE_TRAVEL_SOFT_PULSE.emissivePeak).toBeLessThan(
      PORTAL_HIGHLIGHT_FREE_PULSE.emissivePeak,
    );
  });

  it("does not invent fares or collapse map veil tints (failure)", () => {
    expect(portalFreeTravelSoftPulseEnvelope(-1)).toBeGreaterThanOrEqual(0);
    expect(
      portalFreeTravelSoftPulseEmissiveIntensity(false, 3),
    ).toBeCloseTo(PORTAL_FREE_TRAVEL_SOFT_PULSE.emissiveIdle, 5);
    expect(portalFreeTravelSoftPulseActive(null as never)).toBe(false);

    const veils = new Set(
      CANONICAL_LAND_KINDS.map(
        (k) => portalMeshTintForLandKind(k).portalVeil.toLowerCase(),
      ),
    );
    expect(veils.size).toBe(CANONICAL_LAND_KINDS.length);
    // Cooler cyan ≠ Arena warm veil — Free leftover stays distinct underfoot.
    expect(PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive.toLowerCase()).not.toBe(
      portalMeshTintForLandKind("warrior").portalEmissive.toLowerCase(),
    );
    for (const kind of CANONICAL_LAND_KINDS) {
      expect(portalWorldLabelParts(kind).soft.toLowerCase()).toMatch(/free/);
      expect(portalWorldLabelParts(kind).soft.toLowerCase()).not.toMatch(
        /fare|caravan|coins/,
      );
    }
  });
});
