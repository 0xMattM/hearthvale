import { describe, expect, it } from "vitest";
import { SUCCESS_CUE_MS } from "../../apps/web/lib/hud/success-cue";

/**
 * RF7.4 — ephemeral success cue timing SoT used by useSuccessCue.
 */
describe("success-cue RF7.4", () => {
  it("exports a positive clear duration (happy)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
  });

  it("stays short for TopBar ephemerals (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(3_000);
  });

  it("rejects inventing zero-duration flash (fail)", () => {
    expect(SUCCESS_CUE_MS).not.toBe(0);
  });
});
