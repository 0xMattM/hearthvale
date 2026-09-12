import { describe, expect, it } from "vitest";
import {
  CLAIM_NODE,
  CLAIM_NODE_FIRST_WALKUP_WORLD_TIP,
  CLAIM_WAR,
  claimNodeFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_CLAIM_NODE_WALKUP_CUE,
  firstClaimNodeWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstClaimNodeWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL80.1 — First claim-node walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near claim beacon;
 * claim / war rules unchanged; min HUD.
 */
describe("CityLands PL80.1 first claim-node walk-up tip once", () => {
  it("flashes Grove · claim territory on first claim beacon proximity (happy)", () => {
    expect(firstClaimNodeWalkUpCueText()).toBe(FIRST_CLAIM_NODE_WALKUP_CUE);
    expect(firstClaimNodeWalkUpCueText()).toBe("Grove · claim territory");
    expect(firstClaimNodeWalkUpCueText().toLowerCase()).toMatch(/claim/);
    expect(isCoreSuccessCueText("Grove · claim territory")).toBe(true);
    expect(claimNodeFirstWalkUpWorldTip()).toBe(
      CLAIM_NODE_FIRST_WALKUP_WORLD_TIP,
    );
    expect(claimNodeFirstWalkUpWorldTip()).toMatch(/Claim/);
    expect(claimNodeFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstClaimNodeWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstClaimNodeWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstClaimNodeWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstClaimNodeWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstClaimNodeWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps claim / war rules and min HUD (failure)", () => {
    expect(CLAIM_NODE.claimEnergyCost).toBe(15);
    expect(CLAIM_NODE.produceQty).toBe(1);
    expect(CLAIM_WAR.startEnergyCost).toBe(10);
    expect(CLAIM_WAR.windowMs).toBe(3 * 60_000);
    expect(defaultClosedPanelIds()).not.toContain("claim");
    expect(firstClaimNodeWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(claimNodeFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Grove · sticky forever")).toBe(false);
    expect(shouldFlashFirstClaimNodeWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstClaimNodeWalkUpCue(true, true, true)).toBe(false);
  });
});
