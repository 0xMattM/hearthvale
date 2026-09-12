/**
 * Process-station kit silhouettes — furniture, not mini sheds.
 * Geometry in `process-station-kits.tsx` must match these forms.
 */

export const PROCESS_STATION_SILHOUETTE = {
  workshop: {
    form: "workbench",
    catalogName: "Carpenter Table",
    hasShedRoof: false,
    signature: ["legs", "tabletop", "saw", "planks"] as const,
    labelY: 1.72,
  },
  mill: {
    form: "windmill",
    catalogName: "Mill",
    hasShedRoof: true,
    signature: ["tower", "sails", "door"] as const,
    labelY: 5.55,
  },
  forge: {
    form: "hearth",
    catalogName: "Forge",
    hasShedRoof: false,
    signature: ["firebox", "anvil", "chimney"] as const,
    labelY: 2.55,
  },
  kitchen: {
    form: "stove",
    catalogName: "Kitchen",
    hasShedRoof: false,
    signature: ["cauldron", "board", "stove"] as const,
    labelY: 1.85,
  },
  loom: {
    form: "frame",
    catalogName: "Loom",
    hasShedRoof: false,
    signature: ["posts", "warp", "shuttle", "treadle"] as const,
    labelY: 2.2,
  },
  alchemy_bench: {
    form: "bench",
    catalogName: "Alchemy Bench",
    hasShedRoof: false,
    signature: ["table", "flask", "burner"] as const,
    labelY: 1.72,
  },
} as const;

export type ProcessStationSilhouetteKind =
  keyof typeof PROCESS_STATION_SILHOUETTE;

/**
 * True when the kit is furniture (no shed box + roof), except mill tower.
 *
 * @param kind - Process station type.
 */
export function processStationIsFurniture(
  kind: ProcessStationSilhouetteKind,
): boolean {
  const spec = PROCESS_STATION_SILHOUETTE[kind];
  return spec.form !== "shed" && (kind === "mill" || !spec.hasShedRoof);
}

/**
 * World-label height above a redesigned kit.
 *
 * @param kind - Process station type.
 */
export function processStationLabelY(
  kind: ProcessStationSilhouetteKind,
): number {
  return PROCESS_STATION_SILHOUETTE[kind].labelY;
}
