# Full Game Build Plan — CityLands Polish 14 (PL68+)

**Document Version:** 1.0.0  
**Status:** Done — PL68–PL72 complete; live queue → [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after dock/pen walk-up tips + low-health TopBar accent (PL66–PL67). Focus on remaining gather/farm/hunt onboarding tips, ore·pen ready edges, kitchen·notice walk-ups, soft refuse leftovers, and expand/tutor readability — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL68–PL72 **done**. Rollover → Polish 15.

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
PL68 Gather / farm / hunt onboarding tips
 → PL69 Ore / pen ready edge cues
 → PL70 Kitchen / notice onboarding tips
 → PL71 Soft refuse leftovers
 → PL72 Expand / tutor readability
```

---

# Phase PL68 — Gather / farm / hunt onboarding tips

| ID | Work | Acceptance |
| --- | --- | --- |
| PL68.1 | **First tree stump walk-up tip once.** One-shot ephemeral / soft tip on first tree stump proximity. | Chop rules unchanged; min HUD |
| PL68.2 | **First ore node walk-up tip once.** One-shot ephemeral / soft tip on first ore node proximity. | Chip / hammer rules unchanged; min HUD |
| PL68.3 | **First crop plot walk-up tip once.** One-shot ephemeral / soft tip on first crop plot proximity. | Plant / harvest rules unchanged; min HUD |
| PL68.4 | **First hunt trail walk-up tip once.** One-shot ephemeral / soft tip on first game trail / edge thicket proximity. | Hunt / spawn rates unchanged; min HUD |

---

# Phase PL69 — Ore / pen ready edge cues

| ID | Work | Acceptance |
| --- | --- | --- |
| PL69.1 | **Ore node ready soft cue.** Brief TopBar when an ore node first becomes chip-ready again after cooldown (edge into ready). | Cooldown / yields unchanged; mute ok |
| PL69.2 | **Animal pen ready soft cue.** Brief TopBar when a pen first becomes care-ready again after cooldown (edge into ready). | Cooldown / yields unchanged; mute ok |

---

# Phase PL70 — Kitchen / notice onboarding tips

| ID | Work | Acceptance |
| --- | --- | --- |
| PL70.1 | **First kitchen walk-up tip once.** One-shot ephemeral / soft tip on first kitchen proximity. | Craft recipes unchanged; min HUD |
| PL70.2 | **First notice board walk-up tip once.** One-shot ephemeral / soft tip on first notice board proximity. | Tip / mail rules unchanged; min HUD |

---

# Phase PL71 — Soft refuse leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL71.1 | **No-bread energy refuse ephemeral.** When soft-refuse `noBread`, ephemeral `Bread` (or short equivalent) instead of sticky long prose alone. | Eat / energy numbers unchanged; mute ok |
| PL71.2 | **Build-board-missing refuse ephemeral.** When soft-refuse `buildBoardMissing`, ephemeral `Board` (or short equivalent) instead of sticky long prose alone. | Place rules unchanged; mute ok |

---

# Phase PL72 — Expand / tutor readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL72.1 | **First expand-pad walk-up tip once.** One-shot ephemeral / soft tip on first expand-pad proximity. | Expand costs unchanged; min HUD |
| PL72.2 | **Tutor claim-ready soft TopBar cue.** Brief TopBar when a tutor objective first becomes claimable (complements world Claim accent PL30.3). | XP / claim rules unchanged; mute ok |

---

# Priority order for the agent

```
PL68.1 → PL68.2 → PL68.3 → PL68.4
 → PL69.1 → PL69.2
 → PL70.1 → PL70.2
 → PL71.1 → PL71.2
 → PL72.1 → PL72.2
```

Lowest pending ID first. When this queue empties, author **Polish 15** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_15.md` | **Live** sequel (PL73+) |
| `FullGameBuildPlan_CityLands_Polish_13.md` | PL63–PL67 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
| `FutureIdeasBacklog.md` | Ideas outside polish |
