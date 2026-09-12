import { describe, expect, it } from "vitest";
import { isAlreadyProcessedRevert } from "../../apps/server/src/game/creditcoin/attest-errors.ts";

describe("isAlreadyProcessedRevert", () => {
  it("matches the ASC replay revert (happy)", () => {
    expect(isAlreadyProcessedRevert(new Error("Query already processed"))).toBe(
      true,
    );
  });

  it("matches nested ethers reason/shortMessage (edge)", () => {
    expect(
      isAlreadyProcessedRevert({
        shortMessage: "execution reverted",
        reason: "Query already processed",
      }),
    ).toBe(true);
  });

  it("ignores other reverts (failure)", () => {
    expect(isAlreadyProcessedRevert(new Error("Proof of inclusion verification failed"))).toBe(
      false,
    );
    expect(isAlreadyProcessedRevert(null)).toBe(false);
  });
});
