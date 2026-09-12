/**
 * Copy niko-3d-models Low Poly Village FBX into the web client.
 *
 * Usage:
 *   node scripts/setup-niko-village.mjs
 *   node scripts/setup-niko-village.mjs "C:\path\to\low poly village assets bundle by niko.fbx"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST_DIR = path.join(ROOT, "apps", "web", "public", "models", "niko-village");
const DEST = path.join(DEST_DIR, "village.fbx");
const DEFAULT_SRC = path.join(
  process.env.USERPROFILE ?? "",
  "Downloads",
  "assets",
  "low poly village assets bundle by niko.fbx",
);

/**
 * Resolve the source FBX path.
 *
 * @param input - CLI path or default Downloads location.
 * @returns Absolute FBX path.
 */
function resolveSource(input) {
  const direct = path.resolve(input);
  if (fs.existsSync(direct) && direct.toLowerCase().endsWith(".fbx")) return direct;
  throw new Error(`Could not find Niko village FBX at ${direct}`);
}

const srcArg = process.argv[2] ?? DEFAULT_SRC;
const source = resolveSource(srcArg);
fs.mkdirSync(DEST_DIR, { recursive: true });
fs.copyFileSync(source, DEST);
console.log(`copied ${path.basename(source)} → ${path.relative(ROOT, DEST)}`);

const attribution = `# Low Poly Village Assets Bundle

Models under this folder are from
[low poly village assets bundle](https://niko-3d-models.itch.io/low-poly-village-assets)
by niko-3d-models.

Name-your-own-price itch.io pack. Use in this project; do not redistribute
the raw FBX. Five houses + trees/rocks/fence live as named meshes in one scene.
`;
fs.writeFileSync(path.join(DEST_DIR, "ATTRIBUTION.md"), attribution);
console.log("wrote ATTRIBUTION.md");
