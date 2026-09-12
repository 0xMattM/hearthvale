import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  WORLD,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl532-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { gatherWood } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

/** Content Lock CL39.1 — crate NPC sink. */
const CRATE_SELL = 3;

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

/**
 * CL53.2 — land tree chop → saw_planks → assemble_wood_crate → City vendorSell.
 * Choice: assert-only full chain (crate rate already Content Lock) over new SKUs.
 */
describe("CityLands CL53.2 land tree → saw → City crate sell", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl532_${Date.now().toString(36)}`,
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

  it("chops land tree, saws planks, crates, sells at City (happy)", () => {
    expect(getRecipe("saw_planks")!.profession).toBe("carpenter");
    expect(getRecipe("assemble_wood_crate")!.profession).toBe("carpenter");
    expect(getVendorPrices("city").sell.wood_crate).toBe(CRATE_SELL);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    // Reason: tree place 1 wood; workshop 4 wood + 2 plank; chop supplies saw wood.
    addItem(home.playerId, "wood", 5);
    addItem(home.playerId, "plank", 2);

    const pos = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "tree_stump", pos).ok).toBe(true);
    expect(placeLandStation(userId, "workshop", pos).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const stump = land.buildings.find((b) => b.type === "tree_stump")!;
    const workshop = land.buildings.find((b) => b.type === "workshop")!;
    expect(stump).toBeTruthy();
    expect(workshop).toBeTruthy();

    // Reason: clear place leftovers so saw inputs come from chops.
    for (const id of ["wood", "plank"] as const) {
      const qty =
        getPlayerState(userId)!.inventory.find((s) => s.itemId === id)?.qty ??
        0;
      if (qty > 0) removeItem(land.playerId, id, qty);
    }

    const foresterBefore = getPlayerState(userId)!.foresterXp;
    const carpenterBefore = getPlayerState(userId)!.carpenterXp;
    // Reason: 2× saw needs 4 wood; one stump + CD clear between chops.
    for (let i = 0; i < 4; i++) {
      db.update(buildings)
        .set({ readyAt: null })
        .where(eq(buildings.id, stump.id))
        .run();
      db.update(players)
        .set({ energy: 100 })
        .where(eq(players.id, land.playerId))
        .run();
      expect(gatherWood(userId, stump.id, buildingPos(stump)).ok).toBe(true);
    }
    const afterChop = getPlayerState(userId)!;
    expect(afterChop.foresterXp).toBeGreaterThan(foresterBefore);
    expect(afterChop.carpenterXp).toBe(carpenterBefore);
    expect(
      afterChop.inventory.find((s) => s.itemId === "wood")?.qty ?? 0,
    ).toBeGreaterThanOrEqual(4);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterChop.playerId))
      .run();
    expect(craftRecipeComplete(userId, "saw_planks", buildingPos(workshop)).ok).toBe(
      true,
    );
    expect(craftRecipeComplete(userId, "saw_planks", buildingPos(workshop)).ok).toBe(
      true,
    );
    const afterSaw = getPlayerState(userId)!;
    expect(afterSaw.carpenterXp).toBeGreaterThan(carpenterBefore);
    expect(afterSaw.foresterXp).toBe(afterChop.foresterXp);
    expect(
      afterSaw.inventory.find((s) => s.itemId === "plank")?.qty ?? 0,
    ).toBeGreaterThanOrEqual(2);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, afterSaw.playerId))
      .run();
    const carpenterMid = afterSaw.carpenterXp;
    expect(
      craftRecipeComplete(userId, "assemble_wood_crate", buildingPos(workshop)).ok,
    ).toBe(true);
    const afterCrate = getPlayerState(userId)!;
    expect(afterCrate.carpenterXp).toBeGreaterThan(carpenterMid);
    expect(
      afterCrate.inventory.some(
        (s) => s.itemId === "wood_crate" && s.qty >= 1,
      ),
    ).toBe(true);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "wood_crate", 1, buildingPos(stall)).ok).toBe(
      true,
    );
    expect(getPlayerState(userId)!.softCurrency).toBe(coinsBefore + CRATE_SELL);
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "wood_crate"),
    ).toBe(false);
  });

  it("keeps chop → forester and saw/crate → carpenter (edge)", () => {
    expect(getRecipe("saw_planks")!.profession).not.toBe("forester");
    expect(getRecipe("assemble_wood_crate")!.output.itemId).toBe("wood_crate");
    expect(getVendorPrices("city").sell.wood_crate).toBe(
      getVendorPrices("explore").sell.wood_crate,
    );
  });

  it("rejects City crate sell with empty bag (failure)", () => {
    const fresh = registerUser(
      `cl532f_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    const city = getPlayerState(other)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    const qty =
      city.inventory.find((s) => s.itemId === "wood_crate")?.qty ?? 0;
    if (qty > 0) removeItem(city.playerId, "wood_crate", qty);

    const result = vendorSell(other, "wood_crate", 1, buildingPos(stall));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
