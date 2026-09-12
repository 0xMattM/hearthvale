# Full Game Build Plan — CityLands Phase 10 (CL43+)

**Status:** Done sequel (CL43–CL46 complete; next = CityLands_11)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_9.md](FullGameBuildPlan_CityLands_9.md) (CL39–CL42), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_11.md](FullGameBuildPlan_CityLands_11.md) (CL47+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **player-land production e2e** and Explore gather parity after crate/mill/premium/dock/decor: land kitchen/forge/loom loops, Explore ore→premium sell, land dock catch, Breeder/market polish, sixth builder gate. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL43 — Land craft e2e depth

| ID | Work | Acceptance |
| --- | --- | --- |
| CL43.1 | **Land mill → kitchen bake bread smoke.** Player land: mill flour → place/use kitchen `bake_bread`; farmer + cook XP columns correct. | Happy land bake; ≥1 failure (no mats / wrong station) |
| CL43.2 | **Land forge smelt → hammer smoke.** Land forge: `smelt_iron_bar` → `forge_iron_hammer`; blacksmith XP (not miner). | Happy smelt+forge; ≥1 failure |
| CL43.3 | **Land loom bandage → vendor/market sink.** Land loom `weave_cloth_bandage` → City vendor sell or market list. | Sell or list OK; ≥1 failure |

---

# Phase CL44 — Explore ore + land fisher + hunt cook

| ID | Work | Acceptance |
| --- | --- | --- |
| CL44.1 | **Explore ore chip → premium sell e2e.** Chip Explore `ore_node` → `vendorSell` iron_ore at Explore rate (> City). | Live gather+sell; city contrast |
| CL44.2 | **Land fishing_dock catch after builder gate.** Place dock with enough builder XP → `gatherFish`; fisher XP. | Happy catch; under-gated refuse already covered |
| CL44.3 | **Explore hunt meat → land kitchen cook.** Trail/thicket `raw_meat` → land kitchen `cook_meat` → cook XP. | Happy land cook; homestead hunt still refuse |

---

# Phase CL45 — Breeder / market / ration polish

| ID | Work | Acceptance |
| --- | --- | --- |
| CL45.1 | **Breeder feed + clean XP e2e smoke.** Land pen: wheat feed then wood clean (or reverse after CD); `animal_breeder_xp` both beats; no livestock combat. | Happy dual care; ≥1 failure |
| CL45.2 | **Market cross-player buy smoke.** Seller lists land craft → second account buys; cancel-not-yours still holds. | Happy buy; ≥1 failure/edge |
| CL45.3 | **Travel ration tip fidelity.** Notice/onboarding copy: ration is energy food, free travel stays fare-free (id stable if extending). | Tip asserts; free travel unchanged |

---

# Phase CL46 — Builder gate + HUD + verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL46.1 | **Gate animal_pen on builder XP.** Sixth costly station `minBuilderXp` (keep crop_plot / workshop / kitchen bootstrap). | Under-gated refuse; enough XP allows |
| CL46.2 | **Min HUD walk-up panel fidelity.** Notice / key panels stay closed-by-default; no permanent craft columns. | Assert default-closed; min HUD |
| CL46.3 | **Regression smoke after CL43–CL46.** Extend `citylands-smoke-cl8` (or companion) for land bake/forge/loom, Explore ore sell, land dock catch, pen gate. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL43.1 → CL43.2 → CL43.3 → CL44.1 → CL44.2 → CL44.3 → CL45.1 → CL45.2 → CL45.3 → CL46.1 → CL46.2 → CL46.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_9.md` | Phase 9 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
