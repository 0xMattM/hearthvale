import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const API = path.join(process.cwd(), "apps/web/lib/api.ts");
const GUILDS = path.join(process.cwd(), "apps/server/src/game/guilds.ts");
const GAME_APP = path.join(process.cwd(), "apps/web/components/GameApp.tsx");

/**
 * Dead-path cleanup (2026-09-11) — unused client wrappers / unmounted components.
 */
describe("code cleanup dead client paths", () => {
  it("keeps live Creditcoin + kit place APIs (happy)", () => {
    const api = fs.readFileSync(API, "utf8");
    expect(api).toContain("export function apiPlaceStationKit");
    expect(api).toContain("export function apiCreditcoinListItem");
    expect(api).toContain("export function apiEatFood");
    expect(fs.existsSync(GAME_APP)).toBe(true);
  });

  it("does not mount replaced avatar/brick/deed components (edge)", () => {
    const gameApp = fs.readFileSync(GAME_APP, "utf8");
    expect(gameApp).not.toContain("DeedPanel");
    expect(gameApp).not.toContain("KayKitAvatarModel");
    expect(gameApp).not.toContain("BrickHouseProp");
    expect(gameApp).not.toContain("AvatarGltfRig");
    expect(gameApp).not.toContain("HuntWildlifeHabitat");
  });

  it("drops unused client wrappers and joinGuild stub (fail if revived)", () => {
    const api = fs.readFileSync(API, "utf8");
    const guilds = fs.readFileSync(GUILDS, "utf8");
    expect(api).not.toContain("export function apiHunt(");
    expect(api).not.toContain("export function apiEatBread(");
    expect(api).not.toContain("export function apiConnectWallet(");
    expect(api).not.toContain("export function apiBuildStation(");
    expect(api).not.toContain("export async function apiCreditcoinMarket(");
    expect(api).not.toContain("export function apiMintDeed(");
    expect(guilds).not.toMatch(/export function joinGuild\(/);
    expect(guilds).toContain("export function joinGuildByInvite(");
  });
});
