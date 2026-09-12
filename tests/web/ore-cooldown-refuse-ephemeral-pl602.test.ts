import { describe, expect, it } from "vitest";
import { ACTION_ERROR, ORE_NODE } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CROP_NOT_READY_REFUSE_CUE,
  HAMMER_REFUSE_CUE,
  isCoreSuccessCueText,
  ORE_COOLDOWN_REFUSE_CUE,
  oreCooldownRefuseCueText,
  shouldFlashHammerRefuseCue,
  shouldFlashOreCooldownRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL60.2 — Ore cooldown soft refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Settling` instead of sticky long ore prose.
 * Cooldown numbers unchanged; mute ok.
 */
describe("CityLands PL60.2 ore cooldown refuse ephemeral", () => {
  it("flashes Settling for oreNodeCooldown (happy)", () => {
    expect(oreCooldownRefuseCueText()).toBe(ORE_COOLDOWN_REFUSE_CUE);
    expect(oreCooldownRefuseCueText()).toBe("Settling");
    expect(
      shouldFlashOreCooldownRefuseCue(ACTION_ERROR.oreNodeCooldown),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.oreNodeCooldown)).toBe(true);
    expect(isCoreSuccessCueText("Settling")).toBe(true);
    expect(ACTION_ERROR.oreNodeCooldown.toLowerCase()).toMatch(/settle|ore/);
  });

  it("stays quiet for other soft refuses and gather cooldowns (edge)", () => {
    expect(shouldFlashOreCooldownRefuseCue(ACTION_ERROR.needHammer)).toBe(
      false,
    );
    expect(shouldFlashOreCooldownRefuseCue(ACTION_ERROR.cropNotReady)).toBe(
      false,
    );
    expect(shouldFlashOreCooldownRefuseCue(ACTION_ERROR.woodStumpCooldown)).toBe(
      false,
    );
    expect(shouldFlashOreCooldownRefuseCue(ACTION_ERROR.stationBusy)).toBe(
      false,
    );
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.oreNodeCooldown)).toBe(
      false,
    );
    expect(oreCooldownRefuseCueText()).not.toBe(HAMMER_REFUSE_CUE);
    expect(oreCooldownRefuseCueText()).not.toBe(CROP_NOT_READY_REFUSE_CUE);
  });

  it("refuses unrelated errors and keeps cooldown numbers unchanged (failure)", () => {
    expect(shouldFlashOreCooldownRefuseCue(null)).toBe(false);
    expect(shouldFlashOreCooldownRefuseCue(undefined)).toBe(false);
    expect(shouldFlashOreCooldownRefuseCue("")).toBe(false);
    expect(shouldFlashOreCooldownRefuseCue(ACTION_ERROR.oreNodeMissing)).toBe(
      false,
    );
    expect(oreCooldownRefuseCueText()).not.toMatch(/\d/);
    expect(oreCooldownRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.oreNodeCooldown.length,
    );
    expect(ORE_NODE.cooldownMs).toBeGreaterThan(0);
    expect(isCoreSuccessCueText(ACTION_ERROR.oreNodeCooldown)).toBe(false);
    expect(oreCooldownRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
