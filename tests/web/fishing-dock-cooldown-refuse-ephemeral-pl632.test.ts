import { describe, expect, it } from "vitest";
import { ACTION_ERROR, FISHING_DOCK } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  FISHING_DOCK_COOLDOWN_REFUSE_CUE,
  fishingDockCooldownRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashFishingDockCooldownRefuseCue,
  shouldFlashWoodStumpCooldownRefuseCue,
  WOOD_STUMP_COOLDOWN_REFUSE_CUE,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL63.2 — Fishing dock cooldown soft refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Waiting` instead of sticky long dock prose.
 * Cooldown numbers unchanged; mute ok.
 */
describe("CityLands PL63.2 fishing dock cooldown refuse ephemeral", () => {
  it("flashes Waiting for fishingDockCooldown (happy)", () => {
    expect(fishingDockCooldownRefuseCueText()).toBe(
      FISHING_DOCK_COOLDOWN_REFUSE_CUE,
    );
    expect(fishingDockCooldownRefuseCueText()).toBe("Waiting");
    expect(
      shouldFlashFishingDockCooldownRefuseCue(ACTION_ERROR.fishingDockCooldown),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.fishingDockCooldown)).toBe(true);
    expect(isCoreSuccessCueText("Waiting")).toBe(true);
    expect(ACTION_ERROR.fishingDockCooldown.toLowerCase()).toMatch(
      /water|cast/,
    );
  });

  it("stays quiet for other gather / hunt cooldowns (edge)", () => {
    expect(
      shouldFlashFishingDockCooldownRefuseCue(ACTION_ERROR.woodStumpCooldown),
    ).toBe(false);
    expect(
      shouldFlashFishingDockCooldownRefuseCue(ACTION_ERROR.animalPenCooldown),
    ).toBe(false);
    expect(
      shouldFlashFishingDockCooldownRefuseCue(ACTION_ERROR.oreNodeCooldown),
    ).toBe(false);
    expect(
      shouldFlashFishingDockCooldownRefuseCue(ACTION_ERROR.huntCooldown),
    ).toBe(false);
    expect(
      shouldFlashWoodStumpCooldownRefuseCue(ACTION_ERROR.fishingDockCooldown),
    ).toBe(false);
    expect(fishingDockCooldownRefuseCueText()).not.toBe(
      WOOD_STUMP_COOLDOWN_REFUSE_CUE,
    );
  });

  it("refuses unrelated errors and keeps cooldown numbers unchanged (failure)", () => {
    expect(shouldFlashFishingDockCooldownRefuseCue(null)).toBe(false);
    expect(shouldFlashFishingDockCooldownRefuseCue(undefined)).toBe(false);
    expect(shouldFlashFishingDockCooldownRefuseCue("")).toBe(false);
    expect(
      shouldFlashFishingDockCooldownRefuseCue(ACTION_ERROR.fishingDockMissing),
    ).toBe(false);
    expect(fishingDockCooldownRefuseCueText()).not.toMatch(/\d/);
    expect(fishingDockCooldownRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.fishingDockCooldown.length,
    );
    expect(FISHING_DOCK.cooldownMs).toBeGreaterThan(0);
    expect(isCoreSuccessCueText(ACTION_ERROR.fishingDockCooldown)).toBe(false);
    expect(fishingDockCooldownRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
