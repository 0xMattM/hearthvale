import type {
  ItemDefinition,
  ItemId,
  PlayerStateDto,
  ProfessionId,
  RecipeDefinition,
} from "@game/shared";
import {
  focusedEnergyCost,
  stationCraftEnergy,
  stationCraftOutputBonus,
} from "@game/shared";

export interface RecipeInputStatus {
  itemId: ItemId;
  name: string;
  need: number;
  have: number;
  ok: boolean;
}

export interface RecipeBookEntry {
  recipe: RecipeDefinition;
  professionXp: number;
  xpLocked: boolean;
  inputs: RecipeInputStatus[];
  missingMaterials: boolean;
  energyCost: number;
  energyOk: boolean;
  outputQty: number;
  outputName: string;
  canCraft: boolean;
  gateLabel: string | null;
}

/**
 * Returns the player's XP for a profession.
 */
export function professionXpOf(
  state: Pick<
    PlayerStateDto,
    | "farmerXp"
    | "blacksmithXp"
    | "cookXp"
    | "hunterXp"
    | "animalHunterXp"
    | "monsterHunterXp"
    | "carpenterXp"
    | "weaverXp"
    | "foresterXp"
    | "minerXp"
    | "builderXp"
    | "fisherXp"
    | "animalBreederXp"
    | "alchemistXp"
  >,
  profession: ProfessionId,
): number {
  if (profession === "farmer") return state.farmerXp;
  if (profession === "blacksmith") return state.blacksmithXp;
  if (profession === "cook") return state.cookXp;
  if (profession === "animal_hunter") return state.animalHunterXp;
  if (profession === "monster_hunter") return state.monsterHunterXp;
  if (profession === "hunter") return state.animalHunterXp || state.hunterXp;
  if (profession === "weaver") return state.weaverXp;
  if (profession === "forester") return state.foresterXp;
  if (profession === "miner") return state.minerXp;
  if (profession === "builder") return state.builderXp;
  if (profession === "fisher") return state.fisherXp;
  if (profession === "animal_breeder") return state.animalBreederXp;
  if (profession === "alchemist") return state.alchemistXp;
  return state.carpenterXp;
}

/**
 * Counts how many of an item the player holds.
 */
export function inventoryQty(
  inventory: PlayerStateDto["inventory"],
  itemId: string,
): number {
  return inventory
    .filter((stack) => stack.itemId === itemId)
    .reduce((sum, stack) => sum + stack.qty, 0);
}

/**
 * Builds a readable recipe-book row: gates, inputs owned, energy, output.
 */
export function describeRecipeBookEntry(
  recipe: RecipeDefinition,
  state: PlayerStateDto,
  items: Record<string, ItemDefinition>,
  stationTier = 1,
): RecipeBookEntry {
  const professionXp = professionXpOf(state, recipe.profession);
  const xpLocked = professionXp < recipe.minProfessionXp;
  const inputs: RecipeInputStatus[] = recipe.inputs.map((input) => {
    const have = inventoryQty(state.inventory, input.itemId);
    return {
      itemId: input.itemId,
      name: items[input.itemId]?.name ?? input.itemId,
      need: input.qty,
      have,
      ok: have >= input.qty,
    };
  });
  const missingMaterials = inputs.some((i) => !i.ok);
  const energyCost = stationCraftEnergy(
    focusedEnergyCost(
      recipe.energyCost,
      recipe.profession,
      state.farmerXp,
      state.blacksmithXp,
    ),
    stationTier,
  );
  const energyOk = state.energy >= energyCost;
  const outDef = items[recipe.output.itemId];
  const bonus = stationCraftOutputBonus(
    stationTier,
    Boolean(outDef?.stackable),
  );
  const outputQty = recipe.output.qty + bonus;
  const outputName = outDef?.name ?? recipe.output.itemId;
  const canCraft = !xpLocked && !missingMaterials && energyOk;

  let gateLabel: string | null = null;
  if (xpLocked) {
    gateLabel = `Needs ${recipe.minProfessionXp} ${recipe.profession} XP (you have ${professionXp})`;
  } else if (missingMaterials) {
    const short = inputs
      .filter((i) => !i.ok)
      .map((i) => `${i.name} ${i.have}/${i.need}`)
      .join(", ");
    gateLabel = `Missing materials · ${short}`;
  } else if (!energyOk) {
    gateLabel = `Needs ${energyCost} energy (you have ${state.energy})`;
  }

  return {
    recipe,
    professionXp,
    xpLocked,
    inputs,
    missingMaterials,
    energyCost,
    energyOk,
    outputQty,
    outputName,
    canCraft,
    gateLabel,
  };
}

/**
 * Maps station recipes into book entries sorted locked-last then by name.
 */
export function buildRecipeBook(
  recipes: RecipeDefinition[],
  state: PlayerStateDto,
  items: Record<string, ItemDefinition>,
  stationTier = 1,
): RecipeBookEntry[] {
  return recipes
    .map((recipe) => describeRecipeBookEntry(recipe, state, items, stationTier))
    .sort((a, b) => {
      if (a.canCraft !== b.canCraft) return a.canCraft ? -1 : 1;
      if (a.xpLocked !== b.xpLocked) return a.xpLocked ? 1 : -1;
      return a.recipe.name.localeCompare(b.recipe.name);
    });
}
