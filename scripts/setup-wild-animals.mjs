/**
 * Copy CraftPix Free Wild Animal FBX + atlas into the web client.
 *
 * Usage:
 *   npm run setup:wild-animals -- "C:\path\to\Free Wild Animal 3D Models"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST = path.join(ROOT, "apps", "web", "public", "models", "wild-animals");
const FILES = [
  "bear.fbx",
  "boar.fbx",
  "deer_1.fbx",
  "deer_2.fbx",
  "fox.fbx",
  "hedhog.fbx",
  "owl.fbx",
  "rabbit.fbx",
  "squirrel.fbx",
  "wolf.fbx",
];

/**
 * Finds the Unity FBX folder under a CraftPix unzip.
 *
 * @param input - Pack root or fbx/unity folder.
 */
function resolveUnityDir(input) {
  const direct = path.resolve(input);
  if (fs.existsSync(path.join(direct, "rabbit.fbx"))) return direct;
  const nested = path.join(direct, "fbx", "unity");
  if (fs.existsSync(path.join(nested, "rabbit.fbx"))) return nested;
  throw new Error(
    `Could not find rabbit.fbx under ${direct} or ${nested}. Unzip Free Wild Animal 3D Models first.`,
  );
}

/**
 * Atlas next to the FBX folder (`../texture/wild_animals_map.png`).
 *
 * @param unityDir - fbx/unity path.
 */
function resolveTexture(unityDir) {
  const packRoot = path.resolve(unityDir, "..", "..");
  const atlas = path.join(packRoot, "texture", "wild_animals_map.png");
  if (fs.existsSync(atlas)) return atlas;
  throw new Error(`Missing texture: ${atlas}`);
}

const srcArg = process.argv[2];
if (!srcArg) {
  console.error(
    "Usage: node scripts/setup-wild-animals.mjs <path-to-Free Wild Animal 3D Models>",
  );
  process.exit(1);
}

const unityDir = resolveUnityDir(srcArg);
const atlasFrom = resolveTexture(unityDir);
fs.mkdirSync(DEST, { recursive: true });

let copied = 0;
for (const file of FILES) {
  const from = path.join(unityDir, file);
  if (!fs.existsSync(from)) {
    console.warn(`skip (missing): ${file}`);
    continue;
  }
  fs.copyFileSync(from, path.join(DEST, file));
  copied += 1;
  console.log(`copied ${file}`);
}

fs.copyFileSync(atlasFrom, path.join(DEST, "wild_animals_map.png"));
copied += 1;
console.log("copied wild_animals_map.png");

const attribution = `# Free Wild Animal 3D Models

Meshes under this folder are from
[Free Wild Animal 3D Models](https://craftpix.net/freebies/free-wild-animal-3d-models/)
by CraftPix.

License: see CraftPix file licenses (https://craftpix.net/file-licenses/).
Do not resell or redistribute the raw pack.
`;
fs.writeFileSync(path.join(DEST, "ATTRIBUTION.md"), attribution);
console.log(`done (${copied} files → ${DEST})`);
