# Full Game Build Plan — CityLands Polish 29 (PL141+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue → [FullGameBuildPlan_CityLands_Polish_30.md](FullGameBuildPlan_CityLands_Polish_30.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_28.md](FullGameBuildPlan_CityLands_Polish_28.md) (PL136–PL140 **done**) · [FullGameBuildPlan_CityLands_Polish_27.md](FullGameBuildPlan_CityLands_Polish_27.md) (PL131–PL135 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after progress unlocks · upgrade/expand pads · commerce/quest confirms · visit/chat · explore woodland landmark · guild membership open (PL136–PL140). Soft-refuse / settings / major landmark campaigns are largely complete — shift to **mines·vendor atmosphere**, **homestead ambient leftovers**, **trade·bank confirms**, **portal·map chrome**, and **claim·arena leftovers** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL141.1–PL145.2 done — queue emptied → Polish 30.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).  
- Do **not** invent caravan fares or refill single-land homestead as the default world.

---

# Phase order

```
PL141 Explore mines / vendor atmosphere
 → PL142 Homestead ambient leftovers
 → PL143 Trade / guild-bank confirms
 → PL144 Portal / map chrome leftovers
 → PL145 Claim / arena leftovers
```

---

# Phase PL141 — Explore mines / vendor atmosphere

| ID | Work | Acceptance |
| --- | --- | --- |
| PL141.1 | **Explore mines soft landmark cue.** Quiet cooler stone haze/emissive on the existing mines section floor so ore grounds read apart from woodland landmark PL140.1 + hunt warmth (complements section floors PL4.2). | Layouts / spawns unchanged; no station invent — **done** |
| PL141.2 | **Explore vendor soft landmark cue.** Quiet warm stall haze/emissive on the existing Explore vendor stall so regional trade reads at entry (complements vendor tip PL59.2 + premium glow PL116.2). | Prices / layouts unchanged; no stall invent — **done** |

---

# Phase PL142 — Homestead ambient leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL142.1 | **Homestead lived-path soft cue.** Quiet warmer emissive on the existing lived yard path/cross so lived yards read apart from empty meadow PL114.1 (complements chimney PL118.1). | Layouts / slots unchanged; mute ok — **done** |
| PL142.2 | **Crop-ready soft world leftover.** Brief quiet reinforce when a plot flips to ready (complements plot pulse PL5.1 + Ready soft; timers unchanged). | Grow timers unchanged; mute ok — **done** |

---

# Phase PL143 — Trade / guild-bank confirms

| ID | Work | Acceptance |
| --- | --- | --- |
| PL143.1 | **Trade-accept soft world reinforce.** Brief soft rim when a trade completes ok (complements Trade open PL29.1 + escrow rules; no trade column invent). | Escrow / rules unchanged; mute ok; fail silent — **done** |
| PL143.2 | **Guild-bank deposit soft confirm leftover.** Brief quiet confirm (soft ephemeral or rim) after bank deposit ok (complements deposit cue PL48.2; bank rules unchanged). | Bank caps unchanged; mute ok; fail silent — **done** |

---

# Phase PL144 — Portal / map chrome leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL144.1 | **Portal free-travel soft pulse leftover.** Quiet cooler emissive pulse on existing portals while interact-highlighted (complements Free soft PL3.2 + portal tip; fare-free unchanged). | Travel rules unchanged; mute ok — **done** |
| PL144.2 | **Travel panel open soft map accent.** Quiet open accent kinship with destination map-tints PL133.2 when Travel opens (complements Travel open PL24.3; min HUD). | Destinations / fares unchanged; mute ok — **done** |

---

# Phase PL145 — Claim / arena leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL145.1 | **Claim-node held soft cue leftover.** Quiet ownership tint on existing claim_node while held by your guild (complements claim tip + soft-war; no wars invent). | Claim rules unchanged; mute ok — **done** |
| PL145.2 | **Arena enter soft world reinforce.** Brief soft rim when arriving on Arena map (complements Arrived PL115.2 + arena tip PL41.1; stub / no balance invent). | Warrior optional; mute ok — **done** |

---

# Priority order for the agent

```
PL141.1 → PL141.2
 → PL142.1 → PL142.2
 → PL143.1 → PL143.2
 → PL144.1 → PL144.2
 → PL145.1 → PL145.2
```

Lowest pending ID first. When this queue empties, author **Polish 30** (player-visible) — do **not** resume CL fidelity recycle. — **done → Polish 30**

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_28.md` | PL136–PL140 (done) |
| `FullGameBuildPlan_CityLands_Polish_30.md` | PL146+ (live) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
