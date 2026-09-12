import { describe, expect, it } from "vitest";
import { CLAIM_NODE_CONTEST_SOFT_CUE, CLAIM_WAR } from "@game/shared";
import {
  SOFT_WAR_DELIVER_CLOSED_GLANCE,
  hasOpenSoftWarContest,
  isSoftWarDeliverReady,
  shouldShowSoftWarDeliverClosedGlance,
  softWarDeliverClosedGlanceLabel,
  softWarDeliverWoodQty,
} from "../../apps/web/lib/hud/soft-war-deliver-closed-glance";

/**
 * PL199.2 — Soft-war deliver soft glance leftover.
 * Choice: quiet TopBar E · Deliver chip while wood deliver is ready during an
 * open soft-war contest and claim interact not focused (complements contest
 * atmosphere + deliver rim; scoring SoT; min HUD).
 */
describe("CityLands PL199.2 soft-war deliver soft glance leftover", () => {
  const now = 1_000_000;
  const openContest = [
    {
      type: "claim_node" as const,
      claim: { contestEndsAt: now + 60_000 },
    },
  ];
  const closedContest = [
    {
      type: "claim_node" as const,
      claim: { contestEndsAt: now - 1 },
    },
  ];
  const withWood = [
    { itemId: CLAIM_WAR.deliverItemId, qty: 3 },
    { itemId: "stone", qty: 2 },
  ];
  const noWood = [
    { itemId: "stone", qty: 2 },
    { itemId: CLAIM_WAR.deliverItemId, qty: 0 },
  ];

  it("shows quiet E · Deliver chip while deliver ready and claim not focused (happy)", () => {
    expect(hasOpenSoftWarContest(openContest, now)).toBe(true);
    expect(softWarDeliverWoodQty(withWood)).toBe(3);
    expect(isSoftWarDeliverReady(openContest, withWood, true, now)).toBe(true);
    expect(
      shouldShowSoftWarDeliverClosedGlance(
        openContest,
        withWood,
        true,
        false,
        now,
      ),
    ).toBe(true);
    expect(softWarDeliverClosedGlanceLabel(true)).toBe("E · Deliver");

    expect(SOFT_WAR_DELIVER_CLOSED_GLANCE.hotkey).toBe("E");
    expect(SOFT_WAR_DELIVER_CLOSED_GLANCE.word).toBe("Deliver");
    expect(SOFT_WAR_DELIVER_CLOSED_GLANCE.borderColor).toBe(
      CLAIM_NODE_CONTEST_SOFT_CUE.emissive,
    );
    expect(SOFT_WAR_DELIVER_CLOSED_GLANCE.className).toBe(
      "topbar-soft-war-deliver-glance",
    );
  });

  it("clears when contest closed, no wood, no guild, or claim focused (edge)", () => {
    expect(hasOpenSoftWarContest(closedContest, now)).toBe(false);
    expect(hasOpenSoftWarContest([], now)).toBe(false);
    expect(softWarDeliverWoodQty(noWood)).toBe(0);
    expect(isSoftWarDeliverReady(openContest, withWood, false, now)).toBe(
      false,
    );
    expect(isSoftWarDeliverReady(openContest, noWood, true, now)).toBe(false);
    expect(isSoftWarDeliverReady(closedContest, withWood, true, now)).toBe(
      false,
    );
    expect(
      shouldShowSoftWarDeliverClosedGlance(
        openContest,
        withWood,
        true,
        true,
        now,
      ),
    ).toBe(false);
    expect(
      shouldShowSoftWarDeliverClosedGlance(
        openContest,
        withWood,
        false,
        false,
        now,
      ),
    ).toBe(false);
    expect(softWarDeliverClosedGlanceLabel(false)).toBe("");
  });

  it("does not invent claim column or change scoring SoT (failure)", () => {
    expect(SOFT_WAR_DELIVER_CLOSED_GLANCE.className).not.toMatch(
      /column|hud-claim-column|war-column/i,
    );
    expect(CLAIM_WAR.deliverItemId).toBe("wood");
    expect(CLAIM_WAR.windowMs).toBeGreaterThan(0);
    expect(softWarDeliverClosedGlanceLabel(true)).not.toMatch(/nft|combat/i);
    expect(
      shouldShowSoftWarDeliverClosedGlance(
        openContest,
        withWood,
        true,
        false,
        now,
      ),
    ).not.toBe(
      shouldShowSoftWarDeliverClosedGlance(
        openContest,
        withWood,
        true,
        true,
        now,
      ),
    );
    expect(String(SOFT_WAR_DELIVER_CLOSED_GLANCE.word)).not.toMatch(
      /toast|stack|fare/i,
    );
  });
});
