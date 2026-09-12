import { describe, expect, it } from "vitest";
import {
  CREDITCOIN_TESTNET,
  ITEM_LISTED_TOPIC,
  REALM_TOKEN,
  erc721TransferTokenId,
  evmChainIdHex,
  formatRealmAmount,
  isEvmAddress,
  isValidCoinSwapAmount,
  isValidTokenListPrice,
  itemListedListingId,
  mergeLandNfts,
  normalizeEvmAddress,
  realmToWei,
  realmWeiForCoins,
  realmWeiToWhole,
  walletLinkMessage,
} from "../../packages/shared/src/creditcoin";
import {
  CREDITCOIN_SELECTORS,
  decodeUint256,
  encodeMintLand,
  encodeUint256,
  utf8ToBytes32,
} from "../../packages/shared/src/creditcoin-calldata";

describe("Creditcoin Realm helpers", () => {
  it("converts coins to REALM wei at the locked rate (happy)", () => {
    expect(CREDITCOIN_TESTNET.chainId).toBe(102031);
    expect(CREDITCOIN_TESTNET.chainIdHex).toBe("0x18e8f");
    expect(CREDITCOIN_TESTNET.chainIdHex).toBe(evmChainIdHex(102031));
    expect(parseInt(CREDITCOIN_TESTNET.chainIdHex, 16)).toBe(102031);
    expect(parseInt("0x18e6f", 16)).toBe(101999);
    expect(CREDITCOIN_TESTNET.nativeCurrency.symbol).toBe("tCTC");
    expect(realmWeiForCoins(10)).toBe(realmToWei(1));
    expect(realmWeiForCoins(40)).toBe(realmToWei(4));
    expect(formatRealmAmount(realmToWei(5))).toBe("5");
    expect(realmWeiToWhole(realmToWei(5))).toBe(5);
    expect(isValidCoinSwapAmount(10)).toBe(true);
  });

  it("rejects odd coin amounts and bad prices (edge)", () => {
    expect(() => evmChainIdHex(0)).toThrow(/positive integer/);
    expect(() => evmChainIdHex(-1)).toThrow(/positive integer/);
    expect(isValidCoinSwapAmount(5)).toBe(false);
    expect(isValidCoinSwapAmount(9)).toBe(false);
    expect(isValidCoinSwapAmount(0)).toBe(false);
    expect(isValidTokenListPrice(0)).toBe(false);
    expect(isValidTokenListPrice(1)).toBe(true);
    expect(normalizeEvmAddress("0xABCDEF0000000000000000000000000000000001")).toBe(
      "0xabcdef0000000000000000000000000000000001",
    );
  });

  it("rejects invalid addresses and empty swap (failure)", () => {
    expect(isEvmAddress("0xstubdeadbeef")).toBe(false);
    expect(isEvmAddress("not-an-address")).toBe(false);
    expect(realmWeiForCoins(-10)).toBe("0");
    expect(realmWeiToWhole("nope")).toBe(0);
    expect(walletLinkMessage({
      username: "ada",
      userId: "u1",
      chainId: REALM_TOKEN.decimals,
      nonce: "n1",
      issuedAt: "t",
    })).toContain("Creditcoin Realm link");
    expect(walletLinkMessage({
      username: "ada",
      userId: "u1",
      chainId: 102031,
      nonce: "n1",
      issuedAt: "t",
    })).toContain("combat power");
  });
});

describe("Creditcoin calldata", () => {
  it("encodes mintLand biome/size words (happy)", () => {
    const data = encodeMintLand(0, 2);
    expect(data.startsWith(CREDITCOIN_SELECTORS.mintLand)).toBe(true);
    expect(data).toHaveLength(2 + 8 + 64 + 64);
    expect(data.endsWith("02")).toBe(true);
  });

  it("encodes utf8 listing ids into bytes32 (edge)", () => {
    const id = utf8ToBytes32("wheat");
    expect(id).toBe(
      "0x7768656174000000000000000000000000000000000000000000000000000000",
    );
    expect(utf8ToBytes32("a").length).toBe(66);
  });

  it("rejects a negative uint256 (failure)", () => {
    expect(() => encodeUint256(-1)).toThrow(/negative/);
    expect(decodeUint256("0x")).toBe(0n);
    expect(decodeUint256("0x0a")).toBe(10n);
  });
});

describe("Creditcoin land NFT merge", () => {
  it("keeps local lands when on-chain is empty (happy)", () => {
    const local = [{ tokenId: "1", biome: "forest", size: "small", landId: "h1" }];
    expect(mergeLandNfts([], local)).toEqual(local);
  });

  it("lets on-chain overwrite the same token (edge)", () => {
    const merged = mergeLandNfts(
      [{ tokenId: "1", biome: "mountain", size: "medium" }],
      [{ tokenId: "1", biome: "forest", size: "small", landId: "h1" }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.biome).toBe("mountain");
    expect(merged[0]?.landId).toBe("h1");
  });

  it("ignores rows without a token id (failure)", () => {
    expect(mergeLandNfts([{ tokenId: "", biome: "forest", size: "small" }], [])).toEqual(
      [],
    );
    expect(erc721TransferTokenId({ logs: [] })).toBeNull();
    expect(
      erc721TransferTokenId({
        logs: [
          {
            topics: [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0000000000000000000000001111111111111111111111111111111111111111",
              "0x0000000000000000000000000000000000000000000000000000000000000007",
            ],
          },
        ],
      }),
    ).toBe("7");
  });
});

describe("ItemListed receipt listing id", () => {
  it("reads the indexed listing id from ItemListed (happy)", () => {
    expect(
      itemListedListingId({
        logs: [
          {
            topics: [
              ITEM_LISTED_TOPIC,
              "0x0000000000000000000000000000000000000000000000000000000000000002",
              "0x000000000000000000000000f078552a99f3d163bc38295c81be36fa20b03866",
            ],
          },
        ],
      }),
    ).toBe("2");
  });

  it("skips empty receipts and unrelated logs (edge)", () => {
    expect(itemListedListingId({ logs: [] })).toBeNull();
    expect(
      itemListedListingId({
        logs: [
          {
            topics: [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000000001",
            ],
          },
        ],
      }),
    ).toBeNull();
  });

  it("ignores a zero listing id (failure)", () => {
    expect(
      itemListedListingId({
        logs: [
          {
            topics: [
              ITEM_LISTED_TOPIC,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ],
          },
        ],
      }),
    ).toBeNull();
  });
});
