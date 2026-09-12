import { describe, expect, it } from "vitest";
import {
  GAME_INTRO,
  GAME_KICKER,
  GAME_TAGLINE,
  GAME_TITLE,
  TITLE_COVER_GATE,
  TITLE_COVER_PILLARS,
  isPlaceholderGateCopy,
  isTitleCoverIntroComplete,
  titleCoverAuthLabel,
  titleCoverDocumentTitle,
} from "../../apps/web/lib/title-cover";

describe("title cover identity", () => {
  it("names Hearthvale and welcomes settlers onto the four maps (happy)", () => {
    expect(GAME_TITLE).toBe("Hearthvale");
    expect(isPlaceholderGateCopy(GAME_TITLE)).toBe(false);
    expect(isTitleCoverIntroComplete(GAME_INTRO)).toBe(true);
    expect(GAME_INTRO).toMatch(/City/i);
    expect(GAME_INTRO).toMatch(/land/i);
    expect(GAME_INTRO).toMatch(/Warrior/i);
    expect(TITLE_COVER_PILLARS.map((p) => p.word)).toEqual([
      "City",
      "Land",
      "Explore",
      "Arena",
    ]);
    expect(titleCoverDocumentTitle()).toBe("Hearthvale");
    expect(titleCoverAuthLabel("login", false)).toBe(TITLE_COVER_GATE.login);
    expect(GAME_KICKER).toMatch(/Realm/i);
    expect(GAME_TAGLINE.length).toBeGreaterThan(12);
  });

  it("falls back on blank titles and keeps gate labels while busy (edge)", () => {
    expect(titleCoverDocumentTitle("   ")).toBe("Hearthvale");
    expect(titleCoverDocumentTitle("Hearthvale ")).toBe("Hearthvale");
    expect(isTitleCoverIntroComplete("Too short.")).toBe(false);
    expect(isTitleCoverIntroComplete("The City waits.")).toBe(false);
    expect(titleCoverAuthLabel("login", true)).toBe(TITLE_COVER_GATE.busyLogin);
    expect(titleCoverAuthLabel("register", true)).toBe(
      TITLE_COVER_GATE.busyRegister,
    );
    expect(TITLE_COVER_PILLARS).toHaveLength(4);
    expect(TITLE_COVER_GATE.usernameLabel.length).toBeGreaterThan(0);
  });

  it("rejects leftover untitled chrome as cover copy (failure)", () => {
    expect(isPlaceholderGateCopy("Enter the land")).toBe(true);
    expect(isPlaceholderGateCopy("Game MVP")).toBe(true);
    expect(isPlaceholderGateCopy("game")).toBe(true);
    expect(isPlaceholderGateCopy(GAME_TITLE)).toBe(false);
    expect(isPlaceholderGateCopy(TITLE_COVER_GATE.heading)).toBe(false);
    expect(isTitleCoverIntroComplete("")).toBe(false);
    expect(titleCoverAuthLabel("register", false)).not.toBe("Register");
    expect(GAME_TITLE.toLowerCase()).not.toBe("game mvp");
  });
});
