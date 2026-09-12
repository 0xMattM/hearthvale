import path from "node:path";
import { describe, expect, it } from "vitest";
import { uscContractsRemapBase } from "../../apps/server/scripts/usc-contracts-remap.ts";

describe("uscContractsRemapBase", () => {
  it("maps official package layout to contracts/ (happy)", () => {
    const decoder = path.join(
      "node_modules",
      "@gluwa",
      "usc-contracts",
      "contracts",
      "decoding",
      "EvmV1Decoder.sol",
    );
    const base = uscContractsRemapBase(decoder);
    expect(base.replace(/\\/g, "/")).toMatch(/\/contracts$/);
    expect(base.includes("decoding")).toBe(false);
  });

  it("maps a flat decoding/ layout to the package root (edge)", () => {
    const decoder = path.join(
      "node_modules",
      "@gluwa",
      "usc-contracts",
      "decoding",
      "EvmV1Decoder.sol",
    );
    const base = uscContractsRemapBase(decoder);
    expect(base.replace(/\\/g, "/")).toMatch(/\/usc-contracts$/);
  });

  it("rejects a decoder path that is not under decoding/ (failure)", () => {
    expect(() =>
      uscContractsRemapBase(path.join("contracts", "EvmV1Decoder.sol")),
    ).toThrow(/decoding/);
  });
});
