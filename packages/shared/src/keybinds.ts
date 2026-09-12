/**
 * In-game keybind reference (F13.5). Codes match KeyboardEvent.code.
 */
export interface KeybindEntry {
  /** KeyboardEvent.code (e.g. KeyE) or group id for movement. */
  code: string;
  /** Short key label shown in HUD. */
  key: string;
  /** Action description. */
  label: string;
  /** Group for settings panel sections. */
  group: "move" | "panels" | "system";
}

/** Canonical keybind help list — keep in sync with GameApp handlers. */
export const KEYBINDS: KeybindEntry[] = [
  { code: "WASD", key: "WASD", label: "Move", group: "move" },
  { code: "KeyE", key: "E", label: "Interact / plant / harvest / craft", group: "move" },
  { code: "KeyI", key: "I", label: "Inventory", group: "panels" },
  { code: "KeyP", key: "P", label: "Land editor (place / move / pick up)", group: "panels" },
  { code: "KeyT", key: "T", label: "Player trade", group: "panels" },
  { code: "KeyV", key: "V", label: "Visit another land", group: "panels" },
  { code: "KeyN", key: "N", label: "Travel map", group: "panels" },
  { code: "KeyM", key: "M", label: "Player market", group: "panels" },
  { code: "KeyC", key: "C", label: "World / guild chat", group: "panels" },
  { code: "KeyG", key: "G", label: "Guilds", group: "panels" },
  { code: "KeyQ", key: "Q", label: "Starter quests", group: "panels" },
  { code: "KeyJ", key: "J", label: "Achievements", group: "panels" },
  { code: "KeyL", key: "L", label: "Mail", group: "panels" },
  { code: "KeyB", key: "B", label: "Creditcoin (wallet / lands / history)", group: "panels" },
  { code: "KeyH", key: "H", label: "Settings + keybind help", group: "system" },
  { code: "Escape", key: "Esc", label: "Close panel / leave visit", group: "system" },
];

/**
 * Compact HUD hint string (TopBar).
 * @deprecated Prefer formatMinimalHudHint — full dump clutters the walking view (CL6.1).
 */
export function formatKeybindHint(binds: KeybindEntry[] = KEYBINDS): string {
  const keys = binds.map((b) => b.key);
  return keys.join(" · ");
}

/**
 * Absolute-minimum walking HUD hint (CL6.1 / PlayerVision).
 * Full keybind list lives in Settings (H).
 */
export function formatMinimalHudHint(): string {
  return "E interact · N travel · P land · H help";
}

/**
 * Looks up a bind by KeyboardEvent.code (or WASD group).
 */
export function findKeybind(
  code: string,
  binds: KeybindEntry[] = KEYBINDS,
): KeybindEntry | undefined {
  return binds.find((b) => b.code === code);
}
