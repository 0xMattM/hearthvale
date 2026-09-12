# Full Game Build Plan — CityLands Polish 32 (PL156+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue → [FullGameBuildPlan_CityLands_Polish_33.md](FullGameBuildPlan_CityLands_Polish_33.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_31.md](FullGameBuildPlan_CityLands_Polish_31.md) (PL151–PL155 **done**) · [FullGameBuildPlan_CityLands_Polish_30.md](FullGameBuildPlan_CityLands_Polish_30.md) (PL146–PL150 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after city vendor·harvest · equip·mail · notice·unequip · arena board·market buy (PL151–PL155). Soft-refuse / settings / major landmark campaigns are largely complete — shift to **vendor sell / market cancel confirms**, **trade·mail cancel confirms**, **guild create·leave confirms**, **hunt win / craft leftovers**, and **empty-land build-board / day-phase leftovers** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL156.1–PL160.2 done — queue emptied → Polish 33.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

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
PL156 Vendor sell / market cancel
 → PL157 Trade cancel / mail cancel
 → PL158 Guild create / leave confirms
 → PL159 Hunt win / craft leftovers
 → PL160 Empty-land build board / day-phase leftovers
```

---

# Phase PL156 — Vendor sell / market cancel

| ID | Work | Acceptance |
| --- | --- | --- |
| PL156.1 | **Vendor-sell soft world reinforce leftover.** Brief soft rim after vendor sell ok (complements Sold PL43.2 + coins-gain rim PL126.2; prices unchanged). | Prices unchanged; mute ok; fail silent — **done** |
| PL156.2 | **Market-cancel soft world reinforce.** Brief soft rim after market cancel ok (complements Cancelled listing cue + list rim PL138.1; escrow / fees unchanged). | Escrow unchanged; mute ok; fail silent — **done** |

---

# Phase PL157 — Trade cancel / mail cancel

| ID | Work | Acceptance |
| --- | --- | --- |
| PL157.1 | **Trade-cancel soft world reinforce.** Brief soft rim after trade cancel ok (complements Cancelled PL18 path + accept rim PL143.1; escrow unchanged). | Escrow unchanged; mute ok; fail silent — **done** |
| PL157.2 | **Mail-cancel soft world reinforce.** Brief soft rim after mail cancel ok (complements Parcel cancelled + send/claim rims PL149.1 / PL152.2; escrow unchanged). | Escrow unchanged; mute ok; fail silent — **done** |

---

# Phase PL158 — Guild create / leave confirms

| ID | Work | Acceptance |
| --- | --- | --- |
| PL158.1 | **Guild-create soft world reinforce.** Brief soft rim after guild create ok (complements Created PL50.1 + membership open PL140.2; ranks unchanged). | Guild rules unchanged; mute ok; fail silent — **done** |
| PL158.2 | **Guild-leave soft world reinforce.** Brief soft rim after guild leave ok (complements Left + membership open PL140.2; ranks unchanged). | Guild rules unchanged; mute ok; fail silent — **done** |

---

# Phase PL159 — Hunt win / craft leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL159.1 | **Hunt-win soft world reinforce leftover.** Brief soft rim after hunt win ok (complements Won · foe ephemeral + trail ready cues; rates / XP unchanged). | Hunt rules unchanged; mute ok; fail silent — **done** |
| PL159.2 | **Craft-complete soft world reinforce leftover.** Brief soft rim after craft ok (complements craft olive pad PL131.1 + inventory pickup PL128.2; recipes unchanged). | Recipes unchanged; mute ok; fail silent — **done** |

---

# Phase PL160 — Empty-land build board / day-phase leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL160.1 | **Empty-land build-board soft landmark cue leftover.** Quiet warm timber haze/emissive on existing build_board while empty-land beacon shows (complements beacon PL3.1 + tip PL52.1; layouts / slots unchanged). | Layouts unchanged; mute ok — **done** |
| PL160.2 | **Day-phase soft world reinforce leftover.** Brief soft rim when day phase flips (complements TopBar day phase PL2.2 + city day-phase atmosphere PL57; clocks unchanged). | Clocks unchanged; mute ok — **done** |

---

# Priority order for the agent

```
PL156.1 → PL156.2
 → PL157.1 → PL157.2
 → PL158.1 → PL158.2
 → PL159.1 → PL159.2
 → PL160.1 → PL160.2
```

Lowest pending ID first. When this queue empties, author **Polish 33** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_31.md` | PL151–PL155 (done) |
| `FullGameBuildPlan_CityLands_Polish_33.md` | Live sequel (PL161+) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
