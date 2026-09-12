import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  CHARACTER_LEVEL_THRESHOLDS,
  ENERGY,
  EXPLORE_VENDOR_PREMIUM_SELL_ITEMS,
  FISHING_DOCK,
  HOUSING_DECOR,
  WORLD,
  cityNoticeBoardTips,
  exploreMatsCraftChainTip,
  formatMinimalHudHint,
  getRecipe,
  getVendorPrices,
  stationMinBuilderXp,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl8-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { craftRecipeComplete, eatFood } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const { gatherWood, gatherOre, gatherFish } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/** Content Lock CL39.1 — low NPC crate sink (below 2× plank). */
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
 * CL38.2 — phase-8 regression companion (keeps citylands-smoke-cl7 under further growth).
 * Covers mill→bread, cook meat, builder gate, explore premium, alchemist tonic eat.
 */
describe("CityLands CL38.2 regression smoke after CL35–CL38", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl8smoke_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
  });

  it("mills bread, cooks meat, eats tonic, sells explore premium (happy)", () => {
    expect(getRecipe("mill_flour")!.profession).toBe("farmer");
    expect(getRecipe("bake_bread")!.profession).toBe("cook");
    expect(getRecipe("cook_meat")!.profession).toBe("cook");
    expect(getRecipe("brew_herbal_tonic")!.profession).toBe("alchemist");
    expect(getRecipe("assemble_wood_crate")!.profession).toBe("carpenter");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const pid = city.playerId;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();

    const mill = city.buildings.find((b) => b.type === "mill")!;
    const kitchen = city.buildings.find((b) => b.type === "kitchen")!;
    addItem(pid, "wheat", 4);
    const farmerBefore = city.farmerXp;
    const cookBefore = city.cookXp;
    expect(craftRecipeComplete(userId, "mill_flour", pos(mill)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "mill_flour", pos(mill)).ok).toBe(true);
    expect(getPlayerState(userId)!.farmerXp).toBeGreaterThan(farmerBefore);
    expect(craftRecipeComplete(userId, "bake_bread", pos(kitchen)).ok).toBe(true);
    expect(getPlayerState(userId)!.cookXp).toBeGreaterThan(cookBefore);

    addItem(pid, "raw_meat", 1);
    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    const cookMeatBefore = getPlayerState(userId)!.cookXp;
    expect(craftRecipeComplete(userId, "cook_meat", pos(kitchen)).ok).toBe(true);
    expect(getPlayerState(userId)!.cookXp).toBeGreaterThan(cookMeatBefore);

    addItem(pid, "herbal_tonic", 1);
    db.update(players).set({ energy: 10 }).where(eq(players.id, pid)).run();
    const dmgBefore = getPlayerState(userId)!.damage;
    expect(eatFood(userId, "herbal_tonic").ok).toBe(true);
    const afterEat = getPlayerState(userId)!;
    expect(afterEat.energy).toBe(
      Math.min(afterEat.maxEnergy, 10 + ENERGY.herbalTonicRestore),
    );
    expect(afterEat.damage).toBe(dmgBefore);

    const cityLeather = getVendorPrices("city").sell.leather!;
    const exploreLeather = getVendorPrices("explore").sell.leather!;
    expect(exploreLeather).toBeGreaterThan(cityLeather);
    addItem(pid, "leather", 1);
    const cityCoins = getPlayerState(userId)!.softCurrency;
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    expect(vendorSell(userId, "leather", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(cityCoins + cityLeather);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    expect(
      getPlayerState(userId)!.buildings.some((b) => b.type === "vendor_stall"),
    ).toBe(false);

    for (const itemId of EXPLORE_VENDOR_PREMIUM_SELL_ITEMS) {
      expect(getVendorPrices("explore").sell[itemId]).toBeGreaterThan(
        getVendorPrices("city").sell[itemId]!,
      );
    }
  });

  it("keeps tip fidelity + fifth builder gate catalog (edge)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "explore_mats_craft");
    expect(tip!.body).toBe(exploreMatsCraftChainTip());
    expect(tip!.body.toLowerCase()).toMatch(/woodland/);
    expect(tip!.body.toLowerCase()).toMatch(/mines/);

    expect(stationMinBuilderXp("alchemy_bench")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("fishing_dock")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("forge")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("mill")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("loom")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("kitchen")).toBe(0);
    expect(stationMinBuilderXp("workshop")).toBe(0);
  });

  it("refuses under-gated alchemy_bench and empty-bag tonic eat (failure)", () => {
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "iron_ore", 2);
    const gated = placeLandStation(
      userId,
      "alchemy_bench",
      boardPos(getPlayerState(userId)!),
    );
    expect(gated.ok).toBe(false);
    if (!gated.ok) {
      expect(gated.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }

    expect(getPlayerState(userId)!.inventory.some((s) => s.itemId === "herbal_tonic")).toBe(
      false,
    );
    const eat = eatFood(userId, "herbal_tonic");
    expect(eat.ok).toBe(false);
    if (!eat.ok) {
      expect(eat.error).toBe(ACTION_ERROR.noFood);
    }
  });
});

/**
 * CL42.3 — phase-9 regression on the same companion file.
 * Covers crate sink, land mill, Explore gather→premium sell, dock gate, housing decor.
 */
describe("CityLands CL42.3 regression smoke after CL39–CL42", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl423smoke_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
  });

  it("sells crate, mills on land, chops Explore→premium, places decor (happy)", () => {
    expect(getVendorPrices("city").sell.wood_crate).toBe(CRATE_SELL);
    expect(getRecipe("mill_flour")!.station).toBe("mill");
    expect(getRecipe("assemble_wood_crate")!.output.itemId).toBe("wood_crate");

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const pid = city.playerId;
    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    addItem(pid, "wood_crate", 1);
    const coinsBeforeCrate = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "wood_crate", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(
      coinsBeforeCrate + CRATE_SELL,
    );

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
    addItem(pid, "wood", 8);
    addItem(pid, "iron_bar", 1);
    addItem(pid, "wheat", 2);
    expect(
      placeLandStation(userId, "mill", boardPos(getPlayerState(userId)!)).ok,
    ).toBe(true);
    const land = getPlayerState(userId)!;
    const mill = land.buildings.find((b) => b.type === "mill")!;
    const farmerBefore = land.farmerXp;
    expect(craftRecipeComplete(userId, "mill_flour", pos(mill)).ok).toBe(true);
    const afterMill = getPlayerState(userId)!;
    expect(afterMill.farmerXp).toBeGreaterThan(farmerBefore);
    expect(
      afterMill.inventory.some((s) => s.itemId === "flour" && s.qty >= 1),
    ).toBe(true);

    const cityWood = getVendorPrices("city").sell.wood!;
    const exploreWood = getVendorPrices("explore").sell.wood!;
    expect(exploreWood).toBeGreaterThan(cityWood);
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const stump = explore.buildings.find((b) => b.type === "tree_stump")!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();
    const woodLeft = explore.inventory
      .filter((s) => s.itemId === "wood")
      .reduce((n, s) => n + s.qty, 0);
    if (woodLeft > 0) removeItem(pid, "wood", woodLeft);
    expect(gatherWood(userId, stump.id, pos(stump)).ok).toBe(true);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const cityStall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const coinsBeforeWood = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "wood", 1, pos(cityStall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(
      coinsBeforeWood + cityWood,
    );

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    db.update(players)
      .set({
        softCurrency: 100,
        characterXp: CHARACTER_LEVEL_THRESHOLDS[5]!,
      })
      .where(eq(players.id, pid))
      .run();
    const withPad = getPlayerState(userId)!;
    const pad = withPad.buildings.find((b) => b.type === "decor_pad");
    expect(pad).toBeTruthy();
    const dmg = withPad.damage;
    expect(
      placeHousingDecor(userId, pad!.id, "planter", pos(pad!)).ok,
    ).toBe(true);
    const afterDecor = getPlayerState(userId)!;
    expect(afterDecor.buildings.find((b) => b.id === pad!.id)?.type).toBe(
      "decor_planter",
    );
    expect(afterDecor.damage).toBe(dmg);
    expect(afterDecor.softCurrency).toBe(
      100 - HOUSING_DECOR.planter.coinCost,
    );
  });

  it("keeps scarce tip + dock gate + flat crate rate (edge)", () => {
    const scarce = cityNoticeBoardTips().find((t) => t.id === "scarce_stations");
    expect(scarce!.body.toLowerCase()).toMatch(/scarce|shared/);
    expect(scarce!.body.toLowerCase()).toMatch(/land/);

    expect(stationMinBuilderXp("fishing_dock")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("crop_plot")).toBe(0);
    expect(stationMinBuilderXp("workshop")).toBe(0);
    expect(stationMinBuilderXp("kitchen")).toBe(0);
    expect(getVendorPrices("explore").sell.wood_crate).toBe(
      getVendorPrices("city").sell.wood_crate,
    );
    expect("damage" in HOUSING_DECOR.planter).toBe(false);
  });

  it("refuses dock under gate, city decor, empty-bag crate (failure)", () => {
    const homeTravel = travelToLandKind(userId, "player_land");
    if (!homeTravel.ok) {
      expect(homeTravel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 6);
    addItem(home.playerId, "plank", 2);
    const dockGate = placeLandStation(
      userId,
      "fishing_dock",
      boardPos(getPlayerState(userId)!),
    );
    expect(dockGate.ok).toBe(false);
    if (!dockGate.ok) {
      expect(dockGate.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const near = city.buildings[0]!;
    const decor = placeHousingDecor(
      userId,
      near.id,
      "banner",
      pos(near),
    );
    expect(decor.ok).toBe(false);
    if (!decor.ok) {
      expect(decor.error).toBe(ACTION_ERROR.decorStarterOnly);
    }

    const stall = city.buildings.find((b) => b.type === "vendor_stall")!;
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "wood_crate"),
    ).toBe(false);
    const crateSell = vendorSell(userId, "wood_crate", 1, pos(stall));
    expect(crateSell.ok).toBe(false);
    if (!crateSell.ok) {
      expect(crateSell.error).toBe(ACTION_ERROR.notEnoughItems);
    }
  });
});

/**
 * CL46.3 — phase-10 regression on the same companion file.
 * Covers land bake/forge/loom, Explore ore premium, land dock catch, pen gate, min HUD.
 */
describe("CityLands CL46.3 regression smoke after CL43–CL46", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl463smoke_${Date.now().toString(36)}`,
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

  it("bakes, forges, weaves on land; ore premium; dock catch (happy)", () => {
    expect(getRecipe("mill_flour")!.profession).toBe("farmer");
    expect(getRecipe("bake_bread")!.profession).toBe("cook");
    expect(getRecipe("smelt_iron_bar")!.profession).toBe("blacksmith");
    expect(getRecipe("forge_iron_hammer")!.profession).toBe("blacksmith");
    expect(getRecipe("weave_cloth_bandage")!.profession).toBe("weaver");

    const home = getPlayerState(userId)!;
    const pid = home.playerId;
    db.update(players)
      .set({
        softCurrency: 400,
        energy: 100,
        builderXp: BUILDER_PLACE_XP * 4,
        // Reason: forge_iron_hammer gates at blacksmith 20 (same as CL43.2 smoke).
        blacksmithXp: 20,
      })
      .where(eq(players.id, pid))
      .run();
    addItem(pid, "wood", 40);
    addItem(pid, "plank", 12);
    addItem(pid, "iron_bar", 4);
    addItem(pid, "iron_ore", 4);
    addItem(pid, "wheat", 6);
    addItem(pid, "cloth", 2);

    const atBoard = boardPos(getPlayerState(userId)!);
    expect(placeLandStation(userId, "mill", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "kitchen", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "forge", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "loom", atBoard).ok).toBe(true);
    expect(placeLandStation(userId, "fishing_dock", atBoard).ok).toBe(true);

    const land = getPlayerState(userId)!;
    const mill = land.buildings.find((b) => b.type === "mill")!;
    const kitchen = land.buildings.find((b) => b.type === "kitchen")!;
    const forge = land.buildings.find((b) => b.type === "forge")!;
    const loom = land.buildings.find((b) => b.type === "loom")!;
    const dock = land.buildings.find((b) => b.type === "fishing_dock")!;

    const farmerBefore = land.farmerXp;
    const cookBefore = land.cookXp;
    const smithBefore = land.blacksmithXp;
    const weaverBefore = land.weaverXp;
    const fisherBefore = land.fisherXp;

    expect(craftRecipeComplete(userId, "mill_flour", pos(mill)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "mill_flour", pos(mill)).ok).toBe(true);
    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    expect(craftRecipeComplete(userId, "bake_bread", pos(kitchen)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "smelt_iron_bar", pos(forge)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "smelt_iron_bar", pos(forge)).ok).toBe(true);
    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    expect(craftRecipeComplete(userId, "forge_iron_hammer", pos(forge)).ok).toBe(true);
    expect(craftRecipeComplete(userId, "weave_cloth_bandage", pos(loom)).ok).toBe(true);
    expect(gatherFish(userId, dock.id, pos(dock)).ok).toBe(true);

    const afterCraft = getPlayerState(userId)!;
    expect(afterCraft.farmerXp).toBeGreaterThan(farmerBefore);
    expect(afterCraft.cookXp).toBeGreaterThan(cookBefore);
    expect(afterCraft.blacksmithXp).toBeGreaterThan(smithBefore);
    expect(afterCraft.weaverXp).toBeGreaterThan(weaverBefore);
    expect(afterCraft.fisherXp).toBe(fisherBefore + FISHING_DOCK.xp);
    expect(
      afterCraft.inventory.some((s) => s.itemId === "bread" && s.qty >= 1),
    ).toBe(true);
    expect(
      afterCraft.inventory.some(
        (s) => s.itemId === "iron_hammer" && s.qty >= 1,
      ),
    ).toBe(true);
    expect(
      afterCraft.inventory.some(
        (s) => s.itemId === "cloth_bandage" && s.qty >= 1,
      ),
    ).toBe(true);
    expect(
      afterCraft.inventory.some((s) => s.itemId === "fish" && s.qty >= 1),
    ).toBe(true);

    const cityOre = getVendorPrices("city").sell.iron_ore!;
    const exploreOre = getVendorPrices("explore").sell.iron_ore!;
    expect(exploreOre).toBeGreaterThan(cityOre);
    expect(EXPLORE_VENDOR_PREMIUM_SELL_ITEMS).toContain("iron_ore");

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    const node = explore.buildings.find((b) => b.type === "ore_node")!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    db.update(players).set({ energy: 100 }).where(eq(players.id, pid)).run();
    addItem(pid, "iron_hammer", 1);
    const hammer = getPlayerState(userId)!.inventory.find(
      (i) => i.itemId === "iron_hammer",
    )!;
    db.update(players)
      .set({ equippedToolInventoryId: hammer.id })
      .where(eq(players.id, pid))
      .run();
    const oreLeft = getPlayerState(userId)!
      .inventory.filter((s) => s.itemId === "iron_ore")
      .reduce((n, s) => n + s.qty, 0);
    if (oreLeft > 0) removeItem(pid, "iron_ore", oreLeft);
    expect(gatherOre(userId, node.id, pos(node)).ok).toBe(true);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const cityStall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    const coinsBefore = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "iron_ore", 1, pos(cityStall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coinsBefore + cityOre);
  });

  it("keeps pen/dock gates + min HUD closed panels (edge)", () => {
    expect(stationMinBuilderXp("animal_pen")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("fishing_dock")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("forge")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("loom")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("crop_plot")).toBe(0);
    expect(stationMinBuilderXp("workshop")).toBe(0);
    expect(stationMinBuilderXp("kitchen")).toBe(0);

    const closed = defaultClosedPanelIds();
    expect(closed).toContain("notice");
    expect(closed).toContain("craft");
    expect(closed).toContain("vendor");
    expect(closed).toContain("build");
    const hint = formatMinimalHudHint();
    expect(hint.split(" · ").length).toBeLessThanOrEqual(4);
    expect(hint.toLowerCase()).not.toContain("craft");
  });

  it("refuses under-gated pen + empty-bag ore sell (failure)", () => {
    const homeTravel = travelToLandKind(userId, "player_land");
    if (!homeTravel.ok) {
      expect(homeTravel.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    addItem(home.playerId, "wood", 10);
    addItem(home.playerId, "plank", 4);
    const penGate = placeLandStation(
      userId,
      "animal_pen",
      boardPos(getPlayerState(userId)!),
    );
    expect(penGate.ok).toBe(false);
    if (!penGate.ok) {
      expect(penGate.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    expect(explore.buildings.some((b) => b.type === "vendor_stall")).toBe(
      false,
    );
    const oreSell = vendorSell(userId, "iron_ore", 1);
    expect(oreSell.ok).toBe(false);
    if (!oreSell.ok) {
      expect(oreSell.error).toBe(ACTION_ERROR.needsStation("vendor stall"));
    }
  });
});
