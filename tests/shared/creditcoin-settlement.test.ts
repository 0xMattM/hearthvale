import { describe, expect, it } from "vitest";
import {
  bytes32MatchesUtf8,
  isAttachableMarketplaceListing,
  isPaidMarketplaceBuy,
  landFromChainIndexes,
  sameEthAddress,
  utf8ToBytes32,
} from "@game/shared";

const seller = "0x1111111111111111111111111111111111111111";
const buyer = "0x2222222222222222222222222222222222222222";
const other = "0x3333333333333333333333333333333333333333";
const gameId = "abc123xyz";

describe("creditcoin settlement helpers", () => {
  it("accepts a paid buy from the linked wallet (happy)", () => {
    expect(
      isPaidMarketplaceBuy({
        listing: {
          seller,
          gameListingId: utf8ToBytes32(gameId),
          active: false,
        },
        soldBuyer: buyer,
        expectedGameListingId: gameId,
        buyerWallet: buyer,
      }),
    ).toBe(true);
  });

  it("rejects a cancelled listing with no ItemSold (edge)", () => {
    expect(
      isPaidMarketplaceBuy({
        listing: {
          seller,
          gameListingId: utf8ToBytes32(gameId),
          active: false,
        },
        soldBuyer: null,
        expectedGameListingId: gameId,
        buyerWallet: buyer,
      }),
    ).toBe(false);
  });

  it("rejects a front-run buyer and a mismatched game id (failure)", () => {
    expect(
      isPaidMarketplaceBuy({
        listing: {
          seller,
          gameListingId: utf8ToBytes32(gameId),
          active: false,
        },
        soldBuyer: other,
        expectedGameListingId: gameId,
        buyerWallet: buyer,
      }),
    ).toBe(false);
    expect(
      isPaidMarketplaceBuy({
        listing: {
          seller,
          gameListingId: utf8ToBytes32("other-id"),
          active: false,
        },
        soldBuyer: buyer,
        expectedGameListingId: gameId,
        buyerWallet: buyer,
      }),
    ).toBe(false);
    expect(sameEthAddress(buyer, buyer.toUpperCase())).toBe(true);
    expect(bytes32MatchesUtf8(utf8ToBytes32(gameId), gameId)).toBe(true);
  });

  it("only attaches an active listing owned by the seller (happy)", () => {
    expect(
      isAttachableMarketplaceListing({
        listing: {
          seller,
          gameListingId: utf8ToBytes32(gameId),
          active: true,
        },
        expectedGameListingId: gameId,
        sellerWallet: seller,
      }),
    ).toBe(true);
  });

  it("refuses attach of someone else's or inactive listing (failure)", () => {
    expect(
      isAttachableMarketplaceListing({
        listing: {
          seller: other,
          gameListingId: utf8ToBytes32(gameId),
          active: true,
        },
        expectedGameListingId: gameId,
        sellerWallet: seller,
      }),
    ).toBe(false);
    expect(
      isAttachableMarketplaceListing({
        listing: {
          seller,
          gameListingId: utf8ToBytes32(gameId),
          active: false,
        },
        expectedGameListingId: gameId,
        sellerWallet: seller,
      }),
    ).toBe(false);
    expect(landFromChainIndexes(0, 1)).toEqual({
      biome: "forest",
      size: "medium",
    });
    expect(landFromChainIndexes(9, 0)).toBeNull();
  });
});
