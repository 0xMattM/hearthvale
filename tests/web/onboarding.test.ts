import { describe, expect, it } from "vitest";
import { cityHubFirstSessionTip } from "@game/shared";
import {
  nextOnboardingTip,
  onboardingFlagsFromState,
  type OnboardingTipId,
} from "../../apps/web/lib/onboarding";
import type { PlayerStateDto } from "@game/shared";

function baseState(over: Partial<PlayerStateDto> = {}): PlayerStateDto {
  return {
    playerId: "p",
    username: "u",
    walletAddress: null,
    deeds: [],
    softCurrency: 40,
    softCurrencyName: "Coins",
    energy: 100,
    maxEnergy: 100,
    characterXp: 0,
    characterLevel: 1,
    characterTitle: "Newcomer",
    xpIntoLevel: 0,
    xpToNextLevel: 40,
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
    guildName: null,
    guildRank: null,
    guildInviteCode: null,
    health: 100,
    maxHealth: 100,
    damage: 10,
    defense: 5,
    landId: "l",
    landKind: "player_land",
    travelDestinationKind: null,
    travelArriveAt: null,
    buildSlots: 8,
    equippedToolInventoryId: null,
    buildings: [
      {
        id: "f1",
        type: "crop_plot",
        slotIndex: 0,
        x: 0,
        z: 0,
        tier: 1,
        cropState: "empty",
        cropId: null,
        plantedAt: null,
        readyAt: null,
        claim: null,
        tutorialNpcId: null,
      },
    ],
    inventory: [],
    serverNow: Date.now(),
    ...over,
  };
}

function tipCtx(
  over: Partial<Parameters<typeof nextOnboardingTip>[0]> = {},
): Parameters<typeof nextOnboardingTip>[0] {
  return {
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
    ...over,
  };
}

describe("onboarding tips", () => {
  it("starts with a one-shot welcome pointing at the Governor (happy)", () => {
    const tip = nextOnboardingTip(tipCtx());
    expect(tip?.id).toBe("welcome");
    expect(tip?.text.toLowerCase()).toMatch(/welcome/);
    expect(tip?.text.toLowerCase()).toMatch(/governor/);
    expect(tip?.text).toMatch(/\bN\b|Portal/);
  });

  it("skips welcome after meeting the Governor and shows city hub (edge)", () => {
    const tip = nextOnboardingTip(tipCtx({ hasMetMayor: true }));
    expect(tip?.id).toBe("city_hub");
    expect(tip?.text).toBe(cityHubFirstSessionTip());
  });

  it("skips City hub after dismiss and advances to free_travel (edge / PL13.1)", () => {
    const tip = nextOnboardingTip(
      tipCtx({ dismissed: ["welcome", "city_hub"], hasMoved: false }),
    );
    expect(tip?.id).toBe("free_travel");
  });

  it("clears City hub when already on City and shows free_travel (edge / PL13.1)", () => {
    const tip = nextOnboardingTip(
      tipCtx({ isOnCity: true, dismissed: ["welcome"] }),
    );
    expect(tip?.id).toBe("free_travel");
  });

  it("advances to plant after movement", () => {
    const tip = nextOnboardingTip(
      tipCtx({
        dismissed: ["welcome", "city_hub", "free_travel", "empty_land"],
        hasMoved: true,
      }),
    );
    expect(tip?.id).toBe("plant");
  });

  it("skips dismissed tips", () => {
    const dismissed: OnboardingTipId[] = [
      "welcome",
      "city_hub",
      "free_travel",
      "empty_land",
      "move",
      "plant",
    ];
    const tip = nextOnboardingTip(tipCtx({ hasMoved: true, dismissed }));
    expect(tip?.id).toBe("wait");
  });

  it("derives planted + city flags from state", () => {
    const flags = onboardingFlagsFromState(
      baseState({
        buildings: [
          {
            id: "f1",
            type: "crop_plot",
            slotIndex: 0,
            x: 0,
            z: 0,
            tier: 1,
            cropState: "planted",
            cropId: "wheat",
            plantedAt: Date.now(),
            readyAt: Date.now() + 1000,
            claim: null,
            tutorialNpcId: null,
          },
        ],
      }),
    );
    expect(flags.hasPlanted).toBe(true);
    expect(flags.isOnCity).toBe(false);
    expect(onboardingFlagsFromState(baseState({ landKind: "city" })).isOnCity).toBe(
      true,
    );
  });

  it("returns null when the guide is complete", () => {
    const tip = nextOnboardingTip(
      tipCtx({
        hasMoved: true,
        hasPlanted: true,
        hasHarvestedWheat: true,
        hasCrafted: true,
        hasVendorVisit: true,
        hasPlacedStation: true,
        dismissed: [
          "welcome",
          "city_hub",
          "free_travel",
          "empty_land",
          "market",
          "visit",
          "ore",
          "expand",
        ],
      }),
    );
    expect(tip).toBeNull();
  });

  it("offers market tip after vendor progress", () => {
    const tip = nextOnboardingTip(
      tipCtx({
        hasMoved: true,
        hasPlanted: true,
        hasHarvestedWheat: true,
        hasCrafted: true,
        hasVendorVisit: true,
        dismissed: ["welcome", "city_hub", "free_travel", "empty_land"],
      }),
    );
    expect(tip?.id).toBe("market");
  });

  it("offers expand tip after ore dismissed", () => {
    const tip = nextOnboardingTip(
      tipCtx({
        hasMoved: true,
        hasPlanted: true,
        hasHarvestedWheat: true,
        hasCrafted: true,
        hasVendorVisit: true,
        dismissed: [
          "welcome",
          "city_hub",
          "free_travel",
          "empty_land",
          "market",
          "visit",
          "ore",
        ],
      }),
    );
    expect(tip?.id).toBe("expand");
  });

  it("offers level tip at Settler (Lv 3+) after expand", () => {
    const tip = nextOnboardingTip(
      tipCtx({
        hasMoved: true,
        hasPlanted: true,
        hasHarvestedWheat: true,
        hasCrafted: true,
        hasVendorVisit: true,
        characterLevel: 3,
        dismissed: [
          "welcome",
          "city_hub",
          "free_travel",
          "empty_land",
          "market",
          "visit",
          "ore",
          "expand",
        ],
      }),
    );
    expect(tip?.id).toBe("level");
  });

  it("never returns tips when showTips path would hide them — city_hub stays dismissible only (failure)", () => {
    // Reason: CL12.1 must not invent a permanent HUD column; tip must remain one-shot.
    const afterDismiss = nextOnboardingTip(
      tipCtx({
        dismissed: ["welcome", "city_hub", "free_travel", "empty_land"],
        hasMoved: true,
        hasPlanted: true,
      }),
    );
    expect(afterDismiss?.id).not.toBe("city_hub");
    const forever = nextOnboardingTip(
      tipCtx({
        dismissed: [
          "welcome",
          "city_hub",
          "free_travel",
          "empty_land",
          "move",
          "plant",
          "wait",
          "harvest",
          "craft",
          "post_craft_market",
          "vendor",
          "market",
          "visit",
          "ore",
          "expand",
          "level",
        ],
        hasMoved: true,
        hasPlanted: true,
        hasHarvestedWheat: true,
        hasCrafted: true,
        hasVendorVisit: true,
        hasPlacedStation: true,
        characterLevel: 99,
      }),
    );
    expect(forever).toBeNull();
  });
});
