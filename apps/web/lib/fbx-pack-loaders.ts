/**
 * Isolated FBX loaders so hunt-animal URL rewrites cannot steal villager textures.
 */

import { LoadingManager } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import {
  VILLAGER_RESOURCE_PATH,
  rewriteVillagerTextureUrl,
} from "./avatar-villager";
import {
  WILD_ANIMALS_RESOURCE_PATH,
  rewriteWildAnimalTextureUrl,
} from "./wild-animals";

const villagerManager = new LoadingManager();
villagerManager.setURLModifier(rewriteVillagerTextureUrl);

const wildAnimalManager = new LoadingManager();
wildAnimalManager.setURLModifier(rewriteWildAnimalTextureUrl);

/** Villager NPC pack — own manager, own resource path. */
export class VillagerFbxLoader extends FBXLoader {
  constructor() {
    super(villagerManager);
    this.setResourcePath(VILLAGER_RESOURCE_PATH);
  }
}

/** CraftPix hunt animals — own manager, own resource path. */
export class WildAnimalFbxLoader extends FBXLoader {
  constructor() {
    super(wildAnimalManager);
    this.setResourcePath(WILD_ANIMALS_RESOURCE_PATH);
  }
}
