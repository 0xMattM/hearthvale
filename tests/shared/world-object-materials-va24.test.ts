import { describe, expect, it } from "vitest";
import {
  TUTOR_CLOAK_COLORS,
  tutorialNpcCloakColor,
} from "../../packages/shared/src/tutorial-npcs";
import {
  housingDecorBannerKitMaterials,
  housingDecorPadKitMaterials,
  housingDecorPlanterKitMaterials,
  tutorNpcKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA2.4", () => {
  it("tutor skin vs cloak vs boots stay distinct (happy)", () => {
    const kit = tutorNpcKitMaterials();
    expect(kit.cloak.roughness).toBeGreaterThan(kit.skin.roughness);
    expect(kit.boots.metalness).toBeGreaterThan(kit.cloak.metalness);
    expect(kit.bootsColor).not.toBe(kit.headColor);
    expect(worldObjectSurfacesDiffer(kit.skin, kit.cloak)).toBe(true);
    // Profession cloak colors stay on tutorialNpcCloakColor SoT.
    expect(tutorialNpcCloakColor("farmer")).toBe(TUTOR_CLOAK_COLORS.farmer);
    expect(tutorialNpcCloakColor("miner")).not.toBe(
      tutorialNpcCloakColor("farmer"),
    );
  });

  it("decor pad highlight brightens without flattening stone PBR (edge)", () => {
    const idle = housingDecorPadKitMaterials(false);
    const lit = housingDecorPadKitMaterials(true);
    expect(lit.padColor).not.toBe(idle.padColor);
    expect(lit.pad.roughness).toBe(idle.pad.roughness);
    expect(idle.lip.metalness).toBeGreaterThan(idle.pad.metalness);
    expect(worldObjectSurfacesDiffer(idle.pad, idle.lip)).toBe(true);
  });

  it("planter / banner cloth stay apart from pole/pot metal (failure)", () => {
    const planter = housingDecorPlanterKitMaterials(false);
    const banner = housingDecorBannerKitMaterials(false);
    const bannerLit = housingDecorBannerKitMaterials(true);
    expect(planter.foliageColor).not.toBe(planter.potColor);
    expect(planter.bloomColor).not.toBe(planter.soilColor);
    expect(planter.foliage.roughness).toBeGreaterThan(planter.bloom.roughness);
    expect(banner.finial.metalness).toBeGreaterThan(banner.cloth.metalness);
    expect(bannerLit.clothColor).not.toBe(banner.clothColor);
    expect(worldObjectSurfacesDiffer(banner.pole, banner.finial)).toBe(true);
  });
});
