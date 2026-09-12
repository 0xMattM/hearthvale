import { describe, expect, it } from "vitest";
import {
  CITY_SCARCE_BUSY_PEER_PULSE,
  CITY_SCARCE_STATION_BUSY_CUE,
  cityScarceBusyHaloEmissiveIntensity,
  cityScarceBusyHaloOpacity,
  cityScarceBusyPadOpacity,
  cityScarceBusyPeerPulseEnvelope,
  shouldPulseScarceBusyPeerEdge,
} from "@game/shared";

/**
 * PL115.1 — City scarce-busy peer pulse (brief free→busy pad/halo).
 * Complements sticky Busy world cue (PL8.1); contention rules unchanged; mute ok.
 * Choice: edge-only envelope over continuous loop so sticky Busy stays the steady read.
 */
describe("CityLands PL115.1 city scarce-busy peer pulse", () => {
  it("pulses only on free→busy and peaks above sticky baseline (happy)", () => {
    expect(shouldPulseScarceBusyPeerEdge(false, true)).toBe(true);
    expect(CITY_SCARCE_BUSY_PEER_PULSE.durationMs).toBeGreaterThan(0);
    expect(CITY_SCARCE_BUSY_PEER_PULSE.intensityPeak).toBeGreaterThan(
      CITY_SCARCE_BUSY_PEER_PULSE.intensityBase,
    );
    expect(CITY_SCARCE_BUSY_PEER_PULSE.intensityBase).toBeCloseTo(0.55, 5);

    const peak = cityScarceBusyPeerPulseEnvelope(0);
    expect(peak).toBeCloseTo(1, 5);
    expect(cityScarceBusyHaloEmissiveIntensity(peak)).toBeCloseTo(
      CITY_SCARCE_BUSY_PEER_PULSE.intensityPeak,
      5,
    );
    expect(cityScarceBusyPadOpacity(peak)).toBeCloseTo(
      CITY_SCARCE_BUSY_PEER_PULSE.padOpacityPeak,
      5,
    );
    expect(cityScarceBusyHaloOpacity(peak)).toBeCloseTo(
      CITY_SCARCE_BUSY_PEER_PULSE.haloOpacityPeak,
      5,
    );
    expect(CITY_SCARCE_STATION_BUSY_CUE.worldLabel).toBe("Busy");
  });

  it("stays quiet for sticky busy, free idle, and busy→free (edge)", () => {
    expect(shouldPulseScarceBusyPeerEdge(true, true)).toBe(false);
    expect(shouldPulseScarceBusyPeerEdge(false, false)).toBe(false);
    expect(shouldPulseScarceBusyPeerEdge(true, false)).toBe(false);

    const sticky = cityScarceBusyHaloEmissiveIntensity(0);
    expect(sticky).toBeCloseTo(CITY_SCARCE_BUSY_PEER_PULSE.intensityBase, 5);
    expect(cityScarceBusyPadOpacity(0)).toBeCloseTo(
      CITY_SCARCE_BUSY_PEER_PULSE.padOpacityBase,
      5,
    );
    expect(cityScarceBusyHaloOpacity(0)).toBeCloseTo(
      CITY_SCARCE_BUSY_PEER_PULSE.haloOpacityBase,
      5,
    );
  });

  it("rejects envelope outside the pulse window and clamps intensity (failure)", () => {
    const { durationMs, intensityBase, intensityPeak } =
      CITY_SCARCE_BUSY_PEER_PULSE;
    expect(cityScarceBusyPeerPulseEnvelope(-1)).toBe(0);
    expect(cityScarceBusyPeerPulseEnvelope(durationMs)).toBe(0);
    expect(cityScarceBusyPeerPulseEnvelope(durationMs + 40)).toBe(0);
    expect(cityScarceBusyPeerPulseEnvelope(durationMs / 2)).toBeGreaterThan(0);
    expect(cityScarceBusyPeerPulseEnvelope(durationMs / 2)).toBeLessThan(1);

    expect(cityScarceBusyHaloEmissiveIntensity(-2)).toBeCloseTo(intensityBase, 5);
    expect(cityScarceBusyHaloEmissiveIntensity(3)).toBeCloseTo(intensityPeak, 5);
    expect(intensityPeak).not.toBe(intensityBase);
  });
});
