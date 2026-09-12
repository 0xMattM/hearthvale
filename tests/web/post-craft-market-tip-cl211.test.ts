import { describe, expect, it } from "vitest";
import { postCraftMarketTip, type PlayerStateDto } from "@game/shared";
import {
  nextOnboardingTip,
  onboardingFlagsFromState,
  type OnboardingTipId,
} from "../../apps/web/lib/onboarding";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

function tipCtx(
  over: Partial<Parameters<typeof nextOnboardingTip>[0]> = {},
): Parameters<typeof nextOnboardingTip>[0] {
  return {
    hasMoved: true,
    hasPlanted: true,
    hasHarvestedWheat: true,
    hasCrafted: true,
    hasVendorVisit: false,
    isOnCity: false,
    hasPlacedStation: true,
    hasMetMayor: false,
    characterLevel: 1,
    dismissed: ["welcome", "city_hub", "free_travel", "empty_land"] as OnboardingTipId[],
    ...over,
  };
}

function craftState(over: Partial<PlayerStateDto> = {}): PlayerStateDto {
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
    buildings: [],
    inventory: [{ id: "i1", itemId: "flour", qty: 1 }],
    serverNow: Date.now(),
    ...over,
  };
}

describe("CityLands CL21.1 post-craft market tip", () => {
  it("shows dismissible post_craft_market after first land craft (happy)", () => {
    const tip = nextOnboardingTip(tipCtx());
    expect(tip?.id).toBe("post_craft_market");
    expect(tip?.text).toBe(postCraftMarketTip());
    expect(tip?.text.toLowerCase()).toMatch(/vendor|market/);
    expect(tip?.text).toMatch(/\bN\b|Portal/);
    expect(onboardingFlagsFromState(craftState()).hasCrafted).toBe(true);
    expect(
      onboardingFlagsFromState(
        craftState({
          inventory: [{ id: "i1", itemId: "cloth", qty: 1 }],
        }),
      ).hasCrafted,
    ).toBe(true);
  });

  it("clears after dismiss, City travel, or vendor visit (edge)", () => {
    expect(
      nextOnboardingTip(
        tipCtx({
          dismissed: ["welcome", "city_hub", "free_travel", "empty_land", "post_craft_market"],
        }),
      )?.id,
    ).not.toBe("post_craft_market");
    expect(
      nextOnboardingTip(tipCtx({ isOnCity: true }))?.id,
    ).not.toBe("post_craft_market");
    expect(
      nextOnboardingTip(tipCtx({ hasVendorVisit: true }))?.id,
    ).not.toBe("post_craft_market");
    expect(
      nextOnboardingTip(tipCtx({ hasCrafted: false }))?.id,
    ).not.toBe("post_craft_market");
  });

  it("stays one-shot / min HUD — no always-on market column (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("market");
    expect(defaultClosedPanelIds()).toContain("vendor");
    expect(postCraftMarketTip().toLowerCase()).not.toContain("always-on");
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
        hasVendorVisit: true,
        characterLevel: 99,
      }),
    );
    expect(forever).toBeNull();
  });
});
