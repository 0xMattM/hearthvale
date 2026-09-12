import { describe, expect, it } from "vitest";
import {
  CITY_SCARCE_BUSY_PEER_PULSE,
  CITY_SCARCE_FREE_SETTLE_FLASH,
  CITY_SCARCE_STATION_BUSY_CUE,
  CITY_SCARCE_STATION_FREE_PROMPT_TAG,
  cityScarceFreeSettleEmissiveIntensity,
  cityScarceFreeSettleFlashEnvelope,
  cityScarceFreeSettlePadOpacity,
  shouldFlashScarceFreeSettleEdge,
  shouldPulseScarceBusyPeerEdge,
} from "@game/shared";

/**
 * PL119.1 — City scarce Free settle flash (brief busy→free pad dim).
 * Complements free→busy peer pulse (PL115.1) + sticky Free/Busy (PL8); contention
 * unchanged; mute ok. Choice: edge-only dim+emissive over continuous loop.
 */
describe("CityLands PL119.1 city scarce Free settle flash", () => {
  it("flashes only on busy→free and dims below free baseline (happy)", () => {
    expect(shouldFlashScarceFreeSettleEdge(true, false)).toBe(true);
    expect(CITY_SCARCE_FREE_SETTLE_FLASH.durationMs).toBeGreaterThan(0);
    expect(CITY_SCARCE_FREE_SETTLE_FLASH.padOpacityBase).toBeGreaterThan(
      CITY_SCARCE_FREE_SETTLE_FLASH.padOpacityDim,
    );
    expect(CITY_SCARCE_FREE_SETTLE_FLASH.intensityPeak).toBeGreaterThan(0);

    const peak = cityScarceFreeSettleFlashEnvelope(0);
    expect(peak).toBeCloseTo(1, 5);
    expect(cityScarceFreeSettlePadOpacity(peak)).toBeCloseTo(
      CITY_SCARCE_FREE_SETTLE_FLASH.padOpacityDim,
      5,
    );
    expect(cityScarceFreeSettleEmissiveIntensity(peak)).toBeCloseTo(
      CITY_SCARCE_FREE_SETTLE_FLASH.intensityPeak,
      5,
    );
    expect(cityScarceFreeSettlePadOpacity(0)).toBeCloseTo(
      CITY_SCARCE_FREE_SETTLE_FLASH.padOpacityBase,
      5,
    );
    expect(CITY_SCARCE_STATION_FREE_PROMPT_TAG).toBe("Free");
  });

  it("stays quiet for sticky free, busy idle, and free→busy (edge)", () => {
    expect(shouldFlashScarceFreeSettleEdge(false, false)).toBe(false);
    expect(shouldFlashScarceFreeSettleEdge(true, true)).toBe(false);
    expect(shouldFlashScarceFreeSettleEdge(false, true)).toBe(false);
    // Busy peer pulse still owns free→busy; settle owns the inverse edge.
    expect(shouldPulseScarceBusyPeerEdge(false, true)).toBe(true);
    expect(shouldPulseScarceBusyPeerEdge(true, false)).toBe(false);

    expect(cityScarceFreeSettleEmissiveIntensity(0)).toBe(0);
    expect(CITY_SCARCE_STATION_BUSY_CUE.worldLabel).toBe("Busy");
    expect(CITY_SCARCE_FREE_SETTLE_FLASH.padOpacityBase).toBeCloseTo(0.55, 5);
    expect(CITY_SCARCE_BUSY_PEER_PULSE.durationMs).toBeGreaterThan(0);
  });

  it("rejects envelope outside the flash window and clamps (failure)", () => {
    const { durationMs, intensityPeak, padOpacityBase, padOpacityDim } =
      CITY_SCARCE_FREE_SETTLE_FLASH;
    expect(cityScarceFreeSettleFlashEnvelope(-1)).toBe(0);
    expect(cityScarceFreeSettleFlashEnvelope(durationMs)).toBe(0);
    expect(cityScarceFreeSettleFlashEnvelope(durationMs + 40)).toBe(0);
    expect(cityScarceFreeSettleFlashEnvelope(durationMs / 2)).toBeGreaterThan(0);
    expect(cityScarceFreeSettleFlashEnvelope(durationMs / 2)).toBeLessThan(1);

    expect(cityScarceFreeSettleEmissiveIntensity(-2)).toBe(0);
    expect(cityScarceFreeSettleEmissiveIntensity(3)).toBeCloseTo(
      intensityPeak,
      5,
    );
    expect(cityScarceFreeSettlePadOpacity(3)).toBeCloseTo(padOpacityDim, 5);
    expect(cityScarceFreeSettlePadOpacity(-1)).toBeCloseTo(padOpacityBase, 5);
    expect(padOpacityDim).not.toBe(padOpacityBase);
  });
});
