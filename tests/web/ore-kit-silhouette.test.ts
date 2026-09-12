import { describe, expect, it } from "vitest";
import {
  ORE_KIT_SILHOUETTE,
  oreKitHasCircularUnderstone,
} from "../../apps/web/lib/ore-kit-silhouette";

/**
 * Ore rocks sit in the grass — the VA1.1 podium disc made them look plated.
 */
describe("ore kit silhouette", () => {
  it("plants the boulder on rubble, not a disc (happy)", () => {
    expect(ORE_KIT_SILHOUETTE.groundContact).toBe("rubble");
    expect(oreKitHasCircularUnderstone()).toBe(false);
  });

  it("keeps ground contact as a named style (edge)", () => {
    expect(ORE_KIT_SILHOUETTE.groundContact.length).toBeGreaterThan(0);
    expect(typeof ORE_KIT_SILHOUETTE.hasCircularUnderstone).toBe("boolean");
  });

  it("does not restore the circular understone podium (failure)", () => {
    expect(ORE_KIT_SILHOUETTE.hasCircularUnderstone).not.toBe(true);
    expect(oreKitHasCircularUnderstone()).not.toBe(true);
    expect(ORE_KIT_SILHOUETTE.groundContact).not.toBe("disc");
  });
});
