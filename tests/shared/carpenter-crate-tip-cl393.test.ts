import { describe, expect, it } from "vitest";
import { TUTORIAL_NPCS, getRecipe } from "@game/shared";

describe("CityLands CL39.3 Carpenter crate tip fidelity", () => {
  it("tutor basics name assemble_wood_crate / plank sink (happy)", () => {
    const recipe = getRecipe("assemble_wood_crate")!;
    expect(recipe.profession).toBe("carpenter");
    expect(recipe.station).toBe("workshop");
    expect(recipe.output.itemId).toBe("wood_crate");

    const basics = TUTORIAL_NPCS.carpenter.basics.toLowerCase();
    expect(basics).toMatch(/assemble_wood_crate|wood crate/);
    expect(basics).toMatch(/plank/);
    expect(TUTORIAL_NPCS.carpenter.toolsNeeded.toLowerCase()).toMatch(
      /plank|crate/,
    );
  });

  it("keeps tutorial_carpenter quest id and craft_plank objective (edge)", () => {
    expect(TUTORIAL_NPCS.carpenter.quest.id).toBe("tutorial_carpenter");
    expect(TUTORIAL_NPCS.carpenter.quest.objective).toBe("craft_plank");
    expect(TUTORIAL_NPCS.carpenter.seededOnCity).toBe(true);
  });

  it("does not invent combat on carpenter crate copy (failure)", () => {
    const copy =
      `${TUTORIAL_NPCS.carpenter.basics} ${TUTORIAL_NPCS.carpenter.toolsNeeded}`.toLowerCase();
    expect(copy).not.toMatch(/\bcombat\b|\barena\b|\bwarrior\b/);
  });
});
