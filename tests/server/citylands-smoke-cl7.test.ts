import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  BUILDER_PLACE_XP,
  CANONICAL_LAND_KINDS,
  CITY_BUILDINGS,
  CITY_PRACTICE_STATIONS,
  ECONOMY_PROFESSIONS,
  ANIMAL_PEN,
  MARKET,
  PLAYER_LAND_BUILDINGS,
  PLAYER_LAND_STATIONS,
  SEEDED_CITY_NPCS,
  SEEDED_CITY_TUTORIAL_NPCS,
  TUTORIAL_NPCS,
  WARRIOR_BUILDINGS,
  WARRIOR_TRAINING_BUILDING_TYPES,
  WORLD,
  cityHubFirstSessionTip,
  cityNoticeBoardTips,
  emptyLandBuildBoardTip,
  exploreMatsCraftChainTip,
  fishToKitchenTip,
  getRecipe,
  getVendorPrices,
  isProductionBuildingType,
  landGatherPracticeTip,
  meatToKitchenTip,
  meetsRecipeXpGate,
  postCraftMarketTip,
  stationMinBuilderXp,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";
import { nextOnboardingTip } from "../../apps/web/lib/onboarding";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl7-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { plantCrop } = await import(
  "../../apps/server/src/game/actions/farming.ts"
);
const { craftRecipeComplete } = await import(
  "../../apps/server/src/game/actions/crafting.ts"
);
const {
  cleanAnimalPen,
  feedAnimalPen,
  gatherFish,
  gatherOre,
  gatherWood,
} = await import("../../apps/server/src/game/actions/gathering.ts");
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const {
  buyMarketListing,
  cancelMarketListing,
  createMarketListing,
  listMarket,
} = await import("../../apps/server/src/game/actions/market.ts");
const { vendorSell } = await import(
  "../../apps/server/src/game/actions/vendor.ts"
);
const {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
  listTutorialNpcs,
} = await import("../../apps/server/src/game/tutorial-npcs.ts");
const { buildings, players } = await import(
  "../../apps/server/src/db/schema.ts"
);

/** CL13–CL16 tutors / stations covered by this regression suite. */
const CL13_TO_16_SEEDED = [
  "weaver",
  "fisher",
  "alchemist",
  "animal_hunter",
  "monster_hunter",
  "builder",
] as const;

/** CL18–CL21 systems covered by CL22.1 regression. */
const CL18_TO_21_NOTICE_TIPS = [
  "explore_mats_craft",
  "fisher_alchemist_practice",
] as const;

/** CL25.3 / CL33.3 kitchen sink notice tips. */
const CL25_NOTICE_TIPS = ["fish_to_kitchen", "meat_to_kitchen"] as const;

function pos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("CityLands CL7.2 / CL12.2 / CL17.1 / CL22.1 / CL26.3 / CL30.3 / CL34.3 four-map smoke", () => {
  let userId = "";
  let buyerId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const reg = registerUser(`cl7_${stamp}`, "password123");
    const buyer = registerUser(`cl7b_${stamp}`, "password123");
    expect(reg.ok && buyer.ok).toBe(true);
    if (!reg.ok || !buyer.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
    buyerId = userIdFromToken(buyer.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("completes free travel + CL13–30 XP/dock/market/hunt/tips (happy)", () => {
    const startCoins = getPlayerState(userId)!.softCurrency;
    expect([...CANONICAL_LAND_KINDS]).toEqual([
      "city",
      "player_land",
      "explore",
      "warrior",
    ]);

    for (const kind of CANONICAL_LAND_KINDS) {
      expect(travelToLandKind(userId, kind).ok).toBe(true);
      const s = getPlayerState(userId)!;
      expect(s.landKind).toBe(kind);
      expect(s.travelArriveAt).toBeNull();
      expect(s.softCurrency).toBe(startCoins);
    }

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    expect(city.buildings.length).toBe(CITY_BUILDINGS.length);
    expect(city.buildings.filter((b) => b.type === "workshop")).toHaveLength(1);
    // CL8.1–CL8.3 + CL13–CL15 template depth
    expect(city.buildings.filter((b) => b.type === "tutorial_npc")).toHaveLength(
      SEEDED_CITY_NPCS.length,
    );
    for (const id of CL13_TO_16_SEEDED) {
      expect(SEEDED_CITY_TUTORIAL_NPCS).toContain(id);
      expect(TUTORIAL_NPCS[id].seededOnCity).toBe(true);
      expect(TUTORIAL_NPCS[id].quest.objective).not.toBe("stub");
      expect(
        city.buildings.some((b) => b.tutorialNpcId === id),
      ).toBe(true);
    }
    expect(SEEDED_CITY_TUTORIAL_NPCS).toContain("animal_breeder");
    expect(listTutorialNpcs(userId).map((n) => n.id)).toEqual([
      ...SEEDED_CITY_NPCS,
    ]);
    expect(
      city.buildings.some((b) => b.tutorialNpcId === "animal_breeder"),
    ).toBe(true);
    expect(CITY_PRACTICE_STATIONS.animal_breeder).toEqual(["animal_pen"]);
    expect(TUTORIAL_NPCS.animal_breeder.quest.objective).toBe(
      "feed_animal_pen",
    );
    expect(city.buildings.some((b) => b.type === "notice_board")).toBe(true);
    expect(city.buildings.some((b) => b.type === "kitchen")).toBe(true);
    // CL13.2 — exactly one scarce city loom; weaver practice map
    expect(city.buildings.filter((b) => b.type === "loom")).toHaveLength(1);
    expect(CITY_PRACTICE_STATIONS.weaver).toEqual(["loom"]);
    // CL19.2 / CL28.2–CL28.3 — fishing dock + alchemy bench practice
    expect(
      city.buildings.filter((b) => b.type === "fishing_dock"),
    ).toHaveLength(1);
    expect(
      city.buildings.filter((b) => b.type === "alchemy_bench"),
    ).toHaveLength(1);
    expect(CITY_PRACTICE_STATIONS.fisher).toEqual(["fishing_dock"]);
    expect(CITY_PRACTICE_STATIONS.alchemist).toEqual(["alchemy_bench"]);
    expect(TUTORIAL_NPCS.fisher.quest.objective).toBe("hold_fish");
    expect(TUTORIAL_NPCS.alchemist.quest.objective).toBe("hold_herbal_tonic");
    expect(cityNoticeBoardTips().map((t) => t.id)).toEqual(
      expect.arrayContaining([
        "travel_circuit",
        "scarce_stations",
        "warrior_optional",
        "land_to_city",
        "explore_vendor_value",
        "fisher_alchemist_practice",
        "land_gather_practice",
        "animal_breeder_path",
        ...CL18_TO_21_NOTICE_TIPS,
        ...CL25_NOTICE_TIPS,
      ]),
    );
    const exploreMatsTip = cityNoticeBoardTips().find(
      (t) => t.id === "explore_mats_craft",
    );
    expect(exploreMatsTip?.body).toBe(exploreMatsCraftChainTip());
    expect(exploreMatsTip?.body.toLowerCase()).toMatch(/leather|weave|craft/);
    // CL31.2 — dual Animal / Monster Hunter XP tip body
    expect(exploreMatsTip?.body.toLowerCase()).toMatch(/animal hunter xp/);
    expect(exploreMatsTip?.body.toLowerCase()).toMatch(/monster hunter xp/);
    // CL25.3 — fish → kitchen tip; CL33.3 — hunt meat → kitchen tip
    const fishKitchenTip = cityNoticeBoardTips().find(
      (t) => t.id === "fish_to_kitchen",
    );
    expect(fishKitchenTip?.body).toBe(fishToKitchenTip());
    const meatKitchenTip = cityNoticeBoardTips().find(
      (t) => t.id === "meat_to_kitchen",
    );
    expect(meatKitchenTip?.body).toBe(meatToKitchenTip());
    // CL32.3 — land gather practice tip
    const landGatherTip = cityNoticeBoardTips().find(
      (t) => t.id === "land_gather_practice",
    );
    expect(landGatherTip?.body).toBe(landGatherPracticeTip());
    // CL25.2 — city buy book completeness; CL33.1 — tonic/bandage sell rates
    const cityBuy = getVendorPrices("city").buy;
    expect(cityBuy.wheat_seed).toBe(8);
    expect(cityBuy.wooden_hoe).toBe(12);
    expect(cityBuy.iron_hammer).toBe(28);
    const citySell = getVendorPrices("city").sell;
    expect(citySell.herbal_tonic).toBe(4);
    expect(citySell.cloth_bandage).toBe(2);
    // CL26.1 / CL28.1 / CL34.1 / CL36.3 / CL41.2 — forge + mill + loom + alchemy + dock gates; kitchen/workshop bootstrap
    expect(stationMinBuilderXp("forge")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("mill")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("loom")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("alchemy_bench")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("fishing_dock")).toBe(BUILDER_PLACE_XP);
    expect(stationMinBuilderXp("kitchen")).toBe(0);
    expect(stationMinBuilderXp("workshop")).toBe(0);
    expect(PLAYER_LAND_STATIONS.animal_pen).toBeTruthy();

    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    // CL18.1 — city stump chop → forester XP (not carpenter)
    const stump = city.buildings.find((b) => b.type === "tree_stump")!;
    const carpenterBeforeChop = getPlayerState(userId)!.carpenterXp;
    const foresterBefore = getPlayerState(userId)!.foresterXp;
    expect(gatherWood(userId, stump.id, pos(stump)).ok).toBe(true);
    const afterChop = getPlayerState(userId)!;
    expect(afterChop.foresterXp).toBeGreaterThan(foresterBefore);
    expect(afterChop.carpenterXp).toBe(carpenterBeforeChop);

    // CL18.2 — city ore → miner XP (not blacksmith); needs iron hammer
    addItem(pid, "iron_hammer", 1);
    const hammer = getPlayerState(userId)!.inventory.find(
      (i) => i.itemId === "iron_hammer",
    )!;
    db.update(players)
      .set({ equippedToolInventoryId: hammer.id, energy: 100 })
      .where(eq(players.id, pid))
      .run();
    const ore = city.buildings.find((b) => b.type === "ore_node")!;
    const smithBefore = getPlayerState(userId)!.blacksmithXp;
    const minerBefore = getPlayerState(userId)!.minerXp;
    expect(gatherOre(userId, ore.id, pos(ore)).ok).toBe(true);
    const afterOre = getPlayerState(userId)!;
    expect(afterOre.minerXp).toBeGreaterThan(minerBefore);
    expect(afterOre.blacksmithXp).toBe(smithBefore);

    // CL19.3 — catch fish at scarce city dock (CL23.1 fisher XP)
    const dock = city.buildings.find((b) => b.type === "fishing_dock")!;
    const fisherBefore = getPlayerState(userId)!.fisherXp;
    expect(gatherFish(userId, dock.id, pos(dock)).ok).toBe(true);
    expect(getPlayerState(userId)!.fisherXp).toBeGreaterThan(fisherBefore);
    expect(
      getPlayerState(userId)!.inventory.some(
        (s) => s.itemId === "fish" && s.qty >= 1,
      ),
    ).toBe(true);
    expect(getTutorialNpcForPlayer(userId, "fisher")!.quest.status).toBe(
      "ready",
    );

    addItem(pid, "wheat_seed", 2);
    const plot = city.buildings.find((b) => b.type === "crop_plot")!;
    expect(plantCrop(userId, plot.id, "wheat_seed", pos(plot)).ok).toBe(true);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    let land = getPlayerState(userId)!;
    expect(land.buildings).toHaveLength(PLAYER_LAND_BUILDINGS.length);
    expect(land.buildings.every((b) => !isProductionBuildingType(b.type))).toBe(
      true,
    );
    db.update(players)
      .set({ softCurrency: startCoins + 400, energy: 100 })
      .where(eq(players.id, pid))
      .run();
    addItem(pid, "wood", 50);
    addItem(pid, "plank", 8);
    addItem(pid, "leather", 10);
    addItem(pid, "iron_ore", 2);
    const board = land.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
    const builderBefore = getPlayerState(userId)!.builderXp;
    expect(placeLandStation(userId, "crop_plot", pos(board)).ok).toBe(true);
    // CL18.3 — place grants builder XP
    expect(getPlayerState(userId)!.builderXp).toBe(
      builderBefore + BUILDER_PLACE_XP,
    );
    // CL15.2 — builder tutor completes after first land station
    expect(
      getTutorialNpcForPlayer(userId, "builder")!.quest.status,
    ).toBe("ready");
    // CL9.1 loom + CL19.1 fishing dock on player land
    expect(PLAYER_LAND_STATIONS.loom).toBeTruthy();
    expect(PLAYER_LAND_STATIONS.fishing_dock).toBeTruthy();
    expect(placeLandStation(userId, "loom", pos(board)).ok).toBe(true);
    expect(placeLandStation(userId, "fishing_dock", pos(board)).ok).toBe(true);
    // CL26.2 — animal pen stub on land
    addItem(pid, "plank", 4);
    expect(placeLandStation(userId, "animal_pen", pos(board)).ok).toBe(true);
    // CL27.1 / CL27.2 — wheat feed → animal_breeder XP
    addItem(pid, "wheat", ANIMAL_PEN.feedQty);
    const pen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "animal_pen",
    )!;
    const breederBefore = getPlayerState(userId)!.animalBreederXp;
    expect(feedAnimalPen(userId, pen.id, pos(pen)).ok).toBe(true);
    expect(getPlayerState(userId)!.animalBreederXp).toBe(
      breederBefore + ANIMAL_PEN.xp,
    );
    expect(
      getTutorialNpcForPlayer(userId, "animal_breeder")!.quest.status,
    ).toBe("ready");
    // CL34.2 — wood bedding clean second beat (clear pen CD first)
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, pen.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();
    addItem(pid, "wood", ANIMAL_PEN.cleanQty);
    const breederCleanBefore = getPlayerState(userId)!.animalBreederXp;
    expect(cleanAnimalPen(userId, pen.id, pos(pen)).ok).toBe(true);
    expect(getPlayerState(userId)!.animalBreederXp).toBe(
      breederCleanBefore + ANIMAL_PEN.xp,
    );
    // CL32.1 / CL32.2 — land tree stump + ore node place → forester / miner
    expect(PLAYER_LAND_STATIONS.tree_stump).toBeTruthy();
    expect(PLAYER_LAND_STATIONS.ore_node).toBeTruthy();
    expect(placeLandStation(userId, "tree_stump", pos(board)).ok).toBe(true);
    expect(placeLandStation(userId, "ore_node", pos(board)).ok).toBe(true);
    const landStump = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "tree_stump",
    )!;
    const landForesterBefore = getPlayerState(userId)!.foresterXp;
    expect(gatherWood(userId, landStump.id, pos(landStump)).ok).toBe(true);
    expect(getPlayerState(userId)!.foresterXp).toBeGreaterThan(landForesterBefore);
    const landOre = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "ore_node",
    )!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();
    const landMinerBefore = getPlayerState(userId)!.minerXp;
    expect(gatherOre(userId, landOre.id, pos(landOre)).ok).toBe(true);
    expect(getPlayerState(userId)!.minerXp).toBeGreaterThan(landMinerBefore);
    // CL26.1 — forge unlocked after crop_plot granted builder XP
    addItem(pid, "iron_bar", 4);
    expect(placeLandStation(userId, "forge", pos(board)).ok).toBe(true);
    // Refresh energy — many places consume build cost before mill/alchemy/workshop
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();
    // CL28.1 — mill unlocked with same builder XP
    expect(placeLandStation(userId, "mill", pos(board)).ok).toBe(true);
    // CL28.2 — alchemy bench on land + brew sink
    expect(placeLandStation(userId, "alchemy_bench", pos(board)).ok).toBe(true);
    // CL25.1 — workshop + plank craft for market list
    expect(placeLandStation(userId, "workshop", pos(board)).ok).toBe(true);
    land = getPlayerState(userId)!;
    expect(land.buildings.some((b) => b.type === "crop_plot")).toBe(true);
    expect(land.buildings.some((b) => b.type === "loom")).toBe(true);
    expect(land.buildings.some((b) => b.type === "fishing_dock")).toBe(true);
    expect(land.buildings.some((b) => b.type === "animal_pen")).toBe(true);
    expect(land.buildings.some((b) => b.type === "forge")).toBe(true);
    expect(land.buildings.some((b) => b.type === "mill")).toBe(true);
    expect(land.buildings.some((b) => b.type === "alchemy_bench")).toBe(true);
    // CL13.3 — weave_cloth grants weaver XP, not carpenter
    const recipe = getRecipe("weave_cloth")!;
    expect(recipe.profession).toBe("weaver");
    const beforeWeave = getPlayerState(userId)!;
    const carpenterBefore = beforeWeave.carpenterXp;
    const loom = beforeWeave.buildings.find((b) => b.type === "loom")!;
    expect(craftRecipeComplete(userId, "weave_cloth", pos(loom)).ok).toBe(true);
    const afterWeave = getPlayerState(userId)!;
    expect(afterWeave.weaverXp).toBeGreaterThan(beforeWeave.weaverXp);
    expect(afterWeave.carpenterXp).toBe(carpenterBefore);
    expect(
      getTutorialNpcForPlayer(userId, "weaver")!.quest.status,
    ).toBe("ready");
    // CL29.2 — cloth bandage weaver sink (extra cloth so market list still has stock)
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();
    addItem(pid, "leather", 2);
    expect(craftRecipeComplete(userId, "weave_cloth", pos(loom)).ok).toBe(true);
    const weaverBeforeBandage = getPlayerState(userId)!.weaverXp;
    expect(craftRecipeComplete(userId, "weave_cloth_bandage", pos(loom)).ok).toBe(true);
    expect(getPlayerState(userId)!.weaverXp).toBeGreaterThan(weaverBeforeBandage);
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "cloth_bandage"),
    ).toBe(true);
    // CL31.3 — brew herbal tonic → alchemist XP (not cook)
    const bench = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "alchemy_bench",
    )!;
    addItem(pid, "wheat", 2);
    addItem(pid, "leather", 1);
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();
    const alchemistBefore = getPlayerState(userId)!.alchemistXp;
    const cookBrewBefore = getPlayerState(userId)!.cookXp;
    expect(craftRecipeComplete(userId, "brew_herbal_tonic", pos(bench)).ok).toBe(true);
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "herbal_tonic"),
    ).toBe(true);
    expect(getPlayerState(userId)!.alchemistXp).toBeGreaterThan(alchemistBefore);
    expect(getPlayerState(userId)!.cookXp).toBe(cookBrewBefore);
    const workshop = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "workshop",
    )!;
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();
    addItem(pid, "wood", 4);
    expect(craftRecipeComplete(userId, "saw_planks", pos(workshop)).ok).toBe(true);
    // CL11.2 — warrior training never placeable on homestead
    for (const banned of WARRIOR_TRAINING_BUILDING_TYPES) {
      const refuse = placeLandStation(userId, banned, pos(board));
      expect(refuse.ok).toBe(false);
      if (!refuse.ok) {
        expect(refuse.error).toBe(ACTION_ERROR.warriorTrainingHomesteadForbidden);
      }
    }

    // CL25.1 — list land craft (cloth/plank) + fish on City market
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins * 3 + 20, energy: 100 })
      .where(eq(players.id, pid))
      .run();
    expect(createMarketListing(userId, "cloth", 1, 5).ok).toBe(true);
    expect(createMarketListing(userId, "plank", 1, 4).ok).toBe(true);
    // Keep one fish for cook; list one if still holding from dock catch
    const fishQty =
      getPlayerState(userId)!.inventory.find((s) => s.itemId === "fish")?.qty ??
      0;
    if (fishQty < 2) addItem(pid, "fish", 2 - fishQty);
    expect(createMarketListing(userId, "fish", 1, 3).ok).toBe(true);
    expect(listMarket(userId).some((l) => l.itemId === "cloth" && l.mine)).toBe(
      true,
    );
    // CL29.1 — buyer buys plank; seller cancels cloth
    const listings = listMarket(userId);
    const plankListing = listings.find((l) => l.itemId === "plank" && l.mine)!;
    const clothListing = listings.find((l) => l.itemId === "cloth" && l.mine)!;
    expect(travelToLandKind(buyerId, "city").ok).toBe(true);
    const buyerPid = db
      .select()
      .from(players)
      .where(eq(players.userId, buyerId))
      .get()!.id;
    db.update(players)
      .set({ softCurrency: 50 })
      .where(eq(players.id, buyerPid))
      .run();
    expect(buyMarketListing(buyerId, plankListing.id).ok).toBe(true);
    expect(
      getPlayerState(buyerId)!.inventory.some((s) => s.itemId === "plank"),
    ).toBe(true);
    expect(cancelMarketListing(userId, clothListing.id).ok).toBe(true);
    expect(
      listMarket(userId).some((l) => l.id === clothListing.id),
    ).toBe(false);
    // CL23.2 — vendor fish sink; CL33.1 — tonic + bandage vendor sinks
    const stall = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "vendor_stall",
    )!;
    addItem(pid, "fish", 1);
    const coinsBeforeSell = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "fish", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(coinsBeforeSell + 2);
    // Keep one tonic/bandage for market list; sell one of each
    addItem(pid, "herbal_tonic", 1);
    addItem(pid, "cloth_bandage", 1);
    const coinsBeforeCraftSell = getPlayerState(userId)!.softCurrency;
    expect(vendorSell(userId, "herbal_tonic", 1, pos(stall)).ok).toBe(true);
    expect(vendorSell(userId, "cloth_bandage", 1, pos(stall)).ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(
      coinsBeforeCraftSell + 4 + 2,
    );
    // CL33.2 — market list tonic + bandage from land crafts
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins * 2 + 20 })
      .where(eq(players.id, pid))
      .run();
    expect(createMarketListing(userId, "herbal_tonic", 1, 6).ok).toBe(true);
    expect(createMarketListing(userId, "cloth_bandage", 1, 3).ok).toBe(true);
    expect(
      listMarket(userId).some((l) => l.itemId === "herbal_tonic" && l.mine),
    ).toBe(true);
    expect(
      listMarket(userId).some((l) => l.itemId === "cloth_bandage" && l.mine),
    ).toBe(true);
    // CL23.3 — cook remaining fish
    const kitchen = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "kitchen",
    )!;
    addItem(pid, "fish", 1);
    const cookBefore = getPlayerState(userId)!.cookXp;
    expect(craftRecipeComplete(userId, "cook_fish", pos(kitchen)).ok).toBe(true);
    expect(getPlayerState(userId)!.cookXp).toBeGreaterThan(cookBefore);
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "cooked_fish"),
    ).toBe(true);

    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const explore = getPlayerState(userId)!;
    // CL24.1 / CL24.2 — Explore woodland → forester; mines → miner
    const exploreStump = explore.buildings.find((b) => b.type === "tree_stump")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, exploreStump.id))
      .run();
    const foresterExploreBefore = getPlayerState(userId)!.foresterXp;
    const carpenterExploreBefore = getPlayerState(userId)!.carpenterXp;
    expect(gatherWood(userId, exploreStump.id, pos(exploreStump)).ok).toBe(
      true,
    );
    expect(getPlayerState(userId)!.foresterXp).toBeGreaterThan(
      foresterExploreBefore,
    );
    expect(getPlayerState(userId)!.carpenterXp).toBe(carpenterExploreBefore);
    const exploreOre = explore.buildings.find((b) => b.type === "ore_node")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, exploreOre.id))
      .run();
    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, pid))
      .run();
    const minerExploreBefore = getPlayerState(userId)!.minerXp;
    const smithExploreBefore = getPlayerState(userId)!.blacksmithXp;
    expect(gatherOre(userId, exploreOre.id, pos(exploreOre)).ok).toBe(true);
    expect(getPlayerState(userId)!.minerXp).toBeGreaterThan(minerExploreBefore);
    expect(getPlayerState(userId)!.blacksmithXp).toBe(smithExploreBefore);

    const trail = explore.buildings.find((b) => b.type === "game_trail")!;
    expect(trail).toBeTruthy();
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, trail.id))
      .run();
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    // CL31.1 — trail → animal_hunter XP; thicket → monster_hunter XP
    const animalTrailBefore = getPlayerState(userId)!.animalHunterXp;
    const monsterTrailBefore = getPlayerState(userId)!.monsterHunterXp;
    const cookHuntBefore = getPlayerState(userId)!.cookXp;
    expect(huntTrail(userId, trail.id, pos(trail)).ok).toBe(true);
    expect(getPlayerState(userId)!.animalHunterXp).toBeGreaterThan(
      animalTrailBefore,
    );
    expect(getPlayerState(userId)!.monsterHunterXp).toBe(monsterTrailBefore);
    expect(getPlayerState(userId)!.cookXp).toBe(cookHuntBefore);
    const thicket = explore.buildings.find((b) => b.type === "edge_thicket")!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, thicket.id))
      .run();
    db.update(players)
      .set({ health: 100, energy: 100 })
      .where(eq(players.userId, userId))
      .run();
    const animalThicketBefore = getPlayerState(userId)!.animalHunterXp;
    const monsterThicketBefore = getPlayerState(userId)!.monsterHunterXp;
    const thicketHunt = huntTrail(userId, thicket.id, pos(thicket));
    expect(thicketHunt.ok).toBe(true);
    expect(thicketHunt.encounter?.tusks).toBeGreaterThan(0);
    expect(getPlayerState(userId)!.monsterHunterXp).toBeGreaterThan(
      monsterThicketBefore,
    );
    expect(getPlayerState(userId)!.animalHunterXp).toBe(animalThicketBefore);
    expect(
      getPlayerState(userId)!.inventory.some((s) => s.itemId === "boar_tusk"),
    ).toBe(true);

    expect(travelToLandKind(userId, "warrior").ok).toBe(true);
    const arena = getPlayerState(userId)!;
    expect(arena.buildings).toHaveLength(WARRIOR_BUILDINGS.length);
    expect(arena.buildings.some((b) => b.type === "arena_board")).toBe(true);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    expect(getPlayerState(userId)!.landKind).toBe("city");
    // Claim weaver + builder + fisher at City walk-up (no forced HUD)
    expect(claimTutorialQuest(userId, "weaver").ok).toBe(true);
    expect(claimTutorialQuest(userId, "builder").ok).toBe(true);
    expect(claimTutorialQuest(userId, "fisher").ok).toBe(true);
  });

  it("keeps HUD closed + tips one-shot + CL18–21 practice/gates (edge)", () => {
    const closed = defaultClosedPanelIds();
    expect(closed.length).toBeGreaterThanOrEqual(10);
    for (const need of [
      "inventory",
      "craft",
      "vendor",
      "market",
      "quests",
      "travel",
      "guild",
      "settings",
      "arena",
      "notice",
      "build",
    ] as const) {
      expect(closed).toContain(need);
    }
    // Welcome → Intendente, then city hub (CL12.1) is still dismissible
    const welcome = nextOnboardingTip({
      hasMoved: false,
      hasPlanted: false,
      hasHarvestedWheat: false,
      hasCrafted: false,
      hasVendorVisit: false,
      isOnCity: false,
      hasPlacedStation: false,
      hasMetMayor: false,
      characterLevel: 1,
      dismissed: [],
    });
    expect(welcome?.id).toBe("welcome");
    const hub = nextOnboardingTip({
      hasMoved: false,
      hasPlanted: false,
      hasHarvestedWheat: false,
      hasCrafted: false,
      hasVendorVisit: false,
      isOnCity: false,
      hasPlacedStation: false,
      hasMetMayor: false,
      characterLevel: 1,
      dismissed: ["welcome"],
    });
    expect(hub?.id).toBe("city_hub");
    expect(hub?.text).toBe(cityHubFirstSessionTip());
    // CL16.1 — empty land tip after city hub + free travel dismiss
    const empty = nextOnboardingTip({
      hasMoved: false,
      hasPlanted: false,
      hasHarvestedWheat: false,
      hasCrafted: false,
      hasVendorVisit: false,
      isOnCity: false,
      hasPlacedStation: false,
      hasMetMayor: false,
      characterLevel: 1,
      dismissed: ["welcome", "city_hub", "free_travel"],
    });
    expect(empty?.id).toBe("empty_land");
    expect(empty?.text).toBe(emptyLandBuildBoardTip());
    // CL21.1 — post-craft market tip (dismissible; min HUD)
    const postCraft = nextOnboardingTip({
      hasMoved: true,
      hasPlanted: true,
      hasHarvestedWheat: true,
      hasCrafted: true,
      hasVendorVisit: false,
      isOnCity: false,
      hasPlacedStation: true,
      hasMetMayor: true,
      characterLevel: 1,
      dismissed: ["welcome", "city_hub", "free_travel", "empty_land"],
    });
    expect(postCraft?.id).toBe("post_craft_market");
    expect(postCraft?.text).toBe(postCraftMarketTip());
    expect(
      nextOnboardingTip({
        hasMoved: true,
        hasPlanted: true,
        hasHarvestedWheat: true,
        hasCrafted: true,
        hasVendorVisit: false,
        isOnCity: true,
        hasPlacedStation: true,
        hasMetMayor: true,
        characterLevel: 1,
        dismissed: ["welcome", "city_hub", "free_travel", "empty_land"],
      })?.id,
    ).not.toBe("post_craft_market");
    // CL15.1 / CL16.2 — hunters / builder / breeder stay null;
    // CL19.2 — fisher dock; CL28.3 — alchemist bench
    expect(CITY_PRACTICE_STATIONS.fisher).toEqual(["fishing_dock"]);
    expect(CITY_PRACTICE_STATIONS.alchemist).toEqual(["alchemy_bench"]);
    expect(CITY_PRACTICE_STATIONS.animal_hunter).toBeNull();
    expect(CITY_PRACTICE_STATIONS.monster_hunter).toBeNull();
    expect(CITY_PRACTICE_STATIONS.builder).toBeNull();
    expect(CITY_PRACTICE_STATIONS.animal_breeder).toEqual(["animal_pen"]);
    expect((ECONOMY_PROFESSIONS as readonly string[]).includes("warrior")).toBe(
      false,
    );
    // CL13.3 gate uses weaver column, not carpenter
    const gated = { ...getRecipe("weave_cloth")!, minProfessionXp: 10 };
    expect(meetsRecipeXpGate(gated, 0, 0, 0, 0, 99, 0)).toBe(false);
    expect(meetsRecipeXpGate(gated, 0, 0, 0, 0, 0, 10)).toBe(true);
    // CL18.1–CL18.3 — forester / miner / builder gates are separate columns
    const foresterGate = {
      ...getRecipe("saw_planks")!,
      profession: "forester" as const,
      minProfessionXp: 10,
    };
    expect(meetsRecipeXpGate(foresterGate, 0, 0, 0, 0, 99, 0, 0)).toBe(false);
    expect(meetsRecipeXpGate(foresterGate, 0, 0, 0, 0, 0, 0, 10)).toBe(true);
    const minerGate = {
      ...getRecipe("smelt_iron_bar")!,
      profession: "miner" as const,
      minProfessionXp: 10,
    };
    expect(meetsRecipeXpGate(minerGate, 0, 99, 0, 0, 0, 0, 0, 0)).toBe(false);
    expect(meetsRecipeXpGate(minerGate, 0, 0, 0, 0, 0, 0, 0, 10)).toBe(true);
    const builderGate = {
      ...getRecipe("smelt_iron_bar")!,
      profession: "builder" as const,
      minProfessionXp: BUILDER_PLACE_XP,
    };
    expect(
      meetsRecipeXpGate(builderGate, 0, 99, 0, 0, 0, 0, 0, 0, 0),
    ).toBe(false);
    expect(
      meetsRecipeXpGate(
        builderGate,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        BUILDER_PLACE_XP,
      ),
    ).toBe(true);
  });

  it("refuses already-here, homestead hunt, city place/dock/pen, bad market qty, stub breeder (failure)", () => {
    // Happy path may already be on city — hop away first.
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const again = travelToLandKind(userId, "city");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBe(ACTION_ERROR.travelAlreadyHere);

    // CL13.2 — cannot place stations on city (scarce template only)
    const cityBoard = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "notice_board",
    )!;
    const cityPlace = placeLandStation(userId, "loom", pos(cityBoard));
    expect(cityPlace.ok).toBe(false);
    if (!cityPlace.ok) {
      expect(cityPlace.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }
    // CL19.2 — city fishing dock place also blocked
    const cityDockPlace = placeLandStation(
      userId,
      "fishing_dock",
      pos(cityBoard),
    );
    expect(cityDockPlace.ok).toBe(false);
    if (!cityDockPlace.ok) {
      expect(cityDockPlace.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }
    // CL26.2 — animal pen city blocked
    const cityPen = placeLandStation(userId, "animal_pen", pos(cityBoard));
    expect(cityPen.ok).toBe(false);
    if (!cityPen.ok) {
      expect(cityPen.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }
    // CL25.1 — bad market qty
    const badList = createMarketListing(userId, "cloth", 0, 5);
    expect(badList.ok).toBe(false);
    if (!badList.ok) expect(badList.error).toBe(ACTION_ERROR.marketInvalid);

    // CL19.1 — dock cooldown after happy-path catch
    const dock = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "fishing_dock",
    )!;
    const cool = gatherFish(userId, dock.id, pos(dock));
    expect(cool.ok).toBe(false);
    if (!cool.ok) expect(cool.error).toBe(ACTION_ERROR.fishingDockCooldown);

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const land = getPlayerState(userId)!;
    const refused = huntTrail(
      userId,
      land.buildings[0]!.id,
      pos(land.buildings[0]!),
    );
    expect(refused.ok).toBe(false);
    expect(refused.error).toBe(ACTION_ERROR.huntExploreOnly);

    // CL26.1 — forge refuses under builder XP even with mats/coins
    const pidFail = db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .get()!.id;
    const boardFail = land.buildings.find((b) => b.type === "build_board") ?? { x: 0, z: 0 };
    db.update(players)
      .set({ softCurrency: 200, energy: 100, builderXp: 0 })
      .where(eq(players.id, pidFail))
      .run();
    addItem(pidFail, "iron_bar", 4);
    addItem(pidFail, "wood", 4);
    const forgeGate = placeLandStation(userId, "forge", pos(boardFail));
    expect(forgeGate.ok).toBe(false);
    if (!forgeGate.ok) {
      expect(forgeGate.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }
    // CL28.1 — mill also refuses under builder XP
    const millGate = placeLandStation(userId, "mill", pos(boardFail));
    expect(millGate.ok).toBe(false);
    if (!millGate.ok) {
      expect(millGate.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }
    // CL34.1 — loom also refuses under builder XP
    addItem(pidFail, "plank", 4);
    const loomGate = placeLandStation(userId, "loom", pos(boardFail));
    expect(loomGate.ok).toBe(false);
    if (!loomGate.ok) {
      expect(loomGate.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }
    // CL36.3 — alchemy_bench also refuses under builder XP
    addItem(pidFail, "iron_ore", 2);
    const alchemyGate = placeLandStation(
      userId,
      "alchemy_bench",
      pos(boardFail),
    );
    expect(alchemyGate.ok).toBe(false);
    if (!alchemyGate.ok) {
      expect(alchemyGate.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }
    // CL41.2 — fishing_dock also refuses under builder XP
    addItem(pidFail, "plank", 2);
    const dockGate = placeLandStation(userId, "fishing_dock", pos(boardFail));
    expect(dockGate.ok).toBe(false);
    if (!dockGate.ok) {
      expect(dockGate.error).toBe(
        ACTION_ERROR.needsXp("builder", BUILDER_PLACE_XP),
      );
    }
    // CL32.1 / CL32.2 — city refuses land gather station place
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const cityNotice = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "notice_board",
    )!;
    const cityTreePlace = placeLandStation(
      userId,
      "tree_stump",
      pos(cityNotice),
    );
    expect(cityTreePlace.ok).toBe(false);
    if (!cityTreePlace.ok) {
      expect(cityTreePlace.error).toBe(ACTION_ERROR.buildPlayerLandOnly);
    }
    expect(travelToLandKind(userId, "player_land").ok).toBe(true);

    // CL34.2 — clean refuses without wood
    const penFail = getPlayerState(userId)!.buildings.find(
      (b) => b.type === "animal_pen",
    )!;
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, penFail.id))
      .run();
    db.update(players)
      .set({ energy: 100, builderXp: 0 })
      .where(eq(players.id, pidFail))
      .run();
    const woodHeld = getPlayerState(userId)!
      .inventory.filter((s) => s.itemId === "wood")
      .reduce((n, s) => n + s.qty, 0);
    if (woodHeld > 0) removeItem(pidFail, "wood", woodHeld);
    const cleanFail = cleanAnimalPen(userId, penFail.id, pos(penFail));
    expect(cleanFail.ok).toBe(false);
    if (!cleanFail.ok) {
      expect(cleanFail.error).toBe(ACTION_ERROR.missingItem("Wood"));
    }

    // CL27.3 — animal breeder seeded; happy path already fed → claimable once
    const breeder = getTutorialNpcForPlayer(userId, "animal_breeder");
    expect(breeder?.seededOnCity).toBe(true);
    expect(breeder?.quest.status).toBe("ready");
    expect(claimTutorialQuest(userId, "animal_breeder").ok).toBe(true);
    expect(claimTutorialQuest(userId, "animal_breeder").ok).toBe(false);

    // CL29.1 — cancel listing that is not yours
    expect(travelToLandKind(userId, "city").ok).toBe(true);
    addItem(pidFail, "cloth", 1);
    db.update(players)
      .set({ softCurrency: MARKET.listFeeCoins + 10 })
      .where(eq(players.id, pidFail))
      .run();
    expect(createMarketListing(userId, "cloth", 1, 5).ok).toBe(true);
    const mine = listMarket(userId).find((l) => l.itemId === "cloth" && l.mine)!;
    const steal = cancelMarketListing(buyerId, mine.id);
    expect(steal.ok).toBe(false);
    if (!steal.ok) {
      expect(steal.error).toBe(ACTION_ERROR.marketNotYours);
    }

    // Double-claim weaver after happy path
    const againWeaver = claimTutorialQuest(userId, "weaver");
    expect(againWeaver.ok).toBe(false);
    if (!againWeaver.ok) {
      expect(againWeaver.error).toBe(ACTION_ERROR.questAlreadyClaimed);
    }
  });
});


