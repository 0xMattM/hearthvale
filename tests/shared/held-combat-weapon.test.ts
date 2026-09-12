import { describe, expect, it } from "vitest";
import { heldCombatWeaponKind } from "../../packages/shared/src/catalog-combat-gear.ts";

/**
 * Equipped combat weapons become an in-hand mesh only while a fight is live.
 */
describe("heldCombatWeaponKind", () => {
  it("maps club, sword, and bow while combat is active (happy)", () => {
    expect(heldCombatWeaponKind("iron_sword", true)).toBe("sword");
    expect(heldCombatWeaponKind("wooden_club", true)).toBe("club");
    expect(heldCombatWeaponKind("wooden_bow", true)).toBe("bow");
  });

  it("stays empty-handed with only a work tool or while idle (edge)", () => {
    expect(heldCombatWeaponKind("iron_hammer", true)).toBeNull();
    expect(heldCombatWeaponKind("iron_sword", false)).toBeNull();
    expect(heldCombatWeaponKind(null, true)).toBeNull();
    expect(heldCombatWeaponKind(undefined, true)).toBeNull();
  });

  it("hides armor, shields, and unknown ids even in a fight (failure)", () => {
    expect(heldCombatWeaponKind("leather_armor", true)).toBeNull();
    expect(heldCombatWeaponKind("wooden_shield", true)).toBeNull();
    expect(heldCombatWeaponKind("not_a_weapon", true)).toBeNull();
    expect(heldCombatWeaponKind("wheat", true)).toBeNull();
  });
});
