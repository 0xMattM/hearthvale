import type {
  CoinSwapDto,
  EdibleItemId,
  ItemId,
  MarketItemAnalytics,
  PlayerStateDto,
} from "@game/shared";
import { notifyAuthExpired } from "./auth-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export interface WorldPos {
  x: number;
  z: number;
}

/** Shared shape for authenticated action JSON (ok / player state / error). */
export type AuthActionResult<TExtra extends object = object> = {
  ok: boolean;
  state?: PlayerStateDto;
  error?: string;
  unauthorized?: boolean;
} & TExtra;

const NETWORK_ERROR = "Could not reach the server.";

/**
 * Maps HTTP status + parsed body to a game action result (SEC-7).
 *
 * Args:
 *   status: Fetch response status.
 *   body: Parsed JSON, or a non-object fallback.
 *
 * Returns:
 *   Normalized ok/error payload. 401 sets `unauthorized`.
 */
export function interpretAuthResponse<TExtra extends object = object>(
  status: number,
  body: unknown,
): AuthActionResult<TExtra> {
  const record =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};
  const error = typeof record.error === "string" ? record.error : undefined;
  if (status === 401) {
    return {
      ...(record as TExtra),
      ok: false,
      error: error ?? "You need to log in again.",
      unauthorized: true,
    };
  }
  if (status < 200 || status >= 300) {
    return {
      ...(record as TExtra),
      ok: false,
      error: error ?? `HTTP ${status}`,
    };
  }
  return record as AuthActionResult<TExtra>;
}

async function readResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { ok: false, error: `HTTP ${res.status}` };
  }
}

/**
 * Authenticated JSON fetch against the game API.
 *
 * @param token - Session bearer token.
 * @param path - API path beginning with `/`.
 * @param init - Optional fetch init (method/body).
 * @returns Parsed JSON with ok/state/error plus typed extra fields.
 */
async function authJson<TExtra extends object = object>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<AuthActionResult<TExtra>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    const body = await readResponseBody(res);
    const parsed = interpretAuthResponse<TExtra>(res.status, body);
    if (parsed.unauthorized) notifyAuthExpired();
    return parsed;
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
}

async function publicJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    const body = await readResponseBody(res);
    return interpretAuthResponse(res.status, body) as T | { ok: false; error: string };
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
}

export async function apiRegister(username: string, password: string) {
  return publicJson<{ ok: boolean; token?: string; error?: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
  );
}

export async function apiLogin(username: string, password: string) {
  return publicJson<{ ok: boolean; token?: string; error?: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
  );
}

/**
 * Revokes the current server session (RF1.2). Safe to call even if already expired.
 */
export async function apiLogout(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const body = await readResponseBody(res);
    return interpretAuthResponse(res.status, body) as {
      ok: boolean;
      error?: string;
    };
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
}

export function apiMe(token: string) {
  return authJson(token, "/api/me");
}

export function apiPlant(
  token: string,
  buildingId: string,
  pos: WorldPos,
  seedItemId: ItemId = "wheat_seed",
) {
  return authJson(token, `/api/buildings/${buildingId}/plant`, {
    method: "POST",
    body: JSON.stringify({ seedItemId, ...pos }),
  });
}

export function apiHarvest(token: string, buildingId: string, pos: WorldPos) {
  return authJson(token, `/api/buildings/${buildingId}/harvest`, {
    method: "POST",
    body: JSON.stringify(pos),
  });
}

export function apiGatherOre(
  token: string,
  buildingId: string,
  pos: WorldPos,
  care?: "feed" | "clean",
) {
  return authJson(token, `/api/buildings/${buildingId}/gather`, {
    method: "POST",
    body: JSON.stringify(care ? { ...pos, care } : pos),
  });
}

export function apiClaimNode(token: string, buildingId: string, pos: WorldPos) {
  return authJson(token, `/api/buildings/${buildingId}/claim`, {
    method: "POST",
    body: JSON.stringify(pos),
  }) as Promise<{
    ok: boolean;
    state?: PlayerStateDto;
    error?: string;
    claimed?: boolean;
    collected?: number;
    contestStarted?: boolean;
    contestEndsAt?: number;
    delivered?: number;
    score?: number;
  }>;
}

export function apiCombatStart(
  token: string,
  buildingId: string,
  pos: WorldPos,
) {
  return authJson(token, `/api/buildings/${buildingId}/combat/start`, {
    method: "POST",
    body: JSON.stringify(pos),
  }) as Promise<{
    ok: boolean;
    state?: PlayerStateDto;
    error?: string;
    combat?: PlayerStateDto["combat"];
  }>;
}

export function apiCombatAct(
  token: string,
  action: "attack" | "block",
  pos: WorldPos,
) {
  return authJson(token, "/api/combat/act", {
    method: "POST",
    body: JSON.stringify({ action, ...pos }),
  }) as Promise<{
    ok: boolean;
    state?: PlayerStateDto;
    error?: string;
    combat?: PlayerStateDto["combat"];
    encounter?: {
      won: boolean;
      foeName: string;
      rounds: number;
      leather: number;
      meat: number;
      tusks?: number;
      toolBonus?: number;
      downed?: boolean;
      energyLost?: number;
    };
  }>;
}

export function apiCombatTick(token: string, pos: WorldPos) {
  return authJson(token, "/api/combat/tick", {
    method: "POST",
    body: JSON.stringify(pos),
  }) as Promise<{
    ok: boolean;
    state?: PlayerStateDto;
    error?: string;
    combat?: PlayerStateDto["combat"];
    encounter?: {
      won: boolean;
      foeName: string;
      rounds: number;
      leather: number;
      meat: number;
      tusks?: number;
      toolBonus?: number;
      downed?: boolean;
      energyLost?: number;
    };
  }>;
}

export function apiEquipGear(
  token: string,
  inventoryId: string | null,
  slot?: "weapon" | "armor" | "shield",
) {
  return authJson(token, "/api/equip-gear", {
    method: "POST",
    body: JSON.stringify({ inventoryId, slot }),
  });
}

export function apiCraft(token: string, recipeId: string, pos: WorldPos) {
  return authJson(token, "/api/craft", {
    method: "POST",
    body: JSON.stringify({ recipeId, ...pos }),
  });
}

/**
 * Collects a finished craft job at a process station.
 */
export function apiCollectCraft(
  token: string,
  buildingId: string,
  pos: WorldPos,
) {
  return authJson(token, "/api/craft/collect", {
    method: "POST",
    body: JSON.stringify({ buildingId, ...pos }),
  });
}

export function apiEatFood(token: string, itemId: EdibleItemId) {
  return authJson(token, "/api/eat", {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });
}

export function apiVendorSell(
  token: string,
  itemId: ItemId,
  qty: number,
  pos: WorldPos,
) {
  return authJson(token, "/api/vendor/sell", {
    method: "POST",
    body: JSON.stringify({ itemId, qty, ...pos }),
  });
}

export function apiVendorBuy(
  token: string,
  itemId: ItemId,
  qty: number,
  pos: WorldPos,
) {
  return authJson(token, "/api/vendor/buy", {
    method: "POST",
    body: JSON.stringify({ itemId, qty, ...pos }),
  });
}

export function apiEquipTool(token: string, inventoryId: string | null) {
  return authJson(token, "/api/equip-tool", {
    method: "POST",
    body: JSON.stringify({ inventoryId }),
  });
}

export function apiRepairTool(token: string, inventoryId: string) {
  return authJson(token, "/api/repair-tool", {
    method: "POST",
    body: JSON.stringify({ inventoryId }),
  });
}

export async function apiListTrades(token: string) {
  const res = await fetch(`${API_URL}/api/trades`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    trades?: Array<{
      id: string;
      fromUsername: string;
      toUsername: string;
      direction: "incoming" | "outgoing";
      give: Array<{ itemId: string; qty: number; durability?: number | null }>;
      want: Array<{ itemId: string; qty: number; durability?: number | null }>;
      giveCoins: number;
      wantCoins: number;
    }>;
    error?: string;
  }>;
}

export async function apiCreateTrade(
  token: string,
  body: {
    toUsername: string;
    give: Array<{ itemId: ItemId; qty: number }>;
    want: Array<{ itemId: ItemId; qty: number }>;
    giveCoins: number;
    wantCoins: number;
  },
) {
  const res = await fetch(`${API_URL}/api/trades`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function apiAcceptTrade(token: string, tradeId: string) {
  return authJson(token, `/api/trades/${tradeId}/accept`, { method: "POST" });
}

export async function apiRejectTrade(token: string, tradeId: string) {
  const res = await fetch(`${API_URL}/api/trades/${tradeId}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export function apiExpandLand(token: string, pos: WorldPos) {
  return authJson(token, "/api/land/expand", {
    method: "POST",
    body: JSON.stringify(pos),
  });
}

/**
 * Places a station kit from inventory onto a homestead grid cell.
 */
export function apiPlaceStationKit(
  token: string,
  inventoryId: string,
  gridX: number,
  gridZ: number,
) {
  return authJson(token, "/api/land/place-kit", {
    method: "POST",
    body: JSON.stringify({ inventoryId, x: gridX, z: gridZ }),
  });
}

/**
 * Picks up a placed station at the build board into inventory as a kit.
 */
export function apiPickupStation(
  token: string,
  buildingId: string,
  pos: WorldPos,
) {
  return authJson(token, "/api/land/pickup", {
    method: "POST",
    body: JSON.stringify({ buildingId, ...pos }),
  });
}

/**
 * Travels to another owned land kind (starter / forest).
 */
export function apiTravel(token: string, kind: string, landId?: string) {
  return authJson(token, "/api/travel", {
    method: "POST",
    body: JSON.stringify(landId ? { landId } : { kind }),
  });
}

/**
 * Upgrades mill/forge T1→T2 while standing at the building.
 */
export function apiUpgradeBuilding(
  token: string,
  buildingId: string,
  pos: WorldPos,
) {
  return authJson(token, `/api/buildings/${buildingId}/upgrade`, {
    method: "POST",
    body: JSON.stringify(pos),
  });
}

/**
 * Places cosmetic housing decor on an empty pad.
 */
export function apiPlaceDecor(
  token: string,
  buildingId: string,
  decorId: string,
  pos: WorldPos,
) {
  return authJson(token, `/api/buildings/${buildingId}/decor`, {
    method: "POST",
    body: JSON.stringify({ ...pos, decorId }),
  });
}

export async function apiListPlayers(token: string) {
  const res = await fetch(`${API_URL}/api/players`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    players?: Array<{ username: string }>;
    error?: string;
  }>;
}

export async function apiVisitLand(token: string, username: string) {
  const res = await fetch(`${API_URL}/api/lands/${encodeURIComponent(username)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function apiListMarket(token: string) {
  const res = await fetch(`${API_URL}/api/market`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function apiGetMarketAnalytics(token: string, itemId: ItemId) {
  const res = await fetch(
    `${API_URL}/api/market/analytics?itemId=${encodeURIComponent(itemId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.json() as Promise<{
    ok: boolean;
    analytics?: MarketItemAnalytics;
    error?: string;
  }>;
}

export async function apiCreateMarketListing(
  token: string,
  itemId: ItemId,
  qty: number,
  priceCoins: number,
) {
  const res = await fetch(`${API_URL}/api/market`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itemId, qty, priceCoins }),
  });
  return res.json();
}

export function apiBuyMarketListing(token: string, listingId: string) {
  return authJson(token, `/api/market/${listingId}/buy`, { method: "POST" });
}

export async function apiCancelMarketListing(token: string, listingId: string) {
  const res = await fetch(`${API_URL}/api/market/${listingId}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function apiListChat(token: string) {
  const res = await fetch(`${API_URL}/api/chat`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    messages?: Array<{ id: string; username: string; text: string; t: number }>;
  }>;
}

export async function apiPostChat(token: string, text: string) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function apiListGuildChat(token: string) {
  const res = await fetch(`${API_URL}/api/guilds/chat`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    messages?: Array<{ id: string; username: string; text: string; t: number }>;
    error?: string;
  }>;
}

export async function apiListQuests(token: string) {
  const res = await fetch(`${API_URL}/api/quests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    quests?: Array<{
      id: string;
      title: string;
      blurb: string;
      status: string;
      rewardCoins: number;
      rewardCharacterXp: number;
      claimAtNpc?: string;
    }>;
  }>;
}

export function apiClaimQuest(token: string, questId: string) {
  return authJson(token, `/api/quests/${questId}/claim`, { method: "POST" }) as Promise<{
    ok: boolean;
    state?: PlayerStateDto;
    error?: string;
    quests?: Array<{
      id: string;
      title: string;
      blurb: string;
      status: string;
      rewardCoins: number;
      rewardCharacterXp: number;
    }>;
    rewardCoins?: number;
    rewardCharacterXp?: number;
  }>;
}

export interface TutorialNpcView {
  id: string;
  name: string;
  alias?: string;
  basics: string;
  toolsNeeded: string;
  buildingsNeeded: string;
  seededOnCity: boolean;
  quest: {
    id: string;
    title: string;
    blurb: string;
    status: string;
    rewardCoins: number;
    rewardCharacterXp: number;
  };
}

export async function apiGetTutorialNpc(
  token: string,
  professionId: string,
) {
  const res = await fetch(`${API_URL}/api/tutorial-npcs/${professionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    npc?: TutorialNpcView;
    error?: string;
  }>;
}

/** Lists seeded city tutors with quest status (PL30.3 world accent). */
export async function apiListTutorialNpcs(token: string) {
  const res = await fetch(`${API_URL}/api/tutorial-npcs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    npcs?: TutorialNpcView[];
    error?: string;
  }>;
}

export function apiClaimTutorialNpc(
  token: string,
  professionId: string,
) {
  return authJson(token, `/api/tutorial-npcs/${professionId}/claim`, {
    method: "POST",
  }) as Promise<{
    ok: boolean;
    state?: PlayerStateDto;
    error?: string;
    npc?: TutorialNpcView;
    rewardCoins?: number;
    rewardCharacterXp?: number;
  }>;
}

export async function apiListAchievements(token: string) {
  const res = await fetch(`${API_URL}/api/achievements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    achievements?: Array<{
      id: string;
      title: string;
      blurb: string;
      counter: number;
      target: number;
      unlocked: boolean;
      unlockedAt: number | null;
    }>;
  }>;
}

export async function apiListMail(token: string) {
  const res = await fetch(`${API_URL}/api/mail`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    mail?: Array<{
      id: string;
      fromUsername: string;
      toUsername: string;
      subject: string;
      items: Array<{ itemId: string; qty: number }>;
      coins: number;
      status: string;
      createdAt: number;
      direction: "inbox" | "sent";
    }>;
  }>;
}

export function apiSendMail(
  token: string,
  body: {
    toUsername: string;
    items: Array<{ itemId: string; qty: number }>;
    coins: number;
    subject?: string;
  },
) {
  return authJson(token, "/api/mail", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiClaimMail(token: string, mailId: string) {
  return authJson(token, `/api/mail/${mailId}/claim`, { method: "POST" });
}

export function apiCancelMail(token: string, mailId: string) {
  return authJson(token, `/api/mail/${mailId}/cancel`, { method: "POST" });
}

export function apiDisconnectWallet(token: string) {
  return authJson(token, "/api/wallet/disconnect", { method: "POST" });
}

export async function apiWalletChallenge(token: string) {
  const res = await fetch(`${API_URL}/api/wallet/challenge`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    message?: string;
    nonce?: string;
    issuedAt?: string;
    chainId?: number;
    error?: string;
  }>;
}

export function apiLinkWallet(
  token: string,
  body: { address: string; signature: string; message: string },
) {
  return authJson(token, "/api/wallet/link", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiCreditcoinConfig() {
  const res = await fetch(`${API_URL}/chain/creditcoin`);
  return res.json() as Promise<{
    ok: boolean;
    chainId?: number;
    chainIdHex?: string;
    name?: string;
    rpcUrls?: string[];
    blockExplorerUrls?: string[];
    nativeCurrency?: { name: string; symbol: string; decimals: number };
    realmToken?: string | null;
    landNft?: string | null;
    marketplace?: string | null;
    contractsConfigured?: boolean;
    mode?: "local_dev" | "attestcoin";
  }>;
}

/**
 * Burns in-game coins for REALM via POST /api/creditcoin/swap.
 *
 * @param token - Session bearer token.
 * @param coins - Soft-currency amount to swap (multiples of 10).
 * @returns Action result including optional `swap` status for HUD copy.
 */
export function apiCreditcoinSwap(token: string, coins: number) {
  return authJson<{ swap?: CoinSwapDto }>(token, "/api/creditcoin/swap", {
    method: "POST",
    body: JSON.stringify({ coins }),
  });
}

export function apiCreditcoinSnapshot(token: string) {
  return authJson(token, "/api/creditcoin/snapshot");
}

export function apiCreditcoinAttachOnchain(
  token: string,
  listingId: string,
  onchainListingId: string,
) {
  return authJson(token, `/api/creditcoin/market/${listingId}/onchain`, {
    method: "POST",
    body: JSON.stringify({ onchainListingId }),
  });
}

export function apiCreditcoinMintLand(
  token: string,
  biome: string,
  size: string,
) {
  return authJson(token, "/api/creditcoin/lands/mint", {
    method: "POST",
    body: JSON.stringify({ biome, size }),
  });
}

/**
 * Persists an on-chain LandNFT so the B panel and homestead survive RPC gaps.
 */
export function apiCreditcoinConfirmLand(
  token: string,
  input: { biome: string; size: string; tokenId?: string | null; txHash?: string },
) {
  return authJson<{ land?: { tokenId: string; biome: string; size: string; landId?: string | null } }>(
    token,
    "/api/creditcoin/lands/confirm",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

/**
 * Provisions the NFT homestead if needed, then travels there.
 */
export async function apiCreditcoinEnterLand(
  token: string,
  land: { tokenId: string; biome: string; size: string; landId?: string | null },
) {
  const confirmed = await apiCreditcoinConfirmLand(token, {
    biome: String(land.biome),
    size: String(land.size),
    tokenId: land.tokenId,
  });
  const landId = confirmed.land?.landId ?? land.landId ?? land.tokenId;
  const travel = await apiTravel(token, "player_land", landId);
  if (travel.ok) return travel;
  if (confirmed.ok && confirmed.state) return { ...travel, state: confirmed.state };
  return travel;
}

export function apiCreditcoinListItem(
  token: string,
  itemId: string,
  qty: number,
  priceRealm: number,
) {
  return authJson(token, "/api/creditcoin/market", {
    method: "POST",
    body: JSON.stringify({ itemId, qty, priceRealm }),
  }) as Promise<{
    ok: boolean;
    listing?: {
      id: string;
      itemId: string;
      qty: number;
      priceRealm: string;
      onchainListingId: string | null;
      status: string;
    };
    state?: PlayerStateDto;
    error?: string;
  }>;
}

export function apiCreditcoinBuyItem(token: string, listingId: string) {
  return authJson(token, `/api/creditcoin/market/${listingId}/buy`, {
    method: "POST",
  });
}

export function apiCreditcoinCancelItem(token: string, listingId: string) {
  return authJson(token, `/api/creditcoin/market/${listingId}/cancel`, {
    method: "POST",
  });
}

export function apiClaimLandDeed(token: string) {
  return authJson(token, "/api/deeds/claim", { method: "POST" });
}

export async function apiListDeedMarket(token: string) {
  const res = await fetch(`${API_URL}/api/deeds/market`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    listings?: Array<{
      id: string;
      title: string;
      landId: string;
      landKind: string;
      createdAt: number;
      status: string;
      listPriceCoins: number | null;
      mintTxStub: string | null;
      sellerUsername?: string;
    }>;
  }>;
}

/** Public F15.4 mirror — no auth required. */
export async function apiChainMarketplace() {
  const res = await fetch(`${API_URL}/chain/marketplace`);
  return res.json() as Promise<{
    ok: boolean;
    network?: string;
    disclaimer?: string;
    readOnly?: boolean;
    listings?: Array<{
      id: string;
      title: string;
      seller: string;
      landKind: string;
      softPriceCoins: number;
      chainPriceWei: string;
      mintTxStub: string | null;
      source: "live_listing" | "catalog_floor";
    }>;
  }>;
}

export async function apiPostGuildChat(token: string, text: string) {
  const res = await fetch(`${API_URL}/api/guilds/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  return res.json() as Promise<{
    ok: boolean;
    messages?: Array<{ id: string; username: string; text: string; t: number }>;
    error?: string;
  }>;
}

export async function apiListGuilds(token: string) {
  const res = await fetch(`${API_URL}/api/guilds`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    guilds?: Array<{ name: string; members: number }>;
  }>;
}

export function apiCreateGuild(token: string, name: string) {
  return authJson(token, "/api/guilds", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function apiJoinGuild(token: string, code: string) {
  return authJson(token, "/api/guilds/join", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function apiLeaveGuild(token: string) {
  return authJson(token, "/api/guilds/leave", { method: "POST" });
}

export async function apiListGuildMembers(token: string) {
  const res = await fetch(`${API_URL}/api/guilds/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    members?: Array<{ username: string; rank: string }>;
  }>;
}

export function apiRegenerateGuildInvite(token: string) {
  return authJson(token, "/api/guilds/invite/regenerate", { method: "POST" });
}

/**
 * Soft-offer the current invite code to a nearby player (PL189.2).
 * Join-by-code / rank rules unchanged.
 */
export function apiOfferGuildInvite(token: string, toUsername: string) {
  return authJson(token, "/api/guilds/invite/offer", {
    method: "POST",
    body: JSON.stringify({ toUsername }),
  });
}

export function apiSetGuildRank(
  token: string,
  username: string,
  rank: "officer" | "member",
) {
  return authJson(token, "/api/guilds/rank", {
    method: "POST",
    body: JSON.stringify({ username, rank }),
  });
}

export async function apiListGuildBank(token: string) {
  const res = await fetch(`${API_URL}/api/guilds/bank`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<{
    ok: boolean;
    bank?: Array<{ itemId: string; qty: number }>;
  }>;
}

export function apiDepositGuildBank(
  token: string,
  itemId: string,
  qty: number,
) {
  return authJson(token, "/api/guilds/bank/deposit", {
    method: "POST",
    body: JSON.stringify({ itemId, qty }),
  });
}

export function apiWithdrawGuildBank(
  token: string,
  itemId: string,
  qty: number,
) {
  return authJson(token, "/api/guilds/bank/withdraw", {
    method: "POST",
    body: JSON.stringify({ itemId, qty }),
  });
}

export async function apiReportPresence(
  token: string,
  body: { landId: string; x: number; z: number },
) {
  try {
    const res = await fetch(`${API_URL}/api/presence`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return (await res.json()) as {
      ok: boolean;
      others?: Array<{
        username: string;
        x: number;
        z: number;
        updatedAt: number;
      }>;
      error?: string;
    };
  } catch {
    // Reason: WS-primary presence; HTTP fallback must not throw into React when offline.
    return { ok: false as const, error: "Failed to fetch" };
  }
}
