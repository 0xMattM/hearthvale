import { describe, expect, it } from "vitest";
import { LIVE_COMBAT } from "@game/shared";
import { findAutoEngagePrey } from "../../apps/web/lib/hud/combat-engage.ts";
import type { BuildingDto } from "@game/shared";

function trailAt(x: number, z: number): BuildingDto {
  return {
    id: "trail-1",
    type: "game_trail",
    slotIndex: 0,
    x,
    z,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt: null,
    craft: null,
    claim: null,
    tutorialNpcId: null,
  };
}

describe("RPG hunt auto-engage", () => {
  it("starts an encounter in the grass around the den (happy)", () => {
    const building = trailAt(0, 0);
    const pos = { x: LIVE_COMBAT.wanderRadius, z: 0 };
    expect(findAutoEngagePrey([building], pos, 0)?.id).toBe("trail-1");
  });

  it("ignores a cooling trail (edge)", () => {
    const building = { ...trailAt(0, 0), readyAt: 50_000 };
    expect(
      findAutoEngagePrey([building], { x: 0, z: 0 }, 1_000),
    ).toBeUndefined();
  });

  it("does not engage from across the entry road (failure)", () => {
    const building = trailAt(0, 0);
    const pos = { x: LIVE_COMBAT.wanderRadius + LIVE_COMBAT.aggroRange + 4, z: 0 };
    expect(findAutoEngagePrey([building], pos, 0)).toBeUndefined();
  });
});
