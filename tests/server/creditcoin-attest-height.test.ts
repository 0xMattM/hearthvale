import { describe, expect, it } from "vitest";
import {
  attestedHeightUrl,
  isHeightAttested,
  parseAttestedHeight,
} from "../../apps/server/src/game/creditcoin/attest-height.ts";

describe("Attestcoin attested height helpers", () => {
  it("builds the proof-gen URL and treats latest >= target as ready (happy)", () => {
    expect(attestedHeightUrl("https://proof.example/", 1)).toBe(
      "https://proof.example/api/v1/attested-height/1",
    );
    expect(isHeightAttested(11684853, 11684853)).toBe(true);
  });

  it("strips a trailing slash and parses a numeric height (edge)", () => {
    expect(attestedHeightUrl("https://proof.example", 1)).toBe(
      "https://proof.example/api/v1/attested-height/1",
    );
    expect(parseAttestedHeight({ attestedHeight: 10 })).toBe(10);
  });

  it("rejects missing or behind heights (failure)", () => {
    expect(parseAttestedHeight(null)).toBeNull();
    expect(parseAttestedHeight({ attestedHeight: "nope" })).toBeNull();
    expect(isHeightAttested(null, 5)).toBe(false);
    expect(isHeightAttested(4, 5)).toBe(false);
  });
});
