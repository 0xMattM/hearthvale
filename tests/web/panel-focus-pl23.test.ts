import { describe, expect, it } from "vitest";
import {
  isHudPanelOpen,
  shouldShowInteractPromptWithPanel,
  shouldShowOnboardingWithPanel,
} from "../../apps/web/lib/hud/panel-focus";

/**
 * PL2.3 — Single contextual panel focus (soft dim / clear stacking).
 */
describe("CityLands PL2.3 panel focus", () => {
  it("treats a walk-up panel as open focus (happy)", () => {
    expect(isHudPanelOpen("craft")).toBe(true);
    expect(isHudPanelOpen("notice")).toBe(true);
    expect(shouldShowInteractPromptWithPanel("craft", "Use Mill")).toBe(false);
    expect(shouldShowOnboardingWithPanel("vendor")).toBe(false);
  });

  it("restores prompt + tips when panels close (happy close)", () => {
    expect(isHudPanelOpen(null)).toBe(false);
    expect(shouldShowInteractPromptWithPanel(null, "Build stations")).toBe(
      true,
    );
    expect(shouldShowOnboardingWithPanel(null)).toBe(true);
  });

  it("keeps prompt hidden with null label even when closed (edge)", () => {
    expect(shouldShowInteractPromptWithPanel(null, null)).toBe(false);
    expect(shouldShowInteractPromptWithPanel("market", null)).toBe(false);
  });

  it("refuses stacking prompt over an open panel (failure)", () => {
    expect(shouldShowInteractPromptWithPanel("travel", "Travel · free · City")).toBe(
      false,
    );
    expect(shouldShowOnboardingWithPanel("inventory")).toBe(false);
  });
});
