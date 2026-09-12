import { describe, expect, it } from "vitest";
import { ACTION_ERROR, WOOD_STUMP } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  FISHING_DOCK_COOLDOWN_REFUSE_CUE,
  HUNT_COOLDOWN_REFUSE_CUE,
  isCoreSuccessCueText,
  ORE_COOLDOWN_REFUSE_CUE,
  shouldFlashFishingDockCooldownRefuseCue,
  shouldFlashOreCooldownRefuseCue,
  shouldFlashWoodStumpCooldownRefuseCue,
  WOOD_STUMP_COOLDOWN_REFUSE_CUE,
  woodStumpCooldownRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL63.1 — Wood stump cooldown soft refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Resting` instead of sticky long stump prose.
 * Cooldown numbers unchanged; mute ok.
 */
describe("CityLands PL63.1 wood stump cooldown refuse ephemeral", () => {
  it("flashes Resting for woodStumpCooldown (happy)", () => {
    expect(woodStumpCooldownRefuseCueText()).toBe(WOOD_STUMP_COOLDOWN_REFUSE_CUE);
    expect(woodStumpCooldownRefuseCueText()).toBe("Resting");
    expect(
      shouldFlashWoodStumpCooldownRefuseCue(ACTION_ERROR.woodStumpCooldown),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.woodStumpCooldown)).toBe(true);
    expect(isCoreSuccessCueText("Resting")).toBe(true);
    expect(ACTION_ERROR.woodStumpCooldown.toLowerCase()).toMatch(/stump|chop/);
  });

  it("stays quiet for other gather / hunt cooldowns (edge)", () => {
    expect(
      shouldFlashWoodStumpCooldownRefuseCue(ACTION_ERROR.oreNodeCooldown),
    ).toBe(false);
    expect(
      shouldFlashWoodStumpCooldownRefuseCue(ACTION_ERROR.fishingDockCooldown),
    ).toBe(false);
    expect(
      shouldFlashWoodStumpCooldownRefuseCue(ACTION_ERROR.animalPenCooldown),
    ).toBe(false);
    expect(
      shouldFlashWoodStumpCooldownRefuseCue(ACTION_ERROR.huntCooldown),
    ).toBe(false);
    expect(
      shouldFlashOreCooldownRefuseCue(ACTION_ERROR.woodStumpCooldown),
    ).toBe(false);
    expect(
      shouldFlashFishingDockCooldownRefuseCue(ACTION_ERROR.woodStumpCooldown),
    ).toBe(false);
    expect(woodStumpCooldownRefuseCueText()).not.toBe(ORE_COOLDOWN_REFUSE_CUE);
    expect(woodStumpCooldownRefuseCueText()).not.toBe(
      FISHING_DOCK_COOLDOWN_REFUSE_CUE,
    );
    expect(woodStumpCooldownRefuseCueText()).not.toBe(HUNT_COOLDOWN_REFUSE_CUE);
  });

  it("refuses unrelated errors and keeps cooldown numbers unchanged (failure)", () => {
    expect(shouldFlashWoodStumpCooldownRefuseCue(null)).toBe(false);
    expect(shouldFlashWoodStumpCooldownRefuseCue(undefined)).toBe(false);
    expect(shouldFlashWoodStumpCooldownRefuseCue("")).toBe(false);
    expect(
      shouldFlashWoodStumpCooldownRefuseCue(ACTION_ERROR.woodStumpMissing),
    ).toBe(false);
    expect(woodStumpCooldownRefuseCueText()).not.toMatch(/\d/);
    expect(woodStumpCooldownRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.woodStumpCooldown.length,
    );
    expect(WOOD_STUMP.cooldownMs).toBeGreaterThan(0);
    expect(isCoreSuccessCueText(ACTION_ERROR.woodStumpCooldown)).toBe(false);
    expect(woodStumpCooldownRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
