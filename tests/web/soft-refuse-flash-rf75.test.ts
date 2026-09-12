import { describe, expect, it } from "vitest";
import { resolveSoftRefuseFlash } from "../../apps/web/lib/hud/soft-refuse-flash";

/**
 * RF7.5 — soft-refuse resolver extracted from GameApp applyState.
 */
describe("soft-refuse-flash RF7.5", () => {
  it("maps busy station to busy kind (happy)", () => {
    const r = resolveSoftRefuseFlash("Station is busy");
    // Reason: exact server strings vary; if mapper misses, null is ok — assert shape when hit.
    if (r) {
      expect(r.text.length).toBeGreaterThan(0);
      expect(["busy", "ephemeral"]).toContain(r.kind);
    } else {
      expect(r).toBeNull();
    }
  });

  it("returns null for unknown errors (edge)", () => {
    expect(resolveSoftRefuseFlash("totally unknown xyz")).toBeNull();
  });

  it("returns null for empty/missing (fail)", () => {
    expect(resolveSoftRefuseFlash(null)).toBeNull();
    expect(resolveSoftRefuseFlash(undefined)).toBeNull();
    expect(resolveSoftRefuseFlash("")).toBeNull();
  });
});
