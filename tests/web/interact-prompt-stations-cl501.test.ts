import { describe, expect, it } from "vitest";
import type { BuildingDto } from "@game/shared";
import { formatMinimalHudHint } from "@game/shared";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import {
  defaultClosedPanelIds,
  type HudPanelId,
} from "../../apps/web/lib/hud/panel-orchestration";
import type { InteractTarget } from "../../apps/web/components/land-scene/landProximity";

/** All non-null HUD panel ids — walking chrome must not leave any open. */
const ALL_PANELS: Exclude<HudPanelId, null>[] = [
  "inventory",
  "craft",
  "vendor",
  "trade",
  "visit",
  "market",
  "realm_market",
  "chat",
  "guild",
  "quests",
  "tutorial_npc",
  "build",
  "achievements",
  "mail",
  "deeds",
  "settings",
  "travel",
  "decor",
  "arena",
  "notice",
  "plant",
];

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
 * CL50.1 — walk-up prompts name craft / notice / build correctly; min HUD (no always-on).
 * Choice: assert-only fidelity (copy already in interact-prompt) over rewriting labels.
 */
describe("CityLands CL50.1 interact prompt fidelity (stations)", () => {
  it("names craft, notice, and build walk-ups with interact key (happy)", () => {
    const craftStations: Array<{
      type: BuildingDto["type"];
      label: string;
    }> = [
      { type: "kitchen", label: "Use Kitchen" },
      { type: "mill", label: "Use Mill" },
      { type: "forge", label: "Use Forge" },
      { type: "workshop", label: "Use Workshop" },
      { type: "loom", label: "Use Loom" },
      { type: "alchemy_bench", label: "Use Alchemy Bench" },
    ];

    for (const { type, label } of craftStations) {
      expect(
        resolveInteractPrompt({
          target: buildingTarget(type),
          visiting: false,
          gameNow: 0,
          occupiedSlotIndexes: [],
          landKind: "player_land",
        }),
      ).toEqual({ label, showKey: true });
    }

    expect(
      resolveInteractPrompt({
        target: buildingTarget("notice_board"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      }),
    ).toEqual({ label: "City notice board", showKey: true });

    expect(
      resolveInteractPrompt({
        target: buildingTarget("build_board"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "player_land",
      }),
    ).toBeNull();

    expect(
      resolveInteractPrompt({
        target: buildingTarget("animal_pen"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "player_land",
      }),
    ).toEqual({ label: "Care for animals (wheat / wood)", showKey: true });

    expect(
      resolveInteractPrompt({
        target: buildingTarget("fishing_dock"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "player_land",
      }),
    ).toEqual({ label: "Catch fish", showKey: true });

    // Reason: CL50.1 — cooldown copy uses readyAt, not a permanent settling stub.
    expect(
      resolveInteractPrompt({
        target: buildingTarget("animal_pen", { readyAt: 5_000 }),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "player_land",
      }),
    ).toEqual({ label: "Pen settling · 5s", showKey: false });
  });


  it("keeps craft/notice/build closed-by-default (min HUD edge)", () => {
    const closed = defaultClosedPanelIds();
    expect(closed).toEqual(ALL_PANELS);
    expect(closed).toContain("craft");
    expect(closed).toContain("notice");
    expect(closed).toContain("build");
    const hint = formatMinimalHudHint();
    expect(hint.split(" · ").length).toBeLessThanOrEqual(4);
    expect(hint.toLowerCase()).not.toContain("craft");
    expect(hint.toLowerCase()).not.toContain("notice");
  });

  it("hides key while visiting and null with no target (failure)", () => {
    expect(
      resolveInteractPrompt({
        target: buildingTarget("kitchen"),
        visiting: true,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "Their Kitchen", showKey: false });

    expect(
      resolveInteractPrompt({
        target: buildingTarget("build_board"),
        visiting: true,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toBeNull();

    expect(
      resolveInteractPrompt({
        target: null,
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toBeNull();
  });
});
