import { describe, expect, it } from "vitest";
import {
  ANIMAL_PEN,
  ANIMAL_PEN_FIRST_WALKUP_WORLD_TIP,
  animalPenFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_ANIMAL_PEN_WALKUP_CUE,
  firstAnimalPenWalkUpCueText,
  GATHER_PEN_SUCCESS_CUE,
  isCoreSuccessCueText,
  shouldFlashFirstAnimalPenWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL66.2 — First animal pen walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near animal pen;
 * care / collect rules unchanged; min HUD.
 */
describe("CityLands PL66.2 first animal pen walk-up tip once", () => {
  it("flashes Pen · feed + clean on first pen proximity (happy)", () => {
    expect(firstAnimalPenWalkUpCueText()).toBe(FIRST_ANIMAL_PEN_WALKUP_CUE);
    expect(firstAnimalPenWalkUpCueText()).toBe("Pen · feed + clean");
    expect(firstAnimalPenWalkUpCueText().toLowerCase()).toMatch(/feed|clean/);
    expect(isCoreSuccessCueText("Pen · feed + clean")).toBe(true);
    expect(animalPenFirstWalkUpWorldTip()).toBe(
      ANIMAL_PEN_FIRST_WALKUP_WORLD_TIP,
    );
    expect(animalPenFirstWalkUpWorldTip()).toMatch(/Care/);
    expect(animalPenFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstAnimalPenWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstAnimalPenWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstAnimalPenWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstAnimalPenWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstAnimalPenWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps care cooldown / feed rules and min HUD (failure)", () => {
    expect(ANIMAL_PEN.cooldownMs).toBe(45_000);
    expect(ANIMAL_PEN.feedItemId).toBe("wheat");
    expect(ANIMAL_PEN.cleanItemId).toBe("wood");
    expect(firstAnimalPenWalkUpCueText()).not.toBe(GATHER_PEN_SUCCESS_CUE);
    expect(firstAnimalPenWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(animalPenFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Pen · sticky forever")).toBe(false);
    expect(shouldFlashFirstAnimalPenWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstAnimalPenWalkUpCue(true, true, true)).toBe(false);
  });
});
