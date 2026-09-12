# Full Game Build Plan — CityLands Phase 13 (CL55+)

**Status:** Done sequel (CL55–CL58 complete; next = CityLands_14)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_12.md](FullGameBuildPlan_CityLands_12.md) (CL51–CL54), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_14.md](FullGameBuildPlan_CityLands_14.md) (CL59+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **Explore→tutor claim** (Animal Hunter parity), **Explore ore→land forge** fidelity, **city scarce contention** beyond kitchen, and a **tutor incomplete-refuse sweep** after CL51–CL54 sinks/social/verify. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL55 — Animal Hunter claim + Explore trail polish

| ID | Work | Acceptance |
| --- | --- | --- |
| CL55.1 | **Explore trail → Animal Hunter tutor claim e2e.** Trail leather → City claim Animal Hunter. | Claim OK; incomplete refuse |
| CL55.2 | **Trail vs thicket tutor isolation smoke.** Trail readies Animal Hunter only; thicket Monster Hunter only. | Cross-tutor stays active |
| CL55.3 | **Homestead hunt refuse still green.** Player-land hunt nodes still `huntExploreOnly`. | Refuse holds; Explore OK |

---

# Phase CL56 — Explore ore → land forge chain

| ID | Work | Acceptance |
| --- | --- | --- |
| CL56.1 | **Explore ore chip → land smelt e2e.** Chip Explore ore → land forge `smelt_iron_bar` → blacksmith XP. | Happy smelt; homestead chip path OK or Explore-only assert |
| CL56.2 | **Land smelt → City vendor ore/bar sink smoke.** After smelt, sell ore or keep bar; empty-bag refuse. | Sell or hold OK; ≥1 failure |
| CL56.3 | **Miner XP stays on chip not smelt.** Explore/land chip → miner; smelt → blacksmith. | XP columns distinct |

---

# Phase CL57 — Scarce stations + market polish

| ID | Work | Acceptance |
| --- | --- | --- |
| CL57.1 | **City scarce forge contention assert.** Second crafter at city forge with peer in range → `stationBusy` (or wait copy). | Contention edge; land unlimited OK |
| CL57.2 | **City scarce mill contention assert.** Same soft lock at city mill. | Contention edge; no invent caps |
| CL57.3 | **Cooked_fish market list smoke.** City/land cook → market list cooked_fish (NPC rate holds). | List OK; empty refuse |

---

# Phase CL58 — Tutor sweep + verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL58.1 | **Forester tutor claim after land chop.** Land stump chop → City claim Forester. | Claim OK; incomplete refuse |
| CL58.2 | **Carpenter tutor claim after land saw.** Land `saw_planks` → City claim Carpenter. | Claim OK; incomplete refuse |
| CL58.3 | **Regression smoke after CL55–CL58.** Companion: Animal Hunter claim, ore→smelt, scarce forge/mill, forester/carpenter claims. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL55.1 → CL55.2 → CL55.3 → CL56.1 → CL56.2 → CL56.3 → CL57.1 → CL57.2 → CL57.3 → CL58.1 → CL58.2 → CL58.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_12.md` | Phase 12 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
