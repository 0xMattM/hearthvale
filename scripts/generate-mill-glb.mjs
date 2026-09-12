/**
 * One-shot: write a low-poly mill.glb for the F14.1 hero building path.
 * Run: node scripts/generate-mill-glb.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

/** Node lacks browser FileReader; GLTFExporter needs it for binary blobs. */
globalThis.FileReader = class FileReader {
  result = null;
  onloadend = null;
  onerror = null;
  /**
   * @param {Blob} blob
   */
  readAsArrayBuffer(blob) {
    Promise.resolve(blob.arrayBuffer())
      .then((buf) => {
        this.result = buf;
        this.onloadend?.({ target: this });
      })
      .catch((err) => this.onerror?.(err));
  }
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(
  __dirname,
  "../apps/web/public/models/mill.glb",
);

const root = new THREE.Group();
root.name = "mill_hero";

const base = new THREE.Mesh(
  new THREE.CylinderGeometry(1.05, 1.15, 0.3, 16),
  new THREE.MeshStandardMaterial({ color: 0x7a7f86 }),
);
base.position.y = 0.15;
base.name = "base";
root.add(base);

const tower = new THREE.Mesh(
  new THREE.CylinderGeometry(0.75, 0.9, 1.8, 12),
  new THREE.MeshStandardMaterial({ color: 0x9aa0a8 }),
);
tower.position.y = 1.1;
tower.name = "tower";
root.add(tower);

const roof = new THREE.Mesh(
  new THREE.ConeGeometry(0.95, 0.7, 12),
  new THREE.MeshStandardMaterial({ color: 0x5a4030 }),
);
roof.position.y = 2.15;
roof.name = "roof";
root.add(roof);

const door = new THREE.Mesh(
  new THREE.BoxGeometry(0.45, 0.7, 0.08),
  new THREE.MeshStandardMaterial({ color: 0x3a2a1a }),
);
door.position.set(0, 0.7, 0.85);
door.name = "door";
root.add(door);

const stone = new THREE.Mesh(
  new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12),
  new THREE.MeshStandardMaterial({ color: 0x6a6e74 }),
);
stone.position.set(0.95, 0.55, 0);
stone.rotation.z = Math.PI / 2;
stone.name = "millstone";
root.add(stone);

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(root, { binary: true });
const buffer = Buffer.from(result);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
