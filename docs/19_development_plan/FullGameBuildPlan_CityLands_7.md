# Full Game Build Plan — CityLands Phase 7 (CL31+)

**Status:** Done sequel (CL31–CL34 complete; next = CityLands_8)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_6.md](FullGameBuildPlan_CityLands_6.md) (CL27–CL30), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_8.md](FullGameBuildPlan_CityLands_8.md) (CL35+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen profession fidelity after hunter asserts: split Animal / Monster Hunter XP (Vision lists them separately; code still shares `hunter`), Alchemist XP off cook, land gather stations for Forester/Miner, vendor/market sinks for new crafts, more builder gates. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL31 — Dual hunter + Alchemist XP

| ID | Work | Acceptance |
| --- | --- | --- |
| CL31.1 | **Split Animal / Monster Hunter XP.** Trail wins grant `animal_hunter` XP; thicket wins grant `monster_hunter` XP (schema + ProfessionId + grantXp). Retire shared trail/thicket → single `hunter` grants (migrate legacy `hunter_xp` into animal or split). | Trail ≠ thicket columns; tests; homestead refuse unchanged — **done** |
| CL31.2 | **Hunter tutor / tip fidelity.** Tutor copy + `explore_mats_craft` (or dedicated tip) name Animal vs Monster Hunter XP; Content Lock note. | Tip/tutor match columns; id stable where possible — **done** |
| CL31.3 | **Alchemist XP column.** `brew_herbal_tonic` grants alchemist XP (not cook); schema + ProfessionId + gate; stew/fish stay cook. | Brew → alchemist; cook crafts unchanged — **done** |

---

# Phase CL32 — Land gather stations

| ID | Work | Acceptance |
| --- | --- | --- |
| CL32.1 | **Placeable land tree stump.** `tree_stump` (or equivalent) in `PLAYER_LAND_STATIONS`; chop → forester XP; city place still blocked / scarce template only. | Place+chop OK; city place refuse — **done** |
| CL32.2 | **Placeable land ore node.** `ore_node` placeable on land; chip → miner XP; hammer still required. | Place+chip OK; needHammer edge — **done** |
| CL32.3 | **Land gather practice tip.** Notice or Build Board copy: unlimited trees/ore on Your Land vs scarce city. | Tip stable; walk-up only — **done** |

---

# Phase CL33 — Craft sinks + vendor books

| ID | Work | Acceptance |
| --- | --- | --- |
| CL33.1 | **Vendor sell tonic + bandage.** Add `herbal_tonic` + `cloth_bandage` to city (and explore if priced) vendor sell book. | Sell for coins; Content Lock; tests — **done** |
| CL33.2 | **Market list tonic/bandage smoke.** Land/city craft → City market list for tonic or bandage; ≥1 failure. | Happy list + fail — **done** |
| CL33.3 | **Hunt meat → kitchen tip.** Notice or kitchen panel: Explore raw meat → cook at Kitchen (parallel to fish_to_kitchen). | Tip stable; min HUD — **done** |

---

# Phase CL34 — Builder gates + verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL34.1 | **Gate kitchen or loom on builder XP.** Third costly station `minBuilderXp` (Content Lock). | Under-gated refuse; enough XP allows — **done** |
| CL34.2 | **Animal Breeder light second beat.** Optional second pen interact (water/clean stub with wheat or existing mat) OR document defer — no livestock combat. | Happy interact or explicit defer tip — **done** |
| CL34.3 | **Regression smoke after CL31–CL34.** Extend `citylands-smoke-cl7` for dual hunter XP, alchemist XP, land tree/ore, vendor sinks, builder gate. | Happy + ≥1 failure/edge green — **done** |

---

# Priority order

```
CL31.1 → CL31.2 → CL31.3 → CL32.1 → CL32.2 → CL32.3 → CL33.1 → CL33.2 → CL33.3 → CL34.1 → CL34.2 → CL34.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_6.md` | Phase 6 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
