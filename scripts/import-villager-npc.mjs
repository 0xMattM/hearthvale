/**
 * Import Villager NPC Free FBX characters → GLB for the web client.
 *
 * Usage:
 *   node scripts/import-villager-npc.mjs
 *   node scripts/import-villager-npc.mjs "C:\path\to\Villager NPC Free"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

globalThis.FileReader = class FileReader {
  result = null;
  onloadend = null;
  onerror = null;
  readAsArrayBuffer(blob) {
    Promise.resolve(blob.arrayBuffer())
      .then((buf) => {
        this.result = buf;
        this.onloadend?.({ target: this });
      })
      .catch((err) => this.onerror?.(err));
  }
};

globalThis.ImageData = class ImageData {
  constructor(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
};

/** Minimal DOM stub so FBXLoader + GLTFExporter run in Node. */
globalThis.document = {
  createElement(tag) {
    if (tag !== "canvas") return {};
    const canvas = {
      width: 256,
      height: 256,
      getContext() {
        return ctx;
      },
      convertToBlob({ type = "image/png" } = {}) {
        const img = ctx._img;
        const width = img?.width ?? canvas.width;
        const height = img?.height ?? canvas.height;
        const data = img?.data ?? new Uint8Array(width * height * 4);
        const png = PNG.sync.write({ width, height, data: Buffer.from(data) });
        return Promise.resolve(new Blob([png], { type }));
      },
    };
    const ctx = {
      _img: null,
      drawImage(img) {
        this._img = img;
        canvas.width = img.width ?? canvas.width;
        canvas.height = img.height ?? canvas.height;
      },
      putImageData(img) {
        this._img = img;
        canvas.width = img.width ?? canvas.width;
        canvas.height = img.height ?? canvas.height;
      },
      getImageData(_x, _y, w, h) {
        const data =
          this._img?.data ??
          new Uint8ClampedArray(Math.max(1, w) * Math.max(1, h) * 4);
        return { data, width: w, height: h };
      },
      translate() {},
      scale() {},
    };
    return canvas;
  },
  createElementNS(_ns, name) {
    if (name !== "img") return {};
    return {
      onload: null,
      onerror: null,
      _loadFn: null,
      addEventListener(type, fn) {
        if (type === "load") this._loadFn = fn;
      },
      removeEventListener(type) {
        if (type === "load") this._loadFn = null;
      },
      set src(value) {
        try {
          const filePath = decodeURI(String(value).replace(/^file:\/\//, ""));
          const png = PNG.sync.read(fs.readFileSync(filePath));
          this.width = png.width;
          this.height = png.height;
          this.data = png.data;
          this.onload?.();
          this._loadFn?.({ target: this });
        } catch (err) {
          this.onerror?.(err);
        }
      },
    };
  },
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_SRC = path.join(
  process.env.USERPROFILE ?? "",
  "Downloads",
  "assets",
  "Villager NPC Free",
  "Villager NPC Free",
);
const DEST = path.join(ROOT, "apps", "web", "public", "models", "villager");
const CHARACTERS = ["Hunter", "Blacksmith", "Child"];
const TARGET_HEIGHT = 1.65;

function resolvePackRoot(input) {
  const direct = path.resolve(input ?? DEFAULT_SRC);
  if (fs.existsSync(path.join(direct, "FBX", "Characters", "Hunter.fbx"))) {
    return direct;
  }
  const nested = path.join(direct, "Villager NPC Free");
  if (fs.existsSync(path.join(nested, "FBX", "Characters", "Hunter.fbx"))) {
    return nested;
  }
  throw new Error(
    `Villager NPC Free not found at ${direct}. Pass the unzipped folder path.`,
  );
}

function loadTexture(filePath) {
  const png = PNG.sync.read(fs.readFileSync(filePath));
  const atlas = new THREE.DataTexture(
    new Uint8Array(png.data),
    png.width,
    png.height,
    THREE.RGBAFormat,
  );
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.flipY = false;
  atlas.needsUpdate = true;
  return atlas;
}

function loadFbx(filePath) {
  const loader = new FBXLoader();
  const buf = fs.readFileSync(filePath);
  const arrayBuffer = buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  );
  return loader.parse(arrayBuffer, path.dirname(filePath));
}

function stageTexturePaths(packRoot, fbxDir) {
  const texturePath = path.join(packRoot, "Texture", "Villagers_Texture.png");
  const copies = [
    path.join(fbxDir, "Villagers_Texture.png"),
    path.join(path.dirname(fbxDir), "CharactersVillagers_Texture.png"),
  ];
  for (const dest of copies) {
    fs.copyFileSync(texturePath, dest);
  }
}

function fixMaterials(root, atlas) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.material = new THREE.MeshStandardMaterial({
      map: atlas,
      color: 0xffffff,
      roughness: 0.86,
      metalness: 0.02,
    });
    obj.castShadow = true;
    obj.receiveShadow = true;
  });
}

/**
 * Rebind skin matrices to the authored FBX pose so GLB joints match the mesh.
 */
function rebindSkeletonToCurrentPose(root) {
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!obj.isSkinnedMesh || !obj.skeleton) return;
    const { bones, boneInverses } = obj.skeleton;
    for (let i = 0; i < bones.length; i++) {
      bones[i].updateMatrixWorld(true);
      boneInverses[i].copy(bones[i].matrixWorld).invert();
    }
    obj.skeleton.update();
  });
}

function fitToHeight(root, targetHeight) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.y, 0.001);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const fitted = new THREE.Box3().setFromObject(root);
  return {
    scale,
    yOffset: -fitted.min.y,
    height: fitted.max.y - fitted.min.y,
  };
}

function exportGlb(root) {
  return new Promise((resolve, reject) => {
    new GLTFExporter().parse(
      root,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(Buffer.from(result));
          return;
        }
        reject(new Error("Expected binary GLB export"));
      },
      reject,
      { binary: true },
    );
  });
}

const packRoot = resolvePackRoot(process.argv[2]);
const texturePath = path.join(packRoot, "Texture", "Villagers_Texture.png");
const fbxDir = path.join(packRoot, "FBX", "Characters");

if (!fs.existsSync(texturePath)) {
  throw new Error(`Missing texture: ${texturePath}`);
}

fs.mkdirSync(DEST, { recursive: true });
fs.copyFileSync(texturePath, path.join(DEST, "Villagers_Texture.png"));
stageTexturePaths(packRoot, fbxDir);
const atlas = loadTexture(texturePath);

const layout = {};

for (const name of CHARACTERS) {
  const fbxPath = path.join(fbxDir, `${name}.fbx`);
  if (!fs.existsSync(fbxPath)) {
    console.warn(`skip (missing): ${name}.fbx`);
    continue;
  }
  const scene = loadFbx(fbxPath);
  scene.name = name;
  fixMaterials(scene, atlas);
  rebindSkeletonToCurrentPose(scene);
  const fit = fitToHeight(scene, TARGET_HEIGHT);
  scene.position.y = fit.yOffset;
  scene.updateMatrixWorld(true);
  const grounded = new THREE.Box3().setFromObject(scene);
  layout[name] = {
    scale: fit.scale,
    yOffset: 0,
    height: grounded.max.y - grounded.min.y,
  };
  const glb = await exportGlb(scene);
  fs.writeFileSync(path.join(DEST, `${name}.glb`), glb);
  fs.copyFileSync(fbxPath, path.join(DEST, `${name}.fbx`));
  console.log(
    `exported ${name}.glb + copied ${name}.fbx — height ${layout[name].height.toFixed(3)}`,
  );
}

fs.writeFileSync(
  path.join(DEST, "layout.json"),
  JSON.stringify(layout, null, 2),
  "utf8",
);

const attribution = `# Villager NPC Free

Character models imported from the user's **Villager NPC Free** asset pack.
Verify license terms on the pack's original download page before commercial release.
`;
fs.writeFileSync(path.join(DEST, "ATTRIBUTION.md"), attribution, "utf8");

console.log(`\nDone — models in ${DEST}`);
