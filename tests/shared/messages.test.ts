import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  formatEnergyFullEta,
  formatGrowRemaining,
  syncedNow,
} from "@game/shared";

describe("plain action messages P1.3", () => {
  it("explains energy failure in player language", () => {
    expect(ACTION_ERROR.notEnoughEnergy.toLowerCase()).toContain("energy");
    expect(ACTION_ERROR.notEnoughEnergy.toLowerCase()).toContain("bread");
  });

  it("explains missing materials and station needs", () => {
    expect(ACTION_ERROR.missingMaterials.toLowerCase()).toContain("missing");
    expect(ACTION_ERROR.needsStation("mill")).toContain("mill");
    expect(ACTION_ERROR.stationBusy.toLowerCase()).toMatch(/someone else|station/);
    expect(ACTION_ERROR.chainPayFirst.toLowerCase()).toContain("metamask");
    expect(ACTION_ERROR.landMintOnchain.toLowerCase()).toContain("creditcoin");
  });
});

describe("grow timer formatting P1.2", () => {
  it("formats under a minute as seconds", () => {
    expect(formatGrowRemaining(4500)).toBe("5s");
  });

  it("formats minutes with zero-padded seconds", () => {
    expect(formatGrowRemaining(125_000)).toBe("2:05");
  });

  it("syncs server time from snapshot skew", () => {
    const serverNow = 1_000_000;
    const receivedAt = 2_000_000;
    const localNow = 2_000_500;
    expect(syncedNow(serverNow, receivedAt, localNow)).toBe(1_000_500);
  });
});

describe("energy ETA P6.3", () => {
  it("estimates time to full energy", () => {
    // missing 10 energy, +1 / 30s → 10 ticks → 300s → 5:00
    expect(formatEnergyFullEta(90, 100, 1, 30_000)).toBe("5:00");
  });

  it("returns null when already full", () => {
    expect(formatEnergyFullEta(100, 100, 1, 30_000)).toBeNull();
  });
});
