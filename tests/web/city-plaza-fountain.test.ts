import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FOUNTAIN = path.join(
  process.cwd(),
  "apps/web/components/land-scene/CityPlazaFountain.tsx",
);
const CITY_ENV = path.join(
  process.cwd(),
  "apps/web/components/land-scene/CityEnvironment.tsx",
);

/**
 * City plaza fountain mesh — stone basin + water, not a glowing plaster drum.
 */
describe("city plaza fountain mesh", () => {
  it("uses stone and cobble, not plaster, for the basin (happy)", () => {
    const src = fs.readFileSync(FOUNTAIN, "utf8");
    expect(src).toContain('kind="stone"');
    expect(src).toContain('kind="cobble"');
    expect(src).not.toContain('kind="plaster"');
    expect(src).toContain("DoubleSide");
    expect(src).toContain("plazaFountainVisualLayout");
  });

  it("keeps water as a pool plus jet without a haze disc (edge)", () => {
    const src = fs.readFileSync(FOUNTAIN, "utf8");
    expect(src).toContain("createFountainRippleAtlas");
    expect(src).toContain("paintFountainRipples");
    expect(src).toContain("ClampToEdgeWrapping");
    expect(src).not.toContain("offset.y");
    expect(src).not.toContain("hazeRadius");
    expect(src).not.toContain("cityPlazaLandmarkEmissiveIntensity");
    expect(src).toContain("nozzleHeight");
  });

  it("wires the city hub to the stone fountain, not the old landmark drum (failure)", () => {
    const env = fs.readFileSync(CITY_ENV, "utf8");
    expect(env).toContain("<CityPlazaFountain");
    expect(env).not.toContain("PlazaFountainLandmark");
    expect(env).not.toContain("cityPlazaLandmarkCue");
    expect(() => {
      if (!fs.existsSync(FOUNTAIN)) throw new Error("missing fountain mesh");
    }).not.toThrow();
  });
});
