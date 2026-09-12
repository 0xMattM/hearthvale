# Full Game Build Plan — CityLands Polish 20 (PL96+)

**Document Version:** 1.0.0  
**Status:** Done — queue emptied → Polish 21  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_19.md](FullGameBuildPlan_CityLands_Polish_19.md) (PL91–PL95 **done**) · [FullGameBuildPlan_CityLands_Polish_18.md](FullGameBuildPlan_CityLands_Polish_18.md) (PL86–PL90 **done**) · [FullGameBuildPlan_CityLands_Polish_17.md](FullGameBuildPlan_CityLands_Polish_17.md) (PL81–PL85 **done**) · [FullGameBuildPlan_CityLands_Polish_16.md](FullGameBuildPlan_CityLands_Polish_16.md) (PL77–PL80 **done**) · [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md) (PL73–PL76 **done**) · [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)
**Sequel:** [FullGameBuildPlan_CityLands_Polish_21.md](FullGameBuildPlan_CityLands_Polish_21.md) (PL101+)

---

# Goal

Continue **player-visible / audible polish** after trade escrow / mail / market / guild name·invite refuses (PL91–PL95). Focus on remaining **mail party**, **market fee·stack**, **guild bank·rank**, and **map-gate / repair** soft refuses — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL96.1–PL100.2 **done**. Queue emptied → [Polish 21](FullGameBuildPlan_CityLands_Polish_21.md).

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
PL96 Mail party soft refuses
 → PL97 Market fee / stack soft refuses
 → PL98 Guild bank / rank soft refuses
 → PL99 Map-gate soft refuses
 → PL100 Repair / tool soft refuses
```

---

# Phase PL96 — Mail party soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL96.1 | **Mail-not-found refuse ephemeral.** When soft-refuse `mailNotFound`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Mail escrow unchanged; mute ok |
| PL96.2 | **Mail-only-recipient refuse ephemeral.** When soft-refuse `mailOnlyRecipient`, ephemeral `Wait` (or short equivalent) instead of sticky long prose alone. | Mail claim rules unchanged; mute ok |
| PL96.3 | **Mail-only-sender refuse ephemeral.** When soft-refuse `mailOnlySender`, ephemeral `Sender` (or short equivalent) instead of sticky long prose alone. | Mail cancel rules unchanged; mute ok |

---

# Phase PL97 — Market fee / stack soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL97.1 | **Market-need-fee refuse ephemeral.** When soft-refuse dynamic `marketNeedFee(n)`, ephemeral `Fee` (or short equivalent) instead of sticky long prose alone. | Listing fee numbers unchanged; mute ok |
| PL97.2 | **Market-not-stackable refuse ephemeral.** When soft-refuse `marketNotStackable`, ephemeral `Stack` (or short equivalent) instead of sticky long prose alone. | Market stack rules unchanged; mute ok |

---

# Phase PL98 — Guild bank / rank soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL98.1 | **Guild-bank-full refuse ephemeral.** When soft-refuse `guildBankFull`, ephemeral `Full` (or short equivalent) instead of sticky long prose alone. | Guild bank slots unchanged; mute ok |
| PL98.2 | **Guild-bank-empty refuse ephemeral.** When soft-refuse `guildBankEmpty`, ephemeral `Empty` (or short equivalent) instead of sticky long prose alone. | Guild bank withdraw rules unchanged; mute ok |
| PL98.3 | **Guild-rank-forbidden refuse ephemeral.** When soft-refuse `guildRankForbidden` or `guildInviteForbidden`, ephemeral `Rank` (or short equivalent) instead of sticky long prose alone. | Guild rank / invite refresh rules unchanged; mute ok |

---

# Phase PL99 — Map-gate soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL99.1 | **Hunt-explore-only refuse ephemeral.** When soft-refuse `huntExploreOnly`, ephemeral `Explore` (or short equivalent) instead of sticky long prose alone. | Hunt map gate unchanged; mute ok |
| PL99.2 | **Warrior-homestead-forbidden refuse ephemeral.** When soft-refuse `warriorTrainingHomesteadForbidden`, ephemeral `Arena` (or short equivalent) instead of sticky long prose alone. | Warrior/arena place rules unchanged; mute ok |

---

# Phase PL100 — Repair / tool soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL100.1 | **Repair-need-mats refuse ephemeral.** When soft-refuse dynamic `needMatsRepair(qty,name)`, ephemeral `Mats` (or short equivalent) instead of sticky long prose alone. | Repair costs unchanged; mute ok |
| PL100.2 | **Not-a-tool refuse ephemeral.** When soft-refuse `notATool`, ephemeral `Tool` (or short equivalent) instead of sticky long prose alone. | Equip rules unchanged; mute ok |

---

# Priority order for the agent

```
PL96.1 → PL96.2 → PL96.3
 → PL97.1 → PL97.2
 → PL98.1 → PL98.2 → PL98.3
 → PL99.1 → PL99.2
 → PL100.1 → PL100.2
```

Lowest pending ID first. When this queue empties, author **Polish 21** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_19.md` | PL91–PL95 (done) |
| `FullGameBuildPlan_CityLands_Polish_21.md` | Sequel (PL101+) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
