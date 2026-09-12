# Player Vision — City / Lands / Explore / Warrior

**Document Version:** 1.3.0  
**Status:** Product direction override (redesign open)  
**Source:** Player-clarified vision, 2026-08-01 (answers updated same day)  
**Last Updated:** August 1, 2026  

> This document is the **source of truth** for world layout and session fantasy while the map redesign is open. Do not invent beyond what is stated here. Unspecified items live under **Open Questions**.

---

# Pillar

**Real player-driven economy.** Players may dedicate to **any profession**.

---

# Problem with current build

All mechanics are piled onto **one land**, with a **cluttered HUD**. Production, market, tutorial, hunting, and warrior-adjacent loops share a single starter yard. That contradicts the intended separate spaces below.

---

# Profession list (canonical — do not invent)

Full list is already documented. **Source of truth:** [`docs/06_character_systems/Professions.md`](../06_character_systems/Professions.md) (*Profession Categories* — “The first version of the game includes the following professions”). Indexed from [`PROJECTBIBLE.md`](../../PROJECTBIBLE.md).

### Resource Gathering

- Farmer
- Animal Breeder
- Forester
- Miner
- Fisher
- Animal Hunter
- Monster Hunter

### Material Processing

- Carpenter
- Blacksmith
- Cook
- Weaver
- Alchemist

### Construction

- Builder

Vision notes that align with this list (not new professions): tutorial NPCs use names like lumberjack / carpenter / farmer as examples — **lumberjack ↔ Forester**; exploration’s “two hunting professions” ↔ **Animal Hunter** + **Monster Hunter**. **Warrior** is an optional parallel combat path (arena / wars), **not** a required class and **not** part of the economy profession ladder — see OQ-PV-002 resolved.

---

# Four map spaces (separate — not one starter yard)

## 1. City

- **Only the city** — small but not tiny.
- Main city buildings.
- **Tutorial NPCs:** one per profession (canonical list above) via quest-style tutorials that show basics, tools needed, and buildings needed.
- **Market:** players buy and list produced goods; an NPC sells **basic tools and seeds**.
- Other city services: event board, NPCs for tokens / NFT lands, etc.
- **Limited city production** = scarce **shared workstations** in the city (not abstract daily/qty caps). Examples of sparsity (illustrative, not exact locked counts): one carpenter table, one blacksmith table, one forge, a couple trees to chop, a few crop plots, a few rocks, and similarly sparse stations for each profession. Players without land output can still produce here by competing for those stations.

## 2. Player lands

- First land: **free, small**.
- Later: buy larger **NFT lands as separate maps** (not expanding the same plot).
- A new land starts **empty**.
- Player builds production on land: 1×1 crop plots, trees to chop, carpenter table, and equivalent stations for each profession — **as many of each station as they want** (many carpenter tables, many plots, etc.).

## 3. Exploration map

- Animals + beasts → **Animal Hunter** + **Monster Hunter** (see profession list above).
- Freeform large map (or many sections) with trees, mines, animals, beasts.

## 4. Warrior

- Optional **parallel combat path** (arena PvP vs players or wars) — pursued **separately** from crafting / gathering profession dedication.
- **Not** a required class; **not** mixed into the economy profession ladder.
- **Not** jammed into the homestead.
- Do not invent combat balance here.

---

# Travel (resolved)

**Free travel** between the four map spaces: **City ↔ Player lands ↔ Exploration ↔ Warrior / arena**.

No travel timer, soft-currency road cost, or gated caravan is required for this redesign direction. (Prior MVP caravan timer was an old single-world implementation detail — do not treat it as the product rule for map-to-map movement.)

---

# HUD (resolved)

Show the **absolute minimum** on screen (status that must stay visible while walking the world).

Menus, dashboards, and panels open when the player **interacts or does something** (walk-up / context at stations, NPCs, market, etc.) — **not** as a permanent cluttered overlay.

Aligns in spirit with [`docs/12_ui_ux/UIUXOverview.md`](../12_ui_ux/UIUXOverview.md) (*HUD Minimum* / minimal HUD principle); this vision overrides any habit of keeping craft/buy/trade/quest columns always open.

---

# Explicit non-goals for this redesign (from vision)

- Do **not** keep everything on one starter yard.
- Do **not** expand a single plot into NFT land — NFT land = **new separate map**.
- Do **not** put warrior training on the homestead.
- Do **not** keep a permanent cluttered HUD of menus and dashboards.

---

# Implementation freeze note

Feature / content queue from **F16.2–F17.5** (and further content rollover aimed at the old single-land layout) is **superseded** by the redesign plan: [`FullGameBuildPlan_CityLands.md`](FullGameBuildPlan_CityLands.md). Do not ship new gameplay that deepens the one-land pile-up outside that plan. The autonomous loop must pull CL\* tasks and must not invent past this vision.  

---

# Resolved (player answers)

| ID | Resolution |
| --- | --- |
| OQ-PV-001 | Profession list = canonical list in `docs/06_character_systems/Professions.md` (cited above). Do not invent. |
| OQ-PV-002 | Warrior matters less than farmer / professions. It is an **optional parallel combat path** (arena / wars), independent of profession dedication — not a required class and not mixed into the economy profession ladder. No combat balance invented here. |
| OQ-PV-003 | Free travel between City / Lands / Exploration / Warrior maps. |
| OQ-PV-004 | Absolute minimum on-screen HUD; menus/panels open on walk-up / context interaction only. |
| OQ-PV-005 | **No** abstract daily/qty caps. City limit = **scarce shared workstations** (e.g. one carpenter table, one blacksmith table, one forge, a couple trees, a few crop plots, a few rocks, similarly sparse per profession). On **player land**, build as many of each station as wanted. Exact city station counts not locked beyond these examples. |

---

# Open Questions

None currently. Do not invent further rules without a new player clarification.

---

# Related

| File | Role |
| --- | --- |
| `PLANNING.md` | Points here as product direction override while redesign is open |
| `TASKS.md` | Live CityLands Polish (PL\*) queue; F16.2–F17.5 deferred; CL99+ recycle frozen |
| `docs/06_character_systems/Professions.md` | Canonical profession list (OQ-PV-001 closed by citation) |
| `docs/12_ui_ux/UIUXOverview.md` | Prior minimal-HUD principle (aligned with OQ-PV-004) |
| `docs/03_world_building/World.md` | Prior “travel freely between locations” (aligned with OQ-PV-003) |
| `docs/19_development_plan/AgentAutonomousLoop.md` | Loop process; pulls PL\* acceptance from CityLands_Polish plan |
| `docs/19_development_plan/MVPDefinition.md` / `MVPContentLock.md` | Prior MVP lock — superseded for **world layout** by this doc until redesign lands |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_40.md` | **Live** product polish plan |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_36.md` | PL176–PL180 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_34.md` | PL166–PL170 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_25.md` | PL121–PL125 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_22.md` | PL106–PL110 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_18.md` | PL86–PL90 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_17.md` | PL81–PL85 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_14.md` | PL68–PL72 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_13.md` | PL63–PL67 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_12.md` | PL58–PL62 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_10.md` | PL48–PL52 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_9.md` | PL43–PL47 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_8.md` | PL38–PL42 (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands.md` | Original redesign build plan (CL1–CL7) |
| `docs/19_development_plan/FullGameBuildPlan.md` | Legacy F8–F17; Continuations → CityLands |
