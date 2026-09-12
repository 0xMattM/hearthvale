import { describe, expect, it } from "vitest";
import { CITY_PLAZA_LANDMARK_CUE } from "../../packages/shared/src/catalog";
import {
  plazaFountainKitMaterials,
  plazaFountainReadsAsBasin,
  plazaFountainRipplePhase,
  plazaFountainRippleRadii,
  plazaFountainStreamAngles,
  plazaFountainVisualLayout,
} from "../../packages/shared/src/world-object-materials";

/**
 * Plaza fountain visual — hollow stone basin + centered expanding ripples.
 */
describe("plaza fountain visual", () => {
  it("keeps a hollow stone pool with a stone nozzle (happy)", () => {
    const layout = plazaFountainVisualLayout();
    const kit = plazaFountainKitMaterials();
    expect(plazaFountainReadsAsBasin(layout)).toBe(true);
    expect(layout.stoneEmissiveIntensity).toBe(0);
    expect(kit.water.metalness).toBe(0);
    expect(layout.nozzleRadius).toBeGreaterThan(0);
    expect(layout.nozzleHeight).toBeGreaterThan(0);
    expect(layout.nozzleRadius).toBeLessThan(layout.upperBowlInner);
    expect(kit.waterColor.toLowerCase()).not.toBe(kit.basinColor.toLowerCase());
    expect(kit.waterColor.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.basinColor.toLowerCase(),
    );
    expect(plazaFountainStreamAngles(layout.streamCount)).toHaveLength(8);
  });

  it("grows ripple radii from the center without XY translation (edge)", () => {
    const layout = plazaFountainVisualLayout();
    expect(plazaFountainRipplePhase(0, layout.ripplePeriodMs)).toBe(0);
    expect(
      plazaFountainRipplePhase(layout.ripplePeriodMs, layout.ripplePeriodMs),
    ).toBe(0);
    const mid = plazaFountainRipplePhase(
      layout.ripplePeriodMs / 2,
      layout.ripplePeriodMs,
    );
    expect(mid).toBeGreaterThan(0.4);
    expect(mid).toBeLessThan(0.6);
    const a = plazaFountainRippleRadii(0, layout.rippleRingCount);
    const b = plazaFountainRippleRadii(0.25, layout.rippleRingCount);
    expect(a).toHaveLength(layout.rippleRingCount);
    expect(a.every((r) => r >= 0 && r < 1)).toBe(true);
    expect(b.some((r, i) => r !== a[i])).toBe(true);
    expect(layout.upperBowlInner).toBeLessThan(layout.upperBowlOuter);
  });

  it("rejects empty / invalid stream counts and ripple clocks (failure)", () => {
    expect(plazaFountainStreamAngles(0)).toEqual([]);
    expect(plazaFountainStreamAngles(-3)).toEqual([]);
    expect(plazaFountainStreamAngles(Number.NaN)).toEqual([]);
    expect(plazaFountainRipplePhase(1000, 0)).toBe(0);
    expect(plazaFountainRipplePhase(Number.NaN)).toBe(0);
    expect(plazaFountainRippleRadii(0.2, 0)).toEqual([]);
    expect(plazaFountainRippleRadii(Number.NaN, 7)).toEqual([]);
    expect(
      plazaFountainReadsAsBasin({
        ...plazaFountainVisualLayout(),
        innerRadius: 1.2,
        outerRadius: 1.0,
      }),
    ).toBe(false);
    expect(
      plazaFountainReadsAsBasin({
        ...plazaFountainVisualLayout(),
        stoneEmissiveIntensity: 0.3,
      }),
    ).toBe(false);
  });
});
