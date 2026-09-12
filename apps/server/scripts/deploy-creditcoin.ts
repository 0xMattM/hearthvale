/**
 * Compiles Realm contracts with solc and deploys them to Creditcoin Testnet.
 *
 * Usage (repo root): npm run chain:deploy
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ContractFactory,
  JsonRpcProvider,
  Wallet,
  formatEther,
} from "ethers";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../../..");
const CONTRACTS_DIR = path.join(REPO_ROOT, "contracts");
const ENV_PATH = path.join(REPO_ROOT, ".env");
const DEPLOYMENT_PATH = path.join(
  CONTRACTS_DIR,
  "deployments",
  "creditcoin-testnet.json",
);
const RPC_URL =
  process.env.CREDITCOIN_RPC_URL ??
  "https://rpc.cc3-testnet.creditcoin.network";
const CHAIN_ID = 102031;
const EXPLORER = "https://creditcoin-testnet.blockscout.com";

interface CompiledContract {
  abi: unknown[];
  bytecode: string;
}

/**
 * Loads KEY=VALUE pairs from the repo-root .env if present.
 */
function loadEnvFile(): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(ENV_PATH)) return out;
  const text = fs.readFileSync(ENV_PATH, "utf8").replace(/^\uFEFF/, "");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return out;
}

/**
 * Upserts keys in .env, preserving comments and unrelated lines.
 */
function upsertEnv(updates: Record<string, string>): void {
  const existing = fs.existsSync(ENV_PATH)
    ? fs.readFileSync(ENV_PATH, "utf8").replace(/^\uFEFF/, "")
    : fs.existsSync(path.join(REPO_ROOT, ".env.example"))
      ? fs.readFileSync(path.join(REPO_ROOT, ".env.example"), "utf8")
      : "";
  const lines = existing.split(/\r?\n/);
  const seen = new Set<string>();
  const next = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) return line;
    const key = trimmed.slice(0, eq).trim();
    if (!(key in updates)) return line;
    seen.add(key);
    return `${key}=${updates[key]}`;
  });
  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) next.push(`${key}=${value}`);
  }
  const body = next.join("\n").replace(/\n*$/, "\n");
  fs.writeFileSync(ENV_PATH, body, "utf8");
}

/**
 * Official 0.8.23 binary (npm `solc` pulls `n`, which is not supported on Windows).
 */
function solcRelease(): { url: string; file: string } {
  if (process.platform === "win32") {
    return {
      url: "https://github.com/ethereum/solidity/releases/download/v0.8.23/solc-windows.exe",
      file: "solc-windows.exe",
    };
  }
  if (process.platform === "darwin") {
    return {
      url: "https://github.com/ethereum/solidity/releases/download/v0.8.23/solc-macos",
      file: "solc-macos",
    };
  }
  return {
    url: "https://github.com/ethereum/solidity/releases/download/v0.8.23/solc-static-linux",
    file: "solc-static-linux",
  };
}

/**
 * Downloads solc 0.8.23 into contracts/.solc if needed.
 */
async function ensureSolc(): Promise<string> {
  const { url, file } = solcRelease();
  const dest = path.join(CONTRACTS_DIR, ".solc", file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1_000_000) return dest;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  console.log(`Downloading solc 0.8.23 (${file})…`);
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`solc download failed: ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  if (process.platform !== "win32") fs.chmodSync(dest, 0o755);
  return dest;
}

/**
 * Compiles a single Solidity file with no imports.
 */
function compileSol(solcPath: string, fileName: string): CompiledContract {
  const source = fs.readFileSync(path.join(CONTRACTS_DIR, fileName), "utf8");
  const input = {
    language: "Solidity",
    sources: { [fileName]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
      outputSelection: {
        "*": { "*": ["abi", "evm.bytecode.object"] },
      },
    },
  };
  const ran = spawnSync(solcPath, ["--standard-json"], {
    input: JSON.stringify(input),
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  });
  if (ran.error) throw ran.error;
  if (!ran.stdout) {
    throw new Error(ran.stderr || `solc exit ${ran.status ?? "unknown"}`);
  }
  const output = JSON.parse(ran.stdout) as {
    errors?: Array<{ severity: string; formattedMessage: string }>;
    contracts?: Record<
      string,
      Record<
        string,
        { abi: unknown[]; evm: { bytecode: { object: string } } }
      >
    >;
  };
  const errors = (output.errors ?? []).filter((e) => e.severity === "error");
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.formattedMessage).join("\n"));
  }
  const bundle = output.contracts?.[fileName];
  const contractName = fileName.replace(/\.sol$/, "");
  const artifact =
    bundle?.[contractName] ??
    Object.values(bundle ?? {}).find((item) => item.evm?.bytecode?.object);
  if (!artifact?.evm?.bytecode?.object) {
    throw new Error(`solc produced no bytecode for ${fileName}`);
  }
  const object = artifact.evm.bytecode.object;
  return {
    abi: artifact.abi,
    bytecode: object.startsWith("0x") ? object : `0x${object}`,
  };
}

/**
 * Best-effort public faucets (Discord remains the official path).
 */
async function tryFaucets(address: string): Promise<void> {
  const payloads: Array<{ url: string; init: RequestInit }> = [
    {
      url: "https://credit-faucet.vercel.app/api/faucet",
      init: {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, amount: 1 }),
      },
    },
  ];
  for (const { url, init } of payloads) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(12_000) });
      console.log(`Faucet ${url} → ${res.status}`);
    } catch (err) {
      console.log(`Faucet ${url} skipped: ${(err as Error).message}`);
    }
  }
}

async function main(): Promise<void> {
  loadEnvFile();
  let key =
    process.env.CREDITCOIN_DEPLOY_KEY ?? process.env.CREDITCOIN_WORKER_KEY;
  if (!key) {
    const wallet = Wallet.createRandom();
    key = wallet.privateKey;
    console.log(`Generated deployer ${wallet.address}`);
  }
  const provider = new JsonRpcProvider(RPC_URL, CHAIN_ID, {
    staticNetwork: true,
  });
  const wallet = new Wallet(key, provider);
  upsertEnv({
    CREDITCOIN_RPC_URL: RPC_URL,
    CREDITCOIN_DEPLOY_KEY: key,
    CREDITCOIN_WORKER_KEY: process.env.CREDITCOIN_WORKER_KEY ?? key,
    GAME_CREDITCOIN_MODE: process.env.GAME_CREDITCOIN_MODE ?? "local_dev",
  });
  loadEnvFile();

  const existingRealm = process.env.CREDITCOIN_REALM_TOKEN;
  const force = process.argv.includes("--force");
  if (existingRealm && !force) {
    const code = await provider.getCode(existingRealm);
    if (code && code !== "0x") {
      console.log(`Contracts already live at ${existingRealm}. Pass --force to redeploy.`);
      return;
    }
  }

  let balance = await provider.getBalance(wallet.address);
  console.log(`Deployer ${wallet.address}`);
  console.log(`Balance ${formatEther(balance)} tCTC`);
  if (balance === 0n) {
    console.log("Trying public faucets…");
    await tryFaucets(wallet.address);
    await new Promise((r) => setTimeout(r, 4000));
    balance = await provider.getBalance(wallet.address);
    console.log(`Balance after faucet ${formatEther(balance)} tCTC`);
  }
  if (balance === 0n) {
    console.log("");
    console.log("No tCTC yet. In Creditcoin Discord #token-faucet run:");
    console.log(`/faucet address:${wallet.address}`);
    console.log("Then re-run: npm run chain:deploy");
    process.exitCode = 2;
    return;
  }

  console.log("Compiling RealmToken, LandNFT, ItemMarketplace…");
  const solcPath = await ensureSolc();
  const realmArt = compileSol(solcPath, "RealmToken.sol");
  const landArt = compileSol(solcPath, "LandNFT.sol");
  const marketArt = compileSol(solcPath, "ItemMarketplace.sol");

  const realmFactory = new ContractFactory(realmArt.abi, realmArt.bytecode, wallet);
  const realm = await realmFactory.deploy();
  await realm.waitForDeployment();
  const realmAddr = await realm.getAddress();
  console.log(`RealmToken ${realmAddr}`);

  const landFactory = new ContractFactory(landArt.abi, landArt.bytecode, wallet);
  const land = await landFactory.deploy(realmAddr);
  await land.waitForDeployment();
  const landAddr = await land.getAddress();
  console.log(`LandNFT ${landAddr}`);

  const marketFactory = new ContractFactory(
    marketArt.abi,
    marketArt.bytecode,
    wallet,
  );
  const market = await marketFactory.deploy(realmAddr);
  await market.waitForDeployment();
  const marketAddr = await market.getAddress();
  console.log(`ItemMarketplace ${marketAddr}`);

  upsertEnv({
    CREDITCOIN_REALM_TOKEN: realmAddr,
    CREDITCOIN_LAND_NFT: landAddr,
    CREDITCOIN_MARKETPLACE: marketAddr,
    CREDITCOIN_DEPLOY_KEY: key,
    CREDITCOIN_WORKER_KEY: process.env.CREDITCOIN_WORKER_KEY ?? key,
  });

  fs.mkdirSync(path.dirname(DEPLOYMENT_PATH), { recursive: true });
  fs.writeFileSync(
    DEPLOYMENT_PATH,
    `${JSON.stringify(
      {
        chainId: CHAIN_ID,
        rpcUrl: RPC_URL,
        explorer: EXPLORER,
        deployer: wallet.address,
        contracts: {
          RealmToken: realmAddr,
          LandNFT: landAddr,
          ItemMarketplace: marketAddr,
        },
        deployedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("");
  console.log("Deployed. Explorer:");
  console.log(`  ${EXPLORER}/address/${realmAddr}`);
  console.log(`  ${EXPLORER}/address/${landAddr}`);
  console.log(`  ${EXPLORER}/address/${marketAddr}`);
  console.log("Addresses written to .env (gitignored) and contracts/deployments/.");
  console.log("Restart npm run dev so the server loads the new env.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
