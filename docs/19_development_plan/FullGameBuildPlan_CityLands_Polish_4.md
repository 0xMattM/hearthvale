# Full Game Build Plan — CityLands Polish 4 (PL18+)

**Document Version:** 1.0.0  
**Status:** Done — PL18–PL22 complete; live queue → [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after mail/notice accents (PL17). Focus on trade/social confirms, economy panel open feedback, eat/equip/expand cues, and quiet tool/durability readability — still min HUD, four free maps, no economy invent.

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
PL18 Trade / social confirms
 → PL19 Economy panel open accents
 → PL20 Eat / equip / expand cues
 → PL21 Tool durability readability
 → PL22 Quiet homestead / yard atmosphere
```

---

# Phase PL18 — Trade / social confirms

| ID | Work | Acceptance |
| --- | --- | --- |
| PL18.1 | **Trade invite receive cue.** Soft SFX and/or ephemeral TopBar line when an incoming trade invite arrives. | No always-on trade column; mute ok |
| PL18.2 | **Trade accept success cue.** Ephemeral TopBar cue on successful accept (PL6.2 pattern). | Cancel/refuse silent or refuse path; escrow rules unchanged |

---

# Phase PL19 — Economy panel open accents

| ID | Work | Acceptance |
| --- | --- | --- |
| PL19.1 | **Vendor panel open accent.** Brief border/header tint when Vendor Stall panel opens from walk-up (PL9.2 inventory pattern). | Same panel; no price retune |
| PL19.2 | **Market panel open accent.** Brief accent when City Market Board opens. | Same panel; listings unchanged |

---

# Phase PL20 — Eat / equip / expand cues

| ID | Work | Acceptance |
| --- | --- | --- |
| PL20.1 | **Eat food success cue.** Ephemeral TopBar cue (+ optional soft SFX) on successful eat. | Energy numbers unchanged; empty/refuse silent or refuse path |
| PL20.2 | **Equip tool brief cue.** Soft confirm when a tool equips (or unequips) from inventory. | Durability rules unchanged; mute ok |
| PL20.3 | **Expand field success cue.** Ephemeral cue when land expand succeeds. | Costs unchanged; fail silent or refuse path |

---

# Phase PL21 — Tool durability readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL21.1 | **Low tool durability accent.** Quiet inventory/equipped hint when equipped tool durability is low (threshold SoT). | Min HUD; clears when repaired/replaced; no toast stack |
| PL21.2 | **Broken tool refuse clarity.** Soft refuse path already plays; ensure prompt/copy names the broken tool clearly when gather/craft needs it. | No arcade spam; mute ok |

---

# Phase PL22 — Quiet homestead / yard atmosphere

| ID | Work | Acceptance |
| --- | --- | --- |
| PL22.1 | **Built-yard soft atmosphere.** After first station place, homestead gets a quiet pad/path tint so “lived-in” yards read apart from empty land (PL3.1 complement). | Empty beacon still works; no station invent |
| PL22.2 | **Housing decor world label polish.** Placed planter/banner world labels get soft hierarchy (name first) matching PL2.1 prompt spirit. | Costs unchanged; no new HUD column |

---

# Priority order for the agent

```
PL18.1 → PL18.2 → PL19.1 → PL19.2 → PL20.1 → PL20.2 → PL20.3
 → PL21.1 → PL21.2 → PL22.1 → PL22.2
```

Lowest pending ID first. When this queue empties, author **Polish 5** (player-visible) — do **not** resume CL fidelity recycle.

**Rollover (2026-08-02):** Queue emptied after PL22.2 → [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23+).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_3.md` | PL12–PL17 (done) |
| `FullGameBuildPlan_CityLands_Polish_2.md` | PL7–PL11 (done) |
| `FullGameBuildPlan_CityLands_Polish.md` | PL1–PL6 (done) |
| `docs/14_audio/AudioDirection.md` | Audio goals |
| `AgentAutonomousLoop.md` | Tick rules → PL\* |
| `TASKS.md` | Live Polish queue |
