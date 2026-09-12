import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  ENERGY_REFUSE_CUE,
  isCoreSuccessCueText,
  NO_BREAD_REFUSE_CUE,
  noBreadRefuseCueText,
  shouldFlashEnergyRefuseCue,
  shouldFlashNoBreadRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL71.1 — No-bread energy refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Bread` instead of sticky long no-bread prose.
 * Eat / energy numbers unchanged; mute ok.
 */
describe("CityLands PL71.1 no-bread refuse ephemeral", () => {
  it("flashes Bread for noBread (happy)", () => {
    expect(noBreadRefuseCueText()).toBe(NO_BREAD_REFUSE_CUE);
    expect(noBreadRefuseCueText()).toBe("Bread");
    expect(shouldFlashNoBreadRefuseCue(ACTION_ERROR.noBread)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.noBread)).toBe(true);
    expect(isCoreSuccessCueText("Bread")).toBe(true);
    expect(ACTION_ERROR.noBread.toLowerCase()).toMatch(/bread/);
  });

  it("stays quiet for energy / other food soft refuses (edge)", () => {
    expect(shouldFlashNoBreadRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(
      false,
    );
    expect(shouldFlashNoBreadRefuseCue(ACTION_ERROR.noFood)).toBe(false);
    expect(shouldFlashEnergyRefuseCue(ACTION_ERROR.noBread)).toBe(false);
    expect(noBreadRefuseCueText()).not.toBe(ENERGY_REFUSE_CUE);
  });

  it("refuses unrelated errors and does not invent eat rules (failure)", () => {
    expect(shouldFlashNoBreadRefuseCue(null)).toBe(false);
    expect(shouldFlashNoBreadRefuseCue(undefined)).toBe(false);
    expect(shouldFlashNoBreadRefuseCue("")).toBe(false);
    expect(shouldFlashNoBreadRefuseCue(ACTION_ERROR.missingSeed)).toBe(false);
    expect(noBreadRefuseCueText()).not.toMatch(/\d/);
    expect(noBreadRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.noBread.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.noBread)).toBe(false);
    expect(noBreadRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
