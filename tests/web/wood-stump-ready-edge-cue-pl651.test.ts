import { describe, expect, it } from "vitest";
import { WOOD_STUMP } from "@game/shared";
import {
  oreNodeReady,
  readyWoodStumpIds,
} from "../../apps/web/components/land-scene/landProximity";
import {
  CROP_READY_EDGE_CUE,
  WOOD_STUMP_COOLDOWN_REFUSE_CUE,
  WOOD_STUMP_READY_EDGE_CUE,
  isCoreSuccessCueText,
  shouldFlashWoodStumpReadyEdgeCue,
  SUCCESS_CUE_MS,
  woodStumpReadyEdgeCueText,
} from "../../apps/web/lib/hud/success-cue";
import type { BuildingDto } from "@game/shared";

function stump(id: string, readyAt: number | null): BuildingDto {
  return {
    id,
    type: "tree_stump",
    slotIndex: 0,
    x: 0,
    z: 0,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt,
    claim: null,
    tutorialNpcId: null,
  };
}

/**
 * PL65.1 — Wood stump ready soft cue (edge into chop-ready after cooldown).
 * Brief TopBar `Ready`; cooldown / yields unchanged; mute ok.
 */
describe("CityLands PL65.1 wood stump ready edge soft cue", () => {
  it("flashes Ready when a stump edges into chop-ready after cooldown (happy)", () => {
    expect(woodStumpReadyEdgeCueText()).toBe(WOOD_STUMP_READY_EDGE_CUE);
    expect(woodStumpReadyEdgeCueText()).toBe("Ready");
    expect(woodStumpReadyEdgeCueText()).toBe(CROP_READY_EDGE_CUE);
    expect(isCoreSuccessCueText("Ready")).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);

    const prev = new Set<string>();
    const next = new Set(["stump-a"]);
    expect(shouldFlashWoodStumpReadyEdgeCue(prev, next)).toBe(true);

    const now = 10_000;
    const buildings = [
      stump("stump-a", now - 1),
      stump("stump-b", now + WOOD_STUMP.cooldownMs),
      stump("stump-fresh", null),
    ];
    expect(readyWoodStumpIds(buildings, now)).toEqual(["stump-a"]);
    expect(oreNodeReady(buildings[0]!, now)).toBe(true);
    expect(oreNodeReady(buildings[1]!, now)).toBe(false);
    expect(oreNodeReady(buildings[2]!, now)).toBe(true);
  });

  it("stays quiet on hydrate, never-chopped place, same ready set, or clear (edge)", () => {
    expect(shouldFlashWoodStumpReadyEdgeCue(null, new Set(["stump-a"]))).toBe(
      false,
    );
    expect(
      shouldFlashWoodStumpReadyEdgeCue(undefined, new Set(["stump-a"])),
    ).toBe(false);
    expect(
      shouldFlashWoodStumpReadyEdgeCue(
        new Set(["stump-a"]),
        new Set(["stump-a"]),
      ),
    ).toBe(false);
    expect(
      shouldFlashWoodStumpReadyEdgeCue(new Set(["stump-a"]), new Set()),
    ).toBe(false);
    // Never-chopped (null readyAt) is not in the ready-edge set.
    expect(readyWoodStumpIds([stump("fresh", null)], 10_000)).toEqual([]);
    // Second stump finishing cooldown while first already ready still flashes once.
    expect(
      shouldFlashWoodStumpReadyEdgeCue(
        new Set(["stump-a"]),
        new Set(["stump-a", "stump-b"]),
      ),
    ).toBe(true);
  });

  it("keeps cooldown / yields and refuses sticky prose (failure)", () => {
    expect(WOOD_STUMP.cooldownMs).toBe(75_000);
    expect(WOOD_STUMP.yieldQty).toBe(1);
    expect(woodStumpReadyEdgeCueText()).not.toMatch(/\d/);
    expect(woodStumpReadyEdgeCueText()).not.toBe(WOOD_STUMP_COOLDOWN_REFUSE_CUE);
    expect(woodStumpReadyEdgeCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|always-on/,
    );
    expect(isCoreSuccessCueText("Ready forever sticky")).toBe(false);
    expect(shouldFlashWoodStumpReadyEdgeCue(new Set(), new Set(["x"]))).toBe(
      true,
    );
    expect(shouldFlashWoodStumpReadyEdgeCue(null, new Set(["x"]))).toBe(false);
  });
});
