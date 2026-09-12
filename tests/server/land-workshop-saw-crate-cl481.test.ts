import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, WORLD, getRecipe } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl481-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { getPlayerState, addItem, removeItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { placeLandStation } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return buildingPos(board);
}

describe("CityLands CL48.1 land workshop saw → crate smoke", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl481_${Date.now().toString(36)}`,
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

  it("saws planks then assembles crate on land workshop with carpenter XP (happy)", () => {
    const saw = getRecipe("saw_planks")!;
    const crate = getRecipe("assemble_wood_crate")!;
    expect(saw.profession).toBe("carpenter");
    expect(saw.station).toBe("workshop");
    expect(crate.profession).toBe("carpenter");
    expect(crate.station).toBe("workshop");
    expect(crate.inputs).toEqual([{ itemId: "plank", qty: 2 }]);

    const home = getPlayerState(userId)!;
    expect(home.landKind).toBe("player_land");
    db.update(players)
      .set({ softCurrency: 200, energy: 100 })
      .where(eq(players.id, home.playerId))
      .run();
    // Reason: workshop place 4 wood + 2 plank; then saw needs 4 wood → 2 plank for crate.
    addItem(home.playerId, "wood", 8);
    addItem(home.playerId, "plank", 2);

    expect(
      placeLandStation(userId, "workshop", boardPos(home)).ok,
    ).toBe(true);
    const land = getPlayerState(userId)!;
    const workshop = land.buildings.find((b) => b.type === "workshop")!;
    expect(workshop).toBeTruthy();

    // Reason: e2e asserts saw→crate — clear leftover planks from place leftovers.
    const leftoverPlank = land.inventory
      .filter((s) => s.itemId === "plank")
      .reduce((n, s) => n + s.qty, 0);
    if (leftoverPlank > 0) removeItem(land.playerId, "plank", leftoverPlank);

    const carpenterBefore = land.carpenterXp;
    const foresterBefore = land.foresterXp;
    expect(craftRecipeComplete(userId, "saw_planks", buildingPos(workshop)).ok).toBe(
      true,
    );
    expect(craftRecipeComplete(userId, "saw_planks", buildingPos(workshop)).ok).toBe(
      true,
    );
    const afterSaw = getPlayerState(userId)!;
    expect(afterSaw.carpenterXp).toBeGreaterThan(carpenterBefore);
    expect(afterSaw.foresterXp).toBe(foresterBefore);
    expect(
      afterSaw.inventory.some((s) => s.itemId === "plank" && s.qty >= 2),
    ).toBe(true);

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
    expect(afterCrate.foresterXp).toBe(foresterBefore);
    expect(
      afterCrate.inventory.some(
        (s) => s.itemId === "wood_crate" && s.qty >= 1,
      ),
    ).toBe(true);
  });

  it("keeps saw and crate as carpenter crafts not forester (edge)", () => {
    expect(getRecipe("saw_planks")!.profession).toBe("carpenter");
    expect(getRecipe("assemble_wood_crate")!.profession).toBe("carpenter");
    expect(getRecipe("saw_planks")!.profession).not.toBe("forester");
    const land = getPlayerState(userId)!;
    expect(land.buildings.some((b) => b.type === "workshop")).toBe(true);
  });

  it("rejects land crate assemble without planks (failure)", () => {
    const land = getPlayerState(userId)!;
    const workshop = land.buildings.find((b) => b.type === "workshop")!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, land.playerId))
      .run();
    const plankQty = land.inventory
      .filter((s) => s.itemId === "plank")
      .reduce((n, s) => n + s.qty, 0);
    if (plankQty > 0) removeItem(land.playerId, "plank", plankQty);

    const result = craftRecipeComplete(
      userId,
      "assemble_wood_crate",
      buildingPos(workshop),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.missingMaterials);
    }
  });
});
