import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SCENE = path.join(process.cwd(), "apps/web/components/land-scene");

function read(file: string): string {
  return fs.readFileSync(path.join(SCENE, file), "utf8");
}

describe("world cooldown timer badges", () => {
  it("does not float countdown chips over crops, ore, or wildlife (happy)", () => {
    const meshes = read("ResourceMeshes.tsx");
    expect(meshes).not.toContain("formatGrowRemaining");
    expect(meshes).not.toContain("StatusBadge");
    expect(meshes).toContain("CropReadyWorldLabel");
  });

  it("keeps Ready labels on trees, pens, and docks without depleted clocks (edge)", () => {
    const buildings = read("BuildingMesh.tsx");
    expect(buildings).not.toContain("formatGrowRemaining");
    expect(buildings).toContain("GatherReadyWorldLabel");
    const river = read("CityRiverFishingSpot.tsx");
    expect(river).not.toContain("formatGrowRemaining");
  });

  it("still formats listing expiry in the market panel, not the world (failure)", () => {
    const market = fs.readFileSync(
      path.join(process.cwd(), "apps/web/components/hud/MarketPanel.tsx"),
      "utf8",
    );
    expect(market).toContain("formatGrowRemaining");
    expect(read("ResourceMeshes.tsx")).not.toMatch(/kind=["']timer["']/);
  });
});
