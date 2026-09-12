import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  PLAYER_LAND_STATIONS,
  WARRIOR_ARENA_VISUAL,
  WARRIOR_BUILDINGS,
  arenaPlaqueCopy,
  cssHexRgbDistance,
  isPlayerLandStationType,
  warriorArenaGroundContrastMin,
  warriorArenaRingContrast,
} from "@game/shared";

/**
 * PL11.1 — Arena floor / plaque contrast.
 * Scorched grounds + warm clay ring vs other maps; plaque copy stays optional-path.
 */
describe("CityLands PL11.1 arena floor / plaque contrast", () => {
  it("keeps warrior grounds distinct from city / land / explore peers (happy)", () => {
    expect(warriorArenaGroundContrastMin()).toBeGreaterThan(40);
    expect(warriorArenaRingContrast()).toBeGreaterThan(80);
    expect(WARRIOR_ARENA_VISUAL.groundsColor.toLowerCase()).toBe("#3a2820");
    expect(WARRIOR_ARENA_VISUAL.ringFillColor.toLowerCase()).toBe("#d4a048");
    expect(WARRIOR_ARENA_VISUAL.plaqueFace.toLowerCase()).toBe("#a82828");
    expect(WARRIOR_ARENA_VISUAL.plaqueAccent.toLowerCase()).toBe("#e07060");

    const peers = WARRIOR_ARENA_VISUAL.peerGrounds;
    expect(cssHexRgbDistance(WARRIOR_ARENA_VISUAL.groundsColor, peers.city)).toBeGreaterThan(
      40,
    );
    expect(
      cssHexRgbDistance(WARRIOR_ARENA_VISUAL.groundsColor, peers.player_land),
    ).toBeGreaterThan(40);
    expect(
      cssHexRgbDistance(WARRIOR_ARENA_VISUAL.groundsColor, peers.explore),
    ).toBeGreaterThan(40);
    expect(
      cssHexRgbDistance(
        WARRIOR_ARENA_VISUAL.plaqueFace,
        WARRIOR_ARENA_VISUAL.plaqueBase,
      ),
    ).toBeGreaterThan(50);
  });

  it("keeps plaque optional-path copy without balance numbers (edge)", () => {
    expect(WARRIOR_BUILDINGS.some((b) => b.type === "arena_board")).toBe(true);
    const plaque = arenaPlaqueCopy();
    const copy = `${plaque.title} ${plaque.lead} ${plaque.body} ${plaque.exitHint} ${plaque.noLadderNote}`;
    expect(copy.toLowerCase()).toMatch(/optional/);
    expect(copy.toLowerCase()).toMatch(/profession ladder|not required/);
    expect(copy.toLowerCase()).toMatch(/homestead|your land/);
    expect(copy).not.toMatch(/\b\d{2,}\b/);
    expect(copy).not.toMatch(/\d+\s*(dmg|hp|defense|dps)/i);
    expect(plaque.exitHint.toLowerCase()).toMatch(/free|n\b|portal/);
  });

  it("refuses arena board on homestead and rejects collapsed contrast (failure)", () => {
    expect(isPlayerLandStationType("arena_board")).toBe(false);
    expect(Object.keys(PLAYER_LAND_STATIONS)).not.toContain("arena_board");
    expect(
      ACTION_ERROR.warriorTrainingHomesteadForbidden.toLowerCase(),
    ).toMatch(/arena|homestead|land/);
    expect(warriorArenaGroundContrastMin()).not.toBe(0);
    expect(warriorArenaRingContrast()).not.toBe(0);
    // Collapsed palette would equal peer city grey — must stay apart.
    expect(WARRIOR_ARENA_VISUAL.groundsColor).not.toBe(
      WARRIOR_ARENA_VISUAL.peerGrounds.city,
    );
    expect(WARRIOR_ARENA_VISUAL.groundsColor).not.toBe(
      WARRIOR_ARENA_VISUAL.peerGrounds.player_land,
    );
  });
});
