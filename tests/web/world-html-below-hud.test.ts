import { describe, expect, it } from "vitest";
import {
  HUD_OVERLAY_Z_INDEX,
  HUD_PANEL_DIM_Z_INDEX,
  LAND_SCENE_STACK_CLASS,
  WORLD_LABEL_Z_INDEX_RANGE,
  worldLabelsStayBelowHud,
} from "../../apps/web/lib/hud/world-html-layer";

/**
 * World Html must not cover HUD panels (Vendor tag over Miner Tutor, etc.).
 */
describe("world Html stays below HUD menus", () => {
  it("keeps the world-label range under panel overlay (happy)", () => {
    expect(WORLD_LABEL_Z_INDEX_RANGE[0]).toBe(2);
    expect(WORLD_LABEL_Z_INDEX_RANGE[1]).toBe(0);
    expect(worldLabelsStayBelowHud()).toBe(true);
    expect(HUD_OVERLAY_Z_INDEX).toBeGreaterThan(HUD_PANEL_DIM_Z_INDEX);
    expect(LAND_SCENE_STACK_CLASS).toBe("land-scene");
  });

  it("treats equal z as covering the menu (edge)", () => {
    expect(worldLabelsStayBelowHud([5, 0], 5)).toBe(false);
    expect(worldLabelsStayBelowHud([4, 4], 5)).toBe(true);
    expect(worldLabelsStayBelowHud([3, 0], HUD_PANEL_DIM_Z_INDEX)).toBe(true);
  });

  it("refuses Drei default Html range that would paint over menus (failure)", () => {
    const dreiDefault: [number, number] = [16777271, 0];
    expect(worldLabelsStayBelowHud(dreiDefault)).toBe(false);
    expect(Math.max(...dreiDefault)).toBeGreaterThan(HUD_OVERLAY_Z_INDEX);
  });
});
