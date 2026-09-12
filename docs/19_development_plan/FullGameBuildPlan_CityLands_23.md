# Full Game Build Plan — CityLands Phase 23 (CL95+)

**Status:** Done sequel (CL95–CL98 complete; next = CityLands_24)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_22.md](FullGameBuildPlan_CityLands_22.md) (CL91–CL94), [_21](FullGameBuildPlan_CityLands_21.md), [_20](FullGameBuildPlan_CityLands_20.md), [_19](FullGameBuildPlan_CityLands_19.md), [_18](FullGameBuildPlan_CityLands_18.md), [_17](FullGameBuildPlan_CityLands_17.md), [_16](FullGameBuildPlan_CityLands_16.md), [_15](FullGameBuildPlan_CityLands_15.md), [_14](FullGameBuildPlan_CityLands_14.md), [_13](FullGameBuildPlan_CityLands_13.md), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_24.md](FullGameBuildPlan_CityLands_24.md) (CL99+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **city scarce vs land unlimited** contention fidelity, re-verify **Fisher/Alchemist tutor claims + land flour City sink**, and polish **Explore premium wood / mail·market cancel / notice·warrior** after CL91–CL94 Explore craft / sinks / social / HUD. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / wars stay in FutureIdeas.  
> **Reuse note:** when acceptance matches an already-green suite (e.g. CL87–CL90), re-run that suite and mark the new ID done — do not clone identical test files.  
> **CL95–CL98 shipped via reuse:** existing CL87–CL90 suites (`city-scarce-craft-contention-cl871` … `citylands-smoke-cl903`) re-run green — no duplicate identical test files.

---

# Phase CL95 — City scarce vs land unlimited

| ID | Work | Acceptance |
| --- | --- | --- |
| CL95.1 | **City scarce kitchen/workshop craft contention still green.** Soft presence `stationBusy` on city craft; land unlimited. | City busy; land OK |
| CL95.2 | **City scarce tree/ore gather contention still green.** Soft presence lock on city gatherWood/gatherOre; land unlimited. | City busy; land OK |
| CL95.3 | **Land unlimited craft (no stationBusy) still green.** Peer nearby on player_land does not block craft. | Land craft OK with peer |

---

# Phase CL96 — Tutor claims + land flour sink

| ID | Work | Acceptance |
| --- | --- | --- |
| CL96.1 | **Fisher tutor claim after land dock catch still green.** Land dock → City Fisher claim; incomplete refuse. | Claim OK; incomplete refuse |
| CL96.2 | **Alchemist tutor claim after land brew still green.** Land brew tonic → City Alchemist claim; incomplete refuse. | Claim OK; incomplete refuse |
| CL96.3 | **Land flour City vendor sink still green.** Land mill flour → City vendor; empty refuse. | Happy sell; ≥1 failure |

---

# Phase CL97 — Explore premium + social escrow

| ID | Work | Acceptance |
| --- | --- | --- |
| CL97.1 | **Explore premium wood sell still green.** Explore rate > City; empty refuse. | Rate holds; empty refuse |
| CL97.2 | **Mail cancel returns escrow still green.** Send → cancel restore; cancel-not-yours refuse. | Happy cancel; ≥1 failure |
| CL97.3 | **Market cancel returns escrow still green.** List → cancel restore; cancel-not-yours refuse. | Happy cancel; ≥1 failure |

---

# Phase CL98 — Verify + regression

| ID | Work | Acceptance |
| --- | --- | --- |
| CL98.1 | **Notice tip / scarce_stations fidelity still green.** Tip ids stable; scarce vs unlimited land copy. | Assert tips; no invent |
| CL98.2 | **Warrior arena optional still green.** Arena walk-up copy; no combat balance invent. | Assert prompt; optional path |
| CL98.3 | **Regression smoke after CL95–CL98.** Companion: city scarce busy + land unlimited, Fisher/Alchemist claims, flour sink, Explore wood premium, mail/market cancel, notice/warrior. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL95.1 → CL95.2 → CL95.3 → CL96.1 → CL96.2 → CL96.3 → CL97.1 → CL97.2 → CL97.3 → CL98.1 → CL98.2 → CL98.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_22.md` | Phase 22 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
