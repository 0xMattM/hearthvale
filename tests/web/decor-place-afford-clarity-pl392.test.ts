import { describe, expect, it } from "vitest";
import { HOUSING_DECOR } from "@game/shared";
import {
  decorPlaceAffordMode,
  decorPlaceShortFundsHint,
} from "../../apps/web/lib/hud/decor-afford";

/**
 * PL39.2 — Decor place afford clarity (soft Need Nc when short coins).
 * Choice: compact `Need Nc` + muted/disabled place rows — coin costs unchanged;
 * cosmetic only; no HUD column.
 */
describe("CityLands PL39.2 decor place afford clarity", () => {
  const planter = HOUSING_DECOR.planter;
  const banner = HOUSING_DECOR.banner;

  it("hides short hint when wallet covers decor cost (happy)", () => {
    expect(decorPlaceShortFundsHint(planter.coinCost, planter.coinCost)).toBeNull();
    expect(decorPlaceShortFundsHint(40, planter.coinCost)).toBeNull();
    expect(decorPlaceAffordMode(planter.coinCost, planter.coinCost)).toBe(
      "affordable",
    );
    expect(decorPlaceAffordMode(banner.coinCost, banner.coinCost)).toBe(
      "affordable",
    );
  });

  it("shows Need Nc when short; exact boundary and banner edge", () => {
    expect(decorPlaceShortFundsHint(planter.coinCost - 1, planter.coinCost)).toBe(
      `Need ${planter.coinCost}c`,
    );
    expect(decorPlaceShortFundsHint(0, planter.coinCost)).toBe(
      `Need ${planter.coinCost}c`,
    );
    expect(decorPlaceAffordMode(banner.coinCost - 1, banner.coinCost)).toBe(
      "short",
    );
    expect(decorPlaceShortFundsHint(banner.coinCost - 1, banner.coinCost)).toBe(
      `Need ${banner.coinCost}c`,
    );
  });

  it("keeps decor coin costs unchanged and refuses inventing free place (failure)", () => {
    expect(planter.coinCost).toBe(12);
    expect(banner.coinCost).toBe(18);
    expect(planter.buildingType).toBe("decor_planter");
    expect(banner.buildingType).toBe("decor_banner");
    expect(decorPlaceAffordMode(0, planter.coinCost)).toBe("short");
    expect(decorPlaceShortFundsHint(0, banner.coinCost)).toBe(
      `Need ${banner.coinCost}c`,
    );
    // Afford helper never invents a mat/energy gate — coins only.
    expect(decorPlaceShortFundsHint(11, 12)).toBe("Need 12c");
  });
});
