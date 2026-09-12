# Full Game Build Plan — CityLands Polish 18 (PL86+)

**Document Version:** 1.0.0  
**Status:** Done — queue emptied → Polish 19  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_17.md](FullGameBuildPlan_CityLands_Polish_17.md) (PL81–PL85 **done**) · [FullGameBuildPlan_CityLands_Polish_16.md](FullGameBuildPlan_CityLands_Polish_16.md) (PL77–PL80 **done**) · [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md) (PL73–PL76 **done**) · [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)
**Sequel:** [FullGameBuildPlan_CityLands_Polish_19.md](FullGameBuildPlan_CityLands_Polish_19.md) (PL91+)

---

# Goal

Continue **player-visible / audible polish** after claim / soft-war / market / mail / travel refuses (PL81–PL85). Focus on remaining social soft refuses (trade · guild · contest-need-guild), land-place / upgrade soft refuses — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL86.1–PL90.1 **done**. Queue emptied → [Polish 19](FullGameBuildPlan_CityLands_Polish_19.md).

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
PL86 Trade soft refuses
 → PL87 Guild membership soft refuses
 → PL88 Soft-war contest guild + land place refuses
 → PL89 Upgrade soft refuses
 → PL90 Travel coins refuse
```

---

# Phase PL86 — Trade soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL86.1 | **Trade-self refuse ephemeral.** When soft-refuse `tradeSelf`, ephemeral `Self` (or short equivalent) instead of sticky long prose alone. | Trade rules unchanged; mute ok |
| PL86.2 | **Trade-empty refuse ephemeral.** When soft-refuse `tradeEmpty`, ephemeral `Empty` (or short equivalent) instead of sticky long prose alone. | Trade rules unchanged; mute ok |
| PL86.3 | **Trade-player-missing refuse ephemeral.** When soft-refuse `tradePlayerMissing`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Trade rules unchanged; mute ok |

---

# Phase PL87 — Guild membership soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL87.1 | **Guild-already-in refuse ephemeral.** When soft-refuse `guildAlreadyIn`, ephemeral `Member` (or short equivalent) instead of sticky long prose alone. | Guild rules unchanged; mute ok |
| PL87.2 | **Guild-not-in refuse ephemeral.** When soft-refuse `guildNotIn`, ephemeral `No guild` (or short equivalent) instead of sticky long prose alone. | Guild rules unchanged; mute ok |
| PL87.3 | **Guild-exists refuse ephemeral.** When soft-refuse `guildExists`, ephemeral `Taken` (or short equivalent) instead of sticky long prose alone. | Guild naming unchanged; mute ok |

---

# Phase PL88 — Soft-war contest guild + land place refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL88.1 | **Claim-war-need-guild refuse ephemeral.** When soft-refuse `claimWarNeedGuild`, ephemeral `Guild` (or short equivalent) instead of sticky long prose alone. | Soft-war rules unchanged; mute ok |
| PL88.2 | **Build-player-land-only refuse ephemeral.** When soft-refuse `buildPlayerLandOnly`, ephemeral `Land` (or short equivalent) instead of sticky long prose alone. | Place rules unchanged; mute ok |

---

# Phase PL89 — Upgrade soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL89.1 | **Already-upgraded refuse ephemeral.** When soft-refuse `alreadyUpgraded`, ephemeral `Max` (or short equivalent) instead of sticky long prose alone. | Upgrade rules unchanged; mute ok |
| PL89.2 | **Cannot-upgrade refuse ephemeral.** When soft-refuse `cannotUpgradeBuilding`, ephemeral `Fixed` (or short equivalent) instead of sticky long prose alone. | Upgrade rules unchanged; mute ok |

---

# Phase PL90 — Travel coins refuse

| ID | Work | Acceptance |
| --- | --- | --- |
| PL90.1 | **Travel-need-coins refuse ephemeral.** When soft-refuse `needCoinsTravel`, ephemeral `Coins` (or short equivalent) instead of sticky long prose alone. | Caravan costs unchanged; mute ok |

---

# Priority order for the agent

```
PL86.1 → PL86.2 → PL86.3
 → PL87.1 → PL87.2 → PL87.3
 → PL88.1 → PL88.2
 → PL89.1 → PL89.2
 → PL90.1
```

Lowest pending ID first. When this queue empties, author **Polish 19** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_17.md` | PL81–PL85 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
