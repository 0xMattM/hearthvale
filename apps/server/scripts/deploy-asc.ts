/**
 * Deploys EvmV1Decoder library + RealmMinterASC to Creditcoin Testnet.
 *
 * Prerequisites:
 *   - CREDITCOIN_REALM_TOKEN set (from chain:deploy)
 *   - SEPOLIA_NOTARY set (from chain:deploy:sepolia)
 *
 * Usage (repo root): npm run chain:deploy:asc
 *   --force  redeploy even if CREDITCOIN_ASC is already set
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Contract,
  ContractFactory,
  JsonRpcProvider,
  Wallet,
  formatEther,
} from "ethers";
import { uscContractsRemapBase } from "./usc-contracts-remap.js";

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
// solc helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Multi-source compile with library linking
// ---------------------------------------------------------------------------

interface CompileResult {
  /** Per-contract artifacts keyed by "SourceFile.sol:ContractName" */
  artifacts: Record<
    string,
    {
      abi: unknown[];
      bytecode: string;
      linkReferences: Record<
        string,
        Record<string, Array<{ start: number; length: number }>>
      >;
    }
  >;
}

/**
 * Resolves the path to the EvmV1Decoder.sol source file.
 *
 * Checks common locations where @gluwa/usc-contracts may live, including
 * inside @gluwa/usc-sdk which sometimes bundles the contracts.
 */
function findEvmV1Decoder(): string | null {
  const candidates = [
    // Direct install of @gluwa/usc-contracts
    path.join(REPO_ROOT, "node_modules/@gluwa/usc-contracts/contracts/decoding/EvmV1Decoder.sol"),
    path.join(REPO_ROOT, "node_modules/@gluwa/usc-contracts/decoding/EvmV1Decoder.sol"),
    // Hoisted inside apps/server
    path.join(SCRIPT_DIR, "../node_modules/@gluwa/usc-contracts/contracts/decoding/EvmV1Decoder.sol"),
    path.join(SCRIPT_DIR, "../node_modules/@gluwa/usc-contracts/decoding/EvmV1Decoder.sol"),
    // Bundled within usc-sdk
    path.join(REPO_ROOT, "node_modules/@gluwa/usc-sdk/contracts/decoding/EvmV1Decoder.sol"),
    path.join(SCRIPT_DIR, "../node_modules/@gluwa/usc-sdk/contracts/decoding/EvmV1Decoder.sol"),
    path.join(REPO_ROOT, "node_modules/@gluwa/usc-sdk/node_modules/@gluwa/usc-contracts/contracts/decoding/EvmV1Decoder.sol"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Compiles RealmMinterASC and its dependencies using solc --standard-json
 * with import remapping for @gluwa/usc-contracts.
 */
function compileASC(solcPath: string, evmDecoderPath: string): CompileResult {
  // Reason: official @gluwa/usc-contracts layout is contracts/decoding/*.sol.
  // Forge remapping is @gluwa/usc-contracts/=.../contracts/ (not the package root).
  const uscContractsBase = uscContractsRemapBase(evmDecoderPath);

  const sourceFiles: Record<string, string> = {
    "VerifierInterface.sol": "VerifierInterface.sol",
    "ASCBase.sol": "ASCBase.sol",
    "RealmMinterASC.sol": "RealmMinterASC.sol",
  };

  const sources: Record<string, { content: string }> = {};
  for (const [key, fileName] of Object.entries(sourceFiles)) {
    sources[key] = {
      content: fs.readFileSync(path.join(CONTRACTS_DIR, fileName), "utf8"),
    };
  }

  // Add the EvmV1Decoder source under its import path
  const decoderImportPath = "@gluwa/usc-contracts/decoding/EvmV1Decoder.sol";
  sources[decoderImportPath] = {
    content: fs.readFileSync(evmDecoderPath, "utf8"),
  };

  // Reason: EvmV1Decoder may import other files from usc-contracts.
  // We add an import remapping so solc can find them.
  const remappings = [
    `@gluwa/usc-contracts/=${uscContractsBase}/`,
  ];

  const input = {
    language: "Solidity",
    sources,
    settings: {
      remappings,
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
      outputSelection: {
        "*": {
          "*": [
            "abi",
            "evm.bytecode.object",
            "evm.bytecode.linkReferences",
          ],
        },
      },
    },
  };

  // Reason: remapping points at node_modules; solc cwd is contracts/ and
  // otherwise rejects the decoder as "File outside of allowed directories".
  const allowPaths = [CONTRACTS_DIR, uscContractsBase]
    .map((p) => p.replace(/\\/g, "/"))
    .join(",");
  const ran = spawnSync(solcPath, ["--allow-paths", allowPaths, "--standard-json"], {
    input: JSON.stringify(input),
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
    cwd: CONTRACTS_DIR,
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
        {
          abi: unknown[];
          evm: {
            bytecode: {
              object: string;
              linkReferences: Record<
                string,
                Record<string, Array<{ start: number; length: number }>>
              >;
            };
          };
        }
      >
    >;
  };

  const errors = (output.errors ?? []).filter((e) => e.severity === "error");
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.formattedMessage).join("\n"));
  }

  const artifacts: CompileResult["artifacts"] = {};
  for (const [sourceFile, contracts] of Object.entries(
    output.contracts ?? {},
  )) {
    for (const [name, art] of Object.entries(contracts)) {
      if (!art.evm?.bytecode?.object) continue;
      const obj = art.evm.bytecode.object;
      artifacts[`${sourceFile}:${name}`] = {
        abi: art.abi,
        bytecode: obj.startsWith("0x") ? obj : `0x${obj}`,
        linkReferences: art.evm.bytecode.linkReferences ?? {},
      };
    }
  }

  return { artifacts };
}

/**
 * Links library addresses into bytecode that contains __$...$__ placeholders.
 *
 * Follows the standard solc link-reference mechanism: each reference specifies
 * a byte offset and length (always 20) where the library address should be
 * inserted in the hex-encoded bytecode string.
 */
function linkBytecode(
  bytecode: string,
  libraries: Record<string, Record<string, string>>,
): string {
  let linked = bytecode.startsWith("0x") ? bytecode.slice(2) : bytecode;
  for (const [sourceFile, libs] of Object.entries(libraries)) {
    for (const [libName, address] of Object.entries(libs)) {
      // Reason: solc uses a keccak-based placeholder, but we can also just
      // replace by scanning linkReferences. As a safety net, replace the
      // __$<hash>$__ placeholders directly too.
      const addr = address.toLowerCase().replace("0x", "");
      const placeholder = `__\\$[0-9a-fA-F]{34}\\$__`;
      linked = linked.replace(new RegExp(placeholder, "g"), addr);
    }
  }
  return `0x${linked}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  loadEnvFile();

  const force = process.argv.includes("--force");

  // --- prerequisites ---
  const realmToken = process.env.CREDITCOIN_REALM_TOKEN;
  if (!realmToken) {
    console.error(
      "CREDITCOIN_REALM_TOKEN not set. Run chain:deploy first.",
    );
    process.exit(1);
  }
  const sepoliaNotary = process.env.SEPOLIA_NOTARY;
  if (!sepoliaNotary) {
    console.error(
      "SEPOLIA_NOTARY not set. Run chain:deploy:sepolia first.",
    );
    process.exit(1);
  }

  const key = process.env.CREDITCOIN_DEPLOY_KEY;
  if (!key) {
    console.error(
      "CREDITCOIN_DEPLOY_KEY not set. Run chain:deploy first.",
    );
    process.exit(1);
  }

  // --- skip check ---
  const provider = new JsonRpcProvider(RPC_URL, CHAIN_ID, {
    staticNetwork: true,
  });
  const wallet = new Wallet(key, provider);

  const existingASC = process.env.CREDITCOIN_ASC;
  if (existingASC && !force) {
    const code = await provider.getCode(existingASC);
    if (code && code !== "0x") {
      console.log(
        `RealmMinterASC already live at ${existingASC}. Pass --force to redeploy.`,
      );
      return;
    }
  }

  // --- balance check ---
  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer ${wallet.address}`);
  console.log(`Balance  ${formatEther(balance)} tCTC`);
  if (balance === 0n) {
    console.log("No tCTC. Fund the deployer first (see chain:deploy).");
    process.exitCode = 2;
    return;
  }

  // --- find EvmV1Decoder source ---
  const evmDecoderPath = findEvmV1Decoder();
  if (!evmDecoderPath) {
    console.error("");
    console.error("Could not find EvmV1Decoder.sol.");
    console.error(
      "Install the Gluwa USC contracts package:",
    );
    console.error("  npm install @gluwa/usc-contracts");
    console.error("");
    console.error(
      "The file is expected at node_modules/@gluwa/usc-contracts/contracts/decoding/EvmV1Decoder.sol",
    );
    process.exit(1);
  }
  console.log(`Found EvmV1Decoder at ${evmDecoderPath}`);

  // --- compile ---
  console.log("Compiling ASCBase, VerifierInterface, RealmMinterASC…");
  const solcPath = await ensureSolc();
  const { artifacts } = compileASC(solcPath, evmDecoderPath);

  // Locate artifacts by contract name suffix
  const findArtifact = (name: string) => {
    const key = Object.keys(artifacts).find((k) => k.endsWith(`:${name}`));
    if (!key) throw new Error(`No artifact found for ${name}`);
    return artifacts[key];
  };

  const decoderArt = findArtifact("EvmV1Decoder");
  const ascArt = findArtifact("RealmMinterASC");

  // --- deploy EvmV1Decoder library ---
  console.log("Deploying EvmV1Decoder library…");
  const decoderFactory = new ContractFactory(
    decoderArt.abi,
    decoderArt.bytecode,
    wallet,
  );
  const decoder = await decoderFactory.deploy();
  await decoder.waitForDeployment();
  const decoderAddr = await decoder.getAddress();
  console.log(`EvmV1Decoder ${decoderAddr}`);

  // --- link & deploy RealmMinterASC ---
  console.log("Deploying RealmMinterASC…");

  // Reason: Build the libraries map for linking. The linkReferences tell us
  // which source file and library name the placeholder belongs to.
  const librariesMap: Record<string, Record<string, string>> = {};
  for (const [sourceFile, libs] of Object.entries(ascArt.linkReferences)) {
    librariesMap[sourceFile] = {};
    for (const libName of Object.keys(libs)) {
      librariesMap[sourceFile][libName] = decoderAddr;
    }
  }

  const linkedBytecode = linkBytecode(ascArt.bytecode, librariesMap);

  const ascFactory = new ContractFactory(ascArt.abi, linkedBytecode, wallet);
  const asc = await ascFactory.deploy(realmToken, sepoliaNotary);
  await asc.waitForDeployment();
  const ascAddr = await asc.getAddress();
  console.log(`RealmMinterASC ${ascAddr}`);

  // --- grant minter role ---
  console.log("Granting minter role to ASC on RealmToken…");
  const realmContract = new Contract(
    realmToken,
    ["function setMinter(address minter, bool allowed) external"],
    wallet,
  );
  const tx = await realmContract.setMinter(ascAddr, true);
  await tx.wait();
  console.log(`setMinter tx ${tx.hash}`);

  // --- persist ---
  upsertEnv({ CREDITCOIN_ASC: ascAddr });

  // Update the existing creditcoin-testnet.json deployment file
  let deploymentData: Record<string, unknown> = {};
  if (fs.existsSync(DEPLOYMENT_PATH)) {
    deploymentData = JSON.parse(
      fs.readFileSync(DEPLOYMENT_PATH, "utf8"),
    ) as Record<string, unknown>;
  }
  const contracts = (deploymentData.contracts ?? {}) as Record<string, string>;
  contracts.EvmV1Decoder = decoderAddr;
  contracts.RealmMinterASC = ascAddr;
  deploymentData.contracts = contracts;
  deploymentData.lastUpdated = new Date().toISOString();

  fs.mkdirSync(path.dirname(DEPLOYMENT_PATH), { recursive: true });
  fs.writeFileSync(
    DEPLOYMENT_PATH,
    `${JSON.stringify(deploymentData, null, 2)}\n`,
    "utf8",
  );

  console.log("");
  console.log("Deployed. Explorer:");
  console.log(`  ${EXPLORER}/address/${decoderAddr}`);
  console.log(`  ${EXPLORER}/address/${ascAddr}`);
  console.log(
    "Addresses written to .env and contracts/deployments/creditcoin-testnet.json",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
