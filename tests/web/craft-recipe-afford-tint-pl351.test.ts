import { describe, expect, it } from "vitest";
import { getRecipe, ITEMS, type PlayerStateDto } from "@game/shared";
import { craftRecipeAffordMode } from "../../apps/web/lib/hud/craft-afford";
import { describeRecipeBookEntry } from "../../apps/web/lib/recipe-book";

/**
 * PL35.1 — Craft recipe afford row tint SoT (affordable vs short mats/energy).
 * Choice: shared craftRecipeAffordMode from recipe-book flags; quiet CSS tint only —
 * recipes/costs unchanged, XP lock stays non-green, no always-on HUD column.
 */
describe("CityLands PL35.1 craft recipe afford row tint", () => {
  function baseState(over: Partial<PlayerStateDto> = {}): PlayerStateDto {
    return {
      playerId: "p",
      username: "u",
      walletAddress: null,
      deeds: [],
      softCurrency: 40,
      softCurrencyName: "Coins",
      energy: 100,
      maxEnergy: 100,
      characterXp: 0,
      characterLevel: 1,
      characterTitle: "Newcomer",
      xpIntoLevel: 0,
      xpToNextLevel: 40,
      farmerXp: 0,
      blacksmithXp: 0,
      cookXp: 0,
      hunterXp: 0,
      animalHunterXp: 0,
      monsterHunterXp: 0,
      carpenterXp: 0,
      weaverXp: 0,
      foresterXp: 0,
      minerXp: 0,
      builderXp: 0,
      fisherXp: 0,
      animalBreederXp: 0,
      alchemistXp: 0,
      guildName: null,
      guildRank: null,
      guildInviteCode: null,
      health: 100,
      maxHealth: 100,
      damage: 10,
      defense: 5,
      landId: "l",
      landKind: "player_land",
      travelDestinationKind: null,
      travelArriveAt: null,
      buildSlots: 8,
      equippedToolInventoryId: null,
      buildings: [],
      inventory: [],
      serverNow: Date.now(),
      ...over,
    };
  }

  it("marks recipe affordable when mats + energy + XP cover craft (happy)", () => {
    const recipe = getRecipe("mill_flour")!;
    const entry = describeRecipeBookEntry(
      recipe,
      baseState({
        inventory: [{ id: "1", itemId: "wheat", qty: 4, durability: null }],
      }),
      ITEMS,
      1,
    );
    expect(entry.canCraft).toBe(true);
    expect(craftRecipeAffordMode(entry)).toBe("affordable");
  });

  it("marks short for mats or energy; XP gate stays xp_locked (edge)", () => {
    const flour = getRecipe("mill_flour")!;
    const shortMats = describeRecipeBookEntry(
      flour,
      baseState({
        inventory: [{ id: "1", itemId: "wheat", qty: 1, durability: null }],
      }),
      ITEMS,
      1,
    );
    expect(shortMats.missingMaterials).toBe(true);
    expect(craftRecipeAffordMode(shortMats)).toBe("short");

    const shortEnergy = describeRecipeBookEntry(
      flour,
      baseState({
        energy: 0,
        inventory: [{ id: "1", itemId: "wheat", qty: 4, durability: null }],
      }),
      ITEMS,
      1,
    );
    expect(shortEnergy.energyOk).toBe(false);
    expect(craftRecipeAffordMode(shortEnergy)).toBe("short");

    const fine = getRecipe("forge_iron_hoe_fine")!;
    const xpLocked = describeRecipeBookEntry(
      fine,
      baseState({
        blacksmithXp: 0,
        inventory: [
          { id: "1", itemId: "iron_bar", qty: 9, durability: null },
          { id: "2", itemId: "wood", qty: 9, durability: null },
        ],
      }),
      ITEMS,
      1,
    );
    expect(xpLocked.xpLocked).toBe(true);
    expect(craftRecipeAffordMode(xpLocked)).toBe("xp_locked");
  });

  it("keeps recipe costs unchanged and refuses inventing free crafts (failure)", () => {
    const recipe = getRecipe("mill_flour")!;
    expect(recipe.energyCost).toBeGreaterThan(0);
    expect(recipe.inputs.length).toBeGreaterThan(0);
    for (const input of recipe.inputs) {
      expect(input.qty).toBeGreaterThan(0);
    }
    const empty = describeRecipeBookEntry(recipe, baseState(), ITEMS, 1);
    expect(empty.canCraft).toBe(false);
    expect(craftRecipeAffordMode(empty)).toBe("short");
    expect(craftRecipeAffordMode({
      xpLocked: false,
      missingMaterials: false,
      energyOk: true,
    })).toBe("affordable");
  });
});
