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
  CHAT_RECEIVE_SUCCESS_CUE,
  chatReceiveSuccessCueText,
  isCoreSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import {
  CHAT_RECEIVE_PING_COOLDOWN_MS,
  shouldAllowChatReceivePingAt,
  shouldPlayChatReceivePing,
} from "../../apps/web/lib/hud/chat-receive-ping";

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
 * PL27.2 — Quiet chat receive SFX (+ ephemeral) while panel closed.
 */
describe("CityLands PL27.2 chat receive soft ping", () => {
  it("ships chat SFX + Chat cue when panel closed for peer line (happy)", () => {
    expect(SFX_PRESETS.chat.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.chat).not.toEqual(SFX_PRESETS.trade_invite);
    expect(SFX_PRESETS.chat).not.toEqual(SFX_PRESETS.visit);

    expect(
      shouldPlayChatReceivePing({
        chatPanelOpen: false,
        fromUsername: "alice",
        selfUsername: "bob",
      }),
    ).toBe(true);

    const cue = chatReceiveSuccessCueText();
    expect(cue).toBe("Chat");
    expect(cue).toBe(CHAT_RECEIVE_SUCCESS_CUE);
    expect(isCoreSuccessCueText(cue)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("chat")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.chat]);
    expect(sfxStepsFor("chat")).toEqual(SFX_PRESETS.chat);
  });

  it("keeps soft gain, cooldown, and brief SUCCESS_CUE_MS (edge)", () => {
    for (const step of SFX_PRESETS.chat) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    expect(CHAT_RECEIVE_PING_COOLDOWN_MS).toBeGreaterThanOrEqual(800);
    expect(CHAT_RECEIVE_PING_COOLDOWN_MS).toBeLessThanOrEqual(3000);
    expect(shouldAllowChatReceivePingAt(1000, null)).toBe(true);
    expect(shouldAllowChatReceivePingAt(1000, 1000)).toBe(false);
    expect(
      shouldAllowChatReceivePingAt(
        1000 + CHAT_RECEIVE_PING_COOLDOWN_MS,
        1000,
      ),
    ).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("stays silent when panel open, own echo, empty from, or mute (failure)", () => {
    expect(
      shouldPlayChatReceivePing({
        chatPanelOpen: true,
        fromUsername: "alice",
        selfUsername: "bob",
      }),
    ).toBe(false);
    expect(
      shouldPlayChatReceivePing({
        chatPanelOpen: false,
        fromUsername: "bob",
        selfUsername: "bob",
      }),
    ).toBe(false);
    expect(
      shouldPlayChatReceivePing({
        chatPanelOpen: false,
        fromUsername: "  Bob  ",
        selfUsername: "bob",
      }),
    ).toBe(false);
    expect(
      shouldPlayChatReceivePing({
        chatPanelOpen: false,
        fromUsername: "",
        selfUsername: "bob",
      }),
    ).toBe(false);
    expect(
      shouldPlayChatReceivePing({
        chatPanelOpen: false,
        fromUsername: null,
        selfUsername: "bob",
      }),
    ).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "chat")).toBe(false);
    expect(audio.playSfx("chat")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
