import { describe, expect, it } from "vitest";
import { PROCESS_STATION_WORKING_EMISSIVE } from "@game/shared";
import { processKitBodyEmissive } from "../../apps/web/lib/process-kit-shared";

/**
 * Shared kit emissive helper used by redesigned process-station meshes.
 */
describe("process kit body emissive", () => {
  it("uses walk-up tint while the first-visit tip is showing (happy)", () => {
    const body = processKitBodyEmissive(true, false, 0, "#c4a35a", 0.22);
    expect(body.emissive).toBe("#c4a35a");
    expect(body.intensity).toBe(0.22);
  });

  it("stays matte when idle (edge)", () => {
    const body = processKitBodyEmissive(false, false, 0, "#c4a35a");
    expect(body.emissive).toBe("#000000");
    expect(body.intensity).toBe(0);
  });

  it("does not invent a new working color (failure)", () => {
    const body = processKitBodyEmissive(false, true, 0, "#c4a35a");
    expect(body.emissive).toBe(PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive);
    expect(body.intensity).toBeGreaterThan(0);
    expect(body.emissive).not.toBe("#00ff00");
  });
});
