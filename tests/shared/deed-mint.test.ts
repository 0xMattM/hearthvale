import { describe, expect, it } from "vitest";
import {
  LAND_DEED,
  isValidDeedListPrice,
  stubMintTx,
} from "../../packages/shared/src/land-deed";

describe("deed mint/list helpers F15.3", () => {
  it("builds a stable mock mint tx (happy)", () => {
    const a = stubMintTx("deed-1");
    const b = stubMintTx("deed-1");
    expect(a).toBe(b);
    expect(a.startsWith("0xmint")).toBe(true);
    expect(LAND_DEED.disclaimer.toLowerCase()).toContain("cosmetic");
    expect(LAND_DEED.disclaimer.toLowerCase()).toContain("never combat");
  });

  it("accepts prices in the stub range (edge)", () => {
    expect(isValidDeedListPrice(LAND_DEED.minListPrice)).toBe(true);
    expect(isValidDeedListPrice(LAND_DEED.maxListPrice)).toBe(true);
    expect(isValidDeedListPrice(LAND_DEED.defaultListPrice)).toBe(true);
  });

  it("rejects invalid list prices (failure)", () => {
    expect(isValidDeedListPrice(0)).toBe(false);
    expect(isValidDeedListPrice(9)).toBe(false);
    expect(isValidDeedListPrice(501)).toBe(false);
    expect(isValidDeedListPrice(Number.NaN)).toBe(false);
  });
});
