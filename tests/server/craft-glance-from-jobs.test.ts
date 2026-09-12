import { describe, expect, it } from "vitest";
import {
  craftGlanceFromJobs,
  craftGlancesFromJobRows,
  groupCraftJobsByBuilding,
  landKindExclusiveCraft,
} from "../../apps/server/src/game/craft-glance.ts";

describe("batched craft glance (interact latency)", () => {
  it("returns your working/ready job and groups by station (happy)", () => {
    expect(landKindExclusiveCraft("player_land")).toBe(true);
    const working = craftGlanceFromJobs(
      [{ playerId: "p1", recipeId: "mill_flour", readyAt: 9_000 }],
      "p1",
      "player_land",
      1_000,
    );
    expect(working).toEqual({
      recipeId: "mill_flour",
      readyAt: 9_000,
      state: "working",
      isYours: true,
    });
    const ready = craftGlanceFromJobs(
      [{ playerId: "p1", recipeId: "mill_flour", readyAt: 500 }],
      "p1",
      "player_land",
      1_000,
    );
    expect(ready?.state).toBe("ready");

    const grouped = groupCraftJobsByBuilding([
      {
        buildingId: "mill",
        playerId: "p1",
        recipeId: "mill_flour",
        readyAt: 9_000,
      },
      {
        buildingId: "forge",
        playerId: "p1",
        recipeId: "forge_ingot",
        readyAt: 9_000,
      },
    ]);
    expect(grouped.get("mill")).toHaveLength(1);
    expect(grouped.get("forge")).toHaveLength(1);

    const glances = craftGlancesFromJobRows(
      ["mill", "forge", "idle"],
      [
        {
          buildingId: "mill",
          playerId: "p1",
          recipeId: "mill_flour",
          readyAt: 9_000,
        },
      ],
      "p1",
      "player_land",
      1_000,
    );
    expect(glances.get("mill")?.isYours).toBe(true);
    expect(glances.has("idle")).toBe(false);
  });

  it("hides city peer jobs and empty stations (edge)", () => {
    expect(
      craftGlanceFromJobs(
        [{ playerId: "other", recipeId: "mill_flour", readyAt: 9_000 }],
        "p1",
        "city",
        1_000,
      ),
    ).toBeNull();
    expect(craftGlanceFromJobs([], "p1", "player_land", 1_000)).toBeNull();
    expect(landKindExclusiveCraft("warrior")).toBe(false);
  });

  it("shows land peer Busy without recipe; unknown station stays idle (failure)", () => {
    const peer = craftGlanceFromJobs(
      [{ playerId: "other", recipeId: "mill_flour", readyAt: 500 }],
      "p1",
      "player_land",
      1_000,
    );
    expect(peer).toEqual({
      recipeId: null,
      readyAt: null,
      state: "ready",
      isYours: false,
    });
    const glances = craftGlancesFromJobRows(
      ["missing"],
      [],
      "p1",
      "player_land",
      1_000,
    );
    expect(glances.has("missing")).toBe(false);
  });
});
