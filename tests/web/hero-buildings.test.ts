import { describe, expect, it } from "vitest";
import {
  HERO_BUILDING_MODELS,
  heroModelFor,
  shouldLoadHeroGltf,
} from "../../apps/web/lib/hero-buildings";

describe("hero GLTF buildings F14.1", () => {
  it("leaves mill and forge on kit-only (happy)", () => {
    expect(HERO_BUILDING_MODELS.mill.url).toBe("");
    expect(heroModelFor("mill")).toBeNull();
    expect(shouldLoadHeroGltf("mill")).toBe(false);
    expect(HERO_BUILDING_MODELS.forge.url).toBe("");
    expect(heroModelFor("forge")).toBeNull();
  });

  it("does not load a hero GLTF for other stations (edge)", () => {
    expect(shouldLoadHeroGltf("kitchen")).toBe(false);
    expect(shouldLoadHeroGltf("workshop")).toBe(false);
    expect(shouldLoadHeroGltf("forge")).toBe(false);
  });

  it("does not use mill.glb as the live mill hero (failure)", () => {
    expect(heroModelFor("mill")).toBeNull();
    expect(HERO_BUILDING_MODELS.mill.url).not.toBe("/models/mill.glb");
    expect(shouldLoadHeroGltf("mill")).toBe(false);
  });
});
