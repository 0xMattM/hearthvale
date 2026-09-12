# Combat

**Document Version:** 1.0.0  
**Status:** Active  
**Owner:** Game Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

Combat defines how players fight creatures and participate in structured territory conflict.

Combat is **one profession among many**. It generates exclusive resources, creates risk, and drives demand for crafted gear—without becoming the only viable progression path.

A player can become wealthy without fighting. A dedicated hunter can build a career through combat.

---

# Design Goals

- Support the player-driven economy.
- Reward preparation, skill, and cooperation.
- Introduce risk without permanent progression loss.
- Keep combat from dominating wealth generation.
- Keep personal lands safe (no open-world land PvP).

---

# Functional Requirements

| ID | Requirement |
| --- | --- |
| COMBAT-001 | Players may fight wild animals. |
| COMBAT-002 | Players may fight monsters. |
| COMBAT-003 | Players may participate in structured territory wars. |
| COMBAT-004 | Combat consumes energy. |
| COMBAT-005 | Combat grants Character Experience. |
| COMBAT-006 | Combat grants Monster Hunter (or equivalent) profession XP. |
| COMBAT-007 | Defeated enemies drop economy-relevant resources. |

---

# Combat Philosophy

Combat exists to generate resources and opportunities—not as the central objective of the game.

Players fight because they need materials, want dangerous exploration, or join guild conflicts—not because the game forces a combat treadmill.

---

# Combat Types

## PvE

- Animal hunting
- Monster hunting
- Boss encounters

Primary purpose: resource acquisition and risk/reward.

## PvP (structured only in v1+)

- Territory wars
- Guild wars
- Future arenas

Open-world PvP is intentionally excluded. Personal lands stay safe production spaces.

---

# Combat Loop

```
Prepare Equipment & Consumables
        ↓
Travel to public hunting / danger zones
        ↓
Fight
        ↓
Collect Rewards
        ↓
Repair / Upgrade / Trade
        ↓
Fight Stronger Targets
```

---

# Enemy Types

| Type | Examples | Typical outputs |
| --- | --- | --- |
| Wild animals | Deer, boar, rabbit, wolf | Meat, leather, bones, fur |
| Monsters | Spider, golem, swamp beast | Rare crafting components |
| Bosses | Group content | Unique materials (not complete gear dumps) |

Animals and monsters exist in **public world areas**. Player lands are safe.

---

# Preparation

Before combat, players choose risk level and loadout.

**Equipment** (player-crafted): weapons, armor, shields — blacksmith, weaver, carpenter. NPCs do not sell advanced combat gear.

**Consumables**: food, potions, temporary boosts — cook, alchemist.

**Strategy**: which enemies, which region, how much energy to spend.

---

# Version 1 Attributes (Keep Simple)

| Attribute | Role |
| --- | --- |
| Health | Damage absorbable |
| Damage | Damage dealt |
| Defense | Damage reduction |
| Speed | Move / attack efficiency |

Effectiveness should come from equipment, preparation, and decisions—not only character level.

---

# Equipment Durability

Combat (and tools) reduce durability. Repair consumes materials.

Purpose: continuous economic demand (sink), not punishment.

---

# Death

Consequences without rage-quit design. Version 1 may include:

- Respawn delay
- Energy loss
- Durability loss

Players never lose permanent progression or ownership of lands.

After a downed fight, health floors at 1 HP. Health regenerates slowly over time (same cadence as energy) while not in an open fight. Eating cooked food, rations, tonic, or a cloth bandage also restores health — it does not change damage or defense.

---

# Rewards

Prefer rare materials and crafting components over large soft-currency dumps.

Boss materials should feed advanced recipes through other professions (e.g. rare scale → blacksmith → marketplace).

---

# Economy Relationships

```
Miner → Metal → Blacksmith → Weapons → Hunter → Monster Mats → Alchemist → Potions
```

Combat stimulates demand across professions. It must not be the primary currency faucet.

Related: [Monsters.md](Monsters.md), [BossSystem.md](BossSystem.md), [DungeonSystem.md](DungeonSystem.md), [Energy.md](Energy.md), [../07_economy/Economy.md](../07_economy/Economy.md).

---

# Territory Wars

Only in designated public regions. Personal land ownership is never at stake.

Controlled territories may grant production / gathering / exclusive-resource access—not raw PvP power from NFT land ownership.

Detailed territory rules: post-MVP doc (tracked in Open Questions / backlog).

---

# Anti Pay-To-Win

Combat power depends on equipment, profession progression, preparation, and skill.

NFT lands never grant direct combat advantages.

---

# New Player Path

Early combat teaches basic hunting, simple enemies, and the need for crafted equipment before dangerous zones unlock.

---

# Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Combat is the only profitable activity | Keep farming/mining/crafting equally valuable |
| Players ignore combat | Gate key recipes behind exclusive monster mats |
| Death feels unfair | Limit to durability, energy, travel time |

---

# Future Expansion

Dungeons, world bosses, seasonal invasions, migrations, arenas, sieges, mount combat.

Must strengthen the economy, not create a separate power ladder.

---

# Open Questions

Monster migration, weather effects, dynamic scaling, food combat bonuses, guild hunting camps — see [OpenQuestions.md](../20_appendices/OpenQuestions.md).

---

# Final Statement

Combat is an economic profession first. It introduces valuable resources, meaningful risk, and demand for gear, food, and cooperation—without competing against every other playstyle.
