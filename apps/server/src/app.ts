import { ACTION_ERROR, type EdibleItemId, type ItemId } from "@game/shared";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { resolveCorsOrigins } from "./cors.js";
import { loginUser, registerUser, revokeSession, userIdFromToken } from "./auth/auth.js";
import {
  AUTH_RATE_LIMIT,
  AUTH_RATE_WINDOW_MS,
  CHAT_RATE_LIMIT,
  CHAT_RATE_WINDOW_MS,
  consumeRateLimit,
} from "./auth/rateLimit.js";
import { parseAuthCredentials, marketListSchema, parseBody, vendorBodySchema } from "./auth/schemas.js";
import { authClientIp } from "./auth/clientIp.js";
import { z } from "zod";
import { craftRecipe, collectCraft, eatBread, eatFood } from "./game/actions/crafting.js";
import { repairTool } from "./game/actions/repair.js";
import { harvestCrop, plantCrop } from "./game/actions/farming.js";
import { gatherBuilding } from "./game/actions/gathering.js";
import { interactClaimNode } from "./game/actions/claim.js";
import { huntTrail } from "./game/actions/hunting.js";
import { actLiveCombat, startLiveCombat, tickLiveCombatSession } from "./game/actions/combat-live.js";
import { equipCombatGear } from "./game/actions/equipment.js";
import { vendorBuy, vendorSell } from "./game/actions/vendor.js";
import {
  acceptTrade,
  createTradeOffer,
  listPendingTrades,
  rejectTrade,
  type TradeLeg,
} from "./game/actions/trade.js";
import { expandLandSlot, placeHousingDecor, placeLandStation, placeStationKit, pickupLandStation, upgradeBuilding } from "./game/actions/build.js";
import { travelToLandKind } from "./game/land.js";
import { travelToOwnedLand } from "./game/creditcoin/nft-homestead.js";
import {
  buyMarketListing,
  cancelMarketListing,
  createMarketListing,
  getMarketItemAnalytics,
  listMarket,
} from "./game/actions/market.js";
import { getPlayerState } from "./game/player.js";
import { db } from "./db/client.js";
import { eq } from "drizzle-orm";
import { inventory, players, users } from "./db/schema.js";
import { telemetryHttpPayload, track } from "./telemetry.js";
import { listOtherPlayers } from "./game/directory.js";
import { getVisitLand } from "./game/visit.js";
import { listChat, postChat } from "./game/chat.js";
import { listGuildChat, postGuildChat } from "./game/guildChat.js";
import {
  createGuild,
  joinGuildByInvite,
  leaveGuild,
  listGuilds,
  listGuildMembers,
  offerGuildInviteToNearby,
  regenerateInviteCode,
  setGuildMemberRank,
} from "./game/guilds.js";
import {
  depositGuildBank,
  listGuildBank,
  withdrawGuildBank,
} from "./game/guildBank.js";
import { claimQuest, listQuests } from "./game/quests.js";
import {
  claimTutorialQuest,
  getTutorialNpcForPlayer,
  listTutorialNpcs,
} from "./game/tutorial-npcs.js";
import { listAchievements } from "./game/achievements.js";
import { cancelMail, claimMail, listMail, sendMail } from "./game/mail.js";
import {
  connectWalletStub,
  disconnectWalletStub,
  walletLinkResult,
} from "./game/wallet.js";
import {
  createWalletLinkChallenge,
  linkWalletWithSignature,
  looksLikeSignature,
} from "./game/creditcoin/wallet-link.js";
import { publicCreditcoinConfig } from "./game/creditcoin/config.js";
import { getCoinSwap, refundCoinSwap, requestCoinSwap } from "./game/creditcoin/coin-swap.js";
import { hasDirectRealmMinter } from "./game/creditcoin/onchain.js";
import { runCreditcoinWorkerTick } from "./game/creditcoin/worker.js";
import {
  attachOnchainListing,
  buyTokenItemListing,
  cancelTokenItemListing,
  createTokenItemListing,
  listTokenItemMarket,
} from "./game/creditcoin/token-market.js";
import { confirmOnchainLand, mintLocalLand } from "./game/creditcoin/local-lands.js";
import {
  getCreditcoinSnapshot,
  invalidateCreditcoinSnapshot,
} from "./game/creditcoin/holdings.js";
import { claimLandDeed, listDeedForSale, listDeedMarket, mintDeedStub, unlistDeed } from "./game/deeds.js";
import { getChainMarketplaceView } from "./game/chainMarket.js";
import { listPresenceOnLand, reportPresenceOnActiveLand } from "./game/presence.js";
import { arePlayersNearbyForTrade } from "./game/tradeInvite.js";
import { pushChat, pushGuildInvite, pushPresence, pushTradeInvite } from "./ws/hub.js";

type PosBody = { x?: number; z?: number; care?: "feed" | "clean" };
export type AppEnv = {
  Variables: {
    userId: string;
  };
};

export const app = new Hono<AppEnv>();

app.use(
  "*",
  cors({
    // Reason: RF4.4 — deployable origin without code edit (comma-separated ok).
    origin: resolveCorsOrigins(),
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.get("/telemetry", (c) => {
  const header = c.req.header("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return c.json(telemetryHttpPayload(Boolean(userIdFromToken(token))));
});

/** Public read-only stub-chain price mirror (F15.4) — no auth, not required to play. */
app.get("/chain/marketplace", (c) => {
  return c.json({ ok: true, ...getChainMarketplaceView() });
});

/** Public Creditcoin Testnet + contract addresses for MetaMask / client txs. */
app.get("/chain/creditcoin", (c) => {
  return c.json({ ok: true, ...publicCreditcoinConfig() });
});

app.post("/auth/register", async (c) => {
  const ip = authClientIp(c);
  if (!consumeRateLimit(`auth:ip:${ip}`, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_MS)) {
    return c.json({ ok: false, error: "Too many attempts. Try again shortly." }, 429);
  }
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "Invalid username or password payload." }, 400);
  }
  const parsed = parseAuthCredentials(raw);
  if (!parsed.ok) return c.json({ ok: false, error: parsed.error }, 400);
  const userKey = parsed.data.username.trim().toLowerCase();
  if (
    userKey &&
    !consumeRateLimit(`auth:user:${userKey}`, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_MS)
  ) {
    return c.json({ ok: false, error: "Too many attempts. Try again shortly." }, 429);
  }
  const result = registerUser(parsed.data.username, parsed.data.password);
  if (!result.ok) return c.json(result, 400);
  return c.json(result);
});

app.post("/auth/login", async (c) => {
  const ip = authClientIp(c);
  if (!consumeRateLimit(`auth:ip:${ip}`, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_MS)) {
    return c.json({ ok: false, error: "Too many attempts. Try again shortly." }, 429);
  }
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "Invalid username or password payload." }, 400);
  }
  const parsed = parseAuthCredentials(raw);
  if (!parsed.ok) return c.json({ ok: false, error: parsed.error }, 400);
  const userKey = parsed.data.username.trim().toLowerCase();
  if (
    userKey &&
    !consumeRateLimit(`auth:user:${userKey}`, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_MS)
  ) {
    return c.json({ ok: false, error: "Too many attempts. Try again shortly." }, 429);
  }
  const result = loginUser(parsed.data.username, parsed.data.password);
  if (!result.ok) return c.json(result, 401);
  return c.json(result);
});

app.use("/api/*", async (c, next) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const userId = userIdFromToken(token);
  if (!userId) return c.json({ ok: false, error: "You need to log in again." }, 401);
  c.set("userId", userId);
  await next();
});

app.post("/api/auth/logout", (c) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  revokeSession(token);
  return c.json({ ok: true });
});

app.get("/api/me", (c) => {
  const state = getPlayerState(c.get("userId"));
  if (!state) return c.json({ ok: false, error: "Could not find your character." }, 404);
  return c.json({ ok: true, state });
});

app.get("/api/players", (c) => {
  return c.json({
    ok: true,
    players: listOtherPlayers(c.get("userId")),
  });
});

app.get("/api/lands/:username", (c) => {
  const result = getVisitLand(c.get("userId"), c.req.param("username"));
  if (!result.ok) return c.json(result, 400);
  track("land_visit", { owner: c.req.param("username") });
  return c.json({ ok: true, land: result.land });
});

app.post("/api/buildings/:buildingId/plant", async (c) => {
  const body = await c.req.json<{ seedItemId?: ItemId } & PosBody>();
  const result = plantCrop(
    c.get("userId"),
    c.req.param("buildingId"),
    body.seedItemId ?? "wheat_seed",
    { x: body.x ?? NaN, z: body.z ?? NaN },
  );
  if (!result.ok) return c.json(result, 400);
  track("plant", { buildingId: c.req.param("buildingId") });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/buildings/:buildingId/gather", async (c) => {
  const body = await c.req.json<PosBody>().catch(() => ({} as PosBody));
  const care =
    body.care === "feed" || body.care === "clean" ? body.care : undefined;
  const result = gatherBuilding(
    c.get("userId"),
    c.req.param("buildingId"),
    {
      x: body.x ?? NaN,
      z: body.z ?? NaN,
    },
    care,
  );
  if (!result.ok) return c.json({ ok: false, error: result.error }, 400);
  track("gather_ore", { buildingId: c.req.param("buildingId") });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/buildings/:buildingId/claim", async (c) => {
  const body = await c.req.json<PosBody>().catch(() => ({} as PosBody));
  const result = interactClaimNode(
    c.get("userId"),
    c.req.param("buildingId"),
    { x: body.x ?? NaN, z: body.z ?? NaN },
  );
  if (!result.ok) return c.json({ ok: false, error: result.error }, 400);
  track("claim_node", {
    buildingId: c.req.param("buildingId"),
    claimed: result.claimed,
    collected: result.collected,
  });
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    claimed: result.claimed,
    collected: result.collected,
    contestStarted: result.contestStarted,
    contestEndsAt: result.contestEndsAt,
    delivered: result.delivered,
    score: result.score,
  });
});

app.post("/api/buildings/:buildingId/harvest", async (c) => {
  const body = await c.req.json<PosBody>().catch(() => ({} as PosBody));
  const result = harvestCrop(c.get("userId"), c.req.param("buildingId"), {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("harvest", { buildingId: c.req.param("buildingId") });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/buildings/:buildingId/hunt", async (c) => {
  const body = await c.req.json<PosBody>().catch(() => ({} as PosBody));
  const result = huntTrail(c.get("userId"), c.req.param("buildingId"), {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("hunt", { buildingId: c.req.param("buildingId") });
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    encounter: result.encounter,
    combat: result.combat ?? null,
  });
});

app.post("/api/buildings/:buildingId/combat/start", async (c) => {
  const body = await c.req.json<PosBody>().catch(() => ({} as PosBody));
  const result = startLiveCombat(c.get("userId"), c.req.param("buildingId"), {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("combat_start", { buildingId: c.req.param("buildingId") });
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    combat: result.combat ?? null,
  });
});

app.post("/api/combat/act", async (c) => {
  const body = await c
    .req.json<{ action?: string } & PosBody>()
    .catch(() => ({} as { action?: string } & PosBody));
  const result = actLiveCombat(c.get("userId"), body.action ?? "attack", {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("combat_act", { action: body.action ?? "attack" });
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    combat: result.combat ?? null,
    encounter: result.encounter,
  });
});

app.post("/api/combat/tick", async (c) => {
  const body = await c.req.json<PosBody>().catch(() => ({} as PosBody));
  const result = tickLiveCombatSession(c.get("userId"), {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    combat: result.combat ?? null,
    encounter: result.encounter,
  });
});

app.post("/api/buildings/:buildingId/upgrade", async (c) => {
  const body = await c.req.json<PosBody>().catch(() => ({} as PosBody));
  const result = upgradeBuilding(c.get("userId"), c.req.param("buildingId"), {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("building_upgrade", { buildingId: c.req.param("buildingId") });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/buildings/:buildingId/decor", async (c) => {
  const body = await c
    .req.json<{ decorId?: string } & PosBody>()
    .catch(() => ({} as { decorId?: string } & PosBody));
  const result = placeHousingDecor(
    c.get("userId"),
    c.req.param("buildingId"),
    body.decorId ?? "",
    { x: body.x ?? NaN, z: body.z ?? NaN },
  );
  if (!result.ok) return c.json(result, 400);
  track("decor_place", { buildingId: c.req.param("buildingId"), decorId: body.decorId });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/craft", async (c) => {
  const body = await c.req.json<{ recipeId?: string } & PosBody>();
  const result = craftRecipe(c.get("userId"), body.recipeId ?? "", {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("craft", { recipeId: body.recipeId ?? "" });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/craft/collect", async (c) => {
  const body = await c.req.json<{ buildingId?: string } & PosBody>();
  const result = collectCraft(c.get("userId"), body.buildingId ?? "", {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("craft_collect", { buildingId: body.buildingId ?? "" });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/eat-bread", (c) => {
  const result = eatBread(c.get("userId"));
  if (!result.ok) return c.json(result, 400);
  track("eat_bread");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/eat", async (c) => {
  const body = await c.req.json<{ itemId?: EdibleItemId }>();
  const result = eatFood(c.get("userId"), body.itemId ?? "bread");
  if (!result.ok) return c.json(result, 400);
  track("eat_bread", { itemId: body.itemId ?? "bread" });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/vendor/sell", async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ ok: false, error: ACTION_ERROR.invalidQty }, 400);
  }
  const parsed = parseBody(vendorBodySchema, raw, ACTION_ERROR.invalidQty);
  if (!parsed.ok) return c.json({ ok: false, error: parsed.error }, 400);
  const qty = parsed.data.qty ?? 1;
  const result = vendorSell(c.get("userId"), parsed.data.itemId as ItemId, qty, {
    x: parsed.data.x ?? NaN,
    z: parsed.data.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("vendor_sell", { itemId: parsed.data.itemId, qty });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/vendor/buy", async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ ok: false, error: ACTION_ERROR.invalidQty }, 400);
  }
  const parsed = parseBody(vendorBodySchema, raw, ACTION_ERROR.invalidQty);
  if (!parsed.ok) return c.json({ ok: false, error: parsed.error }, 400);
  const qty = parsed.data.qty ?? 1;
  const result = vendorBuy(c.get("userId"), parsed.data.itemId as ItemId, qty, {
    x: parsed.data.x ?? NaN,
    z: parsed.data.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("vendor_buy", { itemId: parsed.data.itemId, qty });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/equip-tool", async (c) => {
  const body = await c.req.json<{ inventoryId?: string | null }>();
  const stateUser = c.get("userId");
  const player = db.select().from(players).where(eq(players.userId, stateUser)).get();
  if (!player) return c.json({ ok: false, error: "Could not find your character." }, 404);

  if (!body.inventoryId) {
    db.update(players)
      .set({ equippedToolInventoryId: null })
      .where(eq(players.id, player.id))
      .run();
    return c.json({ ok: true, state: getPlayerState(stateUser) });
  }

  const item = db
    .select()
    .from(inventory)
    .where(eq(inventory.id, body.inventoryId))
    .get();
  if (!item || item.playerId !== player.id) {
    return c.json({ ok: false, error: "That item is not in your inventory." }, 400);
  }
  if (!item.itemId.includes("hoe") && !item.itemId.includes("hammer")) {
    return c.json({ ok: false, error: "That item cannot be equipped as a tool." }, 400);
  }

  db.update(players)
    .set({ equippedToolInventoryId: item.id })
    .where(eq(players.id, player.id))
    .run();
  return c.json({ ok: true, state: getPlayerState(stateUser) });
});

app.post("/api/equip-gear", async (c) => {
  const body = await c
    .req.json<{ inventoryId?: string | null; slot?: string }>()
    .catch(() => ({} as { inventoryId?: string | null; slot?: string }));
  const result = equipCombatGear(
    c.get("userId"),
    body.inventoryId ?? null,
    body.slot,
  );
  if (!result.ok) return c.json(result, 400);
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/repair-tool", async (c) => {
  const body = await c.req.json<{ inventoryId?: string }>();
  const result = repairTool(c.get("userId"), body.inventoryId ?? "");
  if (!result.ok) return c.json(result, 400);
  track("repair_tool");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.get("/api/trades", (c) => {
  return c.json({ ok: true, trades: listPendingTrades(c.get("userId")) });
});

app.post("/api/trades", async (c) => {
  const body = await c.req.json<{
    toUsername?: string;
    give?: TradeLeg[];
    want?: TradeLeg[];
    giveCoins?: number;
    wantCoins?: number;
  }>();
  const result = createTradeOffer(
    c.get("userId"),
    body.toUsername ?? "",
    body.give ?? [],
    body.want ?? [],
    body.giveCoins ?? 0,
    body.wantCoins ?? 0,
  );
  if (!result.ok) return c.json(result, 400);
  track("trade_offer", { tradeId: result.tradeId });
  if (result.toUserId && result.tradeId) {
    const fromUser = db
      .select()
      .from(users)
      .where(eq(users.id, c.get("userId")))
      .get();
    if (
      fromUser &&
      arePlayersNearbyForTrade(c.get("userId"), result.toUserId)
    ) {
      pushTradeInvite(result.toUserId, {
        tradeId: result.tradeId,
        fromUsername: fromUser.username,
      });
    }
  }
  return c.json({
    ok: true,
    tradeId: result.tradeId,
    trades: listPendingTrades(c.get("userId")),
    state: getPlayerState(c.get("userId")),
  });
});

app.post("/api/trades/:tradeId/accept", (c) => {
  const result = acceptTrade(c.get("userId"), c.req.param("tradeId"));
  if (!result.ok) return c.json(result, 400);
  track("trade_accept", { tradeId: c.req.param("tradeId") });
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    trades: listPendingTrades(c.get("userId")),
  });
});

app.post("/api/trades/:tradeId/reject", (c) => {
  const result = rejectTrade(c.get("userId"), c.req.param("tradeId"));
  if (!result.ok) return c.json(result, 400);
  track("trade_reject", { tradeId: c.req.param("tradeId") });
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    trades: listPendingTrades(c.get("userId")),
  });
});

app.post("/api/land/expand", async (c) => {
  const body = await c.req.json<PosBody>().catch(() => ({} as PosBody));
  const result = expandLandSlot(c.get("userId"), {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("land_expand");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/land/build", async (c) => {
  const body = await c
    .req.json<{ type?: string; x?: number; z?: number }>()
    .catch(() => ({} as { type?: string; x?: number; z?: number }));
  const result = placeLandStation(c.get("userId"), body.type ?? "", {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("land_build");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/land/place-kit", async (c) => {
  const body = await c
    .req.json<{ inventoryId?: string; x?: number; z?: number }>()
    .catch(() => ({} as { inventoryId?: string; x?: number; z?: number }));
  const result = placeStationKit(
    c.get("userId"),
    body.inventoryId ?? "",
    body.x ?? NaN,
    body.z ?? NaN,
  );
  if (!result.ok) return c.json(result, 400);
  track("land_place_kit");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/land/pickup", async (c) => {
  const body = await c
    .req.json<{ buildingId?: string; x?: number; z?: number }>()
    .catch(() => ({} as { buildingId?: string; x?: number; z?: number }));
  const result = pickupLandStation(c.get("userId"), body.buildingId ?? "", {
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  track("land_pickup");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/travel", async (c) => {
  const body = await c
    .req.json<{ kind?: string; landId?: string }>()
    .catch(() => ({} as { kind?: string; landId?: string }));
  const result = body.landId
    ? travelToOwnedLand(c.get("userId"), body.landId)
    : travelToLandKind(c.get("userId"), body.kind ?? "");
  if (!result.ok) return c.json(result, 400);
  track("travel", { kind: body.kind ?? "", landId: body.landId ?? "" });
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.get("/api/market", (c) => {
  return c.json({ ok: true, listings: listMarket(c.get("userId")) });
});

app.get("/api/market/analytics", (c) => {
  const itemId = c.req.query("itemId") ?? "";
  const idOk = parseBody(
    z.string().min(1).max(64),
    itemId,
    ACTION_ERROR.marketInvalid,
  );
  if (!idOk.ok) return c.json({ ok: false, error: idOk.error }, 400);
  const result = getMarketItemAnalytics(idOk.data);
  if (!result.ok) return c.json(result, 400);
  return c.json({ ok: true, analytics: result.analytics });
});

app.post("/api/market", async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "Invalid market listing payload." }, 400);
  }
  const parsed = parseBody(
    marketListSchema,
    raw,
    "Invalid market listing payload.",
  );
  if (!parsed.ok) return c.json({ ok: false, error: parsed.error }, 400);
  const result = createMarketListing(
    c.get("userId"),
    parsed.data.itemId as ItemId,
    parsed.data.qty,
    parsed.data.priceCoins,
  );
  if (!result.ok) return c.json(result, 400);
  track("market_list", { itemId: parsed.data.itemId, qty: parsed.data.qty });
  return c.json({
    ok: true,
    listingId: result.listingId,
    listings: listMarket(c.get("userId")),
    state: getPlayerState(c.get("userId")),
  });
});

app.post("/api/market/:listingId/buy", (c) => {
  const listingId = c.req.param("listingId");
  const idOk = parseBody(
    z.string().min(1).max(64),
    listingId,
    "Invalid listing.",
  );
  if (!idOk.ok) return c.json({ ok: false, error: idOk.error }, 400);
  const result = buyMarketListing(c.get("userId"), idOk.data);
  if (!result.ok) return c.json(result, 400);
  track("market_buy", { listingId: idOk.data });
  return c.json({
    ok: true,
    listings: listMarket(c.get("userId")),
    state: getPlayerState(c.get("userId")),
  });
});

app.post("/api/market/:listingId/cancel", (c) => {
  const listingId = c.req.param("listingId");
  const idOk = parseBody(
    z.string().min(1).max(64),
    listingId,
    "Invalid listing.",
  );
  if (!idOk.ok) return c.json({ ok: false, error: idOk.error }, 400);
  const result = cancelMarketListing(c.get("userId"), idOk.data);
  if (!result.ok) return c.json(result, 400);
  track("market_cancel", { listingId: idOk.data });
  return c.json({
    ok: true,
    listings: listMarket(c.get("userId")),
    state: getPlayerState(c.get("userId")),
  });
});

app.get("/api/chat", (c) => {
  return c.json({ ok: true, messages: listChat() });
});

app.post("/api/chat", async (c) => {
  const userId = c.get("userId");
  if (!consumeRateLimit(`chat:${userId}`, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW_MS)) {
    return c.json({ ok: false, error: "Slow down — chat is cooling off." }, 429);
  }
  const body = await c.req.json<{ text?: string }>();
  const user = db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();
  if (!user) return c.json({ ok: false, error: "Could not find your character." }, 404);
  const result = postChat(user.username, body.text ?? "");
  if (!result.ok) return c.json(result, 400);
  pushChat(null, result.message);
  track("chat");
  return c.json({ ok: true, messages: listChat() });
});

app.get("/api/guilds/chat", (c) => {
  const result = listGuildChat(c.get("userId"));
  if (!result.ok) return c.json(result, 400);
  return c.json({ ok: true, messages: result.messages });
});

app.post("/api/guilds/chat", async (c) => {
  const body = await c.req.json<{ text?: string }>();
  const result = postGuildChat(c.get("userId"), body.text ?? "");
  if (!result.ok) return c.json(result, 400);
  track("guild_chat");
  const listed = listGuildChat(c.get("userId"));
  return c.json({
    ok: true,
    messages: listed.ok ? listed.messages : [result.message],
  });
});

app.get("/api/guilds", (c) => {
  return c.json({ ok: true, guilds: listGuilds() });
});

app.get("/api/guilds/members", (c) => {
  return c.json({
    ok: true,
    members: listGuildMembers(c.get("userId")),
  });
});

app.get("/api/quests", (c) => {
  return c.json({ ok: true, quests: listQuests(c.get("userId")) });
});

app.post("/api/quests/:questId/claim", (c) => {
  const result = claimQuest(c.get("userId"), c.req.param("questId"));
  if (!result.ok) return c.json(result, 400);
  track("quest_claim", { questId: c.req.param("questId") });
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    quests: listQuests(c.get("userId")),
    rewardCoins: result.rewardCoins,
    rewardCharacterXp: result.rewardCharacterXp,
  });
});

app.get("/api/tutorial-npcs", (c) => {
  return c.json({ ok: true, npcs: listTutorialNpcs(c.get("userId")) });
});

app.get("/api/tutorial-npcs/:professionId", (c) => {
  const npc = getTutorialNpcForPlayer(
    c.get("userId"),
    c.req.param("professionId"),
  );
  if (!npc) return c.json({ ok: false, error: "Unknown tutorial NPC." }, 404);
  return c.json({ ok: true, npc });
});

app.post("/api/tutorial-npcs/:professionId/claim", (c) => {
  const result = claimTutorialQuest(
    c.get("userId"),
    c.req.param("professionId"),
  );
  if (!result.ok) return c.json(result, 400);
  track("tutorial_npc_claim", { professionId: c.req.param("professionId") });
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    npc: result.npc,
    rewardCoins: result.rewardCoins,
    rewardCharacterXp: result.rewardCharacterXp,
  });
});

app.get("/api/achievements", (c) => {
  return c.json({
    ok: true,
    achievements: listAchievements(c.get("userId")),
  });
});

app.get("/api/mail", (c) => {
  return c.json({ ok: true, mail: listMail(c.get("userId")) });
});

app.post("/api/mail", async (c) => {
  const body = await c.req.json<{
    toUsername?: string;
    items?: Array<{ itemId: string; qty: number }>;
    coins?: number;
    subject?: string;
  }>();
  const result = sendMail(
    c.get("userId"),
    body.toUsername ?? "",
    (body.items ?? []) as Array<{ itemId: import("@game/shared").ItemId; qty: number }>,
    body.coins ?? 0,
    body.subject,
  );
  if (!result.ok) return c.json(result, 400);
  track("mail_send");
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    mail: listMail(c.get("userId")),
    mailId: result.mailId,
  });
});

app.post("/api/mail/:mailId/claim", (c) => {
  const result = claimMail(c.get("userId"), c.req.param("mailId"));
  if (!result.ok) return c.json(result, 400);
  track("mail_claim");
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    mail: listMail(c.get("userId")),
  });
});

app.post("/api/mail/:mailId/cancel", (c) => {
  const result = cancelMail(c.get("userId"), c.req.param("mailId"));
  if (!result.ok) return c.json(result, 400);
  track("mail_cancel");
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    mail: listMail(c.get("userId")),
  });
});

app.post("/api/wallet/connect", (c) => {
  const result = connectWalletStub(c.get("userId"));
  if (!result.ok) return c.json(result, 400);
  track("wallet_connect_stub");
  return c.json({ ok: true, ...walletLinkResult(c.get("userId")) });
});

app.post("/api/wallet/disconnect", (c) => {
  const result = disconnectWalletStub(c.get("userId"));
  if (!result.ok) return c.json(result, 400);
  track("wallet_disconnect_stub");
  invalidateCreditcoinSnapshot(c.get("userId"));
  return c.json({ ok: true, ...walletLinkResult(c.get("userId")) });
});

app.get("/api/wallet/challenge", (c) => {
  const result = createWalletLinkChallenge(c.get("userId"));
  if (!result.ok) return c.json(result, 400);
  return c.json(result);
});

app.post("/api/wallet/link", async (c) => {
  const body = await c.req.json<{
    address?: string;
    signature?: string;
    message?: string;
  }>();
  const address = body.address ?? "";
  const signature = body.signature ?? "";
  const message = body.message ?? "";
  if (!looksLikeSignature(signature)) {
    return c.json({ ok: false, error: ACTION_ERROR.walletBadSignature }, 400);
  }
  const result = linkWalletWithSignature(
    c.get("userId"),
    address,
    signature,
    message,
  );
  if (!result.ok) return c.json(result, 400);
  track("wallet_link_creditcoin");
  invalidateCreditcoinSnapshot(c.get("userId"));
  return c.json({ ok: true, ...walletLinkResult(c.get("userId")) });
});

app.get("/api/creditcoin/snapshot", async (c) => {
  invalidateCreditcoinSnapshot(c.get("userId"));
  const snapshot = await getCreditcoinSnapshot(c.get("userId"));
  return c.json({
    ok: true,
    snapshot,
    state: getPlayerState(c.get("userId")),
  });
});

app.post("/api/creditcoin/swap", async (c) => {
  const body = await c.req.json<{ coins?: number }>();
  const result = requestCoinSwap(c.get("userId"), body.coins ?? 0);
  if (!result.ok) return c.json(result, 400);
  let swap = result.swap;
  if (swap?.status === "pending") {
    await runCreditcoinWorkerTick();
    swap = getCoinSwap(swap.id) ?? swap;
    if (swap.status !== "minted" && hasDirectRealmMinter()) {
      refundCoinSwap(swap.id);
      invalidateCreditcoinSnapshot(c.get("userId"));
      return c.json(
        { ok: false, error: ACTION_ERROR.realmMintFailed, state: getPlayerState(c.get("userId")) },
        400,
      );
    }
  }
  track("creditcoin_coin_swap");
  invalidateCreditcoinSnapshot(c.get("userId"));
  return c.json({
    ok: true,
    swap,
    state: getPlayerState(c.get("userId")),
  });
});

app.get("/api/creditcoin/market", (c) => {
  return c.json({ ok: true, listings: listTokenItemMarket(c.get("userId")) });
});

app.post("/api/creditcoin/market", async (c) => {
  const body = await c.req.json<{
    itemId?: string;
    qty?: number;
    priceRealm?: number;
  }>();
  const result = createTokenItemListing(
    c.get("userId"),
    body.itemId as ItemId,
    body.qty ?? 0,
    body.priceRealm ?? 0,
  );
  if (!result.ok) return c.json(result, 400);
  track("creditcoin_token_list");
  invalidateCreditcoinSnapshot(c.get("userId"));
  return c.json({
    ok: true,
    listing: result.listing,
    state: getPlayerState(c.get("userId")),
  });
});

app.post("/api/creditcoin/market/:id/onchain", async (c) => {
  const body = await c.req.json<{ onchainListingId?: string }>();
  const result = await attachOnchainListing(
    c.get("userId"),
    c.req.param("id"),
    body.onchainListingId ?? "",
  );
  if (!result.ok) return c.json(result, 400);
  invalidateCreditcoinSnapshot(c.get("userId"));
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/creditcoin/market/:id/buy", async (c) => {
  const result = await buyTokenItemListing(c.get("userId"), c.req.param("id"));
  if (!result.ok) return c.json(result, 400);
  track("creditcoin_token_buy");
  invalidateCreditcoinSnapshot(c.get("userId"));
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/creditcoin/market/:id/cancel", (c) => {
  const result = cancelTokenItemListing(c.get("userId"), c.req.param("id"));
  if (!result.ok) return c.json(result, 400);
  track("creditcoin_token_cancel");
  invalidateCreditcoinSnapshot(c.get("userId"));
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/creditcoin/lands/mint", async (c) => {
  const body = await c.req.json<{ biome?: string; size?: string }>();
  const result = mintLocalLand(
    c.get("userId"),
    body.biome as "forest" | "mountain" | "fertile",
    body.size as "small" | "medium" | "large",
  );
  if (!result.ok) return c.json(result, 400);
  track("creditcoin_land_mint");
  invalidateCreditcoinSnapshot(c.get("userId"));
  return c.json({
    ok: true,
    land: result.land,
    state: getPlayerState(c.get("userId")),
  });
});

app.post("/api/creditcoin/lands/confirm", async (c) => {
  const body = await c.req.json<{
    biome?: string;
    size?: string;
    tokenId?: string;
    txHash?: string;
  }>();
  const result = await confirmOnchainLand(c.get("userId"), {
    biome: body.biome ?? "",
    size: body.size ?? "",
    tokenId: body.tokenId,
    txHash: body.txHash,
  });
  if (!result.ok) return c.json(result, 400);
  track("creditcoin_land_confirm");
  invalidateCreditcoinSnapshot(c.get("userId"));
  return c.json({
    ok: true,
    land: result.land,
    state: getPlayerState(c.get("userId")),
  });
});

app.post("/api/deeds/claim", (c) => {
  const result = claimLandDeed(c.get("userId"));
  if (!result.ok) return c.json(result, 400);
  track("deed_claim");
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    deedId: result.deedId,
  });
});

app.get("/api/deeds/market", (c) => {
  return c.json({ ok: true, listings: listDeedMarket() });
});

app.post("/api/deeds/:deedId/mint", (c) => {
  const result = mintDeedStub(c.get("userId"), c.req.param("deedId"));
  if (!result.ok) return c.json(result, 400);
  track("deed_mint_stub");
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    mintTxStub: result.mintTxStub,
  });
});

app.post("/api/deeds/:deedId/list", async (c) => {
  const body = await c.req.json<{ priceCoins?: number }>();
  const result = listDeedForSale(
    c.get("userId"),
    c.req.param("deedId"),
    body.priceCoins ?? 0,
  );
  if (!result.ok) return c.json(result, 400);
  track("deed_list_stub");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/deeds/:deedId/unlist", (c) => {
  const result = unlistDeed(c.get("userId"), c.req.param("deedId"));
  if (!result.ok) return c.json(result, 400);
  track("deed_unlist_stub");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/guilds", async (c) => {
  const body = await c.req.json<{ name?: string }>();
  const result = createGuild(c.get("userId"), body.name ?? "");
  if (!result.ok) return c.json(result, 400);
  track("guild_create");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/guilds/join", async (c) => {
  const body = await c.req.json<{ code?: string; inviteCode?: string }>();
  const result = joinGuildByInvite(
    c.get("userId"),
    body.code ?? body.inviteCode ?? "",
  );
  if (!result.ok) return c.json(result, 400);
  track("guild_join");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/guilds/leave", (c) => {
  const result = leaveGuild(c.get("userId"));
  if (!result.ok) return c.json(result, 400);
  track("guild_leave");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

app.post("/api/guilds/invite/regenerate", (c) => {
  const result = regenerateInviteCode(c.get("userId"));
  if (!result.ok) return c.json(result, 400);
  track("guild_invite_regen");
  return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
});

/**
 * PL189.2 — soft-offer existing invite code to a nearby player (join-by-code SoT).
 */
app.post("/api/guilds/invite/offer", async (c) => {
  const body = await c.req.json<{ toUsername?: string }>();
  const result = offerGuildInviteToNearby(
    c.get("userId"),
    body.toUsername ?? "",
  );
  if (!result.ok) return c.json(result, 400);
  if (
    result.toUserId &&
    result.code &&
    result.fromUsername &&
    arePlayersNearbyForTrade(c.get("userId"), result.toUserId)
  ) {
    pushGuildInvite(result.toUserId, {
      code: result.code,
      fromUsername: result.fromUsername,
      guildName: result.guildName,
    });
    track("guild_invite_offer");
    return c.json({ ok: true, state: getPlayerState(c.get("userId")) });
  }
  return c.json({ ok: false, error: ACTION_ERROR.tooFar }, 400);
});

app.post("/api/guilds/rank", async (c) => {
  const body = await c.req.json<{ username?: string; rank?: string }>();
  const result = setGuildMemberRank(
    c.get("userId"),
    body.username ?? "",
    body.rank ?? "",
  );
  if (!result.ok) return c.json(result, 400);
  track("guild_rank");
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    members: listGuildMembers(c.get("userId")),
  });
});

app.get("/api/guilds/bank", (c) => {
  return c.json({
    ok: true,
    bank: listGuildBank(c.get("userId")),
  });
});

app.post("/api/guilds/bank/deposit", async (c) => {
  const body = await c.req.json<{ itemId?: string; qty?: number }>();
  const result = depositGuildBank(
    c.get("userId"),
    body.itemId ?? "",
    body.qty ?? 0,
  );
  if (!result.ok) return c.json(result, 400);
  track("guild_bank_deposit");
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    bank: listGuildBank(c.get("userId")),
  });
});

app.post("/api/guilds/bank/withdraw", async (c) => {
  const body = await c.req.json<{ itemId?: string; qty?: number }>();
  const result = withdrawGuildBank(
    c.get("userId"),
    body.itemId ?? "",
    body.qty ?? 0,
  );
  if (!result.ok) return c.json(result, 400);
  track("guild_bank_withdraw");
  return c.json({
    ok: true,
    state: getPlayerState(c.get("userId")),
    bank: listGuildBank(c.get("userId")),
  });
});

app.post("/api/presence", async (c) => {
  const body = await c.req.json<{ landId?: string; x?: number; z?: number }>();
  const user = db
    .select()
    .from(users)
    .where(eq(users.id, c.get("userId")))
    .get();
  if (!user) return c.json({ ok: false, error: "Could not find your character." }, 404);
  const result = reportPresenceOnActiveLand({
    userId: c.get("userId"),
    username: user.username,
    x: body.x ?? NaN,
    z: body.z ?? NaN,
  });
  if (!result.ok) return c.json(result, 400);
  const landId = result.landId;
  pushPresence(landId, listPresenceOnLand(landId, ""));
  return c.json({
    ok: true,
    others: listPresenceOnLand(landId, c.get("userId")),
  });
});

app.get("/api/presence", (c) => {
  const landId = c.req.query("landId") ?? "";
  if (!landId) return c.json({ ok: false, error: "landId required" }, 400);
  return c.json({
    ok: true,
    others: listPresenceOnLand(landId, c.get("userId")),
  });
});
