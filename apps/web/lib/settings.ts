/** Local client preferences (F13.5+). Not synced to server. */

export const SETTINGS_STORAGE_KEY = "game_client_settings";

export interface ClientSettings {
  /** Mute looping BGM + action SFX (F14.4). */
  muteAudio: boolean;
  /** Show first-session onboarding tips. */
  showTips: boolean;
  /** Cosmetic day/night lighting cycle (F14.5). */
  dayNightCycle: boolean;
}

export const DEFAULT_CLIENT_SETTINGS: ClientSettings = {
  muteAudio: false,
  showTips: true,
  dayNightCycle: true,
};

/**
 * Parses raw JSON into settings with safe defaults.
 */
export function parseClientSettings(raw: unknown): ClientSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_CLIENT_SETTINGS };
  const o = raw as Record<string, unknown>;
  return {
    muteAudio:
      typeof o.muteAudio === "boolean"
        ? o.muteAudio
        : DEFAULT_CLIENT_SETTINGS.muteAudio,
    showTips:
      typeof o.showTips === "boolean"
        ? o.showTips
        : DEFAULT_CLIENT_SETTINGS.showTips,
    dayNightCycle:
      typeof o.dayNightCycle === "boolean"
        ? o.dayNightCycle
        : DEFAULT_CLIENT_SETTINGS.dayNightCycle,
  };
}

/**
 * Loads settings from localStorage (browser only).
 */
export function loadClientSettings(
  storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined"
    ? window.localStorage
    : null,
): ClientSettings {
  if (!storage) return { ...DEFAULT_CLIENT_SETTINGS };
  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CLIENT_SETTINGS };
    return parseClientSettings(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_CLIENT_SETTINGS };
  }
}

/**
 * Persists settings to localStorage.
 */
export function saveClientSettings(
  settings: ClientSettings,
  storage: Pick<Storage, "setItem"> | null = typeof window !== "undefined"
    ? window.localStorage
    : null,
): void {
  if (!storage) return;
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Merges a partial update onto current settings.
 */
export function patchClientSettings(
  current: ClientSettings,
  patch: Partial<ClientSettings>,
): ClientSettings {
  return {
    muteAudio: patch.muteAudio ?? current.muteAudio,
    showTips: patch.showTips ?? current.showTips,
    dayNightCycle: patch.dayNightCycle ?? current.dayNightCycle,
  };
}
