# Full Game Build Plan — CityLands Polish 24 (PL116+)

**Document Version:** 1.0.0  
**Status:** Done — PL116–PL120 complete; live queue → [FullGameBuildPlan_CityLands_Polish_25.md](FullGameBuildPlan_CityLands_Polish_25.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_23.md](FullGameBuildPlan_CityLands_Polish_23.md) (PL111–PL115 **done**) · [FullGameBuildPlan_CityLands_Polish_22.md](FullGameBuildPlan_CityLands_Polish_22.md) (PL106–PL110 **done**) · [FullGameBuildPlan_CityLands_Polish_21.md](FullGameBuildPlan_CityLands_Polish_21.md) (PL101–PL105 **done**) · [FullGameBuildPlan_CityLands_Polish_20.md](FullGameBuildPlan_CityLands_Polish_20.md) (PL96–PL100 **done**) · [FullGameBuildPlan_CityLands_Polish_19.md](FullGameBuildPlan_CityLands_Polish_19.md) (PL91–PL95 **done**) · [FullGameBuildPlan_CityLands_Polish_18.md](FullGameBuildPlan_CityLands_Polish_18.md) (PL86–PL90 **done**) · [FullGameBuildPlan_CityLands_Polish_17.md](FullGameBuildPlan_CityLands_Polish_17.md) (PL81–PL85 **done**) · [FullGameBuildPlan_CityLands_Polish_16.md](FullGameBuildPlan_CityLands_Polish_16.md) (PL77–PL80 **done**) · [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md) (PL73–PL76 **done**) · [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after guild·deed·wallet·homestead·busy-pulse·travel-whisper (PL111–PL115). Soft-refuse and surface-refuse campaigns are largely complete — shift to **map atmosphere micro-contrast**, **city service readability**, **land production ambient cues**, **presence settle leftovers**, and **audio / portal chrome** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL116.1–PL120.2 **done** — queue emptied → Polish 25.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).  
- Do **not** invent caravan fares or refill single-land homestead as the default world.

---

# Phase order

```
PL116 Explore / wilds readability
 → PL117 City services atmosphere
 → PL118 Homestead / land production ambient
 → PL119 Presence settle / visit leftovers
 → PL120 Audio / portal chrome leftovers
```

---

# Phase PL116 — Explore / wilds readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL116.1 | **Explore hunt-trail wayfinding contrast.** Quiet distinct pad/tint so animal-hunter trails read apart from monster-hunter trails at a glance (complements section labels PL4.1). | Hunt rules / spawns unchanged; no station invent |
| PL116.2 | **Explore premium-node soft glow.** Soft emissive or pad cue on premium wood/ore nodes so Explore premiums read apart from common gather (complements PL12.2 depleted). | Premium rates unchanged; mute ok |

---

# Phase PL117 — City services atmosphere

| ID | Work | Acceptance |
| --- | --- | --- |
| PL117.1 | **Market / vendor service-pad warmth.** Quiet warmer lantern or pad under market/vendor so civic commerce reads apart from scarce yard (complements PL1.3 / PL36.1). | Prices / panels unchanged; no station invent |
| PL117.2 | **Notice-board unread soft flicker.** Brief plaque emissive flicker while tips unread (complements PL17.1 New accent) so event board stays glanceable. | Tip ids / localStorage unchanged; min HUD |

---

# Phase PL118 — Homestead / land production ambient

| ID | Work | Acceptance |
| --- | --- | --- |
| PL118.1 | **Lived-homestead quiet chimney cue.** Soft roof plume / chimney emissive when homestead has lived stations (complements empty meadow PL114.1) without inventing new buildings. | Build rules / beacon unchanged |
| PL118.2 | **Fishing-dock ready water shimmer.** Soft water/pad shimmer when dock is catch-ready (complements PL64.x ready edge) so land/city docks read at a glance. | Cooldown / catch rates unchanged; mute ok |

---

# Phase PL119 — Presence settle / visit leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL119.1 | **City scarce Free settle flash.** Brief pad dim/settle when a scarce station edges busy→free (complements PL115.1 peer pulse + sticky Free/Busy PL8). | Contention rules unchanged; mute ok |
| PL119.2 | **Visit host nameplate reinforce.** Soft host-name world reinforce on successful visit arrive (complements PL15.1 Visiting ephemeral) so visit loop stays readable. | Visit rules unchanged; min HUD |

---

# Phase PL120 — Audio / portal chrome leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL120.1 | **Map BGM bed identity.** Brief readable bed change (or stinger) on free-travel map arrive so City/Land/Explore/Arena beds stay distinct (complements travel SFX PL11.2). | Fare-free travel unchanged; mute ok |
| PL120.2 | **Portal highlight Free pulse.** Soft veil/frame pulse when portal is interact-highlighted (complements PL37.1 / PL14.2 tint) so Travel · free stays glanceable. | Portal destinations unchanged; mute ok |

---

# Priority order for the agent

```
PL116.1 → PL116.2
 → PL117.1 → PL117.2
 → PL118.1 → PL118.2
 → PL119.1 → PL119.2
 → PL120.1 → PL120.2
```

Lowest pending ID first. When this queue empties, author **Polish 25** (player-visible) — do **not** resume CL fidelity recycle.

**Continuations (2026-08-02):** Queue emptied after PL120.2 → [FullGameBuildPlan_CityLands_Polish_25.md](FullGameBuildPlan_CityLands_Polish_25.md) (PL121–PL125).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_23.md` | PL111–PL115 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
