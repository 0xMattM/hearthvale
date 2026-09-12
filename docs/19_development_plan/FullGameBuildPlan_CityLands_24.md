# Full Game Build Plan — CityLands Phase 24 (CL99+)

**Status:** Frozen fidelity recycle (CL99–CL102) — superseded by [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md)  
**Created:** 2026-08-02  
**Frozen:** 2026-08-02 — do not pick; live queue is PL\*  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_23.md](FullGameBuildPlan_CityLands_23.md) (CL95–CL98), [_22](FullGameBuildPlan_CityLands_22.md), [_21](FullGameBuildPlan_CityLands_21.md), [_20](FullGameBuildPlan_CityLands_20.md), [_19](FullGameBuildPlan_CityLands_19.md), [_18](FullGameBuildPlan_CityLands_18.md), [_17](FullGameBuildPlan_CityLands_17.md), [_16](FullGameBuildPlan_CityLands_16.md), [_15](FullGameBuildPlan_CityLands_15.md), [_14](FullGameBuildPlan_CityLands_14.md), [_13](FullGameBuildPlan_CityLands_13.md), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **Explore → land craft** chains (wood saw / ore smelt / leather weave), re-verify **land → City sinks + energy eat**, polish **visit/trade/market escrow**, and assert **min HUD / free travel** after CL95–CL98 scarce/claims/premium. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / wars stay in FutureIdeas.  
> **Reuse note:** when acceptance matches an already-green suite (e.g. CL83–CL86 / CL91–CL94), re-run that suite and mark the new ID done — do not clone identical test files.  
> **Human redirect:** phases CL91–CL98 are largely the same two fidelity templates alternating. A human should inject new PlayerVision depth before more recycle ticks (see TASKS Discovered).

---

# Phase CL99 — Explore → land craft

| ID | Work | Acceptance |
| --- | --- | --- |
| CL99.1 | **Explore wood → land saw_planks still green.** Explore stump → land workshop saw; missing refuse. | Happy saw; ≥1 failure |
| CL99.2 | **Explore ore → land smelt still green.** Explore chip → land forge smelt; missing refuse. | Happy smelt; ≥1 failure |
| CL99.3 | **Explore leather → land weave still green.** Explore trail → land loom weave; missing refuse. | Happy weave; ≥1 failure |

---

# Phase CL100 — Land sinks + energy eat

| ID | Work | Acceptance |
| --- | --- | --- |
| CL100.1 | **Land wood_crate City vendor sink still green.** Land crate → City sell; empty refuse. | Happy sell; ≥1 failure |
| CL100.2 | **Land cooked_fish City vendor sink still green.** Land cook_fish → City sell; empty refuse. | Happy sell; ≥1 failure |
| CL100.3 | **Bread / stew / ration eat energy still green.** Content Lock restores; empty refuse. | Happy eat; ≥1 failure |

---

# Phase CL101 — Visit / trade / market escrow

| ID | Work | Acceptance |
| --- | --- | --- |
| CL101.1 | **Visit presence + nearby trade still green.** Visit host presence; own-visit / far refuse. | Happy visit; ≥1 refuse |
| CL101.2 | **Trade invite accept + cancel still green.** Nearby accept/cancel; far/own refuse. | Happy + ≥1 refuse |
| CL101.3 | **Market buy + TTL escrow still green.** Cross-buy OK; TTL restore; own-list refuse. | Happy buy/TTL; ≥1 failure |

---

# Phase CL102 — HUD / travel + regression

| ID | Work | Acceptance |
| --- | --- | --- |
| CL102.1 | **Min HUD / interact prompts still green.** Walk-up craft/portal/market; closed panels. | Assert prompts; no invent |
| CL102.2 | **Four-map free travel / portal prompts still green.** Fare-free circuit; Free travel · Exit · N. | Circuit OK; ≥1 refuse |
| CL102.3 | **Regression smoke after CL99–CL102.** Companion: Explore→land craft, crate/fish sinks + eat, visit/trade/market, min HUD + free travel. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL99.1 → CL99.2 → CL99.3 → CL100.1 → CL100.2 → CL100.3 → CL101.1 → CL101.2 → CL101.3 → CL102.1 → CL102.2 → CL102.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_23.md` | Phase 23 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
