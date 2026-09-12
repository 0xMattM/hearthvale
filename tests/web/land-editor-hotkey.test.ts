import { describe, expect, it } from "vitest";
import { nextSlotExpansion } from "@game/shared";
import {
  resolveContextualWalkAway,
  resolvePanelHotkey,
} from "../../apps/web/lib/hud/panel-orchestration";
import {
  findInteractTarget,
  GRID,
} from "../../apps/web/components/land-scene/landProximity";
import type { BuildingDto } from "@game/shared";

function plot(
  partial: Partial<BuildingDto> & Pick<BuildingDto, "id" | "x" | "z" | "slotIndex">,
): BuildingDto {
  return {
    type: "crop_plot",
    cropState: "empty",
    readyAt: null,
    cropId: null,
    plantedAt: null,
    tier: 1,
    claim: null,
    tutorialNpcId: null,
    ...partial,
  };
}

describe("player-land editor hotkey (P)", () => {
  it("toggles the land editor on own player land (happy)", () => {
    const open = resolvePanelHotkey(
      { code: "KeyP", repeat: false, target: null },
      { visiting: false, onPlayerLand: true },
    );
    expect(open).toEqual({ action: "toggle", panel: "build" });
  });

  it("stays closed while visiting or off player land (edge)", () => {
    expect(
      resolvePanelHotkey(
        { code: "KeyP", repeat: false, target: null },
        { visiting: true, onPlayerLand: true },
      ),
    ).toEqual({ action: "none" });
    expect(
      resolvePanelHotkey(
        { code: "KeyP", repeat: false, target: null },
        { visiting: false, onPlayerLand: false },
      ),
    ).toEqual({ action: "none" });
  });

  it("does not walk-away close the editor or treat expand pads as interact (failure)", () => {
    expect(
      resolveContextualWalkAway({
        panel: "build",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: null,
      }),
    ).toEqual({ close: false });

    const next = nextSlotExpansion([]);
    expect(next).toBeDefined();
    const t = findInteractTarget(
      [
        {
          ...plot({ id: "board", x: 0, z: 1, slotIndex: 20 }),
          type: "build_board",
        },
      ],
      next!.x * GRID,
      next!.z * GRID,
    );
    expect(t).toBeNull();
  });
});
