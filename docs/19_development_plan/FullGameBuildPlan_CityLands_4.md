# Full Game Build Plan — CityLands Phase 4 (CL18+)

**Status:** Done sequel (CL18–CL22 complete; next = CityLands_5)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_3.md](FullGameBuildPlan_CityLands_3.md) (CL13–CL17), [_2](FullGameBuildPlan_CityLands_2.md) (CL8–CL12), [base](FullGameBuildPlan_CityLands.md) (CL1–CL7)  
**Next plan:** [FullGameBuildPlan_CityLands_5.md](FullGameBuildPlan_CityLands_5.md) (CL23+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen player-driven economy: correct profession XP routing, light Fisher catch loop, Alchemist practice wiring, land→market tips. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL18 — Profession XP fidelity (gather / build)

| ID | Work | Acceptance |
| --- | --- | --- |
| CL18.1 | **Forester XP column.** Stop routing `gatherWood` / tree stump through carpenter XP; add `foresterXp` progress. | Chop grants forester XP; carpenter unchanged; migration + tests |
| CL18.2 | **Miner XP column.** Stop routing `gatherOre` through blacksmith XP; add `minerXp` progress. | Ore grants miner XP; blacksmith craft XP unchanged; migration + tests |
| CL18.3 | **Builder XP on place.** Grant builder profession XP when `placeLandStation` succeeds (economy ladder, not warrior). | Place grants builder XP; city place still blocked; tests |

---

# Phase CL19 — Fisher real catch loop (light)

| ID | Work | Acceptance |
| --- | --- | --- |
| CL19.1 | **Fish item + fishing dock on player land.** Add catchable fish + `fishing_dock` to `PLAYER_LAND_STATIONS` (Content Lock costs). | Build board lists dock; unlimited on land; city place blocked |
| CL19.2 | **Scarce city fishing dock.** Exactly one shared dock on city template; `CITY_PRACTICE_STATIONS.fisher = ["fishing_dock"]`. | City has 1 dock; land place OK; no homestead refill |
| CL19.3 | **Retarget Fisher tutor + tip.** Objective uses fish (not raw_meat proxy); update notice tip; remove defer copy. | Claim via fish; tip matches practice station |

---

# Phase CL20 — Alchemist practice path

| ID | Work | Acceptance |
| --- | --- | --- |
| CL20.1 | **Wire Alchemist city practice to Kitchen.** Set `CITY_PRACTICE_STATIONS.alchemist = ["kitchen"]`; update notice tip (kitchen = brew stand-in until dedicated bench). | Practice map non-null; tip no longer says “deferred forever”; no invented alchemy combat |
| CL20.2 | **Alchemist brew clarity.** Ensure `brew_stew` / kitchen path stays cook craft but tutor copy + tip explain Alchemist practice at shared Kitchen. | Happy claim still works; copy consistent |

---

# Phase CL21 — Land→market / explore craft tips

| ID | Work | Acceptance |
| --- | --- | --- |
| CL21.1 | **Post-craft market tip.** One-shot onboarding or notice tip after first land craft nudges City Vendor/Market list (min HUD). | Dismissible / walk-up; no always-on column |
| CL21.2 | **Explore mats → craft chain tip.** Notice tip: leather/tusk/wood from Explore feed land/city crafts (weave, cook, carpenter). | Tip id stable; smoke can assert presence |

---

# Phase CL22 — Verification

| ID | Work | Acceptance |
| --- | --- | --- |
| CL22.1 | **Regression smoke after CL18–CL21.** Extend `citylands-smoke-cl7` (or successor) for XP columns, fisher dock, practice maps, tips. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL18.1 → CL18.2 → CL18.3 → CL19.1 → CL19.2 → CL19.3 → CL20.1 → CL20.2 → CL21.1 → CL21.2 → CL22.1
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_3.md` | Phase 3 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
