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
  TRADE_INVITE_RECEIVE_CUE_PREFIX,
  isCoreSuccessCueText,
  tradeInviteReceiveCueText,
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
 * PL18.1 — Trade invite receive soft SFX + ephemeral TopBar cue.
 */
describe("CityLands PL18.1 trade invite receive cue", () => {
  it("ships trade_invite SFX + Trade · from cue on receive (happy)", () => {
    expect(SFX_PRESETS.trade_invite.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.trade_invite).not.toEqual(SFX_PRESETS.visit);
    expect(SFX_PRESETS.trade_invite).not.toEqual(SFX_PRESETS.vendor_buy);
    expect(SFX_PRESETS.trade_invite).not.toEqual(SFX_PRESETS.trade_accept);

    const cue = tradeInviteReceiveCueText("alice");
    expect(cue).toBe("Trade · alice");
    expect(cue?.startsWith(TRADE_INVITE_RECEIVE_CUE_PREFIX)).toBe(true);
    expect(isCoreSuccessCueText(cue)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("trade_invite")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.trade_invite]);
    expect(sfxStepsFor("trade_invite")).toEqual(SFX_PRESETS.trade_invite);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.trade_invite) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    expect(tradeInviteReceiveCueText("  bob  ")).toBe("Trade · bob");
  });

  it("stays silent on empty from-user and mute; sticky prose is not the cue (failure)", () => {
    expect(tradeInviteReceiveCueText("")).toBeNull();
    expect(tradeInviteReceiveCueText("   ")).toBeNull();
    expect(tradeInviteReceiveCueText(null)).toBeNull();
    expect(tradeInviteReceiveCueText(undefined)).toBeNull();
    expect(
      isCoreSuccessCueText("Trade invite from alice — press T to review."),
    ).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "trade_invite")).toBe(false);
    expect(audio.playSfx("trade_invite")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
