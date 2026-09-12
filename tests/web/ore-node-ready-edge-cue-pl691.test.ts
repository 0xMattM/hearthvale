import { describe, expect, it } from "vitest";
import { ORE_NODE } from "@game/shared";
import {
  oreNodeReady,
  readyOreNodeIds,
} from "../../apps/web/components/land-scene/landProximity";
import {
  CROP_READY_EDGE_CUE,
  ORE_COOLDOWN_REFUSE_CUE,
  ORE_NODE_READY_EDGE_CUE,
  isCoreSuccessCueText,
  oreNodeReadyEdgeCueText,
  shouldFlashOreNodeReadyEdgeCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import type { BuildingDto } from "@game/shared";

function ore(id: string, readyAt: number | null): BuildingDto {
  return {
    id,
    type: "ore_node",
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
 * PL69.1 — Ore node ready soft cue (edge into chip-ready after cooldown).
 * Brief TopBar `Ready`; cooldown / yields unchanged; mute ok.
 */
describe("CityLands PL69.1 ore node ready edge soft cue", () => {
  it("flashes Ready when an ore node edges into chip-ready after cooldown (happy)", () => {
    expect(oreNodeReadyEdgeCueText()).toBe(ORE_NODE_READY_EDGE_CUE);
    expect(oreNodeReadyEdgeCueText()).toBe("Ready");
    expect(oreNodeReadyEdgeCueText()).toBe(CROP_READY_EDGE_CUE);
    expect(isCoreSuccessCueText("Ready")).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);

    const prev = new Set<string>();
    const next = new Set(["ore-a"]);
    expect(shouldFlashOreNodeReadyEdgeCue(prev, next)).toBe(true);

    const now = 10_000;
    const buildings = [
      ore("ore-a", now - 1),
      ore("ore-b", now + ORE_NODE.cooldownMs),
      ore("ore-fresh", null),
    ];
    expect(readyOreNodeIds(buildings, now)).toEqual(["ore-a"]);
    expect(oreNodeReady(buildings[0]!, now)).toBe(true);
    expect(oreNodeReady(buildings[1]!, now)).toBe(false);
    expect(oreNodeReady(buildings[2]!, now)).toBe(true);
  });

  it("stays quiet on hydrate, never-chipped place, same ready set, or clear (edge)", () => {
    expect(shouldFlashOreNodeReadyEdgeCue(null, new Set(["ore-a"]))).toBe(
      false,
    );
    expect(
      shouldFlashOreNodeReadyEdgeCue(undefined, new Set(["ore-a"])),
    ).toBe(false);
    expect(
      shouldFlashOreNodeReadyEdgeCue(new Set(["ore-a"]), new Set(["ore-a"])),
    ).toBe(false);
    expect(
      shouldFlashOreNodeReadyEdgeCue(new Set(["ore-a"]), new Set()),
    ).toBe(false);
    // Never-chipped (null readyAt) is not in the ready-edge set.
    expect(readyOreNodeIds([ore("fresh", null)], 10_000)).toEqual([]);
    // Second ore finishing cooldown while first already ready still flashes once.
    expect(
      shouldFlashOreNodeReadyEdgeCue(
        new Set(["ore-a"]),
        new Set(["ore-a", "ore-b"]),
      ),
    ).toBe(true);
  });

  it("keeps cooldown / yields and refuses sticky prose (failure)", () => {
    expect(ORE_NODE.cooldownMs).toBe(90_000);
    expect(ORE_NODE.yieldQty).toBe(1);
    expect(oreNodeReadyEdgeCueText()).not.toMatch(/\d/);
    expect(oreNodeReadyEdgeCueText()).not.toBe(ORE_COOLDOWN_REFUSE_CUE);
    expect(oreNodeReadyEdgeCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|always-on/,
    );
    expect(isCoreSuccessCueText("Ready forever sticky")).toBe(false);
    expect(shouldFlashOreNodeReadyEdgeCue(new Set(), new Set(["x"]))).toBe(
      true,
    );
    expect(shouldFlashOreNodeReadyEdgeCue(null, new Set(["x"]))).toBe(false);
  });
});
