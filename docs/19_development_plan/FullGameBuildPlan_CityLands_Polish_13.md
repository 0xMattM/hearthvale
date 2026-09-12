# Full Game Build Plan — CityLands Polish 13 (PL63+)

**Document Version:** 1.0.0  
**Status:** Done — PL63–PL67 complete; live queue → [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after tool-low / trade-cancel / chat-send (PL61–PL62). Focus on remaining gather/hunt cooldown refuse ephemerals, health + seed soft feedback, gather ready edge cues, and first dock/pen walk-up tips — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL63.1–PL67.1 **done**. Rollover → Polish 14.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).  
- Do **not** put wallet/deed UX into core farm/craft loops.

---

# Phase order

```
PL63 Gather / hunt cooldown refuse leftovers
 → PL64 Health / seed soft feedback
 → PL65 Gather ready edge cues
 → PL66 Dock / pen onboarding tips
 → PL67 Health readability accent
```

---

# Phase PL63 — Gather / hunt cooldown refuse leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL63.1 | **Wood stump cooldown soft refuse ephemeral.** When soft-refuse wood stump cooldown, ephemeral `Resting` (or short equivalent) instead of sticky long prose alone. | Cooldown numbers unchanged; mute ok |
| PL63.2 | **Fishing dock cooldown soft refuse ephemeral.** When soft-refuse fishing dock cooldown, ephemeral `Waiting` (or short equivalent) instead of sticky long prose alone. | Cooldown numbers unchanged; mute ok |
| PL63.3 | **Animal pen cooldown soft refuse ephemeral.** When soft-refuse animal pen cooldown, ephemeral `Resting` (or short equivalent) instead of sticky long prose alone. | Cooldown numbers unchanged; mute ok |
| PL63.4 | **Hunt cooldown soft refuse ephemeral.** When soft-refuse hunt cooldown, ephemeral `Scattered` (or short equivalent) instead of sticky long prose alone. | Cooldown / spawn rates unchanged; mute ok |

---

# Phase PL64 — Health / seed soft feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL64.1 | **Health low threshold cue.** Brief TopBar when health first crosses into a low band (mirror energy PL41.1). | Health numbers / combat rules unchanged; mute ok |
| PL64.2 | **Missing seed refuse ephemeral.** When soft-refuse missing wheat seed, ephemeral `Seed` (or short equivalent) instead of sticky long prose alone. | Plant rules unchanged; mute ok |

---

# Phase PL65 — Gather ready edge cues

| ID | Work | Acceptance |
| --- | --- | --- |
| PL65.1 | **Wood stump ready soft cue.** Brief TopBar when a stump first becomes chop-ready again after cooldown (edge into ready). | Cooldown / yields unchanged; mute ok |
| PL65.2 | **Fishing dock ready soft cue.** Brief TopBar when a dock first becomes cast-ready again after cooldown (edge into ready). | Cooldown / yields unchanged; mute ok |

---

# Phase PL66 — Dock / pen onboarding tips

| ID | Work | Acceptance |
| --- | --- | --- |
| PL66.1 | **First fishing dock walk-up tip once.** One-shot ephemeral / soft tip on first fishing dock proximity. | Catch rules unchanged; min HUD |
| PL66.2 | **First animal pen walk-up tip once.** One-shot ephemeral / soft tip on first animal pen proximity. | Care / collect rules unchanged; min HUD |

---

# Phase PL67 — Health readability accent

| ID | Work | Acceptance |
| --- | --- | --- |
| PL67.1 | **Low health TopBar accent.** Soft warm accent on HP readout while in the low band (clears when recovered; complements PL64.1 edge cue). | Health numbers unchanged; no toast stack |

---

# Priority order for the agent

```
PL63.1 → PL63.2 → PL63.3 → PL63.4
 → PL64.1 → PL64.2
 → PL65.1 → PL65.2
 → PL66.1 → PL66.2
 → PL67.1
```

Lowest pending ID first. When this queue empties, author **Polish 14** (player-visible) — do **not** resume CL fidelity recycle. Queue emptied 2026-08-02 → [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_12.md` | PL58–PL62 (done) |
| `FullGameBuildPlan_CityLands_Polish_14.md` | PL68+ (live after rollover) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
| `FutureIdeasBacklog.md` | Ideas outside polish |
