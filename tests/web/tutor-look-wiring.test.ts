import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SCENE = path.join(process.cwd(), "apps/web/components/land-scene");
const VILLAGER = path.join(process.cwd(), "apps/web/lib/avatar-villager.ts");

function read(file: string): string {
  return fs.readFileSync(path.join(SCENE, file), "utf8");
}

/**
 * Players share Hunter; tutors use Blacksmith + color wash (no extra clothing meshes).
 */
describe("city tutor look wiring", () => {
  it("tints the tutor mesh from look SoT (happy)", () => {
    const building = read("TutorialNpcBuilding.tsx");
    expect(building).toContain("tutorialNpcLook");
    expect(building).toContain("TUTOR_VILLAGER_VARIANT");
    expect(building).toContain("tintHex={look.cloak}");
    expect(building).toContain("look.cloak");
    expect(building).not.toContain("TutorClothes");
    expect(building).not.toContain("TutorGear");
  });

  it("keeps every player on Hunter and tutors on Blacksmith (edge)", () => {
    const villager = fs.readFileSync(VILLAGER, "utf8");
    expect(villager).toMatch(/local:\s*\{[^}]*file:\s*"Hunter\.fbx"/);
    expect(villager).toMatch(/remote:\s*\{[^}]*file:\s*"Hunter\.fbx"/);
    expect(villager).toMatch(/tutor:\s*\{[^}]*file:\s*"Blacksmith\.fbx"/);
    expect(read("PlayerAvatar.tsx")).toContain('variant="local"');
    expect(read("RemotePlayerAvatar.tsx")).toContain('variant="remote"');
    expect(read("GltfAvatarModel.tsx")).toContain("tintVillagerClothingMap");
    expect(read("GltfAvatarModel.tsx")).toContain("tintHex");
  });

  it("does not add clothing boxes or player meshes on tutors (failure)", () => {
    expect(read("PlayerAvatar.tsx")).not.toContain("tintHex");
    expect(read("TutorialNpcBuilding.tsx")).not.toContain('meshVariant="local"');
    expect(fs.existsSync(path.join(SCENE, "TutorClothes.tsx"))).toBe(false);
    expect(fs.existsSync(path.join(SCENE, "TutorGear.tsx"))).toBe(false);
  });
});
