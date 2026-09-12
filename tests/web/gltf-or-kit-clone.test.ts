import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const gltf = fs.readFileSync(
  path.join(
    process.cwd(),
    "apps/web/components/land-scene/GltfOrKit.tsx",
  ),
  "utf8",
);
const gameApp = fs.readFileSync(
  path.join(process.cwd(), "apps/web/components/GameApp.tsx"),
  "utf8",
);

describe("client integrity SEC-7", () => {
  it("memos GLTF clones (happy)", () => {
    expect(gltf).toContain("useMemo");
    expect(gltf).toContain("gltf.scene.clone(true)");
  });

  it("applyState uses tokenRef after login (edge)", () => {
    expect(gameApp).toContain("refreshTutorClaimable(tokenRef.current)");
    expect(gameApp).toContain("refreshAchievements(tokenRef.current");
  });

  it("does not clone the GLTF scene inline on each render (failure)", () => {
    expect(gltf).not.toContain("object={gltf.scene.clone()}");
  });
});
