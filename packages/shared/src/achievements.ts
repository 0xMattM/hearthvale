/**
 * Achievement stubs — counters + unlock list (F13.3).
 * Cosmetic recognition only; never combat power.
 */

export type AchievementId =
  | "plant_crops"
  | "harvest_crops"
  | "crafts"
  | "hunts"
  | "quests_complete"
  | "reach_level_5";

export interface AchievementDef {
  id: AchievementId;
  title: string;
  blurb: string;
  /** Progress needed to unlock (counter or synced value). */
  target: number;
  /** When true, progress is derived on read (not bumped). */
  derived?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "plant_crops",
    title: "Green Thumb",
    blurb: "Plant crops on your fields.",
    target: 5,
  },
  {
    id: "harvest_crops",
    title: "Harvester",
    blurb: "Harvest ripe crops.",
    target: 5,
  },
  {
    id: "crafts",
    title: "Station Hand",
    blurb: "Craft at mill, forge, kitchen, or workshop.",
    target: 5,
  },
  {
    id: "hunts",
    title: "Trail Walker",
    blurb: "Complete hunts on trail or thicket.",
    target: 3,
  },
  {
    id: "quests_complete",
    title: "Quest Starter",
    blurb: "Claim all five starter quests.",
    target: 5,
    derived: true,
  },
  {
    id: "reach_level_5",
    title: "Homesteader Badge",
    blurb: "Reach character level 5.",
    target: 5,
    derived: true,
  },
];

/**
 * Looks up an achievement definition.
 */
export function getAchievement(id: string): AchievementDef | null {
  return ACHIEVEMENTS.find((a) => a.id === id) ?? null;
}
