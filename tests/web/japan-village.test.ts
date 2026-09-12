import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  JAPAN_VILLAGE_FENCE_NATIVE_WIDTH,
  JAPAN_VILLAGE_PROPS,
  japanVillageFenceTiles,
  japanVillagePreloadUrls,
  japanVillageProp,
} from "../../apps/web/lib/japan-village";

const PUBLIC_DIR = path.join(
  process.cwd(),
  "apps/web/public/models/japan-village",
);

describe("japan village environment props", () => {
  it("maps village kinds to public GLTF urls (happy)", () => {
    const tree = japanVillageProp("tree");
    expect(tree.url).toBe("/models/japan-village/Tree_RedPlum.gltf");
    expect(tree.scale).toBeGreaterThan(0);
    expect(japanVillageProp("torii").file).toBe("ToriGate.gltf");
    expect(japanVillagePreloadUrls()).not.toContain(
      "/models/japan-village/House_4x5.gltf",
    );
    expect(japanVillagePreloadUrls()).toContain(tree.url);
    expect(japanVillagePreloadUrls()).toHaveLength(
      Object.keys(JAPAN_VILLAGE_PROPS).length,
    );
  });

  it("tiles fence runs to fill kit lengths (edge)", () => {
    expect(JAPAN_VILLAGE_FENCE_NATIVE_WIDTH).toBe(4);
    const eight = japanVillageFenceTiles(8);
    expect(eight.count).toBe(2);
    expect(eight.spacing).toBe(4);
    expect(eight.scaleX).toBe(1);
    const short = japanVillageFenceTiles(2);
    expect(short.count).toBe(1);
    expect(short.scaleX).toBeCloseTo(0.5);
    const homesteadBack = japanVillageFenceTiles(16.2);
    expect(homesteadBack.count).toBe(4);
    expect(homesteadBack.spacing * homesteadBack.count).toBeCloseTo(16.2);
  });

  it("refuses empty fence length and ships atlas-backed files (failure)", () => {
    expect(japanVillageFenceTiles(0).count).toBe(0);
    expect(japanVillageFenceTiles(-4).count).toBe(0);
    const atlas = path.join(PUBLIC_DIR, "textures", "ColorAtlas.png");
    expect(fs.existsSync(atlas)).toBe(true);
    expect(fs.statSync(atlas).size).toBeGreaterThan(1000);
    for (const prop of Object.values(JAPAN_VILLAGE_PROPS)) {
      const gltf = path.join(PUBLIC_DIR, prop.file);
      const bin = gltf.replace(/\.gltf$/i, ".bin");
      expect(fs.existsSync(gltf), prop.file).toBe(true);
      expect(fs.existsSync(bin), path.basename(bin)).toBe(true);
      expect(fs.readFileSync(gltf, "utf8")).toContain("textures/ColorAtlas.png");
    }
  });
});
