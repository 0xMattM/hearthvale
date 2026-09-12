import { describe, expect, it } from "vitest";
import type { BuildingDto } from "@game/shared";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import { buildInteractPromptHierarchy } from "../../apps/web/lib/hud/interact-prompt-hierarchy";
import type { InteractTarget } from "../../apps/web/components/land-scene/landProximity";

function building(
  type: BuildingDto["type"],
  extra: Partial<BuildingDto> = {},
): BuildingDto {
  return {
    id: "b1",
    type,
    slotIndex: 0,
    x: 1,
    z: 1,
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
 * PL17.1 — Notice walk-up prompt soft · New when tips unread.
 * Same panel; no TopBar column.
 */
describe("CityLands PL17.1 unread notice interact prompt", () => {
  it("appends · New on city notice board when unread (happy)", () => {
    const prompt = resolveInteractPrompt({
      target: buildingTarget("notice_board"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "city",
      hasUnreadNotice: true,
    });
    expect(prompt).toEqual({
      label: "City notice board · New",
      showKey: true,
    });
    expect(
      buildInteractPromptHierarchy(prompt!.label, prompt!.showKey),
    ).toMatchObject({
      keyLabel: "E",
      detail: expect.stringMatching(/New/),
    });
  });

  it("keeps plain notice label when tips are already seen (edge)", () => {
    const prompt = resolveInteractPrompt({
      target: buildingTarget("notice_board"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "city",
      hasUnreadNotice: false,
    });
    expect(prompt?.label).toBe("City notice board");
    expect(prompt?.label).not.toMatch(/New/);
  });

  it("does not stamp · New on vendor / market / tutors (failure)", () => {
    for (const type of [
      "vendor_stall",
      "market_board",
      "realm_market",
      "tutorial_npc",
    ] as const) {
      const prompt = resolveInteractPrompt({
        target: buildingTarget(type, {
          tutorialNpcId: type === "tutorial_npc" ? "farmer" : null,
        }),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
        hasUnreadNotice: true,
      });
      expect(prompt?.label).toBeTruthy();
      expect(prompt!.label).not.toMatch(/· New/);
    }
  });
});
