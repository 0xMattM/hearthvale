import { describe, expect, it } from "vitest";
import type { BuildingDto } from "@game/shared";
import { formatMinimalHudHint } from "@game/shared";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import {
  buildingPanelIntent,
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

const CRAFT_STATIONS = [
  "mill",
  "forge",
  "kitchen",
  "workshop",
  "loom",
  "alchemy_bench",
] as const;

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
 * CL86.1 — Min HUD / interact prompts still green.
 * Choice: assert-only walk-up prompts + closed craft/notice (parity with CL78.1; no invent panels).
 */
describe("CityLands CL86.1 min HUD / interact prompts still green", () => {
  it("keeps station/portal walk-up prompts and closed-by-default panels (happy)", () => {
    const closed = defaultClosedPanelIds();
    expect(closed).toEqual(ALL_PANELS);
    expect(closed).toContain("craft");
    expect(closed).toContain("notice");
    expect(closed).toContain("market");

    for (const station of CRAFT_STATIONS) {
      expect(
        resolveInteractPrompt({
          target: buildingTarget(station),
          visiting: false,
          gameNow: 0,
          occupiedSlotIndexes: [],
          landKind: "city",
        })?.showKey,
      ).toBe(true);
      expect(buildingPanelIntent({ id: `${station}-1`, type: station })).toEqual(
        {
          type: "craft",
          station,
          buildingId: `${station}-1`,
        },
      );
    }

    expect(
      resolveInteractPrompt({
        target: buildingTarget("portal"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      })?.label,
    ).toMatch(/Travel · free/i);

    expect(
      resolveInteractPrompt({
        target: buildingTarget("market_board"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      })?.showKey,
    ).toBe(true);

    const hint = formatMinimalHudHint();
    expect(hint.split(" · ").length).toBeLessThanOrEqual(4);
    expect(hint.toLowerCase()).not.toContain("craft");
    expect(hint.toLowerCase()).not.toContain("market");
  });

  it("does not invent always-on craft HUD panels (failure)", () => {
    expect(buildingPanelIntent({ id: "o1", type: "ore_node" })).toBeNull();
    expect(buildingPanelIntent({ id: "p1", type: "crop_plot" })).toBeNull();
    expect(buildingPanelIntent({ id: "d1", type: "fishing_dock" })).toBeNull();

    expect(
      resolveInteractPrompt({
        target: null,
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toBeNull();

    const hint = formatMinimalHudHint().toLowerCase();
    expect(hint).not.toContain("quest");
    expect(hint).not.toContain("vendor");
  });
});
