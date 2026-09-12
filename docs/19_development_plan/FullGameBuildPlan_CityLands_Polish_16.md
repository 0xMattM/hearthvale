# Full Game Build Plan — CityLands Polish 16 (PL77+)

**Document Version:** 1.0.0  
**Status:** Done — PL77–PL80 complete; live queue → [FullGameBuildPlan_CityLands_Polish_17.md](FullGameBuildPlan_CityLands_Polish_17.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_15.md](FullGameBuildPlan_CityLands_Polish_15.md) (PL73–PL76 **done**) · [FullGameBuildPlan_CityLands_Polish_14.md](FullGameBuildPlan_CityLands_Polish_14.md) (PL68–PL72 **done**) · [FullGameBuildPlan_CityLands_Polish_13.md](FullGameBuildPlan_CityLands_Polish_13.md) (PL63–PL67 **done**) · [FullGameBuildPlan_CityLands_Polish_12.md](FullGameBuildPlan_CityLands_Polish_12.md) (PL58–PL62 **done**) · [FullGameBuildPlan_CityLands_Polish_11.md](FullGameBuildPlan_CityLands_Polish_11.md) (PL53–PL57 **done**) · [FullGameBuildPlan_CityLands_Polish_10.md](FullGameBuildPlan_CityLands_Polish_10.md) (PL48–PL52 **done**) · [FullGameBuildPlan_CityLands_Polish_9.md](FullGameBuildPlan_CityLands_Polish_9.md) (PL43–PL47 **done**) · [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md) (PL38–PL42 **done**) · [FullGameBuildPlan_CityLands_Polish_7.md](FullGameBuildPlan_CityLands_Polish_7.md) (PL33–PL37 **done**) · [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after decor tip+refuse + quest/tutor readability (PL75–PL76). Focus on remaining process-station onboarding (loom / alchemy), quest claim soft refuses, vendor soft refuses, and claim-node / guild-claim feedback — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL77–PL80 **done**. Rollover → Polish 17.

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
PL77 Loom / alchemy onboarding tips
 → PL78 Quest claim soft refuses
 → PL79 Vendor soft refuses
 → PL80 Claim node / guild-claim feedback
```

---

# Phase PL77 — Loom / alchemy onboarding tips

| ID | Work | Acceptance |
| --- | --- | --- |
| PL77.1 | **First loom walk-up tip once.** One-shot ephemeral / soft tip on first loom proximity. | Craft recipes unchanged; min HUD |
| PL77.2 | **First alchemy-bench walk-up tip once.** One-shot ephemeral / soft tip on first alchemy bench proximity. | Craft recipes unchanged; min HUD |

---

# Phase PL78 — Quest claim soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL78.1 | **Quest-locked refuse ephemeral.** When soft-refuse `questLocked`, ephemeral `Locked` (or short equivalent) instead of sticky long prose alone. | Quest / XP rules unchanged; mute ok |
| PL78.2 | **Quest-already-claimed refuse ephemeral.** When soft-refuse `questAlreadyClaimed`, ephemeral `Claimed` (or short equivalent) instead of sticky long prose alone. | Quest / XP rules unchanged; mute ok |

---

# Phase PL79 — Vendor soft refuses

| ID | Work | Acceptance |
| --- | --- | --- |
| PL79.1 | **Vendor-won't-buy refuse ephemeral.** When soft-refuse `vendorWontBuy`, ephemeral `Unwanted` (or short equivalent) instead of sticky long prose alone. | Vendor prices unchanged; mute ok |
| PL79.2 | **Vendor-won't-sell refuse ephemeral.** When soft-refuse `vendorWontSell`, ephemeral `Stock` (or short equivalent) instead of sticky long prose alone. | Vendor prices unchanged; mute ok |

---

# Phase PL80 — Claim node / guild-claim feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL80.1 | **First claim-node walk-up tip once.** One-shot ephemeral / soft tip on first claim beacon proximity. | Claim / war rules unchanged; min HUD |
| PL80.2 | **Claim-need-guild refuse ephemeral.** When soft-refuse `claimNeedGuild`, ephemeral `Guild` (or short equivalent) instead of sticky long prose alone. | Claim rules unchanged; mute ok |

---

# Priority order for the agent

```
PL77.1 → PL77.2
 → PL78.1 → PL78.2
 → PL79.1 → PL79.2
 → PL80.1 → PL80.2
```

Lowest pending ID first. When this queue empties, author **Polish 17** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_15.md` | PL73–PL76 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live PL\* checklist |
| `FutureIdeasBacklog.md` | Ideas outside polish |
