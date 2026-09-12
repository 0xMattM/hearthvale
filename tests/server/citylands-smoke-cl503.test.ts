import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ANIMAL_PEN,
  BUILDER_PLACE_XP,
  CHARACTER_LEVEL_THRESHOLDS,
  FISHING_DOCK,
  WORLD,
  formatMinimalHudHint,
  getRecipe,
  getVendorPrices,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl503-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { placeLandStation, placeHousingDecor } = await import(
  "../../apps/server/src/game/actions/build.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { feedAnimalPen, gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { createMarketListing } = await import(
  "../../apps/server/src/game/actions/market.ts"
);
const { getVisitLand } = await import("../../apps/server/src/game/visit.ts");
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock CL39.1 — low NPC crate sink. */
const CRATE_SELL = 3;

function pos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

function boardPos(state: {
  buildings: Array<{ type: string; x: number; z: number }>;
}) {
  const board = state.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
  return pos(board);
}

/**
 * CL50.3 — phase-11 regression companion (keeps citylands-smoke-cl8 under further growth).
 * Covers land fish cook, alchemy sink, bread sell, crate, leather weave, visit/decor/claim.
 */
describe("CityLands CL50.3 regression smoke after CL47–CL50", () => {
  let userId = "";
  let hostName = "";
  let hostLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl503smoke_${stamp}`, "password123");
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;

    hostName = `cl503host_${stamp}`;
    const host = registerUser(hostName, "password123");
    expect(host.ok).toBe(true);
    if (!host.ok) throw new Error("host register failed");
    const hostId = userIdFromToken(host.token)!;
    const homeTravel = travelToLandKind(hostId, "player_land");
    if (!homeTravel.ok) {
      expect(homeTravel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    hostLandId = getPlayerState(hostId)!.landId;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("cooks fish, sinks tonic/bread/crate, weaves leather, claims breeder (happy)", () => {
    expect(getRecipe("cook_fish")!.profession).toBe("cook");
    expect(getRecipe("brew_herbal_tonic")!.profession).toBe("alchemist");
    expect(getRecipe("assemble_wood_crate")!.profession).toBe("carpenter");
    expect(getRecipe("weave_cloth")!.profession).toBe("weaver");
    expect(getVendorPrices("city").sell.bread).toBe(3);
    expect(getVendorPrices("city").sell.herbal_tonic).toBe(4);
    expect(getVendorPrices("city").sell.wood_crate).toBe(CRATE_SELL);

    const home = getPlayerState(userId)!;
    const pid = home.playerId;
    db.update(players)
      .set({
        softCurrency: 500,
        energy: 100,
        builderXp: BUILDER_PLACE_XP * 6,
        characterXp: CHARACTER_LEVEL_THRESHOLDS[5]!,
      })
      .where(eq(players.id, pid))
      .run();
    addItem(pid, "wood", 50);
    addItem(pid, "plank", 16);
    addItem(pid, "iron_ore", 2);
    addItem(pid, "wheat", 8);
    addItem(pid, "leather", 4);
    addItem(pid, "bread", 1);

    const atBoard = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "fishing_dock", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "kitchen", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "alchemy_bench", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "workshop", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "loom", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "animal_pen", atBoard).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const dock = land.buildings.find((b) => b.type === "fishing_dock")!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    const bench = land.buildings.find((b) => b.type === "alchemy_bench")!;
    const workshop = land.buildings.find((b) => b.type === "workshop")!;
    const loom = land.buildings.find((b) => b.type === "loom")!;
    const pen = land.buildings.find((b) => b.type === "animal_pen")!;

    const fisherBefore = land.fisherXp;
    const cookBefore = land.cookXp;
    const alchBefore = land.alchemistXp;
    const carpBefore = land.carpenterXp;
    const weaverBefore = land.weaverXp;
    const breederBefore = land.animalBreederXp;

    expect(gatherFish(userId, dock.id, pos(dock)).ok).toBe(true);
    expect(getPlayerState(userId)!.fisherXp).toBe(
      fisherBefore + FISHING_DOCK.xp,
    );
    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    expect(craftRecipeComplete(userId, "cook_fish", pos(kitchen)).ok).toBe(true);
    expect(getPlayerState(userId)!.cookXp).toBeGreaterThan(cookBefore);

    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    expect(craftRecipeComplete(userId, "brew_herbal_tonic", pos(bench)).ok).toBe(true);
    expect(getPlayerState(userId)!.alchemistXp).toBeGreaterThan(alchBefore);

    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    expect(craftRecipeComplete(userId, "assemble_wood_crate", pos(workshop)).ok).toBe(
      true,
    );
    expect(getPlayerState(userId)!.carpenterXp).toBeGreaterThan(carpBefore);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const trails = explore.buildings.filter((b) => b.type === "game_trail");
    expect(trails.length).toBeGreaterThanOrEqual(1);
    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    expect(huntTrail(userId, trails[0]!.id, pos(trails[0]!)).ok).toBe(true);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    const leatherQty = getPlayerState(userId)!
      .inventory.filter((s) => s.itemId === "leather")
      .reduce((n, s) => n + s.qty, 0);
    // Reason: brew spent 1 leather; weave needs 2 — top up if hunt drop was light.
    if (leatherQty < 2) addItem(pid, "leather", 2 - leatherQty);
    expect(craftRecipeComplete(userId, "weave_cloth", pos(loom)).ok).toBe(true);
    expect(getPlayerState(userId)!.weaverXp).toBeGreaterThan(weaverBefore);

    addItem(pid, "wheat", ANIMAL_PEN.feedQty);
    expect(feedAnimalPen(userId, pen.id, pos(pen)).ok).toBe(true);
    expect(getPlayerState(userId)!.animalBreederXp).toBe(
      breederBefore + ANIMAL_PEN.xp,
    );

    const pad = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "decor_pad",
    )!;
    expect(placeHousingDecor(userId, pad.id, "banner", pos(pad)).ok).toBe(
      true,
    );

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    const coins0 = city.softCurrency;
    expect(vendorSell(userId, "bread", 1, pos(stall)).ok).toBe(true);
    expect(vendorSell(userId, "herbal_tonic", 1, pos(stall)).ok).toBe(true);
    expect(vendorSell(userId, "wood_crate", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBeGreaterThan(coins0);
    expect(createMarketListing(userId, "cloth", 1, 4).ok).toBe(true);

    expect(
      getTutorialNpcForPlayer(userId, "animal_breeder")!.quest.status,
    ).toBe("ready");
    expect(claimTutorialQuest(userId, "animal_breeder").ok).toBe(true);

    const visit = getVisitLand(userId, hostName);
    expect(visit.ok).toBe(true);
    if (visit.ok) {
      expect(visit.land.landId).toBe(hostLandId);
      expect(visit.land.landKind).toBe("player_land");
    }
  });

  it("keeps free travel fare-free + min HUD closed panels (edge)", () => {
    const coins = getPlayerState(userId)!.softCurrency;
    for (const kind of ["explore", "warrior", "player_land", "city"] as const) {
      const hop = travelToLandKind(userId, kind);
      if (!hop.ok) {
        expect(hop.error).toBe(ACTION_ERROR.travelAlreadyHere);
      }
      expect(getPlayerState(userId)!.softCurrency).toBe(coins);
      expect(getPlayerState(userId)!.travelArriveAt).toBeNull();
    }

    const closed = defaultClosedPanelIds();
    expect(closed).toContain("notice");
    expect(closed).toContain("craft");
    expect(closed).toContain("build");
    const hint = formatMinimalHudHint();
    expect(hint.split(" · ").length).toBeLessThanOrEqual(4);
    expect(hint.toLowerCase()).not.toContain("craft");
  });

  it("refuses incomplete breeder claim + city banner + empty bread sell (failure)", () => {
    const fresh = registerUser(
      `cl503fail_${Date.now().toString(36)}`,
      "password123",
    );
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error("register failed");
    const other = userIdFromToken(fresh.token)!;

    expect(travelToLandKind(other, "city").ok).toBe(true);
    const early = claimTutorialQuest(other, "animal_breeder");
    expect(early.ok).toBe(false);
    if (!early.ok) {
      expect(early.error).toBe(ACTION_ERROR.questNotReady);
    }

    const city = getPlayerState(other)!;
    const near = city.buildings[0]!;
    const decor = placeHousingDecor(other, near.id, "banner", pos(near));
    expect(decor.ok).toBe(false);
    if (!decor.ok) {
      expect(decor.error).toBe(ACTION_ERROR.decorStarterOnly);
    }

    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    // Reason: STARTER_INVENTORY includes bread — clear before empty-bag refuse.
    const starterBread = city.inventory
      .filter((s) => s.itemId === "bread")
      .reduce((n, s) => n + s.qty, 0);
    if (starterBread > 0) removeItem(city.playerId, "bread", starterBread);
    const breadSell = vendorSell(other, "bread", 1, pos(stall));
    expect(breadSell.ok).toBe(false);
    if (!breadSell.ok) {
      expect(breadSell.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});
