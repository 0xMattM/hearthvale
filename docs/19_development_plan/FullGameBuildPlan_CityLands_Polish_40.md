# Full Game Build Plan — CityLands Polish 40 (PL196+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue [FullGameBuildPlan_CityLands_Polish_41.md](FullGameBuildPlan_CityLands_Polish_41.md) (PL201+)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_39.md](FullGameBuildPlan_CityLands_Polish_39.md) (PL191–PL195 **done**) · earlier PL* archives via TASKS.md  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after land-station / craft atmospheres and trade·achievements closed chips (PL191–PL195). Shift to **remaining station atmosphere parity** (workshop · expand pad), **social/civic closed glances** (chat · notice), **HUD meter idle glances** (health · inventory pickup), and **hub leftovers** (deed desk · soft-war deliver) — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops, **NFT never = combat power**.

**Progress (2026-08-02):** PL196.1–PL200.2 **done** — rollover → Polish 41.

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
PL196 Workshop / expand-pad atmosphere leftovers
 → PL197 Chat / notice closed glances
 → PL198 Health-meter / inventory-pickup idle glances
 → PL199 Deed-desk / soft-war-deliver leftovers
 → PL200 Build-board / empty-homestead path leftovers
`

---

# Phase PL196 — Workshop / expand-pad atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL196.1 | **Workshop soft atmosphere leftover.** Quiet warm pulsing timber mist over existing workshop while on player land or City scarce (complements City landmark + craft cues; recipes SoT). Prefer kinship if City landmark already covers City-only mist. | Recipes SoT; mute ok |
| PL196.2 | **Expand-pad soft atmosphere leftover.** Quiet cool pulsing footing mist over existing expand pads while on player land (complements expand flash + unlock cues; expand costs SoT). Prefer kinship if covered. | Expand costs SoT; mute ok |

---

# Phase PL197 — Chat / notice closed glances

| ID | Work | Acceptance |
| --- | --- | --- |
| PL197.1 | **Chat-pending closed glance leftover.** Quiet TopBar chat chip while unread chat/guild lines arrived and Chat panel closed (complements receive ping; no always-on chat column). Prefer kinship if covered. | Chat rules SoT; min HUD; mute ok |
| PL197.2 | **Notice-unread closed glance leftover.** Quiet TopBar notice chip while unread notice tips pending and Notice panel closed (complements unread flicker + open accent; no always-on notice column). Prefer kinship if covered. | Tip ids SoT; min HUD; mute ok |

---

# Phase PL198 — Health-meter / inventory-pickup idle glances

| ID | Work | Acceptance |
| --- | --- | --- |
| PL198.1 | **Health-meter idle soft glance leftover.** Quiet periodic TopBar HP breath while walking healthy with no panel open (complements low-health warn; low warn wins; regen SoT). Prefer kinship if covered. | Health rules SoT; min HUD; mute ok |
| PL198.2 | **Inventory-pickup idle soft glance leftover.** Quiet periodic bag-slot / inventory chrome breath after recent pickup while Inventory closed (complements slot flash; no always-on inventory column). Prefer kinship if covered. | Inventory rules SoT; min HUD; mute ok |

---

# Phase PL199 — Deed-desk / soft-war-deliver leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL199.1 | **Deed-desk soft atmosphere leftover.** Quiet cool pulsing civic mist over existing deed desk while on City (complements desk landmark + mint/link rims; stub path SoT; no NFT combat). Prefer kinship if covered. | Stub / wallet-free core; mute ok |
| PL199.2 | **Soft-war deliver soft glance leftover.** Quiet TopBar or claim-node glance while deliver is ready during an open soft-war contest and claim panel closed (complements contest atmosphere + deliver rim; scoring SoT). Prefer kinship if covered. | Soft-war scoring SoT; min HUD; mute ok |

---

# Phase PL200 — Build-board / empty-homestead path leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL200.1 | **Build-board soft atmosphere leftover.** Quiet warm pulsing timber mist over existing build board while yard can place (complements beacon + place flash; build costs SoT). Prefer kinship if covered. | Build costs SoT; mute ok — **done** |
| PL200.2 | **Empty-homestead path soft atmosphere leftover.** Quiet cool pulsing path mist over empty-yard lived-path cue while yard empty (complements meadow landmark + empty path cue; layouts SoT). Prefer kinship if covered. | Layouts SoT; mute ok — **done** |

---

# Priority order for the agent

`
PL196.1 → PL196.2
 → PL197.1 → PL197.2
 → PL198.1 → PL198.2
 → PL199.1 → PL199.2
 → PL200.1 → PL200.2
`

Lowest pending ID first. When this queue empties, author **Polish 41** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| PlayerVision_CityLands.md | Product defaults |
| FullGameBuildPlan_CityLands_Polish_39.md | PL191–PL195 (done) |
| FullGameBuildPlan_CityLands_Polish_41.md | PL201+ (live after rollover) |
| TASKS.md | Live PL* checklist |
| AgentAutonomousLoop.md | Tick rules |
