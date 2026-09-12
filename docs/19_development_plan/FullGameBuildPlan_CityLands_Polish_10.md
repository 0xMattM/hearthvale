# Full Game Build Plan — CityLands Polish 10 (PL48+)

**Document Version:** 1.0.0  
**Status:** Done — PL48–PL52 complete; live queue → [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after progress feedback (PL47). Focus on leftover production/guild-bank confirms, soft unlock / title readability, guild membership cues, map audio continuity, and remaining onboarding / arena accents — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL48.1–PL52.2 **done**. Rollover → Polish 11.

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
PL48 Production / guild bank feedback leftovers
 → PL49 Soft unlock / title progress
 → PL50 Guild membership confirms
 → PL51 Map continuity / audio
 → PL52 Remaining onboarding / arena accents
```

---

# Phase PL48 — Production / guild bank feedback leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL48.1 | **Craft station upgrade success cue.** Ephemeral TopBar confirm after successful station upgrade (T2). | Upgrade costs / BUILDING_UPGRADES unchanged; mute ok |
| PL48.2 | **Guild bank deposit brief cue.** Ephemeral confirm on successful bank deposit. | Bank rules unchanged; mute ok |
| PL48.3 | **Guild bank withdraw brief cue.** Ephemeral confirm on successful bank withdraw. | Bank rules unchanged; mute ok |

---

# Phase PL49 — Soft unlock / title progress

| ID | Work | Acceptance |
| --- | --- | --- |
| PL49.1 | **Character title change ephemeral.** Brief TopBar when cosmetic title changes with level (Settler / Homesteader / Veteran). | Titles stay cosmetic; no combat power; min HUD |
| PL49.2 | **Extra decor pad unlock tip once.** One-shot ephemeral when characterLevel first reaches the soft extra-decor unlock. | Unlock level / pad slot unchanged; no HUD column |

---

# Phase PL50 — Guild membership confirms

| ID | Work | Acceptance |
| --- | --- | --- |
| PL50.1 | **Guild create / join brief cue.** Ephemeral confirm on successful create or join. | Invite / rank rules unchanged; mute ok |
| PL50.2 | **Guild leave brief cue.** Ephemeral confirm on successful leave. | Leave rules unchanged; mute ok |

---

# Phase PL51 — Map continuity / audio

| ID | Work | Acceptance |
| --- | --- | --- |
| PL51.1 | **BGM soft transition on map change.** Quieter restart or brief crossfade when landKind / visit map bed changes (beds already distinct). | Bed identities unchanged; mute ok |
| PL51.2 | **Visit land soft atmosphere tint.** Quiet cool/warm distinction when visiting another player's land vs home yard. | Visit rules / trade hotkey unchanged; no HUD column |

---

# Phase PL52 — Remaining onboarding / arena accents

| ID | Work | Acceptance |
| --- | --- | --- |
| PL52.1 | **First empty-land build-board tip once.** One-shot ephemeral / soft tip on first empty player-land with build board (complements PL3.1 beacon). | Place costs unchanged; min HUD |
| PL52.2 | **Arena stub panel open accent.** Brief accent when Arena stub opens (plaque / travel). | Optional path copy unchanged; no balance invent |

---

# Priority order for the agent

```
PL48.1 → PL48.2 → PL48.3 → PL49.1 → PL49.2
 → PL50.1 → PL50.2 → PL51.1 → PL51.2 → PL52.1 → PL52.2
```

Lowest pending ID first. When this queue empties, author **Polish 11** (player-visible) — do **not** resume CL fidelity recycle.

**Rollover (2026-08-02):** PL48–PL52 complete → [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_11.md` | **Live** polish plan (PL53+) |
| `FullGameBuildPlan_CityLands_Polish_9.md` | PL43–PL47 (done) |
| `FullGameBuildPlan_CityLands_Polish_8.md` | PL38–PL42 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
| `FutureIdeasBacklog.md` | Ideas outside polish |
