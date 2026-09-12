# Full Game Build Plan — CityLands Polish 2 (PL7+)

**Document Version:** 1.0.0  
**Status:** Done — PL7–PL11 complete; sequel [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)  

---

# Goal

Continue **player-visible / audible polish** after core-action feedback (PL6). Focus on map atmosphere, scarce-city clarity, inventory/energy readability, and light confirm cues — still min HUD, four free maps, no economy invent.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (PL6.2 cue pattern only).

---

# Phase order

```
PL7 Map atmosphere beds
 → PL8 Scarce-city station busy readability
 → PL9 Energy / bag feedback
 → PL10 Vendor & market confirm polish
 → PL11 Warrior optional atmosphere
```

---

# Phase PL7 — Map atmosphere beds

| ID | Work | Acceptance |
| --- | --- | --- |
| PL7.1 | **Per-map soft BGM tint.** Distinct quiet drone (or filter) for City / Land / Explore / Warrior via `game-audio`; still respects mute. | Four beds distinguishable; mute silences |
| PL7.2 | **Explore ambient tint.** Slightly tenser/sparser bed on Explore vs homestead Land (AudioDirection wilds). | Explore ≠ Land; no combat music suite |

---

# Phase PL8 — Scarce-city busy readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL8.1 | **Busy station world cue.** When city shared station is soft-busy, clearer pad/halo or prompt detail (“Busy”) without inventing qty caps. | Land unlimited unchanged; busy readable at a glance |
| PL8.2 | **Busy prompt copy.** Interact prompt names busy vs free for scarce city gather/craft stations. | Hierarchy still action-first; no always-on panel |

---

# Phase PL9 — Energy / bag feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL9.1 | **Low-energy TopBar cue.** Soft warning style when energy is low (threshold SoT or existing); clears when recovered. | Min HUD; not a toast stack |
| PL9.2 | **Inventory open accent.** Brief panel/header accent when bag opens from hotkey (no extra chrome columns). | Opens same panel; visible open feedback |

---

# Phase PL10 — Vendor & market confirm polish

| ID | Work | Acceptance |
| --- | --- | --- |
| PL10.1 | **Vendor buy/sell SFX.** Short confirm tones on successful buy/sell; mute edge. | New ids or reuse; no price retune |
| PL10.2 | **Market list/buy brief cue.** PL6.2-style ephemeral info on list/buy/cancel success. | Clears quickly; min HUD clean |

---

# Phase PL11 — Warrior optional atmosphere

| ID | Work | Acceptance |
| --- | --- | --- |
| PL11.1 | **Arena floor / plaque contrast.** Stronger warrior map read vs other maps; plaque stays optional-path copy. | No balance; homestead still refuses arena loop |
| PL11.2 | **Arena enter travel cue.** Travel-to-warrior uses distinct travel SFX variant or destination blurb emphasis. | Still fare-free instant; mute ok |

---

# Priority order for the agent

```
PL7.1 → PL7.2 → PL8.1 → PL8.2 → PL9.1 → PL9.2
 → PL10.1 → PL10.2 → PL11.1 → PL11.2
```

Lowest pending ID first. When this queue empties, author **Polish 3** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- **2026-08-02:** PL7–PL11 complete → rollover to [`FullGameBuildPlan_CityLands_Polish_3.md`](FullGameBuildPlan_CityLands_Polish_3.md) (PL12+).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish.md` | PL1–PL6 (done) |
| `docs/14_audio/AudioDirection.md` | Audio goals |
| `AgentAutonomousLoop.md` | Tick rules → PL\* |
| `TASKS.md` | Live Polish queue |
