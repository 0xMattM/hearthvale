# Full Game Build Plan — CityLands Polish 19 (PL91+)

**Document Version:** 1.0.0  
**Status:** Done — queue emptied → Polish 20  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_18.md](FullGameBuildPlan_CityLands_Polish_18.md) (PL86–PL90 **done**) · [FullGameBuildPlan_CityLands_Polish_17.md](FullGameBuildPlan_CityLands_Polish_17.md) (PL81–PL85 **done**) · [FullGameBuildPlan_CityLands_Polish_16.md](FullGameBuildPlan_CityLands_Polish_16.md) (PL77–PL80 **done**) · [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md) (PL73–PL76 **done**) · [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)
**Sequel:** [FullGameBuildPlan_CityLands_Polish_20.md](FullGameBuildPlan_CityLands_Polish_20.md) (PL96+)

---

# Goal

Continue **player-visible / audible polish** after trade / guild / contest / land / upgrade / travel-coins refuses (PL86–PL90). Focus on remaining **trade escrow**, **mail**, **market**, and **guild naming/invite** soft refuses — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL91.1–PL95.2 **done**. Queue emptied → [Polish 20](FullGameBuildPlan_CityLands_Polish_20.md).

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
PL91 Trade escrow soft refuses
 → PL92 Trade broke / missing-items soft refuses
 → PL93 Mail leftovers soft refuses
 → PL94 Market leftovers soft refuses
 → PL95 Guild name / invite soft refuses
```

---

# Phase PL91 — Trade escrow soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL91.1 | **Trade-not-found refuse ephemeral.** When soft-refuse `tradeNotFound`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Trade escrow unchanged; mute ok |
| PL91.2 | **Trade-not-yours refuse ephemeral.** When soft-refuse `tradeNotYours`, ephemeral `Yours` (or short equivalent) instead of sticky long prose alone. | Trade escrow unchanged; mute ok |
| PL91.3 | **Trade-only-recipient refuse ephemeral.** When soft-refuse `tradeOnlyRecipient`, ephemeral `Wait` (or short equivalent) instead of sticky long prose alone. | Trade accept rules unchanged; mute ok |

---

# Phase PL92 — Trade broke / missing-items soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL92.1 | **Trade-broke refuse ephemeral.** When soft-refuse `tradeYouBroke` or `tradeSenderBroke`, ephemeral `Broke` (or short equivalent) instead of sticky long prose alone. | Trade coin escrow unchanged; mute ok |
| PL92.2 | **Trade-missing-items refuse ephemeral.** When soft-refuse `tradeYouMissingItems` or `tradeSenderMissingItems`, ephemeral `Items` (or short equivalent) instead of sticky long prose alone. | Trade item escrow unchanged; mute ok |

---

# Phase PL93 — Mail leftovers soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL93.1 | **Mail-empty refuse ephemeral.** When soft-refuse `mailEmpty`, ephemeral `Empty` (or short equivalent) instead of sticky long prose alone. | Mail escrow unchanged; mute ok |
| PL93.2 | **Mail-player-missing refuse ephemeral.** When soft-refuse `mailPlayerMissing`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Mail rules unchanged; mute ok |
| PL93.3 | **Mail-already-claimed refuse ephemeral.** When soft-refuse `mailAlreadyClaimed`, ephemeral `Claimed` (or short equivalent) instead of sticky long prose alone. | Mail claim rules unchanged; mute ok |

---

# Phase PL94 — Market leftovers soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL94.1 | **Market-not-found refuse ephemeral.** When soft-refuse `marketNotFound`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Market listings unchanged; mute ok |
| PL94.2 | **Market-not-yours refuse ephemeral.** When soft-refuse `marketNotYours`, ephemeral `Yours` (or short equivalent) instead of sticky long prose alone. | Market ownership unchanged; mute ok |

---

# Phase PL95 — Guild name / invite soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL95.1 | **Guild-invite-invalid refuse ephemeral.** When soft-refuse `guildInviteInvalid`, ephemeral `Code` (or short equivalent) instead of sticky long prose alone. | Guild invite rules unchanged; mute ok |
| PL95.2 | **Guild-name-invalid refuse ephemeral.** When soft-refuse `guildNameInvalid`, ephemeral `Name` (or short equivalent) instead of sticky long prose alone. | Guild naming bounds unchanged; mute ok |

---

# Priority order for the agent

```
PL91.1 → PL91.2 → PL91.3
 → PL92.1 → PL92.2
 → PL93.1 → PL93.2 → PL93.3
 → PL94.1 → PL94.2
 → PL95.1 → PL95.2
```

Lowest pending ID first. When this queue empties, author **Polish 20** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_18.md` | PL86–PL90 (done) |
| `FullGameBuildPlan_CityLands_Polish_20.md` | Sequel (PL96+) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
