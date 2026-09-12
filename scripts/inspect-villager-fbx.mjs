import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

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
      removeEventListener(type) {
        if (type === "load") this._loadFn = null;
      },
      set src(v) {
        const p = String(v).replace(/^file:\/\//, "");
        const png = PNG.sync.read(fs.readFileSync(p));
        this.width = png.width;
        this.height = png.height;
        this.data = png.data;
        this.onload?.();
        this._loadFn?.({ target: this });
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
    "Villager NPC Free",
    "Villager NPC Free",
    "FBX",
    "Characters",
    "Hunter.fbx",
  );
const buf = fs.readFileSync(fbxPath);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const scene = new FBXLoader().parse(ab, path.dirname(fbxPath));
console.log(
  "animations",
  scene.animations?.map((a) => ({
    name: a.name,
    dur: a.duration,
    tracks: a.tracks.length,
  })),
);
scene.traverse((o) => {
  if (o.isBone) console.log("bone", o.name);
  if (!o.isMesh) return;
  const m = o.material;
  console.log("mesh", o.name, {
    uv: Boolean(o.geometry?.attributes?.uv),
    mat: m?.name,
    map: Boolean(m?.map),
    color: m?.color?.getHexString?.(),
  });
});
