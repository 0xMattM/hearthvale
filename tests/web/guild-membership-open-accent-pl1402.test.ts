import { describe, expect, it } from "vitest";
import {
  INVENTORY_OPEN_ACCENT_MS,
  shouldPlayGuildMembershipOpenAccent,
  shouldPlayGuildOpenAccent,
} from "../../apps/web/lib/hud/inventory-open-accent";

/**
 * PL140.2 — Guild panel soft open accent with membership.
 * Choice: cooler membership-tinted open accent when G opens while already in
 * a guild (complements Created/Joined PL50.1); non-members keep PL46.1 gold;
 * guild rules unchanged; mute ok; min HUD.
 */
describe("CityLands PL140.2 guild membership open accent", () => {
  it("plays membership accent when guild opens while member (happy)", () => {
    expect(shouldPlayGuildMembershipOpenAccent(null, "guild", true)).toBe(
      true,
    );
    expect(
      shouldPlayGuildMembershipOpenAccent("inventory", "guild", true),
    ).toBe(true);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips membership accent without membership or when not opening (edge)", () => {
    expect(shouldPlayGuildMembershipOpenAccent(null, "guild", false)).toBe(
      false,
    );
    expect(shouldPlayGuildMembershipOpenAccent(null, "guild", null as never)).toBe(
      false,
    );
    expect(shouldPlayGuildMembershipOpenAccent("guild", "guild", true)).toBe(
      false,
    );
    expect(shouldPlayGuildMembershipOpenAccent("guild", null, true)).toBe(
      false,
    );
    // Non-members still get generic PL46.1 open gate.
    expect(shouldPlayGuildOpenAccent(null, "guild")).toBe(true);
  });

  it("refuses membership accent for unrelated panels (failure)", () => {
    expect(
      shouldPlayGuildMembershipOpenAccent(null, "settings", true),
    ).toBe(false);
    expect(
      shouldPlayGuildMembershipOpenAccent(null, "achievements", true),
    ).toBe(false);
    expect(
      shouldPlayGuildMembershipOpenAccent("guild", "inventory", true),
    ).toBe(false);
    expect(String(INVENTORY_OPEN_ACCENT_MS)).not.toMatch(/nft|combat/i);
  });
});
