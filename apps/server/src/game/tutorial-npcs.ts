/**
 * City tutorial NPC quests (CL2.2) — walk-up tutors; progress via quest_claims.
 */

import {
  ACTION_ERROR,
  MAYOR_NPC,
  SEEDED_CITY_NPCS,
  getTutorialNpc,
  getTutorialQuest,
  tutorialQuestRequiresMayor,
  isPlayerLandStationType,
  type QuestStatus,
  type TutorialNpcDef,
  type TutorialNpcId,
  type TutorialObjectiveKind,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { buildings, inventory, players, questClaims } from "../db/schema.js";
import { getActiveLand, getLandByKind } from "./land.js";
import type { ActionResult } from "./actions/farming.js";

export interface TutorialNpcRowDto {
  id: TutorialNpcId;
  name: string;
  alias?: string;
  basics: string;
  toolsNeeded: string;
  buildingsNeeded: string;
  seededOnCity: boolean;
  quest: {
    id: string;
    title: string;
    blurb: string;
    status: QuestStatus;
    rewardCoins: number;
    rewardCharacterXp: number;
  };
}

function playerByUserId(userId: string) {
  return db.select().from(players).where(eq(players.userId, userId)).get();
}

function claimedSet(playerId: string): Set<string> {
  const rows = db
    .select()
    .from(questClaims)
    .where(eq(questClaims.playerId, playerId))
    .all();
  return new Set(rows.map((r) => r.questId));
}

function invQty(playerId: string, itemId: string): number {
  return db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, playerId))
    .all()
    .filter((i) => i.itemId === itemId)
    .reduce((s, i) => s + i.qty, 0);
}

/**
 * Whether the tutorial objective is met (ignores claim).
 */
export function isTutorialObjectiveMet(
  playerId: string,
  objective: TutorialObjectiveKind,
): boolean {
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player) return false;
  if (objective === "stub") return false;

  const land = getActiveLand(playerId);
  const landBuildings = land
    ? db.select().from(buildings).where(eq(buildings.landId, land.id)).all()
    : [];

  switch (objective) {
    case "talk":
      // Mayor intro — walking up and talking is the objective.
      return true;
    case "farm_starter_loop": {
      const planted = landBuildings.some(
        (b) => b.type === "crop_plot" && b.cropId != null,
      );
      const harvested =
        invQty(playerId, "wheat") > 0 || invQty(playerId, "flour") > 0;
      return (planted || player.farmerXp > 0) && harvested;
    }
    case "plant_crop": {
      const planted = landBuildings.some(
        (b) => b.type === "crop_plot" && b.cropId != null,
      );
      return (
        planted ||
        player.farmerXp > 0 ||
        invQty(playerId, "wheat") > 0 ||
        invQty(playerId, "flour") > 0
      );
    }
    case "gather_wood":
      return (
        invQty(playerId, "wood") > 0 ||
        invQty(playerId, "plank") > 0 ||
        (player.foresterXp ?? 0) > 0
      );
    case "craft_plank":
      return invQty(playerId, "plank") > 0 || (player.carpenterXp ?? 0) > 0;
    case "gather_ore":
      return (
        invQty(playerId, "iron_ore") > 0 ||
        invQty(playerId, "iron_bar") > 0 ||
        (player.minerXp ?? 0) > 0
      );
    case "smelt_iron_bar":
      return (
        invQty(playerId, "iron_bar") > 0 ||
        invQty(playerId, "iron_hoe") > 0 ||
        invQty(playerId, "iron_hammer") > 0
      );
    case "bake_bread":
      return (
        invQty(playerId, "bread") > 0 ||
        invQty(playerId, "cooked_meat") > 0 ||
        invQty(playerId, "stew") > 0 ||
        (player.cookXp ?? 0) > 0
      );
    case "weave_cloth":
      return invQty(playerId, "cloth") > 0 || (player.weaverXp ?? 0) > 0;
    case "hold_raw_meat":
      // Legacy CL14.1 proxy — kept for old objective strings; Fisher uses hold_fish (CL19.3).
      return (
        invQty(playerId, "raw_meat") > 0 || invQty(playerId, "cooked_meat") > 0
      );
    case "hold_fish":
      // CL19.3 — catch at fishing_dock (city scarce or player land).
      return invQty(playerId, "fish") > 0;
    case "brew_stew":
      // Legacy CL20 Kitchen stand-in; Alchemist now uses hold_herbal_tonic (CL28.3).
      return invQty(playerId, "stew") > 0;
    case "hold_herbal_tonic":
      // CL28.3 — brew at alchemy_bench; cook_stew stays cook at kitchen.
      return invQty(playerId, "herbal_tonic") > 0;
    case "hold_leather":
      // Animal Hunter (CL15.1) — leather drops from Explore game_trail only.
      return invQty(playerId, "leather") > 0;
    case "hold_boar_tusk":
      // Monster Hunter (CL15.1) — tusks drop from Explore edge_thicket only.
      return invQty(playerId, "boar_tusk") > 0;
    case "place_land_station": {
      // Builder (CL15.2 / CL18.3) — station on owned land, or builder XP from place.
      if ((player.builderXp ?? 0) > 0) return true;
      const home = getLandByKind(playerId, "player_land");
      if (!home) return false;
      const homeBuildings = db
        .select()
        .from(buildings)
        .where(eq(buildings.landId, home.id))
        .all();
      return homeBuildings.some((b) => isPlayerLandStationType(b.type));
    }
    case "feed_animal_pen":
      // CL27.3 — wheat feed at land pen grants animal_breeder XP.
      return (player.animalBreederXp ?? 0) > 0;
    default:
      return false;
  }
}

function questStatusFor(
  def: TutorialNpcDef,
  claimed: Set<string>,
  playerId: string,
): QuestStatus {
  if (claimed.has(def.quest.id)) return "claimed";
  if (!def.seededOnCity || def.quest.objective === "stub") return "locked";
  if (
    tutorialQuestRequiresMayor(def.id) &&
    !claimed.has(MAYOR_NPC.quest.id)
  ) {
    return "locked";
  }
  const met = isTutorialObjectiveMet(playerId, def.quest.objective);
  return met ? "ready" : "active";
}

function rowFor(
  def: TutorialNpcDef,
  claimed: Set<string>,
  playerId: string,
): TutorialNpcRowDto {
  return {
    id: def.id,
    name: def.name,
    alias: def.alias,
    basics: def.basics,
    toolsNeeded: def.toolsNeeded,
    buildingsNeeded: def.buildingsNeeded,
    seededOnCity: def.seededOnCity,
    quest: {
      id: def.quest.id,
      title: def.quest.title,
      blurb: def.quest.blurb,
      status: questStatusFor(def, claimed, playerId),
      rewardCoins: def.quest.rewardCoins,
      rewardCharacterXp: def.quest.rewardCharacterXp,
    },
  };
}

/**
 * Lists seeded city tutorial NPCs with quest status (CL2.2).
 */
export function listTutorialNpcs(userId: string): TutorialNpcRowDto[] {
  const player = playerByUserId(userId);
  if (!player) return [];
  const claimed = claimedSet(player.id);
  return SEEDED_CITY_NPCS.map((id) => {
    const def = getTutorialNpc(id);
    if (!def) throw new Error(`missing tutorial npc ${id}`);
    return rowFor(def, claimed, player.id);
  });
}

/**
 * Single NPC tutorial panel payload.
 */
export function getTutorialNpcForPlayer(
  userId: string,
  professionId: string,
): TutorialNpcRowDto | null {
  const player = playerByUserId(userId);
  if (!player) return null;
  const def = getTutorialNpc(professionId);
  if (!def) return null;
  return rowFor(def, claimedSet(player.id), player.id);
}

/**
 * Claims a ready tutorial NPC quest reward.
 */
export function claimTutorialQuest(
  userId: string,
  professionOrQuestId: string,
): ActionResult & {
  rewardCoins?: number;
  rewardCharacterXp?: number;
  npc?: TutorialNpcRowDto;
} {
  const player = playerByUserId(userId);
  if (!player) return { ok: false, error: ACTION_ERROR.playerMissing };

  const byProfession = getTutorialNpc(professionOrQuestId);
  const byQuest = getTutorialQuest(professionOrQuestId);
  const def = byProfession ?? byQuest?.npc ?? null;
  if (!def) return { ok: false, error: ACTION_ERROR.questUnknown };
  if (!def.seededOnCity || def.quest.objective === "stub") {
    return { ok: false, error: ACTION_ERROR.questLocked };
  }

  const claimed = claimedSet(player.id);
  if (claimed.has(def.quest.id)) {
    return { ok: false, error: ACTION_ERROR.questAlreadyClaimed };
  }
  if (
    tutorialQuestRequiresMayor(def.id) &&
    !claimed.has(MAYOR_NPC.quest.id)
  ) {
    return { ok: false, error: ACTION_ERROR.questLocked };
  }
  if (!isTutorialObjectiveMet(player.id, def.quest.objective)) {
    return { ok: false, error: ACTION_ERROR.questNotReady };
  }

  db.insert(questClaims)
    .values({
      playerId: player.id,
      questId: def.quest.id,
      claimedAt: Date.now(),
    })
    .run();

  const fresh =
    db.select().from(players).where(eq(players.id, player.id)).get() ?? player;
  db.update(players)
    .set({
      softCurrency: fresh.softCurrency + def.quest.rewardCoins,
      characterXp: fresh.characterXp + def.quest.rewardCharacterXp,
    })
    .where(eq(players.id, player.id))
    .run();

  return {
    ok: true,
    rewardCoins: def.quest.rewardCoins,
    rewardCharacterXp: def.quest.rewardCharacterXp,
    npc: rowFor(def, claimedSet(player.id), player.id),
  };
}
