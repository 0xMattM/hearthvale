/**
 * Extract CrisDias 3D Farm Asset Pack houses → small GLBs for the web client.
 * The source FBX is ~82MB (full diorama); we only ship four building meshes.
 *
 * Usage:
 *   node scripts/setup-farm-pack.mjs
 *   node scripts/setup-farm-pack.mjs "C:\path\to\3D Farm Asset Pack.fbx"
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST = path.join(ROOT, "apps", "web", "public", "models", "farm-pack");
const DEFAULT_SRC = path.join(
  process.env.USERPROFILE ?? "",
  "Downloads",
  "assets",
  "3D Farm Asset Pack.fbx",
);

/** Exhibition-side building meshes (not the packed diorama copies). */
const BUILDINGS = [
  { file: "barn-large", mesh: "Cube026" },
  { file: "barn-mid", mesh: "Cube035" },
  { file: "house-white", mesh: "Cube032" },
  { file: "barn-white", mesh: "Cube047" },
];

const NativeBlob = globalThis.Blob;
let blobN = 0;

globalThis.Blob = class SyncBlob {
  constructor(parts = [], opts = {}) {
    this._buf = Buffer.concat(
      parts.map((p) => (Buffer.isBuffer(p) ? p : Buffer.from(p))),
    );
    this.type = opts.type ?? "";
  }
};

globalThis.FileReader = class FileReader {
  result = null;
  onloadend = null;
  onerror = null;
  readAsArrayBuffer(blob) {
    Promise.resolve(
      blob._buf
        ? blob._buf.buffer.slice(
            blob._buf.byteOffset,
            blob._buf.byteOffset + blob._buf.byteLength,
          )
        : blob.arrayBuffer(),
    )
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

globalThis.window = {
  URL: {
    createObjectURL(blob) {
      const file = path.join(os.tmpdir(), `farm-pack-tex-${blobN++}.png`);
      fs.writeFileSync(file, blob._buf ?? Buffer.alloc(0));
      return `file://${file.replace(/\\/g, "/")}`;
    },
    revokeObjectURL() {},
  },
};

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
        return Promise.resolve(new NativeBlob([png], { type }));
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
      removeEventListener() {},
      set src(value) {
        try {
          const filePath = decodeURI(String(value).replace(/^file:\/\//, ""));
          const png = PNG.sync.read(fs.readFileSync(filePath));
          this.width = png.width;
          this.height = png.height;
          this.data = png.data;
          this.onload?.();
          this._loadFn?.({ target: this });
        } catch {
          this.width = 1;
          this.height = 1;
          this.data = new Uint8ClampedArray([255, 255, 255, 255]);
          this.onload?.();
          this._loadFn?.({ target: this });
        }
      },
    };
  },
};

/**
 * Find a mesh by Blender name (Cube.026 vs Cube026).
 *
 * @param root - Parsed FBX scene.
 * @param meshName - Catalog mesh id.
 * @returns Mesh or null.
 */
function findMesh(root, meshName) {
  const want = meshName.replace(/\./g, "");
  let found = null;
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    if (obj.name.replace(/\./g, "") === want) found = obj;
  });
  return found;
}

/**
 * Phong → Standard keeping albedo map + authored color.
 *
 * @param root - Cloned house group.
 */
function upgradeMaterials(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    const list = Array.isArray(obj.material) ? obj.material : [obj.material];
    const next = list.map((mat) => {
      if (mat instanceof THREE.MeshStandardMaterial) return mat;
      const std = new THREE.MeshStandardMaterial({
        color: mat?.color ?? 0xffffff,
        map: mat?.map ?? null,
        roughness: 0.86,
        metalness: 0.04,
        name: mat?.name ?? "",
      });
      if (mat?.map) {
        mat.map.colorSpace = THREE.SRGBColorSpace;
        mat.map.needsUpdate = true;
        std.map = mat.map;
      }
      return std;
    });
    obj.material = next.length === 1 ? next[0] : next;
  });
}

/**
 * Export a Three scene to GLB bytes.
 *
 * @param root - House group.
 * @returns Binary GLB buffer.
 */
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

const src = path.resolve(process.argv[2] ?? DEFAULT_SRC);
if (!fs.existsSync(src)) {
  throw new Error(`Farm FBX not found at ${src}`);
}

console.log("parsing", src);
const buf = fs.readFileSync(src);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const scene = new FBXLoader().parse(ab, path.dirname(src));
globalThis.Blob = NativeBlob;

fs.mkdirSync(DEST, { recursive: true });

for (const spec of BUILDINGS) {
  const mesh = findMesh(scene, spec.mesh);
  if (!mesh) {
    console.warn(`skip (missing mesh): ${spec.mesh}`);
    continue;
  }
  const wrap = new THREE.Group();
  wrap.name = spec.file;
  const clone = mesh.clone(true);
  clone.position.set(0, 0, 0);
  wrap.add(clone);
  upgradeMaterials(wrap);
  wrap.updateMatrixWorld(true);
  const glb = await exportGlb(wrap);
  const dest = path.join(DEST, `${spec.file}.glb`);
  fs.writeFileSync(dest, glb);
  console.log(`exported ${spec.file}.glb (${glb.length} bytes) from ${mesh.name}`);
}

const attribution = `# 3D Farm Asset Pack

Building meshes under this folder are extracted from
[Farm Asset Pack](https://crisdias.itch.io/farm-asset-pack)
by CrisDias.

The source FBX is a full farm diorama; only individual house/barn meshes
are shipped. Do not redistribute the raw 82MB FBX.
`;
fs.writeFileSync(path.join(DEST, "ATTRIBUTION.md"), attribution);
console.log("wrote ATTRIBUTION.md");
