/**
 * Guild-invite closed glance (PL189.2).
 * Quiet TopBar/G chip while an unanswered guild invite offer is pending and
 * Guild panel closed — complements accept rim PL148.2 + membership open
 * accent PL140.2; no always-on social column. Invite / join-by-code rules
 * unchanged; clears when none pending or panel open; mute ok.
 */

/** Soft pending guild invite offer (client-staged from WS soft ping). */
export interface PendingGuildInvite {
  /** Existing guild invite code (join-by-code SoT). */
  code: string;
  /** Officer / owner who offered. */
  fromUsername: string;
  /** Optional guild name for panel copy. */
  guildName?: string;
}

/**
 * Soft closed-glance chip chrome (PL189.2).
 * Cool kinship with membership open accent / invite-accept rim — not a
 * permanent Guild column.
 */
export const GUILD_INVITE_CLOSED_GLANCE = {
  /** Hotkey letter (KEYBINDS KeyG). */
  hotkey: "G",
  /** Quiet chip word — invite glance, not a Guild column. */
  word: "Invite",
  borderColor: "#78a8c0",
  textColor: "#9cc4d8",
  className: "topbar-guild-invite-glance",
} as const;

/**
 * Count unanswered pending guild invite offers (PL189.2).
 *
 * @param invites - Staged pending invite offers.
 * @returns Number of pending invites with a non-empty code.
 */
export function countPendingGuildInvites(
  invites: ReadonlyArray<PendingGuildInvite>,
): number {
  let n = 0;
  for (const inv of invites) {
    if (inv.code.trim().length > 0) n += 1;
  }
  return n;
}

/**
 * Whether any unanswered guild invite offer is pending (PL189.2).
 *
 * @param invites - Staged pending invite offers.
 * @returns True when at least one invite has a code.
 */
export function hasPendingGuildInvite(
  invites: ReadonlyArray<PendingGuildInvite>,
): boolean {
  return countPendingGuildInvites(invites) > 0;
}

/**
 * Whether the closed guild-invite glance chip should render (PL189.2).
 * True only while an unanswered offer is pending, Guild panel is closed,
 * and the player is not already in a guild.
 *
 * @param invites - Staged pending invite offers.
 * @param guildPanelOpen - True when the Guild panel is the open contextual panel.
 * @param alreadyInGuild - True when the player already has membership.
 * @returns True when the quiet TopBar/G chip should show.
 */
export function shouldShowGuildInviteClosedGlance(
  invites: ReadonlyArray<PendingGuildInvite>,
  guildPanelOpen: boolean,
  alreadyInGuild: boolean,
): boolean {
  if (guildPanelOpen) return false;
  if (alreadyInGuild) return false;
  return hasPendingGuildInvite(invites);
}

/**
 * Compact chip label for pending closed glance (PL189.2).
 * `G · Invite` or `G · Invite · N` when more than one unanswered offer.
 *
 * @param invites - Staged pending invite offers.
 * @returns Chip text; empty string when nothing pending (caller should gate).
 */
export function guildInviteClosedGlanceLabel(
  invites: ReadonlyArray<PendingGuildInvite>,
): string {
  const n = countPendingGuildInvites(invites);
  if (n <= 0) return "";
  const { hotkey, word } = GUILD_INVITE_CLOSED_GLANCE;
  if (n > 1) return `${hotkey} · ${word} · ${n}`;
  return `${hotkey} · ${word}`;
}

/**
 * Merge a newly received soft invite into the pending list (PL189.2).
 * Dedupes by code (case-insensitive); newest fromUsername / guildName wins.
 * Invite / join rules unchanged.
 *
 * @param current - Existing pending invites.
 * @param incoming - Soft invite just received.
 * @returns Next pending list.
 */
export function mergePendingGuildInvite(
  current: ReadonlyArray<PendingGuildInvite>,
  incoming: PendingGuildInvite,
): PendingGuildInvite[] {
  const code = incoming.code.trim().toUpperCase();
  const fromUsername = incoming.fromUsername.trim();
  if (!code || !fromUsername) return [...current];
  const next: PendingGuildInvite = {
    code,
    fromUsername,
    ...(incoming.guildName?.trim()
      ? { guildName: incoming.guildName.trim() }
      : null),
  };
  const without = current.filter(
    (inv) => inv.code.trim().toUpperCase() !== code,
  );
  return [...without, next];
}

/**
 * Drop a pending invite by code after join ok or dismiss (PL189.2).
 *
 * @param current - Existing pending invites.
 * @param code - Invite code to remove.
 * @returns Next pending list.
 */
export function dismissPendingGuildInvite(
  current: ReadonlyArray<PendingGuildInvite>,
  code: string,
): PendingGuildInvite[] {
  const cleaned = code.trim().toUpperCase();
  if (!cleaned) return [...current];
  return current.filter((inv) => inv.code.trim().toUpperCase() !== cleaned);
}
