# Full Game Build Plan — CityLands Polish 38 (PL186+)

**Document Version:** 1.0.0  
**Status:** Done — PL186–PL190 complete; live queue → [FullGameBuildPlan_CityLands_Polish_39.md](FullGameBuildPlan_CityLands_Polish_39.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_37.md](FullGameBuildPlan_CityLands_Polish_37.md) (PL181–PL185 **done**) · [FullGameBuildPlan_CityLands_Polish_36.md](FullGameBuildPlan_CityLands_Polish_36.md) (PL176–PL180 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after lived-home·City plaza/civic·claim/soft-war atmospheres, visit/peer rims, tutor-lane mist, and map-chip idle breath (PL181–PL185). Zone atmospheres and one-shot rims are largely complete — shift to **portal/commerce atmosphere parity**, **min-HUD idle glances** (interact · energy), and **closed-panel pending chips** (quest · guild invite) — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops, **NFT never = combat power**.

**Progress (2026-08-02):** PL186.1–PL190.2 **done**. Live queue → Polish 39.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs. Prefer kinship when an older PL* already covers the acceptance (do not stack identical rims).

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).  
- Do **not** invent caravan fares or refill single-land homestead as the default world.  
- Do **not** invent deeper soft-war scoring or PvP wipe rules.

---

# Phase order

```
PL186 Portal / market-board atmosphere leftovers
 → PL187 Vendor / notice atmosphere leftovers
 → PL188 Interact-prompt / energy-meter idle glances
 → PL189 Quest-pending / guild-invite closed glances
 → PL190 Crop-growing / fishing-dock atmosphere leftovers
```

---

# Phase PL186 — Portal / market-board atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL186.1 | **Portal soft atmosphere leftover.** Quiet cool pulsing mist tint/haze at existing Free portal footing while on non-Arena maps (complements Free landmark + threshold pulse; destinations / fares unchanged). Prefer kinship if an identical Free portal mist already covers it. | Fares free; mute ok |
| PL186.2 | **City market-board soft atmosphere leftover.** Quiet warm pulsing parchment mist over existing market board pad while on City (complements board landmark + commerce pad; prices / layouts unchanged). | Prices unchanged; mute ok |

---

# Phase PL187 — Vendor / notice atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL187.1 | **City vendor soft atmosphere leftover.** Quiet warm pulsing stall mist over existing City vendor pad while on City (complements stall landmark + Explore stall; prices unchanged). | Prices unchanged; mute ok |
| PL187.2 | **City notice soft atmosphere leftover.** Quiet cool pulsing civic mist over existing notice board pad while on City (complements board landmark + unread flicker; tip ids unchanged). | Tip ids unchanged; mute ok |

---

# Phase PL188 — Interact-prompt / energy-meter idle glances

| ID | Work | Acceptance |
| --- | --- | --- |
| PL188.1 | **Interact-prompt idle soft glance leftover.** Quiet periodic prompt chrome breath while in interact range with no panel open (complements action-first hierarchy + success pulse; no HUD column). | Min HUD; mute ok |
| PL188.2 | **Energy-meter idle soft glance leftover.** Quiet periodic TopBar energy-bar breath while walking healthy with no panel open (complements low-energy warn + vignette; regen rules unchanged; min HUD). | Regen unchanged; min HUD; mute ok |

---

# Phase PL189 — Quest-pending / guild-invite closed glances

| ID | Work | Acceptance |
| --- | --- | --- |
| PL189.1 | **Quest-pending closed glance leftover.** Quiet TopBar quest chip while a claimable quest reward is pending and Quest panel closed (complements claim rim + panel open accent; no always-on quest column). Prefer kinship if covered. | Quest rules unchanged; min HUD; mute ok |
| PL189.2 | **Guild-invite closed glance leftover.** Quiet TopBar invite chip while an unanswered guild invite is pending and social panel closed (complements accept rim + membership accents; no always-on social column). Prefer kinship if covered. | Invite rules unchanged; min HUD; mute ok |

---

# Phase PL190 — Crop-growing / fishing-dock atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL190.1 | **Crop-growing soft atmosphere leftover.** Quiet warm pulsing soil mist over existing crop plots while growing (not ready) on player land (complements growing sway + ready pulse; growMs / yields unchanged). | Grow / yield SoT; mute ok |
| PL190.2 | **Fishing-dock soft atmosphere leftover.** Quiet cool pulsing water mist over existing fishing dock while on City or player land (complements dock landmark + ready shimmer; catch rates unchanged). Prefer kinship if City dock mist already covers City. | Catch rates SoT; mute ok |

---

# Priority order for the agent

```
PL186.1 → PL186.2
 → PL187.1 → PL187.2
 → PL188.1 → PL188.2
 → PL189.1 → PL189.2
 → PL190.1 → PL190.2
```

Lowest pending ID first. When this queue empties, author **Polish 39** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_37.md` | PL181–PL185 (done) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
