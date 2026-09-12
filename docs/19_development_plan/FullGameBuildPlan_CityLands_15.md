# Full Game Build Plan — CityLands Phase 15 (CL63+)

**Status:** Done sequel (CL63–CL66 complete; next = CityLands_16)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_14.md](FullGameBuildPlan_CityLands_14.md) (CL59–CL62), [_13](FullGameBuildPlan_CityLands_13.md), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_16.md](FullGameBuildPlan_CityLands_16.md) (CL67+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Close remaining **city scarce station contention** (loom / fishing dock / alchemy bench), **verify Farmer/Fisher/Alchemist tutor claims** on land paths, and polish **market TTL + crop scarce** fidelity after CL59–CL62 market/tutor sweep. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / wars stay in FutureIdeas.

---

# Phase CL63 — Remaining city scarce contention

| ID | Work | Acceptance |
| --- | --- | --- |
| CL63.1 | **City scarce loom contention assert.** Second weaver at city loom with peer in range → `stationBusy`. | Contention edge; land unlimited OK |
| CL63.2 | **City scarce fishing_dock contention assert.** Soft lock at city dock catch. | Contention edge; land unlimited OK |
| CL63.3 | **City scarce alchemy_bench contention assert.** Soft lock at city alchemy brew. | Contention edge; no invent caps |

---

# Phase CL64 — Farmer / Fisher / Alchemist claim verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL64.1 | **Farmer tutor claim after land plant/harvest still green.** Land crop → City claim Farmer. | Claim OK; incomplete refuse |
| CL64.2 | **Fisher tutor claim after land dock catch still green.** Land dock catch → City claim Fisher. | Claim OK; incomplete refuse |
| CL64.3 | **Alchemist tutor claim after land brew still green.** Land `brew_herbal_tonic` → City claim Alchemist. | Claim OK; incomplete refuse |

---

# Phase CL65 — Market TTL + crop scarce polish

| ID | Work | Acceptance |
| --- | --- | --- |
| CL65.1 | **Market listing TTL expire → escrow return smoke.** List → TTL elapse → goods returned; buy refuse. | Happy expire; ≥1 failure |
| CL65.2 | **City scarce crop_plot plant contention assert.** Soft lock at city plot (or assert plant OK alone). | Contention or alone OK; land unlimited |
| CL65.3 | **Cooked_fish market cross-player buy smoke.** Seller lists cooked_fish → buyer purchases; own-list refuse. | Happy buy; ≥1 failure |

---

# Phase CL66 — Verify + regression

| ID | Work | Acceptance |
| --- | --- | --- |
| CL66.1 | **Visit presence + nearby trade still green.** Visit other land → presence; nearby trade invite ping. | Happy + ≥1 refuse |
| CL66.2 | **Min HUD / interact prompts still green.** Station/portal prompts stay walk-up; no always-on craft HUD. | Assert prompts; no invent panels |
| CL66.3 | **Regression smoke after CL63–CL66.** Companion: scarce loom/dock/alchemy, Farmer/Fisher/Alchemist claims, market TTL + cooked_fish buy. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL63.1 → CL63.2 → CL63.3 → CL64.1 → CL64.2 → CL64.3 → CL65.1 → CL65.2 → CL65.3 → CL66.1 → CL66.2 → CL66.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_14.md` | Phase 14 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
