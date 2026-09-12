/**
 * Copy KayKit Adventurers character GLBs into the web client.
 *
 * 1. Download "Free 2.0" from https://kaylousberg.itch.io/kaykit-adventurers
 * 2. Unzip and pass the folder that contains `Characters/gltf/*.glb`
 *
 * Usage:
 *   node scripts/setup-kaykit-avatars.mjs "C:\Downloads\KayKit_Adventurers\Characters\gltf"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST = path.join(ROOT, "apps", "web", "public", "models", "kaykit");
const FILES = [
  "Barbarian.glb",
  "Rogue.glb",
  "Rogue_Hooded.glb",
  "Mage.glb",
  "Knight.glb",
];

function resolveSourceDir(input) {
  const direct = path.resolve(input);
  if (fs.existsSync(path.join(direct, "Rogue_Hooded.glb"))) return direct;
  const nested = path.join(direct, "Characters", "gltf");
  if (fs.existsSync(path.join(nested, "Rogue_Hooded.glb"))) return nested;
  throw new Error(
    `Could not find KayKit GLBs under ${direct} or ${nested}. Unzip the itch.io Free 2.0 pack first.`,
  );
}

const srcArg = process.argv[2];
if (!srcArg) {
  console.error(
    "Usage: node scripts/setup-kaykit-avatars.mjs <path-to-kaykit-gltf-folder>",
  );
  process.exit(1);
}

const source = resolveSourceDir(srcArg);
fs.mkdirSync(DEST, { recursive: true });

let copied = 0;
for (const file of FILES) {
  const from = path.join(source, file);
  if (!fs.existsSync(from)) {
    console.warn(`skip (missing): ${file}`);
    continue;
  }
  fs.copyFileSync(from, path.join(DEST, file));
  copied += 1;
  console.log(`copied ${file}`);
}

const attribution = `# KayKit Character Pack : Adventurers

Models under this folder are from
[KayKit Adventurers](https://kaylousberg.itch.io/kaykit-adventurers)
by Kay Lousberg (CC0 1.0).

Same pack used in chessnoth-3d battle units.
`;
fs.writeFileSync(path.join(DEST, "ATTRIBUTION.md"), attribution, "utf8");

console.log(`\nDone — ${copied}/${FILES.length} GLBs in ${DEST}`);
if (copied === 0) process.exit(1);
