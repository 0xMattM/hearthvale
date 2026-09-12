import { describe, expect, it } from "vitest";
import {
  SOCIAL_DESK,
  GAME_DESK,
  chatDeskEmptyNote,
  formatChatLineTime,
  gameDeskClassName,
  gameDeskHotkeys,
  mailInboxHeading,
  mailSentHeading,
  socialDeskClassName,
  tradeOfferKindLabel,
  tradePendingHeading,
} from "../../apps/web/lib/hud/social-desk-chrome";

describe("social desk chrome", () => {
  it("names Mail / Chat / Trade desks with L C T keys (happy)", () => {
    expect(SOCIAL_DESK.mail.hotkey).toBe("L");
    expect(SOCIAL_DESK.chat.hotkey).toBe("C");
    expect(SOCIAL_DESK.trade.hotkey).toBe("T");
    expect(SOCIAL_DESK.mail.title).toBe("Mail");
    expect(SOCIAL_DESK.chat.title).toBe("Chat");
    expect(SOCIAL_DESK.trade.title).toBe("Trade");
    expect(socialDeskClassName("mail", ["mail-panel--unread"])).toContain(
      "social-desk",
    );
    expect(socialDeskClassName("chat")).toContain("chat-panel");
    expect(mailInboxHeading(2)).toBe("Inbox · 2");
    expect(tradePendingHeading(1)).toBe("Pending · 1");
    expect(chatDeskEmptyNote("world", false)).toBe("The square is quiet.");
    expect(formatChatLineTime(new Date(2026, 0, 1, 9, 5).getTime())).toBe(
      "09:05",
    );
  });

  it("keeps empty and zero counts quiet (edge)", () => {
    expect(mailInboxHeading(0)).toBe("Inbox");
    expect(mailSentHeading(0)).toBe("On the way");
    expect(mailSentHeading(3)).toBe("On the way · 3");
    expect(tradePendingHeading(0)).toBe("Pending");
    expect(chatDeskEmptyNote("guild", true)).toBe("No guild messages yet.");
    expect(tradeOfferKindLabel("outgoing")).toBe("Your offer");
    expect(socialDeskClassName("trade", [false, null])).toBe(
      "panel social-desk social-desk--trade trade-panel",
    );
  });

  it("does not invent clocks or drop desk keys on bad input (failure)", () => {
    expect(formatChatLineTime(0)).toBe("");
    expect(formatChatLineTime(-12)).toBe("");
    expect(formatChatLineTime(Number.NaN)).toBe("");
    expect(mailInboxHeading(Number.NaN)).toBe("Inbox");
    expect(chatDeskEmptyNote("guild", false)).toMatch(/guild/i);
    expect(SOCIAL_DESK.trade.title.toLowerCase()).not.toBe("player trade");
    expect(socialDeskClassName("mail")).not.toMatch(/enter the land/i);
    expect(tradeOfferKindLabel("incoming")).toBe("Incoming");
  });
});

describe("game desk chrome", () => {
  it("names remaining menus with I N H G J B M P V keys (happy)", () => {
    expect(GAME_DESK.inventory.hotkey).toBe("I");
    expect(GAME_DESK.travel.hotkey).toBe("N");
    expect(GAME_DESK.settings.hotkey).toBe("H");
    expect(GAME_DESK.guild.hotkey).toBe("G");
    expect(GAME_DESK.achievements.hotkey).toBe("J");
    expect(GAME_DESK.creditcoin.hotkey).toBe("B");
    expect(GAME_DESK.realmMarket.hotkey).toBe("E");
    expect(GAME_DESK.realmMarket.title).toBe("REALM Market");
    expect(GAME_DESK.market.hotkey).toBe("M");
    expect(GAME_DESK.build.hotkey).toBe("P");
    expect(GAME_DESK.visit.hotkey).toBe("V");
    expect(GAME_DESK.quests.hotkey).toBe("Q");
    expect(gameDeskClassName("inventory-panel")).toContain("social-desk");
    expect(gameDeskClassName("travel-panel", ["travel-panel--map-open"])).toContain(
      "travel-panel--map-open",
    );
    expect(gameDeskHotkeys()).toEqual(
      expect.arrayContaining(["I", "N", "H", "G", "J", "B", "M", "P", "V", "Q", "E"]),
    );
  });

  it("keeps a blank panel class as a generic desk (edge)", () => {
    expect(gameDeskClassName("")).toBe("panel social-desk");
    expect(gameDeskClassName("   ")).toBe("panel social-desk");
    expect(gameDeskClassName("guild-panel", [false, null])).toBe(
      "panel social-desk guild-panel",
    );
    expect(GAME_DESK.vendor.hotkey).toBe("E");
    expect(GAME_DESK.craft.title).toBe("Craft");
  });

  it("does not drop desk chrome or invent a blank panel class (failure)", () => {
    expect(gameDeskClassName("")).not.toContain("undefined");
    expect(gameDeskClassName("settings-panel")).toMatch(/settings-panel/);
    expect(gameDeskClassName("settings-panel")).not.toMatch(/enter the land/i);
    expect(GAME_DESK.achievements.lede.toLowerCase()).toMatch(/cosmetic|never combat/);
    expect(GAME_DESK.creditcoin.lede.toLowerCase()).toMatch(/stall/);
    expect(gameDeskHotkeys()).not.toContain("");
  });
});
