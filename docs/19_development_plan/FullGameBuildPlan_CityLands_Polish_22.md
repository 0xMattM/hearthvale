# Full Game Build Plan — CityLands Polish 22 (PL106+)

**Document Version:** 1.0.0  
**Status:** Done — queue emptied → [Polish 23](FullGameBuildPlan_CityLands_Polish_23.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_21.md](FullGameBuildPlan_CityLands_Polish_21.md) (PL101–PL105 **done**) · [FullGameBuildPlan_CityLands_Polish_20.md](FullGameBuildPlan_CityLands_Polish_20.md) (PL96–PL100 **done**) · [FullGameBuildPlan_CityLands_Polish_19.md](FullGameBuildPlan_CityLands_Polish_19.md) (PL91–PL95 **done**) · [FullGameBuildPlan_CityLands_Polish_18.md](FullGameBuildPlan_CityLands_Polish_18.md) (PL86–PL90 **done**) · [FullGameBuildPlan_CityLands_Polish_17.md](FullGameBuildPlan_CityLands_Polish_17.md) (PL81–PL85 **done**) · [FullGameBuildPlan_CityLands_Polish_16.md](FullGameBuildPlan_CityLands_Polish_16.md) (PL77–PL80 **done**) · [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md) (PL73–PL76 **done**) · [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)  
**Sequel:** [FullGameBuildPlan_CityLands_Polish_23.md](FullGameBuildPlan_CityLands_Polish_23.md) (PL111+)

---

# Goal

Continue **player-visible / audible polish** after decor·expand soft refuses (PL101–PL105). Focus on remaining **housing / plant / inventory·build / guild / quest** sticky ACTION_ERROR leftovers that still lack ephemeral one-word TopBar cues — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL106.1–PL110.2 **done**. Queue emptied → [Polish 23](FullGameBuildPlan_CityLands_Polish_23.md).

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
PL106 Decor leftovers soft refuses
 → PL107 Plant / crop soft refuses
 → PL108 Inventory / station soft refuses
 → PL109 Guild leftovers soft refuses
 → PL110 Quest / missing-item soft refuses
```

---

# Phase PL106 — Decor leftovers soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL106.1 | **Unknown-decor refuse ephemeral.** When soft-refuse `unknownDecor`, ephemeral `Decor` (or short equivalent) instead of sticky long prose alone. | Decor catalog unchanged; mute ok |
| PL106.2 | **Decor-need-coins refuse ephemeral.** When soft-refuse dynamic `needCoinsDecor(n)`, ephemeral `Coins` (or short equivalent) instead of sticky long prose alone. | Decor prices unchanged; mute ok; distinct from market Fee |

---

# Phase PL107 — Plant / crop soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL107.1 | **Unknown-seed refuse ephemeral.** When soft-refuse `unknownSeed`, ephemeral `Plant` (or short equivalent) instead of sticky long prose alone. | Plant rules unchanged; mute ok; distinct from missing-seed `Seed` |
| PL107.2 | **Crop-missing refuse ephemeral.** When soft-refuse `cropMissing`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Crop rules unchanged; mute ok |

---

# Phase PL108 — Inventory / station soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL108.1 | **Item-missing refuse ephemeral.** When soft-refuse `itemMissing`, ephemeral `Item` (or short equivalent) instead of sticky long prose alone. | Inventory rules unchanged; mute ok |
| PL108.2 | **Unknown-station refuse ephemeral.** When soft-refuse `unknownStation`, ephemeral `Build` (or short equivalent) instead of sticky long prose alone. | Station build catalog unchanged; mute ok; distinct from craft `Station` |

---

# Phase PL109 — Guild leftovers soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL109.1 | **Guild-not-found refuse ephemeral.** When soft-refuse `guildNotFound`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Guild lookup unchanged; mute ok |
| PL109.2 | **Guild-target-missing refuse ephemeral.** When soft-refuse `guildTargetMissing`, ephemeral `Member` (or short equivalent) instead of sticky long prose alone. | Guild membership rules unchanged; mute ok |
| PL109.3 | **Guild-rank-invalid refuse ephemeral.** When soft-refuse `guildRankInvalid`, ephemeral `Rank` (or short equivalent) instead of sticky long prose alone. | Rank enum unchanged; mute ok |

---

# Phase PL110 — Quest / missing-item soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL110.1 | **Quest-unknown refuse ephemeral.** When soft-refuse `questUnknown`, ephemeral `Quest` (or short equivalent) instead of sticky long prose alone. | Quest catalog unchanged; mute ok |
| PL110.2 | **Missing-item refuse ephemeral.** When soft-refuse dynamic `missingItem(name)`, ephemeral `Need` (or short equivalent) instead of sticky long prose alone. | Item requirements unchanged; mute ok |

---

# Priority order for the agent

```
PL106.1 → PL106.2
 → PL107.1 → PL107.2
 → PL108.1 → PL108.2
 → PL109.1 → PL109.2 → PL109.3
 → PL110.1 → PL110.2
```

Lowest pending ID first. When this queue empties, author **Polish 23** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- 2026-08-02: Queue emptied after PL110.2 → [FullGameBuildPlan_CityLands_Polish_23.md](FullGameBuildPlan_CityLands_Polish_23.md) (PL111+).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_21.md` | PL101–PL105 (done) |
| `FullGameBuildPlan_CityLands_Polish_23.md` | PL111+ (live sequel) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
