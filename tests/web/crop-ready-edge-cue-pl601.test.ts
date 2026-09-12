import { describe, expect, it } from "vitest";
import { CROPS } from "@game/shared";
import {
  clientCropState,
  readyCropPlotIds,
} from "../../apps/web/components/land-scene/landProximity";
import {
  CROP_NOT_READY_REFUSE_CUE,
  CROP_READY_EDGE_CUE,
  cropReadyEdgeCueText,
  isCoreSuccessCueText,
  shouldFlashCropReadyEdgeCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import type { BuildingDto } from "@game/shared";

function plot(
  id: string,
  readyAt: number | null,
  cropState: BuildingDto["cropState"] = "planted",
): BuildingDto {
  return {
    id,
    type: "crop_plot",
    slotIndex: 0,
    x: 0,
    z: 0,
    tier: 1,
    cropState,
    cropId: "wheat",
    plantedAt: readyAt != null ? readyAt - CROPS.wheat.growMs : null,
    readyAt,
    claim: null,
    tutorialNpcId: null,
  };
}

/**
 * PL60.1 — Crop ready soft world cue (edge into ready).
 * Brief TopBar `Ready` when a plot first becomes harvestable;
 * complements pulse/label; grow timers / yields unchanged; mute ok.
 */
describe("CityLands PL60.1 crop ready edge soft cue", () => {
  it("flashes Ready when a plot edges into harvest-ready (happy)", () => {
    expect(cropReadyEdgeCueText()).toBe(CROP_READY_EDGE_CUE);
    expect(cropReadyEdgeCueText()).toBe("Ready");
    expect(isCoreSuccessCueText("Ready")).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);

    const prev = new Set<string>();
    const next = new Set(["plot-a"]);
    expect(shouldFlashCropReadyEdgeCue(prev, next)).toBe(true);

    const now = 10_000;
    const buildings = [plot("plot-a", now - 1), plot("plot-b", now + 5_000)];
    expect(readyCropPlotIds(buildings, now)).toEqual(["plot-a"]);
    expect(clientCropState(buildings[0]!, now)).toBe("ready");
    expect(clientCropState(buildings[1]!, now)).toBe("planted");
  });

  it("stays quiet on hydrate, same ready set, or harvest clear (edge)", () => {
    expect(shouldFlashCropReadyEdgeCue(null, new Set(["plot-a"]))).toBe(false);
    expect(shouldFlashCropReadyEdgeCue(undefined, new Set(["plot-a"]))).toBe(
      false,
    );
    expect(
      shouldFlashCropReadyEdgeCue(new Set(["plot-a"]), new Set(["plot-a"])),
    ).toBe(false);
    expect(shouldFlashCropReadyEdgeCue(new Set(["plot-a"]), new Set())).toBe(
      false,
    );
    // Second plot ripening while first already ready still flashes once.
    expect(
      shouldFlashCropReadyEdgeCue(
        new Set(["plot-a"]),
        new Set(["plot-a", "plot-b"]),
      ),
    ).toBe(true);
  });

  it("keeps grow timers / yields and refuses sticky prose (failure)", () => {
    expect(CROPS.wheat.growMs).toBe(3 * 60 * 1000);
    expect(CROPS.wheat.harvestQty).toBe(2);
    expect(cropReadyEdgeCueText()).not.toMatch(/\d/);
    expect(cropReadyEdgeCueText()).not.toBe(CROP_NOT_READY_REFUSE_CUE);
    expect(cropReadyEdgeCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|always-on/,
    );
    expect(isCoreSuccessCueText("Ready forever sticky")).toBe(false);
    expect(shouldFlashCropReadyEdgeCue(new Set(), new Set(["x"]))).toBe(true);
    expect(shouldFlashCropReadyEdgeCue(null, new Set(["x"]))).toBe(false);
  });
});
