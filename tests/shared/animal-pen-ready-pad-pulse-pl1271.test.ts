import { describe, expect, it } from "vitest";

import {

  ANIMAL_PEN,

  ANIMAL_PEN_READY_PAD_PULSE,

  GATHER_READY_WORLD_SOFT,

  animalPenReadyPadEmissiveIntensity,

  animalPenReadyPadPulse,

  animalPenReadyPadPulseEnvelope,

  gatherStationReadyWorldLabelParts,

} from "@game/shared";



/**

 * PL127.1 — Animal-pen ready soft pad pulse.

 * Choice: soft sine pad/emissive while collect-ready (complements PL30.2

 * Ready label + PL69.2 edge cue); cooling quiet; cooldown / rates unchanged.

 */

describe("CityLands PL127.1 animal-pen ready soft pad pulse", () => {

  it("pulses pad while collect-ready (happy)", () => {

    const ready = animalPenReadyPadPulse(true);

    expect(ready.show).toBe(true);

    expect(ready.padOpacity).toBeGreaterThan(0);

    expect(ready.intensity).toBeGreaterThan(0);

    expect(ready.padEmissive.toLowerCase()).toBe(

      ANIMAL_PEN_READY_PAD_PULSE.padEmissive.toLowerCase(),

    );

    expect(ready.padColor.toLowerCase()).toBe(

      ANIMAL_PEN_READY_PAD_PULSE.padColor.toLowerCase(),

    );



    expect(ANIMAL_PEN_READY_PAD_PULSE.pulsePeriodMs).toBeGreaterThan(0);

    expect(ANIMAL_PEN_READY_PAD_PULSE.intensityPeak).toBeGreaterThan(

      ANIMAL_PEN_READY_PAD_PULSE.intensityBase,

    );



    const low = animalPenReadyPadPulseEnvelope(0);

    const mid = animalPenReadyPadPulseEnvelope(

      ANIMAL_PEN_READY_PAD_PULSE.pulsePeriodMs / 4,

    );

    expect(low).toBeGreaterThanOrEqual(0);

    expect(low).toBeLessThanOrEqual(1);

    expect(mid).toBeGreaterThan(low);



    const peak = animalPenReadyPadEmissiveIntensity(true, 1);

    const floor = animalPenReadyPadEmissiveIntensity(true, 0);

    expect(peak).toBeCloseTo(ANIMAL_PEN_READY_PAD_PULSE.intensityPeak, 10);

    expect(floor).toBe(ANIMAL_PEN_READY_PAD_PULSE.intensityBase);

    expect(peak).toBeGreaterThan(floor);

  });



  it("stays quiet while cooling; Ready label unchanged (edge)", () => {

    const cooling = animalPenReadyPadPulse(false);

    expect(cooling.show).toBe(false);

    expect(cooling.padOpacity).toBe(0);

    expect(cooling.intensity).toBe(0);

    expect(animalPenReadyPadEmissiveIntensity(false, 1)).toBe(0);

    expect(animalPenReadyPadEmissiveIntensity(false, 0.5)).toBe(0);



    const parts = gatherStationReadyWorldLabelParts("animal_pen");

    expect(parts.soft).toBe(GATHER_READY_WORLD_SOFT);

    expect(parts.name.toLowerCase()).toMatch(/pen|animal/);

  });



  it("keeps feed/clean cooldown; clamps envelope (failure)", () => {

    expect(ANIMAL_PEN.cooldownMs).toBe(45_000);

    expect(ANIMAL_PEN.feedQty).toBe(1);

    expect(ANIMAL_PEN.cleanQty).toBe(1);

    expect(ANIMAL_PEN.xp).toBe(5);

    expect(animalPenReadyPadEmissiveIntensity(true, 2)).toBeCloseTo(

      ANIMAL_PEN_READY_PAD_PULSE.intensityPeak,

      10,

    );

    expect(animalPenReadyPadEmissiveIntensity(true, -1)).toBe(

      ANIMAL_PEN_READY_PAD_PULSE.intensityBase,

    );

    expect(animalPenReadyPadPulseEnvelope(Number.NaN)).toBe(0);

  });

});


