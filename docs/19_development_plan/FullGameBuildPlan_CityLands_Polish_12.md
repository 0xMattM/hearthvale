# Full Game Build Plan — CityLands Polish 12 (PL58+)

**Document Version:** 1.0.0  
**Status:** Done — PL58–PL62 complete; live queue → [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after city hub / day-phase readability (PL57). Focus on remaining soft-refuse ephemerals, first market/vendor walk-up tips, crop/gather readiness cues, tool durability threshold feedback, and leftover social confirms — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL58.1–PL62.2 **done**. Rollover → Polish 13.

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
PL58 Soft refuse ephemeral leftovers
 → PL59 Market / vendor onboarding tips
 → PL60 Crop / gather readiness cues
 → PL61 Tool durability threshold
 → PL62 Social confirm leftovers
```

---

# Phase PL58 — Soft refuse ephemeral leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL58.1 | **Hammer refuse ephemeral.** When soft-refuse `needHammer` / `needHammerBroken`, ephemeral `Hammer` (or short equivalent) instead of sticky long prose alone. | Tool rules / ore chip unchanged; mute ok |
| PL58.2 | **Crop-not-ready refuse ephemeral.** When soft-refuse `cropNotReady`, ephemeral `Growing` instead of sticky long prose alone. | Grow timers unchanged; mute ok |
| PL58.3 | **Plot-occupied refuse ephemeral.** When soft-refuse `plotNotEmpty`, ephemeral `Occupied` instead of sticky long prose alone. | Plant rules unchanged; mute ok |

---

# Phase PL59 — Market / vendor onboarding tips

| ID | Work | Acceptance |
| --- | --- | --- |
| PL59.1 | **First market walk-up tip once.** One-shot ephemeral / soft tip on first market board proximity (complements post_craft_market sticky). | List / buy / fee rules unchanged; min HUD |
| PL59.2 | **First vendor walk-up tip once.** One-shot ephemeral / soft tip on first vendor stall proximity (tools / seeds). | Vendor prices unchanged; min HUD |

---

# Phase PL60 — Crop / gather readiness cues

| ID | Work | Acceptance |
| --- | --- | --- |
| PL60.1 | **Crop ready soft world cue.** Brief soft world / TopBar when a plot first becomes ready to harvest (edge into ready). | Grow timers / yields unchanged; mute ok |
| PL60.2 | **Ore cooldown soft refuse ephemeral.** When soft-refuse ore cooldown, ephemeral `Settling` (or short equivalent) instead of sticky long prose alone. | Cooldown numbers unchanged; mute ok |

---

# Phase PL61 — Tool durability threshold

| ID | Work | Acceptance |
| --- | --- | --- |
| PL61.1 | **Tool durability low threshold cue.** Brief TopBar when equipped tool first crosses into low-durability band (meter accent already exists). | Durability numbers / break rules unchanged; mute ok |

---

# Phase PL62 — Social confirm leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL62.1 | **Trade cancel brief cue.** Ephemeral confirm when you cancel your outgoing trade offer. | Escrow / nearby rules unchanged; mute ok |
| PL62.2 | **Chat send brief cue.** Soft confirm when you successfully send a chat line (complements receive ping PL27.2). | Chat rules unchanged; mute ok |

---

# Priority order for the agent

```
PL58.1 → PL58.2 → PL58.3
 → PL59.1 → PL59.2
 → PL60.1 → PL60.2
 → PL61.1
 → PL62.1 → PL62.2
```

Lowest pending ID first. When this queue empties, author **Polish 13** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_11.md` | PL53–PL57 (done) |
| `FullGameBuildPlan_CityLands_Polish_13.md` | PL63+ (live after rollover) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
| `FutureIdeasBacklog.md` | Ideas outside polish |
