import fs from "node:fs";
import path from "path";
import { describe, expect, it } from "vitest";

const PANEL = path.join(
  process.cwd(),
  "apps/web/components/hud/RealmMarketPanel.tsx",
);
const TXS = path.join(process.cwd(), "apps/web/lib/creditcoin-txs.ts");
const APP = path.join(process.cwd(), "apps/web/components/GameApp.tsx");

describe("REALM market escrow vs listed", () => {
  it("only enables Buy after the listing is listed on-chain (happy)", () => {
    const src = fs.readFileSync(PANEL, "utf8");
    expect(src).toContain('row.status === "listed" && row.onchainListingId');
    expect(src).toContain("Pending chain");
    expect(src).toContain("waiting for Creditcoin");
  });

  it("reads the listing id from ItemListed logs after the tx (edge)", () => {
    const src = fs.readFileSync(TXS, "utf8");
    expect(src).toContain("itemListedListingId");
    expect(src).toContain("encodeListingIdByGameId");
  });

  it("does not treat an unattached escrow as a successful list (failure)", () => {
    const src = fs.readFileSync(APP, "utf8");
    expect(src).toContain("attached.ok");
    expect(src).toContain("Could not confirm on-chain listing");
    expect(src).not.toMatch(/if \(res\.ok\) flashSuccessCue\("Listed for REALM"\)/);
  });
});
