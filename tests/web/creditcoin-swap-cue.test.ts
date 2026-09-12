import { describe, expect, it } from "vitest";
import {
  CREDITCOIN_SWAP_MINTED_CUE,
  CREDITCOIN_SWAP_NOTARIZED_CUE,
  CREDITCOIN_SWAP_PENDING_CUE,
  CREDITCOIN_SWAP_QUEUED_CUE,
  creditcoinSwapExplorerKind,
  creditcoinSwapSuccessCueText,
} from "../../apps/web/lib/hud/creditcoin-swap-cue";

/**
 * CTC-SWAP-TYPE-1 — typed swap payload + ephemeral mint/pending/queued cues.
 */
describe("Creditcoin swap success cue", () => {
  it("uses minted copy when the REALM mint already landed (happy)", () => {
    expect(creditcoinSwapSuccessCueText("minted")).toBe(
      CREDITCOIN_SWAP_MINTED_CUE,
    );
    expect(creditcoinSwapSuccessCueText("minted")).toBe("REALM minted to wallet");
    expect(
      creditcoinSwapExplorerKind({
        creditcoinTxHash: "0xdef",
        sepoliaTxHash: "0xabc",
      }),
    ).toBe("creditcoin");
  });

  it("uses pending copy while mint lags; later statuses stay queued (edge)", () => {
    expect(creditcoinSwapSuccessCueText("pending")).toBe(
      CREDITCOIN_SWAP_PENDING_CUE,
    );
    expect(creditcoinSwapSuccessCueText("notarized")).toBe(
      CREDITCOIN_SWAP_NOTARIZED_CUE,
    );
    expect(creditcoinSwapExplorerKind({
      creditcoinTxHash: null,
      sepoliaTxHash: "0xabc",
    })).toBe("sepolia");
  });

  it("falls back to queued when status is missing or failed (failure)", () => {
    expect(creditcoinSwapSuccessCueText(undefined)).toBe(
      CREDITCOIN_SWAP_QUEUED_CUE,
    );
    expect(creditcoinSwapSuccessCueText("failed")).toBe(
      CREDITCOIN_SWAP_QUEUED_CUE,
    );
    expect(creditcoinSwapSuccessCueText("failed")).not.toBe(
      CREDITCOIN_SWAP_MINTED_CUE,
    );
    expect(
      creditcoinSwapExplorerKind({
        creditcoinTxHash: null,
        sepoliaTxHash: null,
      }),
    ).toBe("queued");
  });
});
