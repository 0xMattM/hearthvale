import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  HAMMER_REFUSE_CUE,
  hammerRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashHammerRefuseCue,
  shouldFlashBusyStationCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL58.1 — Hammer refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Hammer` instead of sticky long need-hammer prose.
 * Tool / ore chip rules unchanged; mute ok.
 */
describe("CityLands PL58.1 hammer refuse ephemeral", () => {
  it("flashes Hammer for needHammer / needHammerBroken (happy)", () => {
    expect(hammerRefuseCueText()).toBe(HAMMER_REFUSE_CUE);
    expect(hammerRefuseCueText()).toBe("Hammer");
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.needHammer)).toBe(true);
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.needHammerBroken)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.needHammer)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needHammerBroken)).toBe(true);
    expect(isCoreSuccessCueText("Hammer")).toBe(true);
    expect(ACTION_ERROR.needHammer.toLowerCase()).toMatch(/hammer|equip/);
  });

  it("stays quiet for other soft refuses (edge)", () => {
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.stationBusy)).toBe(false);
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(
      false,
    );
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.tooFar)).toBe(false);
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.notEnoughCoins)).toBe(
      false,
    );
    expect(shouldFlashBusyStationCue(ACTION_ERROR.needHammer)).toBe(false);
  });

  it("refuses unrelated errors and keeps ore chip rules unchanged (failure)", () => {
    expect(shouldFlashHammerRefuseCue(null)).toBe(false);
    expect(shouldFlashHammerRefuseCue(undefined)).toBe(false);
    expect(shouldFlashHammerRefuseCue("")).toBe(false);
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.oreNodeCooldown)).toBe(
      false,
    );
    expect(hammerRefuseCueText()).not.toMatch(/\d/);
    expect(hammerRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.needHammer.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.needHammer)).toBe(false);
    expect(hammerRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
