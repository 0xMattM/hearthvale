# Full Game Build Plan — CityLands Polish 33 (PL161+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue → [FullGameBuildPlan_CityLands_Polish_34.md](FullGameBuildPlan_CityLands_Polish_34.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_32.md](FullGameBuildPlan_CityLands_Polish_32.md) (PL156–PL160 **done**) · [FullGameBuildPlan_CityLands_Polish_31.md](FullGameBuildPlan_CityLands_Polish_31.md) (PL151–PL155 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after vendor·market cancel · trade·mail cancel · guild create·leave · hunt·craft · empty-build·day-phase (PL156–PL160). Soft-refuse / settings / major landmark campaigns are largely complete — shift to **gather / fish success rim leftovers**, **station-upgrade / expand-field rim leftovers**, **expand-pad / claim-empty landmark leftovers**, and **travel-arrive / day-night-enable rim leftovers** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL161.1–PL165.2 done — queue emptied → Polish 34.

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
PL161 Gather / fish success rim leftovers
 → PL162 Station upgrade / expand-field rim leftovers
 → PL163 Expand-pad / claim-empty landmark leftovers
 → PL164 Travel arrive / day-night-enable rim leftovers
 → PL165 Deed desk / scarce Free settle leftovers
```

---

# Phase PL161 — Gather / fish success rim leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL161.1 | **Gather-success soft world reinforce leftover.** Brief soft rim after gather ok (complements Chopped/Mined/Collected PL43.1 + mint pad PL131.2; yields / cooldowns unchanged). | Yields unchanged; mute ok; fail silent |
| PL161.2 | **Fish-catch soft world reinforce leftover.** Brief soft rim after fish catch ok (complements Caught + cool splash PL132.1 + ready shimmer PL118.2; catch rates unchanged). | Catch rates unchanged; mute ok; fail silent |

---

# Phase PL162 — Station upgrade / expand-field rim leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL162.1 | **Station-upgrade soft world reinforce leftover.** Brief soft rim after station upgrade ok (complements Upgraded PL48.1 + copper pad PL137.1; costs / tiers unchanged). | Costs unchanged; mute ok; fail silent |
| PL162.2 | **Expand-field soft world reinforce leftover.** Brief soft rim after expand ok (complements Expanded PL20.3 + field-gold pad PL137.2; costs / slots unchanged). | Costs / slots unchanged; mute ok; fail silent |

---

# Phase PL163 — Expand-pad / claim-empty landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL163.1 | **Expand-pad soft landmark cue leftover.** Quiet warm field-gold haze/emissive on existing expand_pad while visible on homestead (complements short-afford pulse PL123.1 + tip; layouts / costs unchanged). | Layouts / costs unchanged; mute ok |
| PL163.2 | **Claim-empty soft landmark cue leftover.** Quiet cool grove mist haze/emissive on existing claim_node while unheld / no contest (complements tip PL80.1 + held/contest cues; claim / war rules unchanged). | Claim rules unchanged; mute ok |

---

# Phase PL164 — Travel arrive / day-night-enable rim leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL164.1 | **Travel-arrive soft world reinforce leftover.** Brief soft rim after map travel Arrived (complements Arrived dest ephemeral + Free portal pulse; fares stay free). | Fares free; mute ok |
| PL164.2 | **Day-night-enable soft world reinforce leftover.** Brief soft rim when day/night cycle is enabled from settings (complements soft confirm PL130.1 + phase rim PL160.2; clocks unchanged). | Clocks unchanged; mute ok |

---

# Phase PL165 — Deed desk / scarce Free settle leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL165.1 | **Deed-desk soft landmark cue leftover.** Quiet cool system slate haze/emissive on existing deed desk while on City (complements open accent PL55.2 + tip; wallet path unchanged; no combat power). | Wallet path unchanged; mute ok |
| PL165.2 | **Scarce-Free-settle soft world reinforce leftover.** Brief soft rim when city scarce station settles busy→Free (complements Free settle flash PL119.1 + sticky Free/Busy; contention unchanged). | Contention unchanged; mute ok |

---

# Priority order for the agent

```
PL161.1 → PL161.2
 → PL162.1 → PL162.2
 → PL163.1 → PL163.2
 → PL164.1 → PL164.2
 → PL165.1 → PL165.2
```

Lowest pending ID first. When this queue empties, author **Polish 34** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_32.md` | PL156–PL160 (done) |
| `FullGameBuildPlan_CityLands_Polish_34.md` | **Live** sequel (PL166+) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
