import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  VILLAGER_RESOURCE_PATH,
  rewriteVillagerTextureUrl,
  villagerAvatarUrl,
} from "../../apps/web/lib/avatar-villager";
import { VillagerFbxLoader, WildAnimalFbxLoader } from "../../apps/web/lib/fbx-pack-loaders";
import { rewriteWildAnimalTextureUrl } from "../../apps/web/lib/wild-animals";

const VILLAGER_DIR = path.join(
  process.cwd(),
  "apps/web/public/models/villager",
);

/**
 * Villager FBX textures must stay in /models/villager, not wild-animals.
 */
describe("villager texture rewrite", () => {
  it("pins Villagers_Texture.png to the villager folder (happy)", () => {
    expect(rewriteVillagerTextureUrl("Villagers_Texture.png")).toBe(
      `${VILLAGER_RESOURCE_PATH}Villagers_Texture.png`,
    );
    expect(villagerAvatarUrl("local")).toBe("/models/villager/Hunter.fbx");
    expect(fs.existsSync(path.join(VILLAGER_DIR, "Villagers_Texture.png"))).toBe(
      true,
    );
  });

  it("leaves non-image FBX urls alone (edge)", () => {
    expect(rewriteVillagerTextureUrl("/models/villager/Hunter.fbx")).toBe(
      "/models/villager/Hunter.fbx",
    );
    expect(VillagerFbxLoader).not.toBe(WildAnimalFbxLoader);
  });

  it("does not steal textures into wild-animals (failure)", () => {
    expect(rewriteVillagerTextureUrl("Villagers_Texture.png")).not.toBe(
      rewriteWildAnimalTextureUrl("Villagers_Texture.png"),
    );
    expect(rewriteVillagerTextureUrl("Villagers_Texture.png")).not.toContain(
      "wild-animals",
    );
  });
});
