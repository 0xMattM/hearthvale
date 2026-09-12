import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  DECOR_PAD_MISSING_REFUSE_CUE,
  DECOR_STARTER_ONLY_REFUSE_CUE,
  NO_EXPAND_SLOTS_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashDecorPadMissingRefuseCue,
  shouldFlashDecorStarterOnlyRefuseCue,
  shouldFlashNoExpandSlotsRefuseCue,
  noExpandSlotsRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL105.3 — No-expand-slots refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Slots` instead of sticky long expand prose.
 * Expand slot caps unchanged; mute ok.
 */
describe("CityLands PL105.3 no-expand-slots refuse ephemeral", () => {
  it("flashes Slots for noExpandSlots (happy)", () => {
    expect(noExpandSlotsRefuseCueText()).toBe(NO_EXPAND_SLOTS_REFUSE_CUE);
    expect(noExpandSlotsRefuseCueText()).toBe("Slots");
    expect(
      shouldFlashNoExpandSlotsRefuseCue(ACTION_ERROR.noExpandSlots),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.noExpandSlots)).toBe(true);
    expect(isCoreSuccessCueText("Slots")).toBe(true);
    expect(ACTION_ERROR.noExpandSlots.toLowerCase()).toMatch(
      /slot|unlock|starter/,
    );
  });

  it("stays quiet for decor pad / starter-only refuse (edge)", () => {
    expect(
      shouldFlashNoExpandSlotsRefuseCue(ACTION_ERROR.decorPadMissing),
    ).toBe(false);
    expect(
      shouldFlashNoExpandSlotsRefuseCue(ACTION_ERROR.decorStarterOnly),
    ).toBe(false);
    expect(noExpandSlotsRefuseCueText()).not.toBe(DECOR_PAD_MISSING_REFUSE_CUE);
    expect(noExpandSlotsRefuseCueText()).not.toBe(
      DECOR_STARTER_ONLY_REFUSE_CUE,
    );
    expect(
      shouldFlashDecorPadMissingRefuseCue(ACTION_ERROR.noExpandSlots),
    ).toBe(false);
    expect(
      shouldFlashDecorStarterOnlyRefuseCue(ACTION_ERROR.noExpandSlots),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent expand rules (failure)", () => {
    expect(shouldFlashNoExpandSlotsRefuseCue(null)).toBe(false);
    expect(shouldFlashNoExpandSlotsRefuseCue(undefined)).toBe(false);
    expect(shouldFlashNoExpandSlotsRefuseCue("")).toBe(false);
    expect(
      shouldFlashNoExpandSlotsRefuseCue(ACTION_ERROR.missingMaterials),
    ).toBe(false);
    expect(noExpandSlotsRefuseCueText()).not.toMatch(/\d/);
    expect(noExpandSlotsRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.noExpandSlots.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.noExpandSlots)).toBe(false);
    expect(noExpandSlotsRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
