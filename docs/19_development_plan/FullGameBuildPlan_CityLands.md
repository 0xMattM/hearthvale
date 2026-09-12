# Full Game Build Plan — City / Lands / Explore / Warrior

**Document Version:** 1.0.1  
**Status:** Done (CL1–CL7) — live queue is sequel  
**Owner:** Engineering  
**Last Updated:** August 1, 2026  

**Vision SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md) (v1.3+)  
**Canonical live checklist:** [TASKS.md](../../TASKS.md) (CityLands queue)  
**Sequel plan:** [FullGameBuildPlan_CityLands_2.md](FullGameBuildPlan_CityLands_2.md) (CL8+)  
**Prior plan:** [FullGameBuildPlan.md](FullGameBuildPlan.md) (F8–F15 shipped; F16.2–F17.5 deferred)  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)  

---

# Goal

Rebuild session fantasy around **four separate maps** with a real player-driven economy:

1. **City** — hub, tutorial NPCs, scarce shared workstations, market  
2. **Player land** — free small empty plot; player builds stations (unlimited per type)  
3. **Exploration** — gather + Animal Hunter / Monster Hunter hunt space  
4. **Warrior** — optional parallel arena path (later; not on profession ladder)

Travel between maps is **free** (no caravan timer / road cost). HUD is **absolute minimum**; panels open on walk-up / context only.

Professions = canonical list in [`docs/06_character_systems/Professions.md`](../06_character_systems/Professions.md). Do not invent professions or warrior balance.

---

# Non-goals (this plan)

- Do **not** keep production + market + tutorial + hunt + warrior on one starter yard.  
- Do **not** expand a single plot into NFT land (NFT land = new separate map later).  
- Do **not** put warrior training on the homestead.  
- Do **not** keep a permanent cluttered HUD of menus/dashboards.  
- Do **not** invent city daily/qty production caps (scarcity = shared stations only).  
- Do **not** deepen F16.2–F17.5 / single-land content until CityLands phases land.  
- Do **not** implement full profession coverage or combat balance in early phases — stub depth where noted.

---

# Keep vs cut / defer (current build)

## Keep (reuse)

| Area | Touchpoints (indicative) |
| --- | --- |
| Auth / sessions | `apps/server` auth, local accounts |
| Economy actions | `apps/server/src/game/actions/*` (farm, craft, gather, market, trade, vendor) |
| Shared catalog / Content Lock numbers | `packages/shared` (`catalog`, combat, quests stubs) |
| R3F scene stack | `LandScene`, meshes, proximity, avatar kits |
| Realtime | `/ws` presence + chat, HTTP fallback |
| Multi-land plumbing | `lands.kind`, `activeLandId`, `/api/travel`, `TravelPanel` — **extend**, don’t throw away |
| Infra already done | F16.1 Postgres adapter |

## Cut or rework soon

| Current habit | Direction |
| --- | --- |
| `ensureStarterYardBuildings` dumps full yard | Stop auto-filling player land; city gets its own scarce template |
| Homestead = market + hunt trail + everything | Split by map kind |
| Caravan timer / coin-or-ration travel (`TRAVEL`, `travel_arrive_at`) | Not the product rule for City↔Lands↔Explore↔Warrior; free travel |
| `GameApp.tsx` always-on panel soup + hotkey dump | Minimal chrome; contextual panels |
| `starter` / `forest` as the only kinds | Evolve toward `city` / `player_land` / `explore` / `warrior` (names may alias during migration) |

## Defer

- F16.2–F17.5 platform / EA gate (Docker, CI, wipe policy, etc.) — infra-only OK later, not blocking CityLands  
- Full tutorial NPC per every profession (seed 3–4 first; framework must scale)  
- NFT / premium lands as separate maps (deed stubs exist; wire after empty-land loop)  
- Warrior PvP balance, wars, gear ladders  
- Guild claim wars / deeper live-ops (keep existing guild code; don’t expand on homestead)

---

# Phase order

```
CL1 Strip + map routing skeleton
 → CL2 City hub (NPCs, scarce stations, market stub)
 → CL3 Empty player land + build stations
 → CL4 Exploration hunt map
 → CL5 Warrior arena stub (optional / thin)
 → CL6 Minimal contextual HUD
 → CL7 Travel polish + four-map smoke
```

**Depth rule:** finish a believable **city + land** production/market loop before investing in warrior. Exploration may land before warrior; HUD can start thinning in CL1/CL2 but the dedicated minimal-HUD pass is CL6.

---

# Working rules

1. One agent-sized task per tick; mark `TASKS.md` immediately.  
2. Prefer additive schema migrations; note wipe only if unavoidable.  
3. Walk-to-interact remains mandatory — no dashboard-only gameplay.  
4. NFT / wallet never grants combat power.  
5. Tests: ≥1 happy + ≥1 fail/edge when touching logic (`/tests` mirroring app structure).  
6. Do not invent past PlayerVision; open questions are closed — ask a human before new rules.  
7. Economy numbers still respect Content Lock unless a task explicitly amends them.

---

# Phase CL1 — Strip starter clutter + map routing skeleton

| ID | Work | Acceptance |
| --- | --- | --- |
| CL1.1 | **Stop starter-yard-everything.** Gate or remove full `STARTER_BUILDINGS` auto-ensure on active land; introduce map-kind model (`city` / `player_land` / `explore` / `warrior` — migrate or alias `starter`/`forest` with clear comments). New/returning players resolve to a defined default map without a packed homestead. | Player land (or successor of `starter`) no longer auto-spawns mill+forge+kitchen+vendor+trail pile; schema/shared `LandKind` documents the four spaces; existing DB rows migrate or map safely |
| CL1.2 | **Free travel skeleton.** Extend `/api/travel` + `travelToLandKind` so City↔Lands↔Explore↔Warrior switches **without** caravan timer/cost for these routes; ensure destination land rows exist (shared city / per-player land / explore / warrior stub). | Travel API accepts the four kinds; arrive immediately; no coin/ration spend for these routes; client `TravelPanel` lists all four |
| CL1.3 | **Client map routing.** `LandScene` / environments branch on map kind; `GameApp` loads the active map after travel; presence channel keys by active land/map. | Switching maps changes scene template; no crash on empty player land; remote presence still scoped to current map |

---

# Phase CL2 — City hub

| ID | Work | Acceptance |
| --- | --- | --- |
| CL2.1 | **City template + scarce shared stations.** Author a city land (global or instanced-shared) with sparse stations aligned to vision examples (e.g. few plots/trees/rocks, one carpenter table, one blacksmith/forge-class station — exact counts illustrative). Production uses existing action pipeline; stations are contendable (no abstract daily caps). | City map loads; scarce stations interactable; producing there works; player cannot “own-expand” city into a full private yard |
| CL2.2 | **Tutorial NPC framework + seed NPCs.** Walk-up NPCs with quest-style tutorials teaching basics / tools / buildings needed. Seed **at least three** from the canonical list (e.g. Farmer, Forester↔lumberjack, Carpenter). Framework must allow one NPC per remaining profession later. | Interact opens tutorial/quest panel (not permanent HUD); claim/progress persists; no new invented professions |
| CL2.3 | **City market stub.** Player list/buy of produced goods (reuse market actions) + NPC vendor for **basic tools and seeds** on the city map (not homestead-only). | Buy tools/seeds from city NPC; list/buy player goods from city market interaction; panels open on walk-up |

---

# Phase CL3 — Player land loop

| ID | Work | Acceptance |
| --- | --- | --- |
| CL3.1 | **Empty free player land.** First land is small and **starts empty** (no pre-built production chain). Visit/load does not re-seed starter clutter. | Fresh land has zero (or only non-production markers like a build board); ensure*Yard helpers do not refill production buildings |
| CL3.2 | **Build stations on land (unlimited per type).** Player places profession stations (plots, trees, carpenter table, etc.) via build flow; **as many of each type as wanted** (vision OQ-PV-005). Reuse/extend `actions/build` + catalog building types. | Can place ≥2 of the same station type; craft/grow on owned stations; city scarcity rules do not apply on player land |

---

# Phase CL4 — Exploration map

| ID | Work | Acceptance |
| --- | --- | --- |
| CL4.1 | **Exploration map template.** Large (or multi-section stub) map with trees, mines, and hunt-relevant nodes — not on player land. | Explore kind loads distinct scene; gather nodes work with existing gather/hunt actions where applicable |
| CL4.2 | **Relocate hunt loop off homestead.** Animal Hunter / Monster Hunter encounters live on exploration (move trail/edge fight off starter yard). Homestead/city do not host the main hunt loop. | Winning a hunt on explore grants expected mats/XP; starter/player land has no required hunt trail |

---

# Phase CL5 — Warrior (optional, thin)

| ID | Work | Acceptance |
| --- | --- | --- |
| CL5.1 | **Warrior arena stub map.** Enter/exit via free travel; placeholder arena space only. No combat balance, no gear ladder, no forcing warrior on new players. | Warrior map loads; clearly optional; no profession-ladder coupling; no homestead warrior training |

---

# Phase CL6 — Minimal contextual HUD

| ID | Work | Acceptance |
| --- | --- | --- |
| CL6.1 | **Strip persistent chrome.** On-screen while walking: only must-have status (e.g. energy, coins, compact identity). Quest/market/craft/trade/guild/mail/achievements/settings **closed by default**; open on interact or explicit open control — not a permanent multi-column dump. | Default play view is uncluttered; walk-up still opens the right panel |
| CL6.2 | **Split `GameApp` panel orchestration.** Extract panel/hotkey routing from monolith `GameApp.tsx` into focused modules (HUD shell + map-aware interactions) so new maps don’t grow the dump. | GameApp shrinks or delegates; behavior parity for open/close; no new always-on columns |

---

# Phase CL7 — Travel polish + verification

| ID | Work | Acceptance |
| --- | --- | --- |
| CL7.1 | **Travel UX polish.** Clear in-world or map UI for free City↔Lands↔Explore↔Warrior; document that legacy caravan timer is not the CityLands rule (keep code path inert or legacy-only if needed). | Player can complete a full circuit of four maps without timer/cost; UI copy matches free travel |
| CL7.2 | **Four-map smoke tests.** Automated coverage: travel matrix, city scarce produce, empty land + build, explore hunt entry, warrior enter/exit, HUD default-closed panels. | Tests green for happy + at least one failure/edge per new critical path; README/play tip points at City as default hub if changed |

---

# Priority order for the agent

```
CL1.1 → CL1.2 → CL1.3 → CL2.1 → CL2.2 → CL2.3 → CL3.1 → CL3.2
 → CL4.1 → CL4.2 → CL5.1 → CL6.1 → CL6.2 → CL7.1 → CL7.2
```

Within a phase: lowest incomplete ID first. Prefer finishing CL2–CL3 depth before expanding CL5.

---

# Suggested code touchpoints (non-exhaustive)

| Concern | Likely files |
| --- | --- |
| Land kinds / travel | `packages/shared` land constants; `apps/server/src/game/land.ts`; `player.ts` `ensureStarterYardBuildings`; `/api/travel` in `app.ts` |
| City / empty land templates | New template modules beside forest/starter building lists; DB `lands.kind` |
| Client maps | `LandScene.tsx`, `HomesteadEnvironment` / new City & Explore environments; `TravelPanel.tsx` |
| HUD | `GameApp.tsx`, `components/hud/*`, `InteractPrompt.tsx` |
| Economy reuse | `actions/farming|crafting|gathering|market|vendor|build|hunting` |
| Quests / NPCs | `quests.ts` + shared quest defs; city NPC buildings or interact targets |

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Locked product direction |
| `FullGameBuildPlan.md` | Legacy F8–F17 plan; Continuations points here |
| `TASKS.md` | Live CityLands queue |
| `PLANNING.md` | Stack + product override pointer |
| `AgentAutonomousLoop.md` | Tick rules; pull acceptance from this doc for CL* IDs |
