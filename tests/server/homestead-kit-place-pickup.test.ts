import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  kitItemIdForStation,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-homestead-place-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const {
  placeStationKit,
  pickupLandStation,
  placeLandStation,
} = await import("../../apps/server/src/game/actions/build.ts");
const { inventory, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return { x: WORLD.GRID * board.x, z: WORLD.GRID * board.z };
}

describe("homestead kit place + pickup", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `hsp_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: BUILDER_PLACE_XP })
      .where(eq(players.userId, userId))
      .run();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("places kit on free cell then picks up from the editor (happy)", () => {
    const home = getPlayerState(userId)!;
    const kitId = kitItemIdForStation("kitchen");
    addItem(home.playerId, kitId, 1);
    const kitRow = db
      .select()
      .from(inventory)
      .where(eq(inventory.playerId, home.playerId))
      .all()
      .find((r) => r.itemId === kitId)!;
    expect(kitRow).toBeTruthy();

    expect(placeStationKit(userId, kitRow.id, 1, 1).ok).toBe(true);
    const afterPlace = getPlayerState(userId)!;
    const kitchen = afterPlace.buildings.find((b) => b.type === "kitchen");
    expect(kitchen).toBeTruthy();
    expect(kitchen!.x).toBe(1);
    expect(kitchen!.z).toBe(1);
    expect(
      afterPlace.inventory.some((i) => i.itemId === kitId),
    ).toBe(false);

    const pickup = pickupLandStation(userId, kitchen!.id, { x: 99, z: 99 });
    expect(pickup.ok).toBe(true);
    const afterPickup = getPlayerState(userId)!;
    expect(afterPickup.buildings.some((b) => b.type === "kitchen")).toBe(
      false,
    );
    expect(afterPickup.inventory.some((i) => i.itemId === kitId)).toBe(true);
  });

  it("refuses occupied cell (edge)", () => {
    const home = getPlayerState(userId)!;
    const board = home.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
    expect(
      placeLandStation(userId, "workshop", boardPos(home)).ok,
    ).toBe(true);
    const again = getPlayerState(userId)!;
    const kitId = kitItemIdForStation("crop_plot");
    addItem(again.playerId, kitId, 1);
    const kitRow = db
      .select()
      .from(inventory)
      .where(eq(inventory.playerId, again.playerId))
      .all()
      .find((r) => r.itemId === kitId)!;
    const workshop = again.buildings.find((b) => b.type === "workshop")!;
    const blocked = placeStationKit(
      userId,
      kitRow.id,
      workshop.x,
      workshop.z,
    );
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toBe(ACTION_ERROR.buildCellOccupied);
    }
    void board;
  });

  it("places decor kit and picks up at board (happy)", () => {
    const home = getPlayerState(userId)!;
    addItem(home.playerId, "planter_kit", 1);
    const kitRow = db
      .select()
      .from(inventory)
      .where(eq(inventory.playerId, home.playerId))
      .all()
      .find((r) => r.itemId === "planter_kit")!;
    expect(placeStationKit(userId, kitRow.id, -1, 2).ok).toBe(true);
    const after = getPlayerState(userId)!;
    const planter = after.buildings.find((b) => b.type === "decor_planter");
    expect(planter).toBeTruthy();
    expect(
      pickupLandStation(userId, planter!.id, { x: 40, z: 40 }).ok,
    ).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.some((i) => i.itemId === "planter_kit"),
    ).toBe(true);
  });

  it("picks up without walking to a board (failure-was-proximity)", () => {
    const home = getPlayerState(userId)!;
    expect(placeLandStation(userId, "kitchen", boardPos(home)).ok).toBe(true);
    const kitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    const far = pickupLandStation(userId, kitchen.id, { x: 50, z: 50 });
    expect(far.ok).toBe(true);
  });
});
