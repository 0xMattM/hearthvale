import { describe, expect, it } from "vitest";
import {
  VISIT_INTERACT_LEGACY_STICKY,
  isVisitInteractLegacySticky,
  visitInteractStickyInfo,
} from "../../apps/web/lib/hud/visit-interact";
import {
  resolvePanelHotkey,
  type PanelHotkeyContext,
} from "../../apps/web/lib/hud/panel-orchestration";
import { isCoreSuccessCueText } from "../../apps/web/lib/hud/success-cue";

const visitingCtx: PanelHotkeyContext = {
  visiting: true,
};

/**
 * PL31.1 — Visit interact sticky declutter.
 * Banner + Esc/Go home cover stay; trade hotkey T unchanged.
 */
describe("CityLands PL31.1 visit interact sticky declutter", () => {
  it("returns no sticky leave/trade prose on visit E (happy)", () => {
    expect(visitInteractStickyInfo()).toBeNull();
    expect(isVisitInteractLegacySticky(VISIT_INTERACT_LEGACY_STICKY)).toBe(
      true,
    );
    expect(isVisitInteractLegacySticky(visitInteractStickyInfo())).toBe(false);
    expect(isCoreSuccessCueText(VISIT_INTERACT_LEGACY_STICKY)).toBe(false);
  });

  it("keeps trade hotkey T while visiting (edge)", () => {
    const trade = resolvePanelHotkey(
      { code: "KeyT", repeat: false, target: null },
      visitingCtx,
    );
    expect(trade).toEqual({ action: "toggle", panel: "trade" });

    const interact = resolvePanelHotkey(
      { code: "KeyE", repeat: false, target: null },
      visitingCtx,
    );
    expect(interact.action).toBe("interact");
  });

  it("does not treat legacy sticky as ephemeral; empty stays quiet (failure)", () => {
    expect(
      isVisitInteractLegacySticky(
        "Visiting bob. Esc or Go home to leave.",
      ),
    ).toBe(false);
    expect(isVisitInteractLegacySticky(null)).toBe(false);
    expect(isVisitInteractLegacySticky("")).toBe(false);
    expect(isCoreSuccessCueText("Visiting · bob")).toBe(true);
    expect(isCoreSuccessCueText("Home")).toBe(true);
  });
});
