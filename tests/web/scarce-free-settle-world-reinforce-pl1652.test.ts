import { describe, expect, it } from "vitest";
import {
  CITY_SCARCE_FREE_SETTLE_FLASH,
  shouldFlashScarceFreeSettleEdge,
} from "@game/shared";
import {
  SCARCE_FREE_SETTLE_WORLD_REINFORCE,
  scarceFreeSettleWorldReinforceBackground,
  shouldFlashScarceFreeSettleWorldReinforce,
} from "../../apps/web/lib/hud/scarce-free-settle-feedback";
import {
  TRAVEL_ARRIVE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/travel-arrive-feedback";
import {
  DAY_NIGHT_ENABLE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/day-night-enable-feedback";

/**
 * PL165.2 — Scarce-Free-settle soft world reinforce leftover.
 * Brief soft rim when city scarce station settles busy→Free (complements
 * Free settle flash PL119.1 + sticky Free/Busy; contention unchanged). Mute ok.
 * Choice: one-shot cool Free cyan rim (not another Busy pulse / travel Arrived)
 * so every Free settle stays world-readable beside pad dim + sticky Free.
 */
describe("CityLands PL165.2 scarce-Free-settle soft world reinforce leftover", () => {
  it("flashes quiet Free cyan rim on busy→free (happy)", () => {
    expect(shouldFlashScarceFreeSettleWorldReinforce(true, false)).toBe(true);
    expect(SCARCE_FREE_SETTLE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(SCARCE_FREE_SETTLE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = scarceFreeSettleWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(SCARCE_FREE_SETTLE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Same gate as pad settle flash — rim complements, does not replace.
    expect(shouldFlashScarceFreeSettleWorldReinforce(true, false)).toBe(
      shouldFlashScarceFreeSettleEdge(true, false),
    );
    expect(CITY_SCARCE_FREE_SETTLE_FLASH.durationMs).toBeGreaterThan(0);
  });

  it("stays quiet on free→busy / idle; rim ≠ travel / day-night enable (edge)", () => {
    expect(shouldFlashScarceFreeSettleWorldReinforce(false, true)).toBe(false);
    expect(shouldFlashScarceFreeSettleWorldReinforce(false, false)).toBe(false);
    expect(shouldFlashScarceFreeSettleWorldReinforce(true, true)).toBe(false);

    expect(SCARCE_FREE_SETTLE_WORLD_REINFORCE.outerRgba).not.toBe(
      TRAVEL_ARRIVE_WORLD_REINFORCE.outerRgba,
    );
    expect(SCARCE_FREE_SETTLE_WORLD_REINFORCE.midRgba).not.toBe(
      TRAVEL_ARRIVE_WORLD_REINFORCE.midRgba,
    );
    expect(SCARCE_FREE_SETTLE_WORLD_REINFORCE.outerRgba).not.toBe(
      DAY_NIGHT_ENABLE_WORLD_REINFORCE.outerRgba,
    );
    expect(SCARCE_FREE_SETTLE_WORLD_REINFORCE.clearPct).toBeLessThan(
      SCARCE_FREE_SETTLE_WORLD_REINFORCE.midPct,
    );
    expect(SCARCE_FREE_SETTLE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent contention / NFT combat; keeps settle gate (failure)", () => {
    expect(shouldFlashScarceFreeSettleWorldReinforce(true, false)).toBe(
      shouldFlashScarceFreeSettleEdge(true, false),
    );
    expect(scarceFreeSettleWorldReinforceBackground()).not.toMatch(
      /nft|combat|fare/i,
    );
    expect(String(SCARCE_FREE_SETTLE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|nft/i,
    );
    expect(SCARCE_FREE_SETTLE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(shouldFlashScarceFreeSettleWorldReinforce(true, false)).not.toBe(
      shouldFlashScarceFreeSettleWorldReinforce(false, true),
    );
  });
});
