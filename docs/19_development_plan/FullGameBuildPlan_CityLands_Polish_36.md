# Full Game Build Plan — CityLands Polish 36 (PL176+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue → [FullGameBuildPlan_CityLands_Polish_37.md](FullGameBuildPlan_CityLands_Polish_37.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_35.md](FullGameBuildPlan_CityLands_Polish_35.md) (PL171–PL175 **done**) · [FullGameBuildPlan_CityLands_Polish_34.md](FullGameBuildPlan_CityLands_Polish_34.md) (PL166–PL170 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after city scarce production landmarks + Explore trail·thicket + visit mist leftover (PL171–PL175). Soft-refuse / settings / major station-landmark campaigns are largely complete — shift to **homestead housing·fence landmarks**, **map-level atmosphere leftovers** (Warrior · City scarce yard · Explore canopy), and **thin action rim leftovers** (hunt lose · soft-refuse busy · mute · visit leave) — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops, **NFT never = combat power**.

**Progress (2026-08-02):** PL176.1–PL180.2 done — queue emptied → Polish 37.

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
PL176 Housing decor / homestead fence landmark leftovers
 → PL177 Warrior / City scarce-yard atmosphere leftovers
 → PL178 Explore canopy / empty meadow landmark leftovers
 → PL179 Hunt-lose / soft-refuse busy rim leftovers
 → PL180 Mute / visit-leave rim leftovers
```

---

# Phase PL176 — Housing decor / homestead fence landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL176.1 | **Housing decor soft landmark cue leftover.** Quiet warm decor haze/emissive on existing housing decor_pad / placed decor while on player land (complements decor tip + place rim; costs / slots unchanged). | Decor costs unchanged; mute ok |
| PL176.2 | **Homestead fence soft landmark cue leftover.** Quiet cool fence-post haze/emissive on existing homestead fence while on player land (complements yard atmosphere + path cues; layouts unchanged). | Layouts unchanged; mute ok |

---

# Phase PL177 — Warrior / City scarce-yard atmosphere leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL177.1 | **Warrior arena soft atmosphere leftover.** Quiet warm arena mist tint/haze while on Warrior map (complements arena board landmark + enter/leave rims; warrior optional / stub; no balance invent). | Stub / no balance invent; mute ok |
| PL177.2 | **City scarce-yard soft atmosphere leftover.** Quiet warm shared-yard mist tint/haze on existing city scarce yard floor while on City (complements station landmarks + Free/Busy pads; contention unchanged). | Contention unchanged; mute ok |

---

# Phase PL178 — Explore canopy / empty meadow landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL178.1 | **Explore canopy soft atmosphere leftover.** Quiet cool canopy mist tint/haze while on Explore (complements woodland/mines section landmarks + wilds palette; spawns unchanged). | Spawns unchanged; mute ok |
| PL178.2 | **Homestead empty meadow soft landmark leftover.** Quiet warm empty-meadow haze/emissive on existing empty homestead outer meadow (complements empty path cue + meadow contrast; layouts unchanged). | Layouts unchanged; mute ok |

---

# Phase PL179 — Hunt-lose / soft-refuse busy rim leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL179.1 | **Hunt-lose soft world reinforce leftover.** Brief soft rim after hunt lose ok (complements Lost · foe ephemeral + hunt-win rim; rates / XP unchanged). | Hunt rates unchanged; mute ok; fail silent |
| PL179.2 | **Soft-refuse busy soft world reinforce leftover.** Brief soft rim when scarce/busy interact soft-refuses (complements Busy ephemeral + busy peer pulse; contention unchanged). | Contention unchanged; mute ok |

---

# Phase PL180 — Mute / visit-leave rim leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL180.1 | **Mute soft world reinforce leftover.** Brief soft rim when mute toggles on/off from settings (complements Muted/Unmuted ephemeral + mute confirm; audio rules unchanged). | Audio rules unchanged; mute ok |
| PL180.2 | **Visit-leave soft world reinforce leftover.** Brief soft rim after leaving a visit back home (complements Home ephemeral + visit mist leftover + home-return tip; visit rules unchanged). Kinship: covered by PL139.1 `VISIT_HOME_RETURN_WORLD_REINFORCE` — do not stack a second rim. | Visit rules unchanged; mute ok; fail silent |

---

# Priority order for the agent

```
PL176.1 → PL176.2
 → PL177.1 → PL177.2
 → PL178.1 → PL178.2
 → PL179.1 → PL179.2
 → PL180.1 → PL180.2
```

Lowest pending ID first. When this queue empties, author **Polish 37** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- **2026-08-02:** Queue emptied after PL180.2 → live plan [FullGameBuildPlan_CityLands_Polish_37.md](FullGameBuildPlan_CityLands_Polish_37.md) (PL181–PL185). PL180.2 marked done via kinship with PL139.1 (test `visit-leave-world-reinforce-pl1802`).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_35.md` | PL171–PL175 (done) |
| `FullGameBuildPlan_CityLands_Polish_37.md` | PL181+ (live) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
