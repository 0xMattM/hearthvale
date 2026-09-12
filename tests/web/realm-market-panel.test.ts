import fs from "node:fs";
import path from "path";
import { describe, expect, it } from "vitest";
import type { BuildingDto } from "@game/shared";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import { shouldPlayRealmMarketOpenAccent } from "../../apps/web/lib/hud/inventory-open-accent";
import {
  buildingPanelIntent,
  resolveContextualWalkAway,
  resolvePanelHotkey,
} from "../../apps/web/lib/hud/panel-orchestration";
import type { InteractTarget } from "../../apps/web/components/land-scene/landProximity";

function building(
  type: BuildingDto["type"],
  extra: Partial<BuildingDto> = {},
): BuildingDto {
  return {
    id: "b1",
    type,
    slotIndex: 0,
    x: 0,
    z: 0,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt: null,
    claim: null,
    tutorialNpcId: null,
    ...extra,
  };
}

function buildingTarget(
  type: BuildingDto["type"],
  extra: Partial<BuildingDto> = {},
): InteractTarget {
  return { kind: "building", dist: 1, building: building(type, extra) };
}

const STALL_PANEL = path.join(
  process.cwd(),
  "apps/web/components/hud/RealmMarketPanel.tsx",
);
const CREDITCOIN_PANEL = path.join(
  process.cwd(),
  "apps/web/components/hud/CreditcoinPanel.tsx",
);
const GAME_APP = path.join(
  process.cwd(),
  "apps/web/components/GameApp.tsx",
);

/**
 * Walk-up REALM stall opens its own desk, not the B Creditcoin tabs.
 */
describe("REALM market stall panel", () => {
  it("routes E to a dedicated stall menu (happy)", () => {
    expect(buildingPanelIntent({ id: "rm1", type: "realm_market" })).toEqual({
      type: "realm_market",
      buildingId: "rm1",
    });
    expect(
      resolveInteractPrompt({
        target: buildingTarget("realm_market"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "REALM Market", showKey: true });
    const stallSrc = fs.readFileSync(STALL_PANEL, "utf8");
    expect(stallSrc).toContain("creditcoin-realm-market");
    expect(stallSrc).toContain("RealmMarketPanel");
    expect(fs.readFileSync(GAME_APP, "utf8")).toContain(
      'setPanel("realm_market")',
    );
    expect(shouldPlayRealmMarketOpenAccent(null, "realm_market")).toBe(true);
  });

  it("closes the stall on walk-away only when opened from E (edge)", () => {
    expect(
      resolveContextualWalkAway({
        panel: "realm_market",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: "rm-1",
        targetBuilding: { id: "rm-1", type: "realm_market" },
      }),
    ).toEqual({ close: false });

    expect(
      resolveContextualWalkAway({
        panel: "realm_market",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: "rm-1",
        targetBuilding: { id: "coins", type: "market_board" },
      }),
    ).toEqual({ close: true, clearRealmMarket: true });
  });

  it("does not put listings on B or walk-away close a B desk (failure)", () => {
    const creditcoinSrc = fs.readFileSync(CREDITCOIN_PANEL, "utf8");
    expect(creditcoinSrc).not.toContain("onListItem");
    expect(creditcoinSrc).not.toContain("focusMarket");
    expect(creditcoinSrc).not.toContain("creditcoin-realm-market");

    expect(
      resolveContextualWalkAway({
        panel: "deeds",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: { id: "x", type: "portal" },
      }),
    ).toEqual({ close: false });

    expect(
      resolvePanelHotkey(
        { code: "KeyB", repeat: false, target: null },
        { visiting: false },
      ),
    ).toEqual({
      action: "toggle",
      panel: "deeds",
      clearRealmMarket: true,
    });
    expect(shouldPlayRealmMarketOpenAccent("deeds", "deeds")).toBe(false);
    expect(shouldPlayRealmMarketOpenAccent("realm_market", "realm_market")).toBe(
      false,
    );
  });
});
