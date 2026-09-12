import { describe, expect, it } from "vitest";
import {
  MILL_KIT_SURFACES,
  millKitBodyIsClay,
  millKitSailIsWood,
  type MillKitSurfacePart,
} from "../../apps/web/lib/mill-kit-surfaces";

const BODY: Array<Extract<MillKitSurfacePart, "tower" | "base" | "roof">> = [
  "tower",
  "base",
  "roof",
];

/**
 * Mill tower stays clay; only the vanes are wooden boards.
 */
describe("mill kit sail wood", () => {
  it("keeps a clay tower and wooden vanes (happy)", () => {
    expect(MILL_KIT_SURFACES.tower.kind).toBe("plaster");
    expect(MILL_KIT_SURFACES.base.kind).toBe("stone");
    expect(MILL_KIT_SURFACES.roof.kind).toBe("roof");
    expect(MILL_KIT_SURFACES.sails.kind).toBe("wood");
    expect(millKitSailIsWood("sails")).toBe(true);
    for (const part of BODY) {
      expect(millKitBodyIsClay(part)).toBe(true);
    }
  });

  it("keeps tile repeats at least 1 (edge)", () => {
    const parts: MillKitSurfacePart[] = [
      "tower",
      "base",
      "roof",
      "timber",
      "sails",
    ];
    for (const part of parts) {
      expect(MILL_KIT_SURFACES[part].repeatX).toBeGreaterThanOrEqual(1);
      expect(MILL_KIT_SURFACES[part].repeatY).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not make the tower oak staves (failure)", () => {
    expect(MILL_KIT_SURFACES.tower.kind).not.toBe("wood");
    expect(MILL_KIT_SURFACES.base.kind).not.toBe("wood");
    expect(millKitSailIsWood("tower")).toBe(false);
    expect(millKitBodyIsClay("tower")).not.toBe(false);
  });
});
