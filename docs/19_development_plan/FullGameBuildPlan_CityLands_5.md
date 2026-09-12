# Full Game Build Plan — CityLands Phase 5 (CL23+)

**Status:** Done sequel (CL23–CL26 complete; next = CityLands_6)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_4.md](FullGameBuildPlan_CityLands_4.md) (CL18–CL22), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_6.md](FullGameBuildPlan_CityLands_6.md) (CL27+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen player-driven economy: Fisher XP + fish sinks, Explore gather→craft fidelity, market/vendor fish loop, light cook path from catch, builder XP gates. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL23 — Fisher XP + fish economy

| ID | Work | Acceptance |
| --- | --- | --- |
| CL23.1 | **Fisher XP column.** Grant `fisherXp` on successful `gatherFish` (schema migration); add `fisher` to `ProfessionId` / `grantXp`. | Catch grants fisher XP; migration + tests |
| CL23.2 | **Fish vendor/market sink.** Add `fish` to city (and explore) vendor sell book; ensure market listing accepts fish. | Sell/list fish for coins; tests |
| CL23.3 | **Cook fish recipe.** Kitchen craft (e.g. grill/cook fish → edible) grants cook XP; Content Lock costs. | Craftable at kitchen; cook XP; no alchemy combat |

---

# Phase CL24 — Explore gather fidelity

| ID | Work | Acceptance |
| --- | --- | --- |
| CL24.1 | **Explore woodland → forester XP.** Assert chop on Explore `tree_stump` grants forester (not carpenter); tip or smoke. | Happy gather on explore; carpenter unchanged |
| CL24.2 | **Explore mines → miner XP.** Assert chip on Explore `ore_node` grants miner (not blacksmith). | Happy gather on explore; hammer still required |
| CL24.3 | **Explore gather → craft tip.** Notice tip (or extend `explore_mats_craft`): woodland wood / mine ore feed carpenter & blacksmith crafts. | Tip id stable; walk-up only |

---

# Phase CL25 — Market / land produce loop

| ID | Work | Acceptance |
| --- | --- | --- |
| CL25.1 | **List land craft on City market.** Smoke: craft on land → travel City → `listMarket` / create listing for cloth/plank/fish. | Happy list + ≥1 failure (bad qty / not on city if gated) |
| CL25.2 | **Vendor buy book completeness.** Confirm city sells seeds + wooden_hoe + iron_hammer; add any missing basic profession tool from Content Lock. | City buy book matches vision; tests |
| CL25.3 | **Fish → kitchen tip.** Notice or cook panel copy: catch fish → cook at Kitchen (city scarce or land). | Tip/copy stable; min HUD |

---

# Phase CL26 — Builder gates + breeder light prep

| ID | Work | Acceptance |
| --- | --- | --- |
| CL26.1 | **Builder XP gate on expensive station.** Gate at least one costly `PLAYER_LAND_STATIONS` place (e.g. workshop/forge) on `builderXp` / Content Lock. | Under-gated refuse; enough XP allows place |
| CL26.2 | **Animal pen stub (land only).** Light `animal_pen` placeable station OR document defer if catalog too thin — no livestock combat. | Place on land OK / city blocked; or explicit defer tip update |
| CL26.3 | **Regression smoke after CL23–CL26.** Extend `citylands-smoke-cl7` for fisher XP, fish sell/cook, explore gather, market list. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL23.1 → CL23.2 → CL23.3 → CL24.1 → CL24.2 → CL24.3 → CL25.1 → CL25.2 → CL25.3 → CL26.1 → CL26.2 → CL26.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_4.md` | Phase 4 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
