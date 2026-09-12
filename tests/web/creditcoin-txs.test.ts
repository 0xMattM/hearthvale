import { describe, expect, it } from "vitest";
import { CREDITCOIN_TESTNET } from "../../packages/shared/src/creditcoin";
import { creditcoinTxRequest } from "../../apps/web/lib/creditcoin-txs";

describe("creditcoinTxRequest", () => {
  it("pins Creditcoin chain id on every send (happy)", () => {
    const tx = creditcoinTxRequest(
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222",
      "0xdead",
      CREDITCOIN_TESTNET.chainIdHex,
    );
    expect(tx.chainId).toBe("0x18e8f");
    expect(tx.value).toBe("0x0");
    expect(tx.data).toBe("0xdead");
  });

  it("forwards a custom chain hex (edge)", () => {
    const tx = creditcoinTxRequest("0x1", "0x2", "0x00", "0x1");
    expect(tx.chainId).toBe("0x1");
    expect(tx.from).toBe("0x1");
  });

  it("never omits chainId (failure)", () => {
    const tx = creditcoinTxRequest("0xa", "0xb", "0xc", "0x18e8f");
    expect("chainId" in tx).toBe(true);
    expect(tx.chainId).not.toBe("0x18e6f");
  });
});
