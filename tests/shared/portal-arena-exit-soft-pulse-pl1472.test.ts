import { describe, expect, it } from "vitest";

import {

  CANONICAL_LAND_KINDS,

  MAP_IDENTITY,

  PORTAL_ARENA_EXIT_SOFT_PULSE,

  PORTAL_FREE_TRAVEL_SOFT_PULSE,

  PORTAL_HIGHLIGHT_FREE_PULSE,

  PORTAL_WORLD_SOFT_WARRIOR,

  portalArenaExitSoftPulseActive,

  portalArenaExitSoftPulseEmissive,

  portalArenaExitSoftPulseEmissiveIntensity,

  portalArenaExitSoftPulseEnvelope,

  portalFreeTravelSoftPulseEmissive,

  portalHighlightFreePulseEnvelope,

  portalMeshTintForLandKind,

  portalWorldLabelParts,

} from "@game/shared";



/**

 * PL147.2 — Arena exit-portal soft pulse leftover.

 * Quiet warmer Exit pulse on warrior portals while interact-highlighted

 * (complements Exit soft PL37.1 + free-travel cyan PL144.1).

 * Fare-free / destinations unchanged; mute ok.

 * Choice: continuous warmer underfoot Exit pulse on Arena portals (not another

 * veil bump) so Exit reads apart from cool Free cyan on other maps.

 */

describe("CityLands PL147.2 arena exit-portal soft pulse leftover", () => {

  it("pulses warmer Exit threshold only on highlighted warrior portals (happy)", () => {

    expect(portalArenaExitSoftPulseActive(true, "warrior")).toBe(true);

    expect(portalArenaExitSoftPulseEmissive(true, "warrior")).toBe(

      PORTAL_ARENA_EXIT_SOFT_PULSE.emissive,

    );

    expect(

      portalArenaExitSoftPulseEmissiveIntensity(true, "warrior", 1),

    ).toBeCloseTo(PORTAL_ARENA_EXIT_SOFT_PULSE.emissivePeak, 5);

    expect(

      portalArenaExitSoftPulseEmissiveIntensity(true, "warrior", 0),

    ).toBeCloseTo(PORTAL_ARENA_EXIT_SOFT_PULSE.emissiveBase, 5);

    expect(PORTAL_ARENA_EXIT_SOFT_PULSE.emissive).toMatch(/^#/);

    expect(PORTAL_ARENA_EXIT_SOFT_PULSE.periodMs).toBe(

      PORTAL_HIGHLIGHT_FREE_PULSE.periodMs,

    );

    expect(portalWorldLabelParts("warrior").soft).toBe(PORTAL_WORLD_SOFT_WARRIOR);

    expect(PORTAL_WORLD_SOFT_WARRIOR.toLowerCase()).toMatch(/exit/);

  });



  it("stays idle off Arena / unhighlighted; warmer ≠ cool Free cyan (edge)", () => {

    expect(portalArenaExitSoftPulseActive(false, "warrior")).toBe(false);

    expect(portalArenaExitSoftPulseActive(true, "city")).toBe(false);

    expect(portalArenaExitSoftPulseActive(true, "player_land")).toBe(false);

    expect(portalArenaExitSoftPulseEmissive(false, "warrior")).toBe("#000000");

    expect(

      portalArenaExitSoftPulseEmissiveIntensity(false, "warrior", 1),

    ).toBeCloseTo(PORTAL_ARENA_EXIT_SOFT_PULSE.emissiveIdle, 5);



    const mid = portalArenaExitSoftPulseEnvelope(

      PORTAL_ARENA_EXIT_SOFT_PULSE.periodMs / 4,

    );

    expect(mid).toBeGreaterThan(0);

    expect(mid).toBeLessThanOrEqual(1);

    expect(mid).toBeCloseTo(

      portalHighlightFreePulseEnvelope(

        PORTAL_HIGHLIGHT_FREE_PULSE.periodMs / 4,

      ),

      5,

    );

    expect(PORTAL_ARENA_EXIT_SOFT_PULSE.emissivePeak).toBeGreaterThan(

      PORTAL_ARENA_EXIT_SOFT_PULSE.emissiveBase,

    );

    expect(PORTAL_ARENA_EXIT_SOFT_PULSE.emissive.toLowerCase()).not.toBe(

      PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive.toLowerCase(),

    );

    // Warm Exit kinship with Arena veil / accent.

    expect(PORTAL_ARENA_EXIT_SOFT_PULSE.emissive.toLowerCase()).toBe(

      MAP_IDENTITY.warrior.portalVeil.toLowerCase(),

    );

    // City Free cyan still distinct for non-warrior portals.

    expect(portalFreeTravelSoftPulseEmissive(true).toLowerCase()).toBe(

      PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive.toLowerCase(),

    );

  });



  it("does not invent fares or collapse map veil tints (failure)", () => {

    expect(portalArenaExitSoftPulseEnvelope(-1)).toBeGreaterThanOrEqual(0);

    expect(

      portalArenaExitSoftPulseEmissiveIntensity(false, "warrior", 3),

    ).toBeCloseTo(PORTAL_ARENA_EXIT_SOFT_PULSE.emissiveIdle, 5);

    expect(portalArenaExitSoftPulseActive(null as never, "warrior")).toBe(

      false,

    );

    expect(portalArenaExitSoftPulseActive(true, null)).toBe(false);

    expect(portalArenaExitSoftPulseActive(true, "")).toBe(false);



    const veils = new Set(

      CANONICAL_LAND_KINDS.map(

        (k) => portalMeshTintForLandKind(k).portalVeil.toLowerCase(),

      ),

    );

    expect(veils.size).toBe(CANONICAL_LAND_KINDS.length);

    for (const kind of CANONICAL_LAND_KINDS) {

      expect(portalWorldLabelParts(kind).soft.toLowerCase()).toMatch(/free/);

      expect(portalWorldLabelParts(kind).soft.toLowerCase()).not.toMatch(

        /fare|caravan|coins/,

      );

    }

  });

});


