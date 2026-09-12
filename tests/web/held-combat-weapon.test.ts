import { describe, expect, it } from "vitest";
import { Group } from "three";
import {
  HELD_COMBAT_GRIP_POSE,
  HELD_COMBAT_WEAPON_OBJECT,
  attachHeldCombatWeapon,
  createHeldCombatWeaponGroup,
  detachHeldCombatWeapon,
  heldCombatWeaponSize,
} from "../../apps/web/lib/held-combat-weapon.ts";

/**
 * Held combat meshes parent under a hand/arm group and swap cleanly.
 */
describe("held combat weapon mesh", () => {
  it("builds a named sword group with blade meshes (happy)", () => {
    const sword = createHeldCombatWeaponGroup("sword");
    expect(sword.name).toBe(HELD_COMBAT_WEAPON_OBJECT);
    expect(sword.userData.kind).toBe("sword");
    expect(sword.children.length).toBeGreaterThanOrEqual(3);
    expect(sword.rotation.x).toBeCloseTo(HELD_COMBAT_GRIP_POSE.bone.rotation[0], 5);
    expect(sword.position.y).toBeCloseTo(HELD_COMBAT_GRIP_POSE.bone.position[1], 5);
    const hand = new Group();
    const attached = attachHeldCombatWeapon(hand, "sword");
    expect(hand.getObjectByName(HELD_COMBAT_WEAPON_OBJECT)).toBe(attached);
  });

  it("attaches club/bow under a parent and replaces the previous mesh (edge)", () => {
    const hand = new Group();
    const club = attachHeldCombatWeapon(hand, "club");
    expect(hand.children).toContain(club);
    expect(club.userData.kind).toBe("club");
    const clubSize = heldCombatWeaponSize(club);
    expect(clubSize.longest).toBeGreaterThan(0.45);
    expect(Math.min(clubSize.x, clubSize.y, clubSize.z)).toBeGreaterThan(0.08);
    const bow = attachHeldCombatWeapon(hand, "bow");
    expect(hand.children).toContain(bow);
    expect(hand.children).not.toContain(club);
    expect(bow.userData.kind).toBe("bow");
    expect(hand.getObjectByName(HELD_COMBAT_WEAPON_OBJECT)).toBe(bow);
  });

  it("detach is a no-op when nothing is held (failure)", () => {
    const hand = new Group();
    expect(() => detachHeldCombatWeapon(hand)).not.toThrow();
    expect(hand.children).toHaveLength(0);
    const empty = createHeldCombatWeaponGroup("club");
    expect(empty.userData.kind).toBe("club");
  });
});
