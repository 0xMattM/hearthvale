import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { ACTION_ERROR, WORLD } from "@game/shared";

const dbFile = path.join(
  os.tmpdir(),
  `game-mvp-actions-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import("../../apps/server/src/db/client.ts");
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { plantCrop, harvestCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { getPlayerState, ensureStarterYardBuildings } = await import("../../apps/server/src/game/player.ts");
const { buildings } = await import("../../apps/server/src/db/schema.ts");

/** World-space position at a building's grid cell center. */
function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("server farm/craft actions P2.1", () => {
  let userId = "";
  let token = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(`farmer_${Date.now()}`, "testpass");
    expect(reg.ok).toBe(true);
    token = reg.token!;
    const uid = userIdFromToken(token);
    expect(uid).toBeTruthy();
    userId = uid!;
    ensureStarterYardBuildings(getPlayerState(userId)!.landId);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("plants wheat on an empty field (happy path)", () => {
    const state = getPlayerState(userId);
    expect(state).toBeTruthy();
    const field = state!.buildings.find((b) => b.type === "crop_plot");
    expect(field).toBeTruthy();

    const result = plantCrop(userId, field!.id, "wheat_seed", buildingPos(field!));
    expect(result.ok).toBe(true);

    const after = getPlayerState(userId)!;
    const planted = after.buildings.find((b) => b.id === field!.id);
    expect(planted?.cropState).toBe("planted");
    expect(planted?.readyAt).toBeTruthy();
  });

  it("rejects harvest while growing (failure)", () => {
    const state = getPlayerState(userId)!;
    const planted = state.buildings.find(
      (b) => b.type === "crop_plot" && b.cropState === "planted",
    );
    expect(planted).toBeTruthy();
    const result = harvestCrop(userId, planted!.id, buildingPos(planted!));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.cropNotReady);
  });

  it("harvests after readyAt (edge: force ready)", () => {
    const state = getPlayerState(userId)!;
    const planted = state.buildings.find(
      (b) => b.type === "crop_plot" && b.cropState === "planted",
    )!;
    db.update(buildings)
      .set({ readyAt: Date.now() - 1000 })
      .where(eq(buildings.id, planted.id))
      .run();

    const result = harvestCrop(userId, planted.id, buildingPos(planted));
    expect(result.ok).toBe(true);
    const after = getPlayerState(userId)!;
    const wheat = after.inventory.find((i) => i.itemId === "wheat");
    expect((wheat?.qty ?? 0) > 0).toBe(true);
  });

  it("mills flour at station (happy path)", () => {
    const mill = getPlayerState(userId)!.buildings.find((b) => b.type === "mill")!;
    const result = craftRecipeComplete(userId, "mill_flour", buildingPos(mill));
    expect(result.ok).toBe(true);
    const after = getPlayerState(userId)!;
    expect(after.inventory.some((i) => i.itemId === "flour")).toBe(true);
  });

  it("blocks gated forge recipe without XP (failure)", () => {
    const forge = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "forge",
    )!;
    const result = craftRecipeComplete(userId, "forge_iron_hoe", buildingPos(forge));
    expect(result.ok).toBe(false);
    expect(result.error?.toLowerCase()).toContain("xp");
  });

  it("vendor refuses unknown buy (failure)", async () => {
    const { vendorBuy } = await import(
      "../../apps/server/src/game/actions/vendor.ts"
    );
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const result = vendorBuy(userId, "iron_hammer", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERROR.vendorWontSell);
  });
});
