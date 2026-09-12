# Full Game Build Plan — CityLands Polish 41 (PL201+)

**Document Version:** 1.0.2  
**Status:** Frozen — PL202–PL205 paused for Hardening RF\* (2026-08-03)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_40.md](FullGameBuildPlan_CityLands_Polish_40.md) (PL196–PL200 **done**) · earlier PL* archives via TASKS.md  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Hardening RF\*** (this polish queue frozen)  
**Hardening:** [FullGameBuildPlan_CityLands_Hardening.md](FullGameBuildPlan_CityLands_Hardening.md)  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after workshop·expand, social closed chips, meter idle glances, deed·soft-war, and build·empty-path leftovers (PL196–PL200). Shift to **housing / yard atmosphere parity** (decor · fence · shed · lived path), **crop-ready / claim-held leftovers**, and **tool · coins idle glances** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops, **NFT never = combat power**.

**Progress (2026-08-02):** PL201.1–PL201.2 done — next PL202.1.

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

`
PL201 Housing decor / fence atmosphere leftovers
 → PL202 Homestead shed / lived-path atmosphere leftovers
 → PL203 Crop-ready / claim-held leftovers
 → PL204 Tool-durability / coins idle glances
 → PL205 Arena-board / expand-afford leftovers
`

---

# Phase PL201 — Housing decor / fence atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL201.1 | **Housing-decor soft atmosphere leftover.** Quiet warm pulsing rosewood mist over existing decor pads / placed decor while on player land (complements landmark + place flash; decor costs SoT). Prefer kinship if covered. | Decor costs SoT; mute ok — **done** |
| PL201.2 | **Homestead-fence soft atmosphere leftover.** Quiet cool pulsing boundary mist over existing fence while on player land (complements fence landmark + path cues; layouts SoT). Prefer kinship if covered. | Layouts SoT; mute ok — **done** |

---

# Phase PL202 — Homestead shed / lived-path atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL202.1 | **Homestead-shed soft atmosphere leftover.** Quiet warm pulsing barn mist over existing lived shed while yard lived at home (complements shed landmark + chimney + yard mist; layouts SoT). Prefer kinship if covered. | Layouts SoT; mute ok; empty/visit quiet |
| PL202.2 | **Lived-homestead path soft atmosphere leftover.** Quiet warm pulsing path mist over lived-yard path/cross while yard lived at home (complements path cue + yard mist; layouts SoT). Prefer kinship if covered. | Layouts SoT; mute ok; empty/visit quiet |

---

# Phase PL203 — Crop-ready / claim-held leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL203.1 | **Crop-ready soft atmosphere leftover.** Quiet warm pulsing harvest mist over ready crop plots while on player land (complements growing mist + ready pulse; growMs SoT). Prefer kinship if covered. | Grow times SoT; mute ok |
| PL203.2 | **Claim-held soft atmosphere leftover.** Quiet cool pulsing held mist over claim node while held by player guild and no open contest (complements empty landmark + contest mist + held cue; claim SoT). Prefer kinship if covered. | Claim / soft-war SoT; mute ok |

---

# Phase PL204 — Tool-durability / coins idle glances

| ID | Work | Acceptance |
| --- | --- | --- |
| PL204.1 | **Tool-durability idle soft glance leftover.** Quiet periodic TopBar tool breath while walking with healthy durability and no panel open (complements low-tool warn; low warn wins; durability SoT). Prefer kinship if covered. | Tool durability SoT; min HUD; mute ok |
| PL204.2 | **Coins idle soft glance leftover.** Quiet periodic TopBar coins breath while walking with coins on hand and no panel open (complements spend/earn cues; economy SoT unchanged). Prefer kinship if covered. | Economy SoT; min HUD; mute ok |

---

# Phase PL205 — Arena-board / expand-afford leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL205.1 | **Arena-board soft atmosphere leftover.** Quiet warm pulsing clay mist over existing arena board while on Warrior (complements board landmark + enter/leave; stub SoT; no balance invent). Prefer kinship if covered. | Warrior stub SoT; mute ok |
| PL205.2 | **Expand-afford closed glance leftover.** Quiet TopBar expand chip while next pad is affordable and Expand/build context closed (complements afford pulse + unlock cues; expand costs SoT; no always-on expand column). Prefer kinship if covered. | Expand costs SoT; min HUD; mute ok |

---

# Priority order for the agent

`
PL201.1 → PL201.2
 → PL202.1 → PL202.2
 → PL203.1 → PL203.2
 → PL204.1 → PL204.2
 → PL205.1 → PL205.2
`

Lowest pending ID first. When this queue empties, run **Gate 0 → activate Hardening RF\*** ([FullGameBuildPlan_CityLands_Hardening.md](FullGameBuildPlan_CityLands_Hardening.md)) — do **not** auto-author Polish 42 leftovers unless product explicitly prefers more atmosphere over hardening. Do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| PlayerVision_CityLands.md | Product defaults |
| FullGameBuildPlan_CityLands_Polish_40.md | PL196–PL200 (done) |
| FullGameBuildPlan_CityLands_Hardening.md | **Next after this queue** (RF* hardening/refactor) — or activate early if PL paused |
| TASKS.md | Live PL* checklist |
| AgentAutonomousLoop.md | Tick rules |
