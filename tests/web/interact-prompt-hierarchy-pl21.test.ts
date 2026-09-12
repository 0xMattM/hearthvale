import { describe, expect, it } from "vitest";
import type { BuildingDto } from "@game/shared";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import { buildInteractPromptHierarchy } from "../../apps/web/lib/hud/interact-prompt-hierarchy";
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

/**
 * PL2.1 — Interact prompt action-first hierarchy (key badge + verb).
 */
describe("CityLands PL2.1 interact prompt hierarchy", () => {
  it("splits key + verb + detail for a near actionable station (happy)", () => {
    const prompt = resolveInteractPrompt({
      target: buildingTarget("crop_plot", { cropState: "empty" }),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
    });
    expect(prompt).toEqual({ label: "Plant seed", showKey: true });

    const hierarchy = buildInteractPromptHierarchy(
      prompt!.label,
      prompt!.showKey,
    );
    expect(hierarchy).toEqual({
      keyLabel: "E",
      prefix: null,
      verb: "Plant",
      detail: "seed",
    });
  });

  it("softens explore section as prefix; verb stays action-first (happy)", () => {
    const prompt = resolveInteractPrompt({
      target: buildingTarget("tree_stump"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "explore",
    });
    expect(prompt?.label).toBe("Woodland · Chop wood");
    expect(
      buildInteractPromptHierarchy(prompt!.label, prompt!.showKey),
    ).toEqual({
      keyLabel: "E",
      prefix: "Woodland",
      verb: "Chop",
      detail: "wood",
    });
  });

  it("returns null with no nearby target (empty-null edge)", () => {
    expect(
      resolveInteractPrompt({
        target: null,
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toBeNull();
  });

  it("omits key badge on status-only prompts (edge)", () => {
    const prompt = resolveInteractPrompt({
      target: buildingTarget("crop_plot", {
        cropState: "planted",
        readyAt: 60_000,
      }),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
    });
    expect(prompt?.showKey).toBe(false);
    expect(prompt?.label).toMatch(/^Growing/);
    const hierarchy = buildInteractPromptHierarchy(
      prompt!.label,
      prompt!.showKey,
    );
    expect(hierarchy.keyLabel).toBeNull();
    expect(hierarchy.verb).toBe("Growing");
  });

  it("returns empty verb for blank label (failure)", () => {
    expect(buildInteractPromptHierarchy("   ", true)).toEqual({
      keyLabel: null,
      prefix: null,
      verb: "",
      detail: "",
    });
  });
});
