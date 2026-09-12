import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  NEED_MATS_REPAIR_REFUSE_CUE,
  NOT_A_TOOL_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashNeedMatsRepairRefuseCue,
  shouldFlashNotAToolRefuseCue,
  notAToolRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL100.2 — Not-a-tool refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Tool` instead of sticky long equip prose.
 * Equip rules unchanged; mute ok.
 */
describe("CityLands PL100.2 not-a-tool refuse ephemeral", () => {
  it("flashes Tool for notATool (happy)", () => {
    expect(notAToolRefuseCueText()).toBe(NOT_A_TOOL_REFUSE_CUE);
    expect(notAToolRefuseCueText()).toBe("Tool");
    expect(shouldFlashNotAToolRefuseCue(ACTION_ERROR.notATool)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.notATool)).toBe(true);
    expect(isCoreSuccessCueText("Tool")).toBe(true);
    expect(ACTION_ERROR.notATool.toLowerCase()).toMatch(/tool|equip/);
  });

  it("stays quiet for unrelated repair-mats refuse (edge)", () => {
    expect(
      shouldFlashNotAToolRefuseCue(ACTION_ERROR.needMatsRepair(1, "Iron")),
    ).toBe(false);
    expect(notAToolRefuseCueText()).not.toBe(NEED_MATS_REPAIR_REFUSE_CUE);
    expect(
      shouldFlashNeedMatsRepairRefuseCue(ACTION_ERROR.notATool),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent equip rules (failure)", () => {
    expect(shouldFlashNotAToolRefuseCue(null)).toBe(false);
    expect(shouldFlashNotAToolRefuseCue(undefined)).toBe(false);
    expect(shouldFlashNotAToolRefuseCue("")).toBe(false);
    expect(
      shouldFlashNotAToolRefuseCue(ACTION_ERROR.toolAlreadyRepaired),
    ).toBe(false);
    expect(notAToolRefuseCueText()).not.toMatch(/\d/);
    expect(notAToolRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.notATool.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.notATool)).toBe(false);
    expect(notAToolRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
