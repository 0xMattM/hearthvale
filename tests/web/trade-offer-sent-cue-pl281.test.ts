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
  TRADE_OFFER_SENT_CUE_PREFIX,
  isCoreSuccessCueText,
  tradeOfferSentCueText,
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
 * PL28.1 — Trade offer sent soft SFX + ephemeral TopBar cue.
 * Escrow rules unchanged; fail silent; sticky escrow prose replaced.
 */
describe("CityLands PL28.1 trade offer sent cue", () => {
  it("ships trade_offer SFX + Offer · to cue on send (happy)", () => {
    expect(SFX_PRESETS.trade_offer.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.trade_offer).not.toEqual(SFX_PRESETS.trade_invite);
    expect(SFX_PRESETS.trade_offer).not.toEqual(SFX_PRESETS.trade_accept);
    expect(SFX_PRESETS.trade_offer).not.toEqual(SFX_PRESETS.vendor_buy);

    const cue = tradeOfferSentCueText("bob");
    expect(cue).toBe("Offer · bob");
    expect(cue?.startsWith(TRADE_OFFER_SENT_CUE_PREFIX)).toBe(true);
    expect(isCoreSuccessCueText(cue)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("trade_offer")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.trade_offer]);
    expect(sfxStepsFor("trade_offer")).toEqual(SFX_PRESETS.trade_offer);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.trade_offer) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    expect(tradeOfferSentCueText("  alice  ")).toBe("Offer · alice");
  });

  it("stays silent on empty to-user and mute; sticky escrow prose is not the cue (failure)", () => {
    expect(tradeOfferSentCueText("")).toBeNull();
    expect(tradeOfferSentCueText("   ")).toBeNull();
    expect(tradeOfferSentCueText(null)).toBeNull();
    expect(tradeOfferSentCueText(undefined)).toBeNull();
    expect(
      isCoreSuccessCueText("Trade offer sent to bob (held in escrow)."),
    ).toBe(false);
    expect(isCoreSuccessCueText("Trade · bob")).toBe(true);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "trade_offer")).toBe(false);
    expect(audio.playSfx("trade_offer")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
