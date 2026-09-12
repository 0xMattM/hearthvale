import { describe, expect, it } from "vitest";
import {
  cityTutorialNpcGrid,
  screenCompassFromOffset,
  tutorialNpcHandoffLines,
  tutorialNpcWhereabouts,
} from "@game/shared";

/**
 * NPC wayfinding uses the isometric camera compass (screen-up = north).
 */
describe("screen compass + tutor whereabouts", () => {
  it("places the Farmer northwest on screen, not world-axis southwest (happy)", () => {
    const farmer = cityTutorialNpcGrid("farmer");
    expect(farmer).toEqual({ x: -8, z: -2 });
    expect(screenCompassFromOffset(farmer!.x, farmer!.z)).toBe("northwest");
    expect(tutorialNpcWhereabouts("farmer")).toMatch(/northwest/);
    expect(tutorialNpcWhereabouts("farmer")).not.toMatch(/southwest/);
    expect(tutorialNpcHandoffLines("mayor")[1]).toMatch(/northwest/);
    expect(tutorialNpcWhereabouts("forester")).toMatch(/southeast/);
  });

  it("maps cook/forge toward the river (screen south) (edge)", () => {
    const cook = cityTutorialNpcGrid("cook");
    expect(screenCompassFromOffset(cook!.x, cook!.z)).toMatch(/south/);
    expect(tutorialNpcWhereabouts("cook")).toMatch(/south/);
    expect(tutorialNpcWhereabouts("cook")).not.toMatch(/north side/);
    const smith = cityTutorialNpcGrid("blacksmith");
    expect(screenCompassFromOffset(smith!.x, smith!.z)).toBe("south");
    expect(tutorialNpcWhereabouts("blacksmith")).toMatch(/south/);
    expect(tutorialNpcWhereabouts("blacksmith")).not.toMatch(/northeast/);
    expect(tutorialNpcWhereabouts("miner")).toMatch(/west|northwest/);
  });

  it("returns null at the origin and ignores invalid offsets (failure)", () => {
    expect(screenCompassFromOffset(0, 0)).toBeNull();
    expect(screenCompassFromOffset(Number.NaN, 1)).toBeNull();
    expect(screenCompassFromOffset(1, Number.NaN)).toBeNull();
    expect(cityTutorialNpcGrid("nope")).toBeNull();
    expect(tutorialNpcWhereabouts("mayor")).toMatch(/City Hall/);
    expect(tutorialNpcWhereabouts("mayor")).not.toMatch(/northwest of the plaza/);
    expect(tutorialNpcWhereabouts("builder")).toMatch(/fountain/);
    expect(tutorialNpcWhereabouts("builder")).not.toMatch(/portal/);
    expect(tutorialNpcWhereabouts("animal_hunter")).toMatch(/fountain/);
    expect(tutorialNpcWhereabouts("monster_hunter")).toMatch(/fountain/);
    expect(cityTutorialNpcGrid("builder")).toEqual({ x: 1, z: 3 });
  });
});
