/**
 * Icon specs for expanded crop / mill food / ore SKUs.
 * Merged into {@link ITEM_ICON_SPECS} — catalog ids stay SoT in shared.
 */

import type { ItemIconSpec } from "./inventory-item-icons";

/** New farm + mine glyphs (wheat / iron keep their original specs). */
export const CROP_ORE_ITEM_ICON_SPECS: Record<
  | "corn_seed"
  | "corn"
  | "cornmeal"
  | "cornbread"
  | "potato_seed"
  | "potato"
  | "roast_potato"
  | "cotton_seed"
  | "cotton"
  | "herb_seed"
  | "herb"
  | "copper_ore"
  | "copper_bar"
  | "gold_ore"
  | "gold_bar",
  ItemIconSpec
> = {
  corn_seed: {
    bg: "#3a3a18",
    rim: "#d0b030",
    shapes: [
      { t: "ellipse", cx: 12, cy: 18, rx: 3, ry: 4.5, fill: "#e8c040" },
      { t: "ellipse", cx: 20, cy: 16, rx: 3, ry: 4.5, fill: "#d4a828" },
      { t: "ellipse", cx: 16, cy: 12, rx: 2.4, ry: 3.6, fill: "#f0d050" },
    ],
  },
  corn: {
    bg: "#3a3818",
    rim: "#f0d040",
    shapes: [
      { t: "ellipse", cx: 16, cy: 16, rx: 7, ry: 11, fill: "#e8c030" },
      { t: "path", d: "M16 6 L16 26", stroke: "#c4a020", sw: 1.2, fill: "none" },
      { t: "path", d: "M12 10 L12 22 M20 10 L20 22", stroke: "#d8b028", sw: 1, fill: "none" },
      { t: "poly", points: "16,4 20,8 12,8", fill: "#6a9a38" },
    ],
  },
  cornmeal: {
    bg: "#3a3420",
    rim: "#e8c060",
    shapes: [
      { t: "path", d: "M8 14 L10 26 L22 26 L24 14 Z", fill: "#e8c878" },
      { t: "ellipse", cx: 16, cy: 14, rx: 8, ry: 4, fill: "#f0d890" },
      { t: "rect", x: 13, y: 11, w: 6, h: 4, rx: 1, fill: "#c4a030" },
    ],
  },
  cornbread: {
    bg: "#4a3418",
    rim: "#e0a040",
    shapes: [
      { t: "rect", x: 7, y: 12, w: 18, h: 12, rx: 2, fill: "#d09030" },
      { t: "rect", x: 8, y: 13, w: 16, h: 4, rx: 1, fill: "#e8b850" },
      { t: "path", d: "M10 16 L14 20 L18 15 L22 19", stroke: "#a06820", sw: 1.2, fill: "none", lc: "round" },
    ],
  },
  potato_seed: {
    bg: "#3a2c1c",
    rim: "#c09058",
    shapes: [
      { t: "ellipse", cx: 13, cy: 18, rx: 4, ry: 3, fill: "#c4a070" },
      { t: "ellipse", cx: 20, cy: 14, rx: 3.5, ry: 2.6, fill: "#b09058" },
    ],
  },
  potato: {
    bg: "#3a2a1c",
    rim: "#c09050",
    shapes: [
      { t: "ellipse", cx: 16, cy: 17, rx: 10, ry: 7, fill: "#c4a070" },
      { t: "circle", cx: 12, cy: 15, r: 1.2, fill: "#6a4a28" },
      { t: "circle", cx: 19, cy: 18, r: 1.1, fill: "#6a4a28" },
      { t: "circle", cx: 16, cy: 13, r: 0.9, fill: "#6a4a28" },
    ],
  },
  roast_potato: {
    bg: "#3a2414",
    rim: "#d08038",
    shapes: [
      { t: "ellipse", cx: 16, cy: 17, rx: 10, ry: 7, fill: "#b06830" },
      { t: "ellipse", cx: 15, cy: 15, rx: 5, ry: 3.5, fill: "#d09048" },
      { t: "path", d: "M10 14 Q16 10 22 15", stroke: "#8a4820", sw: 1.2, fill: "none" },
    ],
  },
  cotton_seed: {
    bg: "#2c3228",
    rim: "#d8d0c4",
    shapes: [
      { t: "ellipse", cx: 16, cy: 18, rx: 3.2, ry: 4, fill: "#8a6a40" },
      { t: "circle", cx: 16, cy: 12, r: 4, fill: "#f0ece0" },
    ],
  },
  cotton: {
    bg: "#2c3228",
    rim: "#f0ece4",
    shapes: [
      { t: "circle", cx: 12, cy: 14, r: 5, fill: "#f4f0e8" },
      { t: "circle", cx: 20, cy: 16, r: 5.5, fill: "#e8e4d8" },
      { t: "circle", cx: 16, cy: 20, r: 4.5, fill: "#fffaf0" },
      { t: "rect", x: 15, y: 22, w: 2, h: 6, fill: "#6a8a48" },
    ],
  },
  herb_seed: {
    bg: "#1c2a20",
    rim: "#70c878",
    shapes: [
      { t: "ellipse", cx: 12, cy: 18, rx: 2.4, ry: 3.4, fill: "#5a9a58" },
      { t: "ellipse", cx: 20, cy: 16, rx: 2.4, ry: 3.4, fill: "#48a060" },
    ],
  },
  herb: {
    bg: "#1c2a1c",
    rim: "#78d080",
    shapes: [
      { t: "path", d: "M16 26 L16 10", stroke: "#4a7a40", sw: 1.8, fill: "none", lc: "round" },
      { t: "ellipse", cx: 12, cy: 12, rx: 5, ry: 3, fill: "#58b868" },
      { t: "ellipse", cx: 20, cy: 14, rx: 5, ry: 3, fill: "#70d080" },
      { t: "ellipse", cx: 16, cy: 8, rx: 3.5, ry: 2.4, fill: "#90e090" },
    ],
  },
  copper_ore: {
    bg: "#2c2218",
    rim: "#d07038",
    shapes: [
      { t: "poly", points: "8,20 12,10 22,9 26,18 18,26 9,24", fill: "#6a5040" },
      { t: "poly", points: "13,14 18,11 21,16 16,18", fill: "#d07038" },
      { t: "circle", cx: 15, cy: 20, r: 2.2, fill: "#e08040" },
    ],
  },
  copper_bar: {
    bg: "#2a2218",
    rim: "#e08040",
    shapes: [
      { t: "rect", x: 6, y: 12, w: 20, h: 8, rx: 1.5, fill: "#c06830" },
      { t: "rect", x: 7, y: 13, w: 18, h: 2, rx: 1, fill: "#e89050" },
      { t: "rect", x: 8, y: 18, w: 12, h: 1.2, fill: "#8a4820" },
    ],
  },
  gold_ore: {
    bg: "#2c2818",
    rim: "#e8c040",
    shapes: [
      { t: "poly", points: "8,20 12,10 22,9 26,18 18,26 9,24", fill: "#6a5a38" },
      { t: "poly", points: "13,14 18,11 21,16 16,18", fill: "#e8c040" },
      { t: "circle", cx: 15, cy: 20, r: 2.2, fill: "#f0d060" },
    ],
  },
  gold_bar: {
    bg: "#2c2814",
    rim: "#f0d050",
    shapes: [
      { t: "rect", x: 6, y: 12, w: 20, h: 8, rx: 1.5, fill: "#d4b030" },
      { t: "rect", x: 7, y: 13, w: 18, h: 2, rx: 1, fill: "#f0e080" },
      { t: "rect", x: 8, y: 18, w: 12, h: 1.2, fill: "#a08020" },
    ],
  },
};

