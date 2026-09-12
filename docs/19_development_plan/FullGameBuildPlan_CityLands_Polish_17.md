# Full Game Build Plan — CityLands Polish 17 (PL81+)

**Document Version:** 1.0.0  
**Status:** Done — PL81–PL85 complete; live queue → [FullGameBuildPlan_CityLands_Polish_18.md](FullGameBuildPlan_CityLands_Polish_18.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_16.md](FullGameBuildPlan_CityLands_Polish_16.md) (PL77–PL80 **done**) · [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md) (PL73–PL76 **done**) · [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after vendor refuses + claim-node tip/guild refuse (PL79–PL80). Focus on remaining claim / soft-war soft refuses, market / mail / travel readability — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL81–PL85 **done**. Rollover → Polish 18.

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
PL81 Claim collect / hold soft refuses
 → PL82 Soft-war soft refuses
 → PL83 Market soft refuses
 → PL84 Mail soft refuses
 → PL85 Travel-in-progress refuse
```

---

# Phase PL81 — Claim collect / hold soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL81.1 | **Claim-held-by-other refuse ephemeral.** When soft-refuse `claimHeldByOther`, ephemeral `Held` (or short equivalent) instead of sticky long prose alone. | Claim / war rules unchanged; mute ok |
| PL81.2 | **Claim-nothing-stored refuse ephemeral.** When soft-refuse `claimNothingStored`, ephemeral `Empty` (or short equivalent) instead of sticky long prose alone. | Claim produce rules unchanged; mute ok |

---

# Phase PL82 — Soft-war soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL82.1 | **Claim-war-already-open refuse ephemeral.** When soft-refuse `claimWarAlreadyOpen`, ephemeral `Contest` (or short equivalent) instead of sticky long prose alone. | Soft-war rules unchanged; mute ok |
| PL82.2 | **Claim-war-need-mats refuse ephemeral.** When soft-refuse `claimWarNeedMats`, ephemeral `Wood` (or short equivalent) instead of sticky long prose alone. | Deliver scoring unchanged; mute ok |
| PL82.3 | **Claim-war-not-open refuse ephemeral.** When soft-refuse `claimWarNotOpen`, ephemeral `Peace` (or short equivalent) instead of sticky long prose alone. | Soft-war rules unchanged; mute ok |

---

# Phase PL83 — Market soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL83.1 | **Market-own-listing refuse ephemeral.** When soft-refuse `marketOwnListing`, ephemeral `Yours` (or short equivalent) instead of sticky long prose alone. | Market fee / escrow unchanged; mute ok |
| PL83.2 | **Market-expired refuse ephemeral.** When soft-refuse `marketExpired`, ephemeral `Expired` (or short equivalent) instead of sticky long prose alone. | TTL / return rules unchanged; mute ok |

---

# Phase PL84 — Mail soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL84.1 | **Mail-self refuse ephemeral.** When soft-refuse `mailSelf`, ephemeral `Self` (or short equivalent) instead of sticky long prose alone. | Mail escrow unchanged; mute ok |
| PL84.2 | **Mail-inbox-full refuse ephemeral.** When soft-refuse `mailInboxFull`, ephemeral `Full` (or short equivalent) instead of sticky long prose alone. | Mailbox caps unchanged; mute ok |

---

# Phase PL85 — Travel-in-progress refuse

| ID | Work | Acceptance |
| --- | --- | --- |
| PL85.1 | **Travel-in-progress refuse ephemeral.** When soft-refuse `travelInProgress`, ephemeral `Road` (or short equivalent) instead of sticky long prose alone. | Caravan timing / costs unchanged; mute ok |

---

# Priority order for the agent

```
PL81.1 → PL81.2
 → PL82.1 → PL82.2 → PL82.3
 → PL83.1 → PL83.2
 → PL84.1 → PL84.2
 → PL85.1
```

Lowest pending ID first. When this queue empties, author **Polish 18** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_16.md` | PL77–PL80 (done) |
| `FullGameBuildPlan_CityLands_Polish_18.md` | **Live** polish plan (PL86+) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
