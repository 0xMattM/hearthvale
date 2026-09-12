# Full Game Build Plan — CityLands Phase 14 (CL59+)

**Status:** Done sequel (CL59–CL62 complete; next = CityLands_15)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_13.md](FullGameBuildPlan_CityLands_13.md) (CL55–CL58), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_15.md](FullGameBuildPlan_CityLands_15.md) (CL63+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **remaining tutor claim e2e** (Miner / Blacksmith / Cook), **city scarce gather + craft** beyond kitchen/forge/mill, and **market buy** fidelity after CL55–CL58 ore/smelt/tutor sweep. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL59 — Miner / Blacksmith / Cook tutor claims

| ID | Work | Acceptance |
| --- | --- | --- |
| CL59.1 | **Explore ore chip → Miner tutor claim e2e.** Chip Explore ore → City claim Miner. | Claim OK; incomplete refuse |
| CL59.2 | **Land smelt → Blacksmith tutor claim e2e.** Land `smelt_iron_bar` → City claim Blacksmith. | Claim OK; incomplete refuse |
| CL59.3 | **Land cook → Cook tutor claim e2e.** Land `cook_fish` or `cook_meat` → City claim Cook. | Claim OK; incomplete refuse |

---

# Phase CL60 — Scarce city gather + craft polish

| ID | Work | Acceptance |
| --- | --- | --- |
| CL60.1 | **City scarce tree chop contention assert.** Second chopper at city stump with peer in range → `stationBusy` (or wait copy). | Contention edge; land unlimited OK |
| CL60.2 | **City scarce ore chip contention assert.** Same soft lock at city ore rock. | Contention edge; land unlimited OK |
| CL60.3 | **City scarce workshop contention assert.** Soft lock at city workshop (loom optional edge). | Contention edge; no invent caps |

---

# Phase CL61 — Market buy + vendor fidelity

| ID | Work | Acceptance |
| --- | --- | --- |
| CL61.1 | **Market buy from other player listing smoke.** Seller lists → buyer purchases; own-listing refuse holds. | Happy buy; ≥1 failure |
| CL61.2 | **City vendor buy seed/tool smoke.** Buy wheat_seed or wooden_hoe at City stall; broke refuse. | Happy buy; ≥1 failure |
| CL61.3 | **Cooked_fish / ore NPC rates still green.** Content Lock rates hold after CL56–CL57. | Assert rates; empty refuse edge |

---

# Phase CL62 — Builder claim + verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL62.1 | **Builder tutor claim after land station place.** Place land station → City claim Builder. | Claim OK; incomplete refuse |
| CL62.2 | **Weaver tutor claim after land weave still green.** Land `weave_cloth` → City claim Weaver (or assert-only if already claimed path). | Claim OK; incomplete refuse |
| CL62.3 | **Regression smoke after CL59–CL62.** Companion: Miner/Blacksmith/Cook claims, scarce tree/ore/workshop, market buy, Builder/Weaver. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL59.1 → CL59.2 → CL59.3 → CL60.1 → CL60.2 → CL60.3 → CL61.1 → CL61.2 → CL61.3 → CL62.1 → CL62.2 → CL62.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_13.md` | Phase 13 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
