/**
 * Cluster Farm FBX exhibition meshes (x>8500) into building groups.
 *
 * Usage: node scripts/inspect-farm-clusters.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PNG } from "pngjs";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

let blobN = 0;
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
      const file = path.join(os.tmpdir(), `farm-fbx-tex-${blobN++}.bin`);
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
  createElementNS() {
    return {
      addEventListener() {},
      removeEventListener() {},
      set src(_v) {
        this.width = 1;
        this.height = 1;
        this.data = new Uint8ClampedArray([255, 255, 255, 255]);
        this.onload?.();
      },
    };
  },
};

const fbxPath = path.join(
  process.env.USERPROFILE ?? "",
  "Downloads",
  "assets",
  "3D Farm Asset Pack.fbx",
);
const buf = fs.readFileSync(fbxPath);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const scene = new FBXLoader().parse(ab, path.dirname(fbxPath));
scene.updateMatrixWorld(true);

const skip = /^(Sphere|Cone|trigo|cenoura|cerca|Feno|Circle)/i;
const items = [];
scene.traverse((o) => {
  if (!o.isMesh || skip.test(o.name)) return;
  const b = new THREE.Box3().setFromObject(o);
  if (b.isEmpty()) return;
  const c = b.getCenter(new THREE.Vector3());
  const s = b.getSize(new THREE.Vector3());
  if (c.x < 8500) return;
  items.push({
    name: o.name,
    cx: c.x,
    cy: c.y,
    cz: c.z,
    sx: s.x,
    sy: s.y,
    sz: s.z,
    verts: o.geometry?.attributes?.position?.count ?? 0,
  });
});

const used = new Set();
const clusters = [];
for (const a of items) {
  if (used.has(a.name)) continue;
  const group = [a];
  used.add(a.name);
  for (const b of items) {
    if (used.has(b.name)) continue;
    const d = Math.hypot(a.cx - b.cx, a.cz - b.cz);
    if (d < 420) {
      group.push(b);
      used.add(b.name);
    }
  }
  const minx = Math.min(...group.map((g) => g.cx - g.sx / 2));
  const maxx = Math.max(...group.map((g) => g.cx + g.sx / 2));
  const miny = Math.min(...group.map((g) => g.cy - g.sy / 2));
  const maxy = Math.max(...group.map((g) => g.cy + g.sy / 2));
  const minz = Math.min(...group.map((g) => g.cz - g.sz / 2));
  const maxz = Math.max(...group.map((g) => g.cz + g.sz / 2));
  clusters.push({
    h: +(maxy - miny).toFixed(1),
    w: +(maxx - minx).toFixed(1),
    d: +(maxz - minz).toFixed(1),
    n: group.length,
    names: group.map((g) => g.name),
  });
}
clusters.sort((a, b) => b.h - a.h);
for (const c of clusters.slice(0, 25)) console.log(JSON.stringify(c));
