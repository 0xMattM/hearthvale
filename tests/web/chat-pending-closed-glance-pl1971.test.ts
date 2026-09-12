import { describe, expect, it } from "vitest";
import {
  CHAT_PENDING_CLOSED_GLANCE,
  chatPendingClosedGlanceLabel,
  clearPendingChatGlanceLines,
  countPendingChatGlanceLines,
  hasPendingChatGlance,
  mergePendingChatGlanceLine,
  shouldShowChatPendingClosedGlance,
  shouldStageChatPendingClosedGlance,
  type PendingChatGlanceLine,
} from "../../apps/web/lib/hud/chat-pending-closed-glance";

/**
 * PL197.1 — Chat-pending closed glance leftover.
 * Choice: quiet TopBar C · Chat chip while unread world/guild lines arrived
 * and Chat panel closed (complements receive ping; no chat column). Chat
 * rules SoT unchanged.
 */
describe("CityLands PL197.1 chat-pending closed glance leftover", () => {
  const one: PendingChatGlanceLine[] = [
    { id: "msg-1", channel: "world" },
  ];
  const two: PendingChatGlanceLine[] = [
    { id: "msg-1", channel: "world" },
    { id: "msg-2", channel: "guild" },
  ];

  it("shows quiet C · Chat chip while unread pending and Chat closed (happy)", () => {
    expect(hasPendingChatGlance(one)).toBe(true);
    expect(shouldShowChatPendingClosedGlance(one, false)).toBe(true);
    expect(chatPendingClosedGlanceLabel(one)).toBe("C · Chat");
    expect(chatPendingClosedGlanceLabel(two)).toBe("C · Chat · 2");
    expect(countPendingChatGlanceLines(two)).toBe(2);

    expect(CHAT_PENDING_CLOSED_GLANCE.hotkey).toBe("C");
    expect(CHAT_PENDING_CLOSED_GLANCE.word).toBe("Chat");
    expect(CHAT_PENDING_CLOSED_GLANCE.borderColor).toBe("#78b8a0");
    expect(CHAT_PENDING_CLOSED_GLANCE.textColor).toBe("#a0d8c0");
    expect(CHAT_PENDING_CLOSED_GLANCE.className).toBe("topbar-chat-glance");

    expect(
      shouldStageChatPendingClosedGlance({
        messageId: "msg-9",
        fromUsername: "alice",
        selfUsername: "bob",
      }),
    ).toBe(true);

    const merged = mergePendingChatGlanceLine(one, {
      id: "msg-2",
      channel: "guild",
    });
    expect(merged).toHaveLength(2);
    expect(merged[1]?.channel).toBe("guild");
  });

  it("clears when none pending or Chat panel open; ignores own lines (edge)", () => {
    expect(shouldShowChatPendingClosedGlance([], false)).toBe(false);
    expect(shouldShowChatPendingClosedGlance(one, true)).toBe(false);
    expect(chatPendingClosedGlanceLabel([])).toBe("");
    expect(hasPendingChatGlance([])).toBe(false);
    expect(clearPendingChatGlanceLines()).toEqual([]);
    expect(
      shouldStageChatPendingClosedGlance({
        messageId: "msg-1",
        fromUsername: "bob",
        selfUsername: "bob",
      }),
    ).toBe(false);
    expect(
      shouldStageChatPendingClosedGlance({
        messageId: "",
        fromUsername: "alice",
        selfUsername: "bob",
      }),
    ).toBe(false);
    expect(
      mergePendingChatGlanceLine(one, { id: "  ", channel: "world" }),
    ).toEqual(one);
  });

  it("does not invent chat column or change chat rules (failure)", () => {
    expect(CHAT_PENDING_CLOSED_GLANCE.className).not.toMatch(
      /column|hud-chat-column|always-on/i,
    );
    expect(chatPendingClosedGlanceLabel(one)).not.toMatch(/nft|combat/i);
    expect(shouldShowChatPendingClosedGlance(one, false)).not.toBe(
      shouldShowChatPendingClosedGlance(one, true),
    );
    expect(
      countPendingChatGlanceLines([{ id: "", channel: "world" }]),
    ).toBe(0);
    expect(String(CHAT_PENDING_CLOSED_GLANCE.word)).not.toMatch(
      /toast|stack|fare/i,
    );
  });
});
