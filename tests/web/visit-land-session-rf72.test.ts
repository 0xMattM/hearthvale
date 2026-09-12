import { describe, expect, it } from "vitest";
import { applyVisitLandPayload } from "../../apps/web/lib/visit-land-session";
import type { VisitLandDto } from "@game/shared";

function stubLand(owner: string): VisitLandDto {
  return {
    landId: "land-1",
    ownerUsername: owner,
    landKind: "player_land",
    serverNow: 1_000,
    buildings: [],
  } as VisitLandDto;
}

/**
 * RF7.2 — visit land apply helper.
 */
describe("visit-land-session RF7.2", () => {
  it("stamps receive clock and sets land (happy)", () => {
    const ref = { current: 0 };
    let land: VisitLandDto | null = null;
    applyVisitLandPayload(stubLand("host"), ref, (l) => {
      land = l;
    }, 42);
    expect(ref.current).toBe(42);
    expect(land?.ownerUsername).toBe("host");
  });

  it("overwrites prior visit payload (edge)", () => {
    const ref = { current: 1 };
    let land: VisitLandDto | null = stubLand("old");
    applyVisitLandPayload(stubLand("new"), ref, (l) => {
      land = l;
    }, 99);
    expect(ref.current).toBe(99);
    expect(land?.ownerUsername).toBe("new");
  });

  it("rejects empty owner as still applying dto (fail shape)", () => {
    const ref = { current: 0 };
    let land: VisitLandDto | null = null;
    const empty = stubLand("");
    applyVisitLandPayload(empty, ref, (l) => {
      land = l;
    }, 7);
    expect(land?.ownerUsername).toBe("");
    expect(ref.current).toBe(7);
  });
});
