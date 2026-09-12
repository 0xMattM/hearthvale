import { describe, expect, it } from "vitest";
import {
  GATHER_NODE_DEPLETED_CUE,
  gatherOreDepletedPad,
  gatherStumpWorldVisual,
} from "@game/shared";
import { oreVisual } from "../../apps/web/lib/resource-visuals";

/**
 * PL12.2 — Gather node depleted world cue (quiet pad + tint vs ready).
 * Choice: shared SoT for stump + ore so land/explore meshes stay consistent.
 */
describe("CityLands PL12.2 gather node depleted cue", () => {
  it("shows depleted stump pad and duller top vs ready (happy)", () => {
    const ready = gatherStumpWorldVisual(true, false);
    const depleted = gatherStumpWorldVisual(false, false);

    expect(ready.showDepletedPad).toBe(false);
    expect(ready.padOpacity).toBe(0);
    expect(ready.topColor).toBe(GATHER_NODE_DEPLETED_CUE.stumpReadyTop);
    expect(ready.bodyColor).toBe(GATHER_NODE_DEPLETED_CUE.stumpReadyBody);

    expect(depleted.showDepletedPad).toBe(true);
    expect(depleted.padOpacity).toBeGreaterThan(0);
    expect(depleted.padColor).toBe(GATHER_NODE_DEPLETED_CUE.stumpDepletedPad);
    expect(depleted.topColor).toBe(GATHER_NODE_DEPLETED_CUE.stumpDepletedTop);
    expect(depleted.topColor).not.toBe(ready.topColor);
    expect(depleted.bodyColor).not.toBe(ready.bodyColor);
  });

  it("ores get depleted pad only when cooling; ready rock stays bright (edge)", () => {
    const readyPad = gatherOreDepletedPad(true);
    const coolPad = gatherOreDepletedPad(false);
    expect(readyPad.show).toBe(false);
    expect(readyPad.opacity).toBe(0);
    expect(coolPad.show).toBe(true);
    expect(coolPad.opacity).toBe(GATHER_NODE_DEPLETED_CUE.oreDepletedPadOpacity);
    expect(coolPad.color).toBe(GATHER_NODE_DEPLETED_CUE.oreDepletedPad);

    const readyOre = oreVisual(true, false);
    const coolOre = oreVisual(false, false);
    expect(readyOre.rockColor).toBe(GATHER_NODE_DEPLETED_CUE.oreReadyRock);
    expect(coolOre.rockColor).toBe(GATHER_NODE_DEPLETED_CUE.oreDepletedRock);
    expect(coolOre.veinIntensity).toBe(0);
    expect(readyOre.veinIntensity).toBeGreaterThan(0);
  });

  it("rejects identical ready/depleted palettes (failure)", () => {
    expect(GATHER_NODE_DEPLETED_CUE.stumpReadyTop).not.toBe(
      GATHER_NODE_DEPLETED_CUE.stumpDepletedTop,
    );
    expect(GATHER_NODE_DEPLETED_CUE.stumpReadyBody).not.toBe(
      GATHER_NODE_DEPLETED_CUE.stumpDepletedBody,
    );
    expect(GATHER_NODE_DEPLETED_CUE.oreReadyRock).not.toBe(
      GATHER_NODE_DEPLETED_CUE.oreDepletedRock,
    );
    const highlightedDepleted = gatherStumpWorldVisual(false, true);
    expect(highlightedDepleted.showDepletedPad).toBe(true);
    expect(gatherOreDepletedPad(true).show).toBe(false);
  });
});
