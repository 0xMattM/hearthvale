import { describe, expect, it } from "vitest";
import { emptyLandBuildBoardTip } from "@game/shared";
import {
  nextOnboardingTip,
  onboardingFlagsFromState,
  type OnboardingTipId,
} from "../../apps/web/lib/onboarding";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";
import type { PlayerStateDto } from "@game/shared";

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

function emptyLandState(
  over: Partial<PlayerStateDto> = {},
): PlayerStateDto {
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
        id: "b1",
        type: "build_board",
        slotIndex: 20,
        x: 0,
        z: 1,
        tier: 1,
        cropState: null,
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

describe("CityLands CL16.1 empty-land build board tip", () => {
  it("exposes dismissible empty_land tip after city hub + free travel (happy)", () => {
    const tip = nextOnboardingTip(
      tipCtx({ dismissed: ["welcome", "city_hub", "free_travel"] }),
    );
    expect(tip?.id).toBe("empty_land");
    expect(tip?.text).toBe(emptyLandBuildBoardTip());
    expect(tip?.text.toLowerCase()).toMatch(/intentional|empty/);
    expect(tip?.text.toLowerCase()).toMatch(/\bp\b|land editor|inventory/);
    expect(tip?.text).toMatch(/\bN\b|Portal/);
  });

  it("clears empty_land after station placed or on City (edge)", () => {
    expect(
      nextOnboardingTip(
        tipCtx({
          dismissed: ["welcome", "city_hub", "free_travel"],
          hasPlacedStation: true,
        }),
      )?.id,
    ).not.toBe("empty_land");
    expect(
      nextOnboardingTip(
        tipCtx({ dismissed: ["welcome", "city_hub", "free_travel"], isOnCity: true }),
      )?.id,
    ).not.toBe("empty_land");
    const flags = onboardingFlagsFromState(emptyLandState());
    expect(flags.hasPlacedStation).toBe(false);
    const withPlot = onboardingFlagsFromState(
      emptyLandState({
        buildings: [
          ...emptyLandState().buildings,
          {
            id: "p1",
            type: "crop_plot",
            slotIndex: 0,
            x: 1,
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
      }),
    );
    expect(withPlot.hasPlacedStation).toBe(true);
  });

  it("stays walk-up / one-shot — build panel closed by default; no always-on tip id (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("build");
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
        ] as OnboardingTipId[],
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
    expect(emptyLandBuildBoardTip().toLowerCase()).not.toContain("always-on");
  });
});
