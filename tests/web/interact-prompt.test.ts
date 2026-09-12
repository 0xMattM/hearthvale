import { describe, expect, it } from "vitest";
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

describe("CityLands CL6.2 interact prompt routing", () => {
  it("labels portal / arena / build for free travel maps (happy)", () => {
    const portal = resolveInteractPrompt({
      target: buildingTarget("portal"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
    });
    expect(portal?.showKey).toBe(true);
    expect(portal?.label).toMatch(/Travel · free/i);
    expect(portal?.label).toMatch(/City/);
    expect(portal?.label).toMatch(/Warrior/);

    const warriorPortal = resolveInteractPrompt({
      target: buildingTarget("portal"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "warrior",
    });
    expect(warriorPortal?.label).toMatch(/^Exit · Travel · free/);
    expect(warriorPortal?.label).toMatch(/\bN\b/);

    expect(
      resolveInteractPrompt({
        target: buildingTarget("arena_board"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "Arena info · optional, no ladder", showKey: true });

    expect(
      resolveInteractPrompt({
        target: buildingTarget("notice_board"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "City notice board", showKey: true });

    expect(
      resolveInteractPrompt({
        target: buildingTarget("build_board"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toBeNull();
  });

  it("hides interact key while visiting (edge)", () => {
    const prompt = resolveInteractPrompt({
      target: buildingTarget("mill"),
      visiting: true,
      gameNow: 0,
      occupiedSlotIndexes: [],
    });
    expect(prompt).toEqual({ label: "Their Mill", showKey: false });

    expect(
      resolveInteractPrompt({
        target: { kind: "expand", dist: 1 },
        visiting: true,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toBeNull();

    expect(
      resolveInteractPrompt({
        target: { kind: "gate", dist: 0.4 },
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "Travel", showKey: true });
  });

  it("returns null with no target (failure)", () => {
    expect(
      resolveInteractPrompt({
        target: null,
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toBeNull();
  });

  it("prefixes explore section labels on woodland / mines / hunt (CL10.1)", () => {
    expect(
      resolveInteractPrompt({
        target: buildingTarget("tree_stump"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "explore",
      }),
    ).toEqual({ label: "Woodland · Chop wood", showKey: true });

    expect(
      resolveInteractPrompt({
        target: buildingTarget("ore_node"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "explore",
      }),
    ).toEqual({
      label: "Mines · Chip iron ore (Iron Hammer)",
      showKey: true,
    });

    expect(
      resolveInteractPrompt({
        target: buildingTarget("game_trail"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "explore",
      }),
    ).toEqual({ label: "Hunt grounds · Hares nearby", showKey: false });
  });

  it("shows LMB/RMB while a live fight is open on that trail (happy)", () => {
    expect(
      resolveInteractPrompt({
        target: buildingTarget("game_trail"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "explore",
        combat: {
          active: true,
          buildingId: "b1",
          zone: "game_trail",
          foeName: "Forest Hare",
          foeHealth: 12,
          foeMaxHealth: 24,
          playerHealth: 80,
          playerMaxHealth: 100,
          blocking: false,
          weaponStyle: "melee",
          canAttackAt: 0,
          foeX: 0,
          foeZ: 0,
          homeX: 0,
          homeZ: 0,
          foeYaw: 0,
          inStrikeRange: true,
          foeLunging: false,
        },
      }),
    ).toEqual({ label: "LMB Attack · RMB Guard", showKey: false });
  });

  it("does not prefix section labels on city scarce stations (CL10.1 edge)", () => {
    // Reason: PL8.2 — city scarce still names Free/Busy; no explore section prefix.
    expect(
      resolveInteractPrompt({
        target: buildingTarget("tree_stump"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      }),
    ).toEqual({ label: "Chop wood · Free", showKey: true });
  });
});
