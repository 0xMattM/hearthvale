# Full Game Build Plan — CityLands Phase 17 (CL71+)

**Status:** Done sequel (CL71–CL74 complete; next = CityLands_18)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_16.md](FullGameBuildPlan_CityLands_16.md) (CL67–CL70), [_15](FullGameBuildPlan_CityLands_15.md), [_14](FullGameBuildPlan_CityLands_14.md), [_13](FullGameBuildPlan_CityLands_13.md), [_12](FullGameBuildPlan_CityLands_12.md), [_11](FullGameBuildPlan_CityLands_11.md), [_10](FullGameBuildPlan_CityLands_10.md), [_9](FullGameBuildPlan_CityLands_9.md), [_8](FullGameBuildPlan_CityLands_8.md), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_18.md](FullGameBuildPlan_CityLands_18.md) (CL75+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Deepen **Explore → land craft chains**, verify **hunter tutor claims**, polish **food/housing/vendor sinks** and **portal/social fidelity** after CL67–CL70 eat/travel/market sweep. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / wars stay in FutureIdeas.

---

# Phase CL71 — Explore → land craft verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL71.1 | **Explore wood → land saw_planks still green.** Explore stump chop → land workshop `saw_planks`. | Happy saw; ≥1 refuse |
| CL71.2 | **Explore ore → land smelt_iron_bar still green.** Explore chip → land forge smelt + blacksmith XP. | Happy smelt; ≥1 refuse |
| CL71.3 | **Explore thicket → Monster Hunter claim still green.** Thicket hunt → City claim MH; incomplete refuse. | Claim OK; incomplete refuse |

---

# Phase CL72 — Food + housing + crate sinks

| ID | Work | Acceptance |
| --- | --- | --- |
| CL72.1 | **Bread / hearty_stew eat energy still green.** Eat restores Content Lock energy; empty refuse. | Happy eat; ≥1 failure |
| CL72.2 | **Housing banner coin sink still green.** Place banner on land decor pad; broke refuse. | Happy place; ≥1 failure |
| CL72.3 | **Land wood_crate City vendor sink still green.** Land crate → City vendor sell; empty refuse. | Happy sell; ≥1 failure |

---

# Phase CL73 — Hunters + social polish

| ID | Work | Acceptance |
| --- | --- | --- |
| CL73.1 | **Animal Hunter claim after trail still green.** Explore trail → City claim Animal Hunter. | Claim OK; incomplete refuse |
| CL73.2 | **Visit presence + nearby trade still green.** Visit other land → presence; nearby trade ping. | Happy + ≥1 refuse |
| CL73.3 | **Mail send refuse edges still green.** Missing recipient / empty parcel refuse holds. | ≥2 refuse paths |

---

# Phase CL74 — Verify + regression

| ID | Work | Acceptance |
| --- | --- | --- |
| CL74.1 | **Portal free-travel prompts still green.** Free travel · circuit on city/land/explore; warrior Exit · N. | Assert prompts; no invent |
| CL74.2 | **City vendor buy seed/tool still green.** Buy wheat_seed or wooden_hoe; broke refuse. | Happy buy; ≥1 failure |
| CL74.3 | **Regression smoke after CL71–CL74.** Companion: Explore→land saw/smelt, MH+AH claims, bread/stew eat, crate vendor, visit/mail, portal prompts. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL71.1 → CL71.2 → CL71.3 → CL72.1 → CL72.2 → CL72.3 → CL73.1 → CL73.2 → CL73.3 → CL74.1 → CL74.2 → CL74.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_16.md` | Phase 16 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
