import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CITY_ATMOSPHERE_EXTRA_PLACEMENTS } from "../../packages/shared/src/world-object-materials";

const EXTRAS = path.join(
  process.cwd(),
  "apps/web/components/land-scene/CityEnvExtras.tsx",
);

/**
 * Plaza arch is a stone vault on piers, not a stacked lintel.
 */
describe("city plaza stone arch", () => {
  it("places one arch on the City Hall approach (happy)", () => {
    const arches = CITY_ATMOSPHERE_EXTRA_PLACEMENTS.filter((e) => e.kind === "arch");
    expect(arches).toHaveLength(1);
    expect(arches[0]?.z).toBeLessThan(-6);
    expect(Math.abs(arches[0]?.x ?? 9)).toBeLessThan(0.2);
  });

  it("builds the span with a torus vault (edge)", () => {
    const src = fs.readFileSync(EXTRAS, "utf8");
    expect(src).toContain("torusGeometry");
    expect(src).toContain("Math.PI");
    expect(src).toContain("pierH");
  });

  it("rejects the old box lintel stack (failure)", () => {
    const src = fs.readFileSync(EXTRAS, "utf8");
    expect(src).not.toContain("Soft arch curve cue");
    expect(src).not.toContain("kitBoxGeometry args={[3.7, 0.45, 0.65]}");
    expect(src).not.toContain("kitBoxGeometry args={[0.55, 2.6, 0.55]}");
  });
});
