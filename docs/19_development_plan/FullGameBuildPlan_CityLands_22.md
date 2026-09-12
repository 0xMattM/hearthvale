# Full Game Build Plan — CityLands Phase 22 (CL91+)

**Status:** Done sequel (CL91–CL94 complete; next = CityLands_23 → CityLands_24)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_21.md](FullGameBuildPlan_CityLands_21.md) (CL87–CL90), [_20](FullGameBuildPlan_CityLands_20.md), [_19](FullGameBuildPlan_CityLands_19.md), [_18](FullGameBuildPlan_CityLands_18.md), [_17](FullGameBuildPlan_CityLands_17.md), [_16](FullGameBuildPlan_CityLands_16.md), [_15](FullGameBuildPlan_CityLands_15.md), [_14](FullGameBuildPlan_CityLands_14.md), [_13](FullGameBuildPlan_CityLands_13.md), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_23.md](FullGameBuildPlan_CityLands_23.md) (CL95–CL98 done) → [FullGameBuildPlan_CityLands_24.md](FullGameBuildPlan_CityLands_24.md) (CL99+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **Explore → land craft** chains (wood saw / ore smelt / leather weave), re-verify **land → City sinks + energy eat**, polish **visit/trade/market escrow**, and assert **min HUD / free travel** after CL87–CL90 scarce/claims/premium. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / wars stay in FutureIdeas.  
> **CL91–CL94 shipped via reuse:** existing CL83–CL86 suites (`explore-wood-saw-planks-cl831` … `citylands-smoke-cl863`) re-run green — no duplicate identical test files.

---

# Phase CL91 — Explore → land craft

| ID | Work | Acceptance |
| --- | --- | --- |
| CL91.1 | **Explore wood → land saw_planks still green.** Explore stump → land workshop saw; missing refuse. | Happy saw; ≥1 failure |
| CL91.2 | **Explore ore → land smelt still green.** Explore chip → land forge smelt; missing refuse. | Happy smelt; ≥1 failure |
| CL91.3 | **Explore leather → land weave still green.** Explore trail → land loom weave; missing refuse. | Happy weave; ≥1 failure |

---

# Phase CL92 — Land sinks + energy eat

| ID | Work | Acceptance |
| --- | --- | --- |
| CL92.1 | **Land wood_crate City vendor sink still green.** Land crate → City sell; empty refuse. | Happy sell; ≥1 failure |
| CL92.2 | **Land cooked_fish City vendor sink still green.** Land cook_fish → City sell; empty refuse. | Happy sell; ≥1 failure |
| CL92.3 | **Bread / stew / ration eat energy still green.** Content Lock restores; empty refuse. | Happy eat; ≥1 failure |

---

# Phase CL93 — Visit / trade / market escrow

| ID | Work | Acceptance |
| --- | --- | --- |
| CL93.1 | **Visit presence + nearby trade still green.** Visit host presence; own-visit / far refuse. | Happy visit; ≥1 refuse |
| CL93.2 | **Trade invite accept + cancel still green.** Nearby accept/cancel; far/own refuse. | Happy + ≥1 refuse |
| CL93.3 | **Market buy + TTL escrow still green.** Cross-buy OK; TTL restore; own-list refuse. | Happy buy/TTL; ≥1 failure |

---

# Phase CL94 — HUD / travel + regression

| ID | Work | Acceptance |
| --- | --- | --- |
| CL94.1 | **Min HUD / interact prompts still green.** Walk-up craft/portal/market; closed panels. | Assert prompts; no invent |
| CL94.2 | **Four-map free travel / portal prompts still green.** Fare-free circuit; Free travel · Exit · N. | Circuit OK; ≥1 refuse |
| CL94.3 | **Regression smoke after CL91–CL94.** Companion: Explore→land craft, crate/fish sinks + eat, visit/trade/market, min HUD + free travel. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL91.1 → CL91.2 → CL91.3 → CL92.1 → CL92.2 → CL92.3 → CL93.1 → CL93.2 → CL93.3 → CL94.1 → CL94.2 → CL94.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_21.md` | Phase 21 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
