import { describe, expect, it } from "vitest";
import {
  DEFAULT_CLIENT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  loadClientSettings,
  parseClientSettings,
  patchClientSettings,
  saveClientSettings,
} from "../../apps/web/lib/settings";

describe("client settings F13.5+", () => {
  it("parses and patches preferences (happy)", () => {
    const parsed = parseClientSettings({
      muteAudio: true,
      showTips: false,
      dayNightCycle: false,
    });
    expect(parsed).toEqual({
      muteAudio: true,
      showTips: false,
      dayNightCycle: false,
    });
    const next = patchClientSettings(DEFAULT_CLIENT_SETTINGS, {
      muteAudio: true,
    });
    expect(next.muteAudio).toBe(true);
    expect(next.showTips).toBe(true);
    expect(next.dayNightCycle).toBe(true);
  });

  it("round-trips through storage stub (edge)", () => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
    };
    saveClientSettings(
      { muteAudio: true, showTips: false, dayNightCycle: false },
      storage,
    );
    expect(mem.get(SETTINGS_STORAGE_KEY)).toContain("muteAudio");
    expect(loadClientSettings(storage)).toEqual({
      muteAudio: true,
      showTips: false,
      dayNightCycle: false,
    });
  });

  it("falls back on garbage input (failure)", () => {
    expect(parseClientSettings(null)).toEqual(DEFAULT_CLIENT_SETTINGS);
    expect(parseClientSettings("nope")).toEqual(DEFAULT_CLIENT_SETTINGS);
    expect(parseClientSettings({ muteAudio: "yes" })).toEqual(
      DEFAULT_CLIENT_SETTINGS,
    );
    // Legacy saves without dayNightCycle keep the default on
    expect(parseClientSettings({ muteAudio: false, showTips: true })).toEqual(
      DEFAULT_CLIENT_SETTINGS,
    );
    const mem = new Map<string, string>([[SETTINGS_STORAGE_KEY, "{bad"]]);
    expect(
      loadClientSettings({
        getItem: (k) => mem.get(k) ?? null,
      }),
    ).toEqual(DEFAULT_CLIENT_SETTINGS);
  });
});
