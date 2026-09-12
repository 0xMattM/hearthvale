import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PANEL = path.join(
  process.cwd(),
  "apps/web/components/hud/TravelPanel.tsx",
);

describe("Travel panel NFT homestead tiles", () => {
  it("lists NFT plots without adding a fifth map kind (happy)", () => {
    const src = fs.readFileSync(PANEL, "utf8");
    expect(src).toContain("data-nft-plot");
    expect(src).toContain("nftPlots");
    expect(src).toContain("LAND_DESTINATIONS.map");
  });

  it("does not mark starter Land as here while on an NFT plot (edge)", () => {
    const src = fs.readFileSync(PANEL, "utf8");
    expect(src).toContain("!state.nftTokenId");
    expect(src).toContain('dest.kind === "player_land"');
  });

  it("travels with landId rather than a new canonical kind (failure)", () => {
    const src = fs.readFileSync(PANEL, "utf8");
    expect(src).toContain("land.landId ?? land.tokenId");
    expect(src).not.toContain('"nft_land"');
  });
});
