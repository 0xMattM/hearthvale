# Full Game Build Plan — CityLands Polish 37 (PL181+)

**Document Version:** 1.0.0  
**Status:** Done — PL181–PL185 complete; live queue → [FullGameBuildPlan_CityLands_Polish_38.md](FullGameBuildPlan_CityLands_Polish_38.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_36.md](FullGameBuildPlan_CityLands_Polish_36.md) (PL176–PL180 **done**) · [FullGameBuildPlan_CityLands_Polish_35.md](FullGameBuildPlan_CityLands_Polish_35.md) (PL171–PL175 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after housing·fence landmarks, map atmospheres, and thin action-rim leftovers (PL176–PL180). Station landmarks and one-shot world rims are largely complete — shift to **lived-home atmosphere parity**, **city plaza/civic atmosphere leftovers**, **claim/soft-war glanceables**, and **visit-arrive / peer social rim leftovers** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops, **NFT never = combat power**.

**Progress (2026-08-02):** PL185.1–PL185.2 done — queue emptied → Polish 38.

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
PL181 Lived homestead atmosphere / shed landmark leftovers
 → PL182 City plaza / civic atmosphere leftovers
 → PL183 Claim-node / soft-war atmosphere leftovers
 → PL184 Visit-arrive / nearby-peer rim leftovers
 → PL185 City service-lane / map-chip glance leftovers
```

---

# Phase PL181 — Lived homestead atmosphere / shed landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL181.1 | **Lived homestead soft atmosphere leftover.** Quiet warm hearth mist tint/haze on existing lived home plot while yard is lived at home (complements chimney + lived path + empty/visit mist leftovers; layouts unchanged). | Layouts unchanged; mute ok; visit/empty quiet |
| PL181.2 | **Homestead shed soft landmark leftover.** Quiet warm shed footing/haze/emissive on existing homestead shed while lived at home (complements chimney + yard mist; no station invent). | Layouts unchanged; mute ok; empty quiet |

---

# Phase PL182 — City plaza / civic atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL182.1 | **City plaza soft atmosphere leftover.** Quiet cool pulsing plaza mist tint/haze over existing city plaza floor while on City (complements fountain landmark + scarce-yard mist; layouts unchanged). | Layouts unchanged; mute ok |
| PL182.2 | **City civic-pad soft landmark leftover.** Quiet cool civic haze/emissive on existing city civic/service pads while on City (complements plaza mist + deed desk; layouts unchanged). | Layouts unchanged; mute ok |

---

# Phase PL183 — Claim-node / soft-war atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL183.1 | **Claim-node soft landmark leftover.** Quiet grove haze/emissive on existing claim_node while present (complements held/contest cues + first tip; claim rules unchanged). | Claim rules unchanged; mute ok |
| PL183.2 | **Soft-war contest soft atmosphere leftover.** Quiet ember mist tint/haze while a soft-war contest is open (complements contest pulse + deliver rim; scoring unchanged). | Scoring / window unchanged; mute ok |

---

# Phase PL184 — Visit-arrive / nearby-peer rim leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL184.1 | **Visit-arrive soft world reinforce leftover.** Brief soft rim after visit arrive ok (complements Visiting · ephemeral + host nameplate; visit rules unchanged). Prefer kinship if an arrive rim already exists — do not stack a second identical rim. | Visit rules unchanged; mute ok; fail silent |
| PL184.2 | **Nearby-peer soft world reinforce leftover.** Brief soft rim when a peer first enters interact range (complements nearby peer ping + silhouette; presence rules unchanged). Prefer kinship if covered — do not stack a second identical rim. | Presence rules unchanged; mute ok |

---

# Phase PL185 — City service-lane / map-chip glance leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL185.1 | **City tutor-lane soft atmosphere leftover.** Quiet cool pulsing mist tint/haze over existing tutor lane while on City (complements lane landmark strip + plaza mist; claim rules unchanged). | Claim rules unchanged; mute ok |
| PL185.2 | **Map-chip idle soft glance leftover.** Quiet periodic TopBar map-chip breath while walking with no panel open (complements arrive pulse + travel open accent; destinations / fares unchanged; min HUD). | Fares free; min HUD; mute ok |

---

# Priority order for the agent

```
PL181.1 → PL181.2
 → PL182.1 → PL182.2
 → PL183.1 → PL183.2
 → PL184.1 → PL184.2
 → PL185.1 → PL185.2
```

Lowest pending ID first. When this queue empties, author **Polish 38** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- **2026-08-02:** Queue emptied after PL185.2 → live plan [FullGameBuildPlan_CityLands_Polish_38.md](FullGameBuildPlan_CityLands_Polish_38.md) (PL186–PL190). PL185.1 tutor-lane mist + PL185.2 map-chip idle breath shipped same tick.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_36.md` | PL176–PL180 (done) |
| `FullGameBuildPlan_CityLands_Polish_38.md` | PL186+ (live) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
