import { describe, expect, it } from "vitest";
import {
  ANIMAL_PEN,
  GATHER_READY_WORLD_SOFT,
  PLAYER_LAND_STATIONS,
  gatherStationReadyWorldLabelParts,
  isGatherReadyLabelBuilding,
} from "@game/shared";

/**
 * PL30.2 — Animal pen ready world label.
 * Choice: same Ready hierarchy as dock/tree/ore; shared care cooldown;
 * no livestock spawn invent; depleted stay quiet pad/timer.
 */
describe("CityLands PL30.2 animal pen ready world label", () => {
  it("leads with Animal Pen and soft Ready (happy)", () => {
    const parts = gatherStationReadyWorldLabelParts("animal_pen");
    expect(parts.name).toBe(PLAYER_LAND_STATIONS.animal_pen.name);
    expect(parts.name).toBe("Animal Pen");
    expect(parts.soft).toBe(GATHER_READY_WORLD_SOFT);
    expect(parts.soft).toBe("Ready");
  });

  it("maps pen as gather-ready label; care costs / CD unchanged (edge)", () => {
    expect(isGatherReadyLabelBuilding("animal_pen")).toBe(true);
    expect(ANIMAL_PEN.cooldownMs).toBe(45_000);
    expect(ANIMAL_PEN.feedItemId).toBe("wheat");
    expect(ANIMAL_PEN.feedQty).toBe(1);
    expect(ANIMAL_PEN.cleanItemId).toBe("wood");
    expect(ANIMAL_PEN.cleanQty).toBe(1);
    expect(ANIMAL_PEN.xp).toBe(5);
    expect(PLAYER_LAND_STATIONS.animal_pen.kitItemId).toBe("animal_pen_kit");
  });

  it("keeps name ahead of soft; rejects crop / hunt types (failure)", () => {
    expect(isGatherReadyLabelBuilding("crop_plot")).toBe(false);
    expect(isGatherReadyLabelBuilding("game_trail")).toBe(false);
    const parts = gatherStationReadyWorldLabelParts("animal_pen");
    expect(parts.name.toLowerCase()).not.toBe(parts.soft.toLowerCase());
    expect(parts.name.length).toBeGreaterThan(parts.soft.length);
    expect(parts.soft).toBe("Ready");
  });
});
