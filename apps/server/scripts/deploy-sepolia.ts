/**
 * Compiles CoinBurnNotary.sol and deploys it to Ethereum Sepolia.
 *
 * Usage (repo root): npm run chain:deploy:sepolia
 *   --force  redeploy even if SEPOLIA_NOTARY is already set
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
  "sepolia.json",
);
const CHAIN_ID = 11155111;
const EXPLORER = "https://sepolia.etherscan.io";
const FAUCET_URL =
  "https://cloud.google.com/application/web3/faucet/ethereum/sepolia";

// ---------------------------------------------------------------------------
// .env helpers (mirrors deploy-creditcoin.ts)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// solc helpers (reuses the same cached binary as deploy-creditcoin.ts)
// ---------------------------------------------------------------------------

interface CompiledContract {
  abi: unknown[];
  bytecode: string;
}

/**
 * Returns the platform-specific solc 0.8.23 download URL and file name.
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
 * Compiles a single Solidity file with no imports via solc --standard-json.
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  loadEnvFile();

  const rpcUrl =
    process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
  const force = process.argv.includes("--force");

  // --- key ---
  // Reason: reuse the Creditcoin deployer so there is one address to faucet.
  let key =
    process.env.SEPOLIA_RELAYER_KEY ?? process.env.CREDITCOIN_DEPLOY_KEY;
  if (!key) {
    const w = Wallet.createRandom();
    key = w.privateKey;
    console.log(`Generated Sepolia relayer wallet ${w.address}`);
  }

  const provider = new JsonRpcProvider(rpcUrl, CHAIN_ID, {
    staticNetwork: true,
  });
  const wallet = new Wallet(key, provider);

  upsertEnv({
    SEPOLIA_RPC_URL: rpcUrl,
    SEPOLIA_RELAYER_KEY: key,
  });
  loadEnvFile();

  // --- skip check ---
  const existingNotary = process.env.SEPOLIA_NOTARY;
  if (existingNotary && !force) {
    const code = await provider.getCode(existingNotary);
    if (code && code !== "0x") {
      console.log(
        `CoinBurnNotary already live at ${existingNotary}. Pass --force to redeploy.`,
      );
      return;
    }
  }

  // --- balance ---
  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer ${wallet.address}`);
  console.log(`Balance  ${formatEther(balance)} Sepolia ETH`);
  if (balance === 0n) {
    console.log("");
    console.log("No Sepolia ETH. Get some from the Google faucet:");
    console.log(`  ${FAUCET_URL}`);
    console.log(`  Paste address: ${wallet.address}`);
    console.log("");
    console.log("Then re-run: npm run chain:deploy:sepolia");
    process.exitCode = 2;
    return;
  }

  // --- compile & deploy ---
  console.log("Compiling CoinBurnNotary…");
  const solcPath = await ensureSolc();
  const art = compileSol(solcPath, "CoinBurnNotary.sol");

  const factory = new ContractFactory(art.abi, art.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log(`CoinBurnNotary ${addr}`);

  // --- persist ---
  upsertEnv({ SEPOLIA_NOTARY: addr });

  fs.mkdirSync(path.dirname(DEPLOYMENT_PATH), { recursive: true });
  fs.writeFileSync(
    DEPLOYMENT_PATH,
    `${JSON.stringify(
      {
        chainId: CHAIN_ID,
        rpcUrl,
        explorer: EXPLORER,
        deployer: wallet.address,
        contracts: {
          CoinBurnNotary: addr,
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
  console.log(`  ${EXPLORER}/address/${addr}`);
  console.log("Address written to .env and contracts/deployments/sepolia.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
