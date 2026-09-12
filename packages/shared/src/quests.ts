/**
 * Starter quests that teach the production loop (F13.2).
 * Completion is derived from state; claims are persisted.
 */

export type StarterQuestId =
  | "first_plant"
  | "first_harvest"
  | "first_flour"
  | "first_bread"
  | "first_ore";

export type QuestStatus = "locked" | "active" | "ready" | "claimed";

export interface StarterQuestDef {
  id: StarterQuestId;
  title: string;
  blurb: string;
  /** Prior quest that must be claimed before this unlocks (null = always open). */
  requires: StarterQuestId | null;
  rewardCoins: number;
  rewardCharacterXp: number;
}

export const STARTER_QUESTS: StarterQuestDef[] = [
  {
    id: "first_plant",
    title: "First Seeds",
    blurb: "Walk to a Field and plant wheat (E).",
    requires: null,
    rewardCoins: 5,
    rewardCharacterXp: 15,
  },
  {
    id: "first_harvest",
    title: "Golden Cut",
    blurb: "Harvest ripe wheat when the field turns gold.",
    requires: "first_plant",
    rewardCoins: 8,
    rewardCharacterXp: 20,
  },
  {
    id: "first_flour",
    title: "Mill Hands",
    blurb: "Carry wheat to the Mill and craft flour.",
    requires: "first_harvest",
    rewardCoins: 10,
    rewardCharacterXp: 25,
  },
  {
    id: "first_bread",
    title: "Kitchen Warmth",
    blurb: "Bake bread at the Kitchen (flour + energy).",
    requires: "first_flour",
    rewardCoins: 12,
    rewardCharacterXp: 30,
  },
  {
    id: "first_ore",
    title: "Iron Beginnings",
    blurb: "Chip the Ore Rock with an Iron Hammer (or own iron ore).",
    requires: "first_bread",
    rewardCoins: 15,
    rewardCharacterXp: 35,
  },
];

/**
 * Looks up a starter quest definition by id.
 */
export function getStarterQuest(id: string): StarterQuestDef | null {
  return STARTER_QUESTS.find((q) => q.id === id) ?? null;
}
