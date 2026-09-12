import { describe, expect, it } from "vitest";
import { CombatHud } from "../../apps/web/components/hud/CombatHud";
import { liveCombatInteractLabel } from "../../apps/web/lib/hud/combat-prompt";
import type { LiveCombatDto } from "@game/shared";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const active: LiveCombatDto = {
  active: true,
  buildingId: "trail-1",
  zone: "game_trail",
  foeName: "Forest Hare",
  foeHealth: 12,
  foeMaxHealth: 24,
  playerHealth: 80,
  playerMaxHealth: 100,
  blocking: false,
  weaponStyle: "melee",
  canAttackAt: 0,
  foeX: 0,
  foeZ: 0,
  homeX: 0,
  homeZ: 0,
  foeYaw: 0,
  inStrikeRange: true,
  foeLunging: false,
};

describe("combat HUD + prompt", () => {
  it("renders foe/you bars while a fight is active (happy)", () => {
    const html = renderToStaticMarkup(createElement(CombatHud, { combat: active }));
    expect(html).toContain("data-testid=\"combat-hud\"");
    expect(html).toContain("Forest Hare");
    expect(html).toContain("12/24");
    expect(html).toContain("80/100");
    expect(html).toContain("In combat");
    expect(html).toContain("Attack");
  });

  it("names bow shots and incoming lunges (edge)", () => {
    expect(
      liveCombatInteractLabel(
        { ...active, weaponStyle: "ranged", blocking: true },
        "trail-1",
      ),
    ).toBe("LMB Shoot · RMB Guard");
    expect(
      liveCombatInteractLabel({ ...active, foeLunging: true }, "trail-1"),
    ).toBe("Incoming — RMB Guard");
  });

  it("hides when idle or targeting another building (failure)", () => {
    const html = renderToStaticMarkup(
      createElement(CombatHud, { combat: { ...active, active: false } }),
    );
    expect(html).toBe("");
    expect(liveCombatInteractLabel(active, "other")).toBeNull();
    expect(liveCombatInteractLabel(null, "trail-1")).toBeNull();
  });
});
