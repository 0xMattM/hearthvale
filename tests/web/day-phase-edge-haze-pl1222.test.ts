import { describe, expect, it } from "vitest";
import {
  DAY_CYCLE_MS,
  DAY_PHASE_EDGE_HAZE,
  dayCycleProgress,
  dayNightPalette,
  dayPhaseEdgeHazeEnvelope,
  dayPhaseEdgeHazeFogColor,
  dayPhaseEdgeHazeFogRange,
  dayPhaseEdgeHazeHemiIntensity,
  dayPhaseEdgeHazeKind,
  dayPhaseEdgeHazeSunIntensity,
  dayPhaseFromProgress,
} from "../../apps/web/lib/day-night";

/**
 * PL122.2 — Day-phase soft world haze.
 * Choice: brief fog/light reinforce on dusk↔night + night↔dawn edges
 * (complements lighting + PL57.2 cues); midday quiet; cycle toggle off = no haze.
 */
describe("CityLands PL122.2 day-phase soft world haze", () => {
  it("reinforces haze on dusk↔night and night↔dawn edges (happy)", () => {
    expect(DAY_PHASE_EDGE_HAZE.halfWidth).toBeGreaterThan(0);
    expect(DAY_PHASE_EDGE_HAZE.fogColorMix).toBeGreaterThan(0);

    const duskNight = DAY_PHASE_EDGE_HAZE.duskNightAt;
    expect(dayPhaseEdgeHazeKind(duskNight)).toBe("dusk_night");
    expect(dayPhaseEdgeHazeEnvelope(duskNight)).toBeCloseTo(1, 5);
    expect(dayPhaseFromProgress(duskNight)).toBe("night");

    const nightDawn = DAY_PHASE_EDGE_HAZE.nightDawnAt;
    expect(dayPhaseEdgeHazeKind(nightDawn)).toBe("night_dawn");
    expect(dayPhaseEdgeHazeEnvelope(nightDawn)).toBeCloseTo(1, 5);
    expect(dayPhaseFromProgress(nightDawn)).toBe("dawn");

    const wrapNear = 1 - DAY_PHASE_EDGE_HAZE.halfWidth * 0.5;
    expect(dayPhaseEdgeHazeKind(wrapNear)).toBe("night_dawn");
    expect(dayPhaseEdgeHazeEnvelope(wrapNear)).toBeGreaterThan(0.4);

    const [near, far] = dayPhaseEdgeHazeFogRange(22, 48, 1);
    expect(near).toBeLessThan(22);
    expect(far).toBeLessThan(48);
    expect(far).toBeGreaterThan(near);

    const warm = dayPhaseEdgeHazeFogColor("#9bb3c9", "dusk_night", 1);
    const cool = dayPhaseEdgeHazeFogColor("#2a3048", "night_dawn", 1);
    expect(warm).not.toBe("#9bb3c9");
    expect(cool).not.toBe("#2a3048");
    expect(warm).not.toBe(cool);

    expect(dayPhaseEdgeHazeHemiIntensity(0.4, 1)).toBeCloseTo(
      0.4 + DAY_PHASE_EDGE_HAZE.hemiBoost,
      5,
    );
    expect(dayPhaseEdgeHazeSunIntensity(1, 1)).toBeLessThan(1);
  });

  it("stays quiet midday and when cycle disabled (edge)", () => {
    expect(dayPhaseEdgeHazeKind(0.35)).toBeNull();
    expect(dayPhaseEdgeHazeEnvelope(0.35)).toBe(0);
    expect(dayPhaseFromProgress(0.35)).toBe("day");

    expect(dayPhaseEdgeHazeKind(0.72, false)).toBeNull();
    expect(dayPhaseEdgeHazeEnvelope(0.72, false)).toBe(0);

    const [near, far] = dayPhaseEdgeHazeFogRange(22, 48, 0);
    expect(near).toBe(22);
    expect(far).toBe(48);
    expect(dayPhaseEdgeHazeFogColor("#9bb3c9", null, 1)).toBe("#9bb3c9");
    expect(dayPhaseEdgeHazeFogColor("#9bb3c9", "dusk_night", 0)).toBe(
      "#9bb3c9",
    );

    const locked = dayNightPalette(0, "player_land", false);
    expect(locked.phase).toBe("day");
    expect(dayPhaseEdgeHazeEnvelope(dayCycleProgress(0), false)).toBe(0);
  });

  it("keeps cycle length; clamps envelope (failure)", () => {
    expect(DAY_CYCLE_MS).toBe(8 * 60 * 1000);
    expect(dayPhaseEdgeHazeEnvelope(Number.NaN)).toBe(0);
    expect(dayPhaseEdgeHazeKind(Number.NaN)).toBeNull();
    expect(dayPhaseEdgeHazeFogRange(22, 48, 2)[0]).toBeLessThan(22);
    expect(dayPhaseEdgeHazeFogRange(22, 48, -1)[0]).toBe(22);
    expect(dayPhaseEdgeHazeSunIntensity(0.2, 1)).toBeGreaterThanOrEqual(0.08);
    expect(dayPhaseEdgeHazeHemiIntensity(0.5, Number.NaN)).toBe(0.5);

    // Mid-window still readable but below peak.
    const half = DAY_PHASE_EDGE_HAZE.duskNightAt + DAY_PHASE_EDGE_HAZE.halfWidth / 2;
    expect(dayPhaseEdgeHazeEnvelope(half)).toBeGreaterThan(0.4);
    expect(dayPhaseEdgeHazeEnvelope(half)).toBeLessThan(1);
  });
});
