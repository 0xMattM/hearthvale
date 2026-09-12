# Full Game Build Plan — CityLands Polish 8 (PL38+)

**Document Version:** 1.0.0  
**Status:** Done — PL38–PL42 complete; live queue → [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after production afford + map atmosphere + portal/mute (PL35–PL37). Focus on leftover panel open accents, remaining production/housing afford clarity, crop/travel/presence readability, and quiet energy/optional-path feedback — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL38.1–PL42.2 **done**. Rollover → Polish 9.

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
PL38 Remaining panel open accents
 → PL39 Production / housing afford leftovers
 → PL40 Crop / travel / presence readability
 → PL41 Energy / optional-path feedback
 → PL42 Soft refuse / onboarding clarity
```

---

# Phase PL38 — Remaining panel open accents

| ID | Work | Acceptance |
| --- | --- | --- |
| PL38.1 | **Chat panel open accent.** Brief border/header tint when Chat opens (Enter / hotkey). | Same panel; receive ping (PL27.2) still works |
| PL38.2 | **Settings panel open accent.** Brief accent when Settings opens (H). | Prefs / mute (PL37.2) unchanged |

---

# Phase PL39 — Production / housing afford leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL39.1 | **Craft upgrade afford clarity.** Soft short-funds/mats/energy hint (or quiet tint) on station T2 Upgrade row when not affordable. | Upgrade costs unchanged; recipes unchanged |
| PL39.2 | **Decor place afford clarity.** Soft short-coins hint on Housing decor place rows when short. | Coin costs unchanged; no HUD column |

---

# Phase PL40 — Crop / travel / presence readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL40.1 | **Crop ready world name cue.** Name-first + soft `Ready` (or crop name) when a plot is harvestable — complements pulse (PL12.1). | Grow timers unchanged; no spawn invent |
| PL40.2 | **Travel arrive map-chip pulse.** Brief TopBar map-identity chip pulse/accent on successful free travel arrive. | Fare-free; destinations unchanged |
| PL40.3 | **Presence peer soft silhouette.** Quiet peer tint/halo so nearby players read apart from NPC tutors/stations (city/visit). | Presence rules unchanged; no HUD column |

---

# Phase PL41 — Energy / optional-path feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL41.1 | **Low energy threshold brief cue.** Ephemeral TopBar `Energy low` when crossing into low band (meter already warns PL9.1). | Energy numbers unchanged; mute ok; no always-on column |
| PL41.2 | **Warrior optional-path soft haze.** Slight warm haze / plaque polish so Arena reads optional-parallel apart from Explore canopy (PL36.2) without inviting combat invent. | No balance / gear ladder; free enter/exit |

---

# Phase PL42 — Soft refuse / onboarding clarity

| ID | Work | Acceptance |
| --- | --- | --- |
| PL42.1 | **Busy scarce refuse ephemeral.** When soft-refuse busy city station, ephemeral `Busy` (or keep SFX + brief TopBar) instead of sticky-only silence. | Contention rules unchanged; mute ok |
| PL42.2 | **First portal walk-up tip once.** One-shot ephemeral or soft world tip on first portal proximity (fare-free circuit) — dismissible / not sticky forever. | Free travel unchanged; min HUD |

---

# Priority order for the agent

```
PL38.1 → PL38.2 → PL39.1 → PL39.2 → PL40.1 → PL40.2 → PL40.3
 → PL41.1 → PL41.2 → PL42.1 → PL42.2
```

Lowest pending ID first. When this queue empties, author **Polish 9** (player-visible) — do **not** resume CL fidelity recycle.

**Continuation:** [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43+).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_7.md` | PL33–PL37 (done) |
| `FullGameBuildPlan_CityLands_Polish_6.md` | PL28–PL32 (done) |
| `FullGameBuildPlan_CityLands_Polish_5.md` | PL23–PL27 (done) |
| `FullGameBuildPlan_CityLands_Polish_4.md` | PL18–PL22 (done) |
| `FullGameBuildPlan_CityLands_Polish_3.md` | PL12–PL17 (done) |
| `FullGameBuildPlan_CityLands_Polish_2.md` | PL7–PL11 (done) |
| `FullGameBuildPlan_CityLands_Polish.md` | PL1–PL6 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live checklist |
