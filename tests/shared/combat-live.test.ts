import { describe, expect, it } from "vitest";
import {
  COMBAT,
  LIVE_COMBAT,
  applyLiveCombatAction,
  autoResolveLiveCombat,
  combatLoadoutBonuses,
  combatEngageRange,
  createLiveCombatState,
  huntFoeIdleOffset,
  isAttackOnCooldown,
  strikeDamage,
  stepHuntFoeVisual,
  stepCombatFoeDisplay,
  tickLiveCombat,
} from "../../packages/shared/src/index.ts";
import { TRAIL_CREATURE } from "../../packages/shared/src/catalog.ts";

describe("realtime hunt combat", () => {
  function starterState(now = 0) {
    return createLiveCombatState({
      buildingId: "trail-1",
      zone: "game_trail",
      foe: TRAIL_CREATURE,
      playerHealth: COMBAT.maxHealthStart,
      playerMaxHealth: COMBAT.maxHealthStart,
      playerDamage: COMBAT.damageStart,
      playerDefense: COMBAT.defenseStart,
      blockReduction: LIVE_COMBAT.unarmedBlockReduction,
      style: "melee",
      now,
      homeX: 0,
      homeZ: 0,
      playerX: 0,
      playerZ: 0,
    });
  }

  it("lets the starter player win the forest hare in a running fight (happy)", () => {
    const result = autoResolveLiveCombat(starterState(), 0);
    expect(result.won).toBe(true);
    expect(result.state.foeHealth).toBe(0);
    expect(result.state.playerHealth).toBeGreaterThan(0);
    expect(result.state.rounds).toBeGreaterThan(0);
    const spawn = starterState();
    expect(
      Math.hypot(spawn.foeX - spawn.homeX, spawn.foeZ - spawn.homeZ),
    ).toBeGreaterThan(LIVE_COMBAT.wanderRadius * 0.45);
    expect(combatEngageRange("game_trail")).toBeGreaterThan(
      LIVE_COMBAT.wanderRadius,
    );
    expect(combatEngageRange("game_trail")).toBeLessThan(
      LIVE_COMBAT.wanderRadius + LIVE_COMBAT.aggroRange,
    );
  });

  it("lets the hare close in and bite without a player click (edge)", () => {
    let current = {
      ...starterState(0),
      foeX: 3,
      foeZ: 0,
      playerX: 0,
      playerZ: 0,
      lastFoeAttackAt: 0,
      lastTickAt: 0,
    };
    let last = tickLiveCombat(current, 0, 0, LIVE_COMBAT.tickMs);
    expect(last.state.foeX).toBeLessThan(3);
    expect(last.playerHit).toBe(0);
    current = last.state;
    for (let t = LIVE_COMBAT.tickMs * 2; t <= 2500 && last.playerHit === 0; t += LIVE_COMBAT.tickMs) {
      last = tickLiveCombat(current, 0, 0, t);
      current = last.state;
    }
    expect(last.playerHit).toBeGreaterThan(0);
    expect(last.state.playerHealth).toBeLessThan(COMBAT.maxHealthStart);
    expect(last.state.lungeUntilMs).toBeGreaterThan(0);
  });

  it("block window reduces an incoming bite; a far swing misses (failure)", () => {
    const opened = applyLiveCombatAction(starterState(0), "block", 10);
    expect(opened.finished).toBe(false);
    const inRange = {
      ...opened.state,
      foeX: 0,
      foeZ: 0,
      playerX: 0,
      playerZ: 0,
      lastFoeAttackAt: 20 - LIVE_COMBAT.hareAttackMs,
      lastTickAt: 20,
    };
    const bite = tickLiveCombat(inRange, 0, 0, 20);
    expect(bite.blocked).toBe(true);
    const unblocked = strikeDamage(TRAIL_CREATURE.damage, COMBAT.defenseStart);
    expect(bite.playerHit).toBeLessThan(unblocked);

    const farSwing = applyLiveCombatAction(
      { ...starterState(0), playerX: 8, playerZ: 0, foeX: 0, foeZ: 0 },
      "attack",
      50,
    );
    expect(farSwing.missed).toBe(true);
    expect(farSwing.foeHit).toBe(0);
    expect(isAttackOnCooldown(farSwing.state, 100)).toBe(true);
  });
});

describe("combat loadout bonuses", () => {
  it("adds sword damage and leather defense (happy)", () => {
    const bonuses = combatLoadoutBonuses({
      weaponItemId: "iron_sword",
      armorItemId: "leather_armor",
      shieldItemId: "wooden_shield",
    });
    expect(bonuses.damage).toBe(8);
    expect(bonuses.defense).toBe(8);
    expect(bonuses.style).toBe("melee");
    expect(bonuses.twoHanded).toBe(false);
  });

  it("bow is two-handed and ignores the shield (edge)", () => {
    const bonuses = combatLoadoutBonuses({
      weaponItemId: "wooden_bow",
      shieldItemId: "wooden_shield",
    });
    expect(bonuses.style).toBe("ranged");
    expect(bonuses.twoHanded).toBe(true);
    expect(bonuses.defense).toBe(0);
  });

  it("unknown ids add nothing (failure)", () => {
    expect(combatLoadoutBonuses({ weaponItemId: "wheat" }).damage).toBe(0);
  });
});

describe("hunt foe roam / chase visuals", () => {
  it("idle hare leaves the 1.15 pad (happy)", () => {
    const idle = huntFoeIdleOffset("hare", 0.3);
    let x = idle.x;
    let z = idle.z;
    let yaw = 0;
    for (let i = 0; i < 80; i += 1) {
      const step = stepHuntFoeVisual({
        kind: "hare",
        dt: 0.05,
        x,
        z,
        yaw,
        playerLocalX: 20,
        playerLocalZ: 20,
        timeSec: i * 0.05,
        seed: 0.3,
        ready: true,
        combatActive: false,
      });
      x = step.x;
      z = step.z;
      yaw = step.yaw;
    }
    expect(Math.hypot(idle.x, idle.z)).toBeGreaterThan(0.8);
    expect(Math.hypot(x, z)).toBeGreaterThan(0.8);
    expect(Math.hypot(x, z)).toBeLessThanOrEqual(LIVE_COMBAT.wanderRadius + 0.2);
    expect(stepHuntFoeVisual({
      kind: "hare",
      dt: 0.05,
      x: 0,
      z: 0,
      yaw: 0,
      playerLocalX: 20,
      playerLocalZ: 20,
      timeSec: 0.4,
      seed: 0.3,
      ready: true,
      combatActive: false,
    }).chasing).toBe(false);
  });

  it("chases the player off the tile when aggroed (edge)", () => {
    let x = LIVE_COMBAT.wanderRadius;
    let z = 0;
    for (let i = 0; i < 90; i += 1) {
      const step = stepHuntFoeVisual({
        kind: "hare",
        dt: 0.05,
        x,
        z,
        yaw: 0,
        playerLocalX: 0,
        playerLocalZ: 0,
        timeSec: i * 0.05,
        seed: 0.1,
        ready: true,
        combatActive: true,
      });
      x = step.x;
      z = step.z;
    }
    expect(Math.hypot(x, z)).toBeLessThan(LIVE_COMBAT.stopDistance + 0.2);
  });

  it("keeps the arena dummy on the ring (failure)", () => {
    expect(huntFoeIdleOffset("dummy", 0.4)).toEqual({ x: 0, z: 0 });
    const idle = huntFoeIdleOffset("hare", 0.25);
    expect(Math.hypot(idle.x, idle.z)).toBeGreaterThan(0.7);
    expect(Math.hypot(idle.x, idle.z)).toBeLessThanOrEqual(
      LIVE_COMBAT.wanderRadius,
    );
    const step = stepHuntFoeVisual({
      kind: "dummy",
      dt: 0.05,
      x: 0,
      z: 0,
      yaw: 0,
      playerLocalX: 4,
      playerLocalZ: 0,
      timeSec: 2,
      seed: 0.2,
      ready: true,
      combatActive: true,
    });
    expect(step.x).toBe(0);
    expect(step.z).toBe(0);
  });
});

describe("combat foe display follows the server", () => {
  const base = {
    kind: "hare" as const,
    dt: 0.05,
    yaw: 0,
    playerLocalX: 0,
    playerLocalZ: 0,
    timeSec: 1,
    seed: 0.2,
    ready: true,
  };

  it("lerps onto the live fight pose (happy)", () => {
    const step = stepCombatFoeDisplay({
      ...base,
      x: 8,
      z: 0,
      combatActive: true,
      serverOffsetX: 1,
      serverOffsetZ: 0,
      serverYaw: 0.4,
    });
    expect(step.x).toBeLessThan(8);
    expect(step.x).toBeGreaterThan(1);
    expect(step.chasing).toBe(true);
  });

  it("keeps dummy planted while facing the player (edge)", () => {
    const step = stepCombatFoeDisplay({
      ...base,
      kind: "dummy",
      x: 0,
      z: 0,
      combatActive: true,
      playerLocalX: 3,
      playerLocalZ: 0,
      serverOffsetX: 2,
      serverOffsetZ: 2,
      serverYaw: 1,
    });
    expect(step.x).toBe(0);
    expect(step.z).toBe(0);
  });

  it("idles off the pad when no fight is open (failure)", () => {
    let x = 0;
    let z = 0;
    for (let i = 0; i < 90; i += 1) {
      const step = stepCombatFoeDisplay({
        ...base,
        x,
        z,
        combatActive: false,
        playerLocalX: 20,
        playerLocalZ: 20,
        serverOffsetX: 0,
        serverOffsetZ: 0,
        serverYaw: 0,
        timeSec: i * 0.05,
      });
      x = step.x;
      z = step.z;
    }
    expect(Math.hypot(x, z)).toBeGreaterThan(0.8);
  });
});
