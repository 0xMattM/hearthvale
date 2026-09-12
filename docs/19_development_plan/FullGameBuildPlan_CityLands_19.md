# Full Game Build Plan — CityLands Phase 19 (CL79+)

**Status:** Done sequel (CL79–CL82 complete; next = CityLands_20)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_18.md](FullGameBuildPlan_CityLands_18.md) (CL75–CL78), [_17](FullGameBuildPlan_CityLands_17.md), [_16](FullGameBuildPlan_CityLands_16.md), [_15](FullGameBuildPlan_CityLands_15.md), [_14](FullGameBuildPlan_CityLands_14.md), [_13](FullGameBuildPlan_CityLands_13.md), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_20.md](FullGameBuildPlan_CityLands_20.md) (CL83+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **city scarce vs land unlimited** contention fidelity, re-verify **tutor claims + land craft → City bread sink**, and polish **Explore premium / mail·market escrow / notice·warrior** after CL75–CL78 sinks/escrow/gates. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / wars stay in FutureIdeas.

---

# Phase CL79 — City scarce vs land unlimited

| ID | Work | Acceptance |
| --- | --- | --- |
| CL79.1 | **City scarce kitchen/workshop craft contention still green.** Soft presence `stationBusy` on city craft; land unlimited. | City busy; land OK |
| CL79.2 | **City scarce tree/ore gather contention still green.** Soft presence lock on city gatherWood/gatherOre; land unlimited. | City busy; land OK |
| CL79.3 | **Land unlimited craft (no stationBusy) still green.** Peer nearby on player_land does not block craft. | Land craft OK with peer |

---

# Phase CL80 — Tutor claims + land craft sink

| ID | Work | Acceptance |
| --- | --- | --- |
| CL80.1 | **Farmer tutor claim after land plant/harvest still green.** Land crop → City Farmer claim; incomplete refuse. | Claim OK; incomplete refuse |
| CL80.2 | **Weaver tutor claim after land weave still green.** Land loom weave → City Weaver claim; incomplete refuse. | Claim OK; incomplete refuse |
| CL80.3 | **Land mill→bake→City bread sell still green.** Land flour→bake → City vendor bread; empty refuse. | Happy sell; ≥1 failure |

---

# Phase CL81 — Explore premium + social escrow

| ID | Work | Acceptance |
| --- | --- | --- |
| CL81.1 | **Explore premium leather/ore sell still green.** Explore rate > City; empty refuse. | Rate holds; empty refuse |
| CL81.2 | **Mail parcel claim still green.** Offline send → claim; already-claimed / missing refuse. | Happy claim; ≥1 failure |
| CL81.3 | **Market cancel returns escrow still green.** List → cancel restore; cancel-not-yours refuse. | Happy cancel; ≥1 failure |

---

# Phase CL82 — Verify + regression

| ID | Work | Acceptance |
| --- | --- | --- |
| CL82.1 | **Notice tip / scarce_stations fidelity still green.** Tip ids stable; scarce vs unlimited land copy. | Assert tips; no invent |
| CL82.2 | **Warrior arena optional still green.** Arena walk-up copy; no combat balance invent. | Assert prompt; optional path |
| CL82.3 | **Regression smoke after CL79–CL82.** Companion: city scarce busy + land unlimited, Farmer/Weaver claims, bread sink, Explore premium, mail claim + market cancel, notice/warrior. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL79.1 → CL79.2 → CL79.3 → CL80.1 → CL80.2 → CL80.3 → CL81.1 → CL81.2 → CL81.3 → CL82.1 → CL82.2 → CL82.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_18.md` | Phase 18 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
