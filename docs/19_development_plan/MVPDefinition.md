# MVP Definition

**Document Version:** 1.0.0  
**Status:** Active  
**Owner:** Product & Game Design  
**Last Updated:** July 30, 2026

---

# Purpose

Define the smallest playable product that proves the core fantasy:

> A player starts with almost nothing, produces through professions, trades with others, and feels meaningful session progress—without needing blockchain, guilds, or combat as the center.

If the MVP is fun, expand. If not, redesign before scaling content.

---

# Out Of Scope (MVP)

Explicitly deferred:

- NFT land minting and on-chain marketplace
- Guilds, territory wars, open PvP
- Dungeons, bosses, raids
- AI systems beyond basic NPC helpers
- Regional economies, taxes, multi-currency complexity
- Full biome / creature / weapon catalogs
- Story campaign / deep lore quests

Blockchain may be stubbed or omitted; ownership remains server-authoritative for MVP.

---

# In Scope (MVP Vertical Slice)

## Player Fantasy

1. Receive one **Starter Land**.
2. Gather / grow basic resources.
3. Process and craft along **one complete chain**.
4. Trade with another player (or a temporary soft NPC seed for empty markets only).
5. Spend soft currency / materials to expand efficiency on the same land.
6. End every session with visible progress (XP, stock, better tools, or land upgrades).

## Professions (exactly two)

| Profession | Role in slice |
| --- | --- |
| Farmer | Produce crops / plant inputs |
| Blacksmith (or Cook—pick one at kickoff) | Transform inputs into tools/food that farmers and hunters need |

Default recommendation: **Farmer + Blacksmith** (tools create a clear sink and progression).

## Production Chain (one)

Example default:

```
Seed / Crop
    ↓
Harvest
    ↓
Process (mill / smelt intermediate if needed)
    ↓
Craft Tool or Food
    ↓
Use / Trade / Durability sink
    ↓
Demand for more crops & craft mats
```

Lock the exact recipe list in catalogs when implementation starts; keep ≤ 15 craftable SKUs.

## Land

- One Starter Land per account.
- Limited build slots (enough for the chain).
- No NFT bonuses.
- Safe from PvP.

## Economy

- Soft currency only.
- Player-to-player trade (direct trade and/or simple marketplace listings).
- At least two sinks: crafting cost + tool durability (or food consumption).
- NPC vendors only for tutorial items / junk sinks—not primary resource buyers.

## Combat (optional thin slice)

- Optional: one public animal-hunting spot dropping leather/meat used by the craft chain.
- If included, keep attributes to Health / Damage / Defense; no bosses.

## Progression

- Character XP and profession XP.
- Tool tiers (T1 → T2) within the chain.
- No deep talent trees.

## Multiplayer

- Shared world or instanced lands with visit/trade capability.
- Basic chat or trade UI sufficient.

---

# Success Criteria

MVP is validated when playtests show:

1. Players specialize or trade rather than everyone crafting everything efficiently.
2. Sessions feel productive (pillar: every session creates progress).
3. Soft currency and mats do not infinitely inflate over a 1–2 week playtest.
4. New players can complete the chain without reading design docs.
5. No feature requires wallet connection to enjoy core play.

---

# Failure Criteria

Redesign before expanding if:

- Trade never happens because one profession self-supplies everything.
- Combat or idle waiting becomes the only efficient path.
- Players report wasted sessions.
- Soft currency has no sinks.

---

# Deliverables Checklist

```
[x] Starter land + basic buildings for the chain
[x] Farmer loop (plant → harvest → process)
[x] Second profession craft loop
[x] Soft currency earn + spend
[x] Durability or consumable sink
[x] Player trade path
[x] Tutorial / early game onboarding (see EarlyGameExperience)
[x] Telemetry: prices, supply, session length, trade volume
[x] No wallet required
```

---

# Mapping To Docs

| Topic | Canonical doc |
| --- | --- |
| Vision / pillars | `01_project_foundation/` |
| Loop | `02_game_design/GameplayLoop.md` |
| Early game | `02_game_design/EarlyGameExperience.md` |
| Economy rules | `07_economy/Economy.md` |
| Lands | `03_world_building/Lands.md` |
| Professions | `06_character_systems/Professions.md` |
| Roadmap phases | `19_development_plan/DevelopmentRoadmap.md` |
| Milestones | `19_development_plan/MilestonePlanning.md` |

---

# Exit To Post-MVP

Only after success criteria pass, prioritize in order:

1. Third profession + longer chains  
2. Public exploration / light combat mats  
3. Guilds social layer  
4. NFT land as optional production upside (still no combat power)  
5. Broader catalogs and regions  

---

# Final Statement

The MVP proves the economy sandbox—not the full MMO. Ship the smallest loop that creates specialization, trade, and session progress.
