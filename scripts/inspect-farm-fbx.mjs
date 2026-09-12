/**
 * List meshes in the CrisDias 3D Farm Asset Pack FBX (names, sizes, materials).
 *
 * Usage:
 *   node scripts/inspect-farm-fbx.mjs
 *   node scripts/inspect-farm-fbx.mjs "C:\path\to\3D Farm Asset Pack.fbx"
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PNG } from "pngjs";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

let blobN = 0;
const tmp = os.tmpdir();

globalThis.Blob = class Blob {
  constructor(parts = [], opts = {}) {
    this._buf = Buffer.concat(
      parts.map((p) => (Buffer.isBuffer(p) ? p : Buffer.from(p))),
    );
    this.type = opts.type ?? "";
  }
};

globalThis.window = {
  URL: {
    createObjectURL(blob) {
      const file = path.join(tmp, `farm-fbx-tex-${blobN++}.bin`);
      fs.writeFileSync(file, blob._buf ?? Buffer.alloc(0));
      return `file://${file.replace(/\\/g, "/")}`;
    },
    revokeObjectURL() {},
  },
};

globalThis.document = {
  createElement(tag) {
    if (tag !== "canvas") return {};
    const canvas = { width: 256, height: 256, getContext: () => ctx };
    const ctx = {
      _img: null,
      drawImage(img) {
        this._img = img;
      },
      putImageData(img) {
        this._img = img;
      },
      getImageData(_x, _y, w, h) {
        const data =
          this._img?.data ??
          new Uint8ClampedArray(Math.max(1, w) * Math.max(1, h) * 4);
        return { data, width: w, height: h };
      },
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
        } catch (err) {
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

const fbxPath =
  process.argv[2] ??
  path.join(
    process.env.USERPROFILE ?? "",
    "Downloads",
    "assets",
    "3D Farm Asset Pack.fbx",
  );

const buf = fs.readFileSync(fbxPath);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
console.time("parse");
const scene = new FBXLoader().parse(ab, path.dirname(fbxPath));
console.timeEnd("parse");
scene.updateMatrixWorld(true);

function boxOf(obj) {
  const b = new THREE.Box3().setFromObject(obj);
  if (b.isEmpty()) return null;
  const s = b.getSize(new THREE.Vector3());
  const c = b.getCenter(new THREE.Vector3());
  return {
    size: [+s.x.toFixed(2), +s.y.toFixed(2), +s.z.toFixed(2)],
    center: [+c.x.toFixed(1), +c.y.toFixed(1), +c.z.toFixed(1)],
  };
}

console.log("ROOT children", scene.children.length);
const rows = [];
scene.traverse((o) => {
  if (!o.isMesh) return;
  const b = boxOf(o);
  const mats = (Array.isArray(o.material) ? o.material : [o.material]).map(
    (m) => m?.name || m?.type,
  );
  const map = (Array.isArray(o.material) ? o.material : [o.material]).some(
    (m) => Boolean(m?.map),
  );
  const color = (Array.isArray(o.material) ? o.material[0] : o.material)?.color
    ?.getHexString?.();
  rows.push({
    name: o.name,
    parent: o.parent?.name,
    verts: o.geometry?.attributes?.position?.count,
    size: b?.size,
    center: b?.center,
    map,
    color,
    mats: mats.slice(0, 6),
  });
});
rows.sort((a, b) => (b.size?.[1] ?? 0) - (a.size?.[1] ?? 0));
console.log("meshes", rows.length);
for (const r of rows.slice(0, 80)) console.log(JSON.stringify(r));
if (rows.length > 80) console.log("... +" + (rows.length - 80) + " more");
