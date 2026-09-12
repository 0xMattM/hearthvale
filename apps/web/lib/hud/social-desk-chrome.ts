/**
 * Shared chrome for in-game social desks (L Mail, C Chat, T Trade).
 * Open-accent / escrow / unread rules stay in their own modules.
 */

export const SOCIAL_DESK = {
  mail: {
    hotkey: "L",
    kicker: "Post desk",
    title: "Mail",
    lede: "Send a parcel. They claim it when they next sit down.",
  },
  chat: {
    hotkey: "C",
    kicker: "Plaza talk",
    title: "Chat",
    lede: "World is the square. Guild stays among your company.",
  },
  trade: {
    hotkey: "T",
    kicker: "Escrow desk",
    title: "Trade",
    lede: "Offer goods, tools, or coins. Held until they accept or you cancel.",
  },
} as const;

export type SocialDeskKind = keyof typeof SOCIAL_DESK;

/** Remaining in-game menus — same chrome family as Mail / Chat / Trade. */
export const GAME_DESK = {
  inventory: {
    hotkey: "I",
    kicker: "Satchel",
    title: "Inventory",
    lede: "Eat, equip, repair, or place a kit from your bag.",
  },
  travel: {
    hotkey: "N",
    kicker: "Four maps",
    title: "Travel",
    lede: "City, land, wilds, and the optional arena — free, instant.",
  },
  settings: {
    hotkey: "H",
    kicker: "Help",
    title: "Settings",
    lede: "Preferences stay on this device. Keybinds are listed below.",
  },
  guild: {
    hotkey: "G",
    kicker: "Company",
    title: "Guild",
    lede: "Invite codes and a shared stackable bank. No wars yet.",
  },
  achievements: {
    hotkey: "J",
    kicker: "Deeds of note",
    title: "Achievements",
    lede: "Long-term goals. Unlocks are cosmetic — never combat power.",
  },
  creditcoin: {
    hotkey: "B",
    kicker: "Realm desk",
    title: "Creditcoin",
    lede: "Wallet, land NFTs, swaps, contracts. Listings are at the indigo stall.",
  },
  realmMarket: {
    hotkey: "E",
    kicker: "Indigo stall",
    title: "REALM Market",
    lede: "List or buy stackables for REALM. Ownership only — never combat.",
  },
  deeds: {
    hotkey: "B",
    kicker: "Deed desk",
    title: "Deeds",
    lede: "Stub land papers and the on-chain price mirror.",
  },
  vendor: {
    hotkey: "E",
    kicker: "Stall",
    title: "Vendor",
    lede: "NPC prices for this map. Player goods list at the market.",
  },
  market: {
    hotkey: "M",
    kicker: "Player board",
    title: "Market",
    lede: "List or buy stackables. Fees and TTL stay as posted.",
  },
  craft: {
    hotkey: "E",
    kicker: "Recipe book",
    title: "Craft",
    lede: "Start a recipe, wait, then Collect.",
  },
  build: {
    hotkey: "P",
    kicker: "Homestead",
    title: "Land editor",
    lede: "Click stations to move or pick up. Place kits from your bag.",
  },
  visit: {
    hotkey: "V",
    kicker: "Guest path",
    title: "Visit",
    lede: "Walk their land. Plant stays home — trade with T.",
  },
  decor: {
    hotkey: "E",
    kicker: "Housing",
    title: "Decor",
    lede: "Cosmetic only — never changes combat power.",
  },
  plant: {
    hotkey: "E",
    kicker: "Field",
    title: "Plant",
    lede: "Crops wait different times and sell for different prices.",
  },
  notice: {
    hotkey: "E",
    kicker: "City board",
    title: "Notices",
    lede: "Static tips for new arrivals — not a live events feed.",
  },
  arena: {
    hotkey: "E",
    kicker: "Optional path",
    title: "Arena",
    lede: "Warrior is optional. Leave whenever you like.",
  },
  quests: {
    hotkey: "Q",
    kicker: "City tutors",
    title: "Quest Board",
    lede: "Rewards are claimed by talking to the NPC, never here.",
  },
} as const;

export type GameDeskKind = keyof typeof GAME_DESK;

/**
 * Class list for a social desk panel (keeps legacy `{kind}-panel` hooks).
 *
 * @param kind - Mail, chat, or trade desk.
 * @param extras - Optional state classes (unread, open-accent).
 * @returns Space-joined class names.
 */
export function socialDeskClassName(
  kind: SocialDeskKind,
  extras: ReadonlyArray<string | false | null | undefined> = [],
): string {
  return [
    "panel",
    "social-desk",
    `social-desk--${kind}`,
    `${kind}-panel`,
    ...extras,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Class list for any remaining game menu (Inventory, Travel, Guild, …).
 *
 * @param panelClass - Legacy `{name}-panel` hook class.
 * @param extras - Optional state classes (open-accent, unread).
 * @returns Space-joined class names including `social-desk`.
 */
export function gameDeskClassName(
  panelClass: string,
  extras: ReadonlyArray<string | false | null | undefined> = [],
): string {
  const name = panelClass.trim();
  if (!name) return "panel social-desk";
  return ["panel", "social-desk", name, ...extras].filter(Boolean).join(" ");
}

/**
 * Hotkeys advertised on remaining desks (plus L/C/T).
 *
 * @returns Unique key chips used by GAME_DESK.
 */
export function gameDeskHotkeys(): string[] {
  return [...new Set(Object.values(GAME_DESK).map((desk) => desk.hotkey))];
}

/**
 * Inbox section label with pending count.
 *
 * @param count - Pending inbox parcels.
 * @returns Heading such as `Inbox · 2`.
 */
export function mailInboxHeading(count: number): string {
  const n = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return n > 0 ? `Inbox · ${n}` : "Inbox";
}

/**
 * Sent-pending section label.
 *
 * @param count - Outbound parcels still waiting.
 * @returns Heading such as `Sent · 1`.
 */
export function mailSentHeading(count: number): string {
  const n = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return n > 0 ? `On the way · ${n}` : "On the way";
}

/**
 * Empty copy for the chat log.
 *
 * @param channel - World or guild.
 * @param inGuild - Whether the player has a guild.
 * @returns Empty-state line.
 */
export function chatDeskEmptyNote(
  channel: "world" | "guild",
  inGuild: boolean,
): string {
  if (channel === "guild" && !inGuild) return "Join a guild to use guild chat.";
  if (channel === "guild") return "No guild messages yet.";
  return "The square is quiet.";
}

/**
 * Compact clock for a chat line.
 *
 * @param t - Message unix-ms timestamp.
 * @returns `HH:MM`, or empty when the stamp is unusable.
 */
export function formatChatLineTime(t: number): string {
  if (!Number.isFinite(t) || t <= 0) return "";
  const date = new Date(t);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Pending-offer section label.
 *
 * @param count - Open trades.
 * @returns Heading such as `Pending · 2`.
 */
export function tradePendingHeading(count: number): string {
  const n = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return n > 0 ? `Pending · ${n}` : "Pending";
}

/**
 * Direction chip on a trade card.
 *
 * @param direction - Incoming offer or your outbound escrow.
 * @returns Short label.
 */
export function tradeOfferKindLabel(
  direction: "incoming" | "outgoing",
): string {
  return direction === "incoming" ? "Incoming" : "Your offer";
}
