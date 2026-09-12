import { describe, expect, it } from "vitest";
import {
  HUMANOID_BODY,
  HUMANOID_FOOT_BOTTOM_Y,
  HUMANOID_GROUND_ALIGN_Y,
  HUMANOID_LAYOUT,
} from "../../apps/web/lib/humanoid-layout";

describe("humanoid layout (traveler chibi)", () => {
  it("matches pear-robed traveler reference (happy)", () => {
    expect(HUMANOID_LAYOUT.style).toBe("traveler-chibi");
    expect(HUMANOID_LAYOUT.faceForward).toBe("+z");
    expect(HUMANOID_BODY.torsoLower[0]).toBeGreaterThan(
      HUMANOID_BODY.torsoUpper[0],
    );
    expect(HUMANOID_BODY.worldScale).toBeGreaterThan(1.1);
    expect(HUMANOID_BODY.legStubHeight).toBeGreaterThan(0.24);
    expect(HUMANOID_LAYOUT.eyeRadius).toBeLessThan(0.03);
  });

  it("uses stub limbs not toe cues (edge)", () => {
    expect(HUMANOID_LAYOUT.hasBootToeCue).toBe(false);
    expect(HUMANOID_BODY.hipSpan).toBeGreaterThan(0.1);
    expect(HUMANOID_BODY.sleeveSpan).toBeGreaterThan(
      HUMANOID_BODY.shoulderSpan,
    );
  });

  it("keeps face readable without billboard (failure)", () => {
    expect(HUMANOID_LAYOUT.faceWidth).toBeGreaterThan(0.16);
    expect(HUMANOID_LAYOUT.faceHeight).toBeGreaterThan(0.18);
  });

  it("grounds boot soles at world origin (happy)", () => {
    expect(HUMANOID_FOOT_BOTTOM_Y).toBeGreaterThan(0.34);
    expect(HUMANOID_FOOT_BOTTOM_Y + HUMANOID_GROUND_ALIGN_Y).toBe(0);
  });
});
