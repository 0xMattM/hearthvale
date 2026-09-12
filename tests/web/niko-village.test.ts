import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  NIKO_CITY_HALL,
  NIKO_CITY_HALL_FIT,
  NIKO_CIVIC_BLOCKS,
  NIKO_VILLAGE_MATERIAL_COLORS,
  NIKO_VILLAGE_URL,
  nikoVillageFitScale,
  nikoVillageModel,
} from "../../apps/web/lib/niko-village";

const FBX_PATH = path.join(
  process.cwd(),
  "apps/web/public/models/niko-village/village.fbx",
);

describe("niko village houses", () => {
  it("maps City Hall to the tall Cube008 house (happy)", () => {
    expect(nikoVillageModel(NIKO_CITY_HALL).mesh).toBe("Cube008");
    expect(NIKO_CIVIC_BLOCKS).toHaveLength(4);
    expect(NIKO_VILLAGE_URL).toBe("/models/niko-village/village.fbx");
    expect(NIKO_VILLAGE_MATERIAL_COLORS.roofs.color).toMatch(/^#/);
    expect(NIKO_VILLAGE_MATERIAL_COLORS.windows.emissive).toBeTruthy();
    expect(
      nikoVillageFitScale({ x: 393, y: 267, z: 231 }, NIKO_CITY_HALL_FIT),
    ).toBeCloseTo(7.2 / 393);
  });

  it("caps a tiny bbox so it cannot enlarge the FBX graph (edge)", () => {
    expect(
      nikoVillageFitScale({ x: 0.4, y: 0.3, z: 0.4 }, NIKO_CITY_HALL_FIT),
    ).toBe(1);
  });

  it("caps a broken zero-size measurement at 1 (failure)", () => {
    expect(nikoVillageFitScale({ x: 0, y: 0, z: 0 }, NIKO_CITY_HALL_FIT)).toBe(1);
  });

  it("ships the bundled FBX (failure if missing)", () => {
    expect(fs.existsSync(FBX_PATH)).toBe(true);
    const buf = fs.readFileSync(FBX_PATH);
    expect(buf.length).toBeGreaterThan(100_000);
    expect(buf.slice(0, 20).toString("ascii")).toContain("Kaydara FBX");
    expect(buf.includes(Buffer.from("Cube.008"))).toBe(true);
  });
});
