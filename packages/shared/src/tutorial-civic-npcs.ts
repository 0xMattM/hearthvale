import type { TutorialNpcDef } from "./tutorial-npcs.js";

/**
 * Civic service tutors — not economy professions (wallet / market never gate play).
 */
export type CivicServiceNpcId = "broker" | "clerk";

/**
 * Player-to-player Market stall tutor (east plaza).
 */
export const BROKER_NPC: TutorialNpcDef = {
  id: "broker",
  name: "Market Broker",
  basics:
    "The Vendor buys and sells with the city. The sage Market stall is for other players — list goods, browse asks, cancel if you change your mind. The indigo stall in front of it is the REALM market.",
  toolsNeeded:
    "Walk up to the sage Market stall or press M. Listing costs a small coin fee and expires; unsold goods come back. REALM listings are the stall in front, or press B.",
  buildingsNeeded:
    "Player Market is the sage stall east of the fountain. The indigo stall in front of it lists goods for REALM. Analytics on the board compare player asks to the Vendor NPC.",
  quest: {
    id: "tutorial_broker",
    title: "Player Market",
    blurb: "Learn the player Market stall — list and buy goods with other players.",
    rewardCoins: 4,
    rewardCharacterXp: 10,
    objective: "talk",
  },
  seededOnCity: true,
};

/**
 * Optional Creditcoin / REALM / land-NFT tutor (Deed desk).
 * Lessons only — a wallet is never required to play or claim.
 */
export const CLERK_NPC: TutorialNpcDef = {
  id: "clerk",
  name: "Deed Clerk",
  basics:
    "Creditcoin is optional. Press B to link a wallet, swap coins for REALM, and mint or buy land NFTs. Ownership only — never combat power.",
  toolsNeeded:
    "Play works without a wallet. If you opt in, swap coins to REALM in tens (10 coins = 1 REALM), then use REALM for listed lands.",
  buildingsNeeded:
    "The Deed desk by City Hall is the same path as B. The indigo stall in front of the coin Market lists goods for REALM. Land NFTs are production / ownership — they never change fight stats.",
  quest: {
    id: "tutorial_clerk",
    title: "Realm & Lands",
    blurb: "Learn optional Creditcoin: claim REALM and buy land NFTs (never required to play).",
    rewardCoins: 4,
    rewardCharacterXp: 10,
    objective: "talk",
  },
  seededOnCity: true,
};

/** Civic service tutors seeded on the city hub (not profession ladder). */
export const CIVIC_SERVICE_NPCS: readonly TutorialNpcDef[] = [
  BROKER_NPC,
  CLERK_NPC,
];

/**
 * Civic service tutor by id.
 *
 * @param id - Walk-up NPC id.
 * @returns Def, or null when not a civic service tutor.
 */
export function getCivicServiceNpc(id: string): TutorialNpcDef | null {
  if (id === "broker") return BROKER_NPC;
  if (id === "clerk") return CLERK_NPC;
  return null;
}
