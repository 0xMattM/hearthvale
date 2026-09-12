# Full Game Build Plan — CityLands Phase 6 (CL27+)

**Status:** Done sequel (CL27–CL30 complete; next = CityLands_7)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_5.md](FullGameBuildPlan_CityLands_5.md) (CL23–CL26), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_7.md](FullGameBuildPlan_CityLands_7.md) (CL31+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen player-driven economy after market/fish/builder gates: light Animal Breeder feed loop on pens, more builder gates, Alchemist bench stub, market cancel/buy smoke, cook/weaver sinks, Explore hunter fidelity. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL27 — Animal Breeder light loop

| ID | Work | Acceptance |
| --- | --- | --- |
| CL27.1 | **Pen interact feed stub.** Walk-up on `animal_pen`: spend wheat/feed → grant light `animal_breeder` XP column (or builder-adjacent until column exists). No combat. | Happy feed; fail without mats; city has no pens |
| CL27.2 | **Animal Breeder XP column.** Schema + `ProfessionId` + gate wiring for breeder XP from pen feed. | Migration + tests; tutor still optional |
| CL27.3 | **Seed Animal Breeder tutor.** City NPC + objective (hold feed product or pen place/feed); `CITY_PRACTICE_STATIONS` or land-pen practice note. | Claim works; tip updated; no livestock combat |

---

# Phase CL28 — Builder gates + Alchemist bench

| ID | Work | Acceptance |
| --- | --- | --- |
| CL28.1 | **Gate mill (or workshop) on builder XP.** Second costly station `minBuilderXp` (Content Lock). | Under-gated refuse; enough XP allows |
| CL28.2 | **Alchemist bench stub.** Placeable `alchemy_bench` on land OR scarce city ×1; one non-combat brew recipe distinct from cook stew. | Place/craft OK; no combat buffs |
| CL28.3 | **Retarget Alchemist practice.** `CITY_PRACTICE_STATIONS.alchemist` → bench when present; tip/tutor copy. | Practice map matches; cook stew stays cook |

---

# Phase CL29 — Market depth + craft sinks

| ID | Work | Acceptance |
| --- | --- | --- |
| CL29.1 | **Market cancel + buy smoke.** After land list: buyer buys; seller cancels other listing; TTL edge optional. | Happy buy + cancel; ≥1 failure |
| CL29.2 | **Weaver second recipe.** Light cloth sink (e.g. bandage/cloth scrap food-adjacent or decor mat) at loom; weaver XP. | Craftable; Content Lock; tests |
| CL29.3 | **Cook fish tip in smoke + stew sink assert.** Ensure `fish_to_kitchen` + cook stew path remain green in regression mindset. | Tip + craft asserts |

---

# Phase CL30 — Explore hunters + verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL30.1 | **Animal Hunter XP assert.** Explore trail hunt grants hunter XP (not cook); tip if missing. | Happy hunt XP; homestead refuse unchanged |
| CL30.2 | **Monster Hunter thicket assert.** Explore thicket → hunter XP / tusk loot path; tutor objective still holds. | Happy + homestead refuse |
| CL30.3 | **Regression smoke after CL27–CL30.** Extend `citylands-smoke-cl7` for pen feed/breeder, builder gates, alchemy bench, market buy/cancel, hunt XP. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL27.1 → CL27.2 → CL27.3 → CL28.1 → CL28.2 → CL28.3 → CL29.1 → CL29.2 → CL29.3 → CL30.1 → CL30.2 → CL30.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_5.md` | Phase 5 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
