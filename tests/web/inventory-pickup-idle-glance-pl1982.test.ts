import { describe, expect, it } from "vitest";
import {
  INVENTORY_PICKUP_SLOT_FLASH,
  shouldFlashInventoryPickupSlots,
} from "../../apps/web/lib/hud/inventory-pickup-slot-flash";
import {
  ENERGY_METER_IDLE_GLANCE,
  HEALTH_METER_IDLE_GLANCE,
  MAP_CHIP_IDLE_GLANCE,
} from "../../apps/web/lib/hud/topbar-chrome";
import {
  INVENTORY_PICKUP_IDLE_GLANCE,
  inventoryPickupIdleGlanceLabel,
  shouldArmInventoryPickupIdleGlance,
  shouldShowInventoryPickupIdleGlance,
} from "../../apps/web/lib/hud/inventory-pickup-idle-glance";

/**
 * PL198.2 — Inventory-pickup idle soft glance leftover.
 * Choice: quiet periodic TopBar I · Bag chip breath after recent pickup while
 * Inventory closed (complements slot flash; no always-on inventory column).
 */
describe("CityLands PL198.2 inventory-pickup idle soft glance leftover", () => {
  it("arms quiet I · Bag chip after recent pickup while bag closed (happy)", () => {
    expect(shouldArmInventoryPickupIdleGlance(true, ["stack-a"])).toBe(true);
    expect(shouldShowInventoryPickupIdleGlance(true, false)).toBe(true);
    expect(inventoryPickupIdleGlanceLabel()).toBe("I · Bag");
    expect(INVENTORY_PICKUP_IDLE_GLANCE.className).toBe(
      "topbar-inventory-pickup-glance",
    );
    expect(INVENTORY_PICKUP_IDLE_GLANCE.periodMs).toBeGreaterThanOrEqual(3000);
    expect(INVENTORY_PICKUP_IDLE_GLANCE.periodMs).toBeLessThanOrEqual(9000);
    expect(INVENTORY_PICKUP_IDLE_GLANCE.lingerMs).toBeGreaterThan(
      INVENTORY_PICKUP_SLOT_FLASH.durationMs,
    );
    expect(INVENTORY_PICKUP_IDLE_GLANCE.periodMs).not.toBe(
      ENERGY_METER_IDLE_GLANCE.periodMs,
    );
    expect(INVENTORY_PICKUP_IDLE_GLANCE.periodMs).not.toBe(
      HEALTH_METER_IDLE_GLANCE.periodMs,
    );
    expect(INVENTORY_PICKUP_IDLE_GLANCE.periodMs).not.toBe(
      MAP_CHIP_IDLE_GLANCE.periodMs,
    );
  });

  it("clears while inventory open or linger inactive (edge)", () => {
    expect(shouldShowInventoryPickupIdleGlance(true, true)).toBe(false);
    expect(shouldShowInventoryPickupIdleGlance(false, false)).toBe(false);
    expect(shouldShowInventoryPickupIdleGlance(false, true)).toBe(false);
    expect(shouldArmInventoryPickupIdleGlance(false, ["stack-a"])).toBe(false);
    expect(shouldArmInventoryPickupIdleGlance(true, [])).toBe(false);
    expect(shouldFlashInventoryPickupSlots(true, ["stack-a"])).toBe(true);
  });

  it("does not invent inventory columns, fares, or capacity rules (failure)", () => {
    expect(shouldShowInventoryPickupIdleGlance(false, false)).toBe(false);
    expect(String(INVENTORY_PICKUP_IDLE_GLANCE.className)).not.toMatch(
      /column|toast|stack|fare|nft|combat/i,
    );
    expect(INVENTORY_PICKUP_IDLE_GLANCE.periodMs).toBe(7200);
    expect(INVENTORY_PICKUP_IDLE_GLANCE.lingerMs).toBe(10_000);
    expect(INVENTORY_PICKUP_IDLE_GLANCE.hotkey).toBe("I");
    expect(INVENTORY_PICKUP_SLOT_FLASH.durationMs).toBe(500);
  });
});
