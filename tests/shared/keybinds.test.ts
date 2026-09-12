import { describe, expect, it } from "vitest";
import {
  KEYBINDS,
  findKeybind,
  formatKeybindHint,
  formatMinimalHudHint,
} from "../../packages/shared/src/keybinds";

describe("keybinds F13.5 + CL6.1 minimal HUD", () => {
  it("lists help and settings under H (happy)", () => {
    const h = findKeybind("KeyH");
    expect(h?.key).toBe("H");
    expect(h?.label.toLowerCase()).toContain("settings");
    expect(formatKeybindHint()).toContain("H");
    expect(formatKeybindHint().split(" · ").length).toBe(KEYBINDS.length);
  });

  it("walking HUD hint stays short — full binds in Settings (CL6.1 happy)", () => {
    const hint = formatMinimalHudHint();
    expect(hint).toContain("H help");
    expect(hint).toContain("E interact");
    expect(hint).toContain("N travel");
    // Reason: must not dump every panel hotkey onto the walking chrome.
    expect(hint.split(" · ").length).toBeLessThanOrEqual(4);
    expect(hint.length).toBeLessThan(formatKeybindHint().length);
  });

  it("covers core panels without duplicate codes (edge)", () => {
    const codes = KEYBINDS.map((b) => b.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const need of ["KeyE", "KeyI", "KeyP", "KeyM", "KeyC", "Escape"]) {
      expect(findKeybind(need)).toBeTruthy();
    }
  });

  it("returns undefined for unknown codes (failure)", () => {
    expect(findKeybind("KeyZ")).toBeUndefined();
    expect(findKeybind("")).toBeUndefined();
  });
});
