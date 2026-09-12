import { describe, expect, it } from "vitest";
import {
  buildingPanelIntent,
  defaultClosedPanelIds,
  resolveContextualWalkAway,
  resolvePanelHotkey,
  toggleHudPanel,
} from "../../apps/web/lib/hud/panel-orchestration";

describe("CityLands CL6.2 panel orchestration", () => {
  it("toggles panels open/close and routes walk-up buildings (happy)", () => {
    expect(toggleHudPanel(null, "inventory")).toBe("inventory");
    expect(toggleHudPanel("inventory", "inventory")).toBe(null);
    expect(toggleHudPanel("inventory", "travel")).toBe("travel");

    expect(buildingPanelIntent({ id: "m1", type: "mill" })).toEqual({
      type: "craft",
      station: "mill",
      buildingId: "m1",
    });
    expect(buildingPanelIntent({ id: "ab1", type: "alchemy_bench" })).toEqual({
      type: "craft",
      station: "alchemy_bench",
      buildingId: "ab1",
    });
    expect(buildingPanelIntent({ id: "p1", type: "portal" })).toEqual({
      type: "travel",
    });
    expect(
      buildingPanelIntent({
        id: "n1",
        type: "tutorial_npc",
        tutorialNpcId: "farmer",
      }),
    ).toEqual({ type: "tutorial_npc", professionId: "farmer" });
    expect(buildingPanelIntent({ id: "a1", type: "arena_board" })).toEqual({
      type: "arena",
    });
    expect(buildingPanelIntent({ id: "n1", type: "notice_board" })).toEqual({
      type: "notice",
    });
    expect(buildingPanelIntent({ id: "rm1", type: "realm_market" })).toEqual({
      type: "realm_market",
      buildingId: "rm1",
    });

    const openInv = resolvePanelHotkey(
      { code: "KeyI", repeat: false, target: null },
      { visiting: false },
    );
    expect(openInv).toEqual({ action: "toggle", panel: "inventory" });

    const travel = resolvePanelHotkey(
      { code: "KeyN", repeat: false, target: null },
      { visiting: false },
    );
    expect(travel).toMatchObject({
      action: "toggle",
      panel: "travel",
      preventDefault: true,
    });

    expect(
      resolvePanelHotkey(
        { code: "KeyE", repeat: false, target: null },
        { visiting: false },
      ),
    ).toEqual({ action: "interact", preventDefault: true });
  });

  it("blocks travel/visit hotkeys while visiting; ignores text inputs (edge)", () => {
    expect(
      resolvePanelHotkey(
        { code: "KeyN", repeat: false, target: null },
        { visiting: true },
      ),
    ).toEqual({ action: "none", preventDefault: true });
    expect(
      resolvePanelHotkey(
        { code: "KeyV", repeat: false, target: null },
        { visiting: true },
      ),
    ).toEqual({ action: "none" });

    const input = { tagName: "INPUT" } as unknown as EventTarget;
    expect(
      resolvePanelHotkey(
        { code: "KeyI", repeat: false, target: input },
        { visiting: false },
      ),
    ).toEqual({ action: "none" });

    expect(
      resolvePanelHotkey(
        { code: "KeyI", repeat: true, target: null },
        { visiting: false },
      ),
    ).toEqual({ action: "none" });

    expect(buildingPanelIntent({ id: "o1", type: "ore_node" })).toBeNull();
    expect(
      buildingPanelIntent({ id: "n2", type: "tutorial_npc", tutorialNpcId: null }),
    ).toBeNull();

    // Reason: contextual panels must stay closed-by-default (no always-on columns).
    const closed = defaultClosedPanelIds();
    expect(closed).toContain("quests");
    expect(closed).toContain("market");
    expect(closed).toContain("travel");
    expect(closed).toContain("arena");
    expect(closed).toContain("notice");
    expect(closed).not.toContain(null as unknown as string);
  });

  it("closes contextual panels on walk-away; leaves others alone (failure)", () => {
    expect(
      resolveContextualWalkAway({
        panel: "craft",
        craftStation: "mill",
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: null,
      }),
    ).toEqual({ close: true, clearCraft: true });

    expect(
      resolveContextualWalkAway({
        panel: "craft",
        craftStation: "mill",
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: { id: "m1", type: "mill" },
      }),
    ).toEqual({ close: false });

    expect(
      resolveContextualWalkAway({
        panel: "vendor",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: { id: "x", type: "portal" },
      }),
    ).toEqual({ close: true });

    expect(
      resolveContextualWalkAway({
        panel: "market",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: "board-1",
        realmMarketId: null,
        targetBuilding: { id: "other", type: "market_board" },
      }),
    ).toEqual({ close: true, clearMarketBoard: true });

    expect(
      resolveContextualWalkAway({
        panel: "notice",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: { id: "x", type: "portal" },
      }),
    ).toEqual({ close: true });

    expect(
      resolveContextualWalkAway({
        panel: "notice",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: { id: "nb", type: "notice_board" },
      }),
    ).toEqual({ close: false });

    expect(
      resolveContextualWalkAway({
        panel: "realm_market",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: "rm-1",
        targetBuilding: { id: "other", type: "vendor_stall" },
      }),
    ).toEqual({ close: true, clearRealmMarket: true });

    expect(
      resolveContextualWalkAway({
        panel: "deeds",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: null,
      }),
    ).toEqual({ close: false });

    expect(
      resolveContextualWalkAway({
        panel: "inventory",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: null,
      }),
    ).toEqual({ close: false });

    expect(
      resolvePanelHotkey(
        { code: "KeyZ", repeat: false, target: null },
        { visiting: false },
      ),
    ).toEqual({ action: "none" });
  });
});
