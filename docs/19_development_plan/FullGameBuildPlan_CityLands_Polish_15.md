# Full Game Build Plan — CityLands Polish 15 (PL73+)

**Document Version:** 1.0.0  
**Status:** Done — PL73–PL76 complete; live queue → [FullGameBuildPlan_CityLands_Polish_16.md](FullGameBuildPlan_CityLands_Polish_16.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after bread·board refuses + expand tip + tutor Claim edge (PL71–PL72). Focus on remaining soft-refuse leftovers, process-station onboarding (mill / workshop / forge), housing decor tip + refuse, and quest/tutor readability — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL73–PL76 **done**. Rollover → Polish 16.

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
PL73 Soft refuse leftovers (food / build cell / repair)
 → PL74 Process station onboarding tips
 → PL75 Housing decor tip + refuse
 → PL76 Quest / tutor readability
```

---

# Phase PL73 — Soft refuse leftovers (food / build cell / repair)

| ID | Work | Acceptance |
| --- | --- | --- |
| PL73.1 | **No-food eat refuse ephemeral.** When soft-refuse `noFood`, ephemeral `Food` (or short equivalent) instead of sticky long prose alone. | Eat / energy numbers unchanged; mute ok |
| PL73.2 | **Build-cell-occupied refuse ephemeral.** When soft-refuse `buildCellOccupied`, ephemeral `Spot` (or short equivalent) instead of sticky long prose alone. | Place rules unchanged; mute ok |
| PL73.3 | **Tool-already-repaired refuse ephemeral.** When soft-refuse `toolAlreadyRepaired`, ephemeral `Intact` (or short equivalent) instead of sticky long prose alone. | Repair rules / costs unchanged; mute ok |

---

# Phase PL74 — Process station onboarding tips

| ID | Work | Acceptance |
| --- | --- | --- |
| PL74.1 | **First mill walk-up tip once.** One-shot ephemeral / soft tip on first mill proximity. | Craft recipes unchanged; min HUD |
| PL74.2 | **First workshop walk-up tip once.** One-shot ephemeral / soft tip on first workshop proximity. | Craft recipes unchanged; min HUD |
| PL74.3 | **First forge walk-up tip once.** One-shot ephemeral / soft tip on first forge proximity. | Craft recipes unchanged; min HUD |

---

# Phase PL75 — Housing decor tip + refuse

| ID | Work | Acceptance |
| --- | --- | --- |
| PL75.1 | **First decor-pad walk-up tip once.** One-shot ephemeral / soft tip on first housing decor pad proximity. | Decor costs unchanged; min HUD |
| PL75.2 | **Decor-already-placed refuse ephemeral.** When soft-refuse `decorAlreadyPlaced`, ephemeral `Taken` (or short equivalent) instead of sticky long prose alone. | Decor place rules unchanged; mute ok |

---

# Phase PL76 — Quest / tutor readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL76.1 | **Quest-not-ready refuse ephemeral.** When soft-refuse `questNotReady`, ephemeral `Objective` (or short equivalent) instead of sticky long prose alone. | Quest / XP rules unchanged; mute ok |
| PL76.2 | **First tutor NPC walk-up tip once.** One-shot ephemeral / soft tip on first tutorial NPC proximity (any profession tutor). | Tutor XP / claim rules unchanged; min HUD |

---

# Priority order for the agent

```
PL73.1 → PL73.2 → PL73.3
 → PL74.1 → PL74.2 → PL74.3
 → PL75.1 → PL75.2
 → PL76.1 → PL76.2
```

Lowest pending ID first. When this queue empties, author **Polish 16** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_14.md` | PL68–PL72 (done) |
| `FullGameBuildPlan_CityLands_Polish_16.md` | PL77+ (live) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
| `FutureIdeasBacklog.md` | Ideas outside polish |
