import { describe, expect, it } from "vitest";
import {
  clockBucket,
  shouldPublishClockTick,
} from "../../apps/web/lib/hud/use-synced-now";

describe("synced HUD/scene clock buckets", () => {
  it("publishes when the display bucket advances (happy)", () => {
    expect(clockBucket(1000, 500)).toBe(2);
    expect(shouldPublishClockTick(1000, 1500, 500)).toBe(true);
  });

  it("stays quiet inside the same bucket (edge)", () => {
    expect(shouldPublishClockTick(1000, 1499, 500)).toBe(false);
    expect(clockBucket(1499, 500)).toBe(clockBucket(1000, 500));
  });

  it("does not bucket when the interval is invalid (failure)", () => {
    expect(clockBucket(40, 0)).toBe(40);
    expect(shouldPublishClockTick(40, 40, 0)).toBe(false);
    expect(shouldPublishClockTick(40, 41, 0)).toBe(true);
    expect(shouldPublishClockTick(10, 11, Number.NaN)).toBe(true);
  });
});
