import {
  CHAIN_MARKET,
  LAND_DEED,
  mirrorCoinsToChainWei,
  type ChainMarketListingDto,
} from "@game/shared";
import { listDeedMarket } from "./deeds.js";

/**
 * Builds a read-only stub-chain marketplace view (F15.4).
 * Prices mirror soft-currency deed listings; never gates play.
 */
export function getChainMarketplaceView(): {
  network: string;
  disclaimer: string;
  readOnly: true;
  listings: ChainMarketListingDto[];
} {
  const live = listDeedMarket().map((row) => {
    const coins = row.listPriceCoins ?? LAND_DEED.defaultListPrice;
    return {
      id: row.id,
      title: row.title,
      seller: row.sellerUsername ?? "unknown",
      landKind: row.landKind,
      softPriceCoins: coins,
      chainPriceWei: mirrorCoinsToChainWei(coins),
      mintTxStub: row.mintTxStub,
      source: "live_listing" as const,
    };
  });

  const listings =
    live.length > 0
      ? live
      : [
          {
            id: "catalog-floor",
            title: LAND_DEED.title,
            seller: "catalog",
            landKind: LAND_DEED.landKind,
            softPriceCoins: LAND_DEED.defaultListPrice,
            chainPriceWei: mirrorCoinsToChainWei(LAND_DEED.defaultListPrice),
            mintTxStub: null,
            source: "catalog_floor" as const,
          },
        ];

  return {
    network: CHAIN_MARKET.network,
    disclaimer: CHAIN_MARKET.disclaimer,
    readOnly: true,
    listings,
  };
}
