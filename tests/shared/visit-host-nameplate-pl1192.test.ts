import { describe, expect, it } from "vitest";
import {
  PRESENCE_PEER_SILHOUETTE,
  VISIT_HOST_NAMEPLATE,
  shouldReinforceVisitHostNameplateOnArrive,
  shouldShowVisitHostNameplate,
  visitHostNameplateBorderColor,
  visitHostNameplateEmissiveIntensity,
  visitHostNameplateLabel,
  visitHostNameplatePadOpacity,
  visitHostNameplateReinforceEnvelope,
} from "@game/shared";

/**
 * PL119.2 — Visit host nameplate reinforce (soft world host name on arrive).
 * Complements PL15.1 Visiting · ephemeral; visit rules / min HUD unchanged.
 * Choice: always-on cool shed nameplate while visiting + brief arrive pad pulse
 * (not TopBar-only) so the host stays glanceable in-world.
 */
describe("CityLands PL119.2 visit host nameplate reinforce", () => {
  it("shows host label + reinforce on successful visit arrive (happy)", () => {
    expect(shouldShowVisitHostNameplate(true, "alice")).toBe(true);
    expect(shouldReinforceVisitHostNameplateOnArrive(true, "alice")).toBe(
      true,
    );
    expect(visitHostNameplateLabel("alice")).toBe("alice");
    expect(visitHostNameplateLabel("  bob  ")).toBe("bob");

    const peak = visitHostNameplateReinforceEnvelope(0);
    expect(peak).toBeCloseTo(1, 5);
    expect(visitHostNameplatePadOpacity(peak)).toBeCloseTo(
      VISIT_HOST_NAMEPLATE.padOpacityPeak,
      5,
    );
    expect(visitHostNameplateEmissiveIntensity(peak)).toBeCloseTo(
      VISIT_HOST_NAMEPLATE.emissiveIntensityPeak,
      5,
    );
    expect(visitHostNameplateBorderColor(peak)).toBe(
      VISIT_HOST_NAMEPLATE.nameBorderReinforce,
    );
    expect(VISIT_HOST_NAMEPLATE.reinforceDurationMs).toBeGreaterThanOrEqual(
      800,
    );
    expect(VISIT_HOST_NAMEPLATE.reinforceDurationMs).toBeLessThanOrEqual(2500);
  });

  it("keeps cool teal kinship with peer silhouette; steady base quieter (edge)", () => {
    expect(VISIT_HOST_NAMEPLATE.nameBorder).toBe(
      PRESENCE_PEER_SILHOUETTE.nameBorder,
    );
    expect(VISIT_HOST_NAMEPLATE.padOpacityPeak).toBeGreaterThan(
      VISIT_HOST_NAMEPLATE.padOpacityBase,
    );
    expect(VISIT_HOST_NAMEPLATE.emissiveIntensityPeak).toBeGreaterThan(
      VISIT_HOST_NAMEPLATE.emissiveIntensityBase,
    );
    expect(visitHostNameplatePadOpacity(0)).toBeCloseTo(
      VISIT_HOST_NAMEPLATE.padOpacityBase,
      5,
    );
    expect(visitHostNameplateEmissiveIntensity(0)).toBeCloseTo(
      VISIT_HOST_NAMEPLATE.emissiveIntensityBase,
      5,
    );
    expect(visitHostNameplateBorderColor(0)).toBe(
      VISIT_HOST_NAMEPLATE.nameBorder,
    );
    // Mid-window still soft — not a hard cut.
    const mid = visitHostNameplateReinforceEnvelope(
      VISIT_HOST_NAMEPLATE.reinforceDurationMs / 2,
    );
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });

  it("stays quiet on own-land / refuse / empty host (failure)", () => {
    expect(shouldShowVisitHostNameplate(false, "alice")).toBe(false);
    expect(shouldShowVisitHostNameplate(true, "")).toBe(false);
    expect(shouldShowVisitHostNameplate(true, "   ")).toBe(false);
    expect(shouldShowVisitHostNameplate(true, null)).toBe(false);
    expect(shouldReinforceVisitHostNameplateOnArrive(false, "alice")).toBe(
      false,
    );
    expect(shouldReinforceVisitHostNameplateOnArrive(true, "")).toBe(false);
    expect(shouldReinforceVisitHostNameplateOnArrive(true, null)).toBe(false);
    expect(visitHostNameplateLabel("")).toBeNull();
    expect(visitHostNameplateLabel(undefined)).toBeNull();

    const { reinforceDurationMs } = VISIT_HOST_NAMEPLATE;
    expect(visitHostNameplateReinforceEnvelope(-1)).toBe(0);
    expect(visitHostNameplateReinforceEnvelope(reinforceDurationMs)).toBe(0);
    expect(
      visitHostNameplateReinforceEnvelope(reinforceDurationMs + 40),
    ).toBe(0);
  });
});
