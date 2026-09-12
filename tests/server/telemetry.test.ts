import { describe, expect, it, beforeEach } from "vitest";

const {
  track,
  getTelemetryCounts,
  getTelemetrySnapshot,
  resetTelemetryCounts,
  telemetryHttpPayload,
} = await import("../../apps/server/src/telemetry.ts");

describe("telemetry stubs P2.2", () => {
  beforeEach(() => {
    resetTelemetryCounts();
  });

  it("counts plant and harvest events", () => {
    track("plant");
    track("plant");
    track("harvest");
    expect(getTelemetryCounts()).toEqual({ plant: 2, harvest: 1 });
  });

  it("tracks trade and vendor counters independently", () => {
    track("trade_offer");
    track("vendor_buy", { itemId: "wheat_seed" });
    expect(getTelemetryCounts().trade_offer).toBe(1);
    expect(getTelemetryCounts().vendor_buy).toBe(1);
  });

  it("accepts later gameplay events added after the stub union (edge)", () => {
    track("craft_collect");
    track("land_place_kit");
    track("claim_node");
    expect(getTelemetryCounts().craft_collect).toBe(1);
    expect(getTelemetryCounts().land_place_kit).toBe(1);
    expect(getTelemetryCounts().claim_node).toBe(1);
  });

  it("starts empty after reset (failure)", () => {
    track("craft_collect");
    track("mail_send");
    resetTelemetryCounts();
    expect(getTelemetryCounts()).toEqual({});
  });

  it("exposes vendor prices and uptime in snapshot", () => {
    track("trade_accept");
    const snap = getTelemetrySnapshot();
    expect(snap.uptimeMs).toBeGreaterThanOrEqual(0);
    expect(snap.vendorPrices.buy.wheat_seed).toBe(8);
    expect(snap.tradeVolume).toBeGreaterThanOrEqual(1);
  });

  it("hides counters from anonymous HTTP payloads (HACK-3)", () => {
    track("plant");
    expect(telemetryHttpPayload(false)).toEqual({ ok: true });
    expect(telemetryHttpPayload(true).counts.plant).toBe(1);
  });
});
