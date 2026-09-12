import { cityTutorialNpcGrid } from "./catalog-layouts.js";
import {
  screenCompassFromOffset,
  screenCompassPlazaPhrase,
} from "./screen-compass.js";
import {
  MAYOR_DISPLAY_NAME,
  TUTORIAL_QUEST_CHAIN,
  getTutorialNpc,
  type TutorialNpcDef,
  type TutorialNpcId,
} from "./tutorial-npcs.js";

/** Landmark first — compass is screen-relative (isometric follow), not world +Z. */
const TUTOR_LANDMARKS: Readonly<Record<TutorialNpcId, string>> = {
  mayor: "in front of City Hall",
  farmer: "by the wheat plots",
  cook: "by the Kitchen",
  forester: "by the trees",
  carpenter: "by the Workshop",
  miner: "by the ore rocks",
  blacksmith: "by the Forge",
  fisher: "down at the river",
  weaver: "by the Loom",
  alchemist: "by the Alchemy Bench",
  animal_breeder: "by the Animal Pen",
  builder: "on the plaza by the fountain",
  animal_hunter:
    "on the plaza by the fountain — then take Explore for the hunt trails",
  monster_hunter:
    "on the plaza by the fountain — then take Explore for the thicket",
  broker: "by the player Market stall",
  clerk: "by the Deed desk near City Hall",
};

const SKIP_COMPASS: ReadonlySet<TutorialNpcId> = new Set([
  "mayor",
  "builder",
  "animal_hunter",
  "monster_hunter",
  "fisher",
  "broker",
  "clerk",
]);

/**
 * Spoken whereabouts for a city tutor, using the walking camera's compass.
 *
 * @param npcId - Tutorial or civic NPC id.
 * @returns Landmark + screen direction from the plaza.
 */
export function tutorialNpcWhereabouts(npcId: TutorialNpcId): string {
  const landmark = TUTOR_LANDMARKS[npcId];
  if (SKIP_COMPASS.has(npcId)) return landmark;
  const grid = cityTutorialNpcGrid(npcId);
  if (!grid) return landmark;
  const dir = screenCompassFromOffset(grid.x, grid.z);
  if (!dir) return landmark;
  return `${landmark} ${screenCompassPlazaPhrase(dir)}`;
}

/**
 * Plaza whereabouts for “go talk to …” handoffs after a claim.
 * Compass matches the isometric camera (screen-up = north).
 */
export const TUTORIAL_NPC_WHEREABOUTS: Readonly<
  Record<TutorialNpcId, string>
> = {
  mayor: tutorialNpcWhereabouts("mayor"),
  farmer: tutorialNpcWhereabouts("farmer"),
  cook: tutorialNpcWhereabouts("cook"),
  forester: tutorialNpcWhereabouts("forester"),
  carpenter: tutorialNpcWhereabouts("carpenter"),
  miner: tutorialNpcWhereabouts("miner"),
  blacksmith: tutorialNpcWhereabouts("blacksmith"),
  fisher: tutorialNpcWhereabouts("fisher"),
  weaver: tutorialNpcWhereabouts("weaver"),
  alchemist: tutorialNpcWhereabouts("alchemist"),
  animal_breeder: tutorialNpcWhereabouts("animal_breeder"),
  builder: tutorialNpcWhereabouts("builder"),
  animal_hunter: tutorialNpcWhereabouts("animal_hunter"),
  monster_hunter: tutorialNpcWhereabouts("monster_hunter"),
  broker: tutorialNpcWhereabouts("broker"),
  clerk: tutorialNpcWhereabouts("clerk"),
};

/**
 * Next tutor on the onboarding chain, or null at the end / unknown id.
 *
 * @param npcId - Tutor who just finished a lesson.
 * @returns Next NPC def, or null when there is no next step.
 */
export function nextTutorialNpcInChain(npcId: string): TutorialNpcDef | null {
  const index = (TUTORIAL_QUEST_CHAIN as readonly string[]).indexOf(npcId);
  if (index < 0) return null;
  const nextId = TUTORIAL_QUEST_CHAIN[index + 1];
  if (!nextId) return null;
  return getTutorialNpc(nextId);
}

/**
 * Spoken name for a handoff (“the Blacksmith”, not “Blacksmith Tutor”).
 *
 * @param npcId - Tutorial or civic NPC id.
 * @returns Short display name.
 */
export function tutorialNpcSpokenName(npcId: string): string {
  const npc = getTutorialNpc(npcId);
  if (!npc) return "tutor";
  if (npc.id === "mayor") return MAYOR_DISPLAY_NAME;
  return npc.name.replace(/\s+Tutor$/i, "");
}

/**
 * Spoken lines after a quest is claimed — send the player to the next tutor.
 *
 * @param fromNpcId - Tutor who just paid the reward.
 * @returns One or two NPC lines; never a claim prompt.
 */
export function tutorialNpcHandoffLines(fromNpcId: string): string[] {
  const inChain = (TUTORIAL_QUEST_CHAIN as readonly string[]).includes(
    fromNpcId,
  );
  if (!inChain) {
    return ["Come find me if you forget the steps."];
  }
  const next = nextTutorialNpcInChain(fromNpcId);
  if (!next) {
    return [
      "That's all I can teach you.",
      "You've walked every city tutor. The stations stay open if you want more practice.",
    ];
  }
  const name = tutorialNpcSpokenName(next.id);
  const where = tutorialNpcWhereabouts(next.id);
  return [
    "That's all I can teach you here.",
    `Go talk to the ${name} ${where}.`,
  ];
}
