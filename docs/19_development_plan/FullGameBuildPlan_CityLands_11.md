# Full Game Build Plan — CityLands Phase 11 (CL47+)

**Status:** Done sequel (CL47–CL50 complete; next = CityLands_12)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_10.md](FullGameBuildPlan_CityLands_10.md) (CL43–CL46), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_12.md](FullGameBuildPlan_CityLands_12.md) (CL51+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Close remaining **land→City economy outlets** and **Explore→land craft chains** after bake/forge/loom/ore/dock/pen: fish cook on land, alchemy land brew sink, bread sell, carpenter crate on land, Explore leather→loom, travel-ration chain, visit/trade polish, second decor, Breeder claim, interact-prompt fidelity. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL47 — Land fish cook + alchemy + bread sell

| ID | Work | Acceptance |
| --- | --- | --- |
| CL47.1 | **Land dock fish → kitchen cook_fish.** After land catch: kitchen `cook_fish` → cook XP (not fisher). | Happy land cook; ≥1 failure |
| CL47.2 | **Land alchemy brew → vendor/market sink.** Land bench `brew_herbal_tonic` → City vendor sell or market list. | Sell or list OK; ≥1 failure |
| CL47.3 | **Land bread → City vendor sell e2e.** Bake on land → travel City → `vendorSell` bread. | Happy sell; empty-bag refuse |

---

# Phase CL48 — Carpenter + Explore mats + ration chain

| ID | Work | Acceptance |
| --- | --- | --- |
| CL48.1 | **Land workshop saw → crate smoke.** Land `saw_planks` → `assemble_wood_crate`; carpenter XP. | Happy crate; ≥1 failure |
| CL48.2 | **Explore leather → land loom weave e2e.** Trail leather → land loom `weave_cloth` (or bandage). | Happy weave; homestead hunt refuse holds |
| CL48.3 | **Land mill→bake→pack_travel_ration chain.** Flour → bread → kitchen ration; cook XP; eat energy. | Happy chain; missing mats refuse |

---

# Phase CL49 — Visit / decor / Breeder claim

| ID | Work | Acceptance |
| --- | --- | --- |
| CL49.1 | **Visit land + trade invite nearby smoke.** Visit other player land; trade invite when nearby (or clear refuse). | Happy path; ≥1 failure/edge |
| CL49.2 | **Housing second decor place smoke.** Place banner (or second catalog item) on land pad — coin only. | Place OK; city refuse |
| CL49.3 | **Breeder tutor claim after pen care.** Feed/clean then claim Animal Breeder tutorial at City walk-up. | Claim OK; incomplete refuse |

---

# Phase CL50 — Prompt fidelity + verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL50.1 | **Interact prompt fidelity (stations).** Walk-up prompts name craft/notice/build correctly; min HUD. | Assert copy; no always-on |
| CL50.2 | **Four-map free travel still green.** City↔land↔explore↔warrior instant; already-here refuse. | Happy circuit; fare-free |
| CL50.3 | **Regression smoke after CL47–CL50.** Extend `citylands-smoke-cl8` (or companion) for land fish cook, alchemy sink, bread sell, crate, leather weave, visit/decor/claim. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL47.1 → CL47.2 → CL47.3 → CL48.1 → CL48.2 → CL48.3 → CL49.1 → CL49.2 → CL49.3 → CL50.1 → CL50.2 → CL50.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_10.md` | Phase 10 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
