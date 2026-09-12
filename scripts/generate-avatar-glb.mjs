/**
 * One-shot: write avatar.glb — low-poly stylized farmer with named rig groups (F14.2).
 * Run: node scripts/generate-avatar-glb.mjs
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
  "../apps/web/public/models/avatar.glb",
);

const SKIN = 0xf2d0a8;
const FACE = 0xf8e8c8;
const SHIRT = 0xe8b848;
const PANTS = 0x4a5c70;
const VEST = 0x8b4e28;
const BOOTS = 0x4a3420;
const HAT = 0xe8c858;
const HAT_BAND = 0x6a4830;
const EYE = 0x1a1814;

const root = new THREE.Group();
root.name = "avatar_hero";

/**
 * @param {number} w
 * @param {number} h
 * @param {number} d
 * @param {number} color
 * @param {number} [roughness]
 */
function box(w, h, d, color, roughness = 0.86) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0.04,
    }),
  );
}

const body = new THREE.Group();
body.name = "body";

const torso = new THREE.Group();
torso.name = "torso";

function makeLeg(name, x) {
  const hip = new THREE.Group();
  hip.name = name;
  hip.position.set(x, 0.78, 0);

  const thigh = box(0.13, 0.28, 0.12, PANTS);
  thigh.position.y = -0.14;
  hip.add(thigh);

  const shin = box(0.11, 0.26, 0.11, PANTS);
  shin.position.y = -0.36;
  hip.add(shin);

  const boot = box(0.14, 0.1, 0.2, BOOTS, 0.72);
  boot.position.set(0, -0.62, 0.04);
  hip.add(boot);

  const toe = box(0.11, 0.05, 0.07, 0x2a2018, 0.8);
  toe.position.set(0, -0.62, 0.12);
  hip.add(toe);

  return hip;
}

const legL = makeLeg("leg_l", -0.14);
const legR = makeLeg("leg_r", 0.14);

const torsoMesh = box(0.44, 0.48, 0.28, SHIRT);
torsoMesh.position.y = 1.02;
torso.add(torsoMesh);

const vestMesh = box(0.38, 0.4, 0.1, VEST, 0.78);
vestMesh.position.set(0, 1.04, 0.1);
vestMesh.name = "vest";
torso.add(vestMesh);

const belt = box(0.46, 0.07, 0.3, 0x4a3828, 0.75);
belt.position.y = 0.8;
torso.add(belt);

const buckle = box(0.09, 0.07, 0.04, 0x9aa0a8, 0.4);
buckle.position.set(0, 0.8, 0.17);
torso.add(buckle);

const head = new THREE.Group();
head.name = "head";
head.position.y = 1.58;

const skull = box(0.32, 0.34, 0.3, SKIN, 0.76);
head.add(skull);

const facePlate = box(0.22, 0.2, 0.05, FACE, 0.72);
facePlate.position.set(0, -0.02, 0.16);
facePlate.name = "face";
head.add(facePlate);

const eyeGeo = new THREE.BoxGeometry(0.055, 0.075, 0.02);
const eyeMat = new THREE.MeshStandardMaterial({
  color: EYE,
  roughness: 0.55,
  metalness: 0.08,
});
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(-0.07, 0.05, 0.18);
head.add(eyeL);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeR.position.set(0.07, 0.05, 0.18);
head.add(eyeR);

const mouth = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 0.022, 0.018),
  new THREE.MeshStandardMaterial({ color: 0x8a6050, roughness: 0.75 }),
);
mouth.position.set(0, -0.09, 0.17);
head.add(mouth);

const hairBack = box(0.24, 0.24, 0.08, HAT_BAND, 0.92);
hairBack.position.set(0, 0, -0.14);
hairBack.name = "hair_back";
head.add(hairBack);

const brim = new THREE.Mesh(
  new THREE.CylinderGeometry(0.3, 0.3, 0.045, 12),
  new THREE.MeshStandardMaterial({ color: HAT, roughness: 0.9, metalness: 0.02 }),
);
brim.position.set(0, 0.14, -0.02);
head.add(brim);

const crown = new THREE.Mesh(
  new THREE.CylinderGeometry(0.13, 0.15, 0.14, 10),
  new THREE.MeshStandardMaterial({ color: HAT, roughness: 0.9, metalness: 0.02 }),
);
crown.position.set(0, 0.24, -0.05);
head.add(crown);

const band = new THREE.Mesh(
  new THREE.TorusGeometry(0.14, 0.018, 6, 14),
  new THREE.MeshStandardMaterial({ color: HAT_BAND, roughness: 0.85 }),
);
band.position.set(0, 0.08, -0.04);
head.add(band);

torso.add(head);

function makeArm(name, x, zRot) {
  const arm = new THREE.Group();
  arm.name = name;
  arm.position.set(x, 1.22, 0);
  arm.rotation.z = zRot;

  const upper = box(0.1, 0.22, 0.1, SHIRT);
  upper.position.y = -0.12;
  arm.add(upper);

  const lower = box(0.085, 0.2, 0.085, SHIRT);
  lower.position.y = -0.32;
  arm.add(lower);

  const hand = box(0.09, 0.1, 0.08, SKIN, 0.78);
  hand.position.set(0, -0.48, 0.02);
  arm.add(hand);

  return arm;
}

const armL = makeArm("arm_l", -0.36, 0.28);
const armR = makeArm("arm_r", 0.36, -0.28);

const cape = box(0.42, 0.44, 0.08, VEST, 0.82);
cape.position.set(0, 1.02, -0.16);
cape.name = "cape";
torso.add(cape);

body.add(legL);
body.add(legR);
body.add(torso);
body.add(armL);
body.add(armR);

const tool = new THREE.Mesh(
  new THREE.CylinderGeometry(0.025, 0.028, 0.9, 6),
  new THREE.MeshStandardMaterial({ color: 0x6a5038, roughness: 0.88 }),
);
tool.name = "tool_shaft";
tool.position.set(0.26, 1.1, -0.16);
tool.rotation.set(0.2, 0, 0.3);
body.add(tool);

const blade = box(0.07, 0.18, 0.05, 0x9aa0a8, 0.42);
blade.name = "tool_head";
blade.position.set(0.26, 1.42, -0.24);
blade.rotation.set(0.2, 0, 0.3);
body.add(blade);

root.add(body);

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(root, { binary: true });
const buffer = Buffer.from(result);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
