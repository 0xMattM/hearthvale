# Full Game Build Plan — CityLands Polish 6 (PL28+)

**Document Version:** 1.0.0  
**Status:** Done — PL28–PL32 complete; live queue → [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after visit leave + chat receive (PL27). Focus on remaining sticky → ephemeral confirms, social/quest panel open accents, leftover profession station world labels, visit stay-state declutter, and quiet commerce afford cues — still min HUD, four free maps, no economy invent.

**Progress (2026-08-02):** PL28.1–PL32.2 **done**. Rollover → Polish 7.

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
PL28 Sticky → ephemeral confirms (remaining)
 → PL29 Social / quest panel open accents
 → PL30 Profession station world labels (remaining)
 → PL31 Visit stay-state / guild claim declutter
 → PL32 Commerce afford row cues
```

---

# Phase PL28 — Sticky → ephemeral confirms (remaining)

| ID | Work | Acceptance |
| --- | --- | --- |
| PL28.1 | **Trade offer sent cue.** Soft SFX and/or ephemeral TopBar cue when a trade offer is sent (replace sticky escrow prose). | Escrow rules unchanged; fail silent or refuse |
| PL28.2 | **Mail send / cancel brief cues.** Ephemeral cues on successful parcel send and cancel (replace sticky prose). | Escrow unchanged; mute ok |
| PL28.3 | **Subsequent station place Built cue.** After first Homestead (PL25.2), later places get brief ephemeral `Built` (or keep soft build SFX + ephemeral) instead of sticky Built line. | Place costs unchanged; mute ok |

---

# Phase PL29 — Social / quest panel open accents

| ID | Work | Acceptance |
| --- | --- | --- |
| PL29.1 | **Trade panel open accent.** Brief border/header tint when Trade panel opens (T / invite review). | Same panel; escrow unchanged |
| PL29.2 | **Quest panel open accent.** Brief accent when Quest log opens (Q). | Same panel; rewards unchanged |
| PL29.3 | **Quest claim success cue.** Soft SFX and/or ephemeral cue when a starter quest claim succeeds (distinct from tutor Claimed if needed). | XP/coins unchanged; fail silent |

---

# Phase PL30 — Profession station world labels (remaining)

| ID | Work | Acceptance |
| --- | --- | --- |
| PL30.1 | **Fishing dock ready world label.** Name-first + soft `Ready` when dock catch is available (PL23.2 pattern). | Cooldown / yields unchanged; depleted stay quiet pad/timer |
| PL30.2 | **Animal pen ready world label.** Name-first + soft `Ready` when pen gather is available. | Same as dock; no spawn invent |
| PL30.3 | **Tutor claimable world accent.** Quiet pad/halo or secondary label when a tutor objective is claimable on walk-up. | Claim XP/coins unchanged; no HUD column |

---

# Phase PL31 — Visit stay-state / guild claim declutter

| ID | Work | Acceptance |
| --- | --- | --- |
| PL31.1 | **Visit interact sticky declutter.** Visiting walk-up no longer sticky-sets long leave prose; banner + Esc/Go home stay sufficient (PL15.1 / PL27.1 cover arrive/leave). | Min HUD; trade hotkey unchanged |
| PL31.2 | **Guild claim / soft-war brief cues.** Ephemeral cues for Wild Grove claim / soft-war start / collect (replace sticky setInfo). | Rules unchanged; mute ok |

---

# Phase PL32 — Commerce afford row cues

| ID | Work | Acceptance |
| --- | --- | --- |
| PL32.1 | **Vendor row afford tint.** Quiet row tint when a vendor buy is affordable vs short coins (panel open). | Prices unchanged; no always-on economy column |
| PL32.2 | **Market list afford clarity.** Soft short-funds hint on buy rows when coins are insufficient (or disable styling already present is clarified). | Listings/TTL unchanged; mute ok |

---

# Priority order for the agent

```
PL28.1 → PL28.2 → PL28.3 → PL29.1 → PL29.2 → PL29.3
 → PL30.1 → PL30.2 → PL30.3 → PL31.1 → PL31.2 → PL32.1 → PL32.2
```

Lowest pending ID first. When this queue empties, author **Polish 7** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- **2026-08-02:** PL28–PL32 complete → rollover to [`FullGameBuildPlan_CityLands_Polish_7.md`](FullGameBuildPlan_CityLands_Polish_7.md) (PL33+).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_5.md` | PL23–PL27 (done) |
| `FullGameBuildPlan_CityLands_Polish_4.md` | PL18–PL22 (done) |
| `FullGameBuildPlan_CityLands_Polish_3.md` | PL12–PL17 (done) |
| `FullGameBuildPlan_CityLands_Polish_2.md` | PL7–PL11 (done) |
| `FullGameBuildPlan_CityLands_Polish.md` | PL1–PL6 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live checklist |
