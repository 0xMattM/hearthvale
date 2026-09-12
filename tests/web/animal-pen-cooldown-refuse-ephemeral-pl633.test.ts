import { describe, expect, it } from "vitest";
import { ACTION_ERROR, ANIMAL_PEN } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  ANIMAL_PEN_COOLDOWN_REFUSE_CUE,
  animalPenCooldownRefuseCueText,
  FISHING_DOCK_COOLDOWN_REFUSE_CUE,
  HUNT_COOLDOWN_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashAnimalPenCooldownRefuseCue,
  shouldFlashFishingDockCooldownRefuseCue,
  shouldFlashWoodStumpCooldownRefuseCue,
  WOOD_STUMP_COOLDOWN_REFUSE_CUE,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL63.3 — Animal pen cooldown soft refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Resting` instead of sticky long pen prose.
 * Cooldown numbers unchanged; mute ok.
 */
describe("CityLands PL63.3 animal pen cooldown refuse ephemeral", () => {
  it("flashes Resting for animalPenCooldown (happy)", () => {
    expect(animalPenCooldownRefuseCueText()).toBe(ANIMAL_PEN_COOLDOWN_REFUSE_CUE);
    expect(animalPenCooldownRefuseCueText()).toBe("Resting");
    expect(
      shouldFlashAnimalPenCooldownRefuseCue(ACTION_ERROR.animalPenCooldown),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.animalPenCooldown)).toBe(true);
    expect(isCoreSuccessCueText("Resting")).toBe(true);
    expect(ACTION_ERROR.animalPenCooldown.toLowerCase()).toMatch(
      /animal|care/,
    );
    // Same short verb as stump (PL63.1) — keyed by distinct ACTION_ERROR.
    expect(animalPenCooldownRefuseCueText()).toBe(WOOD_STUMP_COOLDOWN_REFUSE_CUE);
  });

  it("stays quiet for other gather / hunt cooldowns (edge)", () => {
    expect(
      shouldFlashAnimalPenCooldownRefuseCue(ACTION_ERROR.woodStumpCooldown),
    ).toBe(false);
    expect(
      shouldFlashAnimalPenCooldownRefuseCue(ACTION_ERROR.fishingDockCooldown),
    ).toBe(false);
    expect(
      shouldFlashAnimalPenCooldownRefuseCue(ACTION_ERROR.oreNodeCooldown),
    ).toBe(false);
    expect(
      shouldFlashAnimalPenCooldownRefuseCue(ACTION_ERROR.huntCooldown),
    ).toBe(false);
    expect(
      shouldFlashWoodStumpCooldownRefuseCue(ACTION_ERROR.animalPenCooldown),
    ).toBe(false);
    expect(
      shouldFlashFishingDockCooldownRefuseCue(ACTION_ERROR.animalPenCooldown),
    ).toBe(false);
    expect(animalPenCooldownRefuseCueText()).not.toBe(
      FISHING_DOCK_COOLDOWN_REFUSE_CUE,
    );
    expect(animalPenCooldownRefuseCueText()).not.toBe(HUNT_COOLDOWN_REFUSE_CUE);
  });

  it("refuses unrelated errors and keeps cooldown numbers unchanged (failure)", () => {
    expect(shouldFlashAnimalPenCooldownRefuseCue(null)).toBe(false);
    expect(shouldFlashAnimalPenCooldownRefuseCue(undefined)).toBe(false);
    expect(shouldFlashAnimalPenCooldownRefuseCue("")).toBe(false);
    expect(
      shouldFlashAnimalPenCooldownRefuseCue(ACTION_ERROR.animalPenMissing),
    ).toBe(false);
    expect(animalPenCooldownRefuseCueText()).not.toMatch(/\d/);
    expect(animalPenCooldownRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.animalPenCooldown.length,
    );
    expect(ANIMAL_PEN.cooldownMs).toBeGreaterThan(0);
    expect(isCoreSuccessCueText(ACTION_ERROR.animalPenCooldown)).toBe(false);
    expect(animalPenCooldownRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
