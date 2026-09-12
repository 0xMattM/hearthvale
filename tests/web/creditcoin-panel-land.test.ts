import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PANEL = path.join(
  process.cwd(),
  "apps/web/components/hud/CreditcoinPanel.tsx",
);
const WALLET = path.join(
  process.cwd(),
  "apps/web/components/hud/CreditcoinWalletTab.tsx",
);

function deskSource(): string {
  return `${fs.readFileSync(PANEL, "utf8")}\n${fs.readFileSync(WALLET, "utf8")}`;
}

describe("Creditcoin desk land buy gate", () => {
  it("requires on-wallet REALM before Buy land (happy)", () => {
    const src = deskSource();
    expect(src).toContain("canBuyLand");
    expect(src).toContain("realmWeiToWhole");
    expect(src).toContain("Burn");
    expect(src).toContain("CREDITCOIN_TAB_LABELS");
    expect(src).toContain('role="tablist"');
  });

  it("explains the coin burn vs tCTC gas (edge)", () => {
    const src = deskSource();
    expect(src).toContain("tCTC cannot buy REALM");
    expect(src).toContain("Connect MetaMask first");
  });

  it("does not enable land buy from a linked wallet alone (failure)", () => {
    const src = deskSource();
    expect(src).toContain("disabled={busy || !canBuyLand}");
    expect(src).toContain("Need {landPrice} REALM");
    expect(src.indexOf("const linked")).toBeLessThan(src.indexOf("canBuyLand"));
    expect(src).toContain("0x18e6f");
    expect(src).toContain("Work this land");
    expect(src).toContain("onTravelLand(land)");
  });
});
