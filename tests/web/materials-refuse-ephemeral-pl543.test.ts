import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MATERIALS_REFUSE_CUE,
  isCoreSuccessCueText,
  materialsRefuseCueText,
  shouldFlashCoinsRefuseCue,
  shouldFlashMaterialsRefuseCue,
  shouldFlashTooFarRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL54.3 — Materials refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Materials` instead of sticky long missing-mats prose.
 * Recipe / listing rules unchanged; mute ok.
 */
describe("CityLands PL54.3 materials refuse ephemeral", () => {
  it("flashes Materials for missing mats / not-enough-items (happy)", () => {
    expect(materialsRefuseCueText()).toBe(MATERIALS_REFUSE_CUE);
    expect(materialsRefuseCueText()).toBe("Materials");
    expect(shouldFlashMaterialsRefuseCue(ACTION_ERROR.missingMaterials)).toBe(
      true,
    );
    expect(shouldFlashMaterialsRefuseCue(ACTION_ERROR.notEnoughItems)).toBe(
      true,
    );
    expect(
      shouldFlashMaterialsRefuseCue(ACTION_ERROR.needMatsBuild(3, "Wood")),
    ).toBe(true);
    expect(
      shouldFlashMaterialsRefuseCue(ACTION_ERROR.needMatsExpand(2, "Stone")),
    ).toBe(true);
    expect(
      shouldFlashMaterialsRefuseCue(ACTION_ERROR.needMatsUpgrade(4, "Iron")),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.missingMaterials)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.notEnoughItems)).toBe(true);
    expect(isCoreSuccessCueText("Materials")).toBe(true);
  });

  it("stays quiet for coins and too-far refuses (edge)", () => {
    expect(shouldFlashMaterialsRefuseCue(ACTION_ERROR.notEnoughCoins)).toBe(
      false,
    );
    expect(shouldFlashMaterialsRefuseCue(ACTION_ERROR.tooFar)).toBe(false);
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.missingMaterials)).toBe(
      false,
    );
    expect(shouldFlashTooFarRefuseCue(ACTION_ERROR.missingMaterials)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent recipes (failure)", () => {
    expect(shouldFlashMaterialsRefuseCue(null)).toBe(false);
    expect(shouldFlashMaterialsRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMaterialsRefuseCue("")).toBe(false);
    expect(shouldFlashMaterialsRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(
      false,
    );
    expect(materialsRefuseCueText()).not.toMatch(/\d/);
    expect(materialsRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.missingMaterials.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.missingMaterials)).toBe(false);
  });
});
