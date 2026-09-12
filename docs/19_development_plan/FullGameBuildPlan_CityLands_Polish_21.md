# Full Game Build Plan — CityLands Polish 21 (PL101+)

**Document Version:** 1.0.0  
**Status:** Done — queue emptied → [Polish 22](FullGameBuildPlan_CityLands_Polish_22.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_20.md](FullGameBuildPlan_CityLands_Polish_20.md) (PL96–PL100 **done**) · [FullGameBuildPlan_CityLands_Polish_19.md](FullGameBuildPlan_CityLands_Polish_19.md) (PL91–PL95 **done**) · [FullGameBuildPlan_CityLands_Polish_18.md](FullGameBuildPlan_CityLands_Polish_18.md) (PL86–PL90 **done**) · [FullGameBuildPlan_CityLands_Polish_17.md](FullGameBuildPlan_CityLands_Polish_17.md) (PL81–PL85 **done**) · [FullGameBuildPlan_CityLands_Polish_16.md](FullGameBuildPlan_CityLands_Polish_16.md) (PL77–PL80 **done**) · [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md) (PL73–PL76 **done**) · [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)
**Sequel:** [FullGameBuildPlan_CityLands_Polish_22.md](FullGameBuildPlan_CityLands_Polish_22.md) (PL106+)

---

# Goal

Continue **player-visible / audible polish** after map-gate / repair soft refuses (PL96–PL100). Focus on remaining **land-node missing**, **guild-bank leftovers**, **mail·market invalid**, **craft-gate**, and **decor·expand** soft refuses — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL101.1–PL105.3 **done**. Queue emptied → [Polish 22](FullGameBuildPlan_CityLands_Polish_22.md).

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
PL101 Land-node missing soft refuses
 → PL102 Guild bank leftovers soft refuses
 → PL103 Mail / market invalid soft refuses
 → PL104 Craft-gate soft refuses
 → PL105 Decor / expand soft refuses
```

---

# Phase PL101 — Land-node missing soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL101.1 | **Gather-node-missing refuse ephemeral.** When soft-refuse `oreNodeMissing` / `woodStumpMissing` / `fishingDockMissing` / `animalPenMissing`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Gather node rules unchanged; mute ok |
| PL101.2 | **Plot-missing refuse ephemeral.** When soft-refuse `plotMissing`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Plot rules unchanged; mute ok |
| PL101.3 | **Hunt-or-claim-missing refuse ephemeral.** When soft-refuse `huntMissing` / `claimNodeMissing`, ephemeral `Gone` (or short equivalent) instead of sticky long prose alone. | Hunt / claim node rules unchanged; mute ok |

---

# Phase PL102 — Guild bank leftovers soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL102.1 | **Guild-bank-not-stackable refuse ephemeral.** When soft-refuse `guildBankNotStackable`, ephemeral `Stack` (or short equivalent) instead of sticky long prose alone. | Guild bank stack rules unchanged; mute ok |
| PL102.2 | **Guild-bank-unknown-item refuse ephemeral.** When soft-refuse `guildBankUnknownItem`, ephemeral `Item` (or short equivalent) instead of sticky long prose alone. | Guild bank item rules unchanged; mute ok |
| PL102.3 | **Guild-bank-bad-qty refuse ephemeral.** When soft-refuse `guildBankBadQty`, ephemeral `Qty` (or short equivalent) instead of sticky long prose alone. | Guild bank qty rules unchanged; mute ok |

---

# Phase PL103 — Mail / market invalid soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL103.1 | **Mail-not-stackable refuse ephemeral.** When soft-refuse `mailNotStackable`, ephemeral `Stack` (or short equivalent) instead of sticky long prose alone. | Mail stack rules unchanged; mute ok |
| PL103.2 | **Market-invalid refuse ephemeral.** When soft-refuse `marketInvalid`, ephemeral `List` (or short equivalent) instead of sticky long prose alone. | Market list validation unchanged; mute ok |
| PL103.3 | **Invalid-qty refuse ephemeral.** When soft-refuse `invalidQty`, ephemeral `Qty` (or short equivalent) instead of sticky long prose alone. | Qty validation unchanged; mute ok |

---

# Phase PL104 — Craft-gate soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL104.1 | **Unknown-recipe refuse ephemeral.** When soft-refuse `unknownRecipe`, ephemeral `Recipe` (or short equivalent) instead of sticky long prose alone. | Recipe catalog unchanged; mute ok |
| PL104.2 | **Needs-station refuse ephemeral.** When soft-refuse dynamic `needsStation(station)`, ephemeral `Station` (or short equivalent) instead of sticky long prose alone. | Station requirements unchanged; mute ok |
| PL104.3 | **Needs-xp refuse ephemeral.** When soft-refuse dynamic `needsXp(profession, need)`, ephemeral `XP` (or short equivalent) instead of sticky long prose alone. | Profession XP gates unchanged; mute ok |

---

# Phase PL105 — Decor / expand soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL105.1 | **Decor-pad-missing refuse ephemeral.** When soft-refuse `decorPadMissing`, ephemeral `Pad` (or short equivalent) instead of sticky long prose alone. | Decor pad rules unchanged; mute ok |
| PL105.2 | **Decor-starter-only refuse ephemeral.** When soft-refuse `decorStarterOnly`, ephemeral `Home` (or short equivalent) instead of sticky long prose alone. | Decor homestead gate unchanged; mute ok |
| PL105.3 | **No-expand-slots refuse ephemeral.** When soft-refuse `noExpandSlots`, ephemeral `Slots` (or short equivalent) instead of sticky long prose alone. | Expand slot caps unchanged; mute ok |

---

# Priority order for the agent

```
PL101.1 → PL101.2 → PL101.3
 → PL102.1 → PL102.2 → PL102.3
 → PL103.1 → PL103.2 → PL103.3
 → PL104.1 → PL104.2 → PL104.3
 → PL105.1 → PL105.2 → PL105.3
```

Lowest pending ID first. When this queue empties, author **Polish 22** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- 2026-08-02: Queue emptied after PL105.3 → [FullGameBuildPlan_CityLands_Polish_22.md](FullGameBuildPlan_CityLands_Polish_22.md) (PL106+).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_20.md` | PL96–PL100 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
