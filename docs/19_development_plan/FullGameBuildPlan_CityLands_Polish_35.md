# Full Game Build Plan — CityLands Polish 35 (PL171+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue → [FullGameBuildPlan_CityLands_Polish_36.md](FullGameBuildPlan_CityLands_Polish_36.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_34.md](FullGameBuildPlan_CityLands_Polish_34.md) (PL166–PL170 **done**) · [FullGameBuildPlan_CityLands_Polish_33.md](FullGameBuildPlan_CityLands_Polish_33.md) (PL161–PL165 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after scarce-busy·deed · wallet·portal · city dock·loom·alchemy·pen landmarks (PL166–PL170). Soft-refuse / settings / major landmark campaigns are largely complete — shift to **remaining city scarce production landmarks** (crop·tree · ore·workshop · forge·mill · kitchen) and **Explore trail·thicket landmark leftovers** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops, **NFT never = combat power**.

**Progress (2026-08-02):** PL171.1–PL175.2 done — queue emptied → Polish 36.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).  
- Do **not** invent caravan fares or refill single-land homestead as the default world.
- Do **not** invent deeper soft-war scoring or PvP wipe rules.
- Do **not** invent a new BuildingType for landmarks (use existing scarce stations / trails).

---

# Phase order

```
PL171 City crop-plot / tree-stump landmark leftovers
 → PL172 City ore-node / workshop landmark leftovers
 → PL173 City forge / mill landmark leftovers
 → PL174 City kitchen soft landmark leftover + Explore trail landmark leftover
 → PL175 Explore thicket landmark leftover + Visit land soft atmosphere leftover
```

---

# Phase PL171 — City crop-plot / tree-stump landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL171.1 | **City crop-plot soft landmark cue leftover.** Quiet warm soil haze/emissive on existing city scarce crop_plot while on City (complements crop ready pulse + Free/Busy pads; grow times unchanged). | Grow times unchanged; mute ok |
| PL171.2 | **City tree-stump soft landmark cue leftover.** Quiet cool woodland haze/emissive on existing city scarce tree_stump while on City (complements gather ready + Free/Busy pads; yields unchanged). | Yields unchanged; mute ok |

---

# Phase PL172 — City ore-node / workshop landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL172.1 | **City ore-node soft landmark cue leftover.** Quiet cool mineral haze/emissive on existing city scarce ore_node while on City (complements ore ready + Free/Busy pads; yields unchanged). | Yields unchanged; mute ok |
| PL172.2 | **City workshop soft landmark cue leftover.** Quiet warm timber haze/emissive on existing city scarce workshop while on City (complements craft working cues + Free/Busy pads; recipes unchanged). | Recipes unchanged; mute ok |

---

# Phase PL173 — City forge / mill landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL173.1 | **City forge soft landmark cue leftover.** Quiet warm ember haze/emissive on existing city scarce forge while on City (complements craft working cues + Free/Busy pads; recipes unchanged). | Recipes unchanged; mute ok |
| PL173.2 | **City mill soft landmark cue leftover.** Quiet cool grain haze/emissive on existing city scarce mill while on City (complements craft working cues + Free/Busy pads; recipes unchanged). | Recipes unchanged; mute ok |

---

# Phase PL174 — City kitchen / Explore trail landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL174.1 | **City kitchen soft landmark cue leftover.** Quiet warm hearth haze/emissive on existing city scarce kitchen while on City (complements craft working cues + Free/Busy pads; recipes unchanged). | Recipes unchanged; mute ok |
| PL174.2 | **Explore trail soft landmark cue leftover.** Quiet warm trail haze/emissive on existing Explore game_trail while on Explore (complements hunt tip + ready cues; hunt rates unchanged). | Hunt rates unchanged; mute ok |

---

# Phase PL175 — Explore thicket / Visit land atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL175.1 | **Explore thicket soft landmark cue leftover.** Quiet cool thicket haze/emissive on existing Explore edge_thicket while on Explore (complements hunt tip + ready cues; hunt rates unchanged). | Hunt rates unchanged; mute ok |
| PL175.2 | **Visit land soft atmosphere leftover.** Quiet cool visit mist tint/haze while visiting another player's land (complements visit tip + leave cue; visit rules unchanged). | Visit rules unchanged; mute ok |

---

# Priority order for the agent

```
PL171.1 → PL171.2
 → PL172.1 → PL172.2
 → PL173.1 → PL173.2
 → PL174.1 → PL174.2
 → PL175.1 → PL175.2
```

Lowest pending ID first. When this queue empties, author **Polish 36** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- **2026-08-02:** Queue emptied after PL175.2 → live plan [FullGameBuildPlan_CityLands_Polish_36.md](FullGameBuildPlan_CityLands_Polish_36.md) (PL176–PL180).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_34.md` | PL166–PL170 (done) |
| `FullGameBuildPlan_CityLands_Polish_36.md` | PL176+ (live) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
