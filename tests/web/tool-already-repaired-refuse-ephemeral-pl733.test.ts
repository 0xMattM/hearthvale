import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  isCoreSuccessCueText,
  MATERIALS_REFUSE_CUE,
  TOOL_ALREADY_REPAIRED_REFUSE_CUE,
  shouldFlashMaterialsRefuseCue,
  shouldFlashToolAlreadyRepairedRefuseCue,
  toolAlreadyRepairedRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL73.3 — Tool-already-repaired refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Intact` instead of sticky long repair prose.
 * Repair rules / costs unchanged; mute ok.
 */
describe("CityLands PL73.3 tool-already-repaired refuse ephemeral", () => {
  it("flashes Intact for toolAlreadyRepaired (happy)", () => {
    expect(toolAlreadyRepairedRefuseCueText()).toBe(
      TOOL_ALREADY_REPAIRED_REFUSE_CUE,
    );
    expect(toolAlreadyRepairedRefuseCueText()).toBe("Intact");
    expect(
      shouldFlashToolAlreadyRepairedRefuseCue(ACTION_ERROR.toolAlreadyRepaired),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.toolAlreadyRepaired)).toBe(true);
    expect(isCoreSuccessCueText("Intact")).toBe(true);
    expect(ACTION_ERROR.toolAlreadyRepaired.toLowerCase()).toMatch(/repair/);
  });

  it("stays quiet for materials / unrelated soft refuses (edge)", () => {
    expect(
      shouldFlashToolAlreadyRepairedRefuseCue(ACTION_ERROR.missingMaterials),
    ).toBe(false);
    expect(
      shouldFlashToolAlreadyRepairedRefuseCue(ACTION_ERROR.notEnoughCoins),
    ).toBe(false);
    expect(
      shouldFlashMaterialsRefuseCue(ACTION_ERROR.toolAlreadyRepaired),
    ).toBe(false);
    expect(toolAlreadyRepairedRefuseCueText()).not.toBe(MATERIALS_REFUSE_CUE);
  });

  it("refuses unrelated errors and does not invent repair rules (failure)", () => {
    expect(shouldFlashToolAlreadyRepairedRefuseCue(null)).toBe(false);
    expect(shouldFlashToolAlreadyRepairedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashToolAlreadyRepairedRefuseCue("")).toBe(false);
    expect(
      shouldFlashToolAlreadyRepairedRefuseCue(ACTION_ERROR.noFood),
    ).toBe(false);
    expect(toolAlreadyRepairedRefuseCueText()).not.toMatch(/\d/);
    expect(toolAlreadyRepairedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.toolAlreadyRepaired.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.toolAlreadyRepaired)).toBe(false);
    expect(toolAlreadyRepairedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
