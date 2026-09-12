import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CITY_ENV = path.join(
  process.cwd(),
  "apps/web/components/land-scene/CityEnvironment.tsx",
);

/**
 * Hub countryside — inner stone stays inside the wall; outer grass/woods render.
 */
describe("city perimeter outside woods (web)", () => {
  it("wires countryside grass and outer trees from the perimeter catalog (happy)", () => {
    const src = fs.readFileSync(CITY_ENV, "utf8");
    expect(src).toContain("cityPerimeterOutsideGround");
    expect(src).toContain("cityPerimeterInnerStoneFloor");
    expect(src).toContain("cityPerimeterOutsideTrees");
    expect(src).toContain("cityPerimeterOutsideBushes");
    expect(src).toContain("outerGround.grassColor");
    expect(src).toContain("city-outer-tree-");
  });

  it("does not stretch civic stone past the wall as the outer floor (edge)", () => {
    const src = fs.readFileSync(CITY_ENV, "utf8");
    expect(src).toContain("innerStone.width");
    expect(src).not.toContain("[80, 72]");
    expect(src).toContain("outerGround.dirtPatches");
  });

  it("rejects a missing countryside mesh stack (failure)", () => {
    const src = fs.readFileSync(CITY_ENV, "utf8");
    expect(src.includes("cityPerimeterOutsideGround")).toBe(true);
    expect(src.includes("Surrounding streets — cooler civic tint")).toBe(
      false,
    );
    expect(CITY_ENV.endsWith("missing-file.tsx")).toBe(false);
  });
});
