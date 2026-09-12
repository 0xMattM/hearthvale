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
  CHAT_RECEIVE_SUCCESS_CUE,
  CHAT_SEND_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  chatSendSuccessCueText,
  isCoreSuccessCueText,
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
 * PL62.2 — Chat send brief cue.
 * Soft `chat` SFX + ephemeral `Sent` on successful send;
 * complements receive `Chat` (PL27.2); chat rules unchanged; mute ok.
 */
describe("CityLands PL62.2 chat send brief cue", () => {
  it("ships chat SFX + Sent cue distinct from receive Chat (happy)", () => {
    expect(SFX_PRESETS.chat.length).toBeGreaterThan(0);
    expect(chatSendSuccessCueText()).toBe(CHAT_SEND_SUCCESS_CUE);
    expect(chatSendSuccessCueText()).toBe("Sent");
    expect(isCoreSuccessCueText("Sent")).toBe(true);
    expect(chatSendSuccessCueText()).not.toBe(CHAT_RECEIVE_SUCCESS_CUE);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("chat")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.chat]);
    expect(sfxStepsFor("chat")).toEqual(SFX_PRESETS.chat);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.chat) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    expect(isCoreSuccessCueText(CHAT_RECEIVE_SUCCESS_CUE)).toBe(true);
  });

  it("mutes SFX and rejects sticky send prose (failure)", () => {
    expect(isCoreSuccessCueText("Message sent.")).toBe(false);
    expect(isCoreSuccessCueText("Sent forever sticky")).toBe(false);
    expect(chatSendSuccessCueText().toLowerCase()).not.toMatch(
      /always-on|nft|combat/,
    );

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "chat")).toBe(false);
    expect(audio.playSfx("chat")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
