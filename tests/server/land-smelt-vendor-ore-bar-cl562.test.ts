import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  WORLD,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl562-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState, addItem, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { gatherOre } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock — City/Land iron_ore NPC buyback; bars stay craft hold (no NPC rate). */
const CITY_ORE_SELL = 1;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

function equipHammer(uid: string) {
  const pid = db.select().from(players).where(eq(players.userId, uid)).get()!
    .id;
  addItem(pid, "iron_hammer", 1);
  const hammer = getPlayerState(uid)!.inventory.find(
    (i) => i.itemId === "iron_hammer",
  )!;
  db.update(players)
    .set({ equippedToolInventoryId: hammer.id })
    .where(eq(players.id, pid))
    .run();
}

describe("CityLands CL56.2 land smelt → City vendor ore/bar sink smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl562_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("smelts bar then sells leftover ore at City while holding bar (happy)", () => {
    expect(getRecipe("smelt_iron_bar")!.output.itemId).toBe("iron_bar");
    expect(getVendorPrices("city").sell.iron_ore).toBe(CITY_ORE_SELL);
    // Reason: bars are craft hold — no invent NPC rate for iron_bar.
    expect(getVendorPrices("city").sell.iron_bar).toBeUndefined();

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const nodes = explore.buildings.filter((b) => b.type === "ore_node");
    expect(nodes.length).toBeGreaterThanOrEqual(3);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, explore.playerId))
      .run();
    const leftoverOre = explore.inventory
      .filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverOre > 0) removeItem(explore.playerId, "iron_ore", leftoverOre);

    equipHammer(userId);
    // Reason: smelt needs 2; keep 1 ore for City sink after craft.
    for (const node of nodes.slice(0, 3)) {
      db.update(players)
        .set({ energy: 100 })
        .where(eq(players.id, explore.playerId))
        .run();
      expect(gatherOre(userId, node.id, buildingPos(node)).ok).toBe(true);
    }
    const afterChip = getPlayerState(userId)!;
    expect(
      afterChip.inventory
        .filter((s) => s.itemId === "iron_ore")
        .reduce((n, s) => n + s.qty, 0),
    ).toBeGreaterThanOrEqual(3);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({
        softCurrency: 200,
        energy: 100,
        builderXp: BUILDER_PLACE_XP,
      })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "iron_bar", 2);
    addItem(home.playerId, "wood", 2);

    expect(placeLandStation(userId, "forge", boardPos(home)).ok).toBe(true);
    const land = getPlayerState(userId)!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    expect(forge).toBeTruthy();

    // Clear place leftover bars so post-smelt hold assert is the smelted bar.
    const placeBars = land.inventory
      .filter((s) => s.itemId === "iron_bar")
      .reduce((n, s) => n + s.qty, 0);
    if (placeBars > 0) removeItem(land.playerId, "iron_bar", placeBars);

    expect(craftRecipeComplete(userId, "smelt_iron_bar", buildingPos(forge)).ok).toBe(
      true,
    );
    const afterSmelt = getPlayerState(userId)!;
    expect(
      afterSmelt.inventory.some((s) => s.itemId === "iron_bar" && s.qty >= 1),
    ).toBe(true);
    expect(
      afterSmelt.inventory
        .filter((s) => s.itemId === "iron_ore")
        .reduce((n, s) => n + s.qty, 0),
    ).toBeGreaterThanOrEqual(1);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(stall).toBeTruthy();
    db.update(players)
      .set({ softCurrency: 40 })
      .where(eq(players.id, city.playerId))
      .run();
    const coinsBefore = getPlayerState(userId)!.softCurrency;
    const barsHeld = city.inventory
      .filter((s) => s.itemId === "iron_bar")
      .reduce((n, s) => n + s.qty, 0);
    expect(barsHeld).toBeGreaterThanOrEqual(1);

    expect(vendorSell(userId, "iron_ore", 1, buildingPos(stall)).ok).toBe(
      true,
    );
    const afterSell = getPlayerState(userId)!;
    expect(afterSell.softCurrency).toBe(coinsBefore + CITY_ORE_SELL);
    expect(
      afterSell.inventory
        .filter((s) => s.itemId === "iron_bar")
        .reduce((n, s) => n + s.qty, 0),
    ).toBe(barsHeld);
  });

  it("keeps iron_bar without City NPC sell rate (hold edge)", () => {
    expect(getVendorPrices("city").sell.iron_bar).toBeUndefined();
    expect(getVendorPrices("player_land").sell.iron_bar).toBeUndefined();
    expect(getVendorPrices("explore").sell.iron_bar).toBeUndefined();

    const city = getPlayerState(userId)!;
    if (city.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    addItem(getPlayerState(userId)!.playerId, "iron_bar", 1);
    const refused = vendorSell(userId, "iron_bar", 1, buildingPos(stall));
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe(ACTION_ERROR.vendorWontBuy);
    }
  });

  it("refuses City iron_ore sell with empty bag (failure)", () => {
    const state = getPlayerState(userId)!;
    if (state.landKind !== "city") {
      expect(travelToLandKind(userId, "city").ok).toBe(true);
    }
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    const oreQty = city.inventory
      .filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    if (oreQty > 0) removeItem(city.playerId, "iron_ore", oreQty);

    const result = vendorSell(userId, "iron_ore", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
