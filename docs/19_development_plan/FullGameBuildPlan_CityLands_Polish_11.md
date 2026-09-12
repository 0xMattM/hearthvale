# Full Game Build Plan — CityLands Polish 11 (PL53+)

**Document Version:** 1.0.0  
**Status:** Done — PL53–PL57 complete; live queue → [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after empty-land / arena leftovers (PL52). Focus on visit / warrior onboarding, remaining soft-refuse ephemerals, leftover panel open accents, social/economy confirms, and quiet city / day-phase readability — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL53.1–PL57.2 **done**. Rollover → Polish 12.

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
PL53 Visit / warrior onboarding leftovers
 → PL54 Soft refuse ephemeral leftovers
 → PL55 Panel open accent leftovers
 → PL56 Social / economy confirm leftovers
 → PL57 City / day-phase readability
```

---

# Phase PL53 — Visit / warrior onboarding leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL53.1 | **First visit land tip once.** One-shot ephemeral / soft tip on first visit to another player's land (complements PL51.2 cool tint + visit banner). | Visit rules / trade hotkey unchanged; min HUD |
| PL53.2 | **First warrior map presence tip once.** One-shot ephemeral / soft tip on first Warrior map presence (optional path; complements PL45.2 plaque tip). | No balance invent; free enter/exit |

---

# Phase PL54 — Soft refuse ephemeral leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL54.1 | **Too-far refuse ephemeral.** When soft-refuse `tooFar`, ephemeral `Closer` (or short equivalent) instead of sticky long prose alone. | Interact ranges unchanged; mute ok |
| PL54.2 | **Coins refuse ephemeral.** When soft-refuse not-enough-coins (buy / place / list), ephemeral `Coins` instead of sticky long prose alone. | Prices / costs unchanged; mute ok |
| PL54.3 | **Materials refuse ephemeral.** When soft-refuse missing materials / not-enough-items, ephemeral `Materials` instead of sticky long prose alone. | Recipe / listing rules unchanged; mute ok |

---

# Phase PL55 — Panel open accent leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL55.1 | **Tutorial NPC panel open accent.** Brief accent when a tutor walk-up panel opens. | XP / claim rules unchanged |
| PL55.2 | **Deed panel open accent.** Brief accent when Deed / wallet surface opens (settings path). | No combat power; core loops stay wallet-free |

---

# Phase PL56 — Social / economy confirm leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL56.1 | **Trade offer create brief cue.** Ephemeral confirm when you successfully send a trade invite (complements receive cue PL18.1). | Escrow / nearby rules unchanged; mute ok |
| PL56.2 | **Market cancel brief cue.** Ephemeral confirm when you cancel your own listing (goods returned). | Escrow / fees unchanged; mute ok |
| PL56.3 | **Guild invite refresh brief cue.** Ephemeral confirm when owner/officer regenerates invite code. | Rank / invite rules unchanged; mute ok |

---

# Phase PL57 — City / day-phase readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL57.1 | **First city hub ephemeral tip once.** One-shot TopBar tip on first City presence (complements sticky `city_hub` onboarding). | Scarce stations unchanged; min HUD |
| PL57.2 | **Day-phase change soft cue.** Brief TopBar when day phase edges into Dawn / Dusk / Night (quiet secondary already exists while non-Day). | Cosmetics only; midday default quiet |

---

# Priority order for the agent

```
PL53.1 → PL53.2 → PL54.1 → PL54.2 → PL54.3
 → PL55.1 → PL55.2 → PL56.1 → PL56.2 → PL56.3
 → PL57.1 → PL57.2
```

Lowest pending ID first. When this queue empties, author **Polish 12** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_10.md` | PL48–PL52 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
| `FutureIdeasBacklog.md` | Ideas outside polish |
