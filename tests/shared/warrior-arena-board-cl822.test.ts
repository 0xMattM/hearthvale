import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  PLAYER_LAND_STATIONS,
  WARRIOR_BUILDINGS,
  arenaBoardWorldLabel,
  arenaInteractPrompt,
  arenaPlaqueCopy,
  cityNoticeBoardTips,
  isPlayerLandStationType,
  warriorArenaExitHint,
  warriorArenaExitLabel,
} from "@game/shared";
import type { BuildingDto } from "@game/shared";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import type { InteractTarget } from "../../apps/web/components/land-scene/landProximity";

function building(
  type: BuildingDto["type"],
  extra: Partial<BuildingDto> = {},
): BuildingDto {
  return {
    id: "b1",
    type,
    slotIndex: 0,
    x: 0,
    z: 0,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt: null,
    claim: null,
    tutorialNpcId: null,
    ...extra,
  };
}

function buildingTarget(
  type: BuildingDto["type"],
  extra: Partial<BuildingDto> = {},
): InteractTarget {
  return { kind: "building", dist: 1, building: building(type, extra) };
}

/**
 * CL82.2 — Warrior arena optional still green.
 * Choice: assert-only plaque + tip fidelity (parity with CL70.2; no combat balance invent).
 */
describe("CityLands CL82.2 Warrior arena optional still green", () => {
  it("keeps walk-up optional / no-ladder copy (happy)", () => {
    expect(WARRIOR_BUILDINGS.some((b) => b.type === "arena_board")).toBe(true);
    expect(arenaInteractPrompt().toLowerCase()).toMatch(/optional/);
    expect(arenaInteractPrompt().toLowerCase()).toMatch(/no ladder/);
    expect(arenaBoardWorldLabel().toLowerCase()).toMatch(/optional/);
    expect(warriorArenaExitLabel()).toMatch(/Exit/);
    expect(warriorArenaExitLabel()).toMatch(/\bN\b/);
    expect(warriorArenaExitHint().toLowerCase()).toMatch(/portal|north/);

    const tip = cityNoticeBoardTips().find((t) => t.id === "warrior_optional");
    expect(tip).toBeTruthy();
    expect(tip!.body.toLowerCase()).toMatch(/optional|not required/);
    expect(tip!.body).not.toMatch(/\d+\s*(dmg|hp|defense|dps)/i);

    const plaque = resolveInteractPrompt({
      target: buildingTarget("arena_board"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "warrior",
    });
    expect(plaque).toEqual({
      label: "Arena info · optional, no ladder",
      showKey: true,
    });
    expect(plaque!.label).not.toMatch(/\d+/);
  });

  it("keeps arena stub plaque without balance numbers (edge)", () => {
    const plaque = arenaPlaqueCopy();
    const copy = `${plaque.title} ${plaque.lead} ${plaque.body} ${plaque.exitHint} ${plaque.noLadderNote}`;
    expect(copy.toLowerCase()).toMatch(/optional|stub|placeholder/);
    expect(copy.toLowerCase()).toMatch(/no .*ladder|not required|homestead/);
    expect(copy).not.toMatch(/\b\d{2,}\b/);
    expect(plaque.exitHint.toLowerCase()).toMatch(/free|n\b|portal/);
  });

  it("refuses arena board as homestead station (failure)", () => {
    expect(isPlayerLandStationType("arena_board")).toBe(false);
    expect(Object.keys(PLAYER_LAND_STATIONS)).not.toContain("arena_board");
    expect(
      ACTION_ERROR.warriorTrainingHomesteadForbidden.toLowerCase(),
    ).toMatch(/arena|homestead|land/);
  });
});
