import { describe, expect, it } from "vitest";
import {
  CITY_HUB_FIRST_WORLD_TIP,
  cityHubFirstSessionTip,
  cityHubFirstWorldTip,
} from "@game/shared";
import {
  FIRST_CITY_HUB_CUE,
  FIRST_EXPLORE_WALKUP_CUE,
  firstCityHubCueText,
  firstExploreWalkUpCueText,
  isCoreSuccessCueText,
  isEnteringCityMap,
  shouldFlashFirstCityHubCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL57.1 — First city hub ephemeral tip once.
 * One-shot ephemeral TopBar + soft world tip on first City map presence;
 * complements sticky city_hub onboarding; scarce stations unchanged; min HUD.
 */
describe("CityLands PL57.1 first city hub ephemeral tip once", () => {
  it("flashes City · shared hub on first map presence (happy)", () => {
    expect(firstCityHubCueText()).toBe(FIRST_CITY_HUB_CUE);
    expect(firstCityHubCueText()).toBe("City · shared hub");
    expect(firstCityHubCueText().toLowerCase()).toMatch(/city|hub|shared/);
    expect(isCoreSuccessCueText("City · shared hub")).toBe(true);
    expect(cityHubFirstWorldTip()).toBe(CITY_HUB_FIRST_WORLD_TIP);
    expect(cityHubFirstWorldTip()).toMatch(/Scarce|shared/i);

    expect(isEnteringCityMap("player_land", "city")).toBe(true);
    expect(isEnteringCityMap(null, "city")).toBe(true);
    expect(shouldFlashFirstCityHubCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and complements sticky city_hub (edge)", () => {
    expect(shouldFlashFirstCityHubCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstCityHubCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstCityHubCue(true, false, false)).toBe(false);
    expect(isEnteringCityMap("city", "city")).toBe(false);
    expect(isEnteringCityMap("city", "explore")).toBe(false);
    expect(isEnteringCityMap("explore", "explore")).toBe(false);
    // Complements CL12.1 sticky tip — ephemeral is short, sticky stays long.
    expect(firstCityHubCueText()).not.toBe(cityHubFirstSessionTip());
    expect(FIRST_CITY_HUB_CUE.length).toBeLessThan(cityHubFirstSessionTip().length);
    expect(firstCityHubCueText()).not.toBe(firstExploreWalkUpCueText());
    expect(FIRST_CITY_HUB_CUE).not.toBe(FIRST_EXPLORE_WALKUP_CUE);
  });

  it("keeps travel closed and scarce stations / min HUD unchanged (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("travel");
    expect(firstCityHubCueText().toLowerCase()).not.toContain("always-on");
    expect(cityHubFirstWorldTip().toLowerCase()).not.toContain("always-on");
    expect(firstCityHubCueText().toLowerCase()).not.toMatch(
      /daily cap|qty cap|nft|combat power/,
    );
    expect(isCoreSuccessCueText("City · sticky forever")).toBe(false);
    expect(shouldFlashFirstCityHubCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstCityHubCue(true, true, true)).toBe(false);
  });
});
