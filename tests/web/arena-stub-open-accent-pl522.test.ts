import { describe, expect, it } from "vitest";
import { arenaPlaqueCopy } from "@game/shared";
import {
  WORKSPACE_PANEL_OPEN_ACCENT_MS,
  shouldPlayArenaOpenAccent,
  shouldPlayBuildOpenAccent,
  shouldPlayTravelOpenAccent,
} from "../../apps/web/lib/hud/workspace-panel-open-accent";

/**
 * PL52.2 — Arena stub panel open accent.
 * Brief warm accent when Arena stub opens (plaque / travel); optional path
 * copy unchanged; no balance invent.
 */
describe("CityLands PL52.2 arena stub panel open accent", () => {
  it("plays accent when arena opens from closed (happy)", () => {
    expect(shouldPlayArenaOpenAccent(null, "arena")).toBe(true);
    expect(shouldPlayArenaOpenAccent("travel", "arena")).toBe(true);
    expect(shouldPlayArenaOpenAccent("build", "arena")).toBe(true);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
    const copy = arenaPlaqueCopy();
    expect(copy.lead.toLowerCase()).toMatch(/optional/);
    expect(copy.noLadderNote.toLowerCase()).toMatch(/ladder|not/);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayArenaOpenAccent("arena", "arena")).toBe(false);
    expect(shouldPlayArenaOpenAccent("arena", null)).toBe(false);
    expect(shouldPlayArenaOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens; copy stays optional (failure)", () => {
    expect(shouldPlayArenaOpenAccent(null, "build")).toBe(false);
    expect(shouldPlayArenaOpenAccent("arena", "travel")).toBe(false);
    expect(shouldPlayBuildOpenAccent(null, "arena")).toBe(false);
    expect(shouldPlayTravelOpenAccent(null, "arena")).toBe(false);
    const copy = arenaPlaqueCopy();
    expect(copy.body.toLowerCase()).toMatch(/placeholder|stub|no matches/);
    expect(copy.exitHint.toLowerCase()).toMatch(/leave|travel|portal|free/);
  });
});
