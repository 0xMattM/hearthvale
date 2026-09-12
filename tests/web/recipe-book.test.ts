import { describe, expect, it } from "vitest";
import { getRecipe, ITEMS, type PlayerStateDto } from "@game/shared";
import {
  buildRecipeBook,
  describeRecipeBookEntry,
  inventoryQty,
  professionXpOf,
} from "../../apps/web/lib/recipe-book";

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

describe("recipe book F10.5", () => {
  it("shows ready craft when mats + XP + energy ok (happy)", () => {
    const recipe = getRecipe("mill_flour")!;
    const state = baseState({
      farmerXp: 0,
      inventory: [{ id: "1", itemId: "wheat", qty: 4, durability: null }],
    });
    const entry = describeRecipeBookEntry(recipe, state, ITEMS, 1);
    expect(entry.canCraft).toBe(true);
    expect(entry.gateLabel).toBeNull();
    expect(entry.inputs[0]).toMatchObject({ have: 4, need: 2, ok: true });
    expect(entry.outputQty).toBe(1);
  });

  it("applies T2 output bonus and sorts craftable first (edge)", () => {
    const flour = getRecipe("mill_flour")!;
    const fine = getRecipe("forge_iron_hoe_fine")!;
    const state = baseState({
      farmerXp: 0,
      blacksmithXp: 10,
      inventory: [
        { id: "1", itemId: "wheat", qty: 2, durability: null },
        { id: "2", itemId: "iron_bar", qty: 1, durability: null },
      ],
    });
    const milled = describeRecipeBookEntry(flour, state, ITEMS, 2);
    expect(milled.outputQty).toBe(2);
    expect(milled.energyCost).toBe(8);

    const book = buildRecipeBook([fine, flour], state, ITEMS, 1);
    expect(book[0].recipe.id).toBe("mill_flour");
    expect(book[1].xpLocked).toBe(true);
    expect(professionXpOf(state, "blacksmith")).toBe(10);
  });

  it("gates on missing materials and low energy (failure)", () => {
    const recipe = getRecipe("smelt_iron_bar")!;
    const shortMats = describeRecipeBookEntry(
      recipe,
      baseState({
        blacksmithXp: 0,
        inventory: [{ id: "1", itemId: "iron_ore", qty: 1, durability: null }],
      }),
      ITEMS,
      1,
    );
    expect(shortMats.canCraft).toBe(false);
    expect(shortMats.gateLabel).toContain("Missing materials");
    expect(shortMats.inputs[0].have).toBe(1);
    expect(inventoryQty([{ id: "1", itemId: "iron_ore", qty: 1, durability: null }], "iron_ore")).toBe(1);

    const lowEnergy = describeRecipeBookEntry(
      recipe,
      baseState({
        energy: 2,
        inventory: [{ id: "1", itemId: "iron_ore", qty: 2, durability: null }],
      }),
      ITEMS,
      1,
    );
    expect(lowEnergy.canCraft).toBe(false);
    expect(lowEnergy.gateLabel).toContain("Needs");
    expect(lowEnergy.gateLabel).toContain("energy");
  });
});
