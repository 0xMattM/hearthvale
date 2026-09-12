import { describe, expect, it } from "vitest";
import {
  fillNormalFromHeight,
  fillSurfaceBuffers,
  hashNoise,
  valueNoise,
  type SurfaceTextureKind,
} from "../../apps/web/lib/procedural-textures";

/**
 * Procedural surface grain — not flat solid fills.
 */
describe("procedural surface textures", () => {
  it("noise varies across the plane (happy)", () => {
    const a = valueNoise(0.1, 0.2, 11);
    const b = valueNoise(3.4, 5.6, 11);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
    expect(a).not.toBe(b);
    expect(hashNoise(1, 2, 3)).not.toBe(hashNoise(4, 5, 3));
  });

  it("cobble and wood buffers are not flat gray (edge)", () => {
    for (const kind of ["cobble", "wood", "grass"] as SurfaceTextureKind[]) {
      const size = 32;
      const albedo = new Uint8ClampedArray(size * size * 4);
      const rough = new Uint8ClampedArray(size * size * 4);
      const height = new Uint8ClampedArray(size * size * 4);
      fillSurfaceBuffers(kind, size, albedo, rough, height);
      let min = 255;
      let max = 0;
      for (let i = 0; i < albedo.length; i += 4) {
        const v = albedo[i]!;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      expect(max - min).toBeGreaterThan(12);
      expect(rough[0]).toBeGreaterThan(0);
      expect(height[0]).toBeGreaterThan(0);
    }
  });

  it("rejects empty kind only via default sample path (failure)", () => {
    const size = 8;
    const albedo = new Uint8ClampedArray(size * size * 4);
    const rough = new Uint8ClampedArray(size * size * 4);
    const height = new Uint8ClampedArray(size * size * 4);
    // Reason: unknown cast still fills — must not throw / leave zeros-only.
    fillSurfaceBuffers("cloth", size, albedo, rough, height);
    const sum = albedo.reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(0);
  });

  it("keeps albedo in a readable band without crushing grain (regression)", () => {
    const size = 16;
    const albedo = new Uint8ClampedArray(size * size * 4);
    const rough = new Uint8ClampedArray(size * size * 4);
    const height = new Uint8ClampedArray(size * size * 4);
    fillSurfaceBuffers("stone", size, albedo, rough, height);
    let min = 255;
    let max = 0;
    for (let i = 0; i < albedo.length; i += 4) {
      const v = albedo[i]!;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    // Reason: floor keeps kit hexes readable; span + chroma must stay wide enough to see grain.
    expect(min).toBeGreaterThan(110);
    expect(max - min).toBeGreaterThan(22);
  });

  it("does not stamp cobble mortar on a square grid (edge)", () => {
    const size = 48;
    const albedo = new Uint8ClampedArray(size * size * 4);
    const rough = new Uint8ClampedArray(size * size * 4);
    const height = new Uint8ClampedArray(size * size * 4);
    fillSurfaceBuffers("cobble", size, albedo, rough, height);
    const y = Math.floor(size / 2);
    const cell = size / 6;
    let darkGridHits = 0;
    for (let k = 0; k < 6; k++) {
      const x = Math.max(0, Math.min(size - 1, Math.floor(k * cell)));
      if (albedo[(y * size + x) * 4]! < 175) darkGridHits += 1;
    }
    expect(darkGridHits).toBeLessThan(6);
  });

  it("builds a non-flat normal map from height (happy)", () => {
    const size = 16;
    const height = new Uint8ClampedArray(size * size * 4);
    const out = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const h = Math.round((x / (size - 1)) * 255);
        height[i] = h;
        height[i + 1] = h;
        height[i + 2] = h;
        height[i + 3] = 255;
      }
    }
    fillNormalFromHeight(height, size, out, 8);
    let minR = 255;
    let maxR = 0;
    for (let i = 0; i < out.length; i += 4) {
      const r = out[i]!;
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
    }
    expect(maxR - minR).toBeGreaterThan(8);
    const mid = (8 * size + 8) * 4;
    expect(out[mid + 2]!).toBeGreaterThan(180);
  });
});
