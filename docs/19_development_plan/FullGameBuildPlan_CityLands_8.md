# Full Game Build Plan — CityLands Phase 8 (CL35+)

**Status:** Done sequel (CL35–CL38 complete; next = CityLands_9)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_7.md](FullGameBuildPlan_CityLands_7.md) (CL31–CL34), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_9.md](FullGameBuildPlan_CityLands_9.md) (CL39+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Close remaining core profession economy loops after dual hunters / land gather / craft sinks: Farmer mill→bread fidelity, Cook meat path, Carpenter/Blacksmith depth, fourth builder gate, Explore vendor premium assert, light Alchemist second brew, Breeder tip fidelity. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL35 — Farmer + Cook food chain

| ID | Work | Acceptance |
| --- | --- | --- |
| CL35.1 | **Mill flour → bake bread smoke.** Land or city mill + kitchen: wheat → flour → bread; farmer/cook XP columns correct. | Happy mill+bake; ≥1 failure (no mats / wrong station) |
| CL35.2 | **Flour / bread vendor or market sink.** Ensure flour and/or bread sell or list path is green (Content Lock rates). | Sell or list OK; Content Lock |
| CL35.3 | **Cook meat assert.** Explore `raw_meat` → Kitchen `cook_meat` → cook XP (meat_to_kitchen tip already shipped). | Happy cook; fail without meat |

---

# Phase CL36 — Carpenter / Blacksmith / builder gate

| ID | Work | Acceptance |
| --- | --- | --- |
| CL36.1 | **Carpenter second light recipe OR plank sink.** One extra workshop craft that spends planks (housing-adjacent or tool wrap already counts — prefer new light sink if SKU room). | Craftable; carpenter XP; tests |
| CL36.2 | **Blacksmith forge hammer / hoe smoke assert.** Land forge crafts a tool; blacksmith XP (not miner). | Happy forge; ≥1 failure |
| CL36.3 | **Gate alchemy_bench or kitchen on builder XP.** Fourth costly station `minBuilderXp` (keep one bootstrap craft station open). | Under-gated refuse; enough XP allows |

---

# Phase CL37 — Explore economy + Breeder tip

| ID | Work | Acceptance |
| --- | --- | --- |
| CL37.1 | **Explore vendor premium sell smoke.** Sell a mat at Explore for higher coins than City rate (existing premium table). | Happy premium; city rate contrast |
| CL37.2 | **Explore mats → land craft tip fidelity.** Assert `explore_mats_craft` still documents woodland/mines/hunt → craft (id stable). | Tip body asserts; no new id unless needed |
| CL37.3 | **Breeder path tip names feed + clean.** `animal_breeder_path` already mentions wood bedding (CL34.2) — assert + tutor basics line if missing. | Tip/tutor mention both care beats |

---

# Phase CL38 — Alchemist depth + verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL38.1 | **Alchemist second light brew OR tonic eat assert.** Second non-combat bench recipe **or** assert eating `herbal_tonic` restores energy (no combat buff). | Happy path; cook crafts unchanged |
| CL38.2 | **Regression smoke after CL35–CL38.** Extend `citylands-smoke-cl7` for mill→bread, cook meat, builder gate, explore premium, alchemist beat. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL35.1 → CL35.2 → CL35.3 → CL36.1 → CL36.2 → CL36.3 → CL37.1 → CL37.2 → CL37.3 → CL38.1 → CL38.2
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_7.md` | Phase 7 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
