import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

globalThis.document = {
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
        const p = decodeURI(String(value).replace(/^file:\/\//, ""));
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

for (const name of [
  "shoulderL",
  "upper_armL",
  "forearmL",
  "shoulderR",
  "upper_armR",
  "thighL",
  "thighR",
]) {
  const b = scene.getObjectByName(name);
  if (!b) continue;
  console.log(name, "rot", [...b.rotation].map((v) => Number(v).toFixed(3)));
}

scene.traverse((o) => {
  if (!o.isMesh) return;
  const m = o.material;
  console.log("mesh", o.name, {
    type: m?.type,
    flipY: m?.map?.flipY,
    color: m?.color?.getHexString?.(),
  });
});
