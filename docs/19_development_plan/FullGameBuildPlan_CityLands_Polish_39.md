# Full Game Build Plan — CityLands Polish 39 (PL191+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue [FullGameBuildPlan_CityLands_Polish_40.md](FullGameBuildPlan_CityLands_Polish_40.md) (PL196+)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_38.md](FullGameBuildPlan_CityLands_Polish_38.md) (PL186–PL190 **done**) · [FullGameBuildPlan_CityLands_Polish_37.md](FullGameBuildPlan_CityLands_Polish_37.md) (PL181–PL185 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after portal/commerce atmospheres, interact·energy idle glances, quest·guild closed chips, and crop·dock soil/water mist (PL186–PL190). Shift to **land-station atmosphere parity** (pen · stump · ore · mill), **craft-station atmosphere leftovers** (forge · kitchen · loom · alchemy), and **remaining closed-panel glances** (trade · achievements) — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops, **NFT never = combat power**.

**Progress (2026-08-02):** PL191.1–PL195.2 **done** — rollover → Polish 40.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs. Prefer kinship when an older PL* already covers the acceptance (do not stack identical rims).

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
PL191 Animal-pen / tree-stump atmosphere leftovers
 → PL192 Ore-node / mill atmosphere leftovers
 → PL193 Forge / kitchen atmosphere leftovers
 → PL194 Loom / alchemy atmosphere leftovers
 → PL195 Trade-pending / achievements closed glances
```

---

# Phase PL191 — Animal-pen / tree-stump atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL191.1 | **Animal-pen soft atmosphere leftover.** Quiet warm pulsing pen mist over existing animal pen while on player land (complements ready/care cues; feed / clean / cooldown SoT). Prefer kinship if covered. | Care / cooldown SoT; mute ok — **done** |
| PL191.2 | **Tree-stump soft atmosphere leftover.** Quiet cool pulsing wood mist over existing tree stump while on player land (complements ready / depleted cues; chop cooldown SoT). Prefer kinship if covered. | Chop / cooldown SoT; mute ok — **done** |

---

# Phase PL192 — Ore-node / mill atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL192.1 | **Ore-node soft atmosphere leftover.** Quiet cool pulsing ore mist over existing ore node while on player land (complements ready / depleted cues; mine cooldown SoT). Prefer kinship if covered. | Mine / cooldown SoT; mute ok — **done** |
| PL192.2 | **Mill soft atmosphere leftover.** Quiet warm pulsing grain mist over existing mill while on player land or City scarce (complements Free/Busy + craft cues; recipes SoT). Prefer kinship if covered. | Recipes SoT; mute ok — **done** (player-land leftover; City kinship = cool landmark alone, no stack) |

---

# Phase PL193 — Forge / kitchen atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL193.1 | **Forge soft atmosphere leftover.** Quiet warm pulsing forge mist over existing forge while on player land or City scarce (complements Free/Busy + craft cues; recipes SoT). Prefer kinship if covered. | Recipes SoT; mute ok — **done** (player-land leftover; City kinship = warm landmark alone, no stack) |
| PL193.2 | **Kitchen soft atmosphere leftover.** Quiet warm pulsing hearth mist over existing kitchen while on player land or City scarce (complements Free/Busy + craft cues; recipes SoT). Prefer kinship if covered. | Recipes SoT; mute ok — **done** (player-land leftover; City kinship = warm landmark alone, no stack) |

---

# Phase PL194 — Loom / alchemy atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL194.1 | **Loom soft atmosphere leftover.** Quiet warm pulsing thread mist over existing loom while on player land or City scarce (complements City landmark + craft cues; recipes SoT). Prefer kinship if City landmark already covers City-only mist. | Recipes SoT; mute ok — **done** (player-land leftover; City kinship = warm thread landmark alone, no stack) |
| PL194.2 | **Alchemy-bench soft atmosphere leftover.** Quiet cool pulsing tonic mist over existing alchemy bench while on player land or City scarce (complements City landmark + craft cues; recipes SoT). Prefer kinship if covered. | Recipes SoT; mute ok — **done** (player-land leftover; City kinship = cool tonic landmark alone, no stack) |

---

# Phase PL195 — Trade-pending / achievements closed glances

| ID | Work | Acceptance |
| --- | --- | --- |
| PL195.1 | **Trade-pending closed glance leftover.** Quiet TopBar trade chip while an unanswered trade invite/offer is pending and Trade panel closed (complements receive cue + accept rim; no always-on trade column). Prefer kinship if covered. | Trade / escrow SoT; min HUD; mute ok — **done** |
| PL195.2 | **Achievements-pending closed glance leftover.** Quiet TopBar achievements chip while an unclaimed/new unlock is pending and Achievements panel closed (complements unlock rim + open accent; no always-on achievements column). Prefer kinship if covered. | Unlock rules SoT; min HUD; mute ok — **done** |

---

# Priority order for the agent

```
PL191.1 → PL191.2
 → PL192.1 → PL192.2
 → PL193.1 → PL193.2
 → PL194.1 → PL194.2
 → PL195.1 → PL195.2
```

Lowest pending ID first. **Queue emptied 2026-08-02** → live plan [FullGameBuildPlan_CityLands_Polish_40.md](FullGameBuildPlan_CityLands_Polish_40.md).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_38.md` | PL186–PL190 (done) |
| `TASKS.md` | Live PL* checklist |
| `AgentAutonomousLoop.md` | Tick rules |
