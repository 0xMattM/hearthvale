# Full Game Build Plan — CityLands Polish 7 (PL33+)

**Document Version:** 1.0.0  
**Status:** Done — PL33–PL37 complete; live queue → [FullGameBuildPlan_CityLands_Polish_8.md](FullGameBuildPlan_CityLands_Polish_8.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_6.md](FullGameBuildPlan_CityLands_Polish_6.md) (PL28–PL32 **done**) · [FullGameBuildPlan_CityLands_Polish_5.md](FullGameBuildPlan_CityLands_Polish_5.md) (PL23–PL27 **done**) · [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22 **done**) · [FullGameBuildPlan_CityLands_Polish_3.md](FullGameBuildPlan_CityLands_Polish_3.md) (PL12–PL17 **done**) · [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after commerce afford rows (PL32). Focus on remaining sticky → ephemeral confirms (tool break, hunt, deed/wallet), leftover panel-open accents, production afford clarity (craft/build), and quiet map/portal readability — still min HUD, four free maps, no economy invent, blockchain stays invisible in core loops.

**Progress (2026-08-02):** PL33.1–PL37.2 **done**. Rollover → Polish 8.

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
PL33 Sticky leftovers → ephemeral
 → PL34 Remaining panel open accents
 → PL35 Production afford clarity
 → PL36 Map atmosphere / readability
 → PL37 Portal / presence polish
```

---

# Phase PL33 — Sticky leftovers → ephemeral

| ID | Work | Acceptance |
| --- | --- | --- |
| PL33.1 | **Tool broke brief cue.** Ephemeral TopBar (and optional soft SFX) when equipped tool breaks from use — replace sticky “Craft or equip another” prose. | Durability rules unchanged; mute ok |
| PL33.2 | **Hunt encounter brief cues.** Ephemeral win/lose TopBar lines after Explore hunt resolve (replace long sticky encounter prose). | Loot / energy drain rules unchanged; mute ok |
| PL33.3 | **Deed / wallet surface brief cues.** Ephemeral cues for deed claim/mint/list/unlist and wallet link/disconnect (settings/deed surface only). | No combat power; core loops stay wallet-free |

---

# Phase PL34 — Remaining panel open accents

| ID | Work | Acceptance |
| --- | --- | --- |
| PL34.1 | **Mail panel open accent.** Brief border/header tint when Mail opens (L). | Same panel; escrow unchanged |
| PL34.2 | **Decor panel open accent.** Brief accent when Housing decor panel opens. | Coin costs unchanged |
| PL34.3 | **Notice panel open accent.** Brief accent when Notice board panel opens from walk-up. | Same tips; unread accent (PL17.1) still works |

---

# Phase PL35 — Production afford clarity

| ID | Work | Acceptance |
| --- | --- | --- |
| PL35.1 | **Craft recipe afford row tint.** Quiet row/input tint when a craft recipe is fully affordable vs short mats/energy (panel open). | Recipes/costs unchanged; no HUD column |
| PL35.2 | **Build place afford clarity.** Soft short-funds/mats hint on Build place rows when station place is not affordable. | Place costs unchanged; land unlimited unchanged |

---

# Phase PL36 — Map atmosphere / readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL36.1 | **City civic soft atmosphere.** Quiet ground/path tint so civic blocks read apart from scarce shared yard (complements PL1.1 pads). | Scarce stations unchanged; no station invent |
| PL36.2 | **Explore wilds soft atmosphere.** Slightly cooler/sparser ground or haze so Explore reads apart from homestead Land beyond BGM (PL7.2). | Section floors (PL4.*) stay distinct; no spawn invent |

---

# Phase PL37 — Portal / presence polish

| ID | Work | Acceptance |
| --- | --- | --- |
| PL37.1 | **Portal world label destination.** Soft world Html names fare-free destination (or circuit role) on portal mesh — complements PL5.1 prompt + PL14.2 tint. | Fare-free; no caravan timers |
| PL37.2 | **Mute toggle brief confirm.** Ephemeral TopBar `Muted` / `Unmuted` when settings mute flips (audio respects mute immediately). | No always-on audio column |

---

# Priority order for the agent

```
PL33.1 → PL33.2 → PL33.3 → PL34.1 → PL34.2 → PL34.3
 → PL35.1 → PL35.2 → PL36.1 → PL36.2 → PL37.1 → PL37.2
```

Lowest pending ID first. When this queue empties, author **Polish 8** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_8.md` | **Live** polish plan (PL38+) |
| `FullGameBuildPlan_CityLands_Polish_6.md` | PL28–PL32 (done) |
| `FullGameBuildPlan_CityLands_Polish_5.md` | PL23–PL27 (done) |
| `FullGameBuildPlan_CityLands_Polish_4.md` | PL18–PL22 (done) |
| `FullGameBuildPlan_CityLands_Polish_3.md` | PL12–PL17 (done) |
| `FullGameBuildPlan_CityLands_Polish_2.md` | PL7–PL11 (done) |
| `FullGameBuildPlan_CityLands_Polish.md` | PL1–PL6 (done) |
| `AgentAutonomousLoop.md` | Loop process |
| `TASKS.md` | Live checklist |
