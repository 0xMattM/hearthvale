import { afterEach, describe, expect, it } from "vitest";
import {
  creditcoinConfig,
  publicCreditcoinConfig,
} from "../../apps/server/src/game/creditcoin/config.ts";
import { hasDirectRealmMinter } from "../../apps/server/src/game/creditcoin/onchain.ts";

const KEYS = [
  "GAME_CREDITCOIN_MODE",
  "CREDITCOIN_REALM_TOKEN",
  "CREDITCOIN_LAND_NFT",
  "CREDITCOIN_MARKETPLACE",
  "CREDITCOIN_ASC",
  "SEPOLIA_NOTARY",
  "SEPOLIA_RELAYER_KEY",
  "CREDITCOIN_WORKER_KEY",
] as const;

const saved: Record<string, string | undefined> = {};

/**
 * Snapshots Creditcoin env keys so tests can mutate process.env safely.
 */
function stashEnv(): void {
  for (const key of KEYS) saved[key] = process.env[key];
}

/**
 * Restores Creditcoin env keys after each test.
 */
function restoreEnv(): void {
  for (const key of KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
}

/**
 * Overwrites selected process.env keys (undefined deletes).
 */
function setEnv(next: Record<string, string | undefined>): void {
  for (const [key, value] of Object.entries(next)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe("Attestcoin runtime config", () => {
  stashEnv();
  afterEach(restoreEnv);

  it("marks attestcoin ready when ASC and Sepolia notary are set (happy)", () => {
    setEnv({
      GAME_CREDITCOIN_MODE: "attestcoin",
      CREDITCOIN_REALM_TOKEN: "0x1111111111111111111111111111111111111111",
      CREDITCOIN_LAND_NFT: "0x2222222222222222222222222222222222222222",
      CREDITCOIN_MARKETPLACE: "0x3333333333333333333333333333333333333333",
      CREDITCOIN_ASC: "0x4444444444444444444444444444444444444444",
      SEPOLIA_NOTARY: "0x5555555555555555555555555555555555555555",
      SEPOLIA_RELAYER_KEY: "0xabc",
      CREDITCOIN_WORKER_KEY: "0xdef",
    });
    const cfg = creditcoinConfig();
    expect(cfg.attestcoinReady).toBe(true);
    expect(cfg.mode).toBe("attestcoin");
    expect(cfg.contractsConfigured).toBe(true);
    const pub = publicCreditcoinConfig();
    expect(pub).not.toHaveProperty("sepoliaRelayerKey");
    expect(pub).not.toHaveProperty("creditcoinWorkerKey");
    expect(JSON.stringify(pub)).not.toContain("0xabc");
  });

  it("disables the centralized REALM minter in attestcoin mode (edge)", () => {
    setEnv({
      GAME_CREDITCOIN_MODE: "attestcoin",
      CREDITCOIN_REALM_TOKEN: "0x1111111111111111111111111111111111111111",
      CREDITCOIN_WORKER_KEY: "0xdef",
      CREDITCOIN_ASC: "0x4444444444444444444444444444444444444444",
      SEPOLIA_NOTARY: "0x5555555555555555555555555555555555555555",
    });
    expect(hasDirectRealmMinter()).toBe(false);
  });

  it("is not attestcoin-ready when the Sepolia notary is missing (failure)", () => {
    setEnv({
      GAME_CREDITCOIN_MODE: "attestcoin",
      CREDITCOIN_ASC: "0x4444444444444444444444444444444444444444",
      SEPOLIA_NOTARY: "",
    });
    const cfg = creditcoinConfig();
    expect(cfg.attestcoinReady).toBe(false);
    expect(cfg.sepoliaNotary).toBe("");
  });
});
