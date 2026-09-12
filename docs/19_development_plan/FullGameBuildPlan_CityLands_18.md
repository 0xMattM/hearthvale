# Full Game Build Plan — CityLands Phase 18 (CL75+)

**Status:** Done sequel (CL75–CL78 complete; next = CityLands_19)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_17.md](FullGameBuildPlan_CityLands_17.md) (CL71–CL74), [_16](FullGameBuildPlan_CityLands_16.md), [_15](FullGameBuildPlan_CityLands_15.md), [_14](FullGameBuildPlan_CityLands_14.md), [_13](FullGameBuildPlan_CityLands_13.md), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_19.md](FullGameBuildPlan_CityLands_19.md) (CL79+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **land craft → City sinks** (flour / bandage / plank), polish **mail cancel + trade + market buy** escrow fidelity, and re-assert **Explore premium / XP gates / homestead hunt refuse** after CL71–CL74 explore/hunter/social verify. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / wars stay in FutureIdeas.

---

# Phase CL75 — Land craft → City sinks

| ID | Work | Acceptance |
| --- | --- | --- |
| CL75.1 | **Land flour City vendor sink still green.** Land-held flour → City `vendorSell` Content Lock rate; empty refuse. | Happy sell; ≥1 failure |
| CL75.2 | **Land cloth_bandage City vendor sink still green.** Land bandage → City vendor sell; empty refuse. | Happy sell; ≥1 failure |
| CL75.3 | **Land plank City vendor / market still green.** Plank vendor sell and/or market list; empty refuse. | Happy sink; ≥1 refuse |

---

# Phase CL76 — Mail / trade / market escrow

| ID | Work | Acceptance |
| --- | --- | --- |
| CL76.1 | **Mail cancel returns escrow still green.** Send → cancel restores goods; cancel-not-yours refuse. | Happy cancel; ≥1 failure |
| CL76.2 | **Trade invite accept + cancel still green.** Nearby invite accept/cancel; far/own refuse. | Happy + ≥1 refuse |
| CL76.3 | **Market buy from listing still green.** Buyer purchases other listing; own-list refuse. | Happy buy; ≥1 failure |

---

# Phase CL77 — Explore premium + gates + homestead

| ID | Work | Acceptance |
| --- | --- | --- |
| CL77.1 | **Explore premium wood sell still green.** Explore wood sell > City rate; empty refuse. | Rate holds; empty refuse |
| CL77.2 | **Recipe XP gate fidelity still green.** `pack_travel_ration` / `forge_iron_hammer` under-gate refuse; enough XP OK. | Gate holds |
| CL77.3 | **Homestead hunt refuse still green.** Explore trail/thicket OK; empty land `huntExploreOnly`. | Explore OK; land refuse |

---

# Phase CL78 — HUD / travel + regression

| ID | Work | Acceptance |
| --- | --- | --- |
| CL78.1 | **Min HUD / interact prompts still green.** Walk-up craft/portal/market prompts; closed panels. | Assert prompts; no invent |
| CL78.2 | **Four-map free travel still green.** City↔land↔explore↔warrior fare-free; already-here refuse. | Circuit OK; ≥1 refuse |
| CL78.3 | **Regression smoke after CL75–CL78.** Companion: flour/bandage/plank sinks, mail cancel + trade/market buy, Explore wood premium, XP gates, homestead hunt refuse, min HUD + free travel. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL75.1 → CL75.2 → CL75.3 → CL76.1 → CL76.2 → CL76.3 → CL77.1 → CL77.2 → CL77.3 → CL78.1 → CL78.2 → CL78.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_17.md` | Phase 17 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
