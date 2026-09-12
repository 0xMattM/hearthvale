import { describe, expect, it } from "vitest";
import {
  KEYBINDS,
  formatKeybindHint,
  formatMinimalHudHint,
} from "@game/shared";
import {
  buildingPanelIntent,
  defaultClosedPanelIds,
  resolveContextualWalkAway,
  resolvePanelHotkey,
  type HudPanelId,
} from "../../apps/web/lib/hud/panel-orchestration";

/** All non-null HUD panel ids — walking chrome must not leave any open. */
const ALL_PANELS: Exclude<HudPanelId, null>[] = [
  "inventory",
  "craft",
  "vendor",
  "trade",
  "visit",
  "market",
  "realm_market",
  "chat",
  "guild",
  "quests",
  "tutorial_npc",
  "build",
  "achievements",
  "mail",
  "deeds",
  "settings",
  "travel",
  "decor",
  "arena",
  "notice",
  "plant",
];

const CRAFT_STATIONS = [
  "mill",
  "forge",
  "kitchen",
  "workshop",
  "loom",
  "alchemy_bench",
] as const;

describe("CityLands CL46.2 Min HUD walk-up panel fidelity", () => {
  it("keeps notice + craft + all key panels closed-by-default (happy)", () => {
    const closed = defaultClosedPanelIds();
    expect(closed).toContain("notice");
    expect(closed).toContain("craft");
    expect(closed).toEqual(ALL_PANELS);
    expect(closed).not.toContain(null as unknown as string);

    for (const station of CRAFT_STATIONS) {
      expect(buildingPanelIntent({ id: `${station}-1`, type: station })).toEqual({
        type: "craft",
        station,
        buildingId: `${station}-1`,
      });
    }
    expect(buildingPanelIntent({ id: "nb1", type: "notice_board" })).toEqual({
      type: "notice",
    });

    const hint = formatMinimalHudHint();
    expect(hint).toBe("E interact · N travel · P land · H help");
    expect(hint.split(" · ").length).toBeLessThanOrEqual(4);
    expect(hint.length).toBeLessThan(formatKeybindHint().length);
  });

  it("opens craft only via station walk-up — no craft hotkey (edge)", () => {
    // Reason: KeyC is chat, not craft — craft stays walk-up-only (no permanent column).
    const keyC = resolvePanelHotkey(
      { code: "KeyC", repeat: false, target: null },
      { visiting: false },
    );
    expect(keyC).toEqual({ action: "toggle", panel: "chat" });

    const panelHotkeys = [
      "KeyI",
      "KeyP",
      "KeyT",
      "KeyN",
      "KeyV",
      "KeyM",
      "KeyC",
      "KeyG",
      "KeyQ",
      "KeyJ",
      "KeyL",
      "KeyB",
      "KeyH",
    ] as const;
    for (const code of panelHotkeys) {
      const result = resolvePanelHotkey(
        { code, repeat: false, target: null },
        { visiting: false },
      );
      if (result.action === "toggle") {
        expect(result.panel).not.toBe("craft");
        expect(result.panel).not.toBe("notice");
      }
    }

    expect(KEYBINDS.some((b) => /craft/i.test(b.label) && b.group === "panels")).toBe(
      false,
    );
    expect(KEYBINDS.some((b) => /notice/i.test(b.label))).toBe(false);

    expect(
      resolveContextualWalkAway({
        panel: "craft",
        craftStation: "kitchen",
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: { id: "k1", type: "kitchen" },
      }),
    ).toEqual({ close: false });
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
  });

  it("does not invent always-on craft/notice columns (failure)", () => {
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
        panel: "notice",
        craftStation: null,
        tutorialProfessionId: null,
        marketBoardId: null,
        realmMarketId: null,
        targetBuilding: { id: "x", type: "portal" },
      }),
    ).toEqual({ close: true });

    // Ore nodes / pens are immediate actions — not permanent craft HUD.
    expect(buildingPanelIntent({ id: "o1", type: "ore_node" })).toBeNull();
    expect(buildingPanelIntent({ id: "p1", type: "animal_pen" })).toBeNull();

    const hint = formatMinimalHudHint().toLowerCase();
    expect(hint).not.toContain("craft");
    expect(hint).not.toContain("market");
    expect(hint).not.toContain("quest");
  });
});
