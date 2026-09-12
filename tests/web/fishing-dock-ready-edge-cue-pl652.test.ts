import { describe, expect, it } from "vitest";
import { FISHING_DOCK } from "@game/shared";
import {
  oreNodeReady,
  readyFishingDockIds,
} from "../../apps/web/components/land-scene/landProximity";
import {
  CROP_READY_EDGE_CUE,
  FISHING_DOCK_COOLDOWN_REFUSE_CUE,
  FISHING_DOCK_READY_EDGE_CUE,
  fishingDockReadyEdgeCueText,
  isCoreSuccessCueText,
  shouldFlashFishingDockReadyEdgeCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import type { BuildingDto } from "@game/shared";

function dock(id: string, readyAt: number | null): BuildingDto {
  return {
    id,
    type: "fishing_dock",
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
 * PL65.2 — Fishing dock ready soft cue (edge into cast-ready after cooldown).
 * Brief TopBar `Ready`; cooldown / yields unchanged; mute ok.
 */
describe("CityLands PL65.2 fishing dock ready edge soft cue", () => {
  it("flashes Ready when a dock edges into cast-ready after cooldown (happy)", () => {
    expect(fishingDockReadyEdgeCueText()).toBe(FISHING_DOCK_READY_EDGE_CUE);
    expect(fishingDockReadyEdgeCueText()).toBe("Ready");
    expect(fishingDockReadyEdgeCueText()).toBe(CROP_READY_EDGE_CUE);
    expect(isCoreSuccessCueText("Ready")).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);

    const prev = new Set<string>();
    const next = new Set(["dock-a"]);
    expect(shouldFlashFishingDockReadyEdgeCue(prev, next)).toBe(true);

    const now = 10_000;
    const buildings = [
      dock("dock-a", now - 1),
      dock("dock-b", now + FISHING_DOCK.cooldownMs),
      dock("dock-fresh", null),
    ];
    expect(readyFishingDockIds(buildings, now)).toEqual(["dock-a"]);
    expect(oreNodeReady(buildings[0]!, now)).toBe(true);
    expect(oreNodeReady(buildings[1]!, now)).toBe(false);
    expect(oreNodeReady(buildings[2]!, now)).toBe(true);
  });

  it("stays quiet on hydrate, never-cast place, same ready set, or clear (edge)", () => {
    expect(shouldFlashFishingDockReadyEdgeCue(null, new Set(["dock-a"]))).toBe(
      false,
    );
    expect(
      shouldFlashFishingDockReadyEdgeCue(undefined, new Set(["dock-a"])),
    ).toBe(false);
    expect(
      shouldFlashFishingDockReadyEdgeCue(
        new Set(["dock-a"]),
        new Set(["dock-a"]),
      ),
    ).toBe(false);
    expect(
      shouldFlashFishingDockReadyEdgeCue(new Set(["dock-a"]), new Set()),
    ).toBe(false);
    // Never-cast (null readyAt) is not in the ready-edge set.
    expect(readyFishingDockIds([dock("fresh", null)], 10_000)).toEqual([]);
    // Second dock finishing cooldown while first already ready still flashes once.
    expect(
      shouldFlashFishingDockReadyEdgeCue(
        new Set(["dock-a"]),
        new Set(["dock-a", "dock-b"]),
      ),
    ).toBe(true);
  });

  it("keeps cooldown / yields and refuses sticky prose (failure)", () => {
    expect(FISHING_DOCK.cooldownMs).toBe(60_000);
    expect(FISHING_DOCK.yieldQty).toBe(1);
    expect(fishingDockReadyEdgeCueText()).not.toMatch(/\d/);
    expect(fishingDockReadyEdgeCueText()).not.toBe(
      FISHING_DOCK_COOLDOWN_REFUSE_CUE,
    );
    expect(fishingDockReadyEdgeCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|always-on/,
    );
    expect(isCoreSuccessCueText("Ready forever sticky")).toBe(false);
    expect(shouldFlashFishingDockReadyEdgeCue(new Set(), new Set(["x"]))).toBe(
      true,
    );
    expect(shouldFlashFishingDockReadyEdgeCue(null, new Set(["x"]))).toBe(
      false,
    );
  });
});
