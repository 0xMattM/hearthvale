/**
 * Hero building GLTF catalog (F14.1). Kits remain fallback when URL missing/fails.
 */
export interface HeroBuildingModel {
  buildingType: "mill" | "forge";
  /** Public URL under /models/… */
  url: string;
  /** Uniform scale applied to the loaded scene. */
  scale: number;
  /** Y lift so the model sits on the ground. */
  yOffset: number;
}

/** Registered GLTF hero replacements. Empty url = use kit only. */
export const HERO_BUILDING_MODELS: Record<"mill" | "forge", HeroBuildingModel> = {
  mill: {
    buildingType: "mill",
    url: "",
    scale: 1,
    yOffset: 0,
  },
  forge: {
    buildingType: "forge",
    url: "",
    scale: 1,
    yOffset: 0,
  },
};

/**
 * Returns the hero model entry when a GLTF URL is configured.
 */
export function heroModelFor(
  buildingType: string,
): HeroBuildingModel | null {
  if (buildingType !== "mill" && buildingType !== "forge") return null;
  const entry = HERO_BUILDING_MODELS[buildingType];
  if (!entry.url.trim()) return null;
  return entry;
}

/**
 * True when this type should attempt GLTF load (kit on failure).
 */
export function shouldLoadHeroGltf(buildingType: string): boolean {
  return heroModelFor(buildingType) != null;
}
