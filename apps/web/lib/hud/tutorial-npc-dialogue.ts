import type { TutorialNpcView } from "@/lib/api";
import { MAYOR_DISPLAY_NAME, tutorialNpcHandoffLines } from "@game/shared";

/** One spoken beat in a walk-up tutor conversation. */
export interface TutorialNpcDialogueBeat {
  speaker: "npc" | "player";
  text: string;
  /** Player reply that claims the walk-up quest. */
  claim?: boolean;
}

/** What advancing the current beat should do. */
export type DialogueAdvanceAction = "next" | "claim" | "close";

/** Mayor accept line — spoken by the player, claims the intro quest. */
export const MAYOR_DIALOGUE_ACCEPT = "I'll find the Farmer";

/** Market Broker accept line. */
export const BROKER_DIALOGUE_ACCEPT = "I'll try the Market";

/** Deed Clerk accept line. */
export const CLERK_DIALOGUE_ACCEPT = "I'll open Creditcoin (B)";

/**
 * Player claim reply for civic talk lessons.
 *
 * @param npcId - Walk-up NPC id.
 * @returns Spoken player line.
 */
function civicTalkAcceptLine(npcId: string): string {
  if (npcId === "mayor") return MAYOR_DIALOGUE_ACCEPT;
  if (npcId === "broker") return BROKER_DIALOGUE_ACCEPT;
  if (npcId === "clerk") return CLERK_DIALOGUE_ACCEPT;
  return "I'll take that.";
}

/**
 * Splits tutor copy into one spoken sentence per beat.
 *
 * @param text - Basics / tools / buildings prose.
 * @returns Trimmed sentences; empty input yields no beats.
 */
export function splitSpokenSentences(text: string): string[] {
  if (!text.trim()) return [];
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Drops duplicate sentences so the NPC does not repeat itself.
 *
 * @param lines - Candidate spoken lines.
 * @returns Unique lines in original order.
 */
function uniqueSpokenLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

/**
 * Lesson sentences from the tutor fields, skipping blanks.
 *
 * @param npc - Loaded tutor view.
 * @returns Spoken NPC lines for the current lesson.
 */
function lessonLines(npc: TutorialNpcView): string[] {
  return uniqueSpokenLines([
    ...splitSpokenSentences(npc.basics),
    ...splitSpokenSentences(npc.toolsNeeded),
    ...splitSpokenSentences(npc.buildingsNeeded),
  ]);
}

/**
 * Builds sequential dialogue beats for a walk-up tutor (one line at a time).
 *
 * @param npc - Tutor payload, or null while loading.
 * @returns Beats to show in the talk box.
 */
export function tutorialNpcDialogueLines(
  npc: TutorialNpcView | null,
): TutorialNpcDialogueBeat[] {
  if (!npc) return [{ speaker: "npc", text: "…" }];

  const isCivicTalk =
    npc.id === "mayor" || npc.id === "broker" || npc.id === "clerk";
  const status = npc.quest.status;

  if (status === "locked") {
    return [
      {
        speaker: "npc",
        text: `Hold a moment — the ${MAYOR_DISPLAY_NAME} at City Hall wants a word first.`,
      },
      {
        speaker: "npc",
        text: "Find him by the plaza, then come back and I'll teach you.",
      },
    ];
  }

  if (status === "claimed") {
    return tutorialNpcHandoffLines(npc.id).map((text) => ({
      speaker: "npc" as const,
      text,
    }));
  }

  const spoken = lessonLines(npc);
  if (spoken.length === 0) {
    spoken.push(npc.quest.blurb.trim() || "Hello.");
  }

  const beats: TutorialNpcDialogueBeat[] = spoken.map((text) => ({
    speaker: "npc",
    text,
  }));

  if (status === "ready") {
    if (!isCivicTalk) {
      beats.push({
        speaker: "npc",
        text: `That's the work. Here's ${npc.quest.rewardCoins} coins and a bit of experience.`,
      });
    }
    beats.push({
      speaker: "player",
      text: civicTalkAcceptLine(npc.id),
      claim: true,
    });
    return beats;
  }

  beats.push({
    speaker: "npc",
    text: npc.quest.blurb.trim() || "Come back when the work is done.",
  });
  beats.push({
    speaker: "npc",
    text: "Come back when that's done — I'll have a small reward.",
  });
  return uniqueSpokenLines(beats.map((beat) => beat.text)).map((text) => ({
    speaker: "npc" as const,
    text,
  }));
}

/**
 * Resolves click / E on the current talk beat.
 *
 * @param beats - Full conversation.
 * @param index - Visible beat index.
 * @returns next line, claim the quest, or close the talk box.
 */
export function dialogueAdvanceAction(
  beats: readonly TutorialNpcDialogueBeat[],
  index: number,
): DialogueAdvanceAction {
  if (beats.length === 0) return "close";
  if (index < 0 || index >= beats.length) return "close";
  const beat = beats[index];
  if (beat?.claim) return "claim";
  if (index >= beats.length - 1) return "close";
  return "next";
}
