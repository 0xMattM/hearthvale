# Full Game Build Plan — CityLands Polish 25 (PL121+)

**Document Version:** 1.0.0  
**Status:** Done — PL121–PL125 complete; live queue → [FullGameBuildPlan_CityLands_Polish_26.md](FullGameBuildPlan_CityLands_Polish_26.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_24.md](FullGameBuildPlan_CityLands_Polish_24.md) (PL116–PL120 **done**) · [FullGameBuildPlan_CityLands_Polish_23.md](FullGameBuildPlan_CityLands_Polish_23.md) (PL111–PL115 **done**) · [FullGameBuildPlan_CityLands_Polish_22.md](FullGameBuildPlan_CityLands_Polish_22.md) (PL106–PL110 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after explore·city·homestead·visit·BGM·portal (PL116–PL120). Soft-refuse campaigns and map-bed/portal chrome are largely complete — shift to **production ambient leftovers**, **self / day-phase readability**, **afford / trade glanceables**, and **energy·food feedback** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL121.1–PL125.2 **done** — queue emptied → Polish 26.

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
PL121 Production ambient leftovers
 → PL122 Self / day-phase readability
 → PL123 Afford / trade glanceables
 → PL124 Energy / food feedback
 → PL125 City landmark / settings chrome
```

---

# Phase PL121 — Production ambient leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL121.1 | **Crop growing soft sway cue.** Quiet stem/pad motion or soft emissive while crop is growing (not ready) so plots read apart from empty + ready pulse (PL12.1). | Grow timers / harvest rules unchanged; mute ok |
| PL121.2 | **Process-station working emissive.** Soft bench glow while a mill/workshop/forge/etc. craft is in-flight (panel open or craft pending) so land craft reads busy without inventing queues. | Recipe / XP rules unchanged; mute ok |

---

# Phase PL122 — Self / day-phase readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL122.1 | **Local avatar map-tint micro.** Quiet cloak/kit tint shift by current map (City/Land/Explore/Arena) so self presence matches map identity (complements portal tint PL14.2 / chip PL14.1). | Movement / combat unchanged; min HUD |
| PL122.2 | **Day-phase soft world haze.** Brief readable haze/light reinforce on dusk↔night or night↔dawn edges (complements day-night lighting) so time-of-day stays glanceable. | Cosmetic cycle / settings toggle unchanged |

---

# Phase PL123 — Afford / trade glanceables

| ID | Work | Acceptance |
| --- | --- | --- |
| PL123.1 | **Expand-pad short afford pulse.** Soft pad pulse when expand is interact-highlighted and coins are short (complements PL26.1 short tint) so afford reads at a glance. | Expand costs / slots unchanged; mute ok |
| PL123.2 | **Trade preferred-partner nameplate.** Soft world or panel reinforce of preferred trade partner name when opening trade while visiting (complements visit host nameplate PL119.2). | Trade rules / T hotkey unchanged; min HUD |

---

# Phase PL124 — Energy / food feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL124.1 | **Energy-low soft world vignette.** Quiet edge vignette (not a HUD column) while energy is below the low threshold (complements TopBar PL9.1). | Threshold SoT unchanged; clears when recovered; mute ok |
| PL124.2 | **Eat success soft reinforce.** Brief world or ephemeral reinforce on successful eat (complements eat SFX) so food→energy loop stays readable. | Food / energy rules unchanged; mute ok |

---

# Phase PL125 — City landmark / settings chrome

| ID | Work | Acceptance |
| --- | --- | --- |
| PL125.1 | **City plaza soft landmark cue.** Quiet emissive or haze on an existing city plaza mesh so the hub center reads apart from scarce yards (no new stations). | Scarce contention / layouts unchanged |
| PL125.2 | **Mute-toggle soft confirm.** Brief ephemeral or SFX-free visual confirm when enabling mute in settings so mute state stays glanceable (complements mute silencing audio). | Mute still silences BGM+SFX; settings only |

---

# Priority order for the agent

```
PL121.1 → PL121.2
 → PL122.1 → PL122.2
 → PL123.1 → PL123.2
 → PL124.1 → PL124.2
 → PL125.1 → PL125.2
```

Lowest pending ID first. When this queue empties, author **Polish 26** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- **2026-08-02:** Queue emptied after PL125.2 → [FullGameBuildPlan_CityLands_Polish_26.md](FullGameBuildPlan_CityLands_Polish_26.md) (PL126–PL130).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_24.md` | PL116–PL120 (done) |
| `FullGameBuildPlan_CityLands_Polish_26.md` | PL126–PL130 (live) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
