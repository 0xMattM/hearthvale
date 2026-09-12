import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ORE_NODE,
  oreChipInteractLabel,
} from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import type { BuildingDto } from "@game/shared";

function oreBuilding(): BuildingDto {
  return {
    id: "ore_1",
    type: "ore_node",
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
  };
}

/**
 * PL21.2 — Broken / missing tool refuse clarity (names Iron Hammer; soft refuse).
 */
describe("CityLands PL21.2 broken tool refuse clarity", () => {
  it("names Iron Hammer in broken + equip refuse copy and prompt (happy)", () => {
    expect(ACTION_ERROR.needHammerBroken).toContain("Iron Hammer");
    expect(ACTION_ERROR.needHammerBroken.toLowerCase()).toContain("broke");
    expect(ACTION_ERROR.needHammer).toContain("Iron Hammer");
    expect(ACTION_ERROR.needHammer.toLowerCase()).toContain("equip");

    expect(oreChipInteractLabel(ORE_NODE.requiredTool, true)).toBe(
      "Chip iron ore (Iron Hammer)",
    );
    expect(oreChipInteractLabel(null, true)).toBe(
      "Chip iron ore · equip Iron Hammer",
    );
    expect(oreChipInteractLabel(null, false)).toBe(
      "Need Iron Hammer · forge or buy",
    );

    expect(isSoftRefuseError(ACTION_ERROR.needHammer)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needHammerBroken)).toBe(true);
  });

  it("keeps classic ore prompt when tool state omitted; explore prefix still works (edge)", () => {
    expect(oreChipInteractLabel()).toBe("Chip iron ore (Iron Hammer)");
    expect(
      resolveInteractPrompt({
        target: { kind: "building", dist: 1, building: oreBuilding() },
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "explore",
      }),
    ).toEqual({
      label: "Mines · Chip iron ore (Iron Hammer)",
      showKey: true,
    });
    expect(
      resolveInteractPrompt({
        target: { kind: "building", dist: 1, building: oreBuilding() },
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "land",
        equippedToolItemId: null,
        hasRequiredOreTool: false,
      }),
    ).toEqual({
      label: "Need Iron Hammer · forge or buy",
      showKey: true,
    });
  });

  it("does not soft-refuse unrelated errors; wrong tool still names hammer (failure)", () => {
    expect(isSoftRefuseError(ACTION_ERROR.tooFar)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.missingMaterials)).toBe(true);
    expect(oreChipInteractLabel("wooden_hoe", false)).toBe(
      "Need Iron Hammer · forge or buy",
    );
    expect(oreChipInteractLabel("wooden_hoe", true)).toBe(
      "Chip iron ore · equip Iron Hammer",
    );
  });
});
