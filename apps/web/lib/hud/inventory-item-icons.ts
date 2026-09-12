/**
 * Per-item inventory icon specs (grid HUD).
 * Catalog ids unchanged — this is client chrome only.
 */

import { ITEMS, type ItemId } from "@game/shared";
import { CROP_ORE_ITEM_ICON_SPECS } from "./inventory-item-icons-expand";

/** SVG primitive drawn inside a 32×32 item icon. */
export type ItemIconShape =
  | {
      t: "path";
      d: string;
      fill?: string;
      stroke?: string;
      sw?: number;
      lc?: "round" | "butt" | "square";
      lj?: "round" | "miter" | "bevel";
    }
  | {
      t: "circle";
      cx: number;
      cy: number;
      r: number;
      fill?: string;
      stroke?: string;
      sw?: number;
    }
  | {
      t: "ellipse";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      fill?: string;
    }
  | {
      t: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      rx?: number;
      fill?: string;
      stroke?: string;
      sw?: number;
    }
  | {
      t: "poly";
      points: string;
      fill?: string;
      stroke?: string;
      sw?: number;
    };

/** Paint recipe for one bag slot icon. */
export interface ItemIconSpec {
  bg: string;
  rim: string;
  shapes: readonly ItemIconShape[];
}

const FALLBACK: ItemIconSpec = {
  bg: "#2a3226",
  rim: "#6a7860",
  shapes: [
    { t: "rect", x: 9, y: 11, w: 14, h: 13, rx: 2, fill: "#8a7a58" },
    { t: "rect", x: 12, y: 8, w: 8, h: 5, rx: 1.5, fill: "#c4a35a" },
    { t: "path", d: "M12 11 Q16 15 20 11", stroke: "#5a4a28", sw: 1.4, fill: "none", lc: "round" },
  ],
};

/**
 * Unique low-poly glyphs for every catalog item.
 * Reason: bag slots must be glanceable without reading the name.
 */
export const ITEM_ICON_SPECS: Record<ItemId, ItemIconSpec> = {
  wheat_seed: {
    bg: "#3a4a22",
    rim: "#8aaa48",
    shapes: [
      { t: "ellipse", cx: 11, cy: 20, rx: 3.2, ry: 2.1, fill: "#d8b44a" },
      { t: "ellipse", cx: 21, cy: 18, rx: 3.2, ry: 2.1, fill: "#c4a030" },
      { t: "ellipse", cx: 16, cy: 12, rx: 3.4, ry: 2.2, fill: "#ead060" },
    ],
  },
  wheat: {
    bg: "#4a3e1c",
    rim: "#e0c050",
    shapes: [
      { t: "rect", x: 14.5, y: 14, w: 3, h: 13, rx: 1, fill: "#8a6a28" },
      { t: "poly", points: "16,4 20,14 16,12 12,14", fill: "#f0d050" },
      { t: "poly", points: "16,7 21,16 16,14 11,16", fill: "#e8c040" },
      { t: "poly", points: "16,10 20,18 16,16 12,18", fill: "#d8b038" },
    ],
  },
  flour: {
    bg: "#3e382c",
    rim: "#d8d0b8",
    shapes: [
      { t: "path", d: "M8 14 L10 26 L22 26 L24 14 Z", fill: "#efe6c8" },
      { t: "ellipse", cx: 16, cy: 14, rx: 8, ry: 4, fill: "#f6f0d8" },
      { t: "rect", x: 13, y: 11, w: 6, h: 4, rx: 1, fill: "#c4a35a" },
    ],
  },
  iron_ore: {
    bg: "#2c2424",
    rim: "#c07058",
    shapes: [
      { t: "poly", points: "8,20 12,10 22,9 26,18 18,26 9,24", fill: "#6a5048" },
      { t: "poly", points: "13,14 18,11 21,16 16,18", fill: "#c06048" },
      { t: "circle", cx: 15, cy: 20, r: 2.2, fill: "#a84838" },
    ],
  },
  iron_bar: {
    bg: "#2a3036",
    rim: "#90a8b8",
    shapes: [
      { t: "rect", x: 6, y: 12, w: 20, h: 8, rx: 1.5, fill: "#8aa0b0" },
      { t: "rect", x: 7, y: 13, w: 18, h: 2, rx: 1, fill: "#c8d8e0" },
      { t: "rect", x: 8, y: 18, w: 12, h: 1.2, fill: "#5a7080" },
    ],
  },
  wooden_hoe: {
    bg: "#3a2e1c",
    rim: "#c09048",
    shapes: [
      { t: "path", d: "M10 26 L18 10", stroke: "#8a5a28", sw: 2.6, lc: "round", fill: "none" },
      { t: "poly", points: "16,8 26,12 24,16 15,12", fill: "#c4a070" },
    ],
  },
  iron_hoe: {
    bg: "#2c3230",
    rim: "#90a0a8",
    shapes: [
      { t: "path", d: "M10 26 L18 10", stroke: "#6a5040", sw: 2.6, lc: "round", fill: "none" },
      { t: "poly", points: "16,8 26,12 24,16 15,12", fill: "#a8b8c0" },
    ],
  },
  iron_hoe_fine: {
    bg: "#2c3228",
    rim: "#d4b060",
    shapes: [
      { t: "path", d: "M10 26 L18 10", stroke: "#6a5040", sw: 2.6, lc: "round", fill: "none" },
      { t: "poly", points: "16,8 26,12 24,16 15,12", fill: "#d8c070" },
      { t: "path", d: "M18 10 L24 13", stroke: "#f0e0a0", sw: 1, fill: "none" },
    ],
  },
  iron_hammer: {
    bg: "#2e2c28",
    rim: "#a09080",
    shapes: [
      { t: "rect", x: 14, y: 12, w: 4, h: 15, rx: 1, fill: "#6a4a2c" },
      { t: "rect", x: 8, y: 7, w: 16, h: 7, rx: 1.2, fill: "#9aa8b0" },
      { t: "rect", x: 9, y: 8, w: 14, h: 2, fill: "#c8d4d8" },
    ],
  },
  bread: {
    bg: "#4a3420",
    rim: "#e0b068",
    shapes: [
      { t: "ellipse", cx: 16, cy: 18, rx: 11, ry: 7, fill: "#d4a058" },
      { t: "ellipse", cx: 16, cy: 16, rx: 9, ry: 5, fill: "#e8c078" },
      { t: "path", d: "M10 16 Q13 13 16 16 Q19 13 22 16", stroke: "#b07838", sw: 1.2, fill: "none", lc: "round" },
    ],
  },
  leather: {
    bg: "#3a281c",
    rim: "#c08050",
    shapes: [
      { t: "ellipse", cx: 16, cy: 17, rx: 10, ry: 8, fill: "#a06038" },
      { t: "ellipse", cx: 16, cy: 16, rx: 7, ry: 5.5, fill: "#c07848" },
      { t: "path", d: "M11 15 Q16 20 21 15", stroke: "#7a4020", sw: 1.2, fill: "none" },
    ],
  },
  raw_meat: {
    bg: "#3a2224",
    rim: "#d07070",
    shapes: [
      { t: "ellipse", cx: 17, cy: 18, rx: 9, ry: 7, fill: "#c05050" },
      { t: "ellipse", cx: 15, cy: 16, rx: 5, ry: 4, fill: "#e87878" },
      { t: "rect", x: 7, y: 12, w: 6, h: 3, rx: 1.2, fill: "#f0e0c8" },
    ],
  },
  cooked_meat: {
    bg: "#3a2a1c",
    rim: "#c08048",
    shapes: [
      { t: "ellipse", cx: 17, cy: 18, rx: 9, ry: 7, fill: "#8a4a28" },
      { t: "ellipse", cx: 15, cy: 16, rx: 5, ry: 4, fill: "#b86838" },
      { t: "rect", x: 7, y: 12, w: 6, h: 3, rx: 1.2, fill: "#e8d0a8" },
    ],
  },
  boar_tusk: {
    bg: "#2c2a28",
    rim: "#e0d0b0",
    shapes: [
      { t: "path", d: "M8 22 Q12 8 26 10 Q18 14 14 24 Z", fill: "#f0e6d0" },
      { t: "path", d: "M12 18 Q16 12 22 12", stroke: "#d0c4a8", sw: 1.2, fill: "none" },
    ],
  },
  wood: {
    bg: "#2e2418",
    rim: "#b08048",
    shapes: [
      { t: "ellipse", cx: 10, cy: 16, rx: 4, ry: 7, fill: "#6a4a28" },
      { t: "rect", x: 10, y: 9, w: 14, h: 14, fill: "#8a5a30" },
      { t: "ellipse", cx: 24, cy: 16, rx: 4, ry: 7, fill: "#c09050" },
      { t: "circle", cx: 24, cy: 16, r: 2, fill: "#8a6030" },
    ],
  },
  plank: {
    bg: "#32281c",
    rim: "#d0a060",
    shapes: [
      { t: "rect", x: 6, y: 8, w: 20, h: 5, rx: 1, fill: "#c49858" },
      { t: "rect", x: 6, y: 14, w: 20, h: 5, rx: 1, fill: "#a87840" },
      { t: "rect", x: 6, y: 20, w: 20, h: 5, rx: 1, fill: "#c49858" },
    ],
  },
  stew: {
    bg: "#2c2418",
    rim: "#d09040",
    shapes: [
      { t: "ellipse", cx: 16, cy: 22, rx: 10, ry: 4, fill: "#6a4a28" },
      { t: "path", d: "M6 16 Q6 24 16 24 Q26 24 26 16 Z", fill: "#8a5a30" },
      { t: "ellipse", cx: 16, cy: 15, rx: 10, ry: 4, fill: "#c07030" },
      { t: "path", d: "M12 10 Q12 6 16 8", stroke: "#d8d0c0", sw: 1.3, fill: "none", lc: "round" },
      { t: "path", d: "M18 10 Q20 6 22 9", stroke: "#d8d0c0", sw: 1.3, fill: "none", lc: "round" },
    ],
  },
  travel_ration: {
    bg: "#2c3224",
    rim: "#a0b070",
    shapes: [
      { t: "rect", x: 8, y: 10, w: 16, h: 14, rx: 2, fill: "#7a8a50" },
      { t: "rect", x: 8, y: 15, w: 16, h: 3, fill: "#c4a35a" },
      { t: "rect", x: 11, y: 8, w: 10, h: 4, rx: 1, fill: "#d8c898" },
    ],
  },
  cloth: {
    bg: "#2a2830",
    rim: "#c0a8d0",
    shapes: [
      { t: "rect", x: 7, y: 10, w: 18, h: 14, rx: 1.5, fill: "#d8c8e0" },
      { t: "path", d: "M7 14 Q16 18 25 14", stroke: "#a090b0", sw: 1.2, fill: "none" },
      { t: "rect", x: 9, y: 8, w: 10, h: 5, rx: 1, fill: "#f0e8f4" },
    ],
  },
  fish: {
    bg: "#1c2a32",
    rim: "#70b0c8",
    shapes: [
      { t: "ellipse", cx: 15, cy: 16, rx: 9, ry: 5.5, fill: "#70a8c0" },
      { t: "poly", points: "23,16 30,11 30,21", fill: "#5088a0" },
      { t: "circle", cx: 10, cy: 15, r: 1.4, fill: "#1a2430" },
    ],
  },
  cooked_fish: {
    bg: "#32241c",
    rim: "#e09050",
    shapes: [
      { t: "ellipse", cx: 15, cy: 16, rx: 9, ry: 5.5, fill: "#d08040" },
      { t: "poly", points: "23,16 30,11 30,21", fill: "#b06830" },
      { t: "path", d: "M10 16 L20 16", stroke: "#8a4820", sw: 1, fill: "none" },
      { t: "circle", cx: 10, cy: 15, r: 1.3, fill: "#2a1c10" },
    ],
  },
  herbal_tonic: {
    bg: "#1c2a20",
    rim: "#70c878",
    shapes: [
      { t: "rect", x: 13, y: 6, w: 6, h: 5, rx: 1, fill: "#8a7a50" },
      { t: "path", d: "M11 11 L10 24 Q16 28 22 24 L21 11 Z", fill: "#3a8a58" },
      { t: "ellipse", cx: 16, cy: 18, rx: 4, ry: 5, fill: "#58c078" },
    ],
  },
  cloth_bandage: {
    bg: "#2c2a28",
    rim: "#e0d8c8",
    shapes: [
      { t: "rect", x: 8, y: 12, w: 16, h: 10, rx: 2, fill: "#f0ead8" },
      { t: "rect", x: 8, y: 15, w: 16, h: 2, fill: "#d8c8a8" },
      { t: "circle", cx: 16, cy: 12, r: 4, fill: "#fff8e8" },
    ],
  },
  wood_crate: {
    bg: "#2a2418",
    rim: "#c09048",
    shapes: [
      { t: "rect", x: 7, y: 9, w: 18, h: 16, rx: 1, fill: "#a07038" },
      { t: "path", d: "M7 9 L25 25 M25 9 L7 25", stroke: "#6a4820", sw: 1.6, fill: "none" },
      { t: "rect", x: 7, y: 9, w: 18, h: 16, rx: 1, fill: "none", stroke: "#d8b070", sw: 1.4 },
    ],
  },
  crop_plot_kit: {
    bg: "#243018",
    rim: "#88c050",
    shapes: [
      { t: "rect", x: 6, y: 14, w: 20, h: 12, rx: 1, fill: "#5a3a1c" },
      { t: "rect", x: 7, y: 15, w: 18, h: 8, fill: "#4a6a28" },
      { t: "path", d: "M16 18 L16 10 L12 12", stroke: "#7cc050", sw: 1.8, fill: "none", lc: "round" },
      { t: "circle", cx: 12, cy: 11, r: 2, fill: "#90d060" },
    ],
  },
  tree_stump_kit: {
    bg: "#24301c",
    rim: "#78a050",
    shapes: [
      { t: "rect", x: 10, y: 14, w: 12, h: 10, rx: 1, fill: "#6a4a28" },
      { t: "ellipse", cx: 16, cy: 14, rx: 8, ry: 5, fill: "#8a6038" },
      { t: "ellipse", cx: 16, cy: 14, rx: 4, ry: 2.5, fill: "#c09058" },
    ],
  },
  ore_node_kit: {
    bg: "#2a2428",
    rim: "#c07860",
    shapes: [
      { t: "poly", points: "8,22 10,12 16,8 24,12 26,22 16,26", fill: "#6a5a58" },
      { t: "poly", points: "14,14 18,11 20,16", fill: "#c06048" },
    ],
  },
  workshop_kit: {
    bg: "#2c2418",
    rim: "#d0a050",
    shapes: [
      { t: "rect", x: 6, y: 18, w: 20, h: 6, rx: 1, fill: "#8a6038" },
      { t: "path", d: "M8 18 L14 8 L18 10 L12 20", fill: "#c0c8d0" },
      { t: "rect", x: 20, y: 10, w: 4, h: 10, fill: "#6a4a28" },
    ],
  },
  mill_kit: {
    bg: "#2a281c",
    rim: "#d0c090",
    shapes: [
      { t: "rect", x: 11, y: 18, w: 10, h: 8, fill: "#8a7a60" },
      { t: "circle", cx: 16, cy: 14, r: 8, fill: "#c8b888" },
      { t: "rect", x: 15, y: 7, w: 2, h: 14, fill: "#6a5a40" },
      { t: "rect", x: 9, y: 13, w: 14, h: 2, fill: "#6a5a40" },
    ],
  },
  forge_kit: {
    bg: "#2a2018",
    rim: "#e07040",
    shapes: [
      { t: "rect", x: 8, y: 16, w: 16, h: 8, rx: 1, fill: "#4a4a50" },
      { t: "path", d: "M10 16 L10 12 L22 12 L22 16", fill: "#6a6a70" },
      { t: "ellipse", cx: 16, cy: 12, rx: 4, ry: 2.5, fill: "#e85828" },
    ],
  },
  kitchen_kit: {
    bg: "#2c2420",
    rim: "#d09070",
    shapes: [
      { t: "path", d: "M8 14 L9 24 Q16 28 23 24 L24 14 Z", fill: "#8a9098" },
      { t: "ellipse", cx: 16, cy: 14, rx: 8, ry: 3, fill: "#b0b6bc" },
      { t: "rect", x: 23, y: 12, w: 5, h: 3, rx: 1, fill: "#6a7078" },
    ],
  },
  loom_kit: {
    bg: "#2a2428",
    rim: "#c0a0c8",
    shapes: [
      { t: "rect", x: 8, y: 7, w: 16, h: 18, rx: 1, fill: "#6a4a38", stroke: "#c4a080", sw: 1.4 },
      { t: "path", d: "M10 10 L22 10 M10 14 L22 14 M10 18 L22 18", stroke: "#d8c0e0", sw: 1.2, fill: "none" },
    ],
  },
  fishing_dock_kit: {
    bg: "#1c2830",
    rim: "#70a8c0",
    shapes: [
      { t: "rect", x: 6, y: 18, w: 20, h: 5, rx: 1, fill: "#8a6038" },
      { t: "rect", x: 8, y: 16, w: 3, h: 8, fill: "#6a4828" },
      { t: "rect", x: 21, y: 16, w: 3, h: 8, fill: "#6a4828" },
      { t: "path", d: "M18 16 L18 8 L24 10", stroke: "#c4c8d0", sw: 1.6, fill: "none", lc: "round" },
    ],
  },
  animal_pen_kit: {
    bg: "#24301c",
    rim: "#90b060",
    shapes: [
      { t: "rect", x: 7, y: 10, w: 3, h: 14, fill: "#8a6a40" },
      { t: "rect", x: 22, y: 10, w: 3, h: 14, fill: "#8a6a40" },
      { t: "rect", x: 7, y: 12, w: 18, h: 2.2, fill: "#c4a060" },
      { t: "rect", x: 7, y: 18, w: 18, h: 2.2, fill: "#c4a060" },
    ],
  },
  alchemy_bench_kit: {
    bg: "#241c2c",
    rim: "#a070d0",
    shapes: [
      { t: "rect", x: 6, y: 20, w: 20, h: 5, rx: 1, fill: "#5a4a38" },
      { t: "path", d: "M13 8 L13 14 L10 22 L22 22 L19 14 L19 8 Z", fill: "#7a48b0" },
      { t: "ellipse", cx: 16, cy: 18, rx: 4, ry: 3, fill: "#c070e0" },
    ],
  },
  planter_kit: {
    bg: "#24301c",
    rim: "#e080a0",
    shapes: [
      { t: "path", d: "M10 16 L8 26 L24 26 L22 16 Z", fill: "#b07040" },
      { t: "ellipse", cx: 16, cy: 16, rx: 6, ry: 2.2, fill: "#5a3a1c" },
      { t: "circle", cx: 16, cy: 10, r: 4, fill: "#e07098" },
      { t: "circle", cx: 16, cy: 10, r: 1.6, fill: "#f0d060" },
    ],
  },
  banner_kit: {
    bg: "#2a2418",
    rim: "#d4a050",
    shapes: [
      { t: "rect", x: 8, y: 6, w: 2.4, h: 22, fill: "#8a6a40" },
      { t: "poly", points: "10,7 26,11 10,16", fill: "#c45040" },
      { t: "poly", points: "12,9 22,11.5 12,14", fill: "#e8c060" },
    ],
  },
  wooden_club: {
    bg: "#2e2418",
    rim: "#c09050",
    shapes: [
      { t: "path", d: "M10 26 L18 8", stroke: "#8a5a28", sw: 3, lc: "round", fill: "none" },
      { t: "ellipse", cx: 20, cy: 8, rx: 5, ry: 4, fill: "#6a4a28" },
    ],
  },
  iron_sword: {
    bg: "#242830",
    rim: "#a8b8c8",
    shapes: [
      { t: "rect", x: 14.5, y: 6, w: 3, h: 16, fill: "#c8d4e0" },
      { t: "poly", points: "16,3 20,8 12,8", fill: "#dce6f0" },
      { t: "rect", x: 11, y: 20, w: 10, h: 2.4, fill: "#c4a35a" },
      { t: "rect", x: 14.5, y: 22, w: 3, h: 6, fill: "#6a4a28" },
    ],
  },
  wooden_bow: {
    bg: "#24301c",
    rim: "#90b060",
    shapes: [
      { t: "path", d: "M10 6 Q4 16 10 26", stroke: "#8a5a28", sw: 2.2, fill: "none", lc: "round" },
      { t: "path", d: "M10 6 L10 26", stroke: "#e8e0d0", sw: 1, fill: "none" },
      { t: "path", d: "M10 16 L22 14", stroke: "#c4c8d0", sw: 1.4, fill: "none" },
    ],
  },
  leather_armor: {
    bg: "#2a2018",
    rim: "#c07848",
    shapes: [
      { t: "path", d: "M10 10 L8 26 L24 26 L22 10 L16 14 Z", fill: "#a06038" },
      { t: "rect", x: 13, y: 8, w: 6, h: 5, rx: 1, fill: "#c07848" },
      { t: "path", d: "M12 16 L20 16", stroke: "#7a4020", sw: 1.2, fill: "none" },
    ],
  },
  wooden_shield: {
    bg: "#2c2418",
    rim: "#d0a060",
    shapes: [
      { t: "path", d: "M16 5 L26 10 L24 22 L16 28 L8 22 L6 10 Z", fill: "#b07840" },
      { t: "path", d: "M16 8 L16 24 M10 14 L22 14", stroke: "#d8b070", sw: 1.4, fill: "none" },
    ],
  },
  ...CROP_ORE_ITEM_ICON_SPECS,
};

/**
 * Returns the paint spec for a catalog item, or a generic bag fallback.
 *
 * @param itemId - Catalog item id (unknown ids use fallback).
 * @returns Icon background, rim, and SVG shapes.
 */
export function inventoryItemIconSpec(itemId: string): ItemIconSpec {
  if (itemId in ITEM_ICON_SPECS) {
    return ITEM_ICON_SPECS[itemId as ItemId];
  }
  return FALLBACK;
}

/**
 * True when every catalog ItemId has a dedicated icon spec.
 *
 * @returns Whether the icon map covers {@link ITEMS}.
 */
export function inventoryIconsCoverCatalog(): boolean {
  return (Object.keys(ITEMS) as ItemId[]).every((id) => Boolean(ITEM_ICON_SPECS[id]));
}
