/**
 * Vendor stall look — canvas awning + timber table, not wood-grain tarp or mud cube.
 */
export const VENDOR_STALL_LOOK = {
  awningKind: "cloth",
  counterKind: "wood",
  produceKind: "solid",
  hasFilledCommercePad: false,
} as const;

/**
 * True when the awning reads as cloth, not timber grain.
 */
export function vendorAwningIsCloth(): boolean {
  return VENDOR_STALL_LOOK.awningKind === "cloth";
}

/**
 * True when the counter is a timber table, not plaster dirt.
 */
export function vendorCounterIsTimber(): boolean {
  return VENDOR_STALL_LOOK.counterKind === "wood";
}

/**
 * True when the beige circular commerce disc is still drawn under the stall.
 */
export function vendorStallHasFilledPad(): boolean {
  return VENDOR_STALL_LOOK.hasFilledCommercePad;
}
