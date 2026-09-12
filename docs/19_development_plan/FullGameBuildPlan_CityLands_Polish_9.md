# Full Game Build Plan — CityLands Polish 9 (PL43+)

**Document Version:** 1.0.0  
**Status:** Done — PL43–PL47 complete; live queue → [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after soft refuse / onboarding clarity (PL42). Focus on gather/vendor success feedback leftovers, remaining soft-refuse ephemerals, optional-path / explore one-shot tips, leftover system panel open accents, and quiet progress confirms — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL43.1–PL47.2 **done**. Rollover → Polish 10.

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
PL43 Gather / vendor success leftovers
 → PL44 Soft refuse ephemeral leftovers
 → PL45 Optional-path / explore onboarding
 → PL46 System panel open accents
 → PL47 Progress feedback
```

---

# Phase PL43 — Gather / vendor success leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL43.1 | **Gather success ephemeral.** Brief TopBar cue after successful chop / mine / dock catch / pen collect (SFX already plays). | Yields / cooldowns unchanged; mute ok |
| PL43.2 | **Vendor sell success cue.** Ephemeral TopBar confirm on successful Vendor Stall sell (complements sell SFX). | Prices unchanged; mute ok |
| PL43.3 | **Vendor buy success cue.** Ephemeral TopBar confirm on successful Vendor Stall buy (complements buy SFX). | Prices unchanged; mute ok |

---

# Phase PL44 — Soft refuse ephemeral leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL44.1 | **Energy refuse ephemeral.** When soft-refuse not-enough-energy, ephemeral `Energy` (or keep SFX + brief TopBar) instead of sticky long prose alone. | Energy numbers unchanged; mute ok |
| PL44.2 | **Travel already-here ephemeral.** When soft-refuse already-here travel, ephemeral `Already here` instead of sticky long prose alone. | Fare-free destinations unchanged; mute ok |

---

# Phase PL45 — Optional-path / explore onboarding

| ID | Work | Acceptance |
| --- | --- | --- |
| PL45.1 | **First Explore walk-up tip once.** One-shot ephemeral or soft tip on first Explore map presence (wilds / hunt+gather) — dismissible / not sticky forever. | Spawn rates unchanged; min HUD |
| PL45.2 | **Arena optional walk-up tip once.** One-shot tip near arena plaque / warrior portal stressing optional path (no gear ladder) — not sticky forever. | No balance invent; free enter/exit |

---

# Phase PL46 — System panel open accents

| ID | Work | Acceptance |
| --- | --- | --- |
| PL46.1 | **Guild panel open accent.** Brief border/header tint when Guild opens (G). | Same panel; claim/war rules unchanged |
| PL46.2 | **Achievements panel open accent.** Brief accent when Achievements opens (A). | Stub counters unchanged |

---

# Phase PL47 — Progress feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL47.1 | **Character level-up ephemeral.** Brief TopBar `Level N` (or similar) when characterLevel increases. | XP curve unchanged; no always-on column |
| PL47.2 | **Achievement unlock brief cue.** Ephemeral confirm when an achievement flips unlocked (A list still works). | Unlock rules unchanged; mute ok |

---

# Priority order for the agent

```
PL43.1 → PL43.2 → PL43.3 → PL44.1 → PL44.2
 → PL45.1 → PL45.2 → PL46.1 → PL46.2 → PL47.1 → PL47.2
```

Lowest pending ID first. When this queue empties, author **Polish 10** (player-visible) — do **not** resume CL fidelity recycle.

**Rollover (2026-08-02):** Queue emptied after PL47.2 → [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_8.md` | PL38–PL42 (done) |
| `FullGameBuildPlan_CityLands_Polish_7.md` | PL33–PL37 (done) |
| `FullGameBuildPlan_CityLands_Polish_6.md` | PL28–PL32 (done) |
| `FullGameBuildPlan_CityLands_Polish_5.md` | PL23–PL27 (done) |
| `FullGameBuildPlan_CityLands_Polish_4.md` | PL18–PL22 (done) |
| `FullGameBuildPlan_CityLands_Polish_3.md` | PL12–PL17 (done) |
| `FullGameBuildPlan_CityLands_Polish_2.md` | PL7–PL11 (done) |
| `FullGameBuildPlan_CityLands_Polish.md` | PL1–PL6 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live checklist |
