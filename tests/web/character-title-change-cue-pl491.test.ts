import { describe, expect, it } from "vitest";
import { characterTitleForLevel } from "@game/shared";
import {
  SUCCESS_CUE_MS,
  TITLE_CHANGE_SUCCESS_CUE,
  TITLE_CHANGE_SUCCESS_CUE_PREFIX,
  characterTitleChangeCueText,
  isCoreSuccessCueText,
  shouldFlashCharacterTitleChangeCue,
  titleWithDecorPadUnlockCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL49.1 — Character title change ephemeral.
 * Brief TopBar when cosmetic title changes (Settler / Homesteader / Veteran).
 */
describe("CityLands PL49.1 character title change ephemeral", () => {
  it("flashes Title · Settler / Homesteader / Veteran on change (happy)", () => {
    expect(characterTitleChangeCueText("Settler")).toBe(
      `${TITLE_CHANGE_SUCCESS_CUE_PREFIX}Settler`,
    );
    expect(characterTitleChangeCueText("Settler")).toBe("Title · Settler");
    expect(characterTitleChangeCueText("Homesteader")).toBe(
      "Title · Homesteader",
    );
    expect(characterTitleChangeCueText("Veteran")).toBe("Title · Veteran");
    expect(isCoreSuccessCueText("Title · Settler")).toBe(true);
    expect(isCoreSuccessCueText(TITLE_CHANGE_SUCCESS_CUE)).toBe(true);

    expect(shouldFlashCharacterTitleChangeCue("Newcomer", "Settler")).toBe(
      true,
    );
    expect(
      shouldFlashCharacterTitleChangeCue("Settler", "Homesteader"),
    ).toBe(true);
    expect(
      shouldFlashCharacterTitleChangeCue("Homesteader", "Veteran"),
    ).toBe(true);
    expect(characterTitleForLevel(3)).toBe("Settler");
    expect(characterTitleForLevel(5)).toBe("Homesteader");
    expect(characterTitleForLevel(8)).toBe("Veteran");
  });

  it("stays quiet on hydrate, same title, or empty (edge)", () => {
    expect(shouldFlashCharacterTitleChangeCue(null, "Settler")).toBe(false);
    expect(shouldFlashCharacterTitleChangeCue(undefined, "Settler")).toBe(
      false,
    );
    expect(shouldFlashCharacterTitleChangeCue("Settler", "Settler")).toBe(
      false,
    );
    expect(shouldFlashCharacterTitleChangeCue("Settler", null)).toBe(false);
    expect(characterTitleChangeCueText("")).toBeNull();
    expect(characterTitleChangeCueText(null)).toBeNull();
    expect(characterTitleChangeCueText("  ")).toBeNull();
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("stays cosmetic — no combat power invent / no sticky prose (failure)", () => {
    expect(isCoreSuccessCueText("Title · Settler · +5 ATK")).toBe(false);
    expect(isCoreSuccessCueText("Title unlocked forever")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(titleWithDecorPadUnlockCueText("Homesteader")).toBe(
      "Homesteader · decor pad",
    );
    expect(isCoreSuccessCueText("Homesteader · decor pad")).toBe(true);
    expect(characterTitleForLevel(1)).toBe("Newcomer");
  });
});
