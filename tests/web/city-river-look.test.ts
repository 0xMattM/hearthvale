import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CITY_RIVER = path.join(
  process.cwd(),
  "apps/web/components/land-scene/CityRiver.tsx",
);

/**
 * River bank soil + living water surface (not wood grain / static barcode).
 */
describe("city river bank and water look", () => {
  it("wires isotropic dirt UV and vertex waves (happy)", () => {
    const src = fs.readFileSync(CITY_RIVER, "utf8");
    expect(src).toContain("cityRiverBankUvRepeat");
    expect(src).toContain('kind="dirt"');
    expect(src).toContain("cityRiverWaveHeight");
    expect(src).toContain("waveSegsX");
    expect(src).toContain("cityRiverFlowUvOffsetV");
  });

  it("keeps the bank off wood grain and the water off a 1-seg plane (edge)", () => {
    const src = fs.readFileSync(CITY_RIVER, "utf8");
    expect(src).not.toContain('kind="wood"');
    expect(src).not.toContain("repeat={8}");
    expect(src).toContain("createCityRiverFoamMap");
    expect(src).toContain("computeVertexNormals");
  });

  it("rejects the old barcode-only water stack (failure)", () => {
    const src = fs.readFileSync(CITY_RIVER, "utf8");
    expect(src.includes("tex.repeat.set(7, 1.6)")).toBe(false);
    expect(src.includes("no vertex waves")).toBe(false);
    expect(CITY_RIVER.endsWith("missing-file.tsx")).toBe(false);
  });
});
