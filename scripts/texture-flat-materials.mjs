/**
 * One-shot: swap opaque meshStandardMaterial → TexturedStandardMaterial
 * with a guessed surface kind. Skips transparent / haze / cue overlays.
 *
 * Usage: node scripts/texture-flat-materials.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("apps/web/components/land-scene");
const FILES = [
  "BuildingMesh.tsx",
  "CityEnvironment.tsx",
  "HomesteadEnvironment.tsx",
  "ForestEnvironment.tsx",
  "WarriorEnvironment.tsx",
  "ResourceMeshes.tsx",
  "RemotePlayerAvatar.tsx",
];

const IMPORT_LINE =
  'import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";';

/**
 * Guesses a procedural surface kind from nearby JSX context.
 *
 * @param {string} before - Text preceding the material tag.
 * @param {string} attrs - Material attribute block.
 * @returns {string} SurfaceTextureKind.
 */
function guessKind(before, attrs) {
  const ctx = `${before.slice(-500)}\n${attrs}`.toLowerCase();
  if (/transparent|opacity|haze|mist|atmosphere|halo|padcolor|flash|splash|shadow|ring/.test(ctx) &&
      /transparent/.test(attrs)) {
    return null;
  }
  if (/transparent/.test(attrs)) return null;
  if (/metalness=\{[^}]*0\.[3-9]|anvil|ferrule|latch|iron|steel|toolhead|wheel/.test(ctx))
    return "metal";
  if (/bark|trunk|root|tree/.test(ctx)) return "bark";
  if (/canopy|foliage|leaf|grass|meadow|hay/.test(ctx)) return "grass";
  if (/thatch|roof|straw|hat(?!band)/.test(ctx)) return "thatch";
  if (/cloth|cloak|banner|shirt|pants|vest|robe|weave|loom/.test(ctx)) return "cloth";
  if (/leather|boot|belt|cuff/.test(ctx)) return "leather";
  if (/cobble|plaza/.test(ctx)) return "cobble";
  if (/dirt|soil|path|plot|scarce|yard|mud|earth/.test(ctx)) return "dirt";
  if (/wood|plank|timber|door|band|crate|barrel|post|sill|eave|shed|dock|fence|board|frame|lintel|post/.test(ctx))
    return "wood";
  if (/brick|forge|stone|ore|tower|base|curb|pad|civic|fountain|mill|rock|rubble/.test(ctx))
    return "stone";
  if (/skin|plaster|wall|window|skin/.test(ctx)) return "plaster";
  // Reason: default subtle grain beats flat fills on leftover kit parts.
  return "plaster";
}

/**
 * Ensures TexturedStandardMaterial import exists once.
 *
 * @param {string} src
 * @returns {string}
 */
function ensureImport(src) {
  if (src.includes("TexturedStandardMaterial")) return src;
  if (src.includes('from "@/components/land-scene/GltfOrKit"')) {
    return src.replace(
      /import \{ GltfOrKit[^;]*;/,
      (m) => `${m}\n${IMPORT_LINE}`,
    );
  }
  if (src.includes('from "@/components/land-scene/')) {
    return src.replace(
      /(import \{[^}]+\} from "@\/components\/land-scene\/[^"]+";\n)/,
      (m) => `${m}${IMPORT_LINE}\n`,
    );
  }
  // After first import block from @game/shared or react
  const idx = src.indexOf("\nimport ");
  if (idx === -1) return `${IMPORT_LINE}\n${src}`;
  const second = src.indexOf("\nimport ", idx + 1);
  const at = second === -1 ? idx : second;
  return `${src.slice(0, at + 1)}${IMPORT_LINE}\n${src.slice(at + 1)}`;
}

/**
 * Transforms one source file.
 *
 * @param {string} src
 * @returns {{ src: string, count: number }}
 */
function transform(src) {
  let count = 0;
  let out = "";
  let i = 0;
  const tag = "<meshStandardMaterial";
  while (i < src.length) {
    const start = src.indexOf(tag, i);
    if (start === -1) {
      out += src.slice(i);
      break;
    }
    out += src.slice(i, start);
    // Already TexturedStandardMaterial? shouldn't match
    const selfClose = src.indexOf("/>", start);
    const openClose = src.indexOf(">", start);
    if (selfClose === -1) {
      out += src.slice(start);
      break;
    }
    // Prefer self-closing materials (all ours are)
    const end = selfClose + 2;
    // If there's a `>` before `/>` that opens children, skip complex cases
    if (openClose !== -1 && openClose < selfClose && src[openClose - 1] !== "/") {
      // Has children — leave alone
      out += src.slice(start, end);
      i = end;
      continue;
    }
    const block = src.slice(start, end);
    const attrs = block.slice(tag.length, -2);
    // Skip if already has kind= (shouldn't)
    if (/\bkind=/.test(attrs)) {
      out += block;
      i = end;
      continue;
    }
    const before = src.slice(Math.max(0, start - 400), start);
    const kind = guessKind(before, attrs);
    if (!kind) {
      out += block;
      i = end;
      continue;
    }
    // Avoid double-wrapping TexturedStandardMaterial's inner meshStandardMaterial
    if (/TexturedStandardMaterial/.test(before.slice(-80))) {
      out += block;
      i = end;
      continue;
    }
    const trimmed = attrs.replace(/^\s+/, " ").replace(/\s+$/, " ");
    out += `<TexturedStandardMaterial kind="${kind}"${trimmed}/>`;
    count += 1;
    i = end;
  }
  out = ensureImport(out);
  return { src: out, count };
}

let total = 0;
for (const file of FILES) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    console.warn("missing", file);
    continue;
  }
  const raw = fs.readFileSync(full, "utf8");
  const { src, count } = transform(raw);
  if (count > 0) {
    fs.writeFileSync(full, src);
    console.log(`${file}: ${count} materials textured`);
    total += count;
  } else {
    console.log(`${file}: 0 changes`);
  }
}
console.log(`total: ${total}`);
