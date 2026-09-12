import { describe, expect, it } from "vitest";
import { ACTION_ERROR, HUNT } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  HUNT_COOLDOWN_REFUSE_CUE,
  huntCooldownRefuseCueText,
  isCoreSuccessCueText,
  ORE_COOLDOWN_REFUSE_CUE,
  shouldFlashHuntCooldownRefuseCue,
  shouldFlashOreCooldownRefuseCue,
  shouldFlashWoodStumpCooldownRefuseCue,
  WOOD_STUMP_COOLDOWN_REFUSE_CUE,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL63.4 — Hunt cooldown soft refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Scattered` instead of sticky long hunt prose.
 * Cooldown / spawn rates unchanged; mute ok.
 */
describe("CityLands PL63.4 hunt cooldown refuse ephemeral", () => {
  it("flashes Scattered for huntCooldown (happy)", () => {
    expect(huntCooldownRefuseCueText()).toBe(HUNT_COOLDOWN_REFUSE_CUE);
    expect(huntCooldownRefuseCueText()).toBe("Scattered");
    expect(shouldFlashHuntCooldownRefuseCue(ACTION_ERROR.huntCooldown)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.huntCooldown)).toBe(true);
    expect(isCoreSuccessCueText("Scattered")).toBe(true);
    expect(ACTION_ERROR.huntCooldown.toLowerCase()).toMatch(/scatter|hunt/);
  });

  it("stays quiet for gather cooldowns and unrelated soft refuses (edge)", () => {
    expect(
      shouldFlashHuntCooldownRefuseCue(ACTION_ERROR.woodStumpCooldown),
    ).toBe(false);
    expect(
      shouldFlashHuntCooldownRefuseCue(ACTION_ERROR.fishingDockCooldown),
    ).toBe(false);
    expect(
      shouldFlashHuntCooldownRefuseCue(ACTION_ERROR.animalPenCooldown),
    ).toBe(false);
    expect(shouldFlashHuntCooldownRefuseCue(ACTION_ERROR.oreNodeCooldown)).toBe(
      false,
    );
    expect(shouldFlashHuntCooldownRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(
      false,
    );
    expect(shouldFlashOreCooldownRefuseCue(ACTION_ERROR.huntCooldown)).toBe(
      false,
    );
    expect(
      shouldFlashWoodStumpCooldownRefuseCue(ACTION_ERROR.huntCooldown),
    ).toBe(false);
    expect(huntCooldownRefuseCueText()).not.toBe(WOOD_STUMP_COOLDOWN_REFUSE_CUE);
    expect(huntCooldownRefuseCueText()).not.toBe(ORE_COOLDOWN_REFUSE_CUE);
  });

  it("refuses unrelated errors and keeps cooldown numbers unchanged (failure)", () => {
    expect(shouldFlashHuntCooldownRefuseCue(null)).toBe(false);
    expect(shouldFlashHuntCooldownRefuseCue(undefined)).toBe(false);
    expect(shouldFlashHuntCooldownRefuseCue("")).toBe(false);
    expect(shouldFlashHuntCooldownRefuseCue(ACTION_ERROR.tooFar)).toBe(false);
    expect(huntCooldownRefuseCueText()).not.toMatch(/\d/);
    expect(huntCooldownRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.huntCooldown.length,
    );
    expect(HUNT.cooldownMs).toBeGreaterThan(0);
    expect(isCoreSuccessCueText(ACTION_ERROR.huntCooldown)).toBe(false);
    expect(huntCooldownRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat power/,
    );
  });
});
