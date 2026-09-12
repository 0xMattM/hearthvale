# Full Game Build Plan — CityLands Phase 16 (CL67+)

**Status:** Done sequel (CL67–CL70 complete; next = CityLands_17)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_15.md](FullGameBuildPlan_CityLands_15.md) (CL63–CL66), [_14](FullGameBuildPlan_CityLands_14.md), [_13](FullGameBuildPlan_CityLands_13.md), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_17.md](FullGameBuildPlan_CityLands_17.md) (CL71+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **player-driven economy sinks** (energy food eat, travel ration, housing decor coins), verify **Breeder + Explore craft chains**, and polish **social/visit + free-travel + min HUD** fidelity after CL63–CL66 scarce/market sweep. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / wars stay in FutureIdeas.

---

# Phase CL67 — Economy sink polish

| ID | Work | Acceptance |
| --- | --- | --- |
| CL67.1 | **Travel ration craft → energy eat smoke.** Land `pack_travel_ration` → eat restores energy; gate refuse. | Happy eat; ≥1 failure |
| CL67.2 | **Herbal tonic / cooked_fish eat energy smoke.** Eat tonic or cooked_fish restores Content Lock energy; empty refuse. | Happy eat; ≥1 failure |
| CL67.3 | **Housing decor coin sink still green.** Place planter/banner on land decor pad; broke refuse. | Happy place; ≥1 failure |

---

# Phase CL68 — Breeder + Explore craft verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL68.1 | **Animal Breeder tutor claim after pen care still green.** Land feed+clean → City claim Breeder. | Claim OK; incomplete refuse |
| CL68.2 | **Explore leather → land loom weave still green.** Explore gather leather → land `weave_cloth`. | Happy weave; ≥1 refuse |
| CL68.3 | **Explore premium leather sell still green.** Explore `vendorSell` leather > city rate; empty refuse. | Rate holds; empty refuse |

---

# Phase CL69 — Social + travel fidelity

| ID | Work | Acceptance |
| --- | --- | --- |
| CL69.1 | **Mail / offline parcel claim still green.** Parcel escrow → claim online; missing refuse. | Happy claim; ≥1 failure |
| CL69.2 | **Four-map free travel circuit still green.** City↔land↔explore↔warrior fare-free; already-here refuse. | Circuit OK; ≥1 refuse |
| CL69.3 | **Market cancel returns escrow still green.** List → cancel restores goods; cancel-not-yours refuse. | Happy cancel; ≥1 failure |

---

# Phase CL70 — Verify + regression

| ID | Work | Acceptance |
| --- | --- | --- |
| CL70.1 | **Notice board tips still green.** Travel / scarce / warrior-optional tips stable ids + copy. | Assert tips; no invent live-ops |
| CL70.2 | **Warrior arena board optional still green.** Arena walk-up copy; no combat balance invent. | Assert prompt; optional path |
| CL70.3 | **Regression smoke after CL67–CL70.** Companion: ration/tonic eat, Breeder claim, Explore leather weave/sell, free travel, market cancel. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL67.1 → CL67.2 → CL67.3 → CL68.1 → CL68.2 → CL68.3 → CL69.1 → CL69.2 → CL69.3 → CL70.1 → CL70.2 → CL70.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_15.md` | Phase 15 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
