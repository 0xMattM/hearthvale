import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  armTimedFlag,
  clearTimedFlag,
} from "../../apps/web/lib/hud/timed-flag";

/**
 * RF7.5 — shared timed-flag helper used by GameApp open accents / confirms.
 */
describe("timed-flag RF7.5", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("turns on then off after durationMs (happy)", () => {
    vi.useFakeTimers();
    const clearRef = { current: null as ReturnType<typeof setTimeout> | null };
    const seen: boolean[] = [];
    armTimedFlag(clearRef, (on) => seen.push(on), 450);
    expect(seen).toEqual([true]);
    expect(clearRef.current).not.toBeNull();
    vi.advanceTimersByTime(450);
    expect(seen).toEqual([true, false]);
    expect(clearRef.current).toBeNull();
  });

  it("re-arming cancels the previous timer (edge)", () => {
    vi.useFakeTimers();
    const clearRef = { current: null as ReturnType<typeof setTimeout> | null };
    let on = false;
    armTimedFlag(clearRef, (next) => {
      on = next;
    }, 400);
    vi.advanceTimersByTime(200);
    armTimedFlag(clearRef, (next) => {
      on = next;
    }, 400);
    vi.advanceTimersByTime(200);
    expect(on).toBe(true);
    vi.advanceTimersByTime(200);
    expect(on).toBe(false);
  });

  it("non-positive duration never stays on (fail)", () => {
    vi.useFakeTimers();
    const clearRef = { current: null as ReturnType<typeof setTimeout> | null };
    let on = true;
    armTimedFlag(clearRef, (next) => {
      on = next;
    }, 0);
    expect(on).toBe(false);
    expect(clearRef.current).toBeNull();
    clearTimedFlag(clearRef, (next) => {
      on = next;
    });
    expect(on).toBe(false);
    vi.advanceTimersByTime(1_000);
    expect(on).toBe(false);
  });

  it("GameApp wires useTimedFlag for open accents (wiring)", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "apps/web/components/GameApp.tsx"),
      "utf8",
    );
    expect(src).toContain("useTimedFlag");
    expect(src).not.toContain("inventoryOpenAccentClearRef");
  });
});
