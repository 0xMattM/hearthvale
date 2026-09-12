import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, CROPS, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-multi-crop-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { plantCrop, harvestCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { getPlayerState, addItem, ensureStarterYardBuildings } = await import(
  "../../apps/server/src/game/player.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("multi-crop plant and harvest", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`mcrop_${Date.now()}`, "testpass1");
    expect(reg.ok).toBe(true);
    userId = userIdFromToken(reg.token!)!;
    ensureStarterYardBuildings(getPlayerState(userId)!.landId);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("plants corn and harvests corn (not wheat) when ready (happy)", () => {
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!
      .id;
    addItem(pid, "corn_seed", 2);
    const plot = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "crop_plot" && b.cropState === "empty",
    );
    expect(plot).toBeTruthy();
    expect(plantCrop(userId, plot!.id, "corn_seed", buildingPos(plot!)).ok).toBe(
      true,
    );

    const planted = getPlayerState(userId)!.buildings.find(
      (b) => b.id === plot!.id,
    )!;
    expect(planted.cropId).toBe("corn");
    expect(planted.readyAt).toBeGreaterThan(Date.now() + CROPS.corn.growMs - 5_000);

    db.update(buildings)
      .set({ readyAt: Date.now() - 1000 })
      .where(eq(buildings.id, planted.id))
      .run();

    const cornBefore =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "corn")?.qty ??
      0;
    expect(harvestCrop(userId, planted.id, buildingPos(planted)).ok).toBe(true);
    const cornAfter =
      getPlayerState(userId)!.inventory.find((i) => i.itemId === "corn")?.qty ??
      0;
    expect(cornAfter).toBeGreaterThan(cornBefore);
  });

  it("uses potato grow window, longer than wheat (edge)", () => {
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!
      .id;
    addItem(pid, "potato_seed", 1);
    const plot = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "crop_plot" && b.cropState === "empty",
    );
    expect(plot).toBeTruthy();
    const now = Date.now();
    expect(
      plantCrop(userId, plot!.id, "potato_seed", buildingPos(plot!)).ok,
    ).toBe(true);
    const planted = getPlayerState(userId)!.buildings.find(
      (b) => b.id === plot!.id,
    )!;
    expect(planted.cropId).toBe("potato");
    expect(planted.readyAt).toBeGreaterThan(now + CROPS.wheat.growMs);
  });

  it("rejects planting an item that is not a seed (failure)", () => {
    const plot = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "crop_plot" && b.cropState === "empty",
    );
    expect(plot).toBeTruthy();
    const result = plantCrop(userId, plot!.id, "iron_ore", buildingPos(plot!));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.unknownSeed);
  });
});
