import { describe, expect, it } from "vitest";
import {
  GUILD_INVITE_CLOSED_GLANCE,
  countPendingGuildInvites,
  dismissPendingGuildInvite,
  guildInviteClosedGlanceLabel,
  hasPendingGuildInvite,
  mergePendingGuildInvite,
  shouldShowGuildInviteClosedGlance,
  type PendingGuildInvite,
} from "../../apps/web/lib/hud/guild-invite-closed-glance";

/**
 * PL189.2 — Guild-invite closed glance leftover.
 * Choice: quiet TopBar G · Invite chip while an unanswered soft invite offer
 * is pending and Guild panel closed (complements accept rim + membership
 * open accent; no social column). Join-by-code SoT unchanged.
 */
describe("CityLands PL189.2 guild-invite closed glance leftover", () => {
  const one: PendingGuildInvite[] = [
    { code: "AB12CD", fromUsername: "alice", guildName: "oaks" },
  ];
  const two: PendingGuildInvite[] = [
    { code: "AB12CD", fromUsername: "alice" },
    { code: "EF34GH", fromUsername: "bob", guildName: "pines" },
  ];

  it("shows quiet G · Invite chip while unanswered and Guild closed (happy)", () => {
    expect(hasPendingGuildInvite(one)).toBe(true);
    expect(shouldShowGuildInviteClosedGlance(one, false, false)).toBe(true);
    expect(guildInviteClosedGlanceLabel(one)).toBe("G · Invite");
    expect(guildInviteClosedGlanceLabel(two)).toBe("G · Invite · 2");
    expect(countPendingGuildInvites(two)).toBe(2);

    expect(GUILD_INVITE_CLOSED_GLANCE.hotkey).toBe("G");
    expect(GUILD_INVITE_CLOSED_GLANCE.word).toBe("Invite");
    expect(GUILD_INVITE_CLOSED_GLANCE.borderColor).toBe("#78a8c0");
    expect(GUILD_INVITE_CLOSED_GLANCE.textColor).toBe("#9cc4d8");
    expect(GUILD_INVITE_CLOSED_GLANCE.className).toBe(
      "topbar-guild-invite-glance",
    );

    const merged = mergePendingGuildInvite(one, {
      code: "ef34gh",
      fromUsername: "bob",
      guildName: "pines",
    });
    expect(merged).toHaveLength(2);
    expect(merged[1]?.code).toBe("EF34GH");
  });

  it("clears when none pending, Guild open, or already in guild (edge)", () => {
    expect(shouldShowGuildInviteClosedGlance([], false, false)).toBe(false);
    expect(shouldShowGuildInviteClosedGlance(one, true, false)).toBe(false);
    expect(shouldShowGuildInviteClosedGlance(one, false, true)).toBe(false);
    expect(guildInviteClosedGlanceLabel([])).toBe("");
    expect(hasPendingGuildInvite([])).toBe(false);
    expect(dismissPendingGuildInvite(two, "ab12cd")).toEqual([
      { code: "EF34GH", fromUsername: "bob", guildName: "pines" },
    ]);
    expect(
      mergePendingGuildInvite(one, { code: "  ", fromUsername: "x" }),
    ).toEqual(one);
  });

  it("does not invent social column or change invite rules (failure)", () => {
    expect(GUILD_INVITE_CLOSED_GLANCE.className).not.toMatch(
      /column|hud-guild-column|social-column/i,
    );
    expect(guildInviteClosedGlanceLabel(one)).not.toMatch(/nft|combat/i);
    expect(shouldShowGuildInviteClosedGlance(one, false, false)).not.toBe(
      shouldShowGuildInviteClosedGlance(one, true, false),
    );
    expect(countPendingGuildInvites([{ code: "", fromUsername: "x" }])).toBe(
      0,
    );
    expect(String(GUILD_INVITE_CLOSED_GLANCE.word)).not.toMatch(
      /toast|stack|fare/i,
    );
  });
});
