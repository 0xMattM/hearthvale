# Full Game Build Plan — CityLands Phase 3 (CL13+)

**Status:** Done sequel (CL13–CL17 complete; next = CityLands_4)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands.md](FullGameBuildPlan_CityLands.md) (CL1–CL7), [FullGameBuildPlan_CityLands_2.md](FullGameBuildPlan_CityLands_2.md) (CL8–CL12)  
**Next plan:** [FullGameBuildPlan_CityLands_4.md](FullGameBuildPlan_CityLands_4.md) (CL18+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Finish remaining economy profession tutors and practice paths. Prefer city + land + explore depth. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL13 — Weaver + remaining craft tutors

| ID | Work | Acceptance |
| --- | --- | --- |
| CL13.1 | **Seed Weaver tutor on City.** Replace stub with walk-up quest (weave cloth at loom). | Panel + claim persist; warrior still absent from ladder |
| CL13.2 | **Scarce city loom for Weaver practice.** Add one shared loom on city template (player land still unlimited). | City has exactly one loom; city place still blocked; land place OK |
| CL13.3 | **Weaver XP column.** Stop routing `weave_cloth` through carpenter XP; add weaverXp progress. | Craft grants weaver XP; gate uses weaver level; migration + tests |

---

# Phase CL14 — Gather / process tutors still stubbed

| ID | Work | Acceptance |
| --- | --- | --- |
| CL14.1 | **Seed Fisher + Alchemist tutors (≥2).** Real quest defs (not stub); city walk-up. If no fish/alchemy loop yet, objectives may be gather/craft stubs that already exist — do not invent full systems. | Walk-up panels; claims persist; document any deferred mechanics |
| CL14.2 | **Practice nodes for Fisher/Alchemist** if Content Lock / catalog already has a fitting station; otherwise city notice tip + `CITY_PRACTICE_STATIONS` null with Discovered note. | No homestead refill; scarce city only when station exists |

---

# Phase CL15 — Explore hunt profession tutors

| ID | Work | Acceptance |
| --- | --- | --- |
| CL15.1 | **Seed Animal Hunter + Monster Hunter tutors.** Place on City (or Explore if cleaner); objectives require explore hunt/trail — never homestead. | Quests refuse/complete only via explore; warrior unused |
| CL15.2 | **Builder tutor + first land build quest.** Tutorial nudges placing a station on empty player land via build board. | Claim after successful `placeLandStation`; no forced HUD |

---

# Phase CL16 — Hub / empty-land clarity

| ID | Work | Acceptance |
| --- | --- | --- |
| CL16.1 | **Empty-land build board tip.** One-shot or board copy: empty land is intentional; build stations or travel to City. | Tip dismissible / walk-up only; min HUD |
| CL16.2 | **Animal Breeder path note.** If no pens/livestock loop, ship tutor stub→notice tip only; else seed light breeder practice. | No invented livestock combat; document choice |

---

# Phase CL17 — Verification

| ID | Work | Acceptance |
| --- | --- | --- |
| CL17.1 | **Regression smoke after CL13–CL16.** Extend `citylands-smoke-cl7` (or successor) for new tutors/stations/XP. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL13.1 → CL13.2 → CL13.3 → CL14.1 → CL14.2 → CL15.1 → CL15.2 → CL16.1 → CL16.2 → CL17.1
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_2.md` | Phase 2 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
