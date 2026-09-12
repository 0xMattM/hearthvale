import { describe, expect, it } from "vitest";
import {
  SFX_PRESETS,
  createGameAudio,
  sfxStepsFor,
  shouldPlaySfx,
  type TonePlayer,
  type ToneStep,
} from "../../apps/web/lib/game-audio";
import {
  SUCCESS_CUE_MS,
  TRADE_ACCEPT_SUCCESS_CUE,
  isCoreSuccessCueText,
  tradeAcceptSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

function mockPlayer() {
  const played: ToneStep[][] = [];
  const player: TonePlayer = {
    playSteps(steps) {
      played.push(steps);
    },
    startDrone() {
      return () => undefined;
    },
  };
  return { player, played };
}

/**
 * PL18.2 — Trade accept ephemeral TopBar cue (+ soft SFX).
 * Cancel / refuse stay silent; escrow rules unchanged.
 */
describe("CityLands PL18.2 trade accept success cue", () => {
  it("ships trade_accept SFX + Trade accepted ephemeral cue (happy)", () => {
    expect(SFX_PRESETS.trade_accept.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.trade_accept).not.toEqual(SFX_PRESETS.trade_invite);
    expect(SFX_PRESETS.trade_accept).not.toEqual(SFX_PRESETS.vendor_buy);
    expect(SFX_PRESETS.trade_accept).not.toEqual(SFX_PRESETS.refuse);

    expect(tradeAcceptSuccessCueText()).toBe(TRADE_ACCEPT_SUCCESS_CUE);
    expect(tradeAcceptSuccessCueText()).toBe("Trade accepted");
    expect(isCoreSuccessCueText(TRADE_ACCEPT_SUCCESS_CUE)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("trade_accept")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.trade_accept]);
    expect(sfxStepsFor("trade_accept")).toEqual(SFX_PRESETS.trade_accept);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.trade_accept) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat refuse / sticky trade prose as the accept cue; mute skips SFX (failure)", () => {
    expect(isCoreSuccessCueText("Trade rejected.")).toBe(false);
    expect(isCoreSuccessCueText("Trade cancelled — goods returned.")).toBe(
      false,
    );
    expect(
      isCoreSuccessCueText("Trade offer sent to bob (held in escrow)."),
    ).toBe(false);
    expect(isCoreSuccessCueText("Could not accept trade")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "trade_accept")).toBe(false);
    expect(audio.playSfx("trade_accept")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
