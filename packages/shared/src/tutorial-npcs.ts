/**
 * City tutorial NPC framework (CL2.2 / CL8.1 / CL13.1 / CL14.1 / CL15.1–CL15.2 / CL16.2).
 * One NPC per economy profession (Professions.md). Warrior is not on this ladder.
 * Seeded on the city hub: Governor (mayor) plus Farmer, Forester, Carpenter,
 * Miner, Blacksmith, Cook, Weaver, Fisher, Alchemist, Animal Hunter,
 * Monster Hunter, Builder, Animal Breeder, Market Broker, Deed Clerk.
 */

import type { BuildingType } from "./catalog.js";
import type { QuestStatus } from "./quests.js";
import {
  BROKER_NPC,
  CLERK_NPC,
  CIVIC_SERVICE_NPCS,
  getCivicServiceNpc,
  type CivicServiceNpcId,
} from "./tutorial-civic-npcs.js";

export {
  BROKER_NPC,
  CLERK_NPC,
  CIVIC_SERVICE_NPCS,
  getCivicServiceNpc,
} from "./tutorial-civic-npcs.js";
export type { CivicServiceNpcId } from "./tutorial-civic-npcs.js";

/**
 * Canonical economy professions from Professions.md — not combat classes.
 */
export type EconomyProfessionId =
  | "farmer"
  | "animal_breeder"
  | "forester"
  | "miner"
  | "fisher"
  | "animal_hunter"
  | "monster_hunter"
  | "carpenter"
  | "blacksmith"
  | "cook"
  | "weaver"
  | "alchemist"
  | "builder";

/** Full ladder — framework slots for every profession (seed later by adding city buildings). */
export const ECONOMY_PROFESSIONS: readonly EconomyProfessionId[] = [
  "farmer",
  "animal_breeder",
  "forester",
  "miner",
  "fisher",
  "animal_hunter",
  "monster_hunter",
  "carpenter",
  "blacksmith",
  "cook",
  "weaver",
  "alchemist",
  "builder",
] as const;

/** Civic + economy walk-up NPCs seeded on the city hub. */
export type TutorialNpcId = EconomyProfessionId | "mayor" | CivicServiceNpcId;

/** Objective kinds the server can evaluate for tutorial quests. */
export type TutorialObjectiveKind =
  /** Mayor intro — talking (opening the panel) is the objective. */
  | "talk"
  /** Farmer onboarding: plant a field and harvest the crop. */
  | "farm_starter_loop"
  | "plant_crop"
  | "gather_wood"
  | "craft_plank"
  | "gather_ore"
  | "smelt_iron_bar"
  | "bake_bread"
  | "weave_cloth"
  /** CL14.1 — fish loop deferred; raw meat from Explore hunt stands in (superseded by hold_fish in CL19.3). */
  | "hold_raw_meat"
  /** CL19.3 — catch fish at fishing dock (city scarce or Your Land). */
  | "hold_fish"
  /** CL14.1 / CL20 — hold stew from Kitchen cook craft (legacy Alchemist stand-in). */
  | "brew_stew"
  /** CL28.3 — hold herbal tonic from alchemy_bench brew. */
  | "hold_herbal_tonic"
  /** CL15.1 — leather from Explore game_trail (Animal Hunter). */
  | "hold_leather"
  /** CL15.1 — boar tusk from Explore edge_thicket (Monster Hunter). */
  | "hold_boar_tusk"
  /** CL15.2 — place any station on owned player land via build board. */
  | "place_land_station"
  /** CL27.3 — feed wheat at a land animal pen (breeder XP or feed success). */
  | "feed_animal_pen"
  | "stub";

export interface TutorialNpcQuestDef {
  /** Persisted in quest_claims (same table as starter quests). */
  id: string;
  title: string;
  blurb: string;
  rewardCoins: number;
  rewardCharacterXp: number;
  objective: TutorialObjectiveKind;
}

export interface TutorialNpcDef {
  id: TutorialNpcId;
  /** Walk-up / panel name. */
  name: string;
  /** Vision alias when docs use another label (e.g. lumberjack ↔ Forester). */
  alias?: string;
  /** Basics lesson. */
  basics: string;
  /** Tools the profession needs. */
  toolsNeeded: string;
  /** Buildings / stations the profession needs. */
  buildingsNeeded: string;
  quest: TutorialNpcQuestDef;
  /** True when this NPC is placed on the shared city hub. */
  seededOnCity: boolean;
}

/**
 * Registry — one entry per economy profession.
 * Seeded NPCs have real objectives; others are stubs ready for city placement.
 */
export const TUTORIAL_NPCS: Record<EconomyProfessionId, TutorialNpcDef> = {
  farmer: {
    id: "farmer",
    name: "Farmer Tutor",
    basics:
      "Buy wheat seeds at the Vendor, plant them on a Field, wait for gold, then harvest.",
    toolsNeeded: "Wooden Hoe for planting and harvest bonuses. Seeds from the Vendor.",
    buildingsNeeded: "Crop Field (city has a few shared plots) plus the Vendor stall.",
    quest: {
      id: "tutorial_farmer",
      title: "First Harvest",
      blurb: "Buy seeds at the Vendor, plant a Field, then harvest ripe wheat.",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "farm_starter_loop",
    },
    seededOnCity: true,
  },
  forester: {
    id: "forester",
    name: "Forester Tutor",
    alias: "Lumberjack",
    basics: "Chop wood at a Tree Stump — Forester is the lumberjack path.",
    toolsNeeded: "Iron Hammer softens gather wear on nodes.",
    buildingsNeeded: "Tree Stump (city has a couple shared trees).",
    quest: {
      id: "tutorial_forester",
      title: "Forester Basics",
      blurb: "Chop wood at a Tree Stump (city trees work).",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "gather_wood",
    },
    seededOnCity: true,
  },
  carpenter: {
    id: "carpenter",
    name: "Carpenter Tutor",
    // Reason: CL39.3 — basics name plank sink assemble_wood_crate; quest stays craft_plank.
    basics:
      "Turn wood into planks at a Workshop, then assemble wood crates from spare planks (assemble_wood_crate plank sink).",
    toolsNeeded: "No special tool — bring wood stacks; sink spare planks into wood crates.",
    buildingsNeeded: "Workshop / carpenter table (one shared in the city).",
    quest: {
      id: "tutorial_carpenter",
      title: "Carpenter Basics",
      blurb: "Craft planks at a Workshop (city table works).",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "craft_plank",
    },
    seededOnCity: true,
  },
  miner: {
    id: "miner",
    name: "Miner Tutor",
    basics: "Chip iron ore from a shared Ore Rock with a hammer equipped.",
    toolsNeeded: "Iron Hammer (city vendor sells one).",
    buildingsNeeded: "Ore Rock (city has a couple shared nodes).",
    quest: {
      id: "tutorial_miner",
      title: "Miner Basics",
      blurb: "Gather iron ore at an Ore Rock (city nodes work).",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "gather_ore",
    },
    seededOnCity: true,
  },
  blacksmith: {
    id: "blacksmith",
    name: "Blacksmith Tutor",
    basics: "Smelt iron ore into bars at the shared Forge.",
    toolsNeeded: "Iron ore stacks — no special tool for smelting.",
    buildingsNeeded: "Forge (one shared in the city).",
    quest: {
      id: "tutorial_blacksmith",
      title: "Blacksmith Basics",
      blurb: "Smelt an iron bar at the Forge (city forge works).",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "smelt_iron_bar",
    },
    seededOnCity: true,
  },
  cook: {
    id: "cook",
    name: "Cook Tutor",
    basics: "Bake bread from flour at the shared Kitchen.",
    toolsNeeded: "Flour from the mill — or buy wheat and mill it.",
    buildingsNeeded: "Kitchen (one shared in the city).",
    quest: {
      id: "tutorial_cook",
      title: "Cook Basics",
      blurb: "Bake bread at the Kitchen (city kitchen works).",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "bake_bread",
    },
    seededOnCity: true,
  },
  weaver: {
    id: "weaver",
    name: "Weaver Tutor",
    basics: "Weave cloth from leather at a Loom — use the scarce city loom or build unlimited looms on Your Land.",
    toolsNeeded: "Leather from Exploration hunts — or trade.",
    buildingsNeeded: "City has one shared Loom; Your Land can place unlimited looms.",
    quest: {
      id: "tutorial_weaver",
      title: "Weaver Basics",
      blurb: "Weave cloth at a Loom (city scarce loom or Your Land).",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "weave_cloth",
    },
    seededOnCity: true,
  },
  fisher: {
    id: "fisher",
    name: "Fisher Tutor",
    basics:
      "Catch Fish at the city river — walk up to the fishing spot on the bank. Your Land can still place unlimited Fishing Docks.",
    toolsNeeded: "No rod yet — walk up and cast from the riverbank.",
    buildingsNeeded:
      "City has one shared river fishing spot; Your Land can place unlimited docks.",
    quest: {
      id: "tutorial_fisher",
      title: "Fisher Basics",
      blurb: "Catch Fish at the city river (or a Fishing Dock on Your Land).",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "hold_fish",
    },
    seededOnCity: true,
  },
  alchemist: {
    id: "alchemist",
    name: "Alchemist Tutor",
    basics:
      "Practice Alchemist at the shared Alchemy Bench — brew a Herbal Tonic (non-combat edible). Hearty Stew stays a Cook craft at the Kitchen. No alchemy combat.",
    toolsNeeded: "Wheat + leather for herbal tonic at the Alchemy Bench.",
    buildingsNeeded:
      "City Alchemy Bench is the Alchemist practice station (scarce ×1); build unlimited benches on Your Land.",
    quest: {
      id: "tutorial_alchemist",
      title: "Alchemist Basics",
      blurb:
        "Brew Herbal Tonic at the Alchemy Bench (Alchemist practice; cook stew stays Cook).",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "hold_herbal_tonic",
    },
    seededOnCity: true,
  },
  animal_hunter: {
    id: "animal_hunter",
    name: "Animal Hunter Tutor",
    basics:
      "Hunt Forest Hares on Exploration game trails — never on Your Land or City. " +
      "Trail wins grant Animal Hunter XP (not Monster Hunter or Cook). Leather proves a trail win.",
    toolsNeeded: "Optional hoe or Iron Hammer for soft hunt damage.",
    buildingsNeeded:
      "Exploration game trails only. Homestead has no hunt nodes; warrior arena is unrelated.",
    quest: {
      id: "tutorial_animal_hunter",
      title: "Animal Hunter Basics",
      blurb: "Win a Game Trail hunt on Exploration and bring Leather.",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "hold_leather",
    },
    seededOnCity: true,
  },
  monster_hunter: {
    id: "monster_hunter",
    name: "Monster Hunter Tutor",
    basics:
      "Fight Brush Boars at Exploration edge thickets — never homestead. " +
      "Thicket wins grant Monster Hunter XP (not Animal Hunter or Cook). Boar Tusks prove an edge win.",
    toolsNeeded: "Optional hoe or Iron Hammer for soft hunt damage.",
    buildingsNeeded:
      "Exploration edge thickets only. City/land refuse hunts; warrior is not this path.",
    quest: {
      id: "tutorial_monster_hunter",
      title: "Monster Hunter Basics",
      blurb: "Win an Edge Thicket hunt on Exploration and bring a Boar Tusk.",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "hold_boar_tusk",
    },
    seededOnCity: true,
  },
  builder: {
    id: "builder",
    name: "Builder Tutor",
    basics:
      "Your Land starts empty on purpose. Walk up to the Build Board and place your first station — unlimited per type.",
    toolsNeeded: "Coins + materials listed on the build board (e.g. wood for a Crop Plot).",
    buildingsNeeded:
      "Build Board on Your Land. City cannot place stations; no forced HUD — walk-up only.",
    quest: {
      id: "tutorial_builder",
      title: "Builder Basics",
      blurb: "Place any station on Your Land via the Build Board.",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "place_land_station",
    },
    seededOnCity: true,
  },
  // CL27.3 / PL170.2 — city scarce pen ×1 + land unlimited; wheat feed / wood bedding.
  animal_breeder: {
    id: "animal_breeder",
    name: "Animal Breeder Tutor",
    basics:
      "Care for the shared city Animal Pen (or build unlimited pens on Your Land), then walk up to feed wheat or refresh bedding with wood. Light practice XP — pens are not a battle source.",
    toolsNeeded: "Wheat from Farmer fields; wood for bedding.",
    buildingsNeeded:
      "Shared city Animal Pen, or Animal Pen on Your Land (Build Board).",
    quest: {
      id: "tutorial_animal_breeder",
      title: "Animal Breeder Basics",
      // Reason: CL41.1 — blurb names feed + clean; objective stays feed_animal_pen.
      blurb:
        "Feed wheat or refresh wood bedding at the shared city Animal Pen or a pen on Your Land.",
      rewardCoins: 6,
      rewardCharacterXp: 18,
      objective: "feed_animal_pen",
    },

    seededOnCity: true,
  },
};

/**
 * Player-facing civic title for the City Hall NPC (`id` stays `mayor`).
 */
export const MAYOR_DISPLAY_NAME = "Governor";

/**
 * City Hall Governor — first onboarding NPC (not an economy profession).
 */
export const MAYOR_NPC: TutorialNpcDef = {
  id: "mayor",
  name: MAYOR_DISPLAY_NAME,
  basics:
    "Welcome, newcomer. This plaza is our shared City — scarce stations, tutors at every craft, a market, and City Hall behind me. Your own land is a short trip through the portal when you are ready to build.",
  toolsNeeded:
    "Start with the Farmer by the wheat plots northwest of the plaza. Buy seeds at the Vendor if you need them.",
  buildingsNeeded:
    "City Hall is the civic heart. Every station has a tutor beside it — follow them in order.",
  quest: {
    id: "tutorial_mayor",
    title: "Meet the Farmer",
    blurb: "Find the Farmer by the wheat plots northwest of the plaza.",
    rewardCoins: 4,
    rewardCharacterXp: 10,
    objective: "talk",
  },
  seededOnCity: true,
};

/**
 * Station-order onboarding chain. The quest log reveals one step at a time.
 * Farmer is locked until the Governor intro is claimed; later tutors stay
 * walk-up claimable so practice is never blocked.
 */
export const TUTORIAL_QUEST_CHAIN: readonly TutorialNpcId[] = [
  "mayor",
  "farmer",
  "cook",
  "forester",
  "carpenter",
  "miner",
  "blacksmith",
  "fisher",
  "weaver",
  "alchemist",
  "animal_breeder",
  "builder",
  "animal_hunter",
  "monster_hunter",
  "broker",
  "clerk",
] as const;

/**
 * Builds a placeholder NPC def so remaining professions can be seeded later.
 */
function stubNpc(
  id: EconomyProfessionId,
  name: string,
): TutorialNpcDef {
  return {
    id,
    name,
    basics: `${name.replace(" Tutor", "")} tutorials arrive when this NPC is seeded on the city.`,
    toolsNeeded: "TBD when seeded.",
    buildingsNeeded: "TBD when seeded.",
    quest: {
      id: `tutorial_${id}`,
      title: `${name.replace(" Tutor", "")} Basics`,
      blurb: "Not available yet — NPC not on the city plaza.",
      rewardCoins: 0,
      rewardCharacterXp: 0,
      objective: "stub",
    },
    seededOnCity: false,
  };
}

/**
 * Economy profession ids currently placed on the city hub.
 * CL2.2: farmer / forester / carpenter · CL8.1: miner / blacksmith / cook ·
 * CL13.1: weaver · CL14.1: fisher / alchemist · CL15.1: animal_hunter / monster_hunter ·
 * CL15.2: builder · CL27.3 / PL170.2: animal_breeder (city scarce + land pens).
 * Warrior is never listed — optional combat path, not economy ladder.
 * Governor is civic (`MAYOR_NPC`); Market Broker / Deed Clerk are civic service tutors.
 */
export const SEEDED_CITY_TUTORIAL_NPCS: readonly EconomyProfessionId[] = [
  "farmer",
  "forester",
  "carpenter",
  "miner",
  "blacksmith",
  "cook",
  "weaver",
  "fisher",
  "alchemist",
  "animal_hunter",
  "monster_hunter",
  "builder",
  "animal_breeder",
] as const;

/** Civic Governor plus economy tutors plus Market Broker / Deed Clerk. */
export const SEEDED_CITY_NPCS: readonly TutorialNpcId[] = [
  "mayor",
  ...SEEDED_CITY_TUTORIAL_NPCS,
  "broker",
  "clerk",
] as const;

/**
 * Distinct cloak accent per economy profession (PL1.2).
 * Pre-PL1.2 only farmer / forester / carpenter differed; others shared gray fallback.
 */
export const TUTOR_CLOAK_COLORS: Readonly<Record<TutorialNpcId, string>> =
  {
    mayor: "#d4b45a",
    farmer: "#5a8a4a",
    forester: "#4a6a3a",
    carpenter: "#8a6a3a",
    miner: "#5a7088",
    blacksmith: "#8a4030",
    cook: "#c47838",
    weaver: "#7a4a8a",
    fisher: "#2a7a9a",
    alchemist: "#3a9a68",
    animal_hunter: "#8a6840",
    monster_hunter: "#6a2848",
    builder: "#9a8850",
    animal_breeder: "#a07050",
    broker: "#6a8a58",
    clerk: "#5e7a8c",
  };

/** Unknown / missing tutor id — legacy gray (not used by seeded professions). */
export const TUTOR_CLOAK_FALLBACK = "#6a7a8a";

/**
 * Cloak hex for a tutorial NPC silhouette (PL1.2).
 *
 * @param professionId - Economy profession id from city template / DTO.
 * @returns Distinct cloak color, or gray fallback for unknown ids.
 */
export function tutorialNpcCloakColor(
  professionId: string | null | undefined,
): string {
  if (professionId && professionId in TUTOR_CLOAK_COLORS) {
    return TUTOR_CLOAK_COLORS[professionId as TutorialNpcId];
  }
  return TUTOR_CLOAK_FALLBACK;
}

/**
 * World / interact label for a city walk-up NPC.
 *
 * @param npcId - Tutorial or civic NPC id.
 * @returns Display name (Governor, farmer, …).
 */
export function tutorialNpcWorldLabel(npcId: string | null | undefined): string {
  if (npcId === "mayor") return MAYOR_DISPLAY_NAME;
  if (npcId === "broker") return BROKER_NPC.name;
  if (npcId === "clerk") return CLERK_NPC.name;
  if (!npcId) return "tutor";
  return npcId.replace(/_/g, " ");
}

/**
 * Quiet world pad / halo + soft secondary when a tutor quest is claimable (PL30.3).
 * Not a HUD column — walk-up only. Claim XP/coins unchanged.
 */
export const TUTOR_CLAIMABLE_WORLD_CUE = {
  soft: "Claim",
  padColor: "#c4a868",
  haloColor: "#e8c878",
  labelBorder: "#e8c878",
} as const;

/**
 * True when tutorial quest status means the reward is claimable on walk-up.
 *
 * @param status - Quest status string from tutorial NPC payload.
 * @returns True only for ready (not active / claimed / locked).
 */
export function isTutorQuestClaimable(status: string): boolean {
  return status === "ready";
}

/**
 * Profession ids whose tutor objectives are claimable (PL30.3).
 *
 * @param npcs - Tutorial NPC rows with quest status.
 * @returns Profession id list for world accent lookup.
 */
export function tutorClaimableProfessionIds(
  npcs: ReadonlyArray<{ id: string; quest: { status: string } }>,
): string[] {
  return npcs
    .filter((n) => isTutorQuestClaimable(n.quest.status))
    .map((n) => n.id);
}

/**
 * World-label hierarchy when a tutor objective is claimable (PL30.3).
 * Display name leads; soft "Claim" secondary — no HUD invent.
 *
 * @param displayName - Tutor walk-up name (profession / alias title).
 * @returns Bold-name + soft detail parts for world Html.
 */
export function tutorClaimableWorldLabelParts(displayName: string): {
  name: string;
  soft: string;
} {
  return {
    name: displayName,
    soft: TUTOR_CLAIMABLE_WORLD_CUE.soft,
  };
}

/**
 * Scarce city stations / gather nodes where a seeded profession can practice
 * without owning land (CL8.2). Homestead is never refilled for these.
 */
export const CITY_PRACTICE_STATIONS: Record<
  EconomyProfessionId,
  readonly BuildingType[] | null
> = {
  farmer: ["crop_plot", "mill"],
  forester: ["tree_stump"],
  carpenter: ["workshop"],
  miner: ["ore_node"],
  blacksmith: ["forge"],
  cook: ["kitchen"],
  // PL170.2 — scarce city pen ×1; land pens stay unlimited.
  animal_breeder: ["animal_pen"],
  fisher: ["fishing_dock"],
  animal_hunter: null,
  monster_hunter: null,
  weaver: ["loom"],
  // CL28.3 — dedicated alchemy bench (city scarce ×1 / land unlimited).
  alchemist: ["alchemy_bench"],
  builder: null,
};

/**
 * Looks up a tutorial NPC definition.
 */
export function getTutorialNpc(
  id: string,
): TutorialNpcDef | null {
  if (id === "mayor") return MAYOR_NPC;
  const civic = getCivicServiceNpc(id);
  if (civic) return civic;
  if ((ECONOMY_PROFESSIONS as readonly string[]).includes(id)) {
    return TUTORIAL_NPCS[id as EconomyProfessionId];
  }
  return null;
}

/**
 * Looks up a tutorial quest by persisted quest id.
 */
export function getTutorialQuest(
  questId: string,
): { npc: TutorialNpcDef; quest: TutorialNpcQuestDef } | null {
  if (MAYOR_NPC.quest.id === questId) {
    return { npc: MAYOR_NPC, quest: MAYOR_NPC.quest };
  }
  for (const npc of CIVIC_SERVICE_NPCS) {
    if (npc.quest.id === questId) return { npc, quest: npc.quest };
  }
  for (const id of ECONOMY_PROFESSIONS) {
    const npc = TUTORIAL_NPCS[id];
    if (npc.quest.id === questId) return { npc, quest: npc.quest };
  }
  return null;
}

/**
 * True when this NPC is gated until the Governor intro is claimed.
 *
 * @param npcId - Walk-up NPC id.
 * @returns True only for the Farmer (first station after the mayor).
 */
export function tutorialQuestRequiresMayor(npcId: string): boolean {
  return npcId === "farmer";
}

/**
 * Quest ids the Q log should show given which chain steps are already claimed.
 * Reveals the next station after each claim so the path appears progressively.
 *
 * @param claimedQuestIds - Persisted quest_claims ids.
 * @returns Visible tutorial/civic quest ids in chain order.
 */
export function visibleOnboardingQuestIds(
  claimedQuestIds: ReadonlySet<string>,
): string[] {
  const visible: string[] = [];
  for (const id of TUTORIAL_QUEST_CHAIN) {
    const npc = getTutorialNpc(id);
    if (!npc) continue;
    visible.push(npc.quest.id);
    if (!claimedQuestIds.has(npc.quest.id)) break;
  }
  return visible;
}

/**
 * True when building type is a walk-up tutorial NPC.
 */
export function isTutorialNpcBuilding(type: string): boolean {
  return type === "tutorial_npc";
}

/**
 * Scarce city station types for a seeded profession (CL8.2).
 *
 * @param professionId - Economy profession id.
 * @returns Station / node types, or empty when not seeded / no city station yet.
 */
export function cityPracticeStationsFor(
  professionId: EconomyProfessionId,
): readonly BuildingType[] {
  return CITY_PRACTICE_STATIONS[professionId] ?? [];
}

export type { QuestStatus };
