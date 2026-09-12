"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import {
  apiListMail,
  apiListMarket,
  apiListPlayers,
  apiListTrades,
} from "@/lib/api";

export interface TradeRow {
  id: string;
  fromUsername: string;
  toUsername: string;
  direction: "incoming" | "outgoing";
  give: Array<{ itemId: string; qty: number }>;
  want: Array<{ itemId: string; qty: number }>;
  giveCoins: number;
  wantCoins: number;
}

export interface MarketListingRow {
  id: string;
  sellerUsername: string;
  itemId: string;
  qty: number;
  priceCoins: number;
  mine: boolean;
}

export interface MailRow {
  id: string;
  fromUsername: string;
  toUsername: string;
  subject: string;
  items: Array<{ itemId: string; qty: number }>;
  coins: number;
  status: string;
  createdAt: number;
  direction: "inbox" | "sent";
}

export interface UseEconomyPanelsResult {
  trades: TradeRow[];
  setTrades: Dispatch<SetStateAction<TradeRow[]>>;
  players: Array<{ username: string }>;
  setPlayers: Dispatch<SetStateAction<Array<{ username: string }>>>;
  listings: MarketListingRow[];
  setListings: Dispatch<SetStateAction<MarketListingRow[]>>;
  mail: MailRow[];
  setMail: Dispatch<SetStateAction<MailRow[]>>;
  refreshPlayers: (authToken: string) => Promise<void>;
  refreshMarket: (authToken: string) => Promise<void>;
  refreshMail: (authToken: string) => Promise<void>;
  refreshTrades: (authToken: string) => Promise<void>;
}

/**
 * Market / trade / mail / player-list state + refresh helpers (RF7.3).
 *
 * @returns Economy panel data and refreshers for GameApp wiring.
 */
export function useEconomyPanels(): UseEconomyPanelsResult {
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [players, setPlayers] = useState<Array<{ username: string }>>([]);
  const [listings, setListings] = useState<MarketListingRow[]>([]);
  const [mail, setMail] = useState<MailRow[]>([]);

  const refreshPlayers = useCallback(async (authToken: string) => {
    const res = await apiListPlayers(authToken);
    if (res.ok && res.players) setPlayers(res.players);
  }, []);

  const refreshMarket = useCallback(async (authToken: string) => {
    const res = await apiListMarket(authToken);
    if (res.ok && res.listings) setListings(res.listings);
  }, []);

  const refreshMail = useCallback(async (authToken: string) => {
    const res = await apiListMail(authToken);
    if (res.ok && res.mail) setMail(res.mail);
  }, []);

  const refreshTrades = useCallback(async (authToken: string) => {
    const res = await apiListTrades(authToken);
    if (res.ok && res.trades) setTrades(res.trades as TradeRow[]);
  }, []);

  return {
    trades,
    setTrades,
    players,
    setPlayers,
    listings,
    setListings,
    mail,
    setMail,
    refreshPlayers,
    refreshMarket,
    refreshMail,
    refreshTrades,
  };
}
