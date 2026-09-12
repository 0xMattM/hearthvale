/**
 * Copy YumeForge Free Japan Village GLTFs into the web client.
 *
 * 1. Download Free_JapanVillage from https://yumeforge.itch.io/japanese-rural-village
 * 2. Unzip and pass the folder that contains `FreePack/GLTF/*.gltf`
 *
 * Usage:
 *   node scripts/setup-japan-village.mjs "C:\path\to\Free_JapanVillage"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST = path.join(ROOT, "apps", "web", "public", "models", "japan-village");
const FILES = [
  "Tree_RedPlum",
  "Fence_Wood",
  "ToriGate",
  "StoneLantern",
  "Barrel",
  "WoodenCrate_S",
  "Chair",
  "CeremicPot",
  "RiceBin",
];

function resolveSourceDir(input) {
  const direct = path.resolve(input);
  if (fs.existsSync(path.join(direct, "Tree_RedPlum.gltf"))) return direct;
  const nested = path.join(direct, "FreePack", "GLTF");
  if (fs.existsSync(path.join(nested, "Tree_RedPlum.gltf"))) return nested;
  throw new Error(
    `Could not find Japan Village GLTFs under ${direct} or ${nested}. Unzip Free_JapanVillage first.`,
  );
}

const srcArg = process.argv[2];
if (!srcArg) {
  console.error(
    "Usage: node scripts/setup-japan-village.mjs <path-to-Free_JapanVillage>",
  );
  process.exit(1);
}

const source = resolveSourceDir(srcArg);
fs.mkdirSync(path.join(DEST, "textures"), { recursive: true });

let copied = 0;
for (const stem of FILES) {
  for (const ext of [".gltf", ".bin"]) {
    const file = `${stem}${ext}`;
    const from = path.join(source, file);
    if (!fs.existsSync(from)) {
      console.warn(`skip (missing): ${file}`);
      continue;
    }
    fs.copyFileSync(from, path.join(DEST, file));
    copied += 1;
    console.log(`copied ${file}`);
  }
}

const atlasFrom = path.join(source, "textures", "ColorAtlas.png");
if (fs.existsSync(atlasFrom)) {
  fs.copyFileSync(atlasFrom, path.join(DEST, "textures", "ColorAtlas.png"));
  copied += 1;
  console.log("copied textures/ColorAtlas.png");
} else {
  console.warn("skip (missing): textures/ColorAtlas.png");
}

const attribution = `# Japanese Rural Village (Free pack)

Models under this folder are from
[Japanese Rural Village](https://yumeforge.itch.io/japanese-rural-village)
by YumeForge.

License (itch.io): personal and commercial use; modify for the project.
Do not resell or redistribute the raw assets, and do not include them in
other asset packs.
`;
fs.writeFileSync(path.join(DEST, "ATTRIBUTION.md"), attribution, "utf8");

console.log(`\nDone — ${copied} files in ${DEST}`);
if (copied === 0) process.exit(1);
