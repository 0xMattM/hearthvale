import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  combatFoePlateY,
  combatFoeStandY,
  rewriteWildAnimalTextureUrl,
  wildAnimalFitScale,
  wildAnimalModel,
  wildAnimalPreloadUrls,
} from "../../apps/web/lib/wild-animals";

const HUNT_CREATURE = path.join(
  process.cwd(),
  "apps/web/components/land-scene/CombatHuntCreature.tsx",
);

describe("hunt wildlife kits", () => {
  it("uses in-engine kits instead of CraftPix FBX (happy)", () => {
    expect(wildAnimalModel("hare")).toBeNull();
    expect(wildAnimalModel("boar")).toBeNull();
    expect(wildAnimalPreloadUrls()).toEqual([]);
    expect(combatFoeStandY("hare")).toBe(0);
    expect(combatFoePlateY("boar")).toBe(1.45);
    const src = fs.readFileSync(HUNT_CREATURE, "utf8");
    expect(src).toContain("HuntWildlifeKit");
    expect(src).not.toContain("WildAnimalProp");
  });

  it("keeps the dummy on a post and still rewrites old atlas paths (edge)", () => {
    expect(
      rewriteWildAnimalTextureUrl(
        "\\body1\\animals_forest\\animast_wild\\texture\\wild_animals_map.png",
      ),
    ).toBe("/models/wild-animals/wild_animals_map.png");
    expect(wildAnimalModel("dummy")).toBeNull();
    expect(combatFoeStandY("dummy")).toBe(0.7);
    expect(combatFoePlateY("dummy")).toBe(1.55);
    expect(wildAnimalFitScale(0.04, 0.78)).toBe(1);
  });

  it("rejects unknown kinds and broken scale (failure)", () => {
    expect(wildAnimalModel("wolf")).toBeNull();
    expect(wildAnimalFitScale(0, 1.05)).toBe(1);
    expect(rewriteWildAnimalTextureUrl("/models/wild-animals/rabbit.fbx")).toBe(
      "/models/wild-animals/rabbit.fbx",
    );
  });
});
