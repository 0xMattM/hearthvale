import { describe, expect, it } from "vitest";
import {
  VENDOR_STALL_KIT_SCALE,
  VENDOR_STALL_LABEL_Y,
  vendorStallIsEnlarged,
} from "../../apps/web/lib/vendor-kit-scale";

/**
 * Vendor stall should read a bit larger than the original counter kit.
 */
describe("vendor stall kit scale", () => {
  it("enlarges the stall without matching mill landmark scale (happy)", () => {
    expect(vendorStallIsEnlarged()).toBe(true);
    expect(VENDOR_STALL_KIT_SCALE).toBeGreaterThan(1);
    expect(VENDOR_STALL_LABEL_Y).toBeGreaterThan(2.25);
  });

  it("stays a modest bump, not a plaza landmark (edge)", () => {
    expect(VENDOR_STALL_KIT_SCALE).toBeLessThan(1.6);
    expect(VENDOR_STALL_KIT_SCALE).toBeGreaterThanOrEqual(1.2);
  });

  it("does not shrink back to the original 1.0 kit (failure)", () => {
    expect(VENDOR_STALL_KIT_SCALE).not.toBe(1);
    expect(vendorStallIsEnlarged()).not.toBe(false);
  });
});
