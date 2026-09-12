import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MATERIALS_REFUSE_CUE,
  NEED_MATS_REPAIR_REFUSE_CUE,
  NOT_A_TOOL_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMaterialsRefuseCue,
  shouldFlashNeedMatsRepairRefuseCue,
  shouldFlashNotAToolRefuseCue,
  needMatsRepairRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL100.1 — Repair-need-mats refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Mats` instead of sticky long repair / Materials prose.
 * Repair costs unchanged; mute ok.
 */
describe("CityLands PL100.1 repair-need-mats refuse ephemeral", () => {
  it("flashes Mats for needMatsRepair (happy)", () => {
    expect(needMatsRepairRefuseCueText()).toBe(NEED_MATS_REPAIR_REFUSE_CUE);
    expect(needMatsRepairRefuseCueText()).toBe("Mats");
    expect(
      shouldFlashNeedMatsRepairRefuseCue(
        ACTION_ERROR.needMatsRepair(2, "Wood"),
      ),
    ).toBe(true);
    expect(
      isSoftRefuseError(ACTION_ERROR.needMatsRepair(2, "Wood")),
    ).toBe(true);
    expect(isCoreSuccessCueText("Mats")).toBe(true);
    expect(ACTION_ERROR.needMatsRepair(2, "Wood").toLowerCase()).toMatch(
      /repair|tool/,
    );
  });

  it("stays quiet for place mats and not-a-tool refuses (edge)", () => {
    expect(
      shouldFlashNeedMatsRepairRefuseCue(ACTION_ERROR.needMatsBuild(3, "Wood")),
    ).toBe(false);
    expect(
      shouldFlashMaterialsRefuseCue(ACTION_ERROR.needMatsRepair(2, "Wood")),
    ).toBe(false);
    expect(needMatsRepairRefuseCueText()).not.toBe(MATERIALS_REFUSE_CUE);
    expect(needMatsRepairRefuseCueText()).not.toBe(NOT_A_TOOL_REFUSE_CUE);
    expect(
      shouldFlashNotAToolRefuseCue(ACTION_ERROR.needMatsRepair(2, "Wood")),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent repair costs (failure)", () => {
    expect(shouldFlashNeedMatsRepairRefuseCue(null)).toBe(false);
    expect(shouldFlashNeedMatsRepairRefuseCue(undefined)).toBe(false);
    expect(shouldFlashNeedMatsRepairRefuseCue("")).toBe(false);
    expect(
      shouldFlashNeedMatsRepairRefuseCue(ACTION_ERROR.missingMaterials),
    ).toBe(false);
    expect(needMatsRepairRefuseCueText()).not.toMatch(/\d/);
    expect(needMatsRepairRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.needMatsRepair(2, "Wood").length,
    );
    expect(
      isCoreSuccessCueText(ACTION_ERROR.needMatsRepair(2, "Wood")),
    ).toBe(false);
    expect(needMatsRepairRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
