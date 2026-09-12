# Full Game Build Plan — CityLands Polish 5 (PL23+)

**Document Version:** 1.0.0  
**Status:** Done — PL23–PL27 complete; live queue → [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after homestead yard atmosphere + housing decor labels (PL22). Focus on craft-station readability, remaining panel-open accents, repair/first-build confirms, and quiet social leave/chat feedback — still min HUD, four free maps, no economy invent.

**Progress (2026-08-02):** PL23.1–PL27.2 **done**. Rollover → Polish 6.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).

---

# Phase order

```
PL23 Craft / station world readability
 → PL24 Panel open accents (remaining)
 → PL25 Repair / first-build confirms
 → PL26 Expand pad affordability cue
 → PL27 Social leave / chat quiet feedback
```

---

# Phase PL23 — Craft / station world readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL23.1 | **Process station world labels.** Mill / forge / kitchen / workshop (and loom / alchemy if present) get name-first world Html matching PL22.2 / PL2.1 hierarchy spirit. | Costs/recipes unchanged; no new HUD column |
| PL23.2 | **Gather station name cue when ready.** Tree / ore (land) floating name when ready to chop/mine — soft secondary Ready; depleted stay timer/pad only (PL12.2). | No spawn-rate invent |

---

# Phase PL24 — Panel open accents (remaining)

| ID | Work | Acceptance |
| --- | --- | --- |
| PL24.1 | **Build panel open accent.** Brief border/header tint when Build Board panel opens (PL9.2 / PL19 pattern). | Same panel; place costs unchanged |
| PL24.2 | **Craft panel open accent.** Brief accent when a craft station panel opens from walk-up. | Same panel; recipes unchanged |
| PL24.3 | **Travel panel open accent.** Brief accent when Travel opens (N / portal). | Fare-free; destination list unchanged |

---

# Phase PL25 — Repair / first-build confirms

| ID | Work | Acceptance |
| --- | --- | --- |
| PL25.1 | **Repair tool success cue.** Soft SFX and/or ephemeral TopBar cue on successful tool repair. | Durability rules / costs unchanged; fail silent or refuse |
| PL25.2 | **First station place homestead cue.** Ephemeral “Homestead” (or similar) cue on first placeable station place — complements PL3.1 soft beacon + PL22.1 lived yard. | Subsequent places stay quiet build cue only; mute ok |

---

# Phase PL26 — Expand pad affordability cue

| ID | Work | Acceptance |
| --- | --- | --- |
| PL26.1 | **Expand pad afford tint.** Quiet world pad tint when expand is affordable vs short funds/energy (walk-up / highlight). | Costs unchanged; no HUD column |
| PL26.2 | **Expand refuse clarity.** Soft refuse path names what’s missing (coins / energy) without arcade spam. | Mute ok; PL16.1 gate remains narrow |

---

# Phase PL27 — Social leave / chat quiet feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL27.1 | **Visit leave brief cue.** Soft SFX and/or ephemeral cue when leaving a visit back home (complement PL15.1 arrive). | Own-land idle silent; mute ok |
| PL27.2 | **Chat receive soft ping.** Quiet SFX (and optional ephemeral) when a new chat line arrives while panel closed. | No always-on chat column; mute ok; no spam stack |

---

# Priority order for the agent

```
PL23.1 → PL23.2 → PL24.1 → PL24.2 → PL24.3
 → PL25.1 → PL25.2 → PL26.1 → PL26.2 → PL27.1 → PL27.2
```

All items **done**. Live queue → [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_6.md` | **Live** PL28+ |
| `FullGameBuildPlan_CityLands_Polish_4.md` | PL18–PL22 (done) |
| `FullGameBuildPlan_CityLands_Polish_3.md` | PL12–PL17 (done) |
| `FullGameBuildPlan_CityLands_Polish_2.md` | PL7–PL11 (done) |
| `FullGameBuildPlan_CityLands_Polish.md` | PL1–PL6 (done) |
| `docs/14_audio/AudioDirection.md` | Audio goals |
| `AgentAutonomousLoop.md` | Tick rules → PL\* |
| `TASKS.md` | Live Polish queue |
