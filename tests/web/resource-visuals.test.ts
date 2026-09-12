import { describe, expect, it } from "vitest";
import {
  cropVisual,
  oreVisual,
  resourceBadgeStyle,
  trailVisual,
} from "../../apps/web/lib/resource-visuals";

describe("resource visuals F14.3", () => {
  it("distinguishes empty / sprout / growing / ready crops (happy)", () => {
    const now = 1_000_000;
    expect(cropVisual("empty", null, now, false).state).toBe("empty");
    expect(cropVisual("empty", null, now, false).stemHeight).toBe(0);

    const sprout = cropVisual("planted", now + 160_000, now, false);
    expect(sprout.state).toBe("sprout");
    expect(sprout.showProgressBar).toBe(true);

    const growing = cropVisual("planted", now + 60_000, now, false);
    expect(growing.state).toBe("growing");
    expect(growing.stemHeight).toBeGreaterThan(sprout.stemHeight);

    const ready = cropVisual("ready", now - 1, now, false);
    expect(ready.state).toBe("ready");
    expect(ready.showReadyBadge).toBe(true);
    expect(ready.headColor).toBeTruthy();
  });

  it("marks ore veins and trail tracks only when ready (edge)", () => {
    const oreReady = oreVisual(true, false);
    expect(oreReady.state).toBe("ready");
    expect(oreReady.veinIntensity).toBeGreaterThan(0);
    expect(oreReady.showReadyBadge).toBe(true);

    const oreCool = oreVisual(false, false);
    expect(oreCool.state).toBe("cooling");
    expect(oreCool.veinIntensity).toBe(0);

    const trail = trailVisual(true, false, "trail");
    expect(trail.showTracks).toBe(true);
    expect(trail.creatureScale).toBeGreaterThan(
      trailVisual(false, false, "trail").creatureScale,
    );
  });

  it("rejects confusing same-look for ready vs cooling (failure)", () => {
    const a = oreVisual(true, false);
    const b = oreVisual(false, false);
    expect(a.rockColor).not.toBe(b.rockColor);
    expect(a.veinColor).not.toBe(b.veinColor);
    expect(a.rockSurface.roughness).toBeGreaterThan(0);
    expect(a.veinSurface.metalness).toBeGreaterThan(b.veinSurface.metalness);
    expect(a.understoneColor).not.toBe(b.understoneColor);

    const c = cropVisual("ready", 0, 1, false);
    const d = cropVisual("empty", null, 1, false);
    expect(c.soilColor).not.toBe(d.soilColor);
    expect(resourceBadgeStyle("ready").color).not.toBe(
      resourceBadgeStyle("timer").color,
    );
  });
});
