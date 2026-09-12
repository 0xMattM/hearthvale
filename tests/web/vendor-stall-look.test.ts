import { describe, expect, it } from "vitest";
import { vendorStallKitMaterials } from "../../packages/shared/src/world-object-materials";
import {
  vendorAwningIsCloth,
  vendorCounterIsTimber,
  vendorStallHasFilledPad,
  VENDOR_STALL_LOOK,
} from "../../apps/web/lib/vendor-stall-look";

/**
 * Vendor stall must read as a market stand (canvas + oak), not a wood tabletop roof.
 */
describe("vendor stall look", () => {
  it("uses cloth awning and timber counter (happy)", () => {
    expect(vendorAwningIsCloth()).toBe(true);
    expect(vendorCounterIsTimber()).toBe(true);
    const kit = vendorStallKitMaterials(false);
    expect(kit.awningColor.toLowerCase()).not.toBe(kit.counterColor.toLowerCase());
    expect(kit.stripeColor.toLowerCase()).not.toBe(kit.awningColor.toLowerCase());
  });

  it("keeps produce off the moss-green wood tint (edge)", () => {
    const kit = vendorStallKitMaterials(false);
    expect(kit.goodsFreshColor.toLowerCase()).not.toBe("#6fbf73");
    expect(VENDOR_STALL_LOOK.produceKind).toBe("solid");
  });

  it("does not treat the awning as timber (failure)", () => {
    expect(VENDOR_STALL_LOOK.awningKind).not.toBe("wood");
    expect(VENDOR_STALL_LOOK.counterKind).not.toBe("plaster");
    expect(vendorStallHasFilledPad()).toBe(false);
    expect(vendorAwningIsCloth()).not.toBe(false);
  });
});
