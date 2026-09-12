import { describe, expect, it } from "vitest";
import {
  SOCIAL_PANEL_OPEN_ACCENT_MS,
  shouldPlayChatOpenAccent,
} from "../../apps/web/lib/hud/social-panel-open-accent";
import {
  shouldAllowChatReceivePingAt,
  shouldPlayChatReceivePing,
} from "../../apps/web/lib/hud/chat-receive-ping";

/**
 * PL38.1 — Chat panel open accent (brief; C; receive ping PL27.2 still works while closed).
 */
describe("CityLands PL38.1 chat panel open accent", () => {
  it("plays accent when chat opens from closed (happy)", () => {
    expect(shouldPlayChatOpenAccent(null, "chat")).toBe(true);
    expect(shouldPlayChatOpenAccent("inventory", "chat")).toBe(true);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayChatOpenAccent("chat", "chat")).toBe(false);
    expect(shouldPlayChatOpenAccent("chat", null)).toBe(false);
    expect(shouldPlayChatOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayChatOpenAccent(null, "settings")).toBe(false);
    expect(shouldPlayChatOpenAccent("chat", "inventory")).toBe(false);
    expect(shouldPlayChatOpenAccent("mail", "notice")).toBe(false);
  });

  it("keeps receive ping while chat closed; silent when open (PL27.2 coexistence)", () => {
    expect(
      shouldPlayChatReceivePing({
        chatPanelOpen: false,
        fromUsername: "peer",
        selfUsername: "me",
      }),
    ).toBe(true);
    expect(
      shouldPlayChatReceivePing({
        chatPanelOpen: true,
        fromUsername: "peer",
        selfUsername: "me",
      }),
    ).toBe(false);
    expect(shouldAllowChatReceivePingAt(1000, null)).toBe(true);
  });
});
