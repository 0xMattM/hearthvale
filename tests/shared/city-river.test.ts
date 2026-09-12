import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_RIVER,
  CITY_RIVER_FISHER_NPC,
  CITY_RIVER_FISHING_DOCK,
  WORLD,
  cityFishingSpotWorldName,
  cityRiverBankUvRepeat,
  cityRiverFoamOpacity,
  cityRiverFoamUvOffset,
  cityRiverLayout,
  cityRiverLoopedX,
  cityRiverFlowUvOffset,
  cityRiverFlowUvOffsetV,
  cityRiverWaveHeight,
  cityRiverWaveTaper,
  cityRiverWrapX,
  clampWalkOutOfCityRiver,
  gatherStationReadyWorldLabelParts,
  isCityRiverWaterWorldZ,
} from "@game/shared";

/**
 * City +Z river + riverside fishing spot (not a grass pier).
 */
describe("city river fishing bank", () => {
  it("places the fisher and fishing spot on the camera-near bank (happy)", () => {
    const dock = CITY_BUILDINGS.find((b) => b.type === "fishing_dock");
    const fisher = CITY_BUILDINGS.find((b) => b.tutorialNpcId === "fisher");
    expect(dock).toMatchObject(CITY_RIVER_FISHING_DOCK);
    expect(fisher).toMatchObject(CITY_RIVER_FISHER_NPC);

    const dockWorldZ = (dock?.z ?? 0) * WORLD.GRID;
    const fisherWorldZ = (fisher?.z ?? 0) * WORLD.GRID;
    expect(dockWorldZ).toBeLessThanOrEqual(CITY_RIVER.walkMaxZ);
    expect(fisherWorldZ).toBeLessThanOrEqual(CITY_RIVER.walkMaxZ);
    expect(dockWorldZ).toBeGreaterThan(CITY_RIVER.bankCenterZ - 2);
    expect(
      Math.hypot(
        ((dock?.x ?? 0) - (fisher?.x ?? 0)) * WORLD.GRID,
        dockWorldZ - fisherWorldZ,
      ),
    ).toBeLessThan(5.5);
    expect(cityRiverLayout()).toBe(CITY_RIVER);
    expect(gatherStationReadyWorldLabelParts("fishing_dock", "city").name).toBe(
      cityFishingSpotWorldName(),
    );
    const bankMaxZ = CITY_RIVER.bankCenterZ + CITY_RIVER.bankDepth / 2;
    const waterMinZ = CITY_RIVER.centerZ - CITY_RIVER.depth / 2;
    expect(bankMaxZ).toBeGreaterThanOrEqual(waterMinZ);
    expect(waterMinZ).toBeGreaterThanOrEqual(bankMaxZ - 0.2);
  });

  it("blocks walking into the water but leaves the bank open (edge)", () => {
    expect(isCityRiverWaterWorldZ(CITY_RIVER.walkMaxZ + 0.2)).toBe(true);
    expect(isCityRiverWaterWorldZ(CITY_RIVER.walkMaxZ)).toBe(false);
    expect(clampWalkOutOfCityRiver(0, 30, "city").z).toBe(CITY_RIVER.walkMaxZ);
    expect(clampWalkOutOfCityRiver(4, 20, "city")).toEqual({ x: 4, z: 20 });
    expect(clampWalkOutOfCityRiver(0, 30, "player_land")).toEqual({
      x: 0,
      z: 30,
    });
  });

  it("does not rename land docks or invent a second city dock (failure)", () => {
    expect(gatherStationReadyWorldLabelParts("fishing_dock").name).toBe(
      "Fishing Dock",
    );
    expect(gatherStationReadyWorldLabelParts("fishing_dock", "player_land").name).toBe(
      "Fishing Dock",
    );
    expect(
      CITY_BUILDINGS.filter((b) => b.type === "fishing_dock"),
    ).toHaveLength(1);
    expect(cityFishingSpotWorldName().toLowerCase()).not.toBe("fishing dock");
    expect(isCityRiverWaterWorldZ(Number.NaN)).toBe(false);
    expect(clampWalkOutOfCityRiver(1, 40, "not_a_map").z).toBe(40);
  });
});

/**
 * Traveling current math — waves + looping streaks along +X.
 */
describe("city river flow", () => {
  it("scrolls water UV and lifts waves over time (happy)", () => {
    const a = cityRiverFlowUvOffset(0);
    const b = cityRiverFlowUvOffset(4000);
    expect(b).not.toBe(a);
    expect(cityRiverFlowUvOffsetV(3500)).not.toBe(cityRiverFlowUvOffsetV(0));
    expect(cityRiverFoamUvOffset(2000)).not.toBe(cityRiverFoamUvOffset(0));
    expect(CITY_RIVER.flowUvPerSec).toBeGreaterThanOrEqual(0.15);
    expect(CITY_RIVER.waveSegsX).toBeGreaterThanOrEqual(24);
    expect(cityRiverLoopedX(0, CITY_RIVER.highlightCount, 800, CITY_RIVER.flowSpeed)).not.toBe(
      cityRiverLoopedX(0, CITY_RIVER.highlightCount, 0, CITY_RIVER.flowSpeed),
    );
    expect(cityRiverWaveHeight(0, 0, 0)).not.toBe(
      cityRiverWaveHeight(0, 0, 900),
    );
    expect(cityRiverFoamOpacity(0)).not.toBe(
      cityRiverFoamOpacity(CITY_RIVER.shimmerPeriodMs / 4),
    );
  });

  it("tiles bank dirt to the plane aspect and tapers bank-side waves (edge)", () => {
    const [u, v] = cityRiverBankUvRepeat();
    expect(u / v).toBeCloseTo(
      CITY_RIVER.bankWidth / CITY_RIVER.bankDepth,
      5,
    );
    expect(u).toBeGreaterThan(v * 8);
    expect(cityRiverWaveTaper(0)).toBe(1);
    expect(cityRiverWaveTaper(CITY_RIVER.depth / 2)).toBe(0);
    expect(cityRiverFlowUvOffset(0)).toBeGreaterThanOrEqual(0);
    expect(cityRiverFlowUvOffset(12_000)).toBeLessThan(1);
    const half = CITY_RIVER.width / 2;
    expect(cityRiverWrapX(half + 3)).toBeCloseTo(-half + 3, 5);
    expect(cityRiverWrapX(-half - 2)).toBeCloseTo(half - 2, 5);
    const x = cityRiverLoopedX(0, 3, 60_000, CITY_RIVER.flowSpeed);
    expect(x).toBeGreaterThanOrEqual(-half);
    expect(x).toBeLessThan(half);
  });

  it("stays still when clocks or counts are invalid (failure)", () => {
    expect(cityRiverFlowUvOffset(Number.NaN)).toBe(0);
    expect(cityRiverFlowUvOffsetV(Number.NaN)).toBe(0);
    expect(cityRiverFoamUvOffset(Number.NaN)).toBe(0);
    expect(cityRiverWaveTaper(Number.NaN)).toBe(0);
    expect(cityRiverFoamOpacity(Number.NaN)).toBe(CITY_RIVER.foamOpacityMin);
    expect(cityRiverWrapX(Number.NaN)).toBe(0);
    expect(cityRiverLoopedX(0, 0, 1000, CITY_RIVER.flowSpeed)).toBe(0);
    expect(cityRiverLoopedX(0, 3, Number.NaN, CITY_RIVER.flowSpeed)).toBe(0);
    expect(cityRiverWaveHeight(Number.NaN, 0, 100)).toBe(0);
    expect(cityRiverWaveHeight(0, 0, Number.NaN)).toBe(0);
  });
});
