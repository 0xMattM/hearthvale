# Full Game Build Plan — CityLands Polish 23 (PL111+)

**Document Version:** 1.0.0  
**Status:** Done — rolled to Polish 24  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_22.md](FullGameBuildPlan_CityLands_Polish_22.md) (PL106–PL110 **done**) · [FullGameBuildPlan_CityLands_Polish_21.md](FullGameBuildPlan_CityLands_Polish_21.md) (PL101–PL105 **done**) · [FullGameBuildPlan_CityLands_Polish_20.md](FullGameBuildPlan_CityLands_Polish_20.md) (PL96–PL100 **done**) · [FullGameBuildPlan_CityLands_Polish_19.md](FullGameBuildPlan_CityLands_Polish_19.md) (PL91–PL95 **done**) · [FullGameBuildPlan_CityLands_Polish_18.md](FullGameBuildPlan_CityLands_Polish_18.md) (PL86–PL90 **done**) · [FullGameBuildPlan_CityLands_Polish_17.md](FullGameBuildPlan_CityLands_Polish_17.md) (PL81–PL85 **done**) · [FullGameBuildPlan_CityLands_Polish_16.md](FullGameBuildPlan_CityLands_Polish_16.md) (PL77–PL80 **done**) · [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md) (PL73–PL76 **done**) · [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Next polish:** [FullGameBuildPlan_CityLands_Polish_24.md](FullGameBuildPlan_CityLands_Polish_24.md) (PL116+)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after inventory·build·guild·quest soft refuses (PL106–PL110). Soft-refuse ACTION_ERROR campaign is largely complete — shift to **guild social confirms**, **deed/wallet surface refuses** (settings / deed panel only), and **map / presence readability** leftovers — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL111.1–PL115.2 done. Rolled → Polish 24.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).  
- Do **not** put wallet/deed UX into core farm/craft loops (deed/wallet cues stay on settings / deed surface).

---

# Phase order

```
PL111 Guild social success leftovers
 → PL112 Deed surface refuse ephemerals
 → PL113 Wallet surface refuse ephemerals
 → PL114 Homestead / visit readability
 → PL115 Presence / travel feedback leftovers
```

---

# Phase PL111 — Guild social success leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL111.1 | **Guild-rank-change success ephemeral.** After owner successfully sets member rank (officer/member), ephemeral `Ranked` (or short equivalent) + soft guild SFX instead of silent panel-only update. | Rank enum / permissions unchanged; mute ok |
| PL111.2 | **Guild-bank deposit/withdraw already cued** — verify deposit/withdraw still flash; if a silent bank path remains, ephemeral `Stored` / `Took` aligned with PL48.2–PL48.3. | Bank slots / qty rules unchanged; mute ok; skip if already flashing |

---

# Phase PL112 — Deed surface refuse ephemerals

| ID | Work | Acceptance |
| --- | --- | --- |
| PL112.1 | **Deed-missing / not-yours refuse ephemeral.** When deed panel soft-fails `deedMissing` / `deedNotYours`, ephemeral `Gone` / `Yours` instead of sticky long prose alone. | Deed rules unchanged; settings/deed surface only; mute ok |
| PL112.2 | **Deed-mint / list-state refuse ephemeral.** When soft-fails `deedNeedMint` / `deedAlreadyListed` / `deedNotListed` / `deedAlreadyMinted`, ephemeral `Mint` / `Listed` / `Unlisted` (short family) instead of sticky prose alone. | Mint/list rules unchanged; surface only; mute ok |
| PL112.3 | **Deed-price / owned / forest refuse ephemeral.** When soft-fails `deedBadPrice` / `deedAlreadyOwned` / `deedNeedForest`, ephemeral `Price` / `Owned` / `Forest` instead of sticky prose alone. | Price bounds / forest unlock unchanged; surface only; mute ok |

---

# Phase PL113 — Wallet surface refuse ephemerals

| ID | Work | Acceptance |
| --- | --- | --- |
| PL113.1 | **Wallet-already-linked refuse ephemeral.** When settings soft-fails `walletAlreadyLinked`, ephemeral `Linked` instead of sticky long prose alone. | Wallet rules unchanged; settings only; mute ok |
| PL113.2 | **Wallet-not-linked refuse ephemeral.** When settings soft-fails `walletNotLinked`, ephemeral `Wallet` instead of sticky long prose alone. | Disconnect rules unchanged; settings only; mute ok |

---

# Phase PL114 — Homestead / visit readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL114.1 | **Empty-homestead meadow contrast.** Quiet warmer outer meadow / fence readability so empty player land reads apart from Explore cool canopy (PL36.2) without inventing stations. | Empty-land build beacon (PL3.1) unchanged; no station invent |
| PL114.2 | **Visit-home return cue clarity.** Soft world or ephemeral reinforce when leaving a visit back to own land (complements PL27.1 leave cue) so four-map / visit loop stays readable. | Visit rules unchanged; min HUD |

---

# Phase PL115 — Presence / travel feedback leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL115.1 | **City scarce-busy peer pulse.** Brief pad/halo pulse when a scarce city station becomes contended (edge into busy) — complements sticky Busy world cue (PL8.1). | Contention rules unchanged; mute ok |
| PL115.2 | **Travel-arrive destination whisper.** Ensure Arrived · map cue (PL6.2) remains one-shot and destination label matches TravelPanel free-travel names (no caravan fare invent). | Free travel unchanged; mute ok |

---

# Priority order for the agent

```
PL111.1 → PL111.2
 → PL112.1 → PL112.2 → PL112.3
 → PL113.1 → PL113.2
 → PL114.1 → PL114.2
 → PL115.1 → PL115.2
```

Lowest pending ID first. When this queue empties, author **Polish 24** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- 2026-08-02: Queue emptied after PL115.2 → **Polish 24** authored (`FullGameBuildPlan_CityLands_Polish_24.md`, PL116–PL120).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_22.md` | PL106–PL110 (done) |
| `FullGameBuildPlan_CityLands_Polish_24.md` | PL116+ (next) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
