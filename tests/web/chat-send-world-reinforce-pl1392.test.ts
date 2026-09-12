import { describe, expect, it } from "vitest";
import {
  CHAT_SEND_WORLD_REINFORCE,
  chatSendWorldReinforceBackground,
  shouldFlashChatSendWorldReinforce,
} from "../../apps/web/lib/hud/chat-send-feedback";
import {
  MARKET_LIST_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/market-list-feedback";
import {
  VISIT_HOME_RETURN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/visit-home-return-feedback";
import {
  CHAT_RECEIVE_SUCCESS_CUE,
  CHAT_SEND_SUCCESS_CUE,
  chatSendSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL139.2 — Chat-send soft confirm leftover.
 * Brief quiet social rim on send ok (complements Sent PL62.2 + receive Chat PL27.2).
 * Chat rules unchanged; mute ok; fail silent.
 * Choice: quieter one-shot seafoam rim (not another Sent toast) so send stays
 * world-readable beside the existing ephemeral.
 */
describe("CityLands PL139.2 chat-send soft confirm leftover", () => {
  it("flashes quiet social rim when send succeeds (happy)", () => {
    expect(shouldFlashChatSendWorldReinforce(true)).toBe(true);
    expect(CHAT_SEND_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(CHAT_SEND_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = chatSendWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(CHAT_SEND_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Sent ephemeral.
    expect(chatSendSuccessCueText()).toBe(CHAT_SEND_SUCCESS_CUE);
    expect(chatSendSuccessCueText()).toBe("Sent");
    expect(chatSendSuccessCueText()).not.toBe(CHAT_RECEIVE_SUCCESS_CUE);
  });

  it("stays quiet on fail; rim quieter / ≠ market teal / home meadow (edge)", () => {
    expect(shouldFlashChatSendWorldReinforce(false)).toBe(false);

    expect(CHAT_SEND_WORLD_REINFORCE.outerRgba).not.toBe(
      MARKET_LIST_WORLD_REINFORCE.outerRgba,
    );
    expect(CHAT_SEND_WORLD_REINFORCE.outerRgba).not.toBe(
      VISIT_HOME_RETURN_WORLD_REINFORCE.outerRgba,
    );
    expect(CHAT_SEND_WORLD_REINFORCE.opacityPeak).toBeLessThan(
      VISIT_HOME_RETURN_WORLD_REINFORCE.opacityPeak,
    );
    expect(CHAT_SEND_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
    expect(CHAT_SEND_WORLD_REINFORCE.clearPct).toBeLessThan(
      CHAT_SEND_WORLD_REINFORCE.midPct,
    );
  });

  it("does not invent chat columns; keeps ok gate (failure)", () => {
    expect(chatSendWorldReinforceBackground()).not.toMatch(
      /chat\s*column|always.?on/i,
    );
    expect(String(CHAT_SEND_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(CHAT_SEND_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashChatSendWorldReinforce(true)).not.toBe(
      shouldFlashChatSendWorldReinforce(false),
    );
  });
});
