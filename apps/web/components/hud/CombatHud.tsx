"use client";

import React from "react";
import type { LiveCombatDto } from "@game/shared";

interface CombatHudProps {
  combat: LiveCombatDto | null | undefined;
}

/**
 * Encounter HUD for an in-progress Explore / Arena fight.
 *
 * @param props - Live combat DTO from player state.
 */
export function CombatHud({ combat }: CombatHudProps) {
  if (!combat?.active) return null;
  const foePct = Math.max(
    0,
    Math.round((combat.foeHealth / Math.max(1, combat.foeMaxHealth)) * 100),
  );
  const youPct = Math.max(
    0,
    Math.round((combat.playerHealth / Math.max(1, combat.playerMaxHealth)) * 100),
  );
  const strike = combat.weaponStyle === "ranged" ? "Shoot" : "Attack";

  return (
    <div
      className="combat-hud"
      data-testid="combat-hud"
      data-combat-active="true"
      data-incoming={combat.foeLunging ? "1" : "0"}
    >
      <div className="combat-hud__kicker">In combat</div>
      <div className="combat-hud__row">
        <span className="combat-hud__foe">{combat.foeName}</span>
        <span className="combat-hud__hp">
          {combat.foeHealth}/{combat.foeMaxHealth}
        </span>
      </div>
      <div className="combat-hud__bar" data-testid="combat-hud-foe-bar">
        <span style={{ width: `${foePct}%` }} />
      </div>
      <div className="combat-hud__row">
        <span className="combat-hud__you">You</span>
        <span className="combat-hud__hp combat-hud__hp--you">
          {combat.playerHealth}/{combat.playerMaxHealth}
        </span>
      </div>
      <div className="combat-hud__bar combat-hud__bar--you" data-testid="combat-hud-you-bar">
        <span style={{ width: `${youPct}%` }} />
      </div>
      <div className="combat-hud__keys">
        <kbd>LMB</kbd> {strike}
        <kbd>RMB</kbd> Guard
      </div>
    </div>
  );
}
