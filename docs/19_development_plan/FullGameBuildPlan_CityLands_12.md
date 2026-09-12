# Full Game Build Plan — CityLands Phase 12 (CL51+)

**Status:** Done sequel (CL51–CL54 complete; next = CityLands_13)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_11.md](FullGameBuildPlan_CityLands_11.md) (CL47–CL50), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_13.md](FullGameBuildPlan_CityLands_13.md) (CL55+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **land→City food/mat sinks**, **social visit/trade**, and **Explore→craft claim** fidelity after CL47–CL50 outlets. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL51 — Land→City food / mat sinks

| ID | Work | Acceptance |
| --- | --- | --- |
| CL51.1 | **Land cook_fish → City vendor sell e2e.** Catch/cook on land → City `vendorSell` fish/cooked fish path. | Happy sell; empty-bag refuse |
| CL51.2 | **Land stew → City market list smoke.** Kitchen `cook_stew` on land → City market list (or buy). | List OK; ≥1 failure |
| CL51.3 | **Land wheat harvest → City vendor sell.** Plant→harvest on land → City sell wheat. | Happy sell; cropNotReady refuse holds |

---

# Phase CL52 — Social / scarce polish

| ID | Work | Acceptance |
| --- | --- | --- |
| CL52.1 | **Trade invite accept + cancel smoke.** Nearby invite → accept or clear cancel; far refuse holds. | Happy path; ≥1 failure/edge |
| CL52.2 | **Visit land presence + leave smoke.** Visit other land; presence visible; leave/return home clean. | Happy visit; ≥1 failure |
| CL52.3 | **City scarce station contention assert.** Two players on same scarce city station — second clear refuse or wait copy. | Contention edge; no invent daily caps |

---

# Phase CL53 — Explore / craft depth

| ID | Work | Acceptance |
| --- | --- | --- |
| CL53.1 | **Explore thicket → Monster Hunter tutor claim e2e.** Thicket loot → City claim Monster Hunter. | Claim OK; incomplete refuse |
| CL53.2 | **Land tree → saw plank → City crate sell chain.** Chop → `saw_planks` → crate → City vendor. | Happy chain; ≥1 failure |
| CL53.3 | **Recipe XP gate fidelity smoke.** Assert `pack_travel_ration` / forge hammer gates still refuse under XP. | Under-gated refuse; enough XP OK |

---

# Phase CL54 — Portal / warrior / verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL54.1 | **Portal interact prompts all four maps.** City/land/explore/warrior portal labels + free-travel wording. | Assert copy per map |
| CL54.2 | **Warrior arena board optional fidelity.** Plaque/tip still optional; no balance numbers; off homestead. | Assert copy; no combat invent |
| CL54.3 | **Regression smoke after CL51–CL54.** Companion smoke: food sinks, trade/visit, thicket claim, portal prompts. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL51.1 → CL51.2 → CL51.3 → CL52.1 → CL52.2 → CL52.3 → CL53.1 → CL53.2 → CL53.3 → CL54.1 → CL54.2 → CL54.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_11.md` | Phase 11 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
