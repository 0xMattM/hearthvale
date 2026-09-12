import { describe, expect, it } from "vitest";
import {
  NEARBY_PEER_PING,
  WORLD,
  inWorldInteractRange,
  peersInInteractRange,
} from "../../packages/shared/src";

/**
 * PL15.2 — Nearby peer soft ping (interact-range ring SoT; zero peers quiet).
 */
describe("CityLands PL15.2 nearby peer soft ping", () => {
  it("flags peers inside interact range for a quiet world ring (happy)", () => {
    const me = { x: 0, z: 0 };
    const near = { username: "bob", x: 0.4, z: 0.2 };
    const far = { username: "cara", x: 4, z: 4 };

    expect(inWorldInteractRange(me.x, me.z, near.x, near.z)).toBe(true);
    expect(inWorldInteractRange(me.x, me.z, far.x, far.z)).toBe(false);

    const inRange = peersInInteractRange(me.x, me.z, [near, far]);
    expect(inRange.map((p) => p.username)).toEqual(["bob"]);
    expect(NEARBY_PEER_PING.ringOuter).toBeGreaterThan(NEARBY_PEER_PING.ringInner);
    expect(NEARBY_PEER_PING.opacity).toBeGreaterThan(0);
    expect(NEARBY_PEER_PING.opacity).toBeLessThanOrEqual(1);
  });

  it("uses the same INTERACT_RANGE as stations — no wider spam radius (edge)", () => {
    const edge = WORLD.INTERACT_RANGE;
    expect(inWorldInteractRange(0, 0, edge, 0)).toBe(true);
    expect(inWorldInteractRange(0, 0, edge + 0.01, 0)).toBe(false);
    expect(peersInInteractRange(0, 0, [{ x: edge, z: 0 }])).toHaveLength(1);
    expect(peersInInteractRange(0, 0, [{ x: edge + 0.05, z: 0 }])).toHaveLength(
      0,
    );
  });

  it("stays quiet with zero peers or empty presence (failure)", () => {
    expect(peersInInteractRange(1, 1, [])).toEqual([]);
    expect(
      peersInInteractRange(0, 0, [
        { username: "far1", x: 10, z: 0 },
        { username: "far2", x: 0, z: -8 },
      ]),
    ).toEqual([]);
    expect(NEARBY_PEER_PING.color).toMatch(/^#/);
  });
});
