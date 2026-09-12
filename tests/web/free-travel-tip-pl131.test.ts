import { describe, expect, it } from "vitest";
import {
  firstFreeTravelTip,
  formatFreeTravelCircuit,
  LAND_DESTINATIONS,
} from "@game/shared";
import {
  nextOnboardingTip,
  type OnboardingTipId,
} from "../../apps/web/lib/onboarding";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

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

/**
 * PL13.1 — First free-travel tip after city hub / first portal.
 */
describe("CityLands PL13.1 first free-travel tip", () => {
  it("shows dismissible free_travel after city hub (happy)", () => {
    const tip = nextOnboardingTip(tipCtx({ dismissed: ["welcome", "city_hub"] }));
    expect(tip?.id).toBe("free_travel");
    expect(tip?.text).toBe(firstFreeTravelTip());
    expect(tip?.text.toLowerCase()).toMatch(/fare-free|free/);
    expect(tip?.text).toMatch(/\bN\b/);
    expect(tip?.text).toContain(formatFreeTravelCircuit());
    expect(LAND_DESTINATIONS).toHaveLength(4);
  });

  it("shows on City after hub auto-clears — first portal arrive (edge)", () => {
    const tip = nextOnboardingTip(tipCtx({ isOnCity: true, dismissed: ["welcome"] }));
    expect(tip?.id).toBe("free_travel");
    expect(tip?.text.toLowerCase()).toMatch(/four maps|fare-free/);
    expect(
      nextOnboardingTip(
        tipCtx({ dismissed: ["welcome", "city_hub", "free_travel"], isOnCity: true }),
      )?.id,
    ).not.toBe("free_travel");
  });

  it("stays one-shot / min HUD — no sticky travel panel (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("travel");
    expect(firstFreeTravelTip().toLowerCase()).not.toContain("always-on");
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
  });
});
