# Full Game Build Plan — CityLands Phase 21 (CL87+)

**Status:** Done sequel (CL87–CL90 complete; next = CityLands_22 → CityLands_23)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_20.md](FullGameBuildPlan_CityLands_20.md) (CL83–CL86), [_19](FullGameBuildPlan_CityLands_19.md), [_18](FullGameBuildPlan_CityLands_18.md), [_17](FullGameBuildPlan_CityLands_17.md), [_16](FullGameBuildPlan_CityLands_16.md), [_15](FullGameBuildPlan_CityLands_15.md), [_14](FullGameBuildPlan_CityLands_14.md), [_13](FullGameBuildPlan_CityLands_13.md), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_22.md](FullGameBuildPlan_CityLands_22.md) (CL91–CL94 done) → [FullGameBuildPlan_CityLands_23.md](FullGameBuildPlan_CityLands_23.md) (CL95+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **city scarce vs land unlimited** contention fidelity, re-verify **Fisher/Alchemist/Cook tutor claims + land flour City sink**, and polish **Explore premium wood / mail·market cancel / notice·warrior** after CL83–CL86 Explore craft / sinks / social / HUD. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / wars stay in FutureIdeas.

---

# Phase CL87 — City scarce vs land unlimited

| ID | Work | Acceptance |
| --- | --- | --- |
| CL87.1 | **City scarce kitchen/workshop craft contention still green.** Soft presence `stationBusy` on city craft; land unlimited. | City busy; land OK |
| CL87.2 | **City scarce tree/ore gather contention still green.** Soft presence lock on city gatherWood/gatherOre; land unlimited. | City busy; land OK |
| CL87.3 | **Land unlimited craft (no stationBusy) still green.** Peer nearby on player_land does not block craft. | Land craft OK with peer |

---

# Phase CL88 — Tutor claims + land flour sink

| ID | Work | Acceptance |
| --- | --- | --- |
| CL88.1 | **Fisher tutor claim after land dock catch still green.** Land dock → City Fisher claim; incomplete refuse. | Claim OK; incomplete refuse |
| CL88.2 | **Alchemist tutor claim after land brew still green.** Land brew tonic → City Alchemist claim; incomplete refuse. | Claim OK; incomplete refuse |
| CL88.3 | **Land flour City vendor sink still green.** Land mill flour → City vendor; empty refuse. | Happy sell; ≥1 failure |

---

# Phase CL89 — Explore premium + social escrow

| ID | Work | Acceptance |
| --- | --- | --- |
| CL89.1 | **Explore premium wood sell still green.** Explore rate > City; empty refuse. | Rate holds; empty refuse |
| CL89.2 | **Mail cancel returns escrow still green.** Send → cancel restore; cancel-not-yours refuse. | Happy cancel; ≥1 failure |
| CL89.3 | **Market cancel returns escrow still green.** List → cancel restore; cancel-not-yours refuse. | Happy cancel; ≥1 failure |

---

# Phase CL90 — Verify + regression

| ID | Work | Acceptance |
| --- | --- | --- |
| CL90.1 | **Notice tip / scarce_stations fidelity still green.** Tip ids stable; scarce vs unlimited land copy. | Assert tips; no invent |
| CL90.2 | **Warrior arena optional still green.** Arena walk-up copy; no combat balance invent. | Assert prompt; optional path |
| CL90.3 | **Regression smoke after CL87–CL90.** Companion: city scarce busy + land unlimited, Fisher/Alchemist claims, flour sink, Explore wood premium, mail/market cancel, notice/warrior. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL87.1 → CL87.2 → CL87.3 → CL88.1 → CL88.2 → CL88.3 → CL89.1 → CL89.2 → CL89.3 → CL90.1 → CL90.2 → CL90.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_20.md` | Phase 20 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
