import {
  COMBAT,
  ENERGY,
  ITEMS,
  PLAYER_LAND,
  PLAYER_LAND_BUILDINGS,
  SOFT_CURRENCY,
  STARTER_BUILDINGS,
  STARTER_COINS,
  STARTER_INVENTORY,
  ACTION_ERROR,
  CHARACTER_LEVEL,
  assertCombatPowerIndependentOfChain,
  characterXpProgress,
  cityTutorialNpcIdForSlot,
  hasExtraDecorPadUnlock,
  isCityLandKind,
  isExploreLandKind,
  isPlayerLandKind,
  isWarriorLandKind,
  combatLoadoutBonuses,
  normalizeLandKind,
  normalizeCombatStats,
  nextHealthAfterRegen,
  type ItemId,
  type PlayerStateDto,
  type ProfessionId,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/client.js";
import { buildings, inventory, lands, players, users } from "../db/schema.js";
import {
  getActiveLand,
  completePendingTravel,
  ensureCityYardBuildings,
  ensureForestYardBuildings,
  ensureWarriorYardBuildings,
} from "./land.js";
import { ensureNftBiomeBuildings } from "./creditcoin/nft-biome.js";
import { combatDtoForPlayer, getCombatSession } from "./combat-session.js";
import {
  clearEquipIfMatches,
  equippedLoadoutItemIds,
} from "./actions/equipment.js";
import { listLandDeeds } from "./deeds.js";
import { getCreditcoinSnapshotSync } from "./creditcoin/holdings.js";
import { localLandSize } from "./creditcoin/local-lands.js";
import { guildStateForPlayer } from "./guilds.js";
import { claimDtoForPlayer } from "./actions/claim.js";
import { craftGlancesForBuildings } from "./actions/crafting.js";
/**
 * Applies passive energy regeneration based on elapsed time.
 */
export function applyEnergyRegen(
  player: typeof players.$inferSelect,
  now = Date.now(),
): typeof players.$inferSelect {
  if (player.energy >= player.maxEnergy) {
    if (player.energyUpdatedAt !== now) {
      db.update(players)
        .set({ energyUpdatedAt: now })
        .where(eq(players.id, player.id))
        .run();
    }
    return { ...player, energyUpdatedAt: now };
  }

  const elapsed = Math.max(0, now - player.energyUpdatedAt);
  const ticks = Math.floor(elapsed / ENERGY.regenIntervalMs);
  if (ticks <= 0) return player;

  const nextEnergy = Math.min(
    player.maxEnergy,
    player.energy + ticks * ENERGY.regenAmount,
  );
  const nextUpdated =
    player.energyUpdatedAt + ticks * ENERGY.regenIntervalMs;

  db.update(players)
    .set({ energy: nextEnergy, energyUpdatedAt: nextUpdated })
    .where(eq(players.id, player.id))
    .run();

  return { ...player, energy: nextEnergy, energyUpdatedAt: nextUpdated };
}

/**
 * Applies passive health regeneration based on elapsed time.
 * Pauses (clock freeze, no ticks) while a live fight is open.
 *
 * @param player - Player row.
 * @param now - Clock ms.
 * @returns Row with regen applied and persisted when HP or watermark changed.
 */
export function applyHealthRegen(
  player: typeof players.$inferSelect,
  now = Date.now(),
): typeof players.$inferSelect {
  const next = nextHealthAfterRegen({
    health: player.health,
    maxHealth: player.maxHealth,
    healthUpdatedAt: player.healthUpdatedAt,
    now,
    pause: getCombatSession(player.id) != null,
  });
  if (
    next.health === player.health &&
    next.healthUpdatedAt === player.healthUpdatedAt
  ) {
    return player;
  }
  db.update(players)
    .set({ health: next.health, healthUpdatedAt: next.healthUpdatedAt })
    .where(eq(players.id, player.id))
    .run();
  return {
    ...player,
    health: next.health,
    healthUpdatedAt: next.healthUpdatedAt,
  };
}

/**
 * Spends energy after regen; returns false if insufficient.
 */
export function spendEnergy(
  playerId: string,
  cost: number,
): { ok: true; player: typeof players.$inferSelect } | { ok: false; error: string } {
  const raw = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!raw) return { ok: false, error: ACTION_ERROR.playerMissing };
  const player = applyHealthRegen(applyEnergyRegen(raw));
  if (player.energy < cost) {
    return { ok: false, error: ACTION_ERROR.notEnoughEnergy };
  }
  const next = player.energy - cost;
  db.update(players)
    .set({ energy: next, energyUpdatedAt: Date.now() })
    .where(eq(players.id, playerId))
    .run();
  return { ok: true, player: { ...player, energy: next } };
}

function cropState(
  building: typeof buildings.$inferSelect,
  now: number,
): "empty" | "planted" | "ready" | null {
  if (building.type !== "crop_plot") return null;
  if (!building.cropId || !building.readyAt) return "empty";
  if (now >= building.readyAt) return "ready";
  return "planted";
}

/**
 * Legacy packed homestead seed (mill/forge/kitchen/vendor/trails…).
 * CityLands CL1.1 / CL3.1: NOT called on load/visit/bootstrap — player land starts empty.
 * Tests that need stations may call this explicitly.
 */
export function ensureStarterYardBuildings(landId: string): void {
  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, landId))
    .all();
  for (const def of STARTER_BUILDINGS) {
    if (existing.some((b) => b.slotIndex === def.slotIndex)) continue;
    db.insert(buildings)
      .values({
        id: nanoid(),
        landId,
        type: def.type,
        slotIndex: def.slotIndex,
        x: def.x,
        z: def.z,
        tier: 1,
        cropId: null,
        plantedAt: null,
        readyAt: null,
      })
      .run();
  }
}

/**
 * Ensures non-production markers on player land (CL3.1).
 * Strips leftover walk-up build boards (editor is a hotkey).
 * Never inserts production stations (plots/mill/forge/…).
 */
export function ensurePlayerLandYardBuildings(landId: string): void {
  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, landId))
    .all();
  for (const row of existing) {
    if (row.type !== "build_board") continue;
    db.delete(buildings).where(eq(buildings.id, row.id)).run();
  }
  for (const def of PLAYER_LAND_BUILDINGS) {
    if (existing.some((b) => b.slotIndex === def.slotIndex)) continue;
    // Reason: only non-production markers; never refill STARTER_BUILDINGS pile.
    db.insert(buildings)
      .values({
        id: nanoid(),
        landId,
        type: def.type,
        slotIndex: def.slotIndex,
        x: def.x,
        z: def.z,
        tier: 1,
        cropId: null,
        plantedAt: null,
        readyAt: null,
      })
      .run();
  }
}

/**
 * Soft unlock: extra cosmetic decor pad at character level 5 (F13.1).
 */
export function ensureLevelCosmeticBuildings(
  landId: string,
  characterXp: number,
): void {
  if (!hasExtraDecorPadUnlock(characterXp)) return;
  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, landId))
    .all();
  const pad = CHARACTER_LEVEL.extraDecorPad;
  if (existing.some((b) => b.slotIndex === pad.slotIndex)) return;
  db.insert(buildings)
    .values({
      id: nanoid(),
      landId,
      type: "decor_pad",
      slotIndex: pad.slotIndex,
      x: pad.x,
      z: pad.z,
      tier: 1,
      cropId: null,
      plantedAt: null,
      readyAt: null,
    })
    .run();
}

/**
 * Builds the player state DTO for the client.
 */
export function getPlayerState(userId: string): PlayerStateDto | null {
  const now = Date.now();
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  const rawPlayer = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!user || !rawPlayer) return null;
  const afterEnergy = applyEnergyRegen(rawPlayer, now);
  const player = applyHealthRegen(afterEnergy, now);
  completePendingTravel(player.id, now);
  const afterTravel =
    db.select().from(players).where(eq(players.id, player.id)).get() ?? player;

  const land = getActiveLand(afterTravel.id);
  if (!land) return null;

  const canonicalKind = normalizeLandKind(land.kind) ?? "player_land";

  // Reason: CL3.1 — ensure yard markers only; never refill production on player land.
  if (isPlayerLandKind(land.kind)) {
    ensurePlayerLandYardBuildings(land.id);
    ensureLevelCosmeticBuildings(land.id, afterTravel.characterXp);
    // Reason: NFT plots seed biome gather nodes; free starter yard stays empty (CL3.1).
    if (land.nftTokenId) ensureNftBiomeBuildings(land.id);
  }
  if (isExploreLandKind(land.kind)) ensureForestYardBuildings(land.id);
  if (isCityLandKind(land.kind)) ensureCityYardBuildings(land.id);
  if (isWarriorLandKind(land.kind)) ensureWarriorYardBuildings(land.id);

  const buildingRows = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, land.id))
    .all()
    .sort((a, b) => a.slotIndex - b.slotIndex);

  const invRows = db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, afterTravel.id))
    .all();

  const loadout = equippedLoadoutItemIds(afterTravel);
  const bonuses = combatLoadoutBonuses(loadout);
  const combat = normalizeCombatStats({
    health: afterTravel.health,
    maxHealth: afterTravel.maxHealth,
    damage: afterTravel.damage + bonuses.damage,
    defense: afterTravel.defense + bonuses.defense,
  });

  const deeds = listLandDeeds(afterTravel.id);
  // F15.5 — prove wallet/deed fields never scale combat/energy in the DTO.
  const combatPower = assertCombatPowerIndependentOfChain({
    combat: {
      health: combat.health,
      maxHealth: combat.maxHealth,
      damage: combat.damage,
      defense: combat.defense,
      energy: afterTravel.energy,
      maxEnergy: afterTravel.maxEnergy,
    },
    chainHints: {
      walletAddress: user.walletAddress ?? null,
      deedCount: deeds.length,
      listedDeedCount: deeds.filter((d) => d.status === "listed").length,
      mintTxStub: deeds[0]?.mintTxStub ?? null,
      listPriceCoins: deeds[0]?.listPriceCoins ?? null,
    },
  });

  const landKind = canonicalKind;

  const travelDestinationKind = afterTravel.travelDestinationKind
    ? normalizeLandKind(afterTravel.travelDestinationKind)
    : null;

  const guildState = guildStateForPlayer(afterTravel);
  const claimDto = claimDtoForPlayer(afterTravel.guildId, now);
  const xpProgress = characterXpProgress(afterTravel.characterXp);
  const craftByBuilding = craftGlancesForBuildings(
    buildingRows.map((b) => b.id),
    afterTravel.id,
    landKind,
    now,
  );

  const chainSnap = getCreditcoinSnapshotSync(userId);

  return {
    playerId: afterTravel.id,
    username: user.username,
    walletAddress: user.walletAddress ?? null,
    deeds,
    chain: chainSnap,
    hasNftLand: chainSnap.lands.length > 0,
    softCurrency: afterTravel.softCurrency,
    softCurrencyName: SOFT_CURRENCY.name,
    energy: combatPower.energy,
    maxEnergy: combatPower.maxEnergy,
    characterXp: afterTravel.characterXp,
    characterLevel: xpProgress.level,
    characterTitle: xpProgress.title,
    xpIntoLevel: xpProgress.xpIntoLevel,
    xpToNextLevel: xpProgress.xpToNext,
    farmerXp: afterTravel.farmerXp,
    blacksmithXp: afterTravel.blacksmithXp,
    cookXp: afterTravel.cookXp ?? 0,
    animalHunterXp: afterTravel.animalHunterXp ?? 0,
    monsterHunterXp: afterTravel.monsterHunterXp ?? 0,
    // Reason: legacy DTO field — same column as animal hunter after CL31.1 split.
    hunterXp: afterTravel.animalHunterXp ?? afterTravel.hunterXp ?? 0,
    carpenterXp: afterTravel.carpenterXp ?? 0,
    weaverXp: afterTravel.weaverXp ?? 0,
    foresterXp: afterTravel.foresterXp ?? 0,
    minerXp: afterTravel.minerXp ?? 0,
    builderXp: afterTravel.builderXp ?? 0,
    fisherXp: afterTravel.fisherXp ?? 0,
    animalBreederXp: afterTravel.animalBreederXp ?? 0,
    alchemistXp: afterTravel.alchemistXp ?? 0,
    guildName: guildState.guildName,
    guildRank: guildState.guildRank,
    guildInviteCode: guildState.guildInviteCode,
    health: combatPower.health,
    maxHealth: combatPower.maxHealth,
    damage: combatPower.damage,
    defense: combatPower.defense,
    landId: land.id,
    landKind,
    nftTokenId: land.nftTokenId ?? null,
    nftLandSize: localLandSize(land.nftTokenId),
    travelDestinationKind,
    travelArriveAt: afterTravel.travelArriveAt ?? null,
    buildSlots: land.buildSlots,
    equippedToolInventoryId: afterTravel.equippedToolInventoryId,
    equippedWeaponInventoryId: afterTravel.equippedWeaponInventoryId ?? null,
    equippedArmorInventoryId: afterTravel.equippedArmorInventoryId ?? null,
    equippedShieldInventoryId: afterTravel.equippedShieldInventoryId ?? null,
    combat: combatDtoForPlayer(afterTravel.id, now),
    buildings: buildingRows.map((b) => ({
      id: b.id,
      type: b.type as PlayerStateDto["buildings"][number]["type"],
      slotIndex: b.slotIndex,
      x: b.x,
      z: b.z,
      tier: b.tier ?? 1,
      cropState: cropState(b, now),
      cropId: b.cropId,
      plantedAt: b.plantedAt,
      readyAt: b.readyAt,
      craft: craftByBuilding.get(b.id) ?? null,
      claim: b.type === "claim_node" ? claimDto : null,
      tutorialNpcId:
        b.type === "tutorial_npc"
          ? cityTutorialNpcIdForSlot(b.slotIndex)
          : null,
    })),
    inventory: invRows.map((row) => ({
      id: row.id,
      itemId: row.itemId,
      qty: row.qty,
      durability: row.durability,
    })),
    serverNow: now,
  };
}

/**
 * Bootstraps empty player land + inventory (CityLands CL3.1).
 * Choice vs PlayerVision: default map = free small `player_land` (empty yard; editor via P);
 * city/explore/warrior rows via free travel. Does not seed production chain.
 */
export function bootstrapPlayer(userId: string): void {
  const playerId = nanoid();
  const landId = nanoid();
  const now = Date.now();

  db.insert(players)
    .values({
      id: playerId,
      userId,
      softCurrency: STARTER_COINS,
      energy: ENERGY.maxStart,
      maxEnergy: ENERGY.maxStart,
      energyUpdatedAt: now,
      characterXp: 0,
      farmerXp: 0,
      blacksmithXp: 0,
      cookXp: 0,
      hunterXp: 0,
      animalHunterXp: 0,
      monsterHunterXp: 0,
      carpenterXp: 0,
      weaverXp: 0,
      foresterXp: 0,
      minerXp: 0,
      builderXp: 0,
      fisherXp: 0,
      animalBreederXp: 0,
      alchemistXp: 0,
      guildId: null,
      health: COMBAT.maxHealthStart,
      maxHealth: COMBAT.maxHealthStart,
      healthUpdatedAt: now,
      damage: COMBAT.damageStart,
      defense: COMBAT.defenseStart,
      equippedToolInventoryId: null,
      activeLandId: landId,
    })
    .run();

  db.insert(lands)
    .values({
      id: landId,
      playerId,
      kind: "player_land",
      buildSlots: PLAYER_LAND.buildSlots,
    })
    .run();

  ensurePlayerLandYardBuildings(landId);

  let woodenHoeId: string | null = null;
  for (const starter of STARTER_INVENTORY) {
    const def = ITEMS[starter.itemId];
    const id = nanoid();
    db.insert(inventory)
      .values({
        id,
        playerId,
        itemId: starter.itemId,
        qty: starter.qty,
        durability: def.maxDurability ?? null,
      })
      .run();
    if (starter.itemId === "wooden_hoe") woodenHoeId = id;
  }

  if (woodenHoeId) {
    db.update(players)
      .set({ equippedToolInventoryId: woodenHoeId })
      .where(eq(players.id, playerId))
      .run();
  }
}

/**
 * Adds stackable items (or tool instances).
 */
export function addItem(
  playerId: string,
  itemId: ItemId,
  qty: number,
): void {
  const def = ITEMS[itemId];
  if (!def.stackable) {
    for (let i = 0; i < qty; i += 1) {
      db.insert(inventory)
        .values({
          id: nanoid(),
          playerId,
          itemId,
          qty: 1,
          durability: def.maxDurability ?? null,
        })
        .run();
    }
    return;
  }

  const existing = db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, playerId))
    .all()
    .find((row) => row.itemId === itemId && row.durability == null);

  if (existing) {
    db.update(inventory)
      .set({ qty: existing.qty + qty })
      .where(eq(inventory.id, existing.id))
      .run();
    return;
  }

  db.insert(inventory)
    .values({
      id: nanoid(),
      playerId,
      itemId,
      qty,
      durability: null,
    })
    .run();
}

/**
 * Removes stackable qty; for tools removes one matching stack by item id.
 */
export function removeItem(
  playerId: string,
  itemId: ItemId,
  qty: number,
): boolean {
  const def = ITEMS[itemId];
  if (!def.stackable) {
    const rows = db
      .select()
      .from(inventory)
      .where(eq(inventory.playerId, playerId))
      .all()
      .filter((row) => row.itemId === itemId);
    if (rows.length < qty) return false;
    for (let i = 0; i < qty; i += 1) {
      const row = rows[i];
      const player = db.select().from(players).where(eq(players.id, playerId)).get();
      if (player) clearEquipIfMatches(player.id, row.id);
      db.delete(inventory).where(eq(inventory.id, row.id)).run();
    }
    return true;
  }

  const existing = db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, playerId))
    .all()
    .find((row) => row.itemId === itemId);

  if (!existing || existing.qty < qty) return false;
  const nextQty = existing.qty - qty;
  if (nextQty === 0) db.delete(inventory).where(eq(inventory.id, existing.id)).run();
  else
    db.update(inventory)
      .set({ qty: nextQty })
      .where(eq(inventory.id, existing.id))
      .run();
  return true;
}

/**
 * Adds a non-stackable tool preserving durability (trade escrow restore).
 */
export function addItemWithDurability(
  playerId: string,
  itemId: ItemId,
  durability: number | null | undefined,
): void {
  const def = ITEMS[itemId];
  if (def.stackable) {
    addItem(playerId, itemId, 1);
    return;
  }
  db.insert(inventory)
    .values({
      id: nanoid(),
      playerId,
      itemId,
      qty: 1,
      durability: durability ?? def.maxDurability ?? null,
    })
    .run();
}

/**
 * Pulls tool instances for escrow; returns durability per unit or null on failure.
 */
export function takeItemInstances(
  playerId: string,
  itemId: ItemId,
  qty: number,
): Array<{ durability: number | null }> | null {
  const def = ITEMS[itemId];
  if (def.stackable) {
    if (!removeItem(playerId, itemId, qty)) return null;
    return Array.from({ length: qty }, () => ({ durability: null }));
  }
  const rows = db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, playerId))
    .all()
    .filter((row) => row.itemId === itemId);
  if (rows.length < qty) return null;
  const taken: Array<{ durability: number | null }> = [];
  for (let i = 0; i < qty; i += 1) {
    const row = rows[i];
    taken.push({ durability: row.durability });
    const player = db.select().from(players).where(eq(players.id, playerId)).get();
    if (player) clearEquipIfMatches(player.id, row.id);
    db.delete(inventory).where(eq(inventory.id, row.id)).run();
  }
  return taken;
}

export function grantXp(
  playerId: string,
  profession: ProfessionId,
  amount: number,
): void {
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player) return;
  const characterXp = player.characterXp + amount;
  // Reason: CL31.1 — trail/thicket no longer share `hunter`; legacy `hunter` maps to animal.
  const xpField =
    profession === "farmer"
      ? ("farmerXp" as const)
      : profession === "blacksmith"
        ? ("blacksmithXp" as const)
        : profession === "hunter" || profession === "animal_hunter"
          ? ("animalHunterXp" as const)
          : profession === "monster_hunter"
            ? ("monsterHunterXp" as const)
            : profession === "carpenter"
              ? ("carpenterXp" as const)
              : profession === "weaver"
                ? ("weaverXp" as const)
                : profession === "forester"
                  ? ("foresterXp" as const)
                  : profession === "miner"
                    ? ("minerXp" as const)
                    : profession === "builder"
                      ? ("builderXp" as const)
                      : profession === "fisher"
                        ? ("fisherXp" as const)
                        : profession === "animal_breeder"
                          ? ("animalBreederXp" as const)
                          : profession === "alchemist"
                            ? ("alchemistXp" as const)
                            : ("cookXp" as const);
  const current = (player[xpField] as number | null | undefined) ?? 0;
  db.update(players)
    .set({ [xpField]: current + amount, characterXp })
    .where(eq(players.id, playerId))
    .run();
}
