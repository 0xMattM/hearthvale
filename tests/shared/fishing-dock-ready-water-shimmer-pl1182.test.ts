import { describe, expect, it } from "vitest";
import {
  FISHING_DOCK,
  FISHING_DOCK_READY_WATER_SHIMMER,
  GATHER_READY_WORLD_SOFT,
  fishingDockReadyShimmerEnvelope,
  fishingDockReadyWaterEmissiveIntensity,
  fishingDockReadyWaterShimmer,
  gatherStationReadyWorldLabelParts,
} from "@game/shared";

/**
 * PL118.2 — Fishing-dock ready water shimmer.
 * Choice: soft sine water emissive + pad while catch-ready (complements PL30.1
 * Ready label + PL65.2 edge cue); cooling quiet; cooldown / catch rates unchanged.
 */
describe("CityLands PL118.2 fishing-dock ready water shimmer", () => {
  it("shimmers water while catch-ready (happy)", () => {
    const ready = fishingDockReadyWaterShimmer(true);
    expect(ready.show).toBe(true);
    expect(ready.padOpacity).toBeGreaterThan(0);
    expect(ready.intensity).toBeGreaterThan(0);
    expect(ready.waterEmissive.toLowerCase()).toBe(
      FISHING_DOCK_READY_WATER_SHIMMER.waterEmissive.toLowerCase(),
    );
    expect(ready.padColor.toLowerCase()).toBe(
      FISHING_DOCK_READY_WATER_SHIMMER.padColor.toLowerCase(),
    );

    expect(FISHING_DOCK_READY_WATER_SHIMMER.shimmerPeriodMs).toBeGreaterThan(0);
    expect(FISHING_DOCK_READY_WATER_SHIMMER.intensityPeak).toBeGreaterThan(
      FISHING_DOCK_READY_WATER_SHIMMER.intensityBase,
    );

    const low = fishingDockReadyShimmerEnvelope(0);
    const mid = fishingDockReadyShimmerEnvelope(
      FISHING_DOCK_READY_WATER_SHIMMER.shimmerPeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThanOrEqual(1);
    expect(mid).toBeGreaterThan(low);

    const peak = fishingDockReadyWaterEmissiveIntensity(true, 1);
    const floor = fishingDockReadyWaterEmissiveIntensity(true, 0);
    expect(peak).toBe(FISHING_DOCK_READY_WATER_SHIMMER.intensityPeak);
    expect(floor).toBe(FISHING_DOCK_READY_WATER_SHIMMER.intensityBase);
    expect(peak).toBeGreaterThan(floor);
  });

  it("stays quiet while cooling; Ready label unchanged (edge)", () => {
    const cooling = fishingDockReadyWaterShimmer(false);
    expect(cooling.show).toBe(false);
    expect(cooling.padOpacity).toBe(0);
    expect(cooling.intensity).toBe(0);
    expect(fishingDockReadyWaterEmissiveIntensity(false, 1)).toBe(0);
    expect(fishingDockReadyWaterEmissiveIntensity(false, 0.5)).toBe(0);

    const parts = gatherStationReadyWorldLabelParts("fishing_dock");
    expect(parts.soft).toBe(GATHER_READY_WORLD_SOFT);
    expect(parts.name.toLowerCase()).toMatch(/fish/);
  });

  it("keeps catch rates / cooldown; clamps envelope (failure)", () => {
    expect(FISHING_DOCK.cooldownMs).toBe(60_000);
    expect(FISHING_DOCK.yieldQty).toBe(1);
    expect(FISHING_DOCK.yieldItemId).toBe("fish");
    expect(FISHING_DOCK.xp).toBe(5);
    expect(fishingDockReadyWaterEmissiveIntensity(true, 2)).toBe(
      FISHING_DOCK_READY_WATER_SHIMMER.intensityPeak,
    );
    expect(fishingDockReadyWaterEmissiveIntensity(true, -1)).toBe(
      FISHING_DOCK_READY_WATER_SHIMMER.intensityBase,
    );
    expect(fishingDockReadyShimmerEnvelope(Number.NaN)).toBe(0);
  });
});
