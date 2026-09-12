import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  BUILD_PLAYER_LAND_ONLY_REFUSE_CUE,
  DECOR_PAD_MISSING_REFUSE_CUE,
  DECOR_STARTER_ONLY_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashBuildPlayerLandOnlyRefuseCue,
  shouldFlashDecorPadMissingRefuseCue,
  shouldFlashDecorStarterOnlyRefuseCue,
  decorStarterOnlyRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL105.2 — Decor-starter-only refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Home` instead of sticky long housing prose.
 * Decor homestead gate unchanged; mute ok.
 */
describe("CityLands PL105.2 decor-starter-only refuse ephemeral", () => {
  it("flashes Home for decorStarterOnly (happy)", () => {
    expect(decorStarterOnlyRefuseCueText()).toBe(
      DECOR_STARTER_ONLY_REFUSE_CUE,
    );
    expect(decorStarterOnlyRefuseCueText()).toBe("Home");
    expect(
      shouldFlashDecorStarterOnlyRefuseCue(ACTION_ERROR.decorStarterOnly),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.decorStarterOnly)).toBe(true);
    expect(isCoreSuccessCueText("Home")).toBe(true);
    expect(ACTION_ERROR.decorStarterOnly.toLowerCase()).toMatch(
      /housing|decor|homestead/,
    );
  });

  it("stays quiet for pad-missing / land-only refuse (edge)", () => {
    expect(
      shouldFlashDecorStarterOnlyRefuseCue(ACTION_ERROR.decorPadMissing),
    ).toBe(false);
    expect(
      shouldFlashDecorStarterOnlyRefuseCue(ACTION_ERROR.buildPlayerLandOnly),
    ).toBe(false);
    expect(decorStarterOnlyRefuseCueText()).not.toBe(
      DECOR_PAD_MISSING_REFUSE_CUE,
    );
    expect(decorStarterOnlyRefuseCueText()).not.toBe(
      BUILD_PLAYER_LAND_ONLY_REFUSE_CUE,
    );
    expect(
      shouldFlashDecorPadMissingRefuseCue(ACTION_ERROR.decorStarterOnly),
    ).toBe(false);
    expect(
      shouldFlashBuildPlayerLandOnlyRefuseCue(ACTION_ERROR.decorStarterOnly),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent homestead rules (failure)", () => {
    expect(shouldFlashDecorStarterOnlyRefuseCue(null)).toBe(false);
    expect(shouldFlashDecorStarterOnlyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashDecorStarterOnlyRefuseCue("")).toBe(false);
    expect(
      shouldFlashDecorStarterOnlyRefuseCue(ACTION_ERROR.noExpandSlots),
    ).toBe(false);
    expect(decorStarterOnlyRefuseCueText()).not.toMatch(/\d/);
    expect(decorStarterOnlyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.decorStarterOnly.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.decorStarterOnly)).toBe(false);
    expect(decorStarterOnlyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
